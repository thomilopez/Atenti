/**
 * Servicio de geolocalización (RF-037, RF-038 y dirección manual).
 *
 * Usa expo-location para obtener la ubicación del dispositivo, convertir
 * coordenadas en una dirección y convertir una dirección escrita en
 * coordenadas. Maneja permisos denegados y errores sin romper el flujo.
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
): Promise<Partial<LocationData> | null> {
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
      calle: r.street ?? undefined,
      numero: r.streetNumber ?? undefined,
      localidad: r.city ?? r.subregion ?? undefined,
      provincia: r.region ?? undefined,
      codigoPostal: r.postalCode ?? undefined,
      city: r.city ?? undefined,
      province: r.region ?? undefined,
    };
  } catch (e) {
    console.warn('geocodificarInverso:', e);
    return null;
  }
}

/** Combina coordenadas + dirección en un `LocationData` verificado. */
export async function ubicacionConDireccion(coords: Coordenadas): Promise<LocationData> {
  const geo = await geocodificarInverso(coords);
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    address:
      geo?.address ??
      `Punto fijado (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
    calle: geo?.calle,
    numero: geo?.numero,
    localidad: geo?.localidad,
    provincia: geo?.provincia,
    codigoPostal: geo?.codigoPostal,
    city: geo?.city,
    province: geo?.province,
    verificada: Boolean(geo),
  };
}

/** Convierte una dirección escrita en coordenadas (geocodificación directa). */
export async function geocodificarDireccion(
  direccion: string
): Promise<LocationData | null> {
  const texto = direccion.trim();
  if (!texto) return null;
  try {
    const resultados = await Location.geocodeAsync(texto);
    const r = resultados[0];
    if (!r) return null;
    const base = await ubicacionConDireccion({
      latitude: r.latitude,
      longitude: r.longitude,
    });
    return {
      ...base,
      address: texto,
      verificada: true,
    };
  } catch (e) {
    console.warn('geocodificarDireccion:', e);
    return null;
  }
}

/** Compone la dirección legible a partir de los campos. */
export function componerDireccion(loc: LocationData): string {
  const calleNumero = [loc.calle, loc.numero].filter(Boolean).join(' ');
  const partes = [calleNumero, loc.localidad, loc.provincia, loc.codigoPostal].filter(Boolean);
  return partes.length > 0 ? partes.join(', ') : loc.address;
}
