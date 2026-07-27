import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SubscriptionProvider } from '../lib/subscription-context';
import { LanguageProvider } from '../lib/language-context';
import { TEMAS } from '../design-system/tokens';

/**
 * Tema de navegação derivado dos nossos tokens.
 *
 * Sem isto, o quadro externo do app (a moldura das telas e o cabeçalho da
 * pilha) usava o DarkTheme do React Navigation, que é quase preto —
 * `rgb(1,1,1)` no fundo e `rgb(18,18,18)` no cabeçalho. Era a maior área escura
 * da tela, e não vinha da nossa paleta.
 *
 * O objeto é constante: não depende de estado nem de efeito, então o HTML do
 * build e o primeiro render do cliente são iguais e não há risco de repetir o
 * L-001.
 */
const CORES = TEMAS.escuro.cores;

const TEMA_NAVEGACAO: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: CORES.bg,
    card: CORES.surface,
    text: CORES.text,
    border: CORES.border,
    primary: CORES.primary,
  },
};

/** Abre primeiro a landing (`app/index.tsx`); o utilizador entra nos protocolos com "Entrar na aplicação". */
export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <LanguageProvider>
    <SubscriptionProvider>
      <ThemeProvider value={TEMA_NAVEGACAO}>
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
