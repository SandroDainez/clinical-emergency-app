import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ESPACO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { BottomSheet } from "./bottom-sheet";
import { Header } from "./header";

export type ScreenTemplateProps = {
  /** Nome do módulo — vai na única linha de cabeçalho. */
  titulo: string;
  /** "Etapa 3", "Referência". Aparece ao lado do título. */
  etapa?: string;
  /**
   * Ação de voltar. Deve ser a MESMA função que a tela usava antes — em vários
   * módulos ela carrega handoff de dados entre telas, e trocá-la por um
   * `router.back()` genérico perderia esse comportamento.
   */
  onVoltar?: () => void;
  /** Elemento à direita do cabeçalho (badge de gravidade, indicador). */
  direita?: React.ReactNode;
  /** Texto de orientação da etapa. Ver `InstrucaoResumida`. */
  instrucao?: { resumo: string; completo?: string; tituloCompleto?: string };
  children?: React.ReactNode;
  /** Rodapé fixo: ação principal e/ou resumo de status. */
  rodape?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Template único de tela da UI 2.0 — o padrão da Fase 4.
 *
 * ```
 * ← Módulo · Etapa N        ← UMA linha
 * ─────────────────────────
 *    Conteúdo principal
 * ─────────────────────────
 *    [ Ação principal ]
 *    Resumo / status
 * ```
 *
 * Existe para resolver um problema medido, não estético: no módulo piloto havia
 * TRÊS camadas de cabeçalho empilhadas — a barra do expo-router com o nome
 * literal da rota (64 px), o cromado do módulo (61 px) e um card de cabeçalho
 * dentro da própria tela (66 px). Somavam 191 px, **27% da altura da tela**, e as
 * três diziam a mesma coisa. Numa emergência esse espaço pertence à conduta.
 *
 * O template não navega e não conhece rota: recebe `onVoltar` e devolve o toque.
 * Quem decide para onde ir continua sendo a tela.
 */
export function ScreenTemplate({
  titulo,
  etapa,
  onVoltar,
  direita,
  instrucao,
  children,
  rodape,
  style,
  testID,
}: ScreenTemplateProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={[e.raiz, style]} testID={testID}>
      <Header titulo={titulo} etapa={etapa} onVoltar={onVoltar} direita={direita} />

      <ScrollView
        style={e.corpo}
        contentContainerStyle={e.corpoConteudo}
        showsVerticalScrollIndicator={false}
      >
        {instrucao ? <InstrucaoResumida {...instrucao} /> : null}
        {children}
      </ScrollView>

      {rodape ? <View style={e.rodape}>{rodape}</View> : null}
    </View>
  );
}

/**
 * Orientação da etapa em no máximo 2 linhas, com o restante em "ver mais".
 *
 * O plano é explícito: o excedente vai para um painel, **sem remover conteúdo
 * clínico**. Por isso o texto completo continua no app e a 3 linhas de distância
 * — o que sai da tela principal é ruído visual, não informação.
 */
export function InstrucaoResumida({
  resumo,
  completo,
  tituloCompleto = "Detalhes",
}: {
  resumo: string;
  completo?: string;
  tituloCompleto?: string;
}) {
  const e = useEstilosDoTema(criarEstilos);
  const [aberto, setAberto] = useState(false);

  return (
    <View style={e.instrucao}>
      <Text style={e.instrucaoTexto} numberOfLines={2}>
        {resumo}
      </Text>

      {completo ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver mais sobre ${tituloCompleto}`}
            onPress={() => setAberto(true)}
            hitSlop={ESPACO.sm}
            style={({ pressed }) => [e.verMais, pressed && e.verMaisPressionado]}
          >
            <Text style={e.verMaisTexto}>ver mais</Text>
          </Pressable>

          <BottomSheet
            visivel={aberto}
            onFechar={() => setAberto(false)}
            titulo={tituloCompleto}
          >
            <Text style={e.instrucaoCompleta}>{completo}</Text>
          </BottomSheet>
        </>
      ) : null}
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    raiz: { flex: 1, backgroundColor: t.cores.bg },
    corpo: { flex: 1 },
    corpoConteudo: {
      paddingHorizontal: ESPACO.md,
      paddingTop: ESPACO.md,
      paddingBottom: ESPACO.xl,
      maxWidth: 560,
      width: "100%",
      alignSelf: "center",
      gap: ESPACO.md,
    },
    rodape: {
      paddingHorizontal: ESPACO.md,
      paddingTop: ESPACO.sm,
      paddingBottom: ESPACO.md,
      borderTopWidth: 1,
      borderTopColor: t.cores.border,
      backgroundColor: t.cores.bg,
      gap: ESPACO.xs,
      maxWidth: 560,
      width: "100%",
      alignSelf: "center",
    },
    instrucao: { gap: ESPACO.xs },
    instrucaoTexto: {
      ...TIPOGRAFIA.caption,
      color: t.cores.textSecondary,
      fontWeight: "400",
    },
    verMais: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
    },
    verMaisPressionado: { opacity: 0.6 },
    verMaisTexto: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "800" },
    instrucaoCompleta: {
      ...TIPOGRAFIA.body,
      color: t.cores.text,
      fontWeight: "400",
    },
  });
