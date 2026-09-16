/**
 * Atenti - Componente UI Reutilizable: IconButton
 * Botón accesible para iconos de navegación, acciones flotantes y filtros.
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Insets,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface IconButtonProps {
  icon: any;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  round?: boolean;
  disabled?: boolean;
  hitSlop?: Insets;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 22,
  color = '#0F172A',
  backgroundColor = 'transparent',
  round = true,
  disabled = false,
  hitSlop = { top: 8, bottom: 8, left: 8, right: 8 },
  style,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        round && styles.round,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={disabled ? '#94A3B8' : color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  round: {
    borderRadius: 22,
  },
  disabled: {
    opacity: 0.5,
  },
});
