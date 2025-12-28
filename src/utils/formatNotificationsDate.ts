import { Notification } from '#notifications';

export function groupNotifications(
  notifications: Notification[]
): Array<{ title: string; items: Notification[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups = {
    Bugün: [] as Notification[],
    Dün: [] as Notification[],
    'Geçen Hafta': [] as Notification[],
  };

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.createdAt);
    notificationDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - notificationDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) {
      groups.Bugün.push(notification);
    } else if (diffDays === 1) {
      groups.Dün.push(notification);
    } else if (diffDays <= 7) {
      groups['Geçen Hafta'].push(notification);
    }
  });

  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  return (['Bugün', 'Dün', 'Geçen Hafta'] as const)
    .map(title => ({ title, items: groups[title] }))
    .filter(group => group.items.length > 0);
}
