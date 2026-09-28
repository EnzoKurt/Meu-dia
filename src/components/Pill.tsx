import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export function Pill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#243047',
    marginRight: 8,
    marginBottom: 8,
  },
  selected: { backgroundColor: '#0F766E', borderColor: '#14B8A6' },
  text: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  selectedText: { color: '#ECFEFF' },
});
