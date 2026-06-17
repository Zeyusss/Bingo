import prisma from '@packages/libs/prisma';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE || "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const renderTemplate = (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "auth-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};


const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderTemplate(templateName, data);

    await transporter.sendMail({
      from: `Bingo Store <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Abandoned cart email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
    throw error;
  }
};


interface AbandonedCartData {
  userId: string;
  userEmail: string;
  userName: string;
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount: number;
  lastUpdated: Date;
}


export const getAbandonedCarts = async (hoursThreshold: number = 24): Promise<AbandonedCartData[]> => {
  try {
    const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    const abandonedCartItems = await prisma.cart_items.findMany({
      where: {
        updatedAt: {
          lt: thresholdDate
        }
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            regular_price: true,
            sale_price: true
          }
        }
      }
    });

    // Group cart items by user for processing

    
    const cartsByUser = new Map<string, any[]>();
    
    for (const item of abandonedCartItems) {
      if (!cartsByUser.has(item.userId)) {
        cartsByUser.set(item.userId, []);
      }
      cartsByUser.get(item.userId)!.push(item);
    }

    const abandonedCarts: AbandonedCartData[] = [];

    
    for (const [userId, items] of cartsByUser) {
      try {
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true
          }
        });

        if (!user || !user.email) continue;

        const cartItems = items.map(item => ({
          id: item.product.id,
          name: item.product.title,
          price: parseFloat((item.product.sale_price || item.product.regular_price).toString()),
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || null
        }));

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const lastUpdated = items.reduce((latest, item) => 
          item.updatedAt > latest ? item.updatedAt : latest, items[0].updatedAt
        );

        abandonedCarts.push({
          userId: user.id,
          userEmail: user.email,
          userName: user.name || 'Valued Customer',
          cartItems,
          totalAmount,
          lastUpdated
        });
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        continue;
      }
    }

    return abandonedCarts;
  } catch (error) {
    console.error('Error getting abandoned carts:', error);
    throw error;
  }
};


export const sendAbandonedCartEmail = async (cartData: AbandonedCartData): Promise<void> => {
  try {
    const cartUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`;
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe`;

    await sendEmail(
      cartData.userEmail,
      "Don't forget your cart! Complete your purchase now 🛒",
      'abandoned-cart',
      {
        userName: cartData.userName,
        cartItems: cartData.cartItems,
        totalAmount: cartData.totalAmount,
        cartUrl,
        unsubscribeUrl
      }
    );

    
    await updateAbandonedCartEmailSent(cartData.userId);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
    throw error;
  }
};


const updateAbandonedCartEmailSent = async (userId: string): Promise<void> => {
  try {
    
    await prisma.abandoned_carts.upsert({
      where: { userId },
      update: {
        emailSentAt: new Date(),
        emailCount: {
          increment: 1
        }
      },
      create: {
        userId,
        emailSentAt: new Date(),
        emailCount: 1
      }
    });
  } catch (error) {
    console.error('Error updating abandoned cart email status:', error);
  }
};



export const processAbandonedCarts = async (): Promise<{ sent: number; errors: number }> => {
  try {
    console.log('Starting abandoned cart processing...');
    
    const abandonedCarts = await getAbandonedCarts(24); 
    console.log(`Found ${abandonedCarts.length} abandoned carts`);

    let sent = 0;
    let errors = 0;

    for (const cart of abandonedCarts) {
      try {
       
        const existingRecord = await prisma.abandoned_carts.findUnique({
          where: { userId: cart.userId }
        });

       
        if (existingRecord?.emailSentAt) {
          const hoursSinceLastEmail = (Date.now() - existingRecord.emailSentAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastEmail < 24) {
            console.log(`Skipping user ${cart.userId} - email sent ${hoursSinceLastEmail.toFixed(1)} hours ago`);
            continue;
          }
        }

        await sendAbandonedCartEmail(cart);
        sent++;
        
    
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing cart for user ${cart.userId}:`, error);
        errors++;
      }
    }

    console.log(`Abandoned cart processing complete. Sent: ${sent}, Errors: ${errors}`);
    return { sent, errors };
  } catch (error) {
    console.error('Error in processAbandonedCarts:', error);
    throw error;
  }
};


export const trackAbandonedCart = async (userId: string, cartItems: any[]) => {
  try {
    if (!userId || !cartItems || cartItems.length === 0) return { success: false };

    await prisma.abandoned_carts.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return { success: true };
  } catch (error) {
    console.error('trackAbandonedCart error:', error);
    return { success: false };
  }
};

export const getAbandonedCartStats = async (hoursThreshold: number = 24) => {
  try {

    const abandonedCarts = await getAbandonedCarts(hoursThreshold);
    
    
    const totalValue = abandonedCarts.reduce((sum, cart) => {
      return sum + (cart.totalAmount || 0);
    }, 0);
    
    
    const emailStats = await prisma.abandoned_carts.aggregate({
      _sum: {
        emailCount: true
    }});

   
    const emailsSent = emailStats._sum.emailCount || 0;
    const totalCarts = abandonedCarts.length;
     
    const cartsWithEmails = await prisma.abandoned_carts.count({
      where: {
        emailCount: {
          gt: 0
        }
      }
    });
    

    const estimatedRecoveredCarts = Math.round(cartsWithEmails * 0.3);
    
    let recoveryRate;
    if (totalCarts === 0) {
      recoveryRate = "N/A"; 
    } else {
      const rate = Math.round((estimatedRecoveredCarts / totalCarts) * 100);
      recoveryRate = `${rate}%`;
    }

    return {
      totalAbandonedCarts: totalCarts,
      totalAbandonedValue: totalValue,
      emailsSent,
      recoveryRate: `${recoveryRate}`
    };
  } catch (error) {
    console.error('Error getting abandoned cart stats:', error);
    throw error;
  }
};
