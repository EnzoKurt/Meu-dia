import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Goal, Task } from '@/lib/types';
import {
  cancelNotification,
  scheduleGoalNotification,
  scheduleTaskNotification,
  setupNotifications,
} from '@/lib/notifications';

const TASKS_KEY = '@meu-dia/tasks';
const GOALS_KEY = '@meu-dia/goals';

type AppContextValue = {
  tasks: Task[];
  goals: Goal[];
  ready: boolean;
  notificationsEnabled: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'notificationId'>) => Promise<void>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'notificationId'>) => Promise<void>;
  updateGoal: (id: string, changes: Partial<Goal>) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refreshNotificationPermission: () => Promise<boolean>;
};

const AppContext = createContext<AppContextValue | null>(null);

async function saveTasks(tasks: Task[]) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

async function saveGoals(goals: Goal[]) {
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ready, setReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [storedTasks, storedGoals, notificationPermission] = await Promise.all([
          AsyncStorage.getItem(TASKS_KEY),
          AsyncStorage.getItem(GOALS_KEY),
          setupNotifications(),
        ]);

        setTasks(storedTasks ? JSON.parse(storedTasks) : []);
        setGoals(storedGoals ? JSON.parse(storedGoals) : []);
        setNotificationsEnabled(notificationPermission);
      } catch {
        Alert.alert('Ops', 'Não consegui carregar seus dados.');
      } finally {
        setReady(true);
      }
    }

    load();
  }, []);

  const addTask = useCallback(async (input: Omit<Task, 'id' | 'createdAt' | 'notificationId'>) => {
    const task: Task = {
      ...input,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const notificationId = await scheduleTaskNotification(task);
    const next = [{ ...task, notificationId }, ...tasks];
    setTasks(next);
    await saveTasks(next);
  }, [tasks]);

  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    const current = tasks.find(item => item.id === id);
    if (!current) return;

    await cancelNotification(current.notificationId);
    const updated: Task = { ...current, ...changes, notificationId: undefined };
    const notificationId = await scheduleTaskNotification(updated);
    updated.notificationId = notificationId;

    const next = tasks.map(item => item.id === id ? updated : item);
    setTasks(next);
    await saveTasks(next);
  }, [tasks]);

  const toggleTask = useCallback(async (id: string) => {
    const current = tasks.find(item => item.id === id);
    if (!current) return;
    await updateTask(id, { completed: !current.completed });
  }, [tasks, updateTask]);

  const deleteTask = useCallback(async (id: string) => {
    const current = tasks.find(item => item.id === id);
    if (!current) return;
    await cancelNotification(current.notificationId);
    const next = tasks.filter(item => item.id !== id);
    setTasks(next);
    await saveTasks(next);
  }, [tasks]);

  const addGoal = useCallback(async (input: Omit<Goal, 'id' | 'createdAt' | 'notificationId'>) => {
    const goal: Goal = {
      ...input,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const notificationId = await scheduleGoalNotification(goal);
    const next = [{ ...goal, notificationId }, ...goals];
    setGoals(next);
    await saveGoals(next);
  }, [goals]);

  const updateGoal = useCallback(async (id: string, changes: Partial<Goal>) => {
    const current = goals.find(item => item.id === id);
    if (!current) return;

    await cancelNotification(current.notificationId);
    const updated: Goal = { ...current, ...changes, notificationId: undefined };
    const notificationId = await scheduleGoalNotification(updated);
    updated.notificationId = notificationId;

    const next = goals.map(item => item.id === id ? updated : item);
    setGoals(next);
    await saveGoals(next);
  }, [goals]);

  const toggleGoal = useCallback(async (id: string) => {
    const current = goals.find(item => item.id === id);
    if (!current) return;
    await updateGoal(id, { completed: !current.completed, progress: current.completed ? current.progress : 100 });
  }, [goals, updateGoal]);

  const deleteGoal = useCallback(async (id: string) => {
    const current = goals.find(item => item.id === id);
    if (!current) return;
    await cancelNotification(current.notificationId);
    const next = goals.filter(item => item.id !== id);
    setGoals(next);
    await saveGoals(next);
  }, [goals]);

  const refreshNotificationPermission = useCallback(async () => {
    const allowed = await setupNotifications();
    setNotificationsEnabled(allowed);
    return allowed;
  }, []);

  const value = useMemo(() => ({
    tasks,
    goals,
    ready,
    notificationsEnabled,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addGoal,
    updateGoal,
    toggleGoal,
    deleteGoal,
    refreshNotificationPermission,
  }), [
    tasks,
    goals,
    ready,
    notificationsEnabled,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addGoal,
    updateGoal,
    toggleGoal,
    deleteGoal,
    refreshNotificationPermission,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
}
