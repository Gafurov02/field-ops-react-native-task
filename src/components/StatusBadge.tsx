import { StyleSheet, Text, View } from 'react-native';
import { STATUS_LABELS } from '../constants/config';
import { Palette } from '../theme/colors';
import { SyncStatus, TaskStatus } from '../types/task';

const statusColors: Record<TaskStatus, { bg: string; text: string }> = {
  new: { bg: '#E8F0FF', text: '#1555A6' },
  in_progress: { bg: '#FFF0D7', text: '#935A00' },
  completed: { bg: '#DCF5E7', text: '#12663F' },
  cancelled: { bg: '#FDE3E7', text: '#A22035' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const color = statusColors[status];
  return <View style={[styles.badge, { backgroundColor: color.bg }]}><Text style={[styles.text, { color: color.text }]}>{STATUS_LABELS[status]}</Text></View>;
}

export function SyncBadge({ status, colors }: { status: SyncStatus; colors: Palette }) {
  const attributes = status === 'synced'
    ? { label: 'Synced', color: colors.success }
    : status === 'failed'
      ? { label: 'Sync failed', color: colors.danger }
      : { label: 'Pending sync', color: colors.warning };
  return <View style={[styles.sync, { borderColor: attributes.color }]}><Text style={[styles.syncText, { color: attributes.color }]}>{attributes.label}</Text></View>;
}

const styles = StyleSheet.create({
  badge: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  sync: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  syncText: { fontSize: 11, fontWeight: '700' },
});
