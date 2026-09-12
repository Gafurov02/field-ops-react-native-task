import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Palette } from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  colors: Palette;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function PrimaryButton({ label, onPress, colors, disabled, loading, variant = 'primary', style, accessibilityLabel }: Props) {
  const palette = {
    primary: { bg: colors.primary, text: '#FFFFFF', border: colors.primary },
    secondary: { bg: colors.primarySoft, text: colors.primary, border: colors.primarySoft },
    danger: { bg: colors.danger, text: '#FFFFFF', border: colors.danger },
    ghost: { bg: 'transparent', text: colors.primary, border: colors.border },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: palette.bg, borderColor: palette.border, opacity: pressed || disabled ? 0.72 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={palette.text} /> : <Text style={[styles.label, { color: palette.text }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 46, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
