/* eslint-disable no-console */
/**
 * Expo config plugin to inject Firebase configuration files from EAS Secrets.
 *
 * This plugin reads Firebase config from EAS file secrets and writes them to
 * the correct locations during prebuild.
 *
 * @remarks
 * For local development, place the files directly in the project root.
 *
 * For EAS builds, create file secrets:
 *   eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
 *   eas secret:create --scope project --name GOOGLE_SERVICE_INFO_PLIST --type file --value ./GoogleService-Info.plist
 *
 * @see {@link https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables EAS Secrets}
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

/**
 * Ensure a file at targetPath is created from an EAS secret value.
 *
 * If secretValue is falsy, the function does nothing and returns `false`. If secretValue
 * is an existing absolute filesystem path, that file is copied to targetPath. Otherwise
 * secretValue is treated as base64-encoded content and decoded to UTF-8; if the decoded
 * content appears to be JSON (`{`) or a plist (`<`) it is written to targetPath, and
 * if decoding fails or the decoded content does not match those markers the original
 * secretValue is written as-is. The target directory is created if it does not exist.
 *
 * @param {string} secretValue - The secret value to write: either an absolute path to a file or base64-encoded content.
 * @param {string} targetPath - Filesystem path where the secret content should be written.
 * @returns {boolean} `true` if a file was written to targetPath, `false` if secretValue was falsy.
 */
function writeFromSecret(secretValue, targetPath) {
  if (!secretValue) return false;

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Check if it's a file path (EAS may write to temp file in some cases)
  if (secretValue.startsWith('/') && fs.existsSync(secretValue)) {
    fs.copyFileSync(secretValue, targetPath);
    return true;
  }

  // Otherwise, treat as base64-encoded content (FILE_BASE64 format)
  try {
    const content = Buffer.from(secretValue, 'base64').toString('utf8');
    // Verify it's valid JSON/plist by checking first character
    if (content.startsWith('{') || content.startsWith('<')) {
      fs.writeFileSync(targetPath, content);
      return true;
    }
    // If not valid decoded content, it might be raw content (for backward compat)
    fs.writeFileSync(targetPath, secretValue);
    return true;
  } catch {
    // If base64 decode fails, write as-is
    fs.writeFileSync(targetPath, secretValue);
    return true;
  }
}

/**
 * Ensure google-services.json is present in the Android app directory during prebuild.
 *
 * Attempts to write the Android Firebase configuration to android/app/google-services.json
 * using the EAS secret GOOGLE_SERVICES_JSON (treated as either an absolute file path or
 * base64-encoded content). If the secret is not provided or cannot be used, falls back to
 * copying google-services.json from the project root if it exists. If neither source is available,
 * the function leaves the project unchanged.
 *
 * @param {import('@expo/config-plugins').ExpoConfig & { modRequest?: { projectRoot: string } }} config - Expo config passed to the plugin.
 * @returns {import('@expo/config-plugins').ExpoConfig} The config object after applying the Android Firebase config handler.
 */
function withAndroidFirebaseConfig(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidAppDir = path.join(projectRoot, 'android', 'app');
      const targetPath = path.join(androidAppDir, 'google-services.json');

      // Check for EAS secret first
      const secretValue = process.env.GOOGLE_SERVICES_JSON;
      if (secretValue && writeFromSecret(secretValue, targetPath)) {
        console.log('✓ Wrote google-services.json from EAS secret');
        return config;
      }

      // Fall back to local file (development)
      const localFile = path.join(projectRoot, 'google-services.json');
      if (fs.existsSync(localFile)) {
        if (!fs.existsSync(androidAppDir)) {
          fs.mkdirSync(androidAppDir, { recursive: true });
        }
        fs.copyFileSync(localFile, targetPath);
        console.log('✓ Copied google-services.json from project root');
        return config;
      }

      console.warn(
        '⚠ No google-services.json found. Set GOOGLE_SERVICES_JSON secret or place file in project root.'
      );
      return config;
    },
  ]);
}

/**
 * Ensures an iOS Firebase config file (GoogleService-Info.plist) is present in the app project.
 *
 * Attempts to write the plist into ios/<projectName>/GoogleService-Info.plist from the
 * EAS secret `GOOGLE_SERVICE_INFO_PLIST`, falling back to copying a local
 * GoogleService-Info.plist from the project root if the secret is not provided.
 *
 * @param {import('@expo/config-plugins').ConfigPlugin} config - Expo config to modify.
 * @returns {import('@expo/config-plugins').ConfigPlugin} The updated Expo config.
 */
function withIosFirebaseConfig(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName || config.name;
      const iosAppDir = path.join(projectRoot, 'ios', projectName);
      const targetPath = path.join(iosAppDir, 'GoogleService-Info.plist');

      // Check for EAS secret first
      const secretValue = process.env.GOOGLE_SERVICE_INFO_PLIST;
      if (secretValue && writeFromSecret(secretValue, targetPath)) {
        console.log('✓ Wrote GoogleService-Info.plist from EAS secret');
        return config;
      }

      // Fall back to local file (development)
      const localFile = path.join(projectRoot, 'GoogleService-Info.plist');
      if (fs.existsSync(localFile)) {
        if (!fs.existsSync(iosAppDir)) {
          fs.mkdirSync(iosAppDir, { recursive: true });
        }
        fs.copyFileSync(localFile, targetPath);
        console.log('✓ Copied GoogleService-Info.plist from project root');
        return config;
      }

      console.warn(
        '⚠ No GoogleService-Info.plist found. Set GOOGLE_SERVICE_INFO_PLIST secret or place file in project root.'
      );
      return config;
    },
  ]);
}

/**
 * Combined plugin that handles both platforms.
 */
function withFirebaseConfig(config) {
  config = withAndroidFirebaseConfig(config);
  config = withIosFirebaseConfig(config);
  return config;
}

module.exports = withFirebaseConfig;