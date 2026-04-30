import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';

import { env } from '../utils/env';

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;

export function getFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: env.firebaseApiKey,
    authDomain: env.firebaseAuthDomain,
    projectId: env.firebaseProjectId,
    storageBucket: env.firebaseStorageBucket,
    messagingSenderId: env.firebaseMessagingSenderId,
    appId: env.firebaseAppId,
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());

  return firebaseAppInstance;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuthInstance) {
    return firebaseAuthInstance;
  }

  const firebaseApp = getFirebaseApp();

  try {
    firebaseAuthInstance = initializeAuth(firebaseApp, {
      persistence: inMemoryPersistence,
    });
  } catch {
    firebaseAuthInstance = getAuth(firebaseApp);
  }

  return firebaseAuthInstance;
}
