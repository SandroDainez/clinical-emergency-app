import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22d3ee",
        tabBarInactiveTintColor: "#64748b",
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
