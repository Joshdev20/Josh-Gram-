"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { app } from '@/firebaseConfig'; // Ensure this path is correct

const auth = getAuth(app);

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  // Add any other auth-related state or functions if needed, e.g., signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
