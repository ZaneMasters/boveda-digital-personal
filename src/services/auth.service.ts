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
import { generateSalt, saltToBase64, base64ToSalt, deriveKey } from '@/crypto';
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
 * Generates a salt, derives the vault key, and stores the salt in Firestore.
 * The Master Password is NEVER stored.
 */
export async function setupMasterPassword(
  user: User,
  masterPassword: string
): Promise<CryptoKey> {
  const salt = generateSalt();
  const saltBase64 = saltToBase64(salt);

  // Store salt in Firestore (it's not secret — just unique per user)
  const saltRef = doc(db, 'users', user.uid, 'private', 'salt');
  const saltDoc: UserSalt = { salt: saltBase64, version: 1 };
  await setDoc(saltRef, saltDoc);

  // Create user profile and settings
  await createUserDocuments(user);

  // Mark onboarding as complete
  const settingsRef = doc(db, 'users', user.uid, 'private', 'settings');
  await setDoc(settingsRef, { hasCompletedOnboarding: true }, { merge: true });

  // Derive and return the vault key (stays in memory only)
  return deriveKey(masterPassword, salt);
}

/**
 * Called on every login after the user enters their Master Password.
 * Reads the stored salt, derives the key, and validates it.
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

  const { salt: saltBase64 } = saltSnap.data() as UserSalt;
  const salt = base64ToSalt(saltBase64);

  return deriveKey(masterPassword, salt);
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
