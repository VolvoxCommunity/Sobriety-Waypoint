import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are configured in your environment.'
  );
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return Promise.resolve(localStorage.getItem(key));
    }
    if (Platform.OS !== 'web') {
      return SecureStore.getItemAsync(key);
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    if (Platform.OS !== 'web') {
      return SecureStore.setItemAsync(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    if (Platform.OS !== 'web') {
      return SecureStore.deleteItemAsync(key);
    }
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
