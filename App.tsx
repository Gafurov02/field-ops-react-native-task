import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CANDIDATE_CODE } from './src/constants/config';
import { useTaskStore } from './src/hooks/useTaskStore';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { MapScreen } from './src/screens/MapScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { TaskFormScreen } from './src/screens/TaskFormScreen';
import { TaskListScreen } from './src/screens/TaskListScreen';
import { getPalette } from './src/theme/colors';
import { AppScreen, TaskDraft } from './src/types/task';

const tabItems: Array<{ screen: Extract<AppScreen, 'tasks' | 'map' | 'history' | 'settings'>; label: string; icon: string }> = [
  { screen: 'tasks', label: 'Tasks', icon: '✓' }, { screen: 'map', label: 'Map', icon: '⌖' }, { screen: 'history', label: 'History', icon: '◷' }, { screen: 'settings', label: 'Settings', icon: '⚙' },
];

export default function App() {
  const store = useTaskStore();
  const [screen, setScreen] = useState<AppScreen>('tasks');
  const [detailTaskId, setDetailTaskId] = useState<string | undefined>();
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const data = store.data;
  const colors = getPalette(data?.theme ?? 'light');
  const selectedTask = data?.tasks.find((task) => task.id === detailTaskId);
  const editingTask = data?.tasks.find((task) => task.id === editingTaskId);

  const openTask = (taskId: string) => { setDetailTaskId(taskId); setScreen('detail'); };
  const openNewTask = () => { setEditingTaskId(undefined); setScreen('form'); };
  const editTask = () => { setEditingTaskId(detailTaskId); setScreen('form'); };
  const saveTask = async (draft: TaskDraft) => {
    if (editingTaskId) {
      await store.updateTask(editingTaskId, draft);
      setDetailTaskId(editingTaskId);
    } else {
      const task = await store.createTask(draft);
      setDetailTaskId(task.id);
    }
    setScreen('detail');
  };
  const backToTasks = () => { setScreen('tasks'); setDetailTaskId(undefined); setEditingTaskId(undefined); };

  if (!data) return <SafeAreaView style={[styles.loading, { backgroundColor: colors.background }]}><StatusBar style="dark" /><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.loadingText, { color: colors.textMuted }]}>Preparing your offline workspace…</Text></SafeAreaView>;
  const showAppChrome = screen !== 'form' && screen !== 'detail';
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
    <StatusBar style={data.theme === 'dark' ? 'light' : 'dark'} />
    {showAppChrome ? <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}><View><Text style={[styles.brand, { color: colors.text }]}>Field Ops</Text><Text style={[styles.brandSub, { color: colors.textMuted }]}>Offline task workspace</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Toggle light and dark theme" onPress={() => store.setTheme(data.theme === 'light' ? 'dark' : 'light')} style={[styles.themeToggle, { backgroundColor: colors.primarySoft }]}><Text style={[styles.themeIcon, { color: colors.primary }]}>{data.theme === 'light' ? '☾' : '☀'}</Text></Pressable></View> : null}
    <View style={styles.content}>
      {screen === 'tasks' ? <TaskListScreen tasks={data.tasks} colors={colors} isOnline={store.isOnline} onCreate={openNewTask} onOpen={openTask} /> : null}
      {screen === 'form' ? <TaskFormScreen task={editingTask} colors={colors} demoMode={data.demoNotifications} onBack={() => selectedTask ? setScreen('detail') : backToTasks()} onSave={saveTask} /> : null}
      {screen === 'detail' && selectedTask ? <TaskDetailScreen task={selectedTask} colors={colors} onBack={backToTasks} onEdit={editTask} onStatusChange={(status) => store.changeStatus(selectedTask.id, status)} onDelete={async () => { await store.deleteTask(selectedTask.id); backToTasks(); }} /> : null}
      {screen === 'detail' && !selectedTask ? <TaskListScreen tasks={data.tasks} colors={colors} isOnline={store.isOnline} onCreate={openNewTask} onOpen={openTask} /> : null}
      {screen === 'map' ? <MapScreen tasks={data.tasks} colors={colors} onOpenTask={openTask} /> : null}
      {screen === 'history' ? <HistoryScreen history={data.history} colors={colors} /> : null}
      {screen === 'settings' ? <SettingsScreen tasks={data.tasks} pendingDeletions={data.pendingDeletions} colors={colors} theme={data.theme} demoNotifications={data.demoNotifications} isOnline={store.isOnline} isSyncing={store.isSyncing} onThemeChange={store.setTheme} onDemoChange={store.setDemoNotifications} onSyncNow={() => void store.syncNow()} /> : null}
    </View>
    {showAppChrome ? <View style={[styles.tabs, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>{tabItems.map((item) => <Pressable key={item.screen} accessibilityRole="tab" accessibilityState={{ selected: screen === item.screen }} onPress={() => setScreen(item.screen)} style={styles.tab}><Text style={[styles.tabIcon, { color: screen === item.screen ? colors.primary : colors.textMuted }]}>{item.icon}</Text><Text style={[styles.tabLabel, { color: screen === item.screen ? colors.primary : colors.textMuted }]}>{item.label}</Text></Pressable>)}</View> : null}
    <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}><Text style={[styles.footerText, { color: colors.textMuted }]}>Candidate code: <Text style={{ color: colors.primary, fontWeight: '900' }}>{CANDIDATE_CODE}</Text></Text></View>
    {store.notice ? <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={store.clearNotice} style={[styles.notice, { backgroundColor: colors.text }]}><Text style={[styles.noticeText, { color: colors.surface }]}>{store.notice}</Text><Text style={[styles.noticeDismiss, { color: colors.surface }]}>×</Text></Pressable> : null}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' }, loadingText: { marginTop: 12, fontSize: 14 },
  header: { paddingHorizontal: 18, paddingVertical: 12, minHeight: 67, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { fontSize: 20, fontWeight: '900' }, brandSub: { fontSize: 11, marginTop: 2 }, themeToggle: { height: 38, width: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, themeIcon: { fontSize: 20, fontWeight: '900' },
  tabs: { minHeight: 58, borderTopWidth: 1, flexDirection: 'row' }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 5 }, tabIcon: { fontSize: 18, lineHeight: 19 }, tabLabel: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  footer: { minHeight: 26, borderTopWidth: 1, alignItems: 'center', justifyContent: 'center' }, footerText: { fontSize: 10 },
  notice: { position: 'absolute', left: 18, right: 18, bottom: 93, minHeight: 54, padding: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 5 }, noticeText: { flex: 1, fontSize: 12, lineHeight: 17 }, noticeDismiss: { fontSize: 22, fontWeight: '400' },
});
