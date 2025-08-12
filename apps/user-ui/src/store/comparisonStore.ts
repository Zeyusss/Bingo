import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComparisonProduct {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  regular_price: number;
  images: { url: string }[];
  Shop: {
    id: string;
    name: string;
    avatar?: { url: string };
  };
  ratings: number;
  stock: number;
  category: string;
  tags: string[];
  specifications?: Record<string, any>;
  customProperties?: Record<string, any>;
  addedAt: number; 
  lastViewed: number; 
  source?: 'search' | 'product_page' | 'category' | 'recommendation';
  personalizationEnabled?: boolean;
  personalizationRequired?: boolean;
  personalizationInstructions?: string;
}

interface ComparisonStore {
  products: ComparisonProduct[];
  addProduct: (product: ComparisonProduct, source?: string) => void;
  removeProduct: (productId: string) => void;
  clearComparison: () => void;
  isProductInComparison: (productId: string) => boolean;
  canAddMore: () => boolean;
  cleanupExpired: () => number;
  getExpiringItems: (daysLeft?: number) => ComparisonProduct[];
  markAsViewed: () => void;
  getAbandonedDuration: () => number; 
  shouldShowRecoveryPrompt: () => boolean;
  getComparisonStats: () => {
    totalItems: number;
    oldestItem: number;
    newestItem: number;
    averageAge: number;
    hasExpiring: boolean;
  };
  recoverFromAbandonment: () => void;
}


const COMPARISON_CONFIG = {
  MAX_ITEMS: 4,
  EXPIRY_DAYS: 30, 
  WARNING_DAYS: 7, 
  ABANDONMENT_HOURS: 24, 
  RECOVERY_PROMPT_HOURS: 2,
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000,
};

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product: ComparisonProduct, source = 'unknown') => {
        const { products } = get();
        
        if (products.some((p: ComparisonProduct) => p.id === product.id)) {
          return;
        }
        
        if (products.length >= COMPARISON_CONFIG.MAX_ITEMS) {
          return;
        }
        
        const now = Date.now();
        const enhancedProduct: ComparisonProduct = {
          ...product,
          addedAt: now,
          lastViewed: now,
          source: source as any
        };
        
        set({ products: [...products, enhancedProduct] });
      },
      
      removeProduct: (productId: string) => {
        set((state: { products: ComparisonProduct[] }) => ({
          products: state.products.filter((p: ComparisonProduct) => p.id !== productId)
        }));
      },
      
      clearComparison: () => {
        set({ products: [] });
      },
      
      isProductInComparison: (productId: string) => {
        return get().products.some((p: ComparisonProduct) => p.id === productId);
      },
      
      canAddMore: () => {
        return get().products.length < COMPARISON_CONFIG.MAX_ITEMS;
      },

      cleanupExpired: () => {
        const { products } = get();
        const now = Date.now();
        const expiryTime = COMPARISON_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        const validProducts = products.filter((product: ComparisonProduct) => {
          return (now - product.addedAt) < expiryTime;
        });
        
        const removedCount = products.length - validProducts.length;
        if (removedCount > 0) {
          set({ products: validProducts });
        }
        
        return removedCount;
      },

      getExpiringItems: (daysLeft = COMPARISON_CONFIG.WARNING_DAYS) => {
        const { products } = get();
        const now = Date.now();
        const expiryTime = COMPARISON_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const warningTime = daysLeft * 24 * 60 * 60 * 1000;
        
        return products.filter((product: ComparisonProduct) => {
          const age = now - product.addedAt;
          return age > (expiryTime - warningTime) && age < expiryTime;
        });
      },

      markAsViewed: () => {
        const { products } = get();
        const now = Date.now();
        
        const updatedProducts = products.map((product: ComparisonProduct) => ({
          ...product,
          lastViewed: now
        }));
        
        set({ products: updatedProducts });
      },

      getAbandonedDuration: () => {
        const { products } = get();
        if (products.length === 0) return 0;
        
        const now = Date.now();
        const mostRecentView = Math.max(...products.map((p: ComparisonProduct) => p.lastViewed));
        
        return Math.floor((now - mostRecentView) / (60 * 60 * 1000)); 
      },

      shouldShowRecoveryPrompt: () => {
        const { products } = get();
        if (products.length === 0) return false;
        
        const abandonedHours = get().getAbandonedDuration();
        return abandonedHours >= COMPARISON_CONFIG.RECOVERY_PROMPT_HOURS && 
               abandonedHours <= COMPARISON_CONFIG.ABANDONMENT_HOURS;
      },

      getComparisonStats: () => {
        const { products } = get();
        if (products.length === 0) {
          return {
            totalItems: 0,
            oldestItem: 0,
            newestItem: 0,
            averageAge: 0,
            hasExpiring: false
          };
        }
        
        const now = Date.now();
        const ages = products.map((p: ComparisonProduct) => now - p.addedAt);
        const expiringItems = get().getExpiringItems();
        
        return {
          totalItems: products.length,
          oldestItem: Math.max(...ages),
          newestItem: Math.min(...ages),
          averageAge: ages.reduce((sum: number, age: number) => sum + age, 0) / ages.length,
          hasExpiring: expiringItems.length > 0
        };
      },

      recoverFromAbandonment: () => {
        get().markAsViewed();
        
        // analytics event can be triggered here in production
        // analytics.track('comparison_recovered', { items: products.length });
      }
    }),
    {
      name: 'comparison-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
        
          const state = persistedState as { products: any[] };
          const now = Date.now();
          
          return {
            products: state.products.map(product => ({
              ...product,
              addedAt: product.addedAt || now,
              lastViewed: product.lastViewed || now,
              source: product.source || 'unknown'
            }))
          };
        }
        
        return persistedState;
      },
      merge: (persistedState: any, currentState: any) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
);
