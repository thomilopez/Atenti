import { registerRootComponent } from 'expo';

import App from './App';
import { patchAlertForWeb } from './src/utils/patchWebAlert';

// En web, Alert.alert de react-native-web es un no-op: lo reemplazamos por
// window.alert/confirm antes de registrar la app (ver patchWebAlert.ts).
patchAlertForWeb();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
