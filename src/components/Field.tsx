import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#64748B"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 13 },
  label: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#243047',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 15,
  },
});
