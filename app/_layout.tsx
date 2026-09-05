import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { supabase } from '../lib/supabase';
import {
  backendClinicoDisponivel,
  definirPersistenciaRemota,
} from '../lib/backend-clinico';
import { gravarProva, invalidarProva, lerProva } from '../lib/prova-de-acesso';
import { useTr } from '../lib/use-tr';
import { loadCurrentAppUser } from '../lib/app-user';
import {
  destinoDaGuarda,
  ehRotaPublica,
  provaValida,
  type DestinoDaGuarda,
} from '../lib/guarda-de-acesso';

import { SubscriptionProvider } from '../lib/subscription-context';
import ConsentScreen from '../components/consent-screen';
import { consentimentoAceito, registrarConsentimento } from '../lib/consentimento';
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
    rpcFalhou?: boolean;
    provaLocalValida?: boolean;
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
      const uid = data.session.user?.id;
      const { data: perfil, errorMessage } = await loadCurrentAppUser();
      if (!vivo) return;

      /**
       * ⚠️⚠️ A PROVA SÓ NASCE DE UM `ativo` CONFIRMADO — e morre em ⛔ qualquer
       * recusa confirmada. ⛔ Gravá-la noutro estado transformaria a degradação
       * numa porta: bastaria uma conta pendente ser vista uma vez.
       */
      if (perfil?.status === 'ativo' && uid) gravarProva(uid, Date.now());
      if (perfil?.status === 'pendente' || perfil?.status === 'bloqueado') invalidarProva();

      /** ⚠️ Ausência de resposta ⛔ não é conta inválida — são estados distintos. */
      const rpcFalhou = !perfil && !!errorMessage;
      setEstado({
        backendDisponivel: true,
        carregando: false,
        autenticado: true,
        status: perfil?.status,
        rpcFalhou,
        provaLocalValida: provaValida(lerProva(), uid, Date.now()),
      });
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

  const destino = ehRotaPublica(segmentos) ? 'liberado_online' : destinoDaGuarda(estado);

  /**
   * ⚠️⚠️ A persistência remota segue o destino, ⛔ e ⛔ só ela o escreve.
   *
   * ⛔ Em `liberado_local_degradado` há backend configurado, ⛔ mas ⛔ nenhuma
   * confirmação — então dado remoto fica indisponível, ⛔ e ⛔ não "vazio".
   */
  definirPersistenciaRemota(destino === 'liberado_online' && estado.backendDisponivel);

  return destino;
}

/** ⚠️ A faixa passa por `tr()` como o resto da interface. */
function FaixaDegradada() {
  const tr = useTr();
  return (
    <Text style={guarda.faixaTexto}>
      {tr('Modo local — histórico indisponível. O que você registrar aqui não será salvo no servidor.')}
    </Text>
  );
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
  /** ⚠️ Cor de aviso, ⛔ e ⛔ não de erro: ⛔ nada quebrou, algo está degradado. */
  /**
   * ⚠️⚠️ Opaca e em tela cheia. ⛔ Sem `backgroundColor` sólido ⛔ ou com
   * `zIndex` menor, o conteúdo clínico apareceria por baixo — e a cobertura
   * deixaria de cumprir o que a substituição cumpria.
   */
  cobertura: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CORES.bg,
  },
  faixa: {
    backgroundColor: CORES.surface,
    borderBottomWidth: 2,
    borderBottomColor: CORES.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  faixaTexto: { color: CORES.warning, fontSize: 12, lineHeight: 17 },
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
   * ⚠️⚠️ ESTES HOOKS FICAM NO TOPO — ⛔ ANTES DE TODO `return` CONDICIONAL.
   *
   * ⛔ A versão anterior os punha depois dos returns de `login` e
   * `aguardando_aprovacao`: nesses caminhos os hooks ⛔ não rodavam, ⛔ e nos
   * outros rodavam — **contagem de hooks variável entre renders**, que é o
   * React #300/#418 que travou o módulo em produção. ⚠️ Regra dos hooks: todo
   * hook roda em TODO render, ⛔ e por isso ele vem antes de qualquer saída.
   *
   * ⚠️ Lido em efeito, ⛔ e ⛔ não no render: o primeiro quadro do cliente tem de
   * bater com o do build estático. ⛔ `undefined` = ainda ⛔ não sei — ⛔ e nesse
   * estado ⛔ nada clínico aparece.
   */
  const [aceitou, setAceitou] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    setAceitou(consentimentoAceito());
  }, []);

  /**
   * ⚠️⚠️ ⛔ NÃO RENDERIZA O `Stack` enquanto ⛔ não estiver liberado.
   *
   * ⛔ Redirecionar dentro de um efeito ⛔ não basta: a tela clínica chega a
   * desenhar por um quadro antes de sair. ⚠️⚠️ **Um quadro é vazamento** — e no
   * reload por URL direta é ⛔ exatamente onde ele apareceria.
   */
  /**
   * ⚠️⚠️ EM `carregando`, O `Stack` CONTINUA MONTADO — e a cobertura é que esconde.
   *
   * ── ⚠️⚠️ O DEFEITO QUE ISTO FECHA (achado em uso real, 2026-08-31) ────────
   *
   * ⛔ A versão anterior **substituía** o `<Stack>` por uma tela de carregamento.
   * ⚠️ Só que o login faz `router.replace("/(tabs)")` logo depois de autenticar —
   * e nesse instante `onAuthStateChange` já tinha posto `carregando: true`.
   *
   * ⚠️⚠️ Os segmentos viravam `["(tabs)"]`, a rota deixava de ser pública, o
   * destino virava `carregando`, **o navegador desmontava — e a navegação sumia
   * junto**. O `Stack` remontava na rota inicial, e o médico voltava para o
   * login. ⛔ Na segunda tentativa a sessão já estava em cache e a janela fechava
   * rápido demais para desmontar: **entrava**.
   *
   * ⚠️ Login que só funciona na segunda tentativa, ⛔ de forma reproduzível.
   *
   * ── ⚠️ POR QUE COBRIR, ⛔ E ⛔ NÃO SUBSTITUIR ──────────────────────────────
   *
   * ⚠️ A propriedade que importa é *"⛔ nenhum quadro de conteúdo clínico antes da
   * decisão"* — e uma cobertura **opaca em tela cheia** entrega isso igual.
   * ⛔ O que ela ⛔ não faz é destruir o navegador no meio de uma navegação.
   *
   * ⚠️ Os estados **terminais** — `pendente`, `bloqueado`, `login` — seguem com
   * retorno antecipado: neles ⛔ não há navegação em curso para perder.
   */
  if (destino === 'login') return <Redirect href="/" />;

  /** ⚠️ Modo local abre os motores clínicos — e ⛔ nada remoto existe para vazar. */

  /**
   * ⚠️⚠️ MODO DEGRADADO ENTRA DIRETO NO MÓDULO — ⛔ sem spinner, ⛔ sem parede.
   *
   * ⛔ Um médico já autorizado ⛔ não pode perder o algoritmo clínico porque o
   * Supabase caiu. ⚠️ O aviso de que o histórico está indisponível é
   * responsabilidade das telas que o consomem, ⛔ e ⛔ não desta guarda.
   */
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

  /**
   * ⚠️⚠️ O MODO DEGRADADO PRECISA SER **VISÍVEL**, ⛔ e ⛔ não bloqueante.
   *
   * ⛔ Modal ⛔ ou spinner aqui seria o oposto do desenho: o médico entrou
   * ⛔ justamente porque o motor clínico funciona ⛔ sem o servidor. ⚠️ Mas ele
   * precisa **saber** que o que fizer ⛔ não está sendo persistido — senão
   * descobre depois, procurando um registro que ⛔ nunca existiu.
   */
  const degradado = destino === 'liberado_local_degradado';
  /** ⚠️ Cobre sem desmontar: o navegador continua vivo por baixo. */
  const cobrindo = destino === 'carregando';

  /**
   * ⚠️ O ACEITE PRECEDE O CONTEÚDO CLÍNICO, ⛔ e vem DEPOIS da guarda: os
   * destinos terminais (`login`, `aguardando_aprovacao`, `conta_indisponivel`)
   * já retornaram acima, então aqui só chegam os que abrem conteúdo.
   */
  const precisaConsentir = !cobrindo && aceitou === false;

  return (
    <LanguageProvider>
    <SubscriptionProvider>
      <ThemeProvider value={TEMA_NAVEGACAO}>
        {cobrindo ? (
          <View style={guarda.cobertura} testID="guarda-cobertura">
            <ActivityIndicator color={CORES.primary} />
          </View>
        ) : null}
        {/**
          * ⚠️⚠️ O CONSENTIMENTO COBRE, ⛔ NÃO SUBSTITUI — mesma disciplina de
          * `cobrindo`. A versão anterior fazia `return <ConsentScreen>` cedo,
          * desmontando o `Stack` inteiro; no build estático (output: static)
          * isso remontava a árvore entre o HTML pré-renderizado e o cliente, e
          * o React abortava a hidratação com o erro #300 — o módulo desenhava o
          * título ⛔ e mais nada tocável. Cobrindo por cima, o `Stack` nasce uma
          * vez ⛔ e vive; a parede é uma camada opaca sobre ele.
          *
          * ⚠️ `aceitou === false` só depois do efeito: em `undefined` (servidor
          * ⛔ e primeiro quadro do cliente) ⛔ nada cobre, ⛔ e os dois quadros batem.
          */}
        {precisaConsentir ? (
          <View style={guarda.cobertura} testID="consentimento-cobertura">
            <ConsentScreen
              onAccept={() => {
                registrarConsentimento();
                setAceitou(true);
              }}
            />
          </View>
        ) : null}
        {degradado ? (
          <View style={guarda.faixa} testID="guarda-modo-degradado">
            <FaixaDegradada />
          </View>
        ) : null}
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
