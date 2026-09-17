/**
 * Atenti - Servicio de Geolocalización (expo-location)
 * Solicitud de permisos en tiempo de ejecución, obtención de coordenadas actuales y fallbacks seguros.
 */

import * as Location from 'expo-location';
import { LocationData } from '../types';

export const DEFAULT_BUENOS_AIRES_LOCATION: LocationData = {
  latitude: -34.6037,
  longitude: -58.3816,
  address: 'CABA, Buenos Aires, Argentina',
  city: 'Ciudad Autónoma de Buenos Aires',
  province: 'Buenos Aires',
};

export interface LocationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

/**
 * Solicita permisos de ubicación en primer plano de manera amigable.
 */
export const requestLocationPermissions = async (): Promise<LocationPermissionResult> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === Location.PermissionStatus.GRANTED,
      canAskAgain,
      status,
    };
  } catch (error) {
    console.warn('Error solicitando permisos de ubicación:', error);
    return {
      granted: false,
      canAskAgain: true,
      status: Location.PermissionStatus.DENIED,
    };
  }
};

/**
 * Verifica el estado actual de los permisos de ubicación sin solicitarlos si no se desea.
 */
export const checkLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.warn('Error verificando permisos de ubicación:', error);
    return false;
  }
};

/**
 * Función auxiliar para limitar el tiempo de espera de una promesa.
 */
const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutErrorMsg: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutErrorMsg)), ms)
    ),
  ]);
};

/**
 * Obtiene la ubicación actual del usuario con reverse geocoding amigable.
 * Si falla o se rechaza el permiso, retorna las coordenadas predeterminadas de CABA.
 */
export const getCurrentUserLocation = async (): Promise<{
  location: LocationData;
  isRealLocation: boolean;
}> => {
  try {
    const permission = await requestLocationPermissions();
    if (!permission.granted) {
      return {
        location: DEFAULT_BUENOS_AIRES_LOCATION,
        isRealLocation: false,
      };
    }

    // Intentar primero obtener la última posición conocida (rápida, sin esperar sincronización de satélites)
    let coords: { latitude: number; longitude: number } | null = null;
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown && lastKnown.coords) {
        coords = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
      }
    } catch {
      // Continuar con getCurrentPositionAsync si falla
    }

    // Si no había posición conocida o para actualizar, obtener la actual con timeout de 4 segundos
    if (!coords) {
      const currentPos = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        4000,
        'Timeout obteniendo posición actual'
      );
      coords = {
        latitude: currentPos.coords.latitude,
        longitude: currentPos.coords.longitude,
      };
    }

    const { latitude, longitude } = coords;

    let address = `Ubicación actual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    let city = 'Ubicación actual';
    let province = '';

    try {
      // Reverse geocoding con timeout de 3 segundos para evitar bloqueos de red
      const reverse = await withTimeout(
        Location.reverseGeocodeAsync({ latitude, longitude }),
        3000,
        'Timeout en geocodificación inversa'
      );
      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        const street = item.street ? `${item.street} ${item.streetNumber || ''}`.trim() : '';
        const district = item.district || item.subregion || '';
        city = item.city || item.subregion || 'CABA';
        province = item.region || '';
        address = [street, district, city].filter(Boolean).join(', ') || address;
      }
    } catch {
      // Si el geocoding inverso falla o expira por red, conservamos la dirección con coordenadas
    }

    return {
      location: {
        latitude,
        longitude,
        address,
        city,
        province,
      },
      isRealLocation: true,
    };
  } catch (error) {
    console.warn('No se pudo obtener la posición actual, usando fallback:', error);
    return {
      location: DEFAULT_BUENOS_AIRES_LOCATION,
      isRealLocation: false,
    };
  }
};
