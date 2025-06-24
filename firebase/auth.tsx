'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Auth, 
  User, 
  UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string, displayName: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Flag to track if we're in the signup process
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only update user state if we're not in the signup process
      if (!isSigningUp) {
        setUser(user);
        setLoading(false);
        
        // Check if user is admin - this could be from Firestore or custom claims
        if (user) {
          // For now, let's use localStorage for admin status
          // In a real app, you'd verify this from Firestore or Firebase Auth custom claims
          const storedAdminMode = localStorage.getItem("docHubAdminMode");
          setIsAdmin(storedAdminMode === "true");
        }
      }
    });

    return () => unsubscribe();
  }, [isSigningUp]);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    // Set the flag to prevent auth state changes during signup
    setIsSigningUp(true);
    
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
        
        // Immediately sign out to prevent auto-login
        await signOut(auth);
      }
      
      return credential.user;
    } catch (error) {
      throw error;
    } finally {
      // Reset the flag after signup process is complete
      setIsSigningUp(false);
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("docHubAdminMode");
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin,
    setIsAdmin: (value: boolean) => {
      setIsAdmin(value);
      if (value) {
        localStorage.setItem("docHubAdminMode", "true");
      } else {
        localStorage.removeItem("docHubAdminMode");
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
