/**
 * Atenti - Componente UI Reutilizable: AppButton
 * Diseñado con accesibilidad táctil (área mínima 44-48dp, hitSlop),
 * estados visuales claros (presionado, deshabilitado, cargando) y protección contra desbordamiento de texto.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Insets,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: any;
  iconRight?: any;
  iconSize?: number;
  iconColor?: string;
  fullWidth?: boolean;
  hitSlop?: Insets;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  iconSize,
  iconColor,
  fullWidth = true,
  hitSlop = { top: 6, bottom: 6, left: 6, right: 6 },
  style,
  textStyle,
  testID,
}) => {
  const isInteractive = !disabled && !loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.btnSecondary,
          text: styles.btnTextSecondary,
          spinnerColor: '#0F172A',
          defaultIconColor: '#0F172A',
        };
      case 'outline':
        return {
          container: styles.btnOutline,
          text: styles.btnTextOutline,
          spinnerColor: '#0F172A',
          defaultIconColor: '#0F172A',
        };
      case 'ghost':
        return {
          container: styles.btnGhost,
          text: styles.btnTextGhost,
          spinnerColor: '#0F172A',
          defaultIconColor: '#0F172A',
        };
      case 'danger':
        return {
          container: styles.btnDanger,
          text: styles.btnTextDanger,
          spinnerColor: '#FFFFFF',
          defaultIconColor: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          container: styles.btnPrimary,
          text: styles.btnTextPrimary,
          spinnerColor: '#FFFFFF',
          defaultIconColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.sizeSm,
          text: styles.textSizeSm,
          defaultIconSize: 16,
        };
      case 'lg':
        return {
          container: styles.sizeLg,
          text: styles.textSizeLg,
          defaultIconSize: 22,
        };
      case 'md':
      default:
        return {
          container: styles.sizeMd,
          text: styles.textSizeMd,
          defaultIconSize: 18,
        };
    }
  };

  const variantConfig = getVariantStyles();
  const sizeConfig = getSizeStyles();
  const effectiveIconSize = iconSize || sizeConfig.defaultIconSize;
  const effectiveIconColor = iconColor || variantConfig.defaultIconColor;

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.75}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.baseButton,
        variantConfig.container,
        sizeConfig.container,
        fullWidth && styles.fullWidth,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={variantConfig.spinnerColor} size="small" />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.baseText,
              variantConfig.text,
              sizeConfig.text,
              styles.loadingText,
              textStyle,
            ]}
          >
            Cargando...
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {iconLeft && (
            <Ionicons
              name={iconLeft}
              size={effectiveIconSize}
              color={effectiveIconColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.baseText, variantConfig.text, sizeConfig.text, textStyle]}
          >
            {title}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={effectiveIconSize}
              color={effectiveIconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Garantiza área táctil recomendada
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 6,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1, // Evita desbordamiento si el texto es largo
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Tamaños
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 38,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  sizeLg: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    minHeight: 54,
  },

  textSizeSm: {
    fontSize: 13,
  },
  textSizeMd: {
    fontSize: 15,
  },
  textSizeLg: {
    fontSize: 16,
  },

  // Variantes
  btnPrimary: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  btnTextPrimary: {
    color: '#FFFFFF',
  },

  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnTextSecondary: {
    color: '#0F172A',
  },

  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  btnTextOutline: {
    color: '#0F172A',
  },

  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  btnTextGhost: {
    color: '#334155',
  },

  btnDanger: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#B91C1C',
  },
  btnTextDanger: {
    color: '#FFFFFF',
  },

  // Estados
  btnDisabled: {
    opacity: 0.45,
    backgroundColor: '#94A3B8',
    borderColor: '#94A3B8',
  },
});
