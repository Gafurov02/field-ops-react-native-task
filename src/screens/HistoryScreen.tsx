import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { Palette } from '../theme/colors';
import { HistoryEntry } from '../types/task';
import { formatDateTime } from '../utils/date';

const actionTitles: Record<HistoryEntry['action'], string> = {
  created: 'Task created', edited: 'Task edited', status_changed: 'Status updated', attachment_added: 'Image attached', attachment_removed: 'Image removed', deleted: 'Task deleted', sync_succeeded: 'Sync complete', sync_failed: 'Sync failed',
};

export function HistoryScreen({ history, colors }: { history: HistoryEntry[]; colors: Palette }) {
  return <View style={styles.screen}><Text style={[styles.title, { color: colors.text }]}>Activity history</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>Every task action is recorded and stored locally.</Text><FlatList data={history} keyExtractor={(item) => item.id} contentContainerStyle={history.length ? styles.list : styles.emptyList} renderItem={({ item }) => <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.icon, { backgroundColor: colors.primarySoft }]}><Text style={[styles.iconText, { color: colors.primary }]}>•</Text></View><View style={styles.copy}><Text style={[styles.action, { color: colors.text }]}>{actionTitles[item.action]}</Text><Text style={[styles.summary, { color: colors.textMuted }]}>{item.summary}</Text><Text style={[styles.date, { color: colors.textMuted }]}>{formatDateTime(item.createdAt)}</Text></View></View>} ListEmptyComponent={<EmptyState colors={colors} title="Nothing recorded yet" description="Task creation, edits, status changes, attachments, deletions, and sync events will appear here." />} showsVerticalScrollIndicator={false} /></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, paddingHorizontal: 18, paddingTop: 20 }, title: { fontSize: 28, fontWeight: '900' }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 18 }, list: { paddingBottom: 24 }, emptyList: { flexGrow: 1 }, item: { borderWidth: 1, borderRadius: 15, padding: 13, marginBottom: 9, flexDirection: 'row', gap: 11 }, icon: { height: 28, width: 28, borderRadius: 99, alignItems: 'center', justifyContent: 'center' }, iconText: { fontSize: 21, lineHeight: 21, fontWeight: '900' }, copy: { flex: 1 }, action: { fontSize: 14, fontWeight: '900' }, summary: { fontSize: 13, lineHeight: 18, marginTop: 3 }, date: { fontSize: 11, marginTop: 5 }, });
