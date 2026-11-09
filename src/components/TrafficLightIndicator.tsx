import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  getNivel4Color,
  getNivel4Label,
  nivelCredibilidad4,
} from '../services/credibility';

interface TrafficLightProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export const TrafficLightIndicator: React.FC<TrafficLightProps> = ({
  score,
  size = 18,
  showLabel = false,
}) => {
  const nivel = nivelCredibilidad4(score);
  const bgHex = getNivel4Color(nivel);
  const label = getNivel4Label(nivel);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgHex,
            shadowColor: bgHex,
          },
        ]}
      />
      {showLabel && (
        <Text style={[styles.label, { color: bgHex }]}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
