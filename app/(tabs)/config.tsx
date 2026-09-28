import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useApp } from '@/context/AppContext';
import { scheduleTestNotification } from '@/lib/notifications';

export default function ConfigScreen() {
  const { notificationsEnabled, refreshNotificationPermission, tasks, goals } = useApp();
  const [testing, setTesting] = useState(false);

  const enableNotifications = async () => {
    const allowed = await refreshNotificationPermission();
    if (!allowed && Platform.OS !== 'web') {
      Alert.alert('Notificações bloqueadas', 'Abra as configurações do aparelho e permita as notificações para o Meu Dia.', [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const testNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Disponível no celular', 'O teste de notificação foi pensado para Android/iPhone.');
      return;
    }
    try {
      setTesting(true);
      await scheduleTestNotification();
      Alert.alert('Teste agendado', 'Você deverá receber uma notificação em cerca de 10 segundos.');
    } finally {
      setTesting(false);
    }
  };

  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert('Lembretes cancelados', 'Os agendamentos do sistema foram cancelados. Seus dados continuam salvos no app.');
  };

  return (
    <Screen>
      <Text style={styles.eyebrow}>CONFIGURAÇÕES</Text>
      <Text style={styles.title}>Seu espaço</Text>
      <Text style={styles.subtitle}>Tudo aqui é pessoal e fica no aparelho.</Text>

      <SectionTitle title="Notificações" subtitle="Para tarefas e objetivos" />
      <View style={styles.card}>
        <View style={styles.statusLine}>
          <View style={[styles.statusDot, notificationsEnabled && styles.statusOn]} />
          <Text style={styles.statusText}>{notificationsEnabled ? 'Notificações permitidas' : 'Notificações não permitidas'}</Text>
        </View>
        <Text style={styles.cardSub}>O app usa notificações locais. Não precisa criar conta nem deixar um servidor rodando.</Text>
        <View style={styles.buttonRow}>
          <Pressable style={styles.primaryButton} onPress={enableNotifications}><Text style={styles.primaryText}>{notificationsEnabled ? 'Verificar permissão' : 'Ativar notificações'}</Text></Pressable>
          <Pressable style={styles.secondaryButton} onPress={testNotification}><Text style={styles.secondaryText}>{testing ? 'Agendando…' : 'Testar em 10s'}</Text></Pressable>
        </View>
      </View>

      <SectionTitle title="Resumo" subtitle="O que você tem salvo" />
      <View style={styles.stats}>
        <Stat number={String(tasks.length)} label="tarefas" />
        <Stat number={String(goals.filter(goal => !goal.completed).length)} label="objetivos ativos" />
        <Stat number={String(goals.filter(goal => goal.completed).length)} label="objetivos concluídos" />
      </View>

      <SectionTitle title="Manutenção" />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cancelar todos os lembretes</Text>
        <Text style={styles.cardSub}>Isso remove os agendamentos do sistema, mas não apaga suas tarefas e objetivos. Ao editar/criar um item com lembrete, um novo agendamento será criado.</Text>
        <Pressable style={styles.dangerButton} onPress={cancelAll}><Text style={styles.dangerText}>Cancelar lembretes</Text></Pressable>
      </View>

      <Text style={styles.footer}>Meu Dia · versão 1.0.0</Text>
    </Screen>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: '#5EEAD4', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#F8FAFC', fontSize: 30, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#94A3B8', fontSize: 14, marginTop: 6, marginBottom: 24 },
  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2C42', borderRadius: 18, padding: 16, marginBottom: 24 },
  statusLine: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: '#FB7185', marginRight: 8 },
  statusOn: { backgroundColor: '#34D399' },
  statusText: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  cardSub: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 15 },
  primaryButton: { flex: 1, backgroundColor: '#0F766E', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#ECFEFF', fontWeight: '900', fontSize: 12 },
  secondaryButton: { flex: 1, backgroundColor: '#172235', borderWidth: 1, borderColor: '#2B405C', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#CBD5E1', fontWeight: '900', fontSize: 12 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  stat: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2C42', borderRadius: 17, padding: 14 },
  statNumber: { color: '#5EEAD4', fontSize: 23, fontWeight: '900' },
  statLabel: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: 5 },
  cardTitle: { color: '#F8FAFC', fontWeight: '900', fontSize: 14 },
  dangerButton: { backgroundColor: '#3B1720', borderWidth: 1, borderColor: '#6B2635', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 15 },
  dangerText: { color: '#FDA4AF', fontWeight: '900', fontSize: 12 },
  footer: { color: '#475569', textAlign: 'center', marginTop: 8, fontSize: 11 },
});
