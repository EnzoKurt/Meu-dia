export type Priority = 'alta' | 'media' | 'baixa';
export type GoalFrequency = 'diaria' | 'semanal' | 'mensal';

export type Task = {
  id: string;
  title: string;
  notes: string;
  date: string;
  time: string;
  priority: Priority;
  notify: boolean;
  completed: boolean;
  notificationId?: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  notes: string;
  targetDate: string;
  progress: number;
  frequency: GoalFrequency;
  reminderTime: string;
  notify: boolean;
  completed: boolean;
  notificationId?: string;
  createdAt: string;
};
