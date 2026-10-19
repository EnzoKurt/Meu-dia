
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Screen } from '@/components/Screen';

export default function LembretesScreen() {
  const { tasks, goals, notificationsEnabled } = useApp();

  const now = new Date();
  const hoje = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const proximasTarefas = tasks
    .filter(t =>
      t.notify &&
      !t.completed &&
      (t.date > hoje ||
        (t.date === hoje && t.time >=
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`))
    )
    .sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );

  const objetivosAtivos = goals.filter(
    g => g.notify && !g.completed
  );

  return (
    <Screen>
      <ScrollView>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹ Voltar</Text>
          </Pressable>

          <Text style={styles.title}>Meus lembretes</Text>
          <Text style={styles.subtitle}>
            Consulte o que ainda precisa da sua atenção.
          </Text>
        </View>

        <View style={styles.status}>
          <Text style={styles.statusTitle}>
            {notificationsEnabled
              ? '✓ Notificações permitidas'
              : '! Notificações não permitidas'}
          </Text>

          <Pressable
            onPress={() => router.push('/(tabs)/config')}
          >
            <Text style={styles.link}>Configurar notificações</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Próximas tarefas
        </Text>

        {proximasTarefas.length === 0 ? (
          <Text style={styles.empty}>
            Nenhuma tarefa futura com lembrete ativo.
          </Text>
        ) : (
          proximasTarefas.map(task => (
            <View key={task.id} style={styles.card}>
              <Text style={styles.itemTitle}>{task.title}</Text>
              <Text style={styles.detail}>
                {task.date} às {task.time}
              </Text>
              {task.subtasks?.map(sub => (
                <Text key={sub.id} style={styles.subtask}>
                  {sub.completed ? '✓' : '•'} {sub.title}
                </Text>
              ))}
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>
          Objetivos com lembretes
        </Text>

        {objetivosAtivos.length === 0 ? (
          <Text style={styles.empty}>
            Nenhum objetivo com lembrete ativo.
          </Text>
        ) : (
          objetivosAtivos.map(goal => (
            <View key={goal.id} style={styles.card}>
              <Text style={styles.itemTitle}>{goal.title}</Text>
              <Text style={styles.detail}>
                Frequência: {frequencia(goal.frequency)}
              </Text>
              <Text style={styles.detail}>
                Horário: {goal.reminderTime}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.note}>
          Esta tela lista os lembretes cadastrados no app.
          Ela não representa o histórico de notificações já recebidas.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function frequencia(valor: string) {
  if (valor === 'diaria') return 'Diária';
  if (valor === 'semanal') return 'Semanal';
  return 'Mensal';
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  back: {
    color: '#5EEAD4',
    fontSize: 15,
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 20,
  },
  status: {
    backgroundColor: '#111C2F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statusTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  link: {
    color: '#5EEAD4',
    marginTop: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1F2C42',
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 15,
  },
  detail: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
  subtask: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 8,
    paddingLeft: 8,
  },
  empty: {
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 22,
  },
  note: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 18,
    marginBottom: 25,
  },
});
