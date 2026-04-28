import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '../lib/supabase';

/** Abre primeiro a landing (`app/index.tsx`); o utilizador entra nos protocolos com "Entrar na aplicação". */
export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setHasSession(Boolean(data.session));
        setSessionReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setSessionReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
      setSessionReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) return;

    const rootSegment = segments[0];
    const inLogin = rootSegment === "login";
    const inTabs = rootSegment === "(tabs)";
    const inRoot = rootSegment === undefined || rootSegment === "index";

    if (!hasSession && inTabs) {
      router.replace("/login");
      return;
    }

    if (hasSession && (inLogin || inRoot)) {
      router.replace("/(tabs)" as const);
    }
  }, [hasSession, router, segments, sessionReady]);

  if (!sessionReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
