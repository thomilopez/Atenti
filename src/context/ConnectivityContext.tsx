/**
 * Contexto de conectividad (RF-053).
 *
 * Se suscribe a NetInfo y expone `isConnected` para activar el modo offline y
 * mostrar el banner correspondiente. Antes de conocer el estado real se asume
 * conectado para no bloquear la UI.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface ConnectivityContextType {
  isConnected: boolean;
  tipoRed: string | null;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: true,
  tipoRed: null,
});

export const ConnectivityProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [tipoRed, setTipoRed] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((estado) => {
      const conectado = Boolean(estado.isConnected && estado.isInternetReachable !== false);
      setIsConnected(conectado);
      setTipoRed(estado.type ?? null);
    });
    return unsubscribe;
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isConnected, tipoRed }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
