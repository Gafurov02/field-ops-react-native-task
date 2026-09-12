import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { Palette } from '../theme/colors';
import { Task } from '../types/task';

type Bounds = { minLatitude: number; maxLatitude: number; minLongitude: number; maxLongitude: number };

function getBounds(tasks: Task[]): Bounds {
  const latitude = tasks.map((task) => task.location.latitude!);
  const longitude = tasks.map((task) => task.location.longitude!);
  const minLatitude = Math.min(...latitude);
  const maxLatitude = Math.max(...latitude);
  const minLongitude = Math.min(...longitude);
  const maxLongitude = Math.max(...longitude);
  const latitudePadding = Math.max((maxLatitude - minLatitude) * 0.2, 0.012);
  const longitudePadding = Math.max((maxLongitude - minLongitude) * 0.2, 0.012);
  return {
    minLatitude: minLatitude - latitudePadding,
    maxLatitude: maxLatitude + latitudePadding,
    minLongitude: minLongitude - longitudePadding,
    maxLongitude: maxLongitude + longitudePadding,
  };
}

function markerPosition(task: Task, bounds: Bounds) {
  const horizontalRange = bounds.maxLongitude - bounds.minLongitude || 1;
  const verticalRange = bounds.maxLatitude - bounds.minLatitude || 1;
  const left = 7 + ((task.location.longitude! - bounds.minLongitude) / horizontalRange) * 86;
  const top = 89 - ((task.location.latitude! - bounds.minLatitude) / verticalRange) * 80;
  return { left: `${Math.min(93, Math.max(7, left))}%` as `${number}%`, top: `${Math.min(89, Math.max(9, top))}%` as `${number}%` };
}

function pinColor(task: Task) {
  if (task.status === 'completed') return '#16794A';
  if (task.status === 'cancelled') return '#C92B3C';
  return '#1267E8';
}

export function MapScreen({ tasks, colors, onOpenTask }: { tasks: Task[]; colors: Palette; onOpenTask: (taskId: string) => void }) {
  const pinnedTasks = useMemo(() => tasks.filter((task) => task.location.latitude !== undefined && task.location.longitude !== undefined), [tasks]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(pinnedTasks[0]?.id);
  const selected = pinnedTasks.find((task) => task.id === selectedTaskId);
  const bounds = useMemo(() => pinnedTasks.length ? getBounds(pinnedTasks) : undefined, [pinnedTasks]);

  if (tasks.length === 0) return <View style={styles.empty}><EmptyState colors={colors} title="No task locations yet" description="Create a task and add coordinates or use one of the location presets to see it on the map." /></View>;

  return <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={[styles.title, { color: colors.text }]}>Task map</Text>
    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Offline coordinate map. Tap a pin or task card to open its details.</Text>
    <View style={[styles.mapWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]} accessibilityLabel="Offline map of task locations">
      <View style={styles.routeHorizontal} pointerEvents="none" />
      <View style={styles.routeDiagonal} pointerEvents="none" />
      <View style={styles.routeVertical} pointerEvents="none" />
      {[20, 40, 60, 80].map((value) => <View key={`vertical-${value}`} pointerEvents="none" style={[styles.verticalGrid, { left: `${value}%`, borderColor: colors.border }]} />)}
      {[20, 40, 60, 80].map((value) => <View key={`horizontal-${value}`} pointerEvents="none" style={[styles.horizontalGrid, { top: `${value}%`, borderColor: colors.border }]} />)}
      <View pointerEvents="none" style={[styles.mapBadge, { backgroundColor: colors.surface }]}><Text style={[styles.mapBadgeText, { color: colors.text }]}>OFFLINE MAP</Text></View>
      {bounds && pinnedTasks.map((task, index) => {
        const position = markerPosition(task, bounds);
        const isSelected = task.id === selectedTaskId;
        return <Pressable key={task.id} accessibilityRole="button" accessibilityLabel={`Select location for ${task.title}`} onPress={() => setSelectedTaskId(task.id)} style={[styles.marker, position, { backgroundColor: pinColor(task), borderColor: isSelected ? '#FFFFFF' : pinColor(task), transform: [{ scale: isSelected ? 1.16 : 1 }] }]}>
          <Text style={styles.markerText}>{index + 1}</Text>
        </Pressable>;
      })}
      {!pinnedTasks.length ? <View style={[styles.mapNotice, { backgroundColor: colors.overlay }]}><Text style={styles.mapNoticeText}>Tasks are saved, but none have coordinates yet.</Text></View> : null}
    </View>
    {selected ? <Pressable accessibilityRole="button" accessibilityLabel={`Open ${selected.title}`} onPress={() => onOpenTask(selected.id)} style={[styles.selected, { backgroundColor: colors.surface, borderColor: colors.primary }]}><View style={styles.selectedCopy}><Text numberOfLines={1} style={[styles.selectedTitle, { color: colors.text }]}>{selected.title}</Text><Text numberOfLines={1} style={[styles.selectedAddress, { color: colors.textMuted }]}>{selected.location.address}</Text><Text style={[styles.coordinates, { color: colors.textMuted }]}>{selected.location.latitude?.toFixed(5)}, {selected.location.longitude?.toFixed(5)}</Text></View><StatusBadge status={selected.status} /></Pressable> : <View style={[styles.coordinateHint, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.coordinateHintTitle, { color: colors.text }]}>Add coordinates to place pins</Text><Text style={[styles.coordinateHintText, { color: colors.textMuted }]}>Edit any task and enter latitude/longitude, or choose a preset location.</Text></View>}
    <Text style={[styles.sectionTitle, { color: colors.text }]}>Mapped tasks ({pinnedTasks.length})</Text>
    {pinnedTasks.map((task, index) => <Pressable accessibilityRole="button" key={task.id} onPress={() => { setSelectedTaskId(task.id); onOpenTask(task.id); }} style={[styles.taskRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.listPin, { backgroundColor: pinColor(task) }]}><Text style={styles.listPinText}>{index + 1}</Text></View><View style={styles.selectedCopy}><Text numberOfLines={1} style={[styles.selectedTitle, { color: colors.text }]}>{task.title}</Text><Text numberOfLines={1} style={[styles.selectedAddress, { color: colors.textMuted }]}>{task.location.address}</Text></View><Text style={[styles.open, { color: colors.primary }]}>Open ›</Text></Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, content: { padding: 18, paddingBottom: 28 }, empty: { flex: 1, paddingHorizontal: 18 }, title: { fontSize: 28, fontWeight: '900' }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 18 },
  mapWrap: { height: 300, overflow: 'hidden', borderWidth: 1, borderRadius: 16, position: 'relative' }, routeHorizontal: { position: 'absolute', width: '120%', height: 20, left: '-10%', top: '49%', backgroundColor: 'rgba(18,103,232,0.14)', transform: [{ rotate: '-6deg' }] }, routeDiagonal: { position: 'absolute', width: '115%', height: 14, left: '-10%', top: '27%', backgroundColor: 'rgba(244,162,89,0.22)', transform: [{ rotate: '27deg' }] }, routeVertical: { position: 'absolute', width: 15, height: '120%', left: '67%', top: '-10%', backgroundColor: 'rgba(22,121,74,0.14)', transform: [{ rotate: '10deg' }] },
  verticalGrid: { position: 'absolute', top: 0, bottom: 0, borderLeftWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed' }, horizontalGrid: { position: 'absolute', left: 0, right: 0, borderTopWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed' }, mapBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 }, mapBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  marker: { position: 'absolute', width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: 17, borderWidth: 3, alignItems: 'center', justifyContent: 'center', elevation: 3 }, markerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }, mapNotice: { position: 'absolute', left: 14, right: 14, bottom: 14, padding: 12, borderRadius: 10 }, mapNoticeText: { color: '#FFFFFF', textAlign: 'center', fontSize: 13, fontWeight: '700' },
  selected: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, selectedCopy: { flex: 1, minWidth: 0 }, selectedTitle: { fontSize: 15, fontWeight: '900' }, selectedAddress: { fontSize: 12, marginTop: 4 }, coordinates: { fontSize: 11, marginTop: 5, fontVariant: ['tabular-nums'] }, coordinateHint: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 13 }, coordinateHintTitle: { fontSize: 15, fontWeight: '900' }, coordinateHintText: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 22, marginBottom: 10 }, taskRow: { borderWidth: 1, borderRadius: 13, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, listPin: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, listPinText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' }, open: { fontSize: 13, fontWeight: '900' },
});
