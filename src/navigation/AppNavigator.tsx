import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { P1_HomeScreen } from '../screens/P1_HomeScreen';
import { P2_ReportDetailScreen } from '../screens/P2_ReportDetailScreen';
import { P3_LegalAuthScreen } from '../screens/P3_LegalAuthScreen';
import { P4_CreateReportScreen } from '../screens/P4_CreateReportScreen';
import { P5_OCRValidationScreen } from '../screens/P5_OCRValidationScreen';
import { P6_ValidationErrorScreen } from '../screens/P6_ValidationErrorScreen';
import { P7_OfflineModal } from '../screens/P7_OfflineModal';
import { P8_ConfirmationScreen } from '../screens/P8_ConfirmationScreen';
import { P9_CredibilityPanelScreen } from '../screens/P9_CredibilityPanelScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="P1_Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* P1 - Buscador Anónimo (Home / HomeScreen) */}
        <Stack.Screen name="P1_Home" component={P1_HomeScreen} />

        {/* P2 - Detalle de Incidencia (ReportDetailScreen) */}
        <Stack.Screen name="P2_ReportDetail" component={P2_ReportDetailScreen} />

        {/* P3 - Gate Login & DDJJ (LegalAuthScreen) */}
        <Stack.Screen
          name="P3_LegalAuth"
          component={P3_LegalAuthScreen}
          options={{ presentation: 'modal' }}
        />

        {/* P4 - Formulario de Denuncia - Paso 1 (CreateReportScreen) */}
        <Stack.Screen name="P4_CreateReport" component={P4_CreateReportScreen} />

        {/* P5 - Evidencias y Procesamiento - Paso 2 (OCRValidationScreen) */}
        <Stack.Screen name="P5_OCRValidation" component={P5_OCRValidationScreen} />

        {/* P6 - Error de Validación (ValidationErrorScreen) */}
        <Stack.Screen name="P6_ValidationError" component={P6_ValidationErrorScreen} />

        {/* P7 - Falla Técnica / Offline (OfflineModal) */}
        <Stack.Screen
          name="P7_OfflineModal"
          component={P7_OfflineModal}
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />

        {/* P8 - Confirmación de Envío (ConfirmationScreen) */}
        <Stack.Screen name="P8_Confirmation" component={P8_ConfirmationScreen} />

        {/* P9 - Panel 'Mi Credibilidad' (CredibilityPanelScreen) */}
        <Stack.Screen name="P9_CredibilityPanel" component={P9_CredibilityPanelScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
