/**
 * Verificación de la splash screen responsive.
 * Self-contained: transpila `src/components/splash/layout.ts` con
 * `typescript` (ya es devDependency) y corre la matriz de viewports
 * contra la MISMA fórmula que usa la app — sin duplicar lógica.
 *
 * Uso: `node scripts/verify-splash.js`
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

// --- Archivos esperados ---
const archivos = [
  'src/components/splash/SplashScreen.tsx',
  'src/components/splash/SplashBackground.tsx',
  'src/components/splash/LoadingIndicator.tsx',
  'src/components/splash/layout.ts',
  'src/theme/splash.ts',
  'src/hooks/useAppReady.ts',
  'assets/splash-atenti.jpg',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- Carga el layout real (transpilado desde TS) ---
const ts = require(path.join(root, 'node_modules', 'typescript'));
const layoutPath = path.join(root, 'src', 'components', 'splash', 'layout.ts');
const transpiled = ts.transpileModule(fs.readFileSync(layoutPath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
// eslint-disable-next-line no-new-func
new Function('module', 'exports', 'require', transpiled)(mod, mod.exports, require);
const {
  computeSplashLayout,
  computeSplashBackdrop,
  isSplashCoverMode,
  SOURCE,
  SPINNER,
  COVER_TOLERANCE,
  BACKDROP_OVERSCAN,
} = mod.exports;

assert(typeof computeSplashLayout === 'function', 'layout: exporta computeSplashLayout');
assert(typeof isSplashCoverMode === 'function', 'layout: exporta isSplashCoverMode');
assert(typeof computeSplashBackdrop === 'function', 'layout: exporta computeSplashBackdrop');
assert(SOURCE.width === 941 && SOURCE.height === 1672, 'layout: dimensiones de la imagen 941x1672');
assert(
  typeof BACKDROP_OVERSCAN === 'number' && BACKDROP_OVERSCAN >= 1.1,
  `layout: overscan del backdrop ${BACKDROP_OVERSCAN} >= 1.1`,
);

const IMAGE_ASPECT = SOURCE.width / SOURCE.height;
const EPS = 0.5;

// --- Matriz de viewports: [ancho, alto, etiqueta] ---
const VIEWPORTS = [
  [320, 568, 'iPhone SE clásico'],
  [360, 640, 'Android compacto'],
  [360, 568, 'Android bajo'],
  [375, 667, 'iPhone 8'],
  [390, 844, 'iPhone 14'],
  [414, 896, 'iPhone 11'],
  [412, 915, 'Android grande'],
  [768, 1024, 'iPad vertical'],
  [800, 1280, 'Tablet vertical'],
  [1024, 768, 'iPad apaisado'],
  [1280, 800, 'Laptop 1280'],
  [1366, 768, 'Laptop 1366'],
  [1440, 900, 'Desktop 1440'],
  [1920, 1080, 'Full HD'],
  [2560, 1440, 'QHD'],
  [344, 772, 'Web angosto (celular)'],
];

for (const [w, h, label] of VIEWPORTS) {
  const l = computeSplashLayout(w, h);
  const expectCover = w / h <= IMAGE_ASPECT * COVER_TOLERANCE;

  assert(l.mode === (expectCover ? 'cover' : 'contain'), `${label} ${w}x${h}: modo ${l.mode}`);

  // Sin distorsión: la proporción de la imagen se conserva.
  const displayAspect = l.displayWidth / l.displayHeight;
  assert(
    Math.abs(displayAspect - IMAGE_ASPECT) < 1e-6,
    `${label} ${w}x${h}: sin distorsión (aspect ${displayAspect.toFixed(4)})`,
  );

  // Escala positiva.
  assert(l.scale > 0, `${label} ${w}x${h}: escala ${l.scale.toFixed(4)} > 0`);

  // Imagen dentro de la pantalla en contain / cubriendo en cover.
  if (l.mode === 'contain') {
    assert(
      l.displayWidth <= w + EPS && l.displayHeight <= h + EPS,
      `${label} ${w}x${h}: imagen completa cabe (${l.displayWidth.toFixed(0)}x${l.displayHeight.toFixed(0)})`,
    );

    // Backdrop desenfocado: debe cubrir el 100% de los bordes de la página.
    const b = computeSplashBackdrop(w, h);
    assert(
      b.displayWidth >= w - EPS && b.displayHeight >= h - EPS,
      `${label} ${w}x${h}: backdrop cubre el viewport (${b.displayWidth.toFixed(0)}x${b.displayHeight.toFixed(0)})`,
    );
    assert(
      b.offsetLeft <= EPS && b.offsetTop <= EPS,
      `${label} ${w}x${h}: backdrop sobresale por los costados (offset ${b.offsetLeft.toFixed(0)}, ${b.offsetTop.toFixed(0)})`,
    );
    assert(
      b.scale > l.scale,
      `${label} ${w}x${h}: escala backdrop ${b.scale.toFixed(3)} > escala arte ${l.scale.toFixed(3)}`,
    );
    assert(
      b.scale / (Math.max(w / SOURCE.width, h / SOURCE.height)) >= 1.1,
      `${label} ${w}x${h}: backdrop con overscan real (x${(b.scale / (Math.max(w / SOURCE.width, h / SOURCE.height))).toFixed(2)})`,
    );
  } else {
    assert(
      l.displayWidth >= w - EPS && l.displayHeight >= h - EPS,
      `${label} ${w}x${h}: imagen cubre la pantalla`,
    );
  }

  // El spinner completo debe quedar dentro de la pantalla.
  const half = l.boxSize / 2;
  const dentro =
    l.spinnerCx - half >= -EPS &&
    l.spinnerCx + half <= w + EPS &&
    l.spinnerCy - half >= -EPS &&
    l.spinnerCy + half <= h + EPS;
  assert(
    dentro,
    `${label} ${w}x${h}: spinner visible en (${l.spinnerCx.toFixed(0)}, ${l.spinnerCy.toFixed(0)})`,
  );

  // Legibilidad: el anillo no puede ser diminuto.
  assert(l.boxSize >= 8, `${label} ${w}x${h}: spinner boxSize ${l.boxSize.toFixed(1)} >= 8`);
}

// --- Regresión: el bug original (cover puro) dejaba el spinner fuera ---
const coverPuro = (() => {
  const w = 1920;
  const h = 1080;
  const scale = Math.max(w / SOURCE.width, h / SOURCE.height);
  const offsetTop = (h - SOURCE.height * scale) / 2;
  return offsetTop + SPINNER.cy * scale; // y del spinner con cover puro
})();
assert(coverPuro > 1080, `regresión: cover puro en 1920x1080 dejaba el spinner fuera (y=${coverPuro.toFixed(0)})`);
assert(
  computeSplashLayout(1920, 1080).spinnerCy < 1080,
  'regresión: con el layout nuevo el spinner de 1920x1080 sí está en pantalla',
);

// --- Límite del modo cover (tolerancia 1.15) ---
assert(isSplashCoverMode(390, 844) === true, 'cover en móvil');
assert(isSplashCoverMode(768, 1024) === false, 'contain en tablet vertical');
assert(isSplashCoverMode(1920, 1080) === false, 'contain en escritorio');

// --- Integración en los componentes ---
const splashSrc = fs.readFileSync(path.join(root, 'src/components/splash/SplashScreen.tsx'), 'utf8');
assert(splashSrc.includes('computeSplashLayout'), 'SplashScreen usa computeSplashLayout');
assert(splashSrc.includes('SplashBackground'), 'SplashScreen pinta el letterbox de marca en contain');
assert(splashSrc.includes("require('../../../assets/splash-atenti.jpg')"), 'SplashScreen usa el asset de marca');

const loadingSrc = fs.readFileSync(path.join(root, 'src/components/splash/LoadingIndicator.tsx'), 'utf8');
assert(loadingSrc.includes('useWindowDimensions'), 'LoadingIndicator tiene tamaño responsive');

// Backdrop desenfocado en pantallas anchas.
assert(splashSrc.includes('computeSplashBackdrop'), 'SplashScreen usa computeSplashBackdrop');
assert(splashSrc.includes('BlurView'), 'SplashScreen desenfoca el backdrop con BlurView');
assert(
  splashSrc.includes("mode === 'contain'") && /backdrop &&/.test(splashSrc),
  'SplashScreen solo pinta el backdrop en modo contain',
);
assert(splashSrc.includes('BACKDROP_OVERLAY'), 'SplashScreen aplica el velo navy sobre el backdrop');

// Spinner infinito: sin driver nativo forzado (es lo que lo congelaba en web).
const CODE_NATIVE_DRIVER = /useNativeDriver:\s*true\s*[,}\n]/;
assert(!CODE_NATIVE_DRIVER.test(splashSrc), 'SplashScreen: ningún useNativeDriver:true en código (evita el freeze en web)');
assert(
  splashSrc.includes("Platform.OS !== 'web'"),
  'SplashScreen: USE_NATIVE_DRIVER = Platform.OS !== "web"',
);
assert(!CODE_NATIVE_DRIVER.test(loadingSrc), 'LoadingIndicator: ningún useNativeDriver:true en código');
assert(
  loadingSrc.includes("Platform.OS !== 'web'"),
  'LoadingIndicator: USE_NATIVE_DRIVER = Platform.OS !== "web"',
);

// Continuidad: el splash no se va hasta que todo cargó (`ready`).
assert(splashSrc.includes('ready?: boolean'), 'SplashScreen: expone la prop ready');
assert(
  splashSrc.includes('ready ? durationMs : maxWaitMs'),
  'SplashScreen: el fade espera a `ready` (o a la red de seguridad)',
);
assert(
  splashSrc.includes('SPLASH_MAX_WAIT_MS'),
  'SplashScreen: usa la red de seguridad SPLASH_MAX_WAIT_MS (nunca queda trabado)',
);

const appSrc = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
assert(appSrc.includes('SplashScreen'), 'App monta el SplashScreen animado');
assert(appSrc.includes('preventAutoHideAsync'), 'App mantiene la splash nativa hasta el primer frame');
assert(appSrc.includes('ready={fontsReady}'), 'App: el splash espera a que las fuentes carguen (ready={fontsReady})');

// --- Tokens de marca ---
const themeSrc = fs.readFileSync(path.join(root, 'src/theme/splash.ts'), 'utf8');
for (const [token, valor] of [
  ['navy', '#071653'],
  ['green', '#00E5A0'],
  ['ringGray', '#60739D'],
]) {
  assert(themeSrc.includes(`${token}: '${valor}'`), `Theme: ${token} = ${valor}`);
}

// Tokens del backdrop y de la continuidad del spinner.
for (const token of [
  'BACKDROP_BLUR_INTENSITY',
  'BACKDROP_TINT',
  'BACKDROP_OVERLAY',
  'SPLASH_MAX_WAIT_MS',
]) {
  assert(themeSrc.includes(`export const ${token}`), `Theme: define ${token}`);
}

// expo-blur es la dependencia que hace el desenfoque en native (iOS).
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert(
  typeof pkg.dependencies?.['expo-blur'] === 'string',
  'package.json: incluye expo-blur (desenfoque nativo)',
);

console.log(`\nTOTAL SPLASH: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
