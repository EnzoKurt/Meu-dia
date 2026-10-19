import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { Field } from '@/components/Field';
import { Pill } from '@/components/Pill';
import { DateTimeButtons } from '@/components/DateTimeButtons';
import { Goal, Priority, Task } from '@/lib/types';
import { formatLongDate, isToday, toDateString, toTimeString } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { tasks, ready, addTask, updateTask, toggleTask, deleteTask, notificationsEnabled } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const today = toDateString(new Date());
  const todaysTasks = useMemo(
    () => tasks.filter(task => task.date === today).sort((a, b) => a.time.localeCompare(b.time)),
    [tasks, today]
  );

  const completed = todaysTasks.filter(item => item.completed).length;
  const pending = todaysTasks.length - completed;
  const progress = todaysTasks.length ? Math.round((completed / todaysTasks.length) * 100) : 0;

  const openNew = () => {
    setEditing(null);
    setModalVisible(true);
  };

  if (!ready) {
    return <Screen><Text style={styles.loading}>Carregando seu dia...</Text></Screen>;
  }

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.bellButton}
            onPress={() => router.push('/lembretes')}
            accessibilityLabel="Abrir lembretes"
          >
          <Text style={styles.bellText}>🔔</Text>
            </Pressable>
          
          <Pressable
            style={styles.planButton}
            onPress={() => router.push('/planejar')}
          >
          <Text style={styles.planButtonText}>Objetivos</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.date}>{capitalize(formatLongDate(today))}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHead}>
          <View>
            <Text style={styles.summaryTitle}>{pending ? `${pending} coisa${pending > 1 ? 's' : ''} pendente${pending > 1 ? 's' : ''}` : 'Tudo certo por hoje'}</Text>
            <Text style={styles.summarySub}>{completed} concluída{completed !== 1 ? 's' : ''} de {todaysTasks.length}</Text>
          </View>
          <Text style={styles.percent}>{progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.notificationInfo}>
        <Text style={styles.notificationIcon}>🔔</Text>
        <Text style={styles.notificationText}>
          {notificationsEnabled ? 'Seus lembretes estão ativados.' : 'Ative as notificações para não perder seus horários.'}
        </Text>
      </View>

      <View style={styles.sectionRow}>
        <SectionTitle title="Hoje" subtitle={todaysTasks.length ? 'Sua agenda em ordem de horário' : 'Adicione sua primeira tarefa do dia'} />
        <Pressable style={styles.addSmall} onPress={openNew}><Text style={styles.addSmallText}>+ Tarefa</Text></Pressable>
      </View>

      {todaysTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={() => toggleTask(task.id)}
          onEdit={() => { setEditing(task); setModalVisible(true); }}
          onDelete={() => confirmDeleteTask(task, deleteTask)}
        />
      ))}

      {!todaysTasks.length && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗓️</Text>
          <Text style={styles.emptyTitle}>Seu dia está aberto.</Text>
          <Text style={styles.emptySub}>Coloque aqui o que realmente precisa acontecer hoje.</Text>
          <Pressable style={styles.primaryButton} onPress={openNew}><Text style={styles.primaryText}>Criar primeira tarefa</Text></Pressable>
        </View>
      )}

      <TaskModal
        visible={modalVisible}
        task={editing}
        onClose={() => setModalVisible(false)}
        onSave={async data => {
          if (editing) await updateTask(editing.id, data);
          else await addTask(data as Omit<Task, 'id' | 'createdAt' | 'notificationId'>);
          setModalVisible(false);
        }}
      />
    </Screen>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={[styles.taskCard, task.completed && styles.taskDone]}>
      <Pressable style={[styles.check, task.completed && styles.checkDone]} onPress={onToggle}>
        <Text style={styles.checkText}>{task.completed ? '✓' : ''}</Text>
      </Pressable>
      <Pressable style={styles.taskBody} onPress={onEdit}>
        <View style={styles.taskTopLine}>
          <Text style={[styles.taskTime, task.completed && styles.muted]}>{task.time}</Text>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority) }]} />
        </View>
        <Text style={[styles.taskTitle, task.completed && styles.completedText]}>{task.title}</Text>
        {!!task.notes && <Text style={styles.taskNotes} numberOfLines={2}>{task.notes}</Text>}
      </Pressable>
      <Pressable onPress={onDelete} style={styles.trash}><Text style={styles.trashText}>×</Text></Pressable>
    </View>
  );
}

function TaskModal({ visible, task, onClose, onSave }: { visible: boolean; task: Task | null; onClose: () => void; onSave: (data: Partial<Task>) => Promise<void> }) {
  const now = new Date();
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [date, setDate] = useState(task?.date ?? toDateString(now));
  const [time, setTime] = useState(task?.time ?? toTimeString(new Date(now.getTime() + 3600000)));
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'media');
  const [notify, setNotify] = useState(task?.notify ?? true);

  React.useEffect(() => {
    if (!visible) return;
    const current = task ?? null;
    const ref = new Date();
    setTitle(current?.title ?? '');
    setNotes(current?.notes ?? '');
    setDate(current?.date ?? toDateString(ref));
    setTime(current?.time ?? toTimeString(new Date(ref.getTime() + 3600000)));
    setPriority(current?.priority ?? 'media');
    setNotify(current?.notify ?? true);
  }, [visible, task]);

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Falta uma coisa', 'Dê um nome para a tarefa.');
      return;
    }
    await onSave({ title: title.trim(), notes: notes.trim(), date, time, priority, notify });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>{task ? 'Editar tarefa' : 'Nova tarefa'}</Text>
            <Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable>
          </View>
          <Field label="Tarefa" value={title} onChangeText={setTitle} placeholder="Ex.: estudar C#, ir à academia..." autoFocus />
          <Field label="Observação" value={notes} onChangeText={setNotes} placeholder="Opcional" multiline />
          <DateTimeButtons date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />

          <Text style={styles.formLabel}>Prioridade</Text>
          <View style={styles.wrapPills}>
            <Pill label="Alta" selected={priority === 'alta'} onPress={() => setPriority('alta')} />
            <Pill label="Média" selected={priority === 'media'} onPress={() => setPriority('media')} />
            <Pill label="Baixa" selected={priority === 'baixa'} onPress={() => setPriority('baixa')} />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Me lembrar</Text>
              <Text style={styles.switchSub}>Notificação no horário da tarefa</Text>
            </View>
            <Switch value={notify} onValueChange={setNotify} trackColor={{ false: '#334155', true: '#0F766E' }} thumbColor="#E2E8F0" />
          </View>

          <Pressable style={styles.primaryButton} onPress={save}><Text style={styles.primaryText}>{task ? 'Salvar alterações' : 'Adicionar tarefa'}</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function capitalize(text: string) { return text.charAt(0).toUpperCase() + text.slice(1); }
function priorityColor(priority: Priority) { return priority === 'alta' ? '#FB7185' : priority === 'media' ? '#FBBF24' : '#38BDF8'; }

async function confirmDeleteTask(task: Task, deleteTask: (id: string) => Promise<void>) {
  Alert.alert('Excluir tarefa?', `“${task.title}” será removida do seu planejamento.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => deleteTask(task.id) },
  ]);
}

const styles = StyleSheet.create({
  loading: { color: '#CBD5E1', marginTop: 30, textAlign: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#5EEAD4', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  greeting: { color: '#F8FAFC', fontSize: 30, fontWeight: '900', marginTop: 3 },
  date: { color: '#94A3B8', fontSize: 14, marginTop: 5, marginBottom: 18 },
  planButton: { backgroundColor: '#13202F', borderWidth: 1, borderColor: '#234052', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 },
  planButtonText: { color: '#99F6E4', fontWeight: '800', fontSize: 12 },
  summaryCard: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#20304A', borderRadius: 20, padding: 17 },
  summaryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { color: '#F8FAFC', fontWeight: '900', fontSize: 18 },
  summarySub: { color: '#94A3B8', marginTop: 4, fontSize: 12 },
  percent: { color: '#5EEAD4', fontSize: 24, fontWeight: '900' },
  progressTrack: { height: 8, backgroundColor: '#26354D', borderRadius: 20, overflow: 'hidden', marginTop: 14 },
  progressFill: { height: '100%', backgroundColor: '#14B8A6', borderRadius: 20 },
  notificationInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0E1A2B', borderRadius: 14, padding: 11, marginTop: 12, marginBottom: 23 },
  notificationIcon: { fontSize: 16, marginRight: 8 },
  notificationText: { color: '#94A3B8', fontSize: 12, flex: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  addSmall: { backgroundColor: '#0F766E', borderRadius: 16, paddingHorizontal: 11, paddingVertical: 8 },
  addSmallText: { color: '#ECFEFF', fontWeight: '900', fontSize: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2C42', borderRadius: 17, padding: 12, marginBottom: 10 },
  taskDone: { opacity: 0.72 },
  check: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 11 },
  checkDone: { backgroundColor: '#0F766E', borderColor: '#14B8A6' },
  checkText: { color: '#F0FDFA', fontWeight: '900' },
  taskBody: { flex: 1 },
  taskTopLine: { flexDirection: 'row', alignItems: 'center' },
  taskTime: { color: '#5EEAD4', fontSize: 12, fontWeight: '900' },
  muted: { color: '#64748B' },
  priorityDot: { width: 7, height: 7, borderRadius: 7, marginLeft: 7 },
  taskTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800', marginTop: 4 },
  completedText: { color: '#64748B', textDecorationLine: 'line-through' },
  taskNotes: { color: '#64748B', fontSize: 12, marginTop: 3 },
  trash: { width: 30, height: 36, justifyContent: 'center', alignItems: 'center' },
  trashText: { color: '#64748B', fontSize: 26, fontWeight: '300' },
  empty: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#1F2C42', padding: 24, marginTop: 2 },
  emptyEmoji: { fontSize: 40, marginBottom: 9 },
  emptyTitle: { color: '#F8FAFC', fontWeight: '900', fontSize: 17 },
  emptySub: { color: '#64748B', textAlign: 'center', marginTop: 5, marginBottom: 17, lineHeight: 19 },
  primaryButton: { backgroundColor: '#0F766E', borderRadius: 15, paddingVertical: 13, alignItems: 'center' },
  primaryText: { color: '#ECFEFF', fontWeight: '900', fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.78)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0F172A', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: '#22314A', padding: 20, paddingBottom: 30 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '900' },
  close: { color: '#94A3B8', fontSize: 31, lineHeight: 31 },
  formLabel: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  wrapPills: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 3 },
  switchRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingVertical: 12, marginBottom: 16 },
  switchTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
  switchSub: { color: '#64748B', fontSize: 11, marginTop: 3 },
});
