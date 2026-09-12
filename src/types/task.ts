export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export type HistoryAction =
  | 'created'
  | 'edited'
  | 'status_changed'
  | 'attachment_added'
  | 'attachment_removed'
  | 'deleted'
  | 'sync_succeeded'
  | 'sync_failed';

export interface TaskLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface TaskAttachment {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  taskId?: string;
  action: HistoryAction;
  summary: string;
  createdAt: string;
}

export interface PendingDeletion {
  taskId: string;
  title: string;
  deletedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  location: TaskLocation;
  attachments: TaskAttachment[];
  status: TaskStatus;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  notificationId?: string;
  history: HistoryEntry[];
}

export interface TaskDraft {
  title: string;
  description: string;
  dueAt: Date;
  location: TaskLocation;
  attachments: TaskAttachment[];
  status: TaskStatus;
}

export type SortOption = 'createdAt' | 'dueAt' | 'status';
export type AppScreen = 'tasks' | 'form' | 'detail' | 'map' | 'history' | 'settings';

export interface StoredAppData {
  tasks: Task[];
  history: HistoryEntry[];
  pendingDeletions: PendingDeletion[];
  theme: 'light' | 'dark';
  demoNotifications: boolean;
}
