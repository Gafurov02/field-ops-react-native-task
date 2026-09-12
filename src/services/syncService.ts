import { MOCK_API_URL } from '../constants/config';
import { Task } from '../types/task';

const request = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${MOCK_API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Mock server returned ${response.status}.`);
  return response;
};

// Last-write-wins: local pending changes are the source of truth when a device reconnects.
export const syncTask = async (task: Task): Promise<void> => {
  const lookup = await request(`/tasks?id=${encodeURIComponent(task.id)}`);
  const matching = (await lookup.json()) as Task[];
  const body = JSON.stringify({ ...task, syncStatus: 'synced' });
  if (matching.length > 0) {
    await request(`/tasks/${task.id}`, { method: 'PUT', body });
  } else {
    await request('/tasks', { method: 'POST', body });
  }
};

export const syncPendingTasks = async (tasks: Task[]) => {
  const pending = tasks.filter((task) => task.syncStatus !== 'synced');
  const result = await Promise.allSettled(pending.map(syncTask));
  return result.map((entry, index) => ({
    taskId: pending[index].id,
    ok: entry.status === 'fulfilled',
    error: entry.status === 'rejected' ? (entry.reason instanceof Error ? entry.reason.message : 'Sync failed.') : undefined,
}));
};

export const syncDeletedTask = async (taskId: string): Promise<void> => {
  const response = await fetch(`${MOCK_API_URL}/tasks/${taskId}`, { method: 'DELETE' });
  // A missing remote record is already equivalent to a successfully synchronized deletion.
  if (!response.ok && response.status !== 404) throw new Error(`Mock server returned ${response.status}.`);
};
