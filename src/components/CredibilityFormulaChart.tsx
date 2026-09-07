import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CredibilityChartProps {
  currentIdentity?: number;
  currentEvidence?: number;
  currentCorroboration?: number;
}

export const CredibilityFormulaChart: React.FC<CredibilityChartProps> = ({
  currentIdentity = 15,
  currentEvidence = 0,
  currentCorroboration = 0,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Fórmula de Veracidad RG-07</Text>
      <Text style={styles.subtitle}>
        Distribución matemática del puntaje de confiabilidad comunitaria
      </Text>

      {/* Barra segmentada horizontal (100% total) */}
      <View style={styles.segmentedBarContainer}>
        <View style={[styles.segment, { width: '40%', backgroundColor: '#2563EB' }]}>
          <Text style={styles.segmentText}>40%</Text>
        </View>
        <View style={[styles.segment, { width: '45%', backgroundColor: '#059669' }]}>
          <Text style={styles.segmentText}>45%</Text>
        </View>
        <View style={[styles.segment, { width: '15%', backgroundColor: '#D97706' }]}>
          <Text style={styles.segmentText}>15%</Text>
        </View>
      </View>

      {/* Leyenda y detalles */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
          <View style={styles.legendTextWrapper}>
            <Text style={styles.legendTitle}>1. Identidad Verificada (Hasta 40 pts)</Text>
            <Text style={styles.legendDesc}>
              Google Auth (+15), Teléfono SMS (+15), DNI Renaper (+10)
            </Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
          <View style={styles.legendTextWrapper}>
            <Text style={styles.legendTitle}>2. Evidencias & OCR (Hasta 45 pts)</Text>
            <Text style={styles.legendDesc}>
              Capturas de chat (+20), Comprobantes bancarios (+25), Match OCR
            </Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
          <View style={styles.legendTextWrapper}>
            <Text style={styles.legendTitle}>3. Corroboración Colectiva (Hasta 15 pts)</Text>
            <Text style={styles.legendDesc}>
              Coincidencia de reportes sobre el mismo Alias / CBU / Local
            </Text>
          </View>
        </View>
      </View>

      {/* Fórmula resumida */}
      <View style={styles.formulaBadge}>
        <Text style={styles.formulaText}>
          Score = Identidad (40) + Evidencias (45) + Red (15) = 100%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  segmentedBarContainer: {
    height: 28,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  legendTextWrapper: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  legendDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  formulaBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  formulaText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});
