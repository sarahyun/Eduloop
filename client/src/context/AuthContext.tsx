import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { API_BASE_URL } from '../lib/config';

interface User extends FirebaseUser {
  role?: string;
  grade?: string;
}

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string, name: string, role?: string, grade?: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Test user override - set these values for testing
  const USE_TEST_USER = false; // Set to false to use normal Firebase auth
  const TEST_USER_ID = 'B3i7MI8iCYcFGxpIkudvc8nrguj1'; // Replace with your test user ID

  // Enhanced environment checks for test user
  const isLocalDevelopment = () => {
    // Multiple checks to ensure we're in local development
    const isDev = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('replit.dev');
    const isNotProd = import.meta.env.MODE !== 'production';
    
    console.log('🔍 Environment checks:', {
      isDev,
      isLocalhost,
      isNotProd,
      hostname: window.location.hostname,
      mode: import.meta.env.MODE
    });
    
    return isDev && isLocalhost && isNotProd;
  };

  // Test user override - inject test user when enabled
  const createTestUser = async (): Promise<User | null> => {
    // Safety warning for non-local environments
    if (USE_TEST_USER && !isLocalDevelopment()) {
      console.error('🚨 SECURITY WARNING: Test user is enabled but not in local development environment!');
      console.error('🚨 Test user functionality is disabled for security reasons.');
      return null;
    }
    
    // Enhanced safety checks
    if (USE_TEST_USER && isLocalDevelopment() && TEST_USER_ID) {
      console.log('🧪 Using test user override, fetching data for:', TEST_USER_ID);
      console.log('🧪 Environment verified as local development');
      
      try {
        // Fetch actual user data from backend
        const response = await fetch(`${API_BASE_URL}/users/${TEST_USER_ID}`);
        if (response.ok) {
          const userProfile = await response.json();
          console.log('🧪 Fetched test user profile:', userProfile);
          
          return {
            uid: TEST_USER_ID,
            email: userProfile.email || 'test@example.com',
            displayName: userProfile.name || 'Test User',
            photoURL: null,
            emailVerified: true,
            phoneNumber: null,
            providerId: 'firebase',
            role: userProfile.role || 'student',
            grade: userProfile.grade || '12',
            // Mock Firebase User properties
            isAnonymous: false,
            metadata: {
              creationTime: new Date().toISOString(),
              lastSignInTime: new Date().toISOString(),
            },
            providerData: [],
            refreshToken: 'test-refresh-token',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => 'test-id-token',
            getIdTokenResult: async () => ({
              token: 'test-id-token',
              expirationTime: new Date(Date.now() + 3600000).toISOString(),
              authTime: new Date().toISOString(),
              issuedAtTime: new Date().toISOString(),
              signInProvider: 'custom',
              signInSecondFactor: null,
              claims: { uid: TEST_USER_ID, email: userProfile.email || 'test@example.com' }
            }),
            reload: async () => {},
            toJSON: () => ({}),
          } as User;
        } else {
          console.warn('🧪 Failed to fetch test user data, falling back to mock data');
          // Fallback to basic mock user if API call fails
          return {
            uid: TEST_USER_ID,
            email: 'test@example.com',
            displayName: 'Test User (Mock)',
            photoURL: null,
            emailVerified: true,
            phoneNumber: null,
            providerId: 'firebase',
            role: 'student',
            grade: '12',
            // Mock Firebase User properties
            isAnonymous: false,
            metadata: {
              creationTime: new Date().toISOString(),
              lastSignInTime: new Date().toISOString(),
            },
            providerData: [],
            refreshToken: 'test-refresh-token',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => 'test-id-token',
            getIdTokenResult: async () => ({
              token: 'test-id-token',
              expirationTime: new Date(Date.now() + 3600000).toISOString(),
              authTime: new Date().toISOString(),
              issuedAtTime: new Date().toISOString(),
              signInProvider: 'custom',
              signInSecondFactor: null,
              claims: { uid: TEST_USER_ID, email: 'test@example.com' }
            }),
            reload: async () => {},
            toJSON: () => ({}),
          } as User;
        }
      } catch (error) {
        console.error('🧪 Error fetching test user data:', error);
        // Fallback to basic mock user if there's an error
        return {
          uid: TEST_USER_ID,
          email: 'test@example.com',
          displayName: 'Test User (Error Fallback)',
          photoURL: null,
          emailVerified: true,
          phoneNumber: null,
          providerId: 'firebase',
          role: 'student',
          grade: '12',
          // Mock Firebase User properties
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString(),
          },
          providerData: [],
          refreshToken: 'test-refresh-token',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'test-id-token',
          getIdTokenResult: async () => ({
            token: 'test-id-token',
            expirationTime: new Date(Date.now() + 3600000).toISOString(),
            authTime: new Date().toISOString(),
            issuedAtTime: new Date().toISOString(),
            signInProvider: 'custom',
            signInSecondFactor: null,
            claims: { uid: TEST_USER_ID, email: 'test@example.com' }
          }),
          reload: async () => {},
          toJSON: () => ({}),
        } as User;
      }
    }
    return null;
  };

  useEffect(() => {
    // Check for test user override first
    const handleTestUser = async () => {
      const testUser = await createTestUser();
      if (testUser) {
        setUser(testUser);
        setLoading(false);
        return true; // Return true to indicate test user was used
      }
      return false; // Return false to proceed with Firebase auth
    };

    // Handle both test user and Firebase auth
    const initializeAuth = async () => {
      const usedTestUser = await handleTestUser();
      if (usedTestUser) {
        return; // Exit early if test user was used
      }

      // Otherwise use Firebase auth
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            console.log('🔍 Fetching user profile from:', `${API_BASE_URL}/auth/user/${firebaseUser.uid}`);
            const response = await fetch(`${API_BASE_URL}/auth/user/${firebaseUser.uid}`);
            if (response.ok) {
              const userProfile = await response.json();
              
              setUser({
                ...firebaseUser,
                role: userProfile.role,
                grade: userProfile.grade,
              } as User);
            } else {
              setUser(firebaseUser as User);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(firebaseUser as User); // Fallback to basic Firebase user data
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signup = async (email: string, password: string, name: string, role = 'student', grade = '12th') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, { displayName: name });
    
    try {
      console.log('🔍 SIGNUP DEBUG: Making API call to:', `${API_BASE_URL}/auth/signup`);
      console.log('🔍 SIGNUP DEBUG: Current window.location.origin:', window.location.origin);
      console.log('🔍 SIGNUP DEBUG: Full URL will be:', `${window.location.origin}${API_BASE_URL}/auth/signup`);
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userCredential.user.uid,
          name,
          email,
          role,
          grade
        })
      });

      console.log('🔍 SIGNUP DEBUG: Response status:', response.status);
      console.log('🔍 SIGNUP DEBUG: Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user profile');
      }

      setUser({
        ...userCredential.user,
        role,
        grade
      } as User);
    } catch (error) {
      console.log('🔍 SIGNUP DEBUG: Caught error:', error);
      await userCredential.user.delete();
      throw new Error('Failed to create user profile');
    }
     
    return userCredential;
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign-in successful:', userCredential.user.uid);
      
      try {
        await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email
          })
        });
      } catch (error) {
        console.error('Error updating login in backend:', error);
        // Don't throw error here as Firebase login was successful
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Firebase authentication error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else {
        throw new Error(error.message || 'Authentication failed. Please try again.');
      }
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    signup,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}