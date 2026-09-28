import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatDate, parseLocalDate, pad, toDateString } from '@/lib/utils';

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
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [pickerValue, setPickerValue] = useState(() => parseLocalDate(date, time));

  useEffect(() => {
    setPickerValue(parseLocalDate(date, time));
  }, [date, time]);

  const onChangeDate = (event: DateTimePickerEvent, value?: Date) => {
    setShowDate(false);
    if (event.type === 'set' && value) {
      setPickerValue(value);
      onDateChange(toDateString(value));
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, value?: Date) => {
    setShowTime(false);
    if (event.type === 'set' && value) {
      setPickerValue(value);
      onTimeChange(`${pad(value.getHours())}:${pad(value.getMinutes())}`);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => setShowDate(true)}>
          <Text style={styles.small}>DATA</Text>
          <Text style={styles.value}>{formatDate(date)}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setShowTime(true)}>
          <Text style={styles.small}>HORÁRIO</Text>
          <Text style={styles.value}>{time}</Text>
        </Pressable>
      </View>

      {showDate && <DateTimePicker value={pickerValue} mode="date" onChange={onChangeDate} />}
      {showTime && <DateTimePicker value={pickerValue} mode="time" onChange={onChangeTime} />}
      {Platform.OS === 'android' ? null : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  button: { flex: 1, backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#243047', padding: 12 },
  small: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  value: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginTop: 4 },
});
