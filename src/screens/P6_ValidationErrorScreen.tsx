import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'P6_ValidationError'>;

const CATEGORIES: IncidentCategory[] = [
  'Estafa Bancaria',
  'Phishing / Suplantación',
  'Comercio Virtual Falso',
  'Local Físico Ilícito',
  'Clonación de Identidad',
];

const IDENTIFIER_TYPES: IdentifierType[] = ['Alias', 'CBU', 'Tel', 'Local'];

export const P6_ValidationErrorScreen: React.FC<Props> = ({ route, navigation }) => {
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

  const handleNext = async () => {
    if (identifierType === 'CBU') {
      const cleanCbu = identifierValue.replace(/\D/g, '');
      if (cleanCbu.length !== 22) {
        Alert.alert('CBU Inválido', 'El CBU debe contener exactamente 22 dígitos.');
        return;
      }
    }

    if (!identifierValue.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el identificador denunciado.');
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
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Duplicación exacta de P4 */}

        {/* 1. Desplegable Categoría */}
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

        {/* 2. Desplegable Tipo Identificador */}
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
                    [{type}]
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CAMBIO VISUAL ESPECIFICADO: Borde grueso (oscuro) a la caja del Identificador y texto chico debajo */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Identificador afectado</Text>
          
          {/* Caja con borde grueso oscuro */}
          <View style={styles.inputBoxError}>
            <TextInput
              style={styles.textInput}
              placeholder="Ingresá los 22 dígitos del CBU"
              placeholderTextColor="#94A3B8"
              value={identifierValue}
              onChangeText={setIdentifierValue}
              keyboardType={identifierType === 'CBU' ? 'numeric' : 'default'}
              autoCapitalize="none"
              autoFocus
            />
          </View>

          {/* Texto chico debajo: "Ingresá un CBU válido. Tus demás datos se guardaron" */}
          <Text style={styles.errorHelpText}>
            Ingresá un CBU válido. Tus demás datos se guardaron
          </Text>
        </View>

        {/* 3. Relato grande */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Relato</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={story}
            onChangeText={setStory}
          />
        </View>

        {/* 4. Rectángulo mapa */}
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

      {/* Pie de pantalla (Fijo): Panel pegado abajo con "Credibilidad: 20%" y botón secundario "Siguiente" */}
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
  // Borde grueso (oscuro) especificado en P6
  inputBoxError: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3, // Borde grueso
    borderColor: '#000000', // Borde oscuro
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  // Texto chico debajo especificado en P6
  errorHelpText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '600',
  },
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
