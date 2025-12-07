# Smart Onboarding & Name Editing Design

**Date:** 2025-12-07
**Status:** Approved
**Author:** Claude (with Bill Chirico)

## Overview

Improve the onboarding experience for OAuth users by skipping the name entry step when their name is already available from the OAuth provider. Additionally, allow users to edit their first name and last initial after onboarding via the Settings screen.

## Problem Statement

Currently, users who sign in with Google or Apple still see the name entry step (Step 1) in onboarding, even when their name has already been extracted from OAuth metadata and saved to their profile. This creates unnecessary friction. Additionally, there's no way for users to edit their name after completing onboarding.

## Goals

1. Skip the name entry step in onboarding when OAuth provides complete name data
2. Allow users to edit their name after onboarding
3. Maintain data integrity by only skipping when both first name AND last initial are present

## Non-Goals

- Changing the OAuth name extraction logic (already works well)
- Adding name editing to the Profile screen (keeping it in Settings only)
- Modifying database schema

---

## Design

### 1. Smart Onboarding Flow

**Current behavior:**

- OAuth sign-in saves name to profile (if available from provider)
- User always sees Step 1 (name entry) with fields pre-filled
- User must manually click "Continue" to proceed to Step 2

**New behavior:**

- On mount, onboarding checks if `profile.first_name` AND `profile.last_initial` are both present and valid (non-null, non-placeholder)
- If both exist → automatically start at Step 2 (sobriety date)
- If either is missing → start at Step 1 as today
- If user refreshes while on Step 1 and profile has complete name → auto-advance to Step 2

**Implementation location:** `app/onboarding.tsx`

```typescript
// Compute initial step based on profile completeness
const hasCompleteName =
  profile?.first_name !== null &&
  profile?.last_initial !== null &&
  profile?.first_name !== 'User' &&
  profile?.last_initial !== 'U';

const [step, setStep] = useState(hasCompleteName ? 2 : 1);

// Auto-advance if profile updates with complete name while on Step 1
useEffect(() => {
  if (step === 1 && hasCompleteName) {
    setStep(2);
  }
}, [step, hasCompleteName]);
```

**Edge cases handled:**
| Scenario | first_name | last_initial | Starting Step |
|----------|------------|--------------|---------------|
| Email/password signup | null | null | Step 1 |
| Google with "John Doe" | "John" | "D" | Step 2 |
| Apple with "Madonna" | "Madonna" | "M" | Step 2 |
| OAuth name extraction failed | null | null | Step 1 |
| Legacy placeholder values | "User" | "U" | Step 1 |

### 2. Name Editing in Settings

**New "Account" section at the top of Settings screen:**

```
┌─────────────────────────────────────┐
│  ACCOUNT                            │
│  ┌─────────────────────────────────┐│
│  │ 👤  Name                        ││
│  │     John D.              [Edit] ││
│  └─────────────────────────────────┘│
│                                     │
│  APPEARANCE                         │
│  ...existing theme picker...        │
└─────────────────────────────────────┘
```

**Edit flow:**

1. User taps "Edit" (or the row) to open modal
2. Modal displays:
   - First Name text input (pre-filled with current value)
   - Last Initial text input (pre-filled, max 1 character)
   - Cancel / Save buttons
3. Validation before save:
   - First name is required (non-empty)
   - Last initial is required and exactly 1 character
4. On save:
   - Update Supabase profile
   - Call `refreshProfile()` from AuthContext
   - Close modal with success feedback
5. On error:
   - Show alert with error message
   - Keep modal open for retry

**Implementation location:** `app/settings.tsx`

### 3. Data Flow & Profile State

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Settings   │────▶│   Supabase   │────▶│  AuthContext │
│  (Edit Name) │     │   profiles   │     │ refreshProfile│
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     ▼                            ▼                            ▼
              ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
              │   Settings   │           │   Profile    │           │  Onboarding  │
              │ Account Name │           │    Header    │           │   (Step 2)   │
              └──────────────┘           └──────────────┘           └──────────────┘
```

**Key points:**

- `refreshProfile()` already exposed by AuthContext
- All consuming components automatically update when profile state changes
- No routing changes needed — completeness check guards missing fields, not changes

**Error handling:**

- Network/database errors show alert with error message
- Modal stays open on error for retry
- Loading state on Save button prevents double-submission

---

## Files Changed

| File                                | Changes                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| `app/onboarding.tsx`                | Smart initial step selection + useEffect to auto-advance |
| `app/settings.tsx`                  | New Account section + name edit modal                    |
| `__tests__/app/onboarding.test.tsx` | Tests for skip logic                                     |
| `__tests__/app/settings.test.tsx`   | Tests for name editing                                   |

**Files unchanged:**

- `contexts/AuthContext.tsx` — already has `refreshProfile()` exposed
- `app/_layout.tsx` — routing logic already handles name validation
- `types/database.ts` — no schema changes
- `app/(tabs)/profile.tsx` — displays name but editing lives in Settings

---

## Testing Strategy

### Unit Tests

**Onboarding skip logic** (`__tests__/app/onboarding.test.tsx`):

- [ ] Starts at Step 2 when profile has both `first_name` and `last_initial`
- [ ] Starts at Step 1 when `first_name` is null
- [ ] Starts at Step 1 when `last_initial` is null
- [ ] Starts at Step 1 when name has placeholder values ("User", "U")
- [ ] Auto-advances from Step 1 to Step 2 if profile updates with complete name

**Settings name editing** (`__tests__/app/settings.test.tsx`):

- [ ] Renders Account section with current name displayed
- [ ] Opens edit modal when tapping the name row
- [ ] Pre-fills modal inputs with current name values
- [ ] Validates first name is required
- [ ] Validates last initial is required and exactly 1 character
- [ ] Calls Supabase update with correct data on save
- [ ] Calls refreshProfile after successful update
- [ ] Shows error alert on save failure
- [ ] Closes modal on successful save
- [ ] Keeps modal open on error

### Manual Testing

1. Sign in with Google (full name) → should skip to Step 2
2. Sign in with Apple (single name) → should skip to Step 2
3. Sign up with email → should show Step 1
4. Edit name in Settings → should update everywhere
5. Refresh on Step 1 with complete profile → should advance to Step 2

---

## Security Considerations

- RLS policies already restrict profile updates to the authenticated user
- Client-side validation matches server constraints
- No sensitive data exposed in this feature

---

## Rollout Plan

1. Implement and test locally
2. Deploy to preview environment
3. Test OAuth flows on physical devices (iOS + Android)
4. Deploy to production

---

## Open Questions

None — all questions resolved during design.
