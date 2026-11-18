// root element must carry: data-testid="feature-gate" data-feature={flag}
import React, { ReactNode } from 'react';
import { useFeature } from '@/features/flags/useFeature';
import { FeatureFlag } from '@/features/flags/config';
import { UserTier } from '@/features/tier/config';
import { resolveTier } from '@/features/tier/resolveTier';
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
  tier,
  children,
  fallback,
  loadingComponent,
}) => {
  // Fall back to the resolved runtime tier (seeded -> plan -> anonymous) rather
  // than a hard-coded 'anonymous', otherwise every gate would always fire.
  const resolvedTier: UserTier = tier ?? resolveTier();
  const { enabled, isLoading, reason } = useFeature(feature, resolvedTier);

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
        <div
          data-testid="feature-gate"
          data-feature={feature}
          className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted"
        >
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
