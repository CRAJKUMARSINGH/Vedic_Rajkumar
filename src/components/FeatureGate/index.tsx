import React, { ReactNode } from 'react';
import { useFeature } from '@/features/flags/useFeature';
import { FeatureFlag } from '@/features/flags/config';
import { UserTier } from '@/features/tier/config';
import { Loader2, Lock } from 'lucide-react';

export interface FeatureGateProps {
  feature: FeatureFlag;
  tier?: UserTier;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  tier = 'anonymous',
  children,
  fallback,
  loadingComponent,
}) => {
  const { enabled, isLoading, reason } = useFeature(feature, tier);

  if (isLoading) {
    return (
      (loadingComponent as React.ReactElement) || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    );
  }

  if (!enabled) {
    return (
      (fallback as React.ReactElement) || (
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted">
          <Lock className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {reason === 'tier' ? 'Upgrade to access this feature' : 'This feature is currently unavailable'}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
