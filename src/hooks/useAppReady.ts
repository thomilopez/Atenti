import { useCallback, useState } from 'react';
import { useFonts } from 'expo-font';

import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_700Bold_Italic } from '@expo-google-fonts/poppins/700Bold_Italic';

/**
 * Punto único de estado de inicialización de la app (Sección 6 del plan).
 *
 * Hoy carga las tipografías Poppins; aquí se enchufarán en el futuro
 * la sesión, configuración remota, o cualquier otro arranque asíncrono.
 * El splash se mantiene visible hasta que `fontsReady` y la animación
 * de salida del splash terminen.
 */
export function useAppReady() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_700Bold_Italic,
  });

  const [introFinished, setIntroFinished] = useState(false);

  const finishIntro = useCallback(() => {
    setIntroFinished(true);
  }, []);

  // Si la fuente falla, no bloquear el acceso a la app.
  const fontsReady = fontsLoaded || fontError !== null;

  return { fontsReady, introFinished, finishIntro };
}
