import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cancelTaskReminder, configureNotifications, scheduleTaskReminder } from '../services/notificationService';
import { syncDeletedTask, syncPendingTasks } from '../services/syncService';
import { loadAppData, saveAppData } from '../storage/taskStorage';
import { HistoryAction, HistoryEntry, StoredAppData, SyncStatus, Task, TaskDraft, TaskStatus } from '../types/task';

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const makeLog = (taskId: string | undefined, action: HistoryAction, summary: string): HistoryEntry => ({
  id: createId(),
  taskId,
  action,
  summary,
  createdAt: new Date().toISOString(),
});

export const useTaskStore = () => {
  const [data, setData] = useState<StoredAppData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([loadAppData(), configureNotifications()])
      .then(([stored]) => alive && setData(stored))
      .catch(() => alive && setData({ tasks: [], history: [], pendingDeletions: [], theme: 'light', demoNotifications: false }));
    const unsubscribe = NetInfo.addEventListener((state) => setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false)));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (data) saveAppData(data).catch(() => setNotice('Could not save locally. Check available device storage.'));
  }, [data]);

  const addLogToTask = (task: Task, log: HistoryEntry) => ({ ...task, history: [log, ...task.history] });

  const createTask = useCallback(
    async (draft: TaskDraft) => {
      const now = new Date().toISOString();
      const taskId = createId();
      const created = makeLog(taskId, 'created', `Task “${draft.title.trim()}” was created.`);
      const attachmentLogs = draft.attachments.map((attachment) =>
        makeLog(taskId, 'attachment_added', `Image “${attachment.name}” was attached.`),
      );
      let notificationId: string | undefined;
      if (draft.status !== 'completed' && draft.status !== 'cancelled') {
        try {
          notificationId = await scheduleTaskReminder({ title: draft.title.trim(), dueAt: draft.dueAt, demoMode: data?.demoNotifications ?? false });
        } catch (error) {
          setNotice(error instanceof Error ? error.message : 'Reminder could not be scheduled.');
        }
      }
      const task: Task = {
        ...draft,
        id: taskId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        dueAt: draft.dueAt.toISOString(),
        syncStatus: 'pending',
        createdAt: now,
        updatedAt: now,
        notificationId,
        history: [created, ...attachmentLogs],
      };
      setData((current) => current && { ...current, tasks: [task, ...current.tasks], history: [created, ...attachmentLogs, ...current.history] });
      return task;
    },
    [data?.demoNotifications],
  );

  const updateTask = useCallback(
    async (taskId: string, draft: TaskDraft) => {
      const currentTask = data?.tasks.find((task) => task.id === taskId);
      if (!currentTask) return;
      await cancelTaskReminder(currentTask.notificationId).catch(() => undefined);
      let notificationId: string | undefined;
      if (draft.status !== 'completed' && draft.status !== 'cancelled') {
        try {
          notificationId = await scheduleTaskReminder({ title: draft.title.trim(), dueAt: draft.dueAt, demoMode: data?.demoNotifications ?? false });
        } catch (error) {
          setNotice(error instanceof Error ? error.message : 'Reminder could not be scheduled.');
        }
      }
      const edited = makeLog(taskId, 'edited', `Task “${draft.title.trim()}” was edited.`);
      const oldIds = new Set(currentTask.attachments.map((item) => item.id));
      const newIds = new Set(draft.attachments.map((item) => item.id));
      const attachmentLogs = [
        ...draft.attachments.filter((item) => !oldIds.has(item.id)).map((item) => makeLog(taskId, 'attachment_added', `Image “${item.name}” was attached.`)),
        ...currentTask.attachments.filter((item) => !newIds.has(item.id)).map((item) => makeLog(taskId, 'attachment_removed', `Image “${item.name}” was removed.`)),
      ];
      const statusLog = currentTask.status !== draft.status
        ? makeLog(taskId, 'status_changed', `Status changed from ${currentTask.status.replace('_', ' ')} to ${draft.status.replace('_', ' ')}.`)
        : undefined;
      const logs = [edited, ...(statusLog ? [statusLog] : []), ...attachmentLogs];
      setData((current) => current && {
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId
            ? { ...task, ...draft, title: draft.title.trim(), description: draft.description.trim(), dueAt: draft.dueAt.toISOString(), notificationId, updatedAt: new Date().toISOString(), syncStatus: 'pending', history: [...logs, ...task.history] }
            : task,
        ),
        history: [...logs, ...current.history],
      });
    },
    [data],
  );

  const changeStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    const target = data?.tasks.find((item) => item.id === taskId);
    if (target && (status === 'completed' || status === 'cancelled')) await cancelTaskReminder(target.notificationId).catch(() => undefined);
    setData((current) => {
      if (!current) return current;
      const task = current.tasks.find((item) => item.id === taskId);
      if (!task || task.status === status) return current;
      const log = makeLog(taskId, 'status_changed', `Status changed from ${task.status.replace('_', ' ')} to ${status.replace('_', ' ')}.`);
      return {
        ...current,
        tasks: current.tasks.map((item) => item.id === taskId ? { ...addLogToTask(item, log), status, notificationId: status === 'completed' || status === 'cancelled' ? undefined : item.notificationId, updatedAt: new Date().toISOString(), syncStatus: 'pending' } : item),
        history: [log, ...current.history],
      };
    });
  }, [data]);

  const deleteTask = useCallback(async (taskId: string) => {
    const task = data?.tasks.find((item) => item.id === taskId);
    if (!task) return;
    await cancelTaskReminder(task.notificationId).catch(() => undefined);
    const log = makeLog(taskId, 'deleted', `Task “${task.title}” was deleted.`);
    setData((current) => current && ({
      ...current,
      tasks: current.tasks.filter((item) => item.id !== taskId),
      pendingDeletions: [...current.pendingDeletions.filter((item) => item.taskId !== taskId), { taskId, title: task.title, deletedAt: log.createdAt }],
      history: [log, ...current.history],
    }));
  }, [data]);

  const setTheme = useCallback((theme: 'light' | 'dark') => setData((current) => current && ({ ...current, theme })), []);
  const setDemoNotifications = useCallback((enabled: boolean) => setData((current) => current && ({ ...current, demoNotifications: enabled })), []);

  const syncNow = useCallback(async () => {
    if (!data || isSyncing) return;
    if (!isOnline) {
      setNotice('You are offline. Changes are safely stored locally and will remain pending until a connection is available.');
      return;
    }
    const pending = data.tasks.filter((task) => task.syncStatus !== 'synced');
    if (pending.length === 0 && data.pendingDeletions.length === 0) {
      setNotice('Everything is already synced.');
      return;
    }
    setIsSyncing(true);
    const results = await syncPendingTasks(data.tasks);
    const deletionResults = await Promise.allSettled(data.pendingDeletions.map((item) => syncDeletedTask(item.taskId)));
    const now = new Date().toISOString();
    setData((current) => {
      if (!current) return current;
      const logs: HistoryEntry[] = [];
      const tasks = current.tasks.map((task) => {
        const result = results.find((item) => item.taskId === task.id);
        if (!result) return task;
        const log = makeLog(task.id, result.ok ? 'sync_succeeded' : 'sync_failed', result.ok ? `Task synced with mock server.` : `Sync failed: ${result.error}`);
        logs.push(log);
        const syncStatus: SyncStatus = result.ok ? 'synced' : 'failed';
        return { ...addLogToTask(task, log), syncStatus, updatedAt: result.ok ? now : task.updatedAt };
      });
      const pendingDeletions = current.pendingDeletions.filter((deletion) => {
        const index = data.pendingDeletions.findIndex((item) => item.taskId === deletion.taskId);
        const result = deletionResults[index];
        if (!result) return true;
        const ok = result.status === 'fulfilled';
        logs.push(makeLog(deletion.taskId, ok ? 'sync_succeeded' : 'sync_failed', ok ? `Deletion of “${deletion.title}” synced with mock server.` : `Deletion sync failed for “${deletion.title}”.`));
        return !ok;
      });
      return { ...current, tasks, pendingDeletions, history: [...logs, ...current.history] };
    });
    setIsSyncing(false);
    const failed = results.filter((result) => !result.ok).length + deletionResults.filter((result) => result.status === 'rejected').length;
    const total = results.length + deletionResults.length;
    setNotice(failed ? `${total - failed} change(s) synced; ${failed} failed. Check the mock server URL in README.` : `${total} change(s) synced successfully.`);
  }, [data, isOnline, isSyncing]);

  useEffect(() => {
    if (data && isOnline && (data.tasks.some((task) => task.syncStatus === 'pending') || data.pendingDeletions.length > 0)) {
      const timeout = setTimeout(() => void syncNow(), 600);
      return () => clearTimeout(timeout);
    }
  }, [data?.tasks, isOnline, syncNow]);

  return useMemo(() => ({
    data,
    isOnline,
    isSyncing,
    notice,
    clearNotice: () => setNotice(null),
    createTask,
    updateTask,
    changeStatus,
    deleteTask,
    setTheme,
    setDemoNotifications,
    syncNow,
  }), [data, isOnline, isSyncing, notice, createTask, updateTask, changeStatus, deleteTask, setTheme, setDemoNotifications, syncNow]);
};
