import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5EEAD4',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje', tabBarIcon: () => <TabIcon text="✓" /> }} />
      <Tabs.Screen name="planejar" options={{ title: 'Planejar', tabBarIcon: () => <TabIcon text="◎" /> }} />
      <Tabs.Screen name="config" options={{ title: 'Config', tabBarIcon: () => <TabIcon text="⚙" /> }} />
    </Tabs>
  );
}

function TabIcon({ text }: { text: string }) {
  return <Text style={{ fontSize: 20, color: '#94A3B8' }}>{text}</Text>;
}
