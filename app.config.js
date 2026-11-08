/**
 * Configuración dinámica de Expo.
 *
 * Inyecta la API key de Google Maps desde el entorno para no commitearla en
 * `app.json`. El resto de la configuración se toma del contexto que Expo
 * pasa a la función (`context.config`), que es el `app.json` con sus
 * valores por defecto ya resueltos.
 *
 * IMPORTANTE: debe exportarse como FUNCIÓN que recibe el contexto y hace
 * spread de `context.config`. Expo marca ese objeto con un símbolo interno
 * para verificar que el config estático fue realmente usado; si se exporta
 * un objeto plano, expo-doctor falla en "Check Expo config for common
 * issues" aunque se hayan leído los valores por otro medio.
 *
 * Locales: se carga desde `.env` (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`).
 * EAS: definí la variable en el entorno del proyecto.
 */
module.exports = ({ config }) => {
  const mapsKey = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '').trim();

  return {
    ...config,
    ios: {
      ...config.ios,
      config: mapsKey
        ? { ...(config.ios?.config ?? {}), googleMapsApiKey: mapsKey }
        : { ...(config.ios?.config ?? {}) },
    },
    android: {
      ...config.android,
      config: mapsKey
        ? { ...(config.android?.config ?? {}), googleMaps: { apiKey: mapsKey } }
        : { ...(config.android?.config ?? {}) },
    },
  };
};
