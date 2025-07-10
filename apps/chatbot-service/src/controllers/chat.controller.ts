import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
});

// ✅ Greeting checker
const isGreeting = (msg: string): boolean => {
  const greetings = [
    'hi', 'hello', 'hey', 'good morning', 'good evening', 'how are you',
    'مرحبا', 'اهلا', 'صباح الخير', 'مساء الخير'
  ];
  const trimmed = msg.trim().toLowerCase();
  return greetings.includes(trimmed);
};

// ✅ FAQ logic
const handleFAQ = (msg: string): string | null => {
  const lower = msg.toLowerCase();

  if (lower.includes('return') || lower.includes('refund') || lower.includes('ارجاع')) {
    return '🧺 We accept returns within 30 days. Just keep your receipt and the handmade item in original condition.';
  }

  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('توصيل')) {
    return '🚚 Orders over $50 get free shipping! Delivery takes 3–7 days.';
  }

  if (lower.includes('payment') || lower.includes('pay') || lower.includes('دفع')) {
    return '💳 We accept all major cards, PayPal, and handmade good vibes ✨.';
  }

  if (lower.includes('support') || lower.includes('contact') || lower.includes('دعم') || lower.includes('تواصل')) {
    return '📞 Reach us at support@bingo.com or call +123456789.';
  }

  if (lower.includes('hours') || lower.includes('open') || lower.includes('متى') || lower.includes('ساعات العمل')) {
    return '🕙 Our craft shop is open 24/7!';
  }

  if (
    lower.includes('offer') || lower.includes('what do you offer') ||
    lower.includes('products') || lower.includes('ماذا تقدم') ||
    lower.includes('العروض') || lower.includes('ما هي المنتجات')
  ) {
    return `🎨 We offer handmade items like:

🧵 Jewelry
🪵 Wooden Crafts
🧶 Crochet
🖌️ Art & Paintings
🎁 Gift Boxes
🕯️ Candles & Decor`;
  }

  return null;
};

// ✅ Keywords mapped to categories
const categoryKeywordsMap: Record<string, string> = {
  candles: 'candles',
  candle: 'candles',
  pottery: 'ceramics',
  ceramic: 'ceramics',
  leather: 'leather',
  glass: 'glass',
  crochet: 'knitting',
  knitting: 'knitting',
  wood: 'furniture',
  wooden: 'furniture',
  vintage: 'vintage',
  perfume: 'beauty',
  beauty: 'beauty',
  art: 'art',
  painting: 'art',
  calligraphy: 'calligraphy',
  metal: 'metalwork',
  ring: 'jewelry',
  necklace: 'jewelry',
  jewelry: 'jewelry',
  جلد: 'leather',
  شموع: 'candles',
  فخار: 'ceramics',
  فن: 'art',
  خط: 'calligraphy',
  معدن: 'metalwork'
};

const detectCategoryFromMessage = (msg: string): string | null => {
  const words = msg.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (categoryKeywordsMap[word]) {
      return categoryKeywordsMap[word];
    }
  }
  return null;
};

// ✅ Detect if user wants product details
const isExplainRequest = (msg: string): boolean => {
  const patterns = [
    'explain', 'tell me more', 'details', 'what is', 'can you describe',
    'ما هو', 'اشرح', 'تفاصيل', 'عرف', 'ما تفاصيل'
  ];
  return patterns.some(p => msg.toLowerCase().includes(p));
};

// ✅ General product search
const findProduct = async (query: string) => {
  return await prisma.products.findFirst({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { short_description: { contains: query, mode: 'insensitive' } },
        { detailed_description: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { subCategory: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ],
      isDeleted: false
    },
    include: {
      Shop: true
    }
  });
};

// ✅ Exact product match for explanation
const findExactProduct = async (query: string) => {
  return await prisma.products.findFirst({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query.toLowerCase(), mode: 'insensitive' } }
      ],
      isDeleted: false
    },
    include: {
      Shop: true
    }
  });
};

// ✅ Main handler
export const handleChat = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: '❌ Please enter a valid message.' });
  }

  const msg = message.toLowerCase().trim();

  if (isGreeting(msg)) {
    return res.json({ reply: '👋 Hello! Looking for a handcrafted treasure today?' });
  }

  const faq = handleFAQ(msg);
  if (faq) return res.json({ reply: faq });

  try {
    // Check if it's an explain intent
    if (isExplainRequest(msg)) {
      const product = await findExactProduct(msg);
      if (product) {
        return res.json({
          reply: `📝 Here are the details for *${product.title}*:

📄 ${product.detailed_description}

💰 Price: $${product.regular_price}
🏪 Artisan: ${product.Shop?.name ?? 'Unknown'}
📂 Category: ${product.category}

Let me know if you want to add it to your cart or see related items. 🛍️`
        });
      }
    }

    // Try category-based match
    const detectedCategory = detectCategoryFromMessage(msg);

    const product = detectedCategory
      ? await prisma.products.findFirst({
          where: {
            isDeleted: false,
            Shop: {
              category: {
                has: detectedCategory
              }
            }
          },
          include: {
            Shop: true
          }
        })
      : await findProduct(msg);

    if (product) {
      return res.json({
        reply: `🎁 We found something special:

🧵 *${product.title}*
📜 ${product.short_description}
💰 $${product.regular_price}
🏪 Artisan: ${product.Shop?.name ?? 'Unknown'}
📂 Category: ${product.category}

Would you like to add it to your cart? 🛒`
      });
    }

    const keywords = ['buy', 'price', 'have', 'bag', 'ring', 'jewelry', 'wood', 'pottery', 'handmade', 'خاتم', 'شنطة'];
    const isLikely = keywords.some(k => msg.includes(k));
    if (isLikely) {
      return res.json({ reply: '🔎 Hmm... couldn’t find that item. Try another keyword or browse our collection.' });
    }

    // Fallback to AI assistant
    const ai = await openai.chat.completions.create({
      model: 'mistralai/mixtral-8x7b-instruct',
      messages: [
        {
          role: 'system',
          content: "You're a helpful assistant for an e-commerce store called 'Bingo'. Only answer questions related to e-commerce products, orders, delivery, support, or policies. If the user asks something unrelated, kindly decline."
        },
        { role: 'user', content: message }
      ]
    });

    const fallback = ai.choices[0]?.message?.content || "🤖 I’m not sure how to help with that.";
    return res.json({ reply: fallback });

  } catch (err) {
    console.error('❌ Chatbot error:', err);
    return res.status(500).json({ reply: '⚠️ Something went wrong. Please try again later.' });
  }
};
