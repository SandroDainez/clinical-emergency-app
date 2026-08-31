import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { supabase } from '../lib/supabase';
import { backendClinicoDisponivel } from '../lib/backend-clinico';
import { useTr } from '../lib/use-tr';
import { loadCurrentAppUser } from '../lib/app-user';
import {
  destinoDaGuarda,
  ehRotaPublica,
  type DestinoDaGuarda,
} from '../lib/guarda-de-acesso';

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

/**
 * ⚠️⚠️ A GUARDA MORA NA RAIZ — ⛔ e ⛔ não em `(tabs)/_layout.tsx`.
 *
 * ⛔ `modulos/[id]`, `session-history` e `session-history/[sessionId]` estão
 * **fora** de `(tabs)`. Guardar as abas protegeria ⛔ duas telas e deixaria
 * ⛔ **todos os módulos clínicos** abertos por URL — o buraco de hoje, menor.
 *
 * ⚠️ Aqui, ⛔ toda rota nasce fechada, e abrir exige entrar na lista de permissão
 * de `guarda-de-acesso.ts`, ⛔ por decisão escrita.
 */
function useAcessoClinico(): DestinoDaGuarda {
  const segmentos = useSegments();
  const [estado, setEstado] = useState<{
    backendDisponivel: boolean;
    carregando: boolean;
    autenticado: boolean;
    status?: 'pendente' | 'ativo' | 'bloqueado';
  }>({ backendDisponivel: backendClinicoDisponivel(), carregando: true, autenticado: false });

  useEffect(() => {
    let vivo = true;

    async function resolver() {
      if (!backendClinicoDisponivel() || !supabase) {
        /**
         * ⚠️ Modo local: ⛔ não há sessão remota para resolver. A capacidade é
         * lida em `destinoDaGuarda`, ⛔ e ⛔ não decidida aqui.
         */
        if (vivo) setEstado({ backendDisponivel: false, carregando: false, autenticado: false });
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!vivo) return;
      if (!data.session) {
        setEstado({ backendDisponivel: true, carregando: false, autenticado: false });
        return;
      }
      const { data: perfil } = await loadCurrentAppUser();
      if (!vivo) return;
      setEstado({ backendDisponivel: true, carregando: false, autenticado: true, status: perfil?.status });
    }

    resolver();
    /** ⚠️ Login e logout precisam reavaliar ⛔ sem recarregar a página. */
    const { data: sub } = supabase
      ? supabase.auth.onAuthStateChange(() => {
          setEstado((e) => ({ ...e, carregando: true }));
          resolver();
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (ehRotaPublica(segmentos)) return 'liberado';
  return destinoDaGuarda(estado);
}

/** ⚠️ Tela neutra: ⛔ nenhum conteúdo clínico, ⛔ nem por um quadro. */
function Aviso({ texto, carregando }: { texto?: string; carregando?: boolean }) {
  const tr = useTr();
  return (
    <View style={guarda.raiz} testID="guarda-de-acesso">
      {carregando ? <ActivityIndicator color={CORES.primary} /> : null}
      {texto ? <Text style={guarda.texto}>{tr(texto)}</Text> : null}
    </View>
  );
}

const guarda = StyleSheet.create({
  raiz: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: CORES.bg,
  },
  texto: {
    color: CORES.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 420,
  },
});

export default function RootLayout() {
  const destino = useAcessoClinico();

  /**
   * ⚠️⚠️ ⛔ NÃO RENDERIZA O `Stack` enquanto ⛔ não estiver liberado.
   *
   * ⛔ Redirecionar dentro de um efeito ⛔ não basta: a tela clínica chega a
   * desenhar por um quadro antes de sair. ⚠️⚠️ **Um quadro é vazamento** — e no
   * reload por URL direta é ⛔ exatamente onde ele apareceria.
   */
  if (destino === 'carregando') {
    return (
      <LanguageProvider>
        <ThemeProvider value={TEMA_NAVEGACAO}>
          <Aviso carregando />
          <StatusBar style="light" />
        </ThemeProvider>
      </LanguageProvider>
    );
  }

  if (destino === 'login') return <Redirect href="/" />;

  /** ⚠️ Modo local abre os motores clínicos — e ⛔ nada remoto existe para vazar. */

  if (destino === 'aguardando_aprovacao' || destino === 'conta_indisponivel') {
    return (
      <LanguageProvider>
        <ThemeProvider value={TEMA_NAVEGACAO}>
          <Aviso
            texto={
              destino === 'aguardando_aprovacao'
                ? 'Sua conta está aguardando aprovação do administrador. Você será avisado quando o acesso for liberado.'
                : 'Esta conta não está disponível para acesso. Fale com o administrador.'
            }
          />
          <StatusBar style="light" />
        </ThemeProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
    <SubscriptionProvider>
      <ThemeProvider value={TEMA_NAVEGACAO}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Sem esta linha, o Stack raiz desenha um cabeçalho de 64 px com o
              nome literal da rota ("modulos") acima de todo módulo clínico —
              espaço perdido e informação nenhuma. O voltar continua no cromado
              do módulo (telas antigas) ou no cabeçalho do ScreenTemplate
              (telas migradas). */}
          <Stack.Screen name="modulos" options={{ headerShown: false }} />
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
