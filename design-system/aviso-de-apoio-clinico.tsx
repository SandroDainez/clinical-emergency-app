/**
 * AVISO DE APOIO À DECISÃO CLÍNICA — ⚠️ **um componente**, ⛔ e ⛔ não trinta
 * frases escritas à mão.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO EXISTE PARA FECHAR ─────────────────────────
 *
 * ⚠️ Decisão do autor, 2026-09-09: *"quero criar um padrão único de aviso de
 * apoio à decisão clínica em todo o módulo AVC ⛔ e depois reutilizável nos
 * demais módulos. ⛔ Não espalhar textos diferentes escritos manualmente em
 * cada tela."*
 *
 * ⛔ ⛔ **⛔ E ⛔ eles ⛔ já estavam espalhados.** ⛔ Varredura de 2026-09-09
 * ⛔ achou ⛔ **⛔ quatro** redações diferentes fazendo o mesmo papel, ⛔ em
 * ⛔ cinco arquivos — ⛔ e a mais comum aparecia **⛔ uma vez por leitura**,
 * ⛔ o que ⛔ na Estabilização ⛔ significava ⛔ a mesma frase ⛔ **⛔ cinco
 * vezes ⛔ na mesma tela**.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ⛔ ELE **⛔ NÃO** FAZ ────────────────────────────────────
 *
 * ⛔ ⛔ **⛔ Não muda ⛔ nada do juízo clínico.** ⚠️ Exigência do autor: *"o
 * aviso ⛔ não deve mudar a cor clínica, COR/LOE, símbolo ⛔ ou veredito"*.
 * ⛔ Por isso ⛔ ele é **neutro** — ⛔ superfície de controle ⛔ e texto
 * secundário. ⛔ Se ⛔ ele usasse `warning` ⛔ ou `critical`, ⛔ passaria a
 * competir ⛔ com o alfabeto de estado do app (**E-15**), ⛔ e um disclaimer
 * ⛔ viraria alarme.
 *
 * ⛔ ⛔ **⛔ Não carrega símbolo.** ⛔ Símbolo ⛔ neste app ⛔ **⛔ é** estado
 * clínico. ⛔ Um ⚠️ ⛔ aqui ⛔ diria *"há algo errado com este paciente"*,
 * ⛔ quando ⛔ o que ⛔ se quer dizer ⛔ é *"isto é apoio, ⛔ e ⛔ não ordem"*.
 *
 * ⛔ ⛔ **⛔ Não vai em campo de coleta.** ⚠️ *"⛔ Não colocar o aviso em
 * simples campos de coleta de dados"* — ⛔ perguntar peso ⛔ não é recomendar
 * ⛔ nada, ⛔ e um disclaimer ⛔ ali ⛔ só ensina ⛔ a ignorar disclaimers.
 *
 * ── ⚠️⚠️ ⛔ ONDE ⛔ ELE MORA ────────────────────────────────────────────────
 *
 * ⛔ ⛔ **⛔ No ⛔ produtor da saída, ⛔ e ⛔ não na tela hospedeira.**
 * ⚠️ `conduta-da-fonte.tsx` ⛔ é o caso que ⛔ decide a regra: ⛔ ele é
 * ⛔ **⛔ o mesmo** desenho ⛔ na Estabilização ⛔ e ⛔ nas Correções. ⛔ Colado
 * ⛔ nas telas, ⛔ o aviso apareceria ⛔ **⛔ duas vezes ⛔ ou ⛔ nenhuma**.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PAPEL } from "./tipografia-clinica";
import { useEstilosDoTema, type Tema } from "./theme";
import { ESPACO, RAIO, TOQUE } from "./tokens";

/**
 * ⚠️⚠️ TRÊS VARIANTES, ⛔ e ⛔ elas ⛔ não são graus de gravidade — ⛔ são
 * **⛔ tipos de saída**.
 *
 *   · `recomendacao`  → o motor **interpretou**: leitura, veredito, conduta.
 *   · `altoRisco`     → há **⛔ execução** com potencial de dano: IVT, EVT,
 *                        correção terapêutica, reversão.
 *   · `calculoDose`   → há **⛔ número calculado** que vai virar seringa.
 */
export type VarianteDoAviso = "recomendacao" | "altoRisco" | "calculoDose";

/**
 * ⚠️⚠️ ⛔ OS TEXTOS SÃO **⛔ DO AUTOR**, ⛔ palavra por palavra — 2026-09-09.
 *
 * ⛔ ⛔ ⛔ E o de alto risco ⛔ está ⛔ na **⛔ segunda** redação ⛔ dele: a
 * primeira dizia *"a decisão ⛔ e a execução ⛔ **⛔ são responsabilidade** do
 * médico assistente"*, ⛔ e ⛔ ele mesmo revisou — *"eu evitaria
 * «responsabilidade» ⛔ em excesso ⛔ por tom jurídico… fica mais natural ⛔ e
 * transmite a mesma ideia"*.
 *
 * ⚠️ ⛔ A diferença ⛔ importa: ⛔ um app que ⛔ se defende ⛔ soa como ⛔ quem
 * ⛔ não confia ⛔ em quem ⛔ o usa.
 */
export const TEXTO_DO_AVISO: Readonly<Record<VarianteDoAviso, string>> = {
  recomendacao:
    "Recomendação de apoio baseada nas fontes citadas. A decisão clínica final cabe ao médico responsável, conforme o contexto individual do paciente.",
  altoRisco:
    "Apoio à decisão clínica. Confirme os dados do paciente, contraindicações e condições locais antes de executar a conduta. A decisão final e a execução cabem ao médico assistente.",
  calculoDose:
    "Cálculo baseado nos dados registrados no atendimento. Confirme peso, concentração, unidade, dose e via antes da administração.",
};

/**
 * ⚠️⚠️ ⛔ O TEXTO COMPLETO — ⛔ aceite ⛔ e `ⓘ Uso clínico e limitações`.
 *
 * ⛔ ⛔ **⛔ Uma origem só.** ⚠️ Exigência do autor: *"expor o **⛔ mesmo**
 * conteúdo"*. ⛔ Duas cópias ⛔ divergiriam ⛔ no dia em que ⛔ alguém
 * corrigisse ⛔ uma — ⛔ e ⛔ o médico teria aceitado ⛔ um texto ⛔ e lido
 * ⛔ outro.
 */
export const USO_CLINICO_E_LIMITACOES =
  "Este aplicativo é uma ferramenta de apoio à decisão clínica baseada em literatura científica e diretrizes referenciadas. Não substitui avaliação médica, julgamento clínico, protocolos institucionais ou análise individual do paciente. As recomendações apresentadas devem ser interpretadas no contexto clínico e podem não contemplar todas as situações, contraindicações, exceções ou recursos disponíveis. A decisão diagnóstica e terapêutica final é do profissional responsável pelo atendimento.";

export const TITULO_DO_USO_CLINICO = "Uso clínico e limitações";

/**
 * ── ⚠️⚠️⚠️ ⛔ SEM SAÍDA CLÍNICA, ⛔ SEM AVISO — 2026-09-09 ──────────────────
 *
 * ⚠️ Cautela do autor: *"o aviso `recomendacao` deve aparecer **⛔ apenas
 * quando houver saída clínica de fato renderizada**… evita aparecer uma frase
 * do tipo «recomendação baseada em literatura…» ⛔ num painel que, ⛔ naquele
 * momento, ⛔ **⛔ não recomendou ⛔ nada**"*.
 *
 * ⛔ ⛔ ⛔ **⛔ E ⛔ isto ⛔ não é economia de pixels.** ⛔ Um disclaimer que
 * aparece ⛔ **⛔ sempre** ⛔ vira moldura da tela, ⛔ e moldura ⛔ ninguém lê.
 * ⚠️ ⛔ Ele ⛔ só ⛔ significa alguma coisa ⛔ **⛔ ao lado de uma afirmação
 * que ⛔ o app acabou de fazer** — ⛔ e ⛔ é ⛔ exatamente ⛔ aí que ⛔ o médico
 * precisa lembrar ⛔ de quem é a decisão.
 *
 * ⛔ ⛔ **⛔ A guarda mora ⛔ no componente**, ⛔ e ⛔ não ⛔ em ⛔ cada chamada:
 * ⛔ onze pontos de uso ⛔ com ⛔ onze condições escritas à mão ⛔ é ⛔ como
 * nasce ⛔ o décimo segundo ⛔ sem ⛔ ela.
 */
export function AvisoDeApoioClinico({
  variante,
  ha,
  tr,
  testID,
}: {
  variante: VarianteDoAviso;
  /**
   * ⚠️⚠️ ⛔ **⛔ HÁ SAÍDA ⛔ NA TELA ⛔ AGORA?** ⛔ Quem chama ⛔ responde:
   * ⛔ *"⛔ há leitura visível ⛔ neste bloco"*, ⛔ *"⛔ há dose calculada
   * ⛔ sendo exibida"*. ⚠️ ⛔ `false` ⛔ **⛔ não desenha ⛔ nada** — ⛔ e ⛔ é
   * ⛔ o padrão seguro: ⛔ omitir ⛔ o aviso ⛔ é menos danoso ⛔ que ⛔ o aviso
   * ⛔ desacoplado ⛔ da saída ⛔ que ⛔ ele qualifica.
   */
  ha: boolean;
  /**
   * ⚠️ ⛔ A tradução vem **⛔ de fora**: o design system ⛔ não conhece o
   * `lib/i18n` do app, ⛔ e ⛔ é ⛔ isso que ⛔ o deixa reutilizável ⛔ noutro
   * módulo ⛔ sem arrastar dependência.
   */
  tr: (texto: string) => string;
  testID?: string;
}) {
  const e = useEstilosDoTema(criarEstilos);
  /** ⛔ ⛔ Sem saída, ⛔ sem aviso — ⛔ ver o comentário acima. */
  if (!ha) return null;
  return (
    <View style={e.aviso} testID={testID ?? `aviso-apoio-${variante}`}>
      <Text style={e.texto}>{tr(TEXTO_DO_AVISO[variante])}</Text>
    </View>
  );
}

/**
 * ── ⚠️⚠️⚠️ ⛔ O ACESSO PERMANENTE — `ⓘ Uso clínico e limitações` ────────────
 *
 * ⚠️ Exigência do autor, 2026-09-09: *"permanentemente acessível… **⛔ sem
 * obrigar o médico a fechar modal repetitivo ⛔ durante uma emergência**"*.
 *
 * ⛔ ⛔ ⛔ **⛔ Por isso ⛔ não é modal.** ⚠️ Um modal ⛔ que reabre ⛔ é ⛔ um
 * obstáculo ⛔ entre ⛔ o médico ⛔ e ⛔ o paciente; ⛔ um recolhível ⛔ no fim
 * da tela ⛔ está ⛔ sempre ⛔ lá ⛔ e ⛔ **⛔ nunca ⛔ no caminho**.
 *
 * ⚠️⚠️ ⛔ E ⛔ o texto ⛔ é ⛔ `USO_CLINICO_E_LIMITACOES` — ⛔ **⛔ a mesma
 * constante ⛔ do aceite**. ⛔ Duas cópias ⛔ divergiriam, ⛔ e ⛔ o médico
 * ⛔ teria aceitado ⛔ um texto ⛔ e lido ⛔ outro.
 */
export function AcessoAoUsoClinico({
  tr,
  testID,
}: {
  tr: (texto: string) => string;
  testID?: string;
}) {
  const e = useEstilosDoTema(criarEstilos);
  const [aberto, setAberto] = useState(false);
  return (
    <View testID={testID ?? "uso-clinico"}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        aria-expanded={aberto}
        accessibilityLabel={tr(TITULO_DO_USO_CLINICO)}
        testID="uso-clinico-abrir"
        onPress={() => setAberto((v) => !v)}
        style={({ pressed }) => [e.acesso, pressed ? { opacity: 0.7 } : null]}
      >
        <Text style={e.acessoTexto}>ⓘ {tr(TITULO_DO_USO_CLINICO)}</Text>
      </Pressable>
      {aberto ? (
        <View style={e.aviso} testID="uso-clinico-texto">
          <Text style={e.texto}>{tr(USO_CLINICO_E_LIMITACOES)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    /**
     * ⚠️ ⛔ Neutro ⛔ de propósito — ⛔ ver o cabeçalho: cor clínica ⛔ é do
     * paciente, ⛔ e ⛔ isto ⛔ não fala do paciente.
     */
    aviso: {
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderLeftWidth: 3,
      borderLeftColor: tema.cores.controlBorder,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    texto: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    /** ⚠️ ⛔ Ele é um botão, ⛔ e parece — ⛔ a trava de afordância mede isso. */
    acesso: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    acessoTexto: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
  });
