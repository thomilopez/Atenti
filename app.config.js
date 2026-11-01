/**
 * Configuración dinámica de Expo.
 *
 * Inyecta la API key de Google Maps desde el entorno para no commitearla en
 * `app.json`. El resto de la configuración se toma de `app.json`.
 *
 * Locales: se carga desde `.env` (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`).
 * EAS: definí la variable en el entorno del proyecto.
 */
const { expo } = require('./app.json');

const mapsKey = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '').trim();

module.exports = {
  ...expo,
  ios: {
    ...expo.ios,
    config: mapsKey
      ? { ...(expo.ios?.config ?? {}), googleMapsApiKey: mapsKey }
      : { ...(expo.ios?.config ?? {}) },
  },
  android: {
    ...expo.android,
    config: mapsKey
      ? { ...(expo.android?.config ?? {}), googleMaps: { apiKey: mapsKey } }
      : { ...(expo.android?.config ?? {}) },
  },
};
