import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TrafficLightColor } from '../types';

interface TrafficLightProps {
  color: TrafficLightColor;
  size?: number;
  showLabel?: boolean;
}

export const TrafficLightIndicator: React.FC<TrafficLightProps> = ({
  color,
  size = 18,
  showLabel = false,
}) => {
  const getColorHex = () => {
    switch (color) {
      case 'green':
        return '#10B981';
      case 'yellow':
        return '#F59E0B';
      case 'red':
        return '#EF4444';
    }
  };

  const getLabelText = () => {
    switch (color) {
      case 'green':
        return 'Alta Veracidad';
      case 'yellow':
        return 'Sospechoso';
      case 'red':
        return 'Baja Veracidad';
    }
  };

  const bgHex = getColorHex();

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
        <Text style={[styles.label, { color: bgHex }]}>{getLabelText()}</Text>
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
