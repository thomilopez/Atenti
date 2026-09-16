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

    const currentPos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = currentPos.coords;

    let address = `Ubicación actual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    let city = 'Ubicación actual';
    let province = '';

    try {
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        const street = item.street ? `${item.street} ${item.streetNumber || ''}`.trim() : '';
        const district = item.district || item.subregion || '';
        city = item.city || item.subregion || 'CABA';
        province = item.region || '';
        address = [street, district, city].filter(Boolean).join(', ') || address;
      }
    } catch {
      // Si el geocoding inverso falla por red, conservamos la dirección con coordenadas
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
