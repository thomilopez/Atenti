/**
 * Contexto Global de Autenticación e Identidad (Atenti)
 * Gestiona la sesión real de Firebase Auth / Google y los estados de
 * verificación de identidad para RG-07.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserIdentityFactors, UserProfile } from '../types';
import { env, hasRealFirebaseConfig } from '../services/env';
import {
  authService,
  SesionUsuario,
  EstadoDNI,
  ResultadoVerificacionDNI,
  logout as cerrarSesion,
} from '../services/authService';
import { registrarTokenPush } from '../services/pushService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** Acceso temporal al panel admin (RF-015 pendiente). */
  isAdmin: boolean;
  identityFactors: UserIdentityFactors;
  dniEstado: EstadoDNI;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  verifyPhone: (phoneNumber: string, code: string) => Promise<boolean>;
  verifyDNI: (dniNumber: string) => Promise<ResultadoVerificacionDNI>;
  calculateMyIdentityScore: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FACTORES_VACIOS: UserIdentityFactors = {
  googleAuth: false,
  phoneVerified: false,
  dniVerified: false,
};

function aPerfil(sesion: SesionUsuario): UserProfile {
  return {
    uid: sesion.uid,
    email: sesion.email,
    displayName: sesion.displayName,
    photoURL: sesion.photoURL,
    phoneNumber: sesion.phoneNumber,
    identityFactors: { ...FACTORES_VACIOS, googleAuth: true },
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dniEstado, setDniEstado] = useState<EstadoDNI>('verificando');

  const identityFactors = user?.identityFactors || FACTORES_VACIOS;

  // En modo demo el panel admin está abierto para poder probar; con Firebase
  // real solo lo ven los emails configurados (roles formales: RF-015).
  const isAdmin = !hasRealFirebaseConfig()
    ? true
    : Boolean(user?.email && env.adminEmails.includes(user.email.toLowerCase()));

  const loginWithGoogle = async () => {
    const sesion = await authService.signInWithGoogle();
    setUser(aPerfil(sesion));
    // RF-077: registrar el token de push del dispositivo para el usuario.
    registrarTokenPush(sesion.uid).catch(() => {});
  };

  const logout = async () => {
    await cerrarSesion();
    setUser(null);
    setDniEstado('verificando');
  };

  const verifyPhone = async (phoneNumber: string, code: string): Promise<boolean> => {
    const ok = await authService.verifyPhone(phoneNumber, code);
    if (user && ok) {
      setUser({
        ...user,
        phoneNumber,
        identityFactors: { ...user.identityFactors, phoneVerified: true },
      });
    }
    return ok;
  };

  const verifyDNI = async (dniNumber: string): Promise<ResultadoVerificacionDNI> => {
    const resultado = await authService.verifyDNI(dniNumber);
    setDniEstado(resultado.estado);
    if (user && resultado.estado === 'verificado') {
      setUser({
        ...user,
        dniNumber,
        identityFactors: { ...user.identityFactors, dniVerified: true },
      });
    }
    return resultado;
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
        isAdmin,
        identityFactors,
        dniEstado,
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
