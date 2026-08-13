import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { User } from './types';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1TWJbu_uDAXiBt09ZLsTg-hxA-C8hmVw",
  authDomain: "insurance-565d9.firebaseapp.com",
  projectId: "insurance-565d9",
  storageBucket: "insurance-565d9.firebasestorage.app",
  messagingSenderId: "893365323711",
  appId: "1:893365323711:web:289c2bc25284070b58c30a",
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth, db };

// Register User
export const registerUser = async (userData: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  city: string;
  abhaId: string;
}): Promise<User> => {
  try {
    if (!auth) throw new Error('Firebase auth not initialized');

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: userData.name || 'User'
      });
    }

    if (db && userCredential.user) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: userData.name || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        city: userData.city || '',
        abhaId: userData.abhaId || '',
        isPro: false,
        policies: [],
        createdAt: new Date().toISOString()
      });
    }

    const token = await userCredential.user.getIdToken();

    return {
      id: userCredential.user.uid,
      name: userData.name || 'User',
      email: userData.email || '',
      mobile: userData.mobile || '',
      city: userData.city || '',
      token: token || '',
      isPro: false,
      policies: [],
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

// Login User
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!auth) throw new Error('Firebase auth not initialized');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    let userData: any = {};
    if (db && userCredential.user) {
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    }

    const token = await userCredential.user.getIdToken();

    return {
      id: userCredential.user.uid,
      name: userData?.name || userCredential.user.displayName || 'User',
      email: userCredential.user.email || email,
      mobile: userData?.mobile || '',
      city: userData?.city || '',
      token: token || '',
      isPro: userData?.isPro || false,
      policies: userData?.policies || [],
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

// Get User Data
export const getUserData = async (userId: string): Promise<any> => {
  try {
    if (!db) return null;
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

// Logout User
export const logoutUser = async (): Promise<void> => {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Auth State Observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};