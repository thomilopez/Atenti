/**
 * Servicio de geolocalización (RF-037, RF-038).
 *
 * Usa expo-location para obtener la ubicación del dispositivo y convertir
 * coordenadas en una dirección postal legible. Maneja permisos denegados y
 * errores sin romper el flujo.
 */
import * as Location from 'expo-location';
import { LocationData } from '../types';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

/** Pide permiso y devuelve la ubicación actual, o null si no se puede. */
export async function obtenerUbicacionActual(): Promise<Coordenadas | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: posicion.coords.latitude,
      longitude: posicion.coords.longitude,
    };
  } catch (e) {
    console.warn('obtenerUbicacionActual:', e);
    return null;
  }
}

/** Convierte coordenadas en dirección postal (geocodificación inversa). */
export async function geocodificarInverso(
  coords: Coordenadas
): Promise<Pick<LocationData, 'address' | 'city' | 'province'> | null> {
  try {
    const resultados = await Location.reverseGeocodeAsync(coords);
    const r = resultados[0];
    if (!r) return null;
    const partes = [r.street, r.streetNumber, r.district ?? r.subregion, r.city].filter(
      Boolean
    );
    return {
      address:
        partes.length > 0
          ? partes.join(', ')
          : `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
      city: r.city ?? undefined,
      province: r.region ?? undefined,
    };
  } catch (e) {
    console.warn('geocodificarInverso:', e);
    return null;
  }
}

/** Combina coordenadas + dirección en un `LocationData`. */
export async function ubicacionConDireccion(coords: Coordenadas): Promise<LocationData> {
  const geo = await geocodificarInverso(coords);
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    address:
      geo?.address ??
      `Punto fijado (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
    city: geo?.city,
    province: geo?.province,
  };
}
