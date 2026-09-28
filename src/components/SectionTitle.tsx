import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
});
