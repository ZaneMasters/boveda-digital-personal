// src/firebase/firestore.ts
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { firebaseApp } from './config';

export const db = getFirestore(firebaseApp);

// Enable offline persistence (PWA support)
// enableIndexedDbPersistence returns a promise — errors are non-fatal
enableIndexedDbPersistence(db).catch((err: { code: string }) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence only works in one tab at a time
    console.warn('VaultOne: Offline persistence unavailable (multiple tabs)');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support IndexedDB
    console.warn('VaultOne: Offline persistence not supported in this browser');
  }
});
