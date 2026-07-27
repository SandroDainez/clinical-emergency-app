import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SubscriptionProvider } from '../lib/subscription-context';
import { LanguageProvider } from '../lib/language-context';

/** Abre primeiro a landing (`app/index.tsx`); o utilizador entra nos protocolos com "Entrar na aplicação". */
export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
    <SubscriptionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SubscriptionProvider>
    </LanguageProvider>
  );
}
