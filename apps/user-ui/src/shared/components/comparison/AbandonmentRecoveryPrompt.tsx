'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import { useComparisonStore } from '../../../store/comparisonStore';
import { useRouter } from 'next/navigation';

interface AbandonmentRecoveryPromptProps {
  onDismiss?: () => void;
}

const AbandonmentRecoveryPrompt: React.FC<AbandonmentRecoveryPromptProps> = ({ onDismiss }) => {
  const router = useRouter();
  const { 
    products, 
    shouldShowRecoveryPrompt, 
    recoverFromAbandonment, 
    getAbandonedDuration,
    getExpiringItems,
    clearComparison,
    cleanupExpired
  } = useComparisonStore();

  const [isVisible, setIsVisible] = useState(false);

  const [dismissedPermanently, setDismissedPermanently] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {

    setIsClient(true);
    

    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    try {
      const dismissed = localStorage.getItem('comparison-recovery-dismissed');
      if (dismissed) {
        setDismissedPermanently(true);
        return;
      }
    } catch (error) {
      console.error('Failed to check localStorage for dismissed state:', error);
      return; 
    }

    cleanupExpired();

    if (shouldShowRecoveryPrompt() && products.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [products, shouldShowRecoveryPrompt, cleanupExpired]);

  const handleRecover = () => {
    recoverFromAbandonment();
    router.push('/compare');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismissPermanently = () => {

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('comparison-recovery-dismissed', 'true');
      } catch (error) {
        console.error('Failed to save dismissed state to localStorage:', error);
      }
    }
    setDismissedPermanently(true);
    setIsVisible(false);
    onDismiss?.();
  };

  const handleClearAll = () => {
    clearComparison();
    setIsVisible(false);
    onDismiss?.();
  };


  if (!isClient || dismissedPermanently || !isVisible || products.length === 0) {
    return null;
  }

  const abandonedHours = getAbandonedDuration();
  const expiringItems = getExpiringItems();
  const hasExpiring = expiringItems.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Continue Comparing?
              </h3>
              <p className="text-xs text-gray-500">
                {abandonedHours === 1 ? '1 hour ago' : `${abandonedHours} hours ago`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            You have <span className="font-medium text-gray-900">{products.length} item{products.length > 1 ? 's' : ''}</span> in your comparison.
          </p>
          
          {hasExpiring && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-2">
              <p className="text-xs text-amber-800">
              {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring soon
              </p>
            </div>
          )}
          <div className="flex -space-x-2 mb-3">
            {products.slice(0, 3).map((product, index) => (
              <div
                key={product.id}
                className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex-shrink-0 overflow-hidden"
                style={{ zIndex: 10 - index }}
              >
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ShoppingCart size={12} className="text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {products.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                +{products.length - 3}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleRecover}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye size={14} />
            <span>Continue Comparing</span>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={handleClearAll}
              className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 size={12} />
              <span>Clear All</span>
            </button>
            
            <button
              onClick={handleDismissPermanently}
              className="flex-1 text-gray-500 py-1.5 px-3 rounded-md text-xs hover:text-gray-700 transition-colors"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbandonmentRecoveryPrompt;
