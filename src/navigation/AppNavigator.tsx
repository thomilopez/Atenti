import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { P1_HomeScreen } from '../screens/P1_HomeScreen';
import { P2_ReportDetailScreen } from '../screens/P2_ReportDetailScreen';
import { P3_LegalAuthScreen } from '../screens/P3_LegalAuthScreen';
import { P4_CreateReportScreen } from '../screens/P4_CreateReportScreen';
import { P5_OCRValidationScreen } from '../screens/P5_OCRValidationScreen';
import { P7_OfflineModal } from '../screens/P7_OfflineModal';
import { P8_ConfirmationScreen } from '../screens/P8_ConfirmationScreen';
import { P9_CredibilityPanelScreen } from '../screens/P9_CredibilityPanelScreen';
import { P10_MisDenunciasScreen } from '../screens/P10_MisDenunciasScreen';
import { P11_TrackingCodeScreen } from '../screens/P11_TrackingCodeScreen';
import { P12_EditReportScreen } from '../screens/P12_EditReportScreen';
import { P13_SearchResultsScreen } from '../screens/P13_SearchResultsScreen';
import { P20_SettingsScreen } from '../screens/P20_SettingsScreen';

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

        {/* P10 - Mis Denuncias */}
        <Stack.Screen name="P10_MisDenuncias" component={P10_MisDenunciasScreen} />

        {/* P11 - Consulta pública por código */}
        <Stack.Screen name="P11_TrackingCode" component={P11_TrackingCodeScreen} />

        {/* P12 - Editar denuncia (ventana 24hs) */}
        <Stack.Screen name="P12_EditReport" component={P12_EditReportScreen} />

        {/* P13 - Resultados de búsqueda con filtros y paginación */}
        <Stack.Screen name="P13_SearchResults" component={P13_SearchResultsScreen} />

        {/* P20 - Ajustes */}
        <Stack.Screen name="P20_Settings" component={P20_SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
