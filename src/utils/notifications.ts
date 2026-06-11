import * as Notifications from 'expo-notifications';

// Bildirim foreground'dayken de görünsün
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_ID = 'ayna-daily-reminder';

// Her gün 23:00 — yargısız, sakin hatırlatma (Ayna sesi).
export async function setupDailyReminder(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let granted = status === 'granted';
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.status === 'granted';
    }
    if (!granted) return;

    // Zaten kuruluysa tekrar kurma
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.some(n => n.identifier === REMINDER_ID)) return;

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: 'Ayna',
        body: 'Günü kapatmadan aynana bir bak. Bugün bir şeyle kendine dön.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 23,
        minute: 0,
      },
    });
  } catch {
    // bildirim kurulamazsa app akışını bozma
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    /* yoksa sorun değil */
  }
}
