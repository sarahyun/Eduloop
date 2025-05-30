import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log(firebaseUser)
        try {
          // Fetch the user's full profile from your backend
          console.log("fetching user profile")
          const response = await axios.get(`${config.API_BASE_URL}/users/${firebaseUser.uid}`);
          const userProfile = response.data;
          console.log(userProfile)
          
          // Combine Firebase user data with your backend profile data
          setUser({
            ...firebaseUser,
            role: userProfile.role,
            grade: userProfile.grade,
            // Add any other custom fields you need from your backend
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(firebaseUser); // Fallback to basic Firebase user data
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password, name, role, grade, inviteCode = null) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, { displayName: name });
    
    try {
      console.log(email, password, name, role, grade, inviteCode)
      let counselorId = null;
      
      // if (role === 'student' && inviteCode) {
      //   console.log("invite code")
      //   console.log(inviteCode)
      //   // Verify invite code and get counselor ID
      //   const verifyResponse = await axios.post(
      //     `${config.API_BASE_URL}/invite-codes/verify?code=${inviteCode}&student_id=${userCredential.user.uid}`
      //   );
      //   counselorId = verifyResponse.data.counselor_id;
      //   console.log(counselorId)
        
      //   // Get the counselor's current profile first
      //   const counselorProfile = await axios.get(`${config.API_BASE_URL}/users/${counselorId}`);
        
      //   // Update the counselor's profile with all required fields
      //   await axios.put(
      //     `${config.API_BASE_URL}/users/${counselorId}`,
      //     {
      //       ...counselorProfile.data,
      //       students: [userCredential.user.uid]
      //     }
      //   );
      // }

      // Create the new user profile
      await axios.post(`${config.API_BASE_URL}/users/`, {
        user_id: userCredential.user.uid,
        name,
        email,
        role,
        grade,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });


      // Set the user state with the role immediately
      setUser({
        ...userCredential.user,
        role,
        grade
      });
    } catch (error) {
      await userCredential.user.delete();
      throw new Error('Invalid invite code');
    }
     
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 