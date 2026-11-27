/**
 * Verificación del layout centrado para pantalla ancha (desktop / tablet).
 * Self-contained (no importa TS) para correr con `node scripts/verify-centered.js`.
 */
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(cond, name) {
  if (cond) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    failed++;
  }
}

const root = path.join(__dirname, '..');

// 1. src/hooks/useResponsive.ts exporta useCentro
const useResponsivePath = path.join(root, 'src/hooks/useResponsive.ts');
assert(fs.existsSync(useResponsivePath), 'Existe src/hooks/useResponsive.ts');
const useResponsiveContent = fs.readFileSync(useResponsivePath, 'utf8');
assert(
  useResponsiveContent.includes('export function useCentro('),
  'src/hooks/useResponsive.ts exporta useCentro'
);

// 2. Lista completa de 26 pantallas del plan + 4 pantallas base
const screens = [
  // Grupo 1: ScrollView (16)
  'src/screens/P2_ReportDetailScreen.tsx',
  'src/screens/P12_EditReportScreen.tsx',
  'src/screens/P14_AdminDashboardScreen.tsx',
  'src/screens/P15_AdminDisputeScreen.tsx',
  'src/screens/P16_AdminCategoriesScreen.tsx',
  'src/screens/P17_AdminUsersScreen.tsx',
  'src/screens/P18_AdminAuditScreen.tsx',
  'src/screens/P20_SettingsScreen.tsx',
  'src/screens/P21_ImpugnacionScreen.tsx',
  'src/screens/P22_DisputeStatusScreen.tsx',
  'src/screens/P23_LegalScreen.tsx',
  'src/screens/P24_RightToBeForgottenScreen.tsx',
  'src/screens/P29_CreateStoryScreen.tsx',
  'src/screens/P30_MyStoriesScreen.tsx',
  'src/screens/P32_StoryModerationScreen.tsx',
  'src/screens/P33_CommunityGuidelinesScreen.tsx',

  // Grupo 2: FlatList (4)
  'src/screens/P10_MisDenunciasScreen.tsx',
  'src/screens/P13_SearchResultsScreen.tsx',
  'src/screens/P19_NotificationCenterScreen.tsx',
  'src/screens/P25_AuditLogScreen.tsx',

  // Grupo 3: Sin scroll (4)
  'src/screens/P3_LegalAuthScreen.tsx',
  'src/screens/P8_ConfirmationScreen.tsx',
  'src/screens/P11_TrackingCodeScreen.tsx',
  'src/screens/P26_NotificationPreferencesScreen.tsx',

  // Grupo 4: Pie de acción (P28)
  'src/screens/P28_StoryDetailScreen.tsx',

  // Grupo 5: Especiales (P31)
  'src/screens/P31_FullMapScreen.tsx',

  // Pantallas base ya centradas (P4, P5, P9, P27)
  'src/screens/P4_CreateReportScreen.tsx',
  'src/screens/P5_OCRValidationScreen.tsx',
  'src/screens/P9_CredibilityPanelScreen.tsx',
  'src/screens/P27_StoriesFeedScreen.tsx',
];

for (const s of screens) {
  const fullPath = path.join(root, s);
  assert(fs.existsSync(fullPath), `Existe ${s}`);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Cada pantalla importa useCentro
  assert(
    content.includes('useCentro'),
    `${path.basename(s)} importa useCentro`
  );

  // Aplica centro en contentContainerStyle o style
  const appliesCentro =
    content.includes('contentContainerStyle={[') ||
    content.includes('style={[styles.container, centro]') ||
    content.includes('style={[styles.content, centro]') ||
    content.includes('style={[styles.centerBody, centro]') ||
    content.includes('style={centro}') ||
    s.includes('P31_FullMapScreen.tsx'); // P31 aplica centro en su navBar y mantiene mapa full-bleed
  assert(
    appliesCentro,
    `${path.basename(s)} aplica centro en contenido`
  );
}

// 3. Pantallas con navBar tienen navBarInner y justifyContent: 'center' (24 pantallas del plan + P4, P5, P27)
const screensWithNavBar = [
  'src/screens/P2_ReportDetailScreen.tsx',
  'src/screens/P12_EditReportScreen.tsx',
  'src/screens/P14_AdminDashboardScreen.tsx',
  'src/screens/P15_AdminDisputeScreen.tsx',
  'src/screens/P16_AdminCategoriesScreen.tsx',
  'src/screens/P17_AdminUsersScreen.tsx',
  'src/screens/P18_AdminAuditScreen.tsx',
  'src/screens/P20_SettingsScreen.tsx',
  'src/screens/P21_ImpugnacionScreen.tsx',
  'src/screens/P22_DisputeStatusScreen.tsx',
  'src/screens/P23_LegalScreen.tsx',
  'src/screens/P24_RightToBeForgottenScreen.tsx',
  'src/screens/P29_CreateStoryScreen.tsx',
  'src/screens/P30_MyStoriesScreen.tsx',
  'src/screens/P32_StoryModerationScreen.tsx',
  'src/screens/P33_CommunityGuidelinesScreen.tsx',
  'src/screens/P10_MisDenunciasScreen.tsx',
  'src/screens/P13_SearchResultsScreen.tsx',
  'src/screens/P19_NotificationCenterScreen.tsx',
  'src/screens/P25_AuditLogScreen.tsx',
  'src/screens/P11_TrackingCodeScreen.tsx',
  'src/screens/P26_NotificationPreferencesScreen.tsx',
  'src/screens/P28_StoryDetailScreen.tsx',
  'src/screens/P31_FullMapScreen.tsx',
  'src/screens/P4_CreateReportScreen.tsx',
  'src/screens/P5_OCRValidationScreen.tsx',
  'src/screens/P27_StoriesFeedScreen.tsx',
];

for (const s of screensWithNavBar) {
  const fullPath = path.join(root, s);
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(
    content.includes('navBarInner'),
    `${path.basename(s)} navBar envuelta en navBarInner`
  );

  assert(
    content.includes("justifyContent: 'center'") || content.includes('justifyContent: "center"'),
    `${path.basename(s)} navBar exterior tiene justifyContent: 'center'`
  );
}

// 4. Verificaciones específicas de reglas
// P10: filters con centro directo
const p10Content = fs.readFileSync(path.join(root, 'src/screens/P10_MisDenunciasScreen.tsx'), 'utf8');
assert(p10Content.includes('style={[styles.filters, centro]}'), 'P10: filters con centro directo');

// P13: searchBox dentro de bloque centrado
const p13Content = fs.readFileSync(path.join(root, 'src/screens/P13_SearchResultsScreen.tsx'), 'utf8');
assert(p13Content.includes('<View style={centro}>') && p13Content.includes('styles.searchBox'), 'P13: searchBox dentro de View centrado');

// P19: toolbar con centro directo
const p19Content = fs.readFileSync(path.join(root, 'src/screens/P19_NotificationCenterScreen.tsx'), 'utf8');
assert(p19Content.includes('style={[styles.toolbar, centro]}'), 'P19: toolbar con centro directo');

// P28: reportBtn con centro directo y footer con footerInner
const p28Content = fs.readFileSync(path.join(root, 'src/screens/P28_StoryDetailScreen.tsx'), 'utf8');
assert(p28Content.includes('style={[styles.reportBtn, centro]}'), 'P28: reportBtn con centro directo');
assert(p28Content.includes('footerInner'), 'P28: footer envuelto en footerInner');

// P2: footer con footerInner
const p2Content = fs.readFileSync(path.join(root, 'src/screens/P2_ReportDetailScreen.tsx'), 'utf8');
assert(p2Content.includes('footerInner'), 'P2: footer envuelto en footerInner');

console.log(`\nTOTAL CENTRO: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) {
  process.exit(1);
}
