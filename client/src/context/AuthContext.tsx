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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to fetch the user's profile from FastAPI backend
          const response = await fetch(`/api/auth/user/${firebaseUser.uid}`);
          if (response.ok) {
            const userProfile = await response.json();
            
            // Combine Firebase user data with backend profile data
            setUser({
              ...firebaseUser,
              role: userProfile.role,
              grade: userProfile.grade,
            } as User);
          } else {
            // If user doesn't exist in backend, use Firebase data only
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
  }, []);

  const signup = async (email: string, password: string, name: string, role = 'student', grade = '12th') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, { displayName: name });
    
    try {
      // Create the user profile in FastAPI backend
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userCredential.user.uid,
          name,
          email,
          role,
          grade
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user profile');
      }

      // Set the user state with the role immediately
      setUser({
        ...userCredential.user,
        role,
        grade
      } as User);
    } catch (error) {
      await userCredential.user.delete();
      throw new Error('Failed to create user profile');
    }
     
    return userCredential;
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    try {
      // Update last login in backend
      await fetch('/api/auth/login', {
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