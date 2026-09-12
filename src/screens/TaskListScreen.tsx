import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Palette } from '../theme/colors';
import { SortOption, Task } from '../types/task';
import { EmptyState } from '../components/EmptyState';
import { TaskCard } from '../components/TaskCard';

const sortLabels: Record<SortOption, string> = { createdAt: 'Added', dueAt: 'Due date', status: 'Status' };

export function TaskListScreen({ tasks, colors, isOnline, onCreate, onOpen }: { tasks: Task[]; colors: Palette; isOnline: boolean; onCreate: () => void; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const filtered = tasks
    .filter((task) => `${task.title} ${task.description} ${task.location.address}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'status') return a.status.localeCompare(b.status) || b.createdAt.localeCompare(a.createdAt);
      return sortBy === 'dueAt' ? a.dueAt.localeCompare(b.dueAt) : b.createdAt.localeCompare(a.createdAt);
    });

  return <View style={styles.screen}>
    <View style={styles.headingRow}>
      <View style={styles.headingCopy}><Text style={[styles.title, { color: colors.text }]}>Today’s work</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>{tasks.length ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} saved locally` : 'Plan your field work with confidence'}</Text></View>
      <View style={[styles.connection, { backgroundColor: isOnline ? '#DCF5E7' : '#FDE3E7' }]}><Text style={[styles.connectionText, { color: isOnline ? '#12663F' : '#A22035' }]}>{isOnline ? 'Online' : 'Offline'}</Text></View>
    </View>
    <TextInput accessibilityLabel="Search tasks" value={query} onChangeText={setQuery} placeholder="Search tasks" placeholderTextColor={colors.textMuted} style={[styles.search, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} />
    <View style={styles.sortRow}><Text style={[styles.sortLabel, { color: colors.textMuted }]}>Sort by</Text>{(Object.keys(sortLabels) as SortOption[]).map((option) => <Pressable accessibilityRole="button" key={option} onPress={() => setSortBy(option)} style={[styles.sortButton, { backgroundColor: sortBy === option ? colors.primarySoft : colors.surface, borderColor: sortBy === option ? colors.primary : colors.border }]}><Text style={[styles.sortText, { color: sortBy === option ? colors.primary : colors.textMuted }]}>{sortLabels[option]}</Text></Pressable>)}</View>
    <FlatList
      data={filtered}
      keyExtractor={(task) => task.id}
      contentContainerStyle={filtered.length ? styles.list : styles.emptyList}
      renderItem={({ item }) => <TaskCard task={item} colors={colors} onPress={() => onOpen(item.id)} />}
      ListEmptyComponent={<EmptyState colors={colors} title={query ? 'No matching tasks' : 'No tasks yet'} description={query ? 'Try another search phrase.' : 'Create your first field task. It will work even without a network connection.'} actionLabel={query ? undefined : 'Create task'} onAction={query ? undefined : onCreate} />}
      showsVerticalScrollIndicator={false}
    />
    {filtered.length > 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Create task" onPress={onCreate} style={[styles.fab, { backgroundColor: colors.primary }]}><Text style={styles.fabText}>+ Create task</Text></Pressable> : null}
  </View>;
}

import { useState } from 'react';

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  headingCopy: { flex: 1 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  connection: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, marginTop: 5 },
  connectionText: { fontSize: 12, fontWeight: '800' },
  search: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, marginBottom: 12 },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center', marginBottom: 13 },
  sortLabel: { fontSize: 12, fontWeight: '800', marginRight: 2 },
  sortButton: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  sortText: { fontSize: 12, fontWeight: '700' },
  list: { paddingBottom: 96 },
  emptyList: { flexGrow: 1, paddingBottom: 96 },
  fab: { position: 'absolute', right: 18, bottom: 20, minHeight: 50, borderRadius: 99, paddingHorizontal: 20, justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  fabText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
});
