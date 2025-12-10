# Display Name & Condensed Onboarding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `first_name` + `last_initial` with single `display_name` field and condense onboarding to one page.

**Architecture:** Add new `display_name` column to profiles table, migrate existing data, update all app code to use the new field, remove step-based onboarding logic in favor of a single-page flow with two cards.

**Tech Stack:** React Native, Expo Router, Supabase, TypeScript, Jest

---

## Task 1: Add Display Name Validation Utility

**Files:**

- Modify: `lib/validation.ts`
- Create: `__tests__/lib/validation.test.ts`

**Step 1: Write failing tests for validateDisplayName**

```typescript
// __tests__/lib/validation.test.ts
import { isValidEmail, validateDisplayName } from '@/lib/validation';

describe('isValidEmail', () => {
  it('returns true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('returns false for invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
  });
});

describe('validateDisplayName', () => {
  describe('valid names', () => {
    it('accepts standard names', () => {
      expect(validateDisplayName('John D.')).toBeNull();
      expect(validateDisplayName('Mary Jane')).toBeNull();
      expect(validateDisplayName('Anne-Marie')).toBeNull();
    });

    it('accepts names with international characters', () => {
      expect(validateDisplayName('José')).toBeNull();
      expect(validateDisplayName('Müller')).toBeNull();
      expect(validateDisplayName('中文名字')).toBeNull();
    });

    it('accepts minimum length (2 chars)', () => {
      expect(validateDisplayName('Jo')).toBeNull();
    });

    it('accepts maximum length (30 chars)', () => {
      expect(validateDisplayName('A'.repeat(30))).toBeNull();
    });
  });

  describe('invalid names', () => {
    it('rejects empty string', () => {
      expect(validateDisplayName('')).toBe('Display name is required');
    });

    it('rejects whitespace-only', () => {
      expect(validateDisplayName('   ')).toBe('Display name is required');
    });

    it('rejects too short (1 char)', () => {
      expect(validateDisplayName('J')).toBe('Display name must be at least 2 characters');
    });

    it('rejects too long (31+ chars)', () => {
      expect(validateDisplayName('A'.repeat(31))).toBe(
        'Display name must be 30 characters or less'
      );
    });

    it('rejects numbers', () => {
      expect(validateDisplayName('John123')).toBe(
        'Display name can only contain letters, spaces, periods, and hyphens'
      );
    });

    it('rejects special characters', () => {
      expect(validateDisplayName('John@Doe')).toBe(
        'Display name can only contain letters, spaces, periods, and hyphens'
      );
    });

    it('rejects emojis', () => {
      expect(validateDisplayName('John 😀')).toBe(
        'Display name can only contain letters, spaces, periods, and hyphens'
      );
    });
  });

  describe('edge cases', () => {
    it('trims whitespace before validation', () => {
      expect(validateDisplayName('  John D.  ')).toBeNull();
    });

    it('counts trimmed length', () => {
      expect(validateDisplayName('  J  ')).toBe('Display name must be at least 2 characters');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/lib/validation.test.ts`

Expected: FAIL with "validateDisplayName is not exported"

**Step 3: Implement validateDisplayName**

````typescript
// lib/validation.ts
/**
 * Validation utility functions
 */

/**
 * Regex pattern for valid display names.
 * Allows: letters (any language via \p{L}), spaces, periods, hyphens
 * Length: 2-30 characters (enforced separately for better error messages)
 */
const DISPLAY_NAME_REGEX = /^[\p{L}\s.\-]+$/u;

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Basic email regex - validates format like user@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a display name for user profiles.
 *
 * Rules:
 * - Required (non-empty after trimming)
 * - 2-30 characters
 * - Only letters (any language), spaces, periods, and hyphens
 *
 * @param name - The display name to validate
 * @returns Error message string if invalid, null if valid
 *
 * @example
 * ```ts
 * validateDisplayName('John D.'); // null (valid)
 * validateDisplayName('J'); // 'Display name must be at least 2 characters'
 * validateDisplayName('John@123'); // 'Display name can only contain...'
 * ```
 */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Display name is required';
  }

  if (trimmed.length < 2) {
    return 'Display name must be at least 2 characters';
  }

  if (trimmed.length > 30) {
    return 'Display name must be 30 characters or less';
  }

  if (!DISPLAY_NAME_REGEX.test(trimmed)) {
    return 'Display name can only contain letters, spaces, periods, and hyphens';
  }

  return null;
}
````

**Step 4: Run test to verify it passes**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/lib/validation.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add lib/validation.ts __tests__/lib/validation.test.ts
git commit -m "feat(validation): add validateDisplayName utility

Add validation function for display names with:
- 2-30 character length requirement
- Unicode letter support (international names)
- Spaces, periods, hyphens allowed
- Comprehensive test coverage"
```

---

## Task 2: Update Database Types

**Files:**

- Modify: `types/database.ts`

**Step 1: Update Profile interface**

```typescript
// types/database.ts - Update the Profile interface
// Replace lines 25-31 (first_name and last_initial) with display_name

/**
 * User profile information.
 *
 * @remarks
 * Users can be both sponsors (helping others) and sponsees (being helped)
 * simultaneously through different relationships. There is no role field -
 * the role is determined by the relationship context.
 */
export interface Profile {
  id: string;
  email: string;
  /**
   * User's display name shown throughout the app.
   * Free-form text (2-30 chars) that users can customize.
   * Null until collected during onboarding.
   */
  display_name: string | null;
  phone?: string;
  avatar_url?: string;
  // ... rest of interface unchanged
```

**Step 2: Verify types compile**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm typecheck`

Expected: Type errors in files still using `first_name`/`last_initial` (this is expected, we'll fix them in subsequent tasks)

**Step 3: Commit type change**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add types/database.ts
git commit -m "refactor(types): replace first_name/last_initial with display_name

BREAKING: Profile interface now uses single display_name field
instead of first_name + last_initial.

Subsequent commits will update all usages."
```

---

## Task 3: Update Auth Layout Guard

**Files:**

- Modify: `app/_layout.tsx:102-112`
- Modify: `__tests__/app/layout.test.tsx`

**Step 1: Update the profile completeness check**

```typescript
// app/_layout.tsx - Replace lines 101-112 with:

// Profile is complete when user has provided their display name and sobriety date during onboarding.
// Check for non-null values (null indicates user hasn't completed onboarding).
const hasDisplayName = profile !== null && profile.display_name !== null;
const hasSobrietyDate = !!profile?.sobriety_date;
const isProfileComplete = hasDisplayName && hasSobrietyDate;
```

**Step 2: Update test mocks**

Update all mock profiles in `__tests__/app/layout.test.tsx` to use `display_name` instead of `first_name`/`last_initial`.

Search for patterns like:

- `first_name: 'Test'` → `display_name: 'Test U.'`
- `last_initial: 'U'` → (remove)
- `first_name: null` → `display_name: null`

**Step 3: Run layout tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/app/layout.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add app/_layout.tsx __tests__/app/layout.test.tsx
git commit -m "refactor(auth): update profile completeness check for display_name

Auth guard now checks for display_name instead of first_name + last_initial
to determine if user has completed onboarding."
```

---

## Task 4: Update AuthContext Mock Profiles

**Files:**

- Modify: `__tests__/contexts/AuthContext.test.tsx`

**Step 1: Update all mock profiles**

Search and replace in the test file:

- All instances of `first_name: ...` → `display_name: ...`
- Remove all `last_initial: ...` lines
- Format display names as "FirstName L." pattern where appropriate

**Step 2: Run AuthContext tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/contexts/AuthContext.test.tsx`

Expected: PASS

**Step 3: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add __tests__/contexts/AuthContext.test.tsx
git commit -m "test(auth): update mock profiles to use display_name"
```

---

## Task 5: Update Analytics Utils PII Fields

**Files:**

- Modify: `lib/analytics-utils.ts:19-31`
- Modify: `__tests__/lib/analytics-utils.test.ts`

**Step 1: Update PII_FIELDS array**

```typescript
// lib/analytics-utils.ts - Replace PII_FIELDS
const PII_FIELDS = [
  'email',
  'name',
  'display_name', // Changed from first_name/last_name
  'phone',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'sobriety_date',
  'relapse_date',
] as const;
```

**Step 2: Update tests if any reference first_name/last_name**

Check `__tests__/lib/analytics-utils.test.ts` for any tests that use `first_name` or `last_name` in test data, update to `display_name`.

**Step 3: Run analytics tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/lib/analytics-utils.test.ts`

Expected: PASS

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add lib/analytics-utils.ts __tests__/lib/analytics-utils.test.ts
git commit -m "refactor(analytics): update PII fields for display_name"
```

---

## Task 6: Update AppleSignInButton OAuth Handling

**Files:**

- Modify: `components/auth/AppleSignInButton.tsx:87-148`
- Modify: `__tests__/components/auth/AppleSignInButton.test.tsx`

**Step 1: Update name extraction to build display_name**

```typescript
// components/auth/AppleSignInButton.tsx - Replace lines 87-148 with:

// Apple only provides the user's full name on the FIRST sign-in.
// Subsequent sign-ins return null for fullName. We must capture and
// persist this data immediately.
if (credential.fullName?.givenName || credential.fullName?.familyName) {
  const firstName = credential.fullName.givenName ?? '';
  const familyName = credential.fullName.familyName ?? '';

  // Build display name in "FirstName L." format
  const lastInitial = familyName?.[0]?.toUpperCase() ?? '';
  const displayName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;

  const fullName = [firstName, familyName].filter(Boolean).join(' ');

  // Update user_metadata for future reference (e.g., if profile is recreated)
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      given_name: firstName || null,
      family_name: familyName || null,
    },
  });

  if (updateError) {
    logger.warn('Failed to update Apple user metadata with name', {
      category: LogCategory.AUTH,
      error: updateError.message,
    });
  }

  // Also update the profile directly since it was likely created without name data
  // due to the race condition with onAuthStateChange
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    logger.warn('Cannot update profile: user ID not available after sign-in', {
      category: LogCategory.AUTH,
    });
  } else if (displayName) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', userId);

    if (profileError) {
      logger.warn('Failed to update profile with Apple name data', {
        category: LogCategory.AUTH,
        error: profileError.message,
      });
    } else {
      logger.info('Profile updated with Apple name data', {
        category: LogCategory.AUTH,
        displayName,
      });
    }
  }
}
```

**Step 2: Update tests**

Update `__tests__/components/auth/AppleSignInButton.test.tsx`:

- Change expected Supabase update calls from `first_name`/`last_initial` to `display_name`
- Update assertions to check for `display_name` field

**Step 3: Run tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/components/auth/AppleSignInButton.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add components/auth/AppleSignInButton.tsx __tests__/components/auth/AppleSignInButton.test.tsx
git commit -m "refactor(auth): update Apple Sign In to use display_name

Build display_name in 'FirstName L.' format from OAuth credentials
instead of storing first_name and last_initial separately."
```

---

## Task 7: Update Profile Screen Display

**Files:**

- Modify: `app/(tabs)/profile.tsx`
- Modify: `__tests__/app/profile.test.tsx`

**Step 1: Update name display patterns**

Search and replace in `app/(tabs)/profile.tsx`:

- `{relationship.sponsee?.first_name} {relationship.sponsee?.last_initial}.` → `{relationship.sponsee?.display_name}`
- `{relationship.sponsor?.first_name} {relationship.sponsor?.last_initial}.` → `{relationship.sponsor?.display_name}`
- `(relationship.sponsee?.first_name || '?')[0]` → `(relationship.sponsee?.display_name || '?')[0]`
- Similar patterns for sponsor display

**Step 2: Update avatar initial logic**

```typescript
// Update avatar text to use first character of display_name
<Text style={createStyles(theme).avatarText}>
  {(relationship.sponsee?.display_name || '?')[0].toUpperCase()}
</Text>
```

**Step 3: Update tests**

Update mock profiles in `__tests__/app/profile.test.tsx` to use `display_name`.

**Step 4: Run tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/app/profile.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add app/\(tabs\)/profile.tsx __tests__/app/profile.test.tsx
git commit -m "refactor(profile): update to display_name

Replace first_name/last_initial template strings with display_name
for sponsor and sponsee name display."
```

---

## Task 8: Update Tasks Screen Display

**Files:**

- Modify: `app/(tabs)/tasks.tsx`
- Modify: `__tests__/app/tasks.test.tsx`

**Step 1: Update name display patterns**

Search and replace similar to Task 7 - find all instances of `first_name`/`last_initial` usage.

**Step 2: Update tests**

Update mock profiles in tests.

**Step 3: Run tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/app/tasks.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add app/\(tabs\)/tasks.tsx __tests__/app/tasks.test.tsx
git commit -m "refactor(tasks): update to display_name"
```

---

## Task 9: Rewrite Onboarding Screen (Single Page)

**Files:**

- Modify: `app/onboarding.tsx` (major rewrite)
- Modify: `__tests__/app/onboarding.test.tsx` (major rewrite)

**Step 1: Write tests for new single-page onboarding**

Create new test file covering:

- Renders display name input with character count
- Renders sobriety date picker
- Renders terms checkbox
- Pre-fills display name from OAuth profile
- Validates display name with real-time feedback
- Disables submit until form is valid
- Submits profile update on complete
- Shows validation errors inline

**Step 2: Implement new onboarding screen**

Key changes:

- Remove `step` state, `hasCompleteName`, `userWentBackToStep1`, `advanceToStep2`
- Remove `ProgressBar` import and usage
- Remove `renderStep1`/`renderStep2` - single render function
- Add `displayName` state with validation
- Add character count display with color feedback
- Add debounced validation (300ms)
- Two cards: "About You" and "Your Journey"
- Single "Complete Setup" button

**Step 3: Run tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/app/onboarding.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add app/onboarding.tsx __tests__/app/onboarding.test.tsx
git commit -m "feat(onboarding): condense to single page with display_name

Major rewrite:
- Single page with two cards instead of two steps
- Display name field with real-time validation
- Character count with color feedback
- Removed step navigation, progress bar
- OAuth pre-fill for display name"
```

---

## Task 10: Update Settings Name Edit Modal

**Files:**

- Modify: `app/settings.tsx`
- Modify: `__tests__/app/settings.test.tsx`

**Step 1: Update state variables**

```typescript
// Replace editFirstName/editLastInitial with:
const [editDisplayName, setEditDisplayName] = useState('');
const [displayNameError, setDisplayNameError] = useState<string | null>(null);
```

**Step 2: Update modal to single field**

- Single TextInput for display name
- Character count display
- Real-time validation using `validateDisplayName`
- Update `handleSaveName` to save `display_name`

**Step 3: Update Account section display**

```typescript
// Replace the name display in Account section
<Text style={styles.menuItemSubtext}>
  {profile?.display_name || 'Loading...'}
</Text>
```

**Step 4: Update tests**

**Step 5: Run tests**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test -- __tests__/app/settings.test.tsx`

Expected: PASS

**Step 6: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add app/settings.tsx __tests__/app/settings.test.tsx
git commit -m "refactor(settings): update name edit modal for display_name

Single field edit with validation and character count
instead of separate first name and last initial fields."
```

---

## Task 11: Remove ProgressBar Component

**Files:**

- Delete: `components/onboarding/ProgressBar.tsx`
- Delete: `__tests__/components/onboarding/ProgressBar.test.tsx`

**Step 1: Verify no imports remain**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && grep -r "ProgressBar" --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".test."`

Expected: No results (onboarding.tsx import was removed in Task 9)

**Step 2: Delete files**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
rm components/onboarding/ProgressBar.tsx
rm __tests__/components/onboarding/ProgressBar.test.tsx
```

**Step 3: Run all tests to verify nothing breaks**

Run: `cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name && pnpm test`

Expected: All tests PASS

**Step 4: Commit**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add -A
git commit -m "chore(onboarding): remove unused ProgressBar component

No longer needed after condensing onboarding to single page."
```

---

## Task 12: Final Validation

**Step 1: Run full validation suite**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
pnpm format && pnpm lint && pnpm typecheck && pnpm build:web && pnpm test
```

Expected: All checks PASS

**Step 2: Check test coverage**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
pnpm test -- --coverage
```

Expected: Coverage >= 80%

**Step 3: Final commit if any formatting changes**

```bash
cd /Users/billchirico/Developer/Volvox/Sobriety-Waypoint/.worktrees/display-name
git add -A
git commit -m "style: format code" --allow-empty
```

---

## Database Migration (Manual - Supabase Dashboard)

After all code changes are complete and tested, apply this migration in Supabase:

```sql
-- Migration: add display_name and migrate data
-- Run in Supabase SQL Editor

-- Step 1: Add new column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 2: Migrate existing data
UPDATE profiles
SET display_name = CONCAT(
  COALESCE(first_name, ''),
  CASE WHEN last_initial IS NOT NULL AND last_initial != ''
       THEN CONCAT(' ', last_initial, '.')
       ELSE ''
  END
)
WHERE display_name IS NULL
  AND (first_name IS NOT NULL OR last_initial IS NOT NULL);

-- Step 3: Update auth trigger to set display_name from OAuth
-- (Update your create_profile_on_signup trigger function)
```

**Note:** Dropping `first_name` and `last_initial` columns should be done in a separate migration after verifying the app works correctly in production.

---

## Summary

| Task | Description                      | Estimated Time |
| ---- | -------------------------------- | -------------- |
| 1    | Add validateDisplayName utility  | 5 min          |
| 2    | Update database types            | 2 min          |
| 3    | Update auth layout guard         | 5 min          |
| 4    | Update AuthContext mock profiles | 3 min          |
| 5    | Update analytics PII fields      | 3 min          |
| 6    | Update AppleSignInButton OAuth   | 10 min         |
| 7    | Update profile screen display    | 5 min          |
| 8    | Update tasks screen display      | 5 min          |
| 9    | Rewrite onboarding screen        | 30 min         |
| 10   | Update settings name edit modal  | 15 min         |
| 11   | Remove ProgressBar component     | 2 min          |
| 12   | Final validation                 | 5 min          |

**Total:** ~90 minutes
