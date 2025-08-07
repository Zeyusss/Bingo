import nodemailer from 'nodemailer';
import redis from '@packages/libs/redis';

interface AbandonedCartItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

interface AbandonedCart {
  userId: string;
  userEmail: string;
  userName: string;
  items: AbandonedCartItem[];
  totalAmount: number;
  createdAt: Date;
  lastUpdated: Date;
  emailSent: boolean;
  emailOptOut: boolean;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const createAbandonedCartEmailTemplate = (cart: AbandonedCart) => {
  const itemsList = cart.items.map((item: AbandonedCartItem) => 
    `${item.productName} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  return `
    <h2>Don't Forget Your Cart!</h2>
    <p>Hi ${cart.userName},</p>
    <p>You left some items in your cart. Here's what you were interested in:</p>
    <ul>
      ${itemsList}
    </ul>
    <p>Total: $${cart.totalAmount.toFixed(2)}</p>
    <p><a href="${process.env.NEXT_PUBLIC_SERVER_URL}/cart">Complete Your Purchase</a></p>
    <p>Thanks for shopping with us!</p>
    <p><a href="${process.env.NEXT_PUBLIC_SERVER_URL}/api/abandoned-cart/${cart.userId}/opt-out">Unsubscribe from abandoned cart emails</a></p>
  `;
};

export const sendAbandonedCartEmail = async (cart: AbandonedCart) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: cart.userEmail,
      subject: 'You Left Items in Your Cart!',
      html: createAbandonedCartEmailTemplate(cart)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Abandoned cart email sent to ${cart.userEmail}`);
    
    const cartKey = `abandoned_cart:${cart.userId}`;
    await redis.hset(cartKey, 'emailSent', 'true');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending abandoned cart email:', error);
    return { success: false, error: error.message };
  }
};

export const getPendingEmailCarts = async () => {
  try {
    const keys = await redis.keys('abandoned_cart:*');
    
    const carts: AbandonedCart[] = [];
    
    for (const key of keys) {
      const cartData = await redis.hgetall(key);
      
      if (cartData && Object.keys(cartData).length > 0 && cartData.emailSent !== 'true' && cartData.emailOptOut !== 'true') {
        const cart: AbandonedCart = {
          userId: cartData.userId,
          userEmail: cartData.userEmail,
          userName: cartData.userName,
          items: JSON.parse(cartData.items),
          totalAmount: parseFloat(cartData.totalAmount),
          createdAt: new Date(cartData.createdAt),
          lastUpdated: new Date(cartData.lastUpdated),
          emailSent: cartData.emailSent === 'true',
          emailOptOut: cartData.emailOptOut === 'true'
        };
        
        const hoursSinceUpdate = (Date.now() - cart.lastUpdated.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate >= 1) {
          carts.push(cart);
        }
      }
    }
    
    return carts;
  } catch (error: any) {
    console.error('Error getting pending email carts:', error);
    return [];
  }
};

export const scheduleEmailReminders = async () => {
  try {
    const pendingCarts = await getPendingEmailCarts();
    
    const emailResults = [];
    
    for (const cart of pendingCarts) {
      const result = await sendAbandonedCartEmail(cart);
      emailResults.push({
        userId: cart.userId,
        success: result.success,
        error: result.error
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Sent ${pendingCarts.length} abandoned cart email reminders`);
    return { success: true, sentEmails: pendingCarts.length, results: emailResults };
  } catch (error: any) {
    console.error('Error scheduling email reminders:', error);
    return { success: false, error: error.message };
  }
};
