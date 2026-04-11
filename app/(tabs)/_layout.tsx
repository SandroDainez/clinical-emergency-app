import { Tabs } from 'expo-router';
import React from 'react';

import { AppDesign } from '@/constants/app-design';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const activeTint = scheme === 'dark' ? Colors.dark.tint : AppDesign.accent.teal;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: scheme === 'dark' ? '#71717a' : AppDesign.tabBar.inactive,
        headerShown: false,
        /** Navegação por tabs só por código/URL; barra inferior oculta em todas as plataformas. */
        tabBarStyle: { display: 'none', height: 0, overflow: 'hidden' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Protocolos' }} />
      <Tabs.Screen name="explore" options={{ title: 'Mais' }} />
      <Tabs.Screen name="sepse" options={{ title: 'Sepse' }} />
    </Tabs>
  );
}
