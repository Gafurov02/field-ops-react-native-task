import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

export function EmptyState({ colors, title, description, actionLabel, onAction }: { colors: Palette; title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Text style={styles.icon}>✓</Text>
    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
    {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} colors={colors} style={styles.button} /> : null}
  </View>;
}

const styles = StyleSheet.create({
  box: { marginTop: 32, padding: 28, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
  icon: { fontSize: 30, color: '#1267E8', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 7 },
  description: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  button: { alignSelf: 'stretch', marginTop: 20 },
});
