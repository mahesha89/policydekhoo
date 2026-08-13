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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { User } from './types';

// Firebase config from environment variables
const firebaseConfig = {
   apiKey: "AIzaSyA1TWJbu_uDAXiBt09ZLsTg-hxA-C8hmVw",
  authDomain: "insurance-565d9.firebaseapp.com",
  databaseURL: "https://insurance-565d9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "insurance-565d9",
  storageBucket: "insurance-565d9.firebasestorage.app",
  messagingSenderId: "893365323711",
  appId: "1:893365323711:web:289c2bc25284070b58c30a",
  measurementId: "G-8E8EFCTE2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
    // Create user with email/password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    // Update profile with name
    await updateProfile(userCredential.user, {
      displayName: userData.name
    });

    // Save user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      city: userData.city,
      abhaId: userData.abhaId || '',
      isPro: false,
      policies: [],
      createdAt: new Date().toISOString()
    });

    // Return user object
    return {
      id: userCredential.user.uid,
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      city: userData.city,
      token: await userCredential.user.getIdToken(),
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();

    return {
      id: userCredential.user.uid,
      name: userData?.name || userCredential.user.displayName || 'User',
      email: userCredential.user.email || email,
      mobile: userData?.mobile || '',
      city: userData?.city || '',
      token: await userCredential.user.getIdToken(),
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
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

// Get User Policies
export const getUserPolicies = async (userId: string): Promise<any[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().policies || [];
    }
    return [];
  } catch (error) {
    console.error('Get user policies error:', error);
    return [];
  }
};

// Add Policy to User
export const addUserPolicy = async (userId: string, policy: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      policies: arrayUnion(policy)
    });
  } catch (error) {
    console.error('Add policy error:', error);
    throw error;
  }
};

// Remove Policy from User
export const removeUserPolicy = async (userId: string, policyId: string): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const policies = userDoc.data().policies || [];
      const updatedPolicies = policies.filter((p: any) => p.id !== policyId);
      await updateDoc(doc(db, 'users', userId), {
        policies: updatedPolicies
      });
    }
  } catch (error) {
    console.error('Remove policy error:', error);
    throw error;
  }
};

// Logout User
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Auth State Observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};