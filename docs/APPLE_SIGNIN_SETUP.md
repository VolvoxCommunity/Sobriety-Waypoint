# Apple Sign In Setup Guide

This guide walks through configuring Apple Sign In for Sobriety Waypoint across iOS and Web platforms.

## Overview

Apple Sign In uses a **native authentication flow** on iOS, which differs from the OAuth redirect flow used by Google. The app obtains an identity token directly from Apple's native APIs and exchanges it with Supabase using `signInWithIdToken()`.

**Platform Support:**

- **iOS**: Native Sign in with Apple via `@invertase/react-native-apple-authentication`
- **Android**: Not supported (Apple requirement - only available on Apple platforms and web)
- **Web**: OAuth redirect flow via Supabase (optional)

## Prerequisites

- Apple Developer Program membership ($99/year)
- Access to [Apple Developer Console](https://developer.apple.com/)
- Access to [Supabase Dashboard](https://supabase.com/dashboard)
- Expo project with EAS Build configured

## Step 1: Configure Apple Developer Console

### Create an App ID

1. Go to [Apple Developer Console](https://developer.apple.com/) → **Certificates, Identifiers & Profiles**
2. Select **Identifiers** → Click **+** to create new
3. Select **App IDs** → Continue
4. Select **App** → Continue
5. Configure:
   - Description: `Sobriety Waypoint`
   - Bundle ID: `com.volvox.sobrietywaypoint` (Explicit)
6. Scroll to **Capabilities** and enable **Sign in with Apple**
7. Click **Continue** → **Register**

### Create a Services ID (for Web - Optional)

If you want Apple Sign In on web:

1. Go to **Identifiers** → Click **+**
2. Select **Services IDs** → Continue
3. Configure:
   - Description: `Sobriety Waypoint Web`
   - Identifier: `com.volvox.sobrietywaypoint.web`
4. Click **Continue** → **Register**
5. Click on the newly created Services ID
6. Enable **Sign in with Apple** → Click **Configure**
7. Configure Web Authentication:
   - Primary App ID: Select `Sobriety Waypoint` (the App ID from above)
   - Domains: `<your-supabase-project>.supabase.co`
   - Return URLs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
8. Click **Save** → **Continue** → **Save**

### Create a Key for Supabase

1. Go to **Keys** → Click **+**
2. Key Name: `Sobriety Waypoint Supabase`
3. Enable **Sign in with Apple** → Click **Configure**
4. Primary App ID: Select `Sobriety Waypoint`
5. Click **Save** → **Continue** → **Register**
6. **Download the key file** (`.p8`) - you can only download this once!
7. Note the **Key ID** displayed

### Gather Required Information

You'll need these values for Supabase configuration:

| Value           | Where to Find                                                         |
| --------------- | --------------------------------------------------------------------- |
| **Team ID**     | Top right of Apple Developer Console (10-character string)            |
| **Services ID** | Identifier from Services ID (e.g., `com.volvox.sobrietywaypoint.web`) |
| **Key ID**      | Displayed when you created/view the key                               |
| **Key File**    | The `.p8` file you downloaded (keep this safe!)                       |

## Step 2: Generate Secret Key (Web/OAuth Only)

> **Native iOS only?** If you're only using native Apple Sign In (not web), you can **skip this step**. The native flow uses `signInWithIdToken` and doesn't require a secret key. Just leave the "Secret Key" field empty in Supabase.

For web OAuth, you need to generate a JWT secret from your `.p8` file. Use this external tool:

**[Apple Secret Key Generator](https://supabase.com/docs/guides/auth/social-login/auth-apple#configuration)**

Or generate manually using Node.js:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8');
const secret = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // 6 months max
  audience: 'https://appleid.apple.com',
  issuer: 'YOUR_TEAM_ID', // 10-character Team ID
  subject: 'com.volvox.sobrietywaypoint.web', // Services ID
  keyid: 'YOUR_KEY_ID', // Key ID from Apple Developer Console
});

console.log(secret);
```

## Step 3: Configure Supabase Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Authentication** → **Providers** → **Apple**
3. Toggle **Enable Sign in with Apple**
4. Configure the fields:

| Field                            | Value                         | Notes                                                                                      |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| **Client IDs**                   | `com.volvox.sobrietywaypoint` | Your iOS bundle ID for native sign-in. Add Services ID too if using web (comma-separated). |
| **Secret Key (for OAuth)**       | _(paste generated JWT)_       | Only needed for web OAuth. Leave empty for native-only.                                    |
| **Allow users without an email** | Off                           | Toggle on only if you want to allow users who hide their email entirely.                   |

5. Note the **Callback URL** shown - you'll need this for Apple Developer Console if using web OAuth
6. Click **Save**

### Secret Key Expiration Warning

Apple OAuth secret keys expire every **6 months**. Supabase shows a warning about this:

> ⚠️ Apple OAuth secret keys expire every 6 months. A new secret should be generated every 6 months, otherwise users on the web will not be able to sign in.

**Best practices:**

- Set a calendar reminder to regenerate the key every 5 months
- Keep your `.p8` file secure - you'll need it for each rotation
- Native iOS sign-in is unaffected by key expiration

## Step 4: Configure Expo Project

### Update app.config.ts

Add the Apple Sign In capability and plugin:

```typescript
// app.config.ts
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // ... other config
  ios: {
    bundleIdentifier: 'com.volvox.sobrietywaypoint',
    usesAppleSignIn: true, // Enable Apple Sign In capability
    // ... other iOS config
  },
  plugins: [
    'expo-router',
    'expo-apple-authentication', // Add this plugin
    // ... other plugins
  ],
});
```

### Install Dependencies

```bash
# Install the Apple authentication library
npx expo install @invertase/react-native-apple-authentication

# Or with pnpm
pnpm add @invertase/react-native-apple-authentication
```

## Step 5: Implement Apple Sign In

### Create Apple Sign In Button Component

Create `components/auth/AppleSignInButton.tsx`:

```typescript
import { Platform, StyleSheet, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { logger, LogCategory } from '@/lib/logger';

// Only import on iOS to avoid errors on other platforms
let AppleButton: typeof import('@invertase/react-native-apple-authentication').AppleButton;
let appleAuth: typeof import('@invertase/react-native-apple-authentication').appleAuth;

if (Platform.OS === 'ios') {
  const appleAuthModule = require('@invertase/react-native-apple-authentication');
  AppleButton = appleAuthModule.AppleButton;
  appleAuth = appleAuthModule.appleAuth;
}

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Apple Sign In button component for iOS.
 * Returns null on non-iOS platforms.
 *
 * @remarks
 * Uses native Apple authentication APIs via @invertase/react-native-apple-authentication.
 * Must be tested on a real iOS device - the simulator always throws errors.
 */
export function AppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
  // Only render on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  const handleAppleSignIn = async () => {
    try {
      // Perform the Apple Sign In request
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // IMPORTANT: FULL_NAME must come before EMAIL (see issue #293)
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      // Verify the credential state
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthResponse.user
      );

      if (credentialState !== appleAuth.State.AUTHORIZED) {
        throw new Error('Apple Sign In not authorized');
      }

      // Ensure we have the required tokens
      if (!appleAuthResponse.identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      // Sign in with Supabase using the Apple ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleAuthResponse.identityToken,
        nonce: appleAuthResponse.nonce,
      });

      if (error) {
        throw error;
      }

      logger.info('Apple Sign In successful', {
        category: LogCategory.AUTH,
        userId: data.user?.id,
      });

      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Apple Sign In failed');

      // Check if user cancelled
      if ((error as any)?.code === 'ERR_REQUEST_CANCELED') {
        logger.info('Apple Sign In cancelled by user', {
          category: LogCategory.AUTH,
        });
        return; // Don't treat cancellation as an error
      }

      logger.error('Apple Sign In failed', err, {
        category: LogCategory.AUTH,
      });

      onError?.(err);
    }
  };

  return (
    <View style={styles.container}>
      <AppleButton
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        style={styles.button}
        onPress={handleAppleSignIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 44,
  },
});
```

### Update AuthContext

Add Apple Sign In to `contexts/AuthContext.tsx`:

```typescript
// Add to AuthContextType interface
interface AuthContextType {
  // ... existing methods
  signInWithApple: () => Promise<void>;
}

// Add to AuthProvider
const signInWithApple = async () => {
  if (Platform.OS === 'web') {
    // Web uses OAuth redirect flow
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  } else if (Platform.OS === 'ios') {
    // iOS uses native flow - handled by AppleSignInButton component
    // This method exists for API consistency but the button handles the flow
    throw new Error('Use AppleSignInButton component for iOS');
  } else {
    throw new Error('Apple Sign In is only available on iOS and web');
  }
};

// Add to context provider value
<AuthContext.Provider
  value={{
    // ... existing values
    signInWithApple,
  }}
>
```

### Add to Login Screen

Update `app/login.tsx` to include the Apple Sign In button:

```typescript
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { Platform } from 'react-native';

// In the component JSX, after the Google button:
{Platform.OS === 'ios' && (
  <>
    <AppleSignInButton
      onError={(error) => {
        if (Platform.OS === 'web') {
          window.alert('Error: ' + error.message);
        } else {
          Alert.alert('Error', error.message);
        }
      }}
    />
  </>
)}
```

## Step 6: Handle User Data

### Important: Apple Only Shares Name Once

Apple only provides the user's name on the **first** sign-in. Subsequent sign-ins will not include name data. Handle this in your profile creation:

```typescript
// In createOAuthProfileIfNeeded or similar
const createAppleProfileIfNeeded = async (user: User): Promise<void> => {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    // Apple may or may not provide name - it's only available on first sign-in
    // user_metadata.full_name may be available from Apple
    const fullName = user.user_metadata?.full_name;
    const nameParts = fullName?.split(' ').filter(Boolean);
    const firstName = nameParts?.[0] || null;
    const lastInitial = nameParts?.[nameParts.length - 1]?.[0]?.toUpperCase() || null;

    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || '',
      first_name: firstName, // May be null - collect during onboarding
      last_initial: lastInitial,
      timezone: DEVICE_TIMEZONE,
    });
  }
};
```

### Private Email Relay

Apple allows users to hide their real email address. When they do, you'll receive an email like:

```
abc123def456@privaterelay.appleid.com
```

This is a real, working email address that forwards to the user's actual email. Your app should:

1. Accept and store these relay addresses normally
2. Send emails through them (they forward automatically)
3. Never try to "validate" that it's a "real" email domain

## Step 7: Build and Test

### Development Build Required

Apple Sign In requires a **development build** - it won't work in Expo Go.

```bash
# Create a development build for iOS
eas build --platform ios --profile development

# Or build locally
npx expo run:ios
```

### Testing on Real Device

**Important**: Apple Sign In cannot be fully tested on the iOS Simulator. You must test on a real iOS device.

1. Install the development build on your device
2. Tap "Sign in with Apple"
3. Authenticate with Face ID/Touch ID or password
4. Verify the user is created in Supabase

### Troubleshooting

**"Invalid client" Error**

- Verify your Services ID matches in Apple Developer Console and Supabase
- Ensure the `.p8` key is correctly pasted (include the `-----BEGIN/END PRIVATE KEY-----` lines)

**"Apple Sign In is not available" on Simulator**

- This is expected - test on a real device

**No Name Returned**

- Apple only provides the name on the first sign-in
- If you need to test again, go to Settings → Apple ID → Password & Security → Apps Using Apple ID → Remove the app, then sign in again

**"Invalid nonce" Error**

- Ensure you're passing the nonce from the Apple auth response to Supabase
- Don't generate your own nonce - use the one from `appleAuthResponse.nonce`

**User Email is null**

- User chose to hide their email - use the relay address Apple provides
- Check `user.email` from the Supabase response, not Apple directly

## Security Considerations

- Store the `.p8` private key securely - never commit it to version control
- The private key should only be in Supabase Dashboard (server-side)
- Apple's identity tokens are short-lived and validated server-side by Supabase
- Consider implementing Sign in with Apple on web for App Store compliance if you offer social login

## App Store Requirements

If your app uses any third-party social login (Google, Facebook, etc.), Apple **requires** you to also offer Sign in with Apple. From Apple's App Store Review Guidelines:

> Apps that use a third-party or social login service to set up or authenticate the user's primary account with the app must also offer Sign in with Apple as an equivalent option.

## Related Files

- `components/auth/AppleSignInButton.tsx` - Apple Sign In button (to be created)
- `contexts/AuthContext.tsx` - Auth context with sign-in methods
- `app/login.tsx` - Login screen
- `app/signup.tsx` - Signup screen
- `lib/supabase.ts` - Supabase client configuration

## References

- [Expo Apple Authentication Docs](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Supabase Apple Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [@invertase/react-native-apple-authentication](https://github.com/invertase/react-native-apple-authentication)
- [Apple Sign In Guidelines](https://developer.apple.com/sign-in-with-apple/get-started/)
