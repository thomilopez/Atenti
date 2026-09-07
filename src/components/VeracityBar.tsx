import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface VeracityBarProps {
  percentage: number;
  height?: number;
  showPercentageText?: boolean;
  label?: string;
}

export const VeracityBar: React.FC<VeracityBarProps> = ({
  percentage,
  height = 18,
  showPercentageText = true,
  label,
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));

  // Color vibrante verde del diseño Figma
  const fillColor = '#00E676';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.barRow}>
        <View style={[styles.track, { height, borderRadius: 4 }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${clamped}%`,
                backgroundColor: fillColor,
                borderRadius: 4,
              },
            ]}
          />
        </View>

        {showPercentageText && (
          <View style={styles.percentageBadge}>
            <Text style={styles.percentageText}>{clamped}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    minWidth: 46,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
});
