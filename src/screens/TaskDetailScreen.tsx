import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STATUS_LABELS } from '../constants/config';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBadge, SyncBadge } from '../components/StatusBadge';
import { Palette } from '../theme/colors';
import { HistoryEntry, Task, TaskStatus } from '../types/task';
import { formatDateTime } from '../utils/date';

const actionLabel: Record<HistoryEntry['action'], string> = {
  created: 'Created', edited: 'Edited', status_changed: 'Status', attachment_added: 'Attachment', attachment_removed: 'Attachment', deleted: 'Deleted', sync_succeeded: 'Sync', sync_failed: 'Sync',
};

export function TaskDetailScreen({ task, colors, onBack, onEdit, onStatusChange, onDelete }: { task: Task; colors: Palette; onBack: () => void; onEdit: () => void; onStatusChange: (status: TaskStatus) => void; onDelete: () => Promise<void> }) {
  const [missingAttachments, setMissingAttachments] = useState<string[]>([]);
  const remove = () => Alert.alert('Delete task?', 'This task will be removed from this device. Its deletion will remain in the history log.', [
    { text: 'Keep task', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => void onDelete() },
  ]);
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={10}><Text style={[styles.back, { color: colors.primary }]}>‹ Back</Text></Pressable><Text style={[styles.topTitle, { color: colors.text }]}>Task details</Text><Pressable accessibilityRole="button" accessibilityLabel="Edit task" onPress={onEdit}><Text style={[styles.edit, { color: colors.primary }]}>Edit</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.titleRow}><Text style={[styles.title, { color: colors.text }]}>{task.title}</Text><StatusBadge status={task.status} /></View>
        <Text style={[styles.description, { color: colors.textMuted }]}>{task.description}</Text>
        <View style={styles.syncLine}><SyncBadge status={task.syncStatus} colors={colors} /><Text style={[styles.updated, { color: colors.textMuted }]}>Updated {formatDateTime(task.updatedAt)}</Text></View>
      </View>
      <Section colors={colors} title="Schedule"><Text style={[styles.value, { color: colors.text }]}>Due {formatDateTime(task.dueAt)}</Text><Text style={[styles.help, { color: colors.textMuted }]}>A reminder is scheduled 30 minutes before due time, or after 45 seconds in demo mode.</Text></Section>
      <Section colors={colors} title="Location"><Text style={[styles.value, { color: colors.text }]}>⌖ {task.location.address}</Text>{task.location.latitude !== undefined ? <Text style={[styles.help, { color: colors.textMuted }]}>Coordinates: {task.location.latitude.toFixed(5)}, {task.location.longitude?.toFixed(5)}</Text> : <Text style={[styles.help, { color: colors.warning }]}>No coordinates yet. Edit this task to add a map pin.</Text>}</Section>
      <Section colors={colors} title="Update status"><View style={styles.statusGrid}>{(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => <Pressable accessibilityRole="button" key={status} onPress={() => onStatusChange(status)} style={[styles.statusButton, { backgroundColor: task.status === status ? colors.primary : colors.surfaceMuted, borderColor: task.status === status ? colors.primary : colors.border }]}><Text style={[styles.statusText, { color: task.status === status ? '#FFFFFF' : colors.text }]}>{STATUS_LABELS[status]}</Text></Pressable>)}</View></Section>
      <Section colors={colors} title={`Attachments (${task.attachments.length})`}><Text style={[styles.help, { color: colors.textMuted }]}>{task.attachments.length ? 'Images remain referenced locally after an app restart whenever the device photo URI is still available.' : 'No images are attached to this task.'}</Text>{task.attachments.map((attachment) => missingAttachments.includes(attachment.id) ? <View key={attachment.id} style={[styles.missing, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}><Text style={[styles.missingTitle, { color: colors.text }]}>Image unavailable</Text><Text style={[styles.help, { color: colors.textMuted }]}>{attachment.name} is missing, deleted, or cannot be accessed on this device.</Text></View> : <View key={attachment.id} style={styles.imageBlock}><Image accessibilityLabel={attachment.name} source={{ uri: attachment.uri }} style={styles.image} onError={() => setMissingAttachments((current) => [...current, attachment.id])} /><Text style={[styles.imageName, { color: colors.textMuted }]}>{attachment.name}</Text></View>)}</Section>
      <Section colors={colors} title="Task history"><View style={styles.timeline}>{task.history.length ? task.history.map((entry) => <View key={entry.id} style={styles.historyRow}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><View style={styles.historyCopy}><Text style={[styles.historyAction, { color: colors.text }]}>{actionLabel[entry.action]}</Text><Text style={[styles.historySummary, { color: colors.textMuted }]}>{entry.summary}</Text><Text style={[styles.historyDate, { color: colors.textMuted }]}>{formatDateTime(entry.createdAt)}</Text></View></View>) : <Text style={[styles.help, { color: colors.textMuted }]}>No activity recorded yet.</Text>}</View></Section>
      <PrimaryButton label="Delete task" onPress={remove} colors={colors} variant="danger" style={styles.delete} />
    </ScrollView>
  </View>;
}

function Section({ colors, title, children }: { colors: Palette; title: string; children: React.ReactNode }) {
  return <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, topBar: { minHeight: 58, paddingHorizontal: 18, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { fontSize: 16, fontWeight: '800' }, topTitle: { fontSize: 17, fontWeight: '900' }, edit: { fontSize: 15, fontWeight: '800' }, content: { padding: 18, paddingBottom: 42 },
  hero: { padding: 17, borderRadius: 16, borderWidth: 1, marginBottom: 12 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, title: { fontSize: 22, lineHeight: 28, fontWeight: '900', flex: 1 }, description: { fontSize: 14, lineHeight: 21, marginTop: 11 }, syncLine: { marginTop: 16, flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }, updated: { fontSize: 11 },
  section: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 }, sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 10 }, value: { fontSize: 15, lineHeight: 22, fontWeight: '700' }, help: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, statusButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9 }, statusText: { fontSize: 12, fontWeight: '800' },
  imageBlock: { marginTop: 12 }, image: { width: '100%', height: 190, borderRadius: 12, backgroundColor: '#DCE3EE' }, imageName: { fontSize: 12, marginTop: 6 }, missing: { borderWidth: 1, borderRadius: 12, marginTop: 10, padding: 12 }, missingTitle: { fontSize: 13, fontWeight: '900' },
  timeline: { gap: 2 }, historyRow: { flexDirection: 'row', gap: 10, paddingBottom: 12 }, dot: { marginTop: 5, height: 9, width: 9, borderRadius: 99 }, historyCopy: { flex: 1 }, historyAction: { fontSize: 13, fontWeight: '900' }, historySummary: { fontSize: 13, lineHeight: 18, marginTop: 2 }, historyDate: { fontSize: 11, marginTop: 4 }, delete: { marginTop: 3 },
});
