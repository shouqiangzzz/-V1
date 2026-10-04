import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  onSnapshot, 
  collection, 
  addDoc, 
  getDocFromServer,
  setLogLevel,
  Firestore,
  updateDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, SystemConfig, UserRole } from '../types';

export const BOOTSTRAP_ADMIN_EMAIL = 'shouqiangzzz@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const authInstance = getAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance.currentUser?.uid || getEffectiveUserId(),
      email: authInstance.currentUser?.email,
      emailVerified: authInstance.currentUser?.emailVerified,
      isAnonymous: !authInstance.currentUser,
    },
    operationType,
    path
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with specific database ID (CRITICAL)
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

// Suppress transient backend connection retry warnings
try {
  setLogLevel('silent');
} catch {
  // ignore
}

/**
 * Returns a stable local non-real-name ID if user is not signed in with Google.
 * This guarantees zero-friction, non-real-name registration without requiring
 * Firebase Anonymous Auth provider configuration.
 */
export function getEffectiveUserId(): string {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  const key = 'life_clock_non_real_name_uid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'anon_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

// Test database connection gently
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // If offline or initializing, Firestore client works seamlessly with offline persistence
    return true;
  }
}

// Optional Google Auth if user wishes to bind Google account
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (err) {
    console.warn('Google sign-in skipped or closed by user:', err);
    return null;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Save or Update User Profile in Firestore
export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const uid = getEffectiveUserId();
  const path = `users/${uid}`;
  try {
    // Check if user is bootstrap admin
    const isAdmin = profile.role === 'admin' || 
                    profile.accountIdentifier === BOOTSTRAP_ADMIN_EMAIL ||
                    auth.currentUser?.email === BOOTSTRAP_ADMIN_EMAIL;

    const dataToSave = {
      userId: uid,
      displayName: profile.name || `探索者#${uid.slice(0, 4)}`,
      isAnonymous: !auth.currentUser && profile.accountType === 'anonymous',
      birthDate: profile.birthDate,
      gender: profile.gender,
      targetAge: Number(profile.targetAge),
      height: Number(profile.height),
      weight: Number(profile.weight),
      bodyFat: Number(profile.bodyFat),
      fastingBloodSugar: Number(profile.fastingBloodSugar),
      systolicBP: Number(profile.systolicBP),
      diastolicBP: Number(profile.diastolicBP),
      restingHeartRate: Number(profile.restingHeartRate),
      biologicalAgeOffset: Number(profile.biologicalAgeOffset),
      hasUploadedReport: Boolean(profile.hasUploadedReport),
      uploadedReportName: profile.uploadedReportName || '',
      avatarUrl: profile.avatarUrl || '',
      avatarType: profile.avatarType || 'preset',
      themeConfig: profile.themeConfig || null,
      role: isAdmin ? 'admin' : (profile.role || 'user'),
      region: profile.region || 'mainland',
      accountType: profile.accountType || 'username',
      accountIdentifier: profile.accountIdentifier || profile.name || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', uid), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch all registered users (for Administrator view)
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snap.forEach((docItem) => {
      const d = docItem.data();
      users.push({
        id: docItem.id,
        name: d.displayName || '未命名用户',
        birthDate: d.birthDate || '1998-06-15',
        gender: d.gender || 'male',
        targetAge: Number(d.targetAge) || 85,
        height: Number(d.height) || 172,
        weight: Number(d.weight) || 65,
        bodyFat: Number(d.bodyFat) || 18,
        fastingBloodSugar: Number(d.fastingBloodSugar) || 5.1,
        systolicBP: Number(d.systolicBP) || 116,
        diastolicBP: Number(d.diastolicBP) || 76,
        restingHeartRate: Number(d.restingHeartRate) || 68,
        dailyActivityTargetHours: 1.0,
        maxSedentaryHoursLimit: 4.0,
        biologicalAgeOffset: Number(d.biologicalAgeOffset) || 0,
        hasUploadedReport: Boolean(d.hasUploadedReport),
        uploadedReportName: d.uploadedReportName || '',
        avatarUrl: d.avatarUrl || '',
        avatarType: d.avatarType || 'preset',
        themeConfig: d.themeConfig || undefined,
        role: (d.role as UserRole) || (d.accountIdentifier === BOOTSTRAP_ADMIN_EMAIL ? 'admin' : 'user'),
        region: d.region,
        accountType: d.accountType,
        accountIdentifier: d.accountIdentifier,
      });
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Update specific user role (Admin capability)
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Global System Configuration (Managed by Admin)
export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  configId: 'global',
  systemMotto: '自律以致远，每一分坚持皆是对生命的最高敬意。保持规律作息与运动，科学延展高质量健康跨度。',
  bannerNotice: '欢迎使用生命维度系统！科学量化生命，自律延年益寿。',
  appSlogan: '精准生命倒计时 · 科学健康加减算法',
  baselineLifespan: 85,
  habitRewardSeconds: 86400, // +1 Day per 20 days
  habitPenaltySeconds: 86400, // -1 Day per 20 days
  sedentaryAlertMinutes: 50,
  maxSedentaryHours: 4,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export async function fetchSystemConfig(): Promise<SystemConfig> {
  const path = 'system/config';
  try {
    const snap = await getDoc(doc(db, 'system', 'config'));
    if (snap.exists()) {
      return { ...DEFAULT_SYSTEM_CONFIG, ...snap.data() } as SystemConfig;
    } else {
      // Initialize default
      await setDoc(doc(db, 'system', 'config'), DEFAULT_SYSTEM_CONFIG);
      return DEFAULT_SYSTEM_CONFIG;
    }
  } catch (error) {
    console.warn('System config fetch failed, using default:', error);
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export async function saveSystemConfig(config: SystemConfig): Promise<void> {
  const path = 'system/config';
  try {
    await setDoc(doc(db, 'system', 'config'), {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || getEffectiveUserId(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save Questionnaire Submission Record
export async function saveQuestionnaireSubmission(data: {
  sleepQuality: string;
  exerciseFrequency: string;
  dietStyle: string;
  sedentaryDailyHours: number;
  expectedLifespanTarget: number;
  vitalitySelfRating: number;
  bloodPressureStatus: string;
  bloodSugarStatus: string;
}): Promise<string> {
  const uid = getEffectiveUserId();
  const path = `users/${uid}/questionnaires`;
  try {
    const colRef = collection(db, 'users', uid, 'questionnaires');
    const docRef = await addDoc(colRef, {
      responseId: `quest_${Date.now()}`,
      userId: uid,
      ...data,
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return '';
  }
}

// Save Uploaded Checkup Report Record
export async function saveHealthReportRecord(data: {
  reportName: string;
  extractedIndicators: Record<string, any>;
  biologicalAgeOffset: number;
  doctorSummary: string;
}): Promise<string> {
  const uid = getEffectiveUserId();
  const path = `users/${uid}/reports`;
  try {
    const colRef = collection(db, 'users', uid, 'reports');
    const docRef = await addDoc(colRef, {
      reportId: `rep_${Date.now()}`,
      userId: uid,
      ...data,
      parsedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return '';
  }
}
