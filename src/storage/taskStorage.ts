import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_STORAGE_KEY } from '../constants/config';
import { StoredAppData } from '../types/task';

const fallback: StoredAppData = { tasks: [], history: [], pendingDeletions: [], theme: 'light', demoNotifications: false };

export const loadAppData = async (): Promise<StoredAppData> => {
  const raw = await AsyncStorage.getItem(APP_STORAGE_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAppData>;
    return {
      tasks: parsed.tasks ?? [],
      history: parsed.history ?? [],
      pendingDeletions: parsed.pendingDeletions ?? [],
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      demoNotifications: Boolean(parsed.demoNotifications),
    };
  } catch {
    return fallback;
  }
};

export const saveAppData = (data: StoredAppData) => AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
