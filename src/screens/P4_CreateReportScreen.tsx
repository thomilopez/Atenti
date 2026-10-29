import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdentifierType, IncidentCategory, LocationData, RootStackParamList } from '../types';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { MapPickerModal } from '../components/MapPickerModal';
import { useReportFlow } from '../context/ReportFlowContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { validarCbu, validarCuit, validarTelefonoE164, CATEGORIAS, CategoriaTipo } from '../services/normalize';
import { listarCategoriasActivas } from '../services/categoryService';
import {
  obtenerUbicacionActual,
  ubicacionConDireccion,
  geocodificarDireccion,
  componerDireccion,
} from '../services/locationService';
import { filtrarTexto, contieneLenguajeOfensivo } from '../services/lexiconFilter';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<RootStackParamList, 'P4_CreateReport'>;

const IDENTIFIER_TYPES: IdentifierType[] = ['Alias', 'CBU', 'CUIT', 'Tel', 'Local'];

export const P4_CreateReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    category,
    setCategory,
    identifierType,
    setIdentifierType,
    identifierValue,
    setIdentifierValue,
    story,
    setStory,
    location,
    setLocation,
    pinConfirmado,
    setPinConfirmado,
    credibilityScore,
    saveCurrentDraft,
  } = useReportFlow();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [identifierDropdownOpen, setIdentifierDropdownOpen] = useState(false);
  const { mapPickerHeight } = useResponsive();
  const [categorias, setCategorias] = useState<CategoriaTipo[]>(CATEGORIAS.map((c) => ({ ...c })));
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [direccionQuery, setDireccionQuery] = useState(location.address);

  const validationError = route.params?.validationError;
  const categoriaSeleccionada = categorias.find((c) => c.nombre === category);
  const requiereUbicacion = Boolean(categoriaSeleccionada?.requiereUbicacion);
  const relatoValido = story.trim().length >= 20;

  useEffect(() => {
    listarCategoriasActivas()
      .then((activas) => setCategorias(activas))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (route.params?.prefilledIdentifier) {
      setIdentifierType(route.params.prefilledIdentifier.type);
      setIdentifierValue(route.params.prefilledIdentifier.value);
    }
  }, [route.params]);

  const handleMiUbicacion = async () => {
    const coords = await obtenerUbicacionActual();
    if (!coords) {
      Alert.alert(
        'Ubicación no disponible',
        'No pudimos obtener tu ubicación. Revisá los permisos del dispositivo.'
      );
      return;
    }
    const conDireccion = await ubicacionConDireccion(coords);
    setLocation(conDireccion);
    setPinConfirmado(true);
    setDireccionQuery(conDireccion.address);
  };

  const handleBuscarDireccion = async () => {
    if (!direccionQuery.trim()) {
      Alert.alert('Dirección vacía', 'Ingresá una dirección para buscar.');
      return;
    }
    const loc = await geocodificarDireccion(direccionQuery);
    if (!loc) {
      // Sin red o sin resultado: se guarda el texto como "sin verificar".
      setLocation({ ...location, address: direccionQuery.trim(), verificada: false });
      setPinConfirmado(false);
      Alert.alert(
        'Dirección sin verificar',
        'No pudimos geocodificar la dirección. Se guardó como texto; fijá el pin en el mapa para confirmar la ubicación.'
      );
      return;
    }
    setLocation(loc);
    setPinConfirmado(true);
    setDireccionQuery(loc.address);
  };

  const actualizarCampo = (
    campo: 'calle' | 'numero' | 'localidad' | 'provincia' | 'codigoPostal' | 'referencia',
    valor: string
  ) => {
    const next: LocationData = { ...location, [campo]: valor };
    if (campo === 'localidad') next.city = valor;
    if (campo === 'provincia') next.province = valor;
    setLocation({ ...next, address: componerDireccion(next) });
  };

  const handleNext = async () => {
    // RF-088: el CBU debe tener 22 dígitos y checksum válido.
    if (identifierType === 'CBU' && !validarCbu(identifierValue)) {
      await saveCurrentDraft();
      navigation.replace('P4_CreateReport', {
        validationError: {
          field: 'CBU',
          message: 'Ingresá un CBU válido. Tus demás datos se guardaron',
          invalidValue: identifierValue,
        },
      });
      return;
    }

    // RF-088b: el CUIT debe tener 11 dígitos y checksum AFIP válido.
    if (identifierType === 'CUIT' && !validarCuit(identifierValue)) {
      Alert.alert(
        'CUIT inválido',
        'Ingresá un CUIT de 11 dígitos con dígito verificador válido.'
      );
      return;
    }

    // RF-089: el teléfono debe quedar en formato E.164.
    if (identifierType === 'Tel' && !validarTelefonoE164(identifierValue)) {
      Alert.alert(
        'Teléfono inválido',
        'Ingresá un teléfono argentino válido (podés usar 0, 15 o +54).'
      );
      return;
    }

    if (!identifierValue.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el identificador denunciado.');
      return;
    }

    if (!story.trim()) {
      Alert.alert('Relato requerido', 'Contanos brevemente qué ocurrió.');
      return;
    }

    // RG-02: relato mínimo de 20 caracteres.
    if (story.trim().length < 20) {
      Alert.alert('Relato muy corto', 'El relato debe tener al menos 20 caracteres.');
      return;
    }

    // RG-03: las categorías con ubicación obligatoria exigen pin o dirección verificada.
    if (requiereUbicacion && !pinConfirmado && !location.verificada) {
      Alert.alert(
        'Ubicación requerida',
        'Para esta categoría tenés que fijar el pin sobre el mapa o buscar una dirección.'
      );
      return;
    }

    await saveCurrentDraft();
    navigation.navigate('P5_OCRValidation');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Crear reporte</Text>
        <TouchableOpacity
          onPress={async () => {
            await saveCurrentDraft();
            Alert.alert('Borrador Guardado', 'Se guardó en el almacenamiento local.');
          }}
          style={styles.saveDraftBtn}
        >
          <Ionicons name="save-outline" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cuerpo: Dos cajas desplegables (Categoría, Tipo de Identificador) */}
        
        {/* Caja desplegable 1: Categoría */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>¿Qué quieres reportar?</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setIdentifierDropdownOpen(false);
            }}
          >
            <View style={styles.dropdownValueRow}>
              <Ionicons
                name={(categoriaSeleccionada?.icono ?? 'pricetag-outline') as any}
                size={16}
                color={categoriaSeleccionada?.color ?? '#0F172A'}
              />
              <Text style={styles.dropdownText}>{category}</Text>
            </View>
            <Ionicons
              name={categoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {categoryDropdownOpen && (
            <View style={styles.dropdownOptions}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.optionItem}
                  onPress={() => {
                    setCategory(cat.nombre);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <View style={styles.optionRow}>
                    <Ionicons
                      name={(cat.icono ?? 'pricetag-outline') as any}
                      size={16}
                      color={cat.color ?? '#0F172A'}
                    />
                    <Text style={[styles.optionText, category === cat.nombre && styles.optionTextSelected]}>
                      {cat.nombre}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Caja desplegable 2: Tipo de Identificador */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tipo de identificador</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => {
              setIdentifierDropdownOpen(!identifierDropdownOpen);
              setCategoryDropdownOpen(false);
            }}
          >
            <Text style={styles.dropdownText}>[{identifierType}]</Text>
            <Ionicons
              name={identifierDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {identifierDropdownOpen && (
            <View style={styles.dropdownOptions}>
              {IDENTIFIER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.optionItem}
                  onPress={() => {
                    setIdentifierType(type);
                    setIdentifierDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, identifierType === type && styles.optionTextSelected]}>
                    [{type}] {type === 'Alias' ? '(ej: ju.mp)' : type === 'CBU' ? '(22 dígitos)' : type === 'CUIT' ? '(11 dígitos)' : type === 'Tel' ? '(Celular)' : '(Dirección)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Input del valor del Identificador */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Identificador afectado</Text>
          <View style={validationError ? styles.inputBoxError : styles.inputBox}>
            <TextInput
              style={[styles.textInput, validationError && styles.textInputError]}
              placeholder={identifierType === 'CBU' ? '22 dígitos de CBU' : identifierType === 'CUIT' ? '11 dígitos de CUIT' : 'ej: ju.mp'}
              placeholderTextColor="#94A3B8"
              value={identifierValue}
              onChangeText={setIdentifierValue}
              keyboardType={identifierType === 'CBU' || identifierType === 'CUIT' || identifierType === 'Tel' ? 'numeric' : 'default'}
              autoCapitalize="none"
              autoFocus={Boolean(validationError)}
            />
          </View>
          {validationError && (
            <Text style={styles.errorHelpText}>{validationError.message}</Text>
          )}
        </View>

        {/* Una caja de texto grande (Relato) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Relato</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Detalla qué sucedió para alertar a otros usuarios..."
            placeholderTextColor="#94A3B8"
            value={story}
            onChangeText={(valor) => {
              if (contieneLenguajeOfensivo(valor)) setFiltroAplicado(true);
              setStory(filtrarTexto(valor));
            }}
          />
          <Text style={[styles.storyCounter, relatoValido ? styles.storyCounterOk : styles.storyCounterError]}>
            {story.trim().length}/20 caracteres mínimos
          </Text>
          {filtroAplicado && (
            <Text style={styles.filterNote}>
              Se reemplazaron términos ofensivos del relato.
            </Text>
          )}
        </View>

        {/* Dirección manual */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Ubicación</Text>
          <View style={styles.addressSearchRow}>
            <View style={styles.addressSearchInput}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.addressInput}
                placeholder="Calle, número, localidad..."
                placeholderTextColor="#94A3B8"
                value={direccionQuery}
                onChangeText={setDireccionQuery}
                onSubmitEditing={handleBuscarDireccion}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={styles.addressSearchBtn} onPress={handleBuscarDireccion}>
              <Text style={styles.addressSearchBtnText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <Text style={styles.addressLabel}>Calle</Text>
              <TextInput
                style={styles.addressTextInput}
                value={location.calle ?? ''}
                onChangeText={(v) => actualizarCampo('calle', v)}
                placeholder="Av. Corrientes"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.addressFieldSmall}>
              <Text style={styles.addressLabel}>Número</Text>
              <TextInput
                style={styles.addressTextInput}
                value={location.numero ?? ''}
                onChangeText={(v) => actualizarCampo('numero', v)}
                placeholder="1234"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <Text style={styles.addressLabel}>Localidad</Text>
              <TextInput
                style={styles.addressTextInput}
                value={location.localidad ?? ''}
                onChangeText={(v) => actualizarCampo('localidad', v)}
                placeholder="CABA"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.addressFieldSmall}>
              <Text style={styles.addressLabel}>CP</Text>
              <TextInput
                style={styles.addressTextInput}
                value={location.codigoPostal ?? ''}
                onChangeText={(v) => actualizarCampo('codigoPostal', v)}
                placeholder="1000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <Text style={styles.addressLabel}>Provincia</Text>
              <TextInput
                style={styles.addressTextInput}
                value={location.provincia ?? ''}
                onChangeText={(v) => actualizarCampo('provincia', v)}
                placeholder="Buenos Aires"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <Text style={styles.addressLabel}>Referencia (opcional)</Text>
              <TextInput
                style={styles.addressTextInput}
                value={location.referencia ?? ''}
                onChangeText={(v) => actualizarCampo('referencia', v)}
                placeholder="Entre calles, piso, timbre..."
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Un rectángulo mediano (Mapa para fijar pin) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Mapa para fijar pin</Text>
          <View style={[styles.mapRectangle, { height: mapPickerHeight }]}>
            <MapViewWrapper
              selectedLocation={location}
              draggablePin
              onSelectLocation={async (loc) => {
                setPinConfirmado(true);
                const conDireccion = await ubicacionConDireccion(loc);
                setLocation(conDireccion);
                setDireccionQuery(conDireccion.address);
              }}
              centerLatitude={location.latitude}
              centerLongitude={location.longitude}
            />
            <TouchableOpacity style={styles.miUbicacionBtn} onPress={handleMiUbicacion}>
              <Ionicons name="locate" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <View style={styles.mapActionsRow}>
            <TouchableOpacity style={styles.expandMapBtn} onPress={() => setShowMapPicker(true)}>
              <Ionicons name="expand-outline" size={16} color="#0F172A" />
              <Text style={styles.expandMapText}>Agrandar mapa</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.locationHelp}>📍 {location.address}</Text>
          {requiereUbicacion && !pinConfirmado && !location.verificada && (
            <Text style={styles.pinRequiredHelp}>
              Esta categoría requiere que fijes el pin o busques una dirección.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Pie de pantalla (Fijo): Panel pegado abajo que diga "Credibilidad: 20%" con botón secundario "Siguiente" */}
      <View style={styles.fixedFooter}>
        <View style={styles.credibilityBox}>
          <Text style={styles.credibilityLabel}>Credibilidad:</Text>
          <Text style={styles.credibilityPercent}>{credibilityScore}%</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextSecondaryBtn, !relatoValido && styles.btnDisabled]}
          activeOpacity={0.88}
          onPress={handleNext}
          disabled={!relatoValido}
        >
          <Text style={styles.nextSecondaryBtnText}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={16} color="#000000" />
        </TouchableOpacity>
      </View>

      <BottomNavBar activeTab="report" />

      <MapPickerModal
        visible={showMapPicker}
        initial={location}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(loc) => {
          setLocation(loc);
          setPinConfirmado(true);
          setDireccionQuery(loc.address);
          setShowMapPicker(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveDraftBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
  },
  optionTextSelected: {
    fontWeight: '800',
    color: '#000000',
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  // Borde grueso oscuro para el error de validación (unifica el comportamiento de P6)
  inputBoxError: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorHelpText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '600',
  },
  textInputError: {
    fontWeight: '700',
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
  },
  // Caja de texto grande (Relato)
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
  },
  // Rectángulo mediano (Mapa para fijar pin)
  mapRectangle: {
    height: 120,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  miUbicacionBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 20,
  },
  locationHelp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  pinRequiredHelp: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 4,
  },
  mapActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  expandMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  expandMapText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressSearchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addressSearchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
  },
  addressInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  addressSearchBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addressField: {
    flex: 1,
  },
  addressFieldSmall: {
    width: 110,
  },
  addressLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
    fontWeight: '600',
  },
  addressTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  storyCounter: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  storyCounterOk: {
    color: '#059669',
  },
  storyCounterError: {
    color: '#DC2626',
  },
  filterNote: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 4,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  // Pie de pantalla (Fijo)
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  credibilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credibilityLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  credibilityPercent: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  // Botón secundario "Siguiente"
  nextSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  nextSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
});
