# Feature Flags Setup

Week 3 of the enterprise launch roadmap introduces dynamic feature flags via
[Flagsmith](https://flagsmith.com) with a static tier-based fallback.

---

## Architecture

```
User request
    │
    ▼
Tier check (TIER_FEATURES config)   ← static, no network
    │ pass
    ▼
Flag check (Flagsmith remote)       ← dynamic, can be toggled live
    │ pass
    ▼
Render feature
```

The tier gate is always evaluated first. Even if Flagsmith enables a flag,
the user still needs the right tier. This prevents billing bypasses via
flag misconfiguration.

If `VITE_FLAGSMITH_ENV_ID` is not set, the provider runs in **static mode**
using built-in defaults — core features on, premium/experimental features off.

---

## 1. Create a Flagsmith Account

1. Go to [flagsmith.com](https://flagsmith.com) and sign up (free tier available).
2. Create a new project: `Vedic Rajkumar`.
3. Create two environments: `Development` and `Production`.
4. Copy the **Client-side Environment Key** for each environment.

---

## 2. Configure Environment Variables

```bash
# .env.local (development)
VITE_FLAGSMITH_ENV_ID=ser.xxxxxxxxxxxxxxxxxxxxxxxxxx

# Set in Netlify dashboard for production
# Settings → Environment variables → VITE_FLAGSMITH_ENV_ID
```

---

## 3. Create Feature Flags in Dashboard

Create these flags in the Flagsmith dashboard. Default values shown:

| Flag Name              | Dev Default | Prod Default | Tier Required  | Notes                        |
|------------------------|-------------|--------------|----------------|------------------------------|
| `kundli`               | ✅ on        | ✅ on         | anonymous      | Core — never turn off        |
| `prashna`              | ✅ on        | ✅ on         | anonymous      | Core                         |
| `matchmaking`          | ✅ on        | ✅ on         | anonymous      | Core                         |
| `panchang`             | ✅ on        | ✅ on         | anonymous      | Core                         |
| `family_profiles`      | ✅ on        | ✅ on         | registered     |                              |
| `pdf_export`           | ✅ on        | ✅ on         | registered     |                              |
| `chart_history`        | ✅ on        | ✅ on         | registered     |                              |
| `export_data`          | ✅ on        | ✅ on         | registered     | GDPR Article 20              |
| `dasha_timeline`       | ✅ on        | ❌ off        | premium        | Enable when ready to launch  |
| `transit_alerts`       | ✅ on        | ❌ off        | premium        | Requires push notification   |
| `advanced_pdf`         | ✅ on        | ❌ off        | premium        |                              |
| `unlimited_pdf`        | ✅ on        | ❌ off        | premium        |                              |
| `client_crm`           | ✅ on        | ❌ off        | practitioner   | Week 9 feature               |
| `consultation_notes`   | ✅ on        | ❌ off        | practitioner   | Week 9 feature               |
| `white_label`          | ✅ on        | ❌ off        | practitioner   | Week 9 feature               |
| `kp_system`            | ❌ off       | ❌ off        | practitioner   | Experimental — KP astrology  |
| `ashtakavarga_v2`      | ❌ off       | ❌ off        | practitioner   | Experimental                 |
| `new_ui`               | ❌ off       | ❌ off        | any            | A/B test flag                |

---

## 4. Wire FlagsmithProvider into the App

Add the provider to `src/Providers.tsx` (or your root providers file):

```tsx
import { FlagsmithProvider } from '@/features/flags/provider';

export const Providers = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <FlagsmithProvider>
      {/* ...other providers */}
      {children}
    </FlagsmithProvider>
  </QueryClientProvider>
);
```

---

## 5. Gate Features in Components

### Declarative (recommended for large UI sections)

```tsx
import { FeatureGate } from '@/components/FeatureGate';
import { FEATURE_FLAGS } from '@/features/flags';

// Renders children only when flag is on AND user has premium tier
<FeatureGate feature={FEATURE_FLAGS.DASHA_TIMELINE} tier={userTier}>
  <DashaTimeline />
</FeatureGate>

// Custom fallback
<FeatureGate
  feature={FEATURE_FLAGS.WHITE_LABEL}
  tier={userTier}
  fallback={<UpgradeBanner requiredTier="practitioner" />}
>
  <WhiteLabelSettings />
</FeatureGate>
```

### Hook (recommended for conditional logic)

```tsx
import { useFeature, FEATURE_FLAGS } from '@/features/flags';

function MyComponent({ userTier }) {
  const { enabled, isLoading, reason } = useFeature(
    FEATURE_FLAGS.TRANSIT_ALERTS,
    userTier
  );

  if (isLoading) return <Spinner />;
  if (!enabled && reason === 'tier') return <UpgradePrompt />;
  if (!enabled) return null;

  return <TransitAlertSettings />;
}
```

### Usage limit check

```tsx
import { useCanAccess, FEATURE_FLAGS } from '@/features/flags';

function AddProfileButton({ userTier, profileCount }) {
  const canAdd = useCanAccess(
    FEATURE_FLAGS.FAMILY_PROFILES,
    userTier,
    profileCount,
    'maxProfiles'
  );

  return (
    <Button disabled={!canAdd}>
      {canAdd ? 'Add Profile' : 'Limit reached — upgrade to add more'}
    </Button>
  );
}
```

---

## 6. A/B Testing

```tsx
import { useExperiment } from '@/features/ab/useExperiment';

function LandingPage() {
  const { variant, value: HeroComponent, track } = useExperiment(
    'landing-hero-v2',
    {
      control:   <HeroOriginal />,
      treatment: <HeroRedesigned />,
    }
  );

  return (
    <div onClick={() => track('hero_clicked', { variant })}>
      {HeroComponent}
    </div>
  );
}
```

Create a `landing-hero-v2` flag in Flagsmith with remote config value
set to `"treatment"` for 50% of users to enable the experiment.

---

## Tier Summary

| Tier           | Profiles | Charts/day | PDF exports | Advanced | White-label | Support   |
|----------------|----------|------------|-------------|----------|-------------|-----------|
| anonymous      | 0        | 5          | 0           | ❌        | ❌           | None      |
| registered     | 5        | 20         | 10          | ❌        | ❌           | Email     |
| premium        | 20       | 100        | Unlimited   | ✅        | ❌           | Priority  |
| practitioner   | Unlimited| Unlimited  | Unlimited   | ✅        | ✅           | Dedicated |
