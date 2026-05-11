/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:3000/api',
  FIREBASE_API_KEY: 'firebase-api-key',
  FIREBASE_AUTH_DOMAIN: 'firebase-auth-domain',
  FIREBASE_PROJECT_ID: 'firebase-project-id',
  FIREBASE_STORAGE_BUCKET: 'firebase-storage-bucket',
  FIREBASE_MESSAGING_SENDER_ID: 'firebase-messaging-sender-id',
  FIREBASE_APP_ID: 'firebase-app-id',
  GOOGLE_WEB_CLIENT_ID: 'google-web-client-id',
  GOOGLE_ANDROID_CLIENT_ID: 'google-android-client-id',
  GOOGLE_IOS_CLIENT_ID: 'google-ios-client-id',
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getTokens: jest.fn(),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  setGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  getAuth: jest.fn(() => ({})),
  getIdToken: jest.fn(),
  initializeAuth: jest.fn(() => ({})),
  inMemoryPersistence: {},
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
}, 15000);
