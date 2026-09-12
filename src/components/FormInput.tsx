import { Text, TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { Palette } from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  colors: Palette;
}

export function FormInput({ label, error, colors, multiline, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }, style]}
        {...inputProps}
      />
      {error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '800', marginBottom: 7 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 16 },
  multiline: { minHeight: 112, paddingVertical: 12 },
  error: { fontSize: 13, lineHeight: 18, marginTop: 6 },
});
