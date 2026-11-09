/**
 * Contexto Global de Autenticación e Identidad (Atenti)
 * Gestiona la sesión real de Firebase Auth / Google y los estados de
 * verificación de identidad para RG-07.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { UserIdentityFactors, UserProfile } from '../types';
import { env, hasRealFirebaseConfig } from '../services/env';
import {
  auth,
  authService,
  SesionUsuario,
  EstadoDNI,
  ResultadoVerificacionDNI,
  logout as cerrarSesion,
} from '../services/authService';
import { db } from '../services/firebase';
import { registrarTokenPush } from '../services/pushService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** Acceso temporal al panel admin (RF-015 pendiente). */
  isAdmin: boolean;
  identityFactors: UserIdentityFactors;
  dniEstado: EstadoDNI;
  loginWithGoogle: () => Promise<UserProfile>;
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
    // Sesión anónima (fallback Expo Go): no se otorga el factor Google (+15 pts).
    identityFactors: { ...FACTORES_VACIOS, googleAuth: !sesion.anonima },
  };
}

async function persistirPerfil(perfil: UserProfile): Promise<void> {
  if (!hasRealFirebaseConfig()) return;
  try {
    await setDoc(
      doc(db, 'usuarios', perfil.uid),
      {
        email: perfil.email,
        displayName: perfil.displayName,
        phoneNumber: perfil.phoneNumber ?? null,
        dniNumber: perfil.dniNumber ?? null,
        identityFactors: perfil.identityFactors,
        _serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('persistirPerfil: no se pudo guardar en Firestore:', e);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dniEstado, setDniEstado] = useState<EstadoDNI>('verificando');
  // En modo demo el panel admin esta abierto; con Firebase manda el claim.
  const [isAdmin, setIsAdmin] = useState(!hasRealFirebaseConfig());

  const identityFactors = user?.identityFactors || FACTORES_VACIOS;

  const aplicarClaimAdmin = async (perfil: UserProfile) => {
    const porEmail = Boolean(perfil.email && env.adminEmails.includes(perfil.email.toLowerCase()));
    try {
      const token = await auth.currentUser?.getIdTokenResult();
      setIsAdmin(
        token?.claims.admin === true || token?.claims.rol === 'U4' || porEmail
      );
    } catch {
      setIsAdmin(porEmail);
    }
  };

  useEffect(() => {
    if (!hasRealFirebaseConfig()) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setIsAdmin(false);
        return;
      }
      const sesion: SesionUsuario = {
        uid: fbUser.uid,
        email: fbUser.email ?? '',
        displayName: fbUser.displayName ?? '',
        photoURL: fbUser.photoURL ?? undefined,
        phoneNumber: fbUser.phoneNumber ?? undefined,
        anonima: !fbUser.providerData.some((p) => p.providerId === 'google.com'),
      };
      const perfil = aPerfil(sesion);
      try {
        const snap = await getDoc(doc(db, 'usuarios', fbUser.uid));
        if (snap.exists()) {
          const data = snap.data() as Partial<UserProfile>;
          perfil.identityFactors = {
            ...perfil.identityFactors,
            ...(data.identityFactors ?? {}),
          };
          perfil.phoneNumber = data.phoneNumber ?? perfil.phoneNumber;
          perfil.dniNumber = data.dniNumber;
        }
      } catch (e) {
        console.warn('AuthContext: no se pudo leer el perfil:', e);
      }
      setUser(perfil);
      await aplicarClaimAdmin(perfil);
      registrarTokenPush(fbUser.uid).catch(() => {});
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const sesion = await authService.signInWithGoogle();
    const perfil = aPerfil(sesion);
    setUser(perfil);
    await persistirPerfil(perfil);
    await aplicarClaimAdmin(perfil);
    // RF-077: registrar el token de push del dispositivo para el usuario.
    registrarTokenPush(sesion.uid).catch(() => {});
    return perfil;
  };

  const logout = async () => {
    await cerrarSesion();
    setUser(null);
    setIsAdmin(false);
    setDniEstado('verificando');
  };

  const verifyPhone = async (phoneNumber: string, code: string): Promise<boolean> => {
    const ok = await authService.verifyPhone(phoneNumber, code);
    if (user && ok) {
      const next: UserProfile = {
        ...user,
        phoneNumber,
        identityFactors: { ...user.identityFactors, phoneVerified: true },
      };
      setUser(next);
      await persistirPerfil(next);
    }
    return ok;
  };

  const verifyDNI = async (dniNumber: string): Promise<ResultadoVerificacionDNI> => {
    const resultado = await authService.verifyDNI(dniNumber);
    setDniEstado(resultado.estado);
    if (user && resultado.estado === 'verificado') {
      const next: UserProfile = {
        ...user,
        dniNumber,
        identityFactors: { ...user.identityFactors, dniVerified: true },
      };
      setUser(next);
      await persistirPerfil(next);
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
        isAuthenticated: Boolean(user),
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
