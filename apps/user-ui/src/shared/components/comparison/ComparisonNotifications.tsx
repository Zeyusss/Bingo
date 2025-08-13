'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useComparisonRecovery } from '../../../hooks/useComparisonRecovery';
import AbandonmentRecoveryPrompt from './AbandonmentRecoveryPrompt';

interface ComparisonNotificationsProps {
  className?: string;
}

const ComparisonNotifications: React.FC<ComparisonNotificationsProps> = ({ className = '' }) => {
  const {
    shouldShowPrompt,
    expiringCount,
    expiryWarning,
    hasInitialized,
    handleUserInteraction
  } = useComparisonRecovery();

  if (!hasInitialized) {
    return null;
  }

  return (
    <div className={`comparison-notifications ${className}`}>
      {shouldShowPrompt && (
        <AbandonmentRecoveryPrompt 
          onDismiss={handleUserInteraction}
        />
      )}
      {expiringCount > 0 && (
        <div className={`fixed z-[9999] max-w-xs ${
          shouldShowPrompt ? 'top-16 right-4' : 'top-20 right-4'
        }`}>
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 shadow-xl animate-pulse">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">
                  Comparison Expiring!
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {expiryWarning} - view now to keep them
                </p>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/compare';
                    }
                  }}
                  className="mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 transition-colors"
                >
                  View Comparison
                </button>
              </div>
              <button
                onClick={handleUserInteraction}
                className="text-amber-400 hover:text-amber-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonNotifications;
