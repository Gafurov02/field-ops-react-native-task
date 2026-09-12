import { TaskLocation, TaskStatus } from '../types/task';

export const CANDIDATE_CODE = 'SA-RN-8K42';
export const APP_STORAGE_KEY = '@field_ops/data-v1';
export const DEMO_NOTIFICATION_SECONDS = 45;
export const NOTIFICATION_LEAD_MINUTES = 30;

// Android emulator can reach the host machine through 10.0.2.2. Override this
// with EXPO_PUBLIC_MOCK_API_URL for a physical device on the same network.
export const MOCK_API_URL =
  process.env.EXPO_PUBLIC_MOCK_API_URL ?? 'http://10.0.2.2:3001';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const LOCATION_PRESETS: Array<{ label: string; location: TaskLocation }> = [
  {
    label: 'Central Office',
    location: { address: 'Amir Temur Avenue 108, Tashkent', latitude: 41.3385, longitude: 69.3346 },
  },
  {
    label: 'Warehouse North',
    location: { address: 'Kichik Halqa Road 15, Tashkent', latitude: 41.3549, longitude: 69.2577 },
  },
  {
    label: 'Service Depot',
    location: { address: 'Shota Rustaveli Street 58, Tashkent', latitude: 41.2809, longitude: 69.2693 },
  },
];
