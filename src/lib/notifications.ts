import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Goal, Task } from './types';
import { parseLocalDate } from './utils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meu-dia', {
      name: 'Meu Dia',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 150, 250],
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function scheduleTaskNotification(task: Task): Promise<string | undefined> {
  if (Platform.OS === 'web' || !task.notify || task.completed) return undefined;

  const date = parseLocalDate(task.date, task.time);
  if (date.getTime() <= Date.now()) return undefined;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Hora do seu planejamento',
      body: task.title,
      sound: 'default',
      data: { type: 'task', id: task.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      ...(Platform.OS === 'android' ? { channelId: 'meu-dia' } : {}),
    },
  });
}

export async function scheduleGoalNotification(goal: Goal): Promise<string | undefined> {
  if (Platform.OS === 'web' || !goal.notify || goal.completed) return undefined;

  const [hour, minute] = goal.reminderTime.split(':').map(Number);
  const base = parseLocalDate(goal.targetDate, goal.reminderTime);

  let trigger: Notifications.SchedulableNotificationTriggerInput;

  if (goal.frequency === 'diaria') {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: 'meu-dia' } : {}),
    };
  } else if (goal.frequency === 'semanal') {
    const weekday = base.getDay() + 1;
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: 'meu-dia' } : {}),
    };
  } else {
    const day = Math.min(base.getDate(), 28);
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: 'meu-dia' } : {}),
    };
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Não esqueça do seu objetivo',
      body: `${goal.title} · ${goal.progress}% concluído`,
      sound: 'default',
      data: { type: 'goal', id: goal.id },
    },
    trigger,
  });
}

export async function cancelNotification(notificationId?: string) {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // O agendamento pode ter sido removido pelo próprio sistema.
  }
}

export async function scheduleTestNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Funcionou!',
      body: 'O Meu Dia consegue te lembrar das suas tarefas.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });
}
