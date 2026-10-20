import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CredibilityBreakdown } from '../types';
import {
  nivelCredibilidad4,
  getNivel4Color,
  getNivel4Label,
} from '../services/credibility';

interface FilaProps {
  label: string;
  value: number;
  max: number;
}

const Fila: React.FC<FilaProps> = ({ label, value, max }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>
          {value}/{max}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
};

/** RF-047: desglose visible de puntos por componente. */
export const ScoreBreakdown: React.FC<{ breakdown: CredibilityBreakdown }> = ({
  breakdown,
}) => {
  const nivel = nivelCredibilidad4(breakdown.totalScore);
  const color = getNivel4Color(nivel);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Desglose de credibilidad</Text>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{getNivel4Label(nivel)}</Text>
        </View>
      </View>

      <Fila label="Identidad" value={breakdown.identityScore} max={40} />
      <Fila label="Evidencias" value={breakdown.evidenceScore} max={45} />
      <Fila label="Corroboración" value={breakdown.corroborationScore} max={15} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{breakdown.totalScore}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  row: {
    marginBottom: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  rowLabel: {
    fontSize: 12,
    color: '#475569',
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  track: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
});
