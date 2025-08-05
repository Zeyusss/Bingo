'use client';

import { useEffect, useState } from 'react';
import { useComparisonStore } from '../store/comparisonStore';

interface ComparisonRecoveryState {
  shouldShowPrompt: boolean;
  abandonedHours: number;
  expiringCount: number;
  totalItems: number;
  stats: {
    totalItems: number;
    oldestItem: number;
    newestItem: number;
    averageAge: number;
    hasExpiring: boolean;
  };
}


export const useComparisonRecovery = () => {
  const {
    products,
    shouldShowRecoveryPrompt,
    getAbandonedDuration,
    getExpiringItems,
    getComparisonStats,
    cleanupExpired,
    markAsViewed,
    recoverFromAbandonment
  } = useComparisonStore();

  const [recoveryState, setRecoveryState] = useState<ComparisonRecoveryState>({
    shouldShowPrompt: false,
    abandonedHours: 0,
    expiringCount: 0,
    totalItems: 0,
    stats: {
      totalItems: 0,
      oldestItem: 0,
      newestItem: 0,
      averageAge: 0,
      hasExpiring: false
    }
  });

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeRecovery = () => {
      cleanupExpired();

      const stats = getComparisonStats();
      const abandonedHours = getAbandonedDuration();
      const expiringItems = getExpiringItems();
      const shouldShow = shouldShowRecoveryPrompt();

      setRecoveryState({
        shouldShowPrompt: shouldShow,
        abandonedHours,
        expiringCount: expiringItems.length,
        totalItems: products.length,
        stats
      });

      setHasInitialized(true);

      // analytics can be tracked here in production
      // if (shouldShow && products.length > 0) {
      //   analytics.track('comparison_abandonment_detected', {
      //     items: products.length,
      //     abandonedHours,
      //     expiringCount: expiringItems.length
      //   });
      // }
    };

    const timer = setTimeout(initializeRecovery, 100);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (!hasInitialized) return;

    const interval = setInterval(() => {
      cleanupExpired();


      const stats = getComparisonStats();
      const abandonedHours = getAbandonedDuration();
      const expiringItems = getExpiringItems();
      const shouldShow = shouldShowRecoveryPrompt();

      setRecoveryState(prev => ({
        ...prev,
        shouldShowPrompt: shouldShow,
        abandonedHours,
        expiringCount: expiringItems.length,
        totalItems: products.length,
        stats
      }));
    }, 60000); 

    return () => clearInterval(interval);
  }, [hasInitialized]);

  const handleUserInteraction = () => {
    markAsViewed();
    setRecoveryState(prev => ({
      ...prev,
      shouldShowPrompt: false,
      abandonedHours: 0
    }));
  };


  const handleRecovery = () => {
    recoverFromAbandonment();
    setRecoveryState(prev => ({
      ...prev,
      shouldShowPrompt: false,
      abandonedHours: 0
    }));
  };


  const getTimeDescription = (hours: number): string => {
    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    
    
    if (days >= 7) {
      const oldestProduct = products.reduce((oldest, product) => 
        product.lastViewed < oldest.lastViewed ? product : oldest
      );
      const date = new Date(oldestProduct.lastViewed);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }
    
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  };


  const getExpiryWarning = (): string | null => {
    if (recoveryState.expiringCount === 0) return null;
    
    if (recoveryState.expiringCount === 1) {
      return '1 item expires soon';
    }
    return `${recoveryState.expiringCount} items expire soon`;
  };

  return {
    ...recoveryState,
    hasInitialized,
    
    timeDescription: getTimeDescription(recoveryState.abandonedHours),
    expiryWarning: getExpiryWarning(),
    hasAbandonedItems: recoveryState.totalItems > 0 && recoveryState.abandonedHours > 0,
    
    handleUserInteraction,
    handleRecovery,
    
    formatAge: (milliseconds: number) => {
      const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
      if (days === 0) return 'Today';
      if (days === 1) return '1 day old';
      return `${days} days old`;
    }
  };
};
