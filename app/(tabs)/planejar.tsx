import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { Field } from '@/components/Field';
import { Pill } from '@/components/Pill';
import { DateTimeButtons } from '@/components/DateTimeButtons';
import { useApp } from '@/context/AppContext';
import { Goal, GoalFrequency } from '@/lib/types';
import { clampProgress, daysUntil, formatDate, parseLocalDate, toDateString, toTimeString } from '@/lib/utils';

export default function PlanningScreen() {
  const { goals, ready, addGoal, updateGoal, toggleGoal, deleteGoal } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const activeGoals = useMemo(() => goals.filter(goal => !goal.completed), [goals]);
  const finishedGoals = useMemo(() => goals.filter(goal => goal.completed), [goals]);

  if (!ready) return <Screen><Text style={styles.loading}>Carregando seus objetivos...</Text></Screen>;

  const openNew = () => { setEditing(null); setModalVisible(true); };

  return (
    <Screen>
      <Text style={styles.eyebrow}>PLANEJAMENTO</Text>
      <Text style={styles.title}>Para onde você quer ir?</Text>
      <Text style={styles.subtitle}>Guarde aqui o que não cabe em um único dia.</Text>

      <View style={styles.actionCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Novo objetivo</Text>
          <Text style={styles.actionSub}>Defina o que quer conquistar e deixe o app te lembrar.</Text>
        </View>
        <Pressable style={styles.addButton} onPress={openNew}><Text style={styles.addButtonText}>+</Text></Pressable>
      </View>

      <SectionTitle title="Meus objetivos" subtitle={`${activeGoals.length} ativo${activeGoals.length !== 1 ? 's' : ''}`} />
      {activeGoals.map(goal => (
        <GoalCard key={goal.id} goal={goal} onToggle={() => toggleGoal(goal.id)} onEdit={() => { setEditing(goal); setModalVisible(true); }} onDelete={() => confirmDeleteGoal(goal, deleteGoal)} />
      ))}

      {!!finishedGoals.length && (
        <>
          <View style={{ marginTop: 12 }}><SectionTitle title="Concluídos" subtitle={`${finishedGoals.length} objetivo${finishedGoals.length !== 1 ? 's' : ''}`} /></View>
          {finishedGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onToggle={() => toggleGoal(goal.id)} onEdit={() => { setEditing(goal); setModalVisible(true); }} onDelete={() => confirmDeleteGoal(goal, deleteGoal)} />
          ))}
        </>
      )}

      {!goals.length && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>Nenhum objetivo ainda.</Text>
          <Text style={styles.emptyText}>Pode ser algo como juntar dinheiro, terminar um curso, melhorar sua rotina ou realizar um projeto.</Text>
          <Pressable style={styles.primaryButton} onPress={openNew}><Text style={styles.primaryText}>Criar objetivo</Text></Pressable>
        </View>
      )}

      <GoalModal
        visible={modalVisible}
        goal={editing}
        onClose={() => setModalVisible(false)}
        onSave={async data => {
          if (editing) await updateGoal(editing.id, data);
          else await addGoal(data as Omit<Goal, 'id' | 'createdAt' | 'notificationId'>);
          setModalVisible(false);
        }}
      />
    </Screen>
  );
}

function GoalCard({ goal, onToggle, onEdit, onDelete }: { goal: Goal; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const remaining = daysUntil(goal.targetDate);
  const deadline = goal.completed ? 'Concluído' : remaining < 0 ? 'Prazo passou' : remaining === 0 ? 'É hoje' : `${remaining} dia${remaining !== 1 ? 's' : ''} restantes`;

  return (
    <View style={[styles.goalCard, goal.completed && styles.goalFinished]}>
      <View style={styles.goalHead}>
        <Pressable style={[styles.check, goal.completed && styles.checkDone]} onPress={onToggle}>
          <Text style={styles.checkText}>{goal.completed ? '✓' : ''}</Text>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={onEdit}>
          <Text style={[styles.goalTitle, goal.completed && styles.completedText]}>{goal.title}</Text>
          <Text style={styles.goalMeta}>{formatDate(goal.targetDate)} · {deadline}</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.trash}><Text style={styles.trashText}>×</Text></Pressable>
      </View>

      {!!goal.notes && <Text style={styles.goalNotes} numberOfLines={2}>{goal.notes}</Text>}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{goal.progress}%</Text>
        <Text style={styles.frequency}>Lembrete {frequencyLabel(goal.frequency).toLowerCase()} às {goal.reminderTime}</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${goal.progress}%` }]} /></View>
    </View>
  );
}

function GoalModal({ visible, goal, onClose, onSave }: { visible: boolean; goal: Goal | null; onClose: () => void; onSave: (data: Partial<Goal>) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState(toDateString(new Date(Date.now() + 30 * 86400000)));
  const [reminderTime, setReminderTime] = useState('19:00');
  const [progress, setProgress] = useState('0');
  const [frequency, setFrequency] = useState<GoalFrequency>('semanal');
  const [notify, setNotify] = useState(true);

  React.useEffect(() => {
    const ref = goal ?? null;
    const fallback = new Date(Date.now() + 30 * 86400000);
    setTitle(ref?.title ?? '');
    setNotes(ref?.notes ?? '');
    setTargetDate(ref?.targetDate ?? toDateString(fallback));
    setReminderTime(ref?.reminderTime ?? '19:00');
    setProgress(String(ref?.progress ?? 0));
    setFrequency(ref?.frequency ?? 'semanal');
    setNotify(ref?.notify ?? true);
  }, [visible, goal]);

  const save = async () => {
    const value = clampProgress(Number(progress.replace(',', '.')) || 0);
    if (!title.trim()) {
      Alert.alert('Falta uma coisa', 'Dê um nome para o objetivo.');
      return;
    }
    await onSave({
      title: title.trim(),
      notes: notes.trim(),
      targetDate,
      progress: value,
      frequency,
      reminderTime,
      notify,
      completed: goal?.completed ?? false,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>{goal ? 'Editar objetivo' : 'Novo objetivo'}</Text>
            <Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable>
          </View>
          <Field label="Objetivo" value={title} onChangeText={setTitle} placeholder="Ex.: guardar R$ 10.000" autoFocus />
          <Field label="Detalhes" value={notes} onChangeText={setNotes} placeholder="O que isso significa para você?" multiline />

          <Text style={styles.formLabel}>Prazo</Text>
          <View style={{ marginBottom: 12 }}>
            <DateTimeButtons date={targetDate} time={reminderTime} onDateChange={setTargetDate} onTimeChange={setReminderTime} />
          </View>

          <Field label="Progresso (%)" value={progress} onChangeText={setProgress} keyboardType="numeric" placeholder="0 a 100" />

          <Text style={styles.formLabel}>Como quer ser lembrado?</Text>
          <View style={styles.wrapPills}>
            <Pill label="Diário" selected={frequency === 'diaria'} onPress={() => setFrequency('diaria')} />
            <Pill label="Semanal" selected={frequency === 'semanal'} onPress={() => setFrequency('semanal')} />
            <Pill label="Mensal" selected={frequency === 'mensal'} onPress={() => setFrequency('mensal')} />
          </View>
          <Text style={styles.helper}>O horário acima será usado para o lembrete. No modo semanal, o app usa o mesmo dia da semana do prazo. No mensal, usa o dia do mês do prazo (até o dia 28).</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Lembrete ativo</Text>
              <Text style={styles.switchSub}>Repete até você concluir ou apagar o objetivo.</Text>
            </View>
            <Switch value={notify} onValueChange={setNotify} trackColor={{ false: '#334155', true: '#0F766E' }} thumbColor="#E2E8F0" />
          </View>

          <Pressable style={styles.primaryButton} onPress={save}><Text style={styles.primaryText}>{goal ? 'Salvar alterações' : 'Criar objetivo'}</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function frequencyLabel(value: GoalFrequency) {
  if (value === 'diaria') return 'diário';
  if (value === 'semanal') return 'semanal';
  return 'mensal';
}

async function confirmDeleteGoal(goal: Goal, deleteGoal: (id: string) => Promise<void>) {
  Alert.alert('Excluir objetivo?', `“${goal.title}” será removido do seu planejamento.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => deleteGoal(goal.id) },
  ]);
}

const styles = StyleSheet.create({
  loading: { color: '#CBD5E1', marginTop: 30, textAlign: 'center' },
  eyebrow: { color: '#5EEAD4', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#F8FAFC', fontSize: 30, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#94A3B8', fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 18 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#20304A', borderRadius: 20, padding: 16, marginBottom: 23 },
  actionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  actionSub: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 4, paddingRight: 14 },
  addButton: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#ECFEFF', fontSize: 29, lineHeight: 32, fontWeight: '300' },
  goalCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2C42', borderRadius: 18, padding: 14, marginBottom: 10 },
  goalFinished: { opacity: 0.7 },
  goalHead: { flexDirection: 'row', alignItems: 'center' },
  check: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkDone: { backgroundColor: '#0F766E', borderColor: '#14B8A6' },
  checkText: { color: '#F0FDFA', fontWeight: '900' },
  goalTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  completedText: { color: '#64748B', textDecorationLine: 'line-through' },
  goalMeta: { color: '#64748B', fontSize: 11, marginTop: 4 },
  goalNotes: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 11 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 },
  progressLabel: { color: '#5EEAD4', fontWeight: '900', fontSize: 13 },
  frequency: { color: '#64748B', fontSize: 11 },
  progressTrack: { height: 7, backgroundColor: '#26354D', borderRadius: 10, overflow: 'hidden', marginTop: 7 },
  progressFill: { height: '100%', backgroundColor: '#14B8A6', borderRadius: 10 },
  trash: { width: 30, alignItems: 'flex-end' },
  trashText: { color: '#64748B', fontSize: 26 },
  empty: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2C42', borderRadius: 20, padding: 24, alignItems: 'center' },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '900', marginTop: 8 },
  emptyText: { color: '#64748B', textAlign: 'center', lineHeight: 19, marginTop: 6, marginBottom: 17 },
  primaryButton: { backgroundColor: '#0F766E', borderRadius: 15, paddingVertical: 13, alignItems: 'center' },
  primaryText: { color: '#ECFEFF', fontWeight: '900', fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.78)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0F172A', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: '#22314A', padding: 20, paddingBottom: 30 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '900' },
  close: { color: '#94A3B8', fontSize: 31, lineHeight: 31 },
  formLabel: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  wrapPills: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  helper: { color: '#64748B', fontSize: 10, lineHeight: 15, marginBottom: 5 },
  switchRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingVertical: 12, marginBottom: 16, marginTop: 3 },
  switchTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
  switchSub: { color: '#64748B', fontSize: 11, marginTop: 3 },
});
