import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { P0_WelcomeScreen } from '../screens/P0_WelcomeScreen';
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
import { P14_AdminDashboardScreen } from '../screens/P14_AdminDashboardScreen';
import { P15_AdminDisputeScreen } from '../screens/P15_AdminDisputeScreen';
import { P16_AdminCategoriesScreen } from '../screens/P16_AdminCategoriesScreen';
import { P17_AdminUsersScreen } from '../screens/P17_AdminUsersScreen';
import { P18_AdminAuditScreen } from '../screens/P18_AdminAuditScreen';
import { P19_NotificationCenterScreen } from '../screens/P19_NotificationCenterScreen';
import { P20_SettingsScreen } from '../screens/P20_SettingsScreen';
import { P21_ImpugnacionScreen } from '../screens/P21_ImpugnacionScreen';
import { P22_DisputeStatusScreen } from '../screens/P22_DisputeStatusScreen';
import { P23_LegalScreen } from '../screens/P23_LegalScreen';
import { P24_RightToBeForgottenScreen } from '../screens/P24_RightToBeForgottenScreen';
import { P25_AuditLogScreen } from '../screens/P25_AuditLogScreen';
import { P26_NotificationPreferencesScreen } from '../screens/P26_NotificationPreferencesScreen';
import { P31_FullMapScreen } from '../screens/P31_FullMapScreen';
import { P27_StoriesFeedScreen } from '../screens/P27_StoriesFeedScreen';
import { P28_StoryDetailScreen } from '../screens/P28_StoryDetailScreen';
import { P29_CreateStoryScreen } from '../screens/P29_CreateStoryScreen';
import { P30_MyStoriesScreen } from '../screens/P30_MyStoriesScreen';
import { P32_StoryModerationScreen } from '../screens/P32_StoryModerationScreen';
import { P33_CommunityGuidelinesScreen } from '../screens/P33_CommunityGuidelinesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="P0_Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* P0 - Bienvenida (logo + eslogan) */}
        <Stack.Screen name="P0_Welcome" component={P0_WelcomeScreen} />

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

        {/* Administración */}
        <Stack.Screen name="P14_AdminDashboard" component={P14_AdminDashboardScreen} />
        <Stack.Screen name="P15_AdminDispute" component={P15_AdminDisputeScreen} />
        <Stack.Screen name="P16_AdminCategories" component={P16_AdminCategoriesScreen} />
        <Stack.Screen name="P17_AdminUsers" component={P17_AdminUsersScreen} />
        <Stack.Screen name="P18_AdminAudit" component={P18_AdminAuditScreen} />

        {/* Notificaciones */}
        <Stack.Screen name="P19_NotificationCenter" component={P19_NotificationCenterScreen} />

        {/* P20 - Ajustes */}
        <Stack.Screen name="P20_Settings" component={P20_SettingsScreen} />

        {/* Impugnaciones */}
        <Stack.Screen name="P21_Impugnacion" component={P21_ImpugnacionScreen} />
        <Stack.Screen name="P22_DisputeStatus" component={P22_DisputeStatusScreen} />

        {/* Legal */}
        <Stack.Screen name="P23_Legal" component={P23_LegalScreen} />
        <Stack.Screen name="P24_RightToBeForgotten" component={P24_RightToBeForgottenScreen} />
        <Stack.Screen name="P25_AuditLog" component={P25_AuditLogScreen} />
        <Stack.Screen name="P26_NotificationPreferences" component={P26_NotificationPreferencesScreen} />

        {/* Mapa completo */}
        <Stack.Screen name="P31_FullMap" component={P31_FullMapScreen} />

        {/* Relatos de estafas */}
        <Stack.Screen name="P27_StoriesFeed" component={P27_StoriesFeedScreen} />
        <Stack.Screen name="P28_StoryDetail" component={P28_StoryDetailScreen} />
        <Stack.Screen name="P29_CreateStory" component={P29_CreateStoryScreen} />
        <Stack.Screen name="P30_MyStories" component={P30_MyStoriesScreen} />
        <Stack.Screen name="P32_StoryModeration" component={P32_StoryModerationScreen} />
        <Stack.Screen name="P33_CommunityGuidelines" component={P33_CommunityGuidelinesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
