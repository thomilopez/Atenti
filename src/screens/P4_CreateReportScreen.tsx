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
import { IdentifierType, IncidentCategory, RootStackParamList } from '../types';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { useReportFlow } from '../context/ReportFlowContext';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P4_CreateReport'>;

const CATEGORIES: IncidentCategory[] = [
  'Estafa Bancaria',
  'Phishing / Suplantación',
  'Comercio Virtual Falso',
  'Local Físico Ilícito',
  'Clonación de Identidad',
];

const IDENTIFIER_TYPES: IdentifierType[] = ['Alias', 'CBU', 'Tel', 'Local'];

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
    saveCurrentDraft,
  } = useReportFlow();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [identifierDropdownOpen, setIdentifierDropdownOpen] = useState(false);

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
            <Text style={styles.dropdownText}>{category}</Text>
            <Ionicons
              name={categoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {categoryDropdownOpen && (
            <View style={styles.dropdownOptions}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.optionItem}
                  onPress={() => {
                    setCategory(cat);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, category === cat && styles.optionTextSelected]}>
                    {cat}
                  </Text>
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
                    [{type}] {type === 'Alias' ? '(ej: ju.mp)' : type === 'CBU' ? '(22 dígitos)' : type === 'Tel' ? '(Celular)' : '(Dirección)'}
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
              placeholder={identifierType === 'CBU' ? '22 dígitos de CBU' : 'ej: ju.mp'}
              placeholderTextColor="#94A3B8"
              value={identifierValue}
              onChangeText={setIdentifierValue}
              keyboardType={identifierType === 'CBU' || identifierType === 'Tel' ? 'numeric' : 'default'}
              autoCapitalize="none"
            />
          </View>
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
            onChangeText={setStory}
          />
        </View>

        {/* Un rectángulo mediano (Mapa para fijar pin) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Mapa para fijar pin</Text>
          <View style={styles.mapRectangle}>
            <MapViewWrapper
              selectedLocation={location}
              onSelectLocation={(loc) => setLocation(loc)}
              centerLatitude={location.latitude}
              centerLongitude={location.longitude}
            />
          </View>
          <Text style={styles.locationHelp}>📍 {location.address}</Text>
        </View>
      </ScrollView>

      {/* Pie de pantalla (Fijo): Panel pegado abajo que diga "Credibilidad: 20%" con botón secundario "Siguiente" */}
      <View style={styles.fixedFooter}>
        <View style={styles.credibilityBox}>
          <Text style={styles.credibilityLabel}>Credibilidad:</Text>
          <Text style={styles.credibilityPercent}>20%</Text>
        </View>

        <TouchableOpacity
          style={styles.nextSecondaryBtn}
          activeOpacity={0.88}
          onPress={handleNext}
        >
          <Text style={styles.nextSecondaryBtnText}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={16} color="#000000" />
        </TouchableOpacity>
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
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  locationHelp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
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
