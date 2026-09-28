import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export function DateTimeButtons({
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.small}>DATA</Text>
        <TextInput value={date} onChangeText={onDateChange} placeholder="AAAA-MM-DD" placeholderTextColor="#64748B" style={styles.input} />
      </View>
      <View style={styles.field}>
        <Text style={styles.small}>HORÁRIO</Text>
        <TextInput value={time} onChangeText={onTimeChange} placeholder="HH:MM" placeholderTextColor="#64748B" style={styles.input} keyboardType="numbers-and-punctuation" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  field: { flex: 1, backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#243047', padding: 11 },
  small: { color: '#64748B', fontSize: 10, fontWeight: '800', marginBottom: 3 },
  input: { color: '#F8FAFC', fontSize: 15, paddingVertical: 0 },
});
