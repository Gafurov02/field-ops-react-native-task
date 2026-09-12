import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette } from '../theme/colors';
import { Task } from '../types/task';
import { formatDateTime } from '../utils/date';
import { StatusBadge, SyncBadge } from './StatusBadge';

export function TaskCard({ task, colors, onPress }: { task: Task; colors: Palette; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open task ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}>
      <View style={styles.topLine}><Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>{task.title}</Text><StatusBadge status={task.status} /></View>
      <Text numberOfLines={1} style={[styles.detail, { color: colors.textMuted }]}>Due {formatDateTime(task.dueAt)}</Text>
      <Text numberOfLines={1} style={[styles.detail, { color: colors.textMuted }]}>⌖ {task.location.address}</Text>
      <View style={styles.footer}><SyncBadge status={task.syncStatus} colors={colors} /><Text style={[styles.attachment, { color: colors.textMuted }]}>{task.attachments.length ? `▧ ${task.attachments.length} image${task.attachments.length > 1 ? 's' : ''}` : 'No images'}</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, borderRadius: 16, marginBottom: 11 },
  topLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 9 },
  title: { fontSize: 17, fontWeight: '800', flex: 1, lineHeight: 22 },
  detail: { fontSize: 13, lineHeight: 20 },
  footer: { marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  attachment: { fontSize: 12, fontWeight: '600' },
});
