import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from './env';
import { AppError } from '../utils/app-error';

function getFirebasePrivateKey(): string {
  return env.firebase.privateKey.replace(/\\n/g, '\n').trim();
}

function assertFirebaseConfig() {
  const privateKey = getFirebasePrivateKey();

  if (!env.firebase.projectId || !env.firebase.clientEmail || !privateKey) {
    throw new AppError('Configuracao do Firebase incompleta.', 500);
  }

  return {
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey,
  };
}

export function getFirebaseAuth() {
  if (!getApps().length) {
    const config = assertFirebaseConfig();

    initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
      projectId: config.projectId,
    });
  }

  return getAuth();
}
