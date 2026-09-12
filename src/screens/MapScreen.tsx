import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { Palette } from '../theme/colors';
import { Task } from '../types/task';

const DEFAULT_REGION: Region = { latitude: 41.3111, longitude: 69.2797, latitudeDelta: 0.18, longitudeDelta: 0.18 };

export function MapScreen({ tasks, colors, onOpenTask }: { tasks: Task[]; colors: Palette; onOpenTask: (taskId: string) => void }) {
  const pinnedTasks = useMemo(() => tasks.filter((task) => task.location.latitude !== undefined && task.location.longitude !== undefined), [tasks]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(pinnedTasks[0]?.id);
  const selected = pinnedTasks.find((task) => task.id === selectedTaskId);
  const initialRegion: Region = selected ? { latitude: selected.location.latitude!, longitude: selected.location.longitude!, latitudeDelta: 0.08, longitudeDelta: 0.08 } : DEFAULT_REGION;
  if (tasks.length === 0) return <View style={styles.empty}><EmptyState colors={colors} title="No task locations yet" description="Create a task and add coordinates or use one of the location presets to see it on the map." /></View>;
  return <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={[styles.title, { color: colors.text }]}>Task map</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>Tap a marker or task card to open its details.</Text>
    <View style={[styles.mapWrap, { borderColor: colors.border }]}>
      <MapView style={styles.map} initialRegion={initialRegion} accessibilityLabel="Map of task locations">
        {pinnedTasks.map((task) => <Marker key={task.id} coordinate={{ latitude: task.location.latitude!, longitude: task.location.longitude! }} title={task.title} description={task.location.address} pinColor={task.status === 'completed' ? '#16794A' : task.status === 'cancelled' ? '#C92B3C' : '#1267E8'} onPress={() => setSelectedTaskId(task.id)} />)}
      </MapView>
      {!pinnedTasks.length ? <View style={[styles.mapNotice, { backgroundColor: colors.overlay }]}><Text style={styles.mapNoticeText}>Tasks are saved, but none have coordinates yet.</Text></View> : null}
    </View>
    {selected ? <Pressable accessibilityRole="button" accessibilityLabel={`Open ${selected.title}`} onPress={() => onOpenTask(selected.id)} style={[styles.selected, { backgroundColor: colors.surface, borderColor: colors.primary }]}><View style={styles.selectedCopy}><Text numberOfLines={1} style={[styles.selectedTitle, { color: colors.text }]}>{selected.title}</Text><Text numberOfLines={1} style={[styles.selectedAddress, { color: colors.textMuted }]}>{selected.location.address}</Text></View><StatusBadge status={selected.status} /></Pressable> : <View style={[styles.coordinateHint, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}><Text style={[styles.coordinateHintTitle, { color: colors.text }]}>Add coordinates to place pins</Text><Text style={[styles.coordinateHintText, { color: colors.textMuted }]}>Edit any task and enter latitude/longitude, or choose a preset location.</Text></View>}
    <Text style={[styles.sectionTitle, { color: colors.text }]}>Mapped tasks ({pinnedTasks.length})</Text>
    {pinnedTasks.map((task) => <Pressable accessibilityRole="button" key={task.id} onPress={() => { setSelectedTaskId(task.id); onOpenTask(task.id); }} style={[styles.taskRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.selectedCopy}><Text numberOfLines={1} style={[styles.selectedTitle, { color: colors.text }]}>{task.title}</Text><Text numberOfLines={1} style={[styles.selectedAddress, { color: colors.textMuted }]}>{task.location.address}</Text></View><Text style={[styles.open, { color: colors.primary }]}>Open ›</Text></Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, content: { padding: 18, paddingBottom: 28 }, empty: { flex: 1, paddingHorizontal: 18 }, title: { fontSize: 28, fontWeight: '900' }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 18 },
  mapWrap: { height: 300, overflow: 'hidden', borderWidth: 1, borderRadius: 16, position: 'relative' }, map: { flex: 1 }, mapNotice: { position: 'absolute', left: 14, right: 14, bottom: 14, padding: 12, borderRadius: 10 }, mapNoticeText: { color: '#FFFFFF', textAlign: 'center', fontSize: 13, fontWeight: '700' },
  selected: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, selectedCopy: { flex: 1, minWidth: 0 }, selectedTitle: { fontSize: 15, fontWeight: '900' }, selectedAddress: { fontSize: 12, marginTop: 4 }, coordinateHint: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 13 }, coordinateHintTitle: { fontSize: 15, fontWeight: '900' }, coordinateHintText: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 22, marginBottom: 10 }, taskRow: { borderWidth: 1, borderRadius: 13, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, open: { fontSize: 13, fontWeight: '900' },
});
