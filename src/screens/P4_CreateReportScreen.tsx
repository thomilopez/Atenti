import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdentifierType, RootStackParamList } from '../types';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { useReportFlow } from '../context/ReportFlowContext';
import { useAuth } from '../context/AuthContext';
import { BottomNavBar } from '../components/BottomNavBar';
import {
  REPORT_CATEGORIES,
  getCategoryMetadata,
} from '../constants/reportCategories';

type Props = NativeStackScreenProps<RootStackParamList, 'P4_CreateReport'>;

const IDENTIFIER_TYPES: IdentifierType[] = ['Alias', 'CBU', 'Tel', 'Local'];

export const P4_CreateReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { isAuthenticated } = useAuth();
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
    saveCurrentDraft,
  } = useReportFlow();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [identifierDropdownOpen, setIdentifierDropdownOpen] = useState(false);

  // RG-01: Bloqueo estricto si el usuario U0 no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Identificación Requerida (RG-01)',
        'Para emitir una denuncia necesitas autenticarte y aceptar la Declaración Jurada.'
      );
      navigation.replace('P3_LegalAuth', { returnTo: 'P4_CreateReport' });
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (route.params?.prefilledIdentifier) {
      setIdentifierType(route.params.prefilledIdentifier.type);
      setIdentifierValue(route.params.prefilledIdentifier.value);
    }
  }, [route.params]);

  const handleNext = async () => {
    // Si el CBU no tiene 22 dígitos numéricos, disparamos P6
    if (identifierType === 'CBU') {
      const cleanCbu = identifierValue.replace(/\D/g, '');
      if (cleanCbu.length !== 22) {
        await saveCurrentDraft();
        navigation.navigate('P6_ValidationError', {
          field: 'CBU',
          message: 'Ingresá un CBU válido. Tus demás datos se guardaron',
          invalidValue: identifierValue,
        });
        return;
      }
    }

    if (!identifierValue.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el identificador denunciado.');
      return;
    }

    if (!story.trim()) {
      Alert.alert('Relato requerido', 'Contanos brevemente qué ocurrió.');
      return;
    }

    await saveCurrentDraft();
    navigation.navigate('P5_OCRValidation');
  };

  const currentCategoryMeta = getCategoryMetadata(category);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Barra superior de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Crear reporte
        </Text>
        <TouchableOpacity
          onPress={async () => {
            await saveCurrentDraft();
            Alert.alert('Borrador Guardado', 'Se guardó en el almacenamiento local.');
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
          style={styles.saveDraftBtn}
          accessibilityRole="button"
          accessibilityLabel="Guardar borrador"
        >
          <Ionicons name="save-outline" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Caja desplegable 1: Categoría ampliada con iconos */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>¿Qué quieres reportar?</Text>
            <TouchableOpacity
              style={styles.dropdownBox}
              activeOpacity={0.8}
              onPress={() => {
                setCategoryDropdownOpen(!categoryDropdownOpen);
                setIdentifierDropdownOpen(false);
              }}
              accessibilityRole="combobox"
              accessibilityLabel="Categoría del reporte"
            >
              <View style={styles.selectedCategoryRow}>
                <View
                  style={[
                    styles.categoryIconBadge,
                    { backgroundColor: currentCategoryMeta.badgeBg },
                  ]}
                >
                  <Ionicons
                    name={currentCategoryMeta.icon as any}
                    size={16}
                    color={currentCategoryMeta.color}
                  />
                </View>
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {category}
                </Text>
              </View>
              <Ionicons
                name={categoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>

            {categoryDropdownOpen && (
              <View style={styles.dropdownOptions}>
                {REPORT_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.optionItemCategory,
                        isSelected && styles.optionItemCategorySelected,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => {
                        setCategory(cat.name);
                        setIdentifierType(cat.defaultIdentifierType);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      <View
                        style={[
                          styles.categoryIconBadge,
                          { backgroundColor: cat.badgeBg },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={16}
                          color={cat.color}
                        />
                      </View>
                      <View style={styles.optionCategoryTextCol}>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                        <Text style={styles.optionDescription} numberOfLines={1}>
                          {cat.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#0F172A" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Caja desplegable 2: Tipo de Identificador */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tipo de identificador</Text>
            <TouchableOpacity
              style={styles.dropdownBox}
              activeOpacity={0.8}
              onPress={() => {
                setIdentifierDropdownOpen(!identifierDropdownOpen);
                setCategoryDropdownOpen(false);
              }}
              accessibilityRole="combobox"
              accessibilityLabel="Tipo de identificador"
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
                    activeOpacity={0.75}
                    onPress={() => {
                      setIdentifierType(type);
                      setIdentifierDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        identifierType === type && styles.optionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      [{type}]{' '}
                      {type === 'Alias'
                        ? '(ej: ju.mp)'
                        : type === 'CBU'
                        ? '(22 dígitos)'
                        : type === 'Tel'
                        ? '(Celular)'
                        : '(Dirección)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Input del valor del Identificador */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Identificador afectado</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder={
                  identifierType === 'CBU'
                    ? '22 dígitos de CBU'
                    : identifierType === 'Tel'
                    ? 'ej: +54 9 11 ...'
                    : identifierType === 'Local'
                    ? 'Dirección o nombre del local'
                    : 'ej: ju.mp o alias.banco'
                }
                placeholderTextColor="#94A3B8"
                value={identifierValue}
                onChangeText={setIdentifierValue}
                keyboardType={
                  identifierType === 'CBU' || identifierType === 'Tel'
                    ? 'numeric'
                    : 'default'
                }
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Caja de texto grande: Relato */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Relato de los hechos</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Detalla qué sucedió para alertar a otros usuarios de la comunidad..."
              placeholderTextColor="#94A3B8"
              value={story}
              onChangeText={setStory}
            />
          </View>

          {/* Mapa para fijar pin */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mapa para fijar pin geolocalizado</Text>
            <View style={styles.mapRectangle}>
              <MapViewWrapper
                selectedLocation={location}
                onSelectLocation={(loc) => setLocation(loc)}
                centerLatitude={location.latitude}
                centerLongitude={location.longitude}
                autoLocateUser={false}
                showRecenterButton={true}
              />
            </View>
            <Text style={styles.locationHelp} numberOfLines={1}>
              📍 {location.address}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Pie de pantalla fijo: Barra de credibilidad y botón Siguiente */}
      <View style={styles.fixedFooter}>
        <View style={styles.footerInner}>
          <View style={styles.credibilityBox}>
            <Text style={styles.credibilityLabel}>Credibilidad:</Text>
            <Text style={styles.credibilityPercent}>20%</Text>
          </View>

          <TouchableOpacity
            style={styles.nextSecondaryBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Siguiente paso: validación de evidencias"
          >
            <Text style={styles.nextSecondaryBtnText} numberOfLines={1}>
              Siguiente
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavBar activeTab="report" />
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
    padding: 6,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  saveDraftBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectedCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  categoryIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flexShrink: 1,
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 44,
    justifyContent: 'center',
  },
  optionItemCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
    minHeight: 48,
  },
  optionItemCategorySelected: {
    backgroundColor: '#F8FAFC',
  },
  optionCategoryTextCol: {
    flex: 1,
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
  },
  optionDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  optionTextSelected: {
    fontWeight: '800',
    color: '#0F172A',
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 88,
  },
  mapRectangle: {
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  locationHelp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    flexShrink: 1,
  },
  fixedFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
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
    minHeight: 44,
    justifyContent: 'center',
  },
  nextSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    flexShrink: 1,
  },
});
