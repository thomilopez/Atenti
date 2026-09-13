/**
 * Contexto Global de Autenticación e Identidad (Atenti)
 * Gestión de sesión Firebase Auth / Google y estados de verificación de identidad para RG-07
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserIdentityFactors, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  identityFactors: UserIdentityFactors;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  verifyPhone: (phoneNumber: string, code: string) => Promise<boolean>;
  verifyDNI: (dniNumber: string) => Promise<boolean>;
  calculateMyIdentityScore: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'usr_atenti_google_demo',
    email: 'martin.rodriguez@gmail.com',
    displayName: 'Martín Rodríguez',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    phoneNumber: '+54 9 11 4455-8899',
    dniNumber: '38.412.905',
    identityFactors: {
      googleAuth: true,
      phoneVerified: false,
      dniVerified: false,
    },
  });

  const identityFactors = user?.identityFactors || {
    googleAuth: false,
    phoneVerified: false,
    dniVerified: false,
  };

  const loginWithGoogle = async () => {
    // Simula flujo de Google Sign-In mediante Firebase Auth
    await new Promise((res) => setTimeout(res, 800));
    setUser({
      uid: 'usr_atenti_google_' + Date.now(),
      email: 'usuario.atenti@gmail.com',
      displayName: 'Usuario Atenti Verificado',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      identityFactors: {
        googleAuth: true,
        phoneVerified: false,
        dniVerified: false,
      },
    });
  };

  const logout = () => {
    setUser(null);
  };

  const verifyPhone = async (phoneNumber: string, code: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 900));
    if (user) {
      setUser({
        ...user,
        phoneNumber,
        identityFactors: {
          ...user.identityFactors,
          phoneVerified: true,
        },
      });
      return true;
    }
    return false;
  };

  const verifyDNI = async (dniNumber: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 1200));
    if (user) {
      setUser({
        ...user,
        dniNumber,
        identityFactors: {
          ...user.identityFactors,
          dniVerified: true,
        },
      });
      return true;
    }
    return false;
  };

  const calculateMyIdentityScore = (): number => {
    let pts = 0;
    if (identityFactors.googleAuth) pts += 15;
    if (identityFactors.phoneVerified) pts += 15;
    if (identityFactors.dniVerified) pts += 10;
    return pts;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.identityFactors.googleAuth,
        identityFactors,
        loginWithGoogle,
        logout,
        verifyPhone,
        verifyDNI,
        calculateMyIdentityScore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
