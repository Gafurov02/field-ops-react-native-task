import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DEMO_NOTIFICATION_SECONDS, NOTIFICATION_LEAD_MINUTES } from '../constants/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const configureNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      sound: 'default',
    });
  }
};

const ensurePermission = async (): Promise<boolean> => {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const scheduleTaskReminder = async ({
  title,
  dueAt,
  demoMode,
}: {
  title: string;
  dueAt: Date;
  demoMode: boolean;
}): Promise<string | undefined> => {
  const granted = await ensurePermission();
  if (!granted) throw new Error('Notification permission was not granted. You can enable it later in device settings.');

  const trigger: Notifications.TimeIntervalTriggerInput | Notifications.DateTriggerInput = demoMode
    ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: DEMO_NOTIFICATION_SECONDS, repeats: false }
    : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(dueAt.getTime() - NOTIFICATION_LEAD_MINUTES * 60 * 1000) };

  return Notifications.scheduleNotificationAsync({
    content: {
      title: demoMode ? 'Field Ops demo reminder' : 'Task due soon',
      body: demoMode ? `Demo reminder for: ${title}` : `${title} is due in 30 minutes.`,
      sound: 'default',
    },
    trigger,
  });
};

export const cancelTaskReminder = async (notificationId?: string) => {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
};
