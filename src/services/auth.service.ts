// src/services/auth.service.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '@/firebase/auth';
import { db } from '@/firebase/firestore';
import { generateSalt, saltToBase64, base64ToSalt, deriveKey, encrypt, decrypt } from '@/crypto';
import type { UserProfile, UserSettings, UserSalt } from '@/types/user.types';
import { DEFAULT_USER_SETTINGS } from '@/types/user.types';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ─── Auth State Observer ─────────────────────────────────────────────────────

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── Sign In Methods ──────────────────────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithGitHub(): Promise<UserCredential> {
  return signInWithPopup(auth, githubProvider);
}

// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential;
}

// ─── Master Password Setup ────────────────────────────────────────────────────

/**
 * Called ONCE after first registration (email or OAuth).
 * Generates a salt, derives the vault key, encrypts a canary token to
 * allow key validation on future logins, and stores both in Firestore.
 * The Master Password is NEVER stored.
 */
export async function setupMasterPassword(
  user: User,
  masterPassword: string
): Promise<CryptoKey> {
  const salt = generateSalt();
  const saltBase64 = saltToBase64(salt);

  // Derive the vault key
  const key = await deriveKey(masterPassword, salt);

  // Encrypt a known canary value with the derived key.
  // We can decrypt this on future logins to verify the password is correct.
  const canary = await encrypt({ __canary: true }, key);

  // Store salt + canary in Firestore (neither is secret)
  const saltRef = doc(db, 'users', user.uid, 'private', 'salt');
  const saltDoc: UserSalt = { salt: saltBase64, version: 1, canary };
  await setDoc(saltRef, saltDoc);

  // Create user profile and settings
  await createUserDocuments(user);

  // Mark onboarding as complete
  const settingsRef = doc(db, 'users', user.uid, 'private', 'settings');
  await setDoc(settingsRef, { hasCompletedOnboarding: true }, { merge: true });

  // Return the vault key (stays in memory only)
  return key;
}

/**
 * Called on every login after the user enters their Master Password.
 * Reads the stored salt, derives the key, validates it against the canary,
 * and returns the verified CryptoKey.
 *
 * For accounts created before the canary was introduced, the canary is
 * created lazily on first unlock and validated on all subsequent ones.
 *
 * @throws if the master password is incorrect or salt is missing
 */
export async function unlockVaultWithMasterPassword(
  user: User,
  masterPassword: string
): Promise<CryptoKey> {
  const saltRef = doc(db, 'users', user.uid, 'private', 'salt');
  const saltSnap = await getDoc(saltRef);

  if (!saltSnap.exists()) {
    throw new Error('Salt not found. Please set up your Master Password first.');
  }

  const saltData = saltSnap.data() as UserSalt;
  const salt = base64ToSalt(saltData.salt);
  const key = await deriveKey(masterPassword, salt);

  if (saltData.canary) {
    // Canary exists — validate the derived key against it.
    // AES-GCM will throw if the key is wrong.
    try {
      await decrypt(saltData.canary, key);
    } catch {
      throw new Error('Incorrect master password. Please try again.');
    }
  } else {
    // No canary yet (account pre-dates this feature).
    // Migrate: create a canary now with the current key so future
    // logins are properly validated. This unlock is trusted.
    const canary = await encrypt({ __canary: true }, key);
    await setDoc(saltRef, { ...saltData, canary }, { merge: true });
  }

  return key;
}


/**
 * Checks if user has completed Master Password onboarding.
 */
export async function hasCompletedOnboarding(uid: string): Promise<boolean> {
  const saltRef = doc(db, 'users', uid, 'private', 'salt');
  const saltSnap = await getDoc(saltRef);
  if (!saltSnap.exists()) return false;

  const settingsRef = doc(db, 'users', uid, 'private', 'settings');
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) return false;
  const data = snap.data() as Partial<UserSettings>;
  return data.hasCompletedOnboarding ?? false;
}

// ─── User Documents ────────────────────────────────────────────────────────────

async function createUserDocuments(user: User): Promise<void> {
  const profileRef = doc(db, 'users', user.uid, 'public', 'profile');
  const settingsRef = doc(db, 'users', user.uid, 'private', 'settings');

  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) return; // Already exists

  const profile: Partial<UserProfile> = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };

  await Promise.all([
    setDoc(profileRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    setDoc(settingsRef, {
      ...DEFAULT_USER_SETTINGS,
      hasCompletedOnboarding: false,
    }),
  ]);
}

// ─── Other Auth Actions ────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function changePassword(
  user: User,
  newPassword: string
): Promise<void> {
  await updatePassword(user, newPassword);
}
