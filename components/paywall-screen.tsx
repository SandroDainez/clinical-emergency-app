import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UNLOCK_ALL_MODULES } from "../lib/subscription";
import { resumoDeProcedencia, selosDeProcedencia } from "../lib/procedencia";
import { useTr } from "../lib/use-tr";
import { ESPACO, RAIO, TIPOGRAFIA } from "../design-system/tokens";
import { useTheme } from "../design-system/theme";

/**
 * PÁGINA DO PRODUTO — reconstruída em 2026-08-20.
 *
 * ── ⚠️ ELA NÃO VENDE, PORQUE NÃO HÁ O QUE COBRAR ───────────────────────────
 *
 * O levantamento do mecanismo de cobrança achou o seguinte: `purchase()` é uma
 * simulação que espera 1,2 s e concede Pro SEM COBRAR NADA; `restore()` sempre
 * devolve "nenhuma compra"; não há Stripe, não há RevenueCat, não há loja; e
 * `UNLOCK_ALL_MODULES = true` deixa o app inteiro liberado.
 *
 * A página anunciava preço, tinha botão "Assinar plano anual" e prometia
 * "cancelar pela loja de aplicativos". **Página de preço com botão simulado é
 * pior que página feia**: no dia em que alguém tocar querendo pagar, perde-se a
 * pessoa e a confiança junto.
 *
 * Decisão do autor: nenhum trabalho de billing nesta rodada nem nas próximas —
 * a cobrança entra quando houver massa de módulos no formato novo. Então saem o
 * preço, o botão, o "restaurar compras" e todo o texto de loja; fica o que é
 * verdade hoje.
 *
 * ⚠️ COERÊNCIA OBRIGATÓRIA COM O CÓDIGO: a página lê `UNLOCK_ALL_MODULES` e diz
 * o que ela encontrar. **Se um dia a flag mudar, a frase muda junto** — é a
 * mesma regra dos selos, aplicada ao estado do produto. Sem isso, a tela volta
 * a afirmar o que o código não faz, que é o defeito que ela acabou de perder.
 *
 * ── ⚠️ O QUE ELA VENDIA, E POR QUE ESTAVA ERRADO ───────────────────────────
 *
 * "Guia completo à beira do leito · acesso a todos os módulos clínicos,
 * fármacos, doses e calculadoras" vende ACESSO A CONTEÚDO. Conteúdo compete com
 * PDF grátis, e perde.
 *
 * O que este app faz é CONDUZIR O ATENDIMENTO: pergunta antes de mandar, tem
 * caminho para quem não sabe responder, guia até a conduta com uma decisão por
 * tela, mostra o padrão de ECG em vez de descrevê-lo, e cada recomendação tem
 * fonte com data. Nada disso estava na página — o que justifica o preço estava
 * invisível para quem ia pagar.
 *
 * ── A ORDEM MUDOU, E A ORDEM ERA PARTE DO DEFEITO ──────────────────────────
 *
 * Antes: herói → preço → CTA → comparação. Pedia a compra ANTES de mostrar o
 * que a pessoa leva. Agora: o que o app faz → o que você leva → preço → CTA →
 * procedência → legal.
 *
 * ── LISTA ÚNICA, NÃO DUAS COLUNAS ──────────────────────────────────────────
 *
 * GRATUITO tinha 5 itens e PRO tinha 11: o vazio ao lado da coluna curta parecia
 * defeito de layout. Lista única com etiqueta por item resolve a altura desigual
 * E mostra melhor o salto — o gratuito continua visível e honesto.
 *
 * ── ⚠️ OS SELOS SÃO GERADOS, NÃO ESCRITOS ──────────────────────────────────
 *
 * Ver `lib/procedencia.ts`. Os seis chips à mão (AHA 2020 · SSC 2021 · ESC 2021
 * · ADA 2022 · WAO 2021 · ARDSnet) mentiam nas duas direções e envelheciam em
 * silêncio. Agora saem de `guidelines_metadata.json`, com data de revisão.
 */

/**
 * O que o app faz — as três provas.
 *
 * ⚠️ CADA UMA É VERIFICÁVEL NO PRÓPRIO APP, e é por isso que elas podem estar
 * numa página de venda: "não sei — me guie pelos sinais" existe em sete módulos;
 * o padrão de ECG existe na hipercalemia; a fonte com data existe no metadata.
 * Promessa que a tela não cumpre é a mesma família do selo que mentia.
 */
const PROVAS = [
  {
    titulo: "Conduz passo a passo até a conduta",
    texto: "Uma decisão por tela, na ordem do atendimento — não um capítulo para ler no meio da emergência.",
  },
  {
    titulo: "Tem caminho para quem não sabe responder",
    texto: "Toda decisão oferece «não sei — me guie pelos sinais», e o app pergunta o que dá para observar até concluir.",
  },
  {
    titulo: "Cada conduta com dose, via, tempo e fonte",
    texto: "O que dar, quanto, por onde, em quanto tempo e o que reavaliar — com a fonte declarada e a data em que foi revista.",
  },
];

/**
 * O que você leva — LISTA ÚNICA, com o tier ao lado.
 *
 * A ordem é a do valor percebido, não a do plano: quem lê vê primeiro o que o
 * app faz de diferente, e só depois onde está a linha do pago.
 */
/**
 * O que tem dentro — LISTA ÚNICA, sem coluna de tier.
 *
 * ⚠️ AS ETIQUETAS GRÁTIS/PRO SAÍRAM porque hoje elas seriam falsas:
 * `UNLOCK_ALL_MODULES` está ligado e não há cobrança. E as duas colunas de
 * antes (5 itens × 11 itens) eram o layout quebrado que o autor reprovou — o
 * vazio ao lado da coluna curta parecia defeito, não desenho.
 */
const ITENS = [
  "Parada cardiorrespiratória conduzida por voz e cronômetro",
  "Ritmos de parada, farmacologia e causas reversíveis",
  "Bradiarritmias, taquiarritmias e cuidados pós-PCR",
  "Sepse, choque e drogas vasoativas com cálculo de dose",
  "Via aérea — sequência rápida — e ventilação mecânica",
  "AVC, síndrome coronariana e tromboembolismo pulmonar",
  "Cetoacidose, eletrólitos e injúria renal aguda",
  "Anafilaxia, intoxicações, trauma, TCE e eclâmpsia",
  "Calculadoras e escores com os insumos do próprio caso",
  "Log clínico do atendimento e resumo operacional",
];

export default function PaywallScreen() {
  const tr = useTr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cores } = useTheme();

  const selos = selosDeProcedencia();
  const resumo = resumoDeProcedencia();

  return (
    <View style={[e.tela, { backgroundColor: cores.bg, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[e.corpo, { paddingBottom: insets.bottom + ESPACO.xl }]}
        showsVerticalScrollIndicator={false}>
        <Pressable
          style={[e.fechar, { backgroundColor: cores.surface, borderColor: cores.border }]}
          onPress={() => router.back()}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={tr("Fechar")}>
          <Text style={[e.fecharTexto, { color: cores.textSecondary }]}>✕</Text>
        </Pressable>

        {/* ── 1 · O QUE O APP FAZ ──────────────────────────────────────── */}
        <View style={e.bloco}>
          <Text style={[e.etiqueta, { color: cores.primary }]}>{tr("EMERGÊNCIA CLÍNICA")}</Text>
          <Text style={[e.titulo, { color: cores.text }]}>
            {tr("Ele conduz o atendimento, não é um manual para consultar")}
          </Text>
          {PROVAS.map((p) => (
            <View key={p.titulo} style={[e.prova, { borderColor: cores.border }]}>
              <Text style={[e.provaTitulo, { color: cores.text }]}>{tr(p.titulo)}</Text>
              <Text style={[e.provaTexto, { color: cores.textSecondary }]}>{tr(p.texto)}</Text>
            </View>
          ))}
        </View>

        {/* ── 2 · O QUE TEM DENTRO — lista única, sem colunas ──────────── */}
        <View style={e.bloco}>
          <Text style={[e.secao, { color: cores.text }]}>{tr("O que tem dentro")}</Text>
          {ITENS.map((i) => (
            <View key={i} style={e.item}>
              <Text style={[e.marcador, { color: cores.primary }]}>•</Text>
              <Text style={[e.itemTexto, { color: cores.text }]}>{tr(i)}</Text>
            </View>
          ))}
        </View>

        {/* ── 3 · ESTADO HONESTO ──────────────────────────────────────── */}
        <View style={[e.estado, { borderColor: cores.border, backgroundColor: cores.surface }]}>
          <Text style={[e.estadoTitulo, { color: cores.text }]}>
            {tr("Em desenvolvimento ativo")}
          </Text>
          <Text style={[e.estadoTexto, { color: cores.textSecondary }]}>
            {UNLOCK_ALL_MODULES
              ? tr("Todos os módulos estão liberados. Não há cobrança, plano nem assinatura — e enquanto não houver, esta página não vai fingir que há.")
              : tr("Parte dos módulos exige assinatura.")}
          </Text>
        </View>

        {/* ── 4 · PROCEDÊNCIA — o melhor argumento, e estava invisível ── */}
        <View style={e.bloco}>
          <Text style={[e.secao, { color: cores.text }]}>{tr("Procedência")}</Text>
          <Text style={[e.procedenciaLinha, { color: cores.textSecondary }]}>
            {tr("Toda conduta do app tem fonte declarada e data de revisão.")}
          </Text>
          <View style={e.selos}>
            {selos.map((s) => (
              <View
                key={s.id}
                style={[e.selo, { borderColor: cores.border, backgroundColor: cores.surface }]}>
                <Text style={[e.seloNome, { color: cores.text }]} numberOfLines={1}>
                  {s.sigla} {s.versao}
                </Text>
                <Text style={[e.seloData, { color: cores.textSecondary }]}>
                  {tr("revisto em")} {s.revisto}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[e.procedenciaNota, { color: cores.textSecondary }]}>
            {`${resumo.fontes} `}
            {tr("fontes declaradas, cobrindo")}
            {` ${resumo.modulos} `}
            {tr("módulos · revisões entre")}
            {` ${resumo.revisaoMaisAntiga} `}
            {tr("e")}
            {` ${resumo.revisaoMaisRecente}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1 },
  corpo: {
    paddingHorizontal: ESPACO.md,
    paddingTop: ESPACO.sm,
    gap: ESPACO.lg,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  fechar: {
    alignSelf: "flex-end",
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fecharTexto: { ...TIPOGRAFIA.caption, fontWeight: "700" },

  bloco: { gap: ESPACO.sm },
  etiqueta: { ...TIPOGRAFIA.micro, letterSpacing: 1.2 },
  titulo: { ...TIPOGRAFIA.title, marginBottom: ESPACO.xs },
  secao: { ...TIPOGRAFIA.step },

  // Hierarquia por PESO E ESPAÇO, não por cor: a prova é um bloco com borda
  // fina e título forte, sem fundo colorido competindo com o CTA.
  prova: { borderLeftWidth: 2, paddingLeft: ESPACO.sm, gap: 2 },
  provaTitulo: { ...TIPOGRAFIA.body, fontWeight: "700" },
  provaTexto: { ...TIPOGRAFIA.caption },

  item: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
  marcador: { ...TIPOGRAFIA.caption, fontWeight: "800" },
  estado: { borderWidth: 1, borderRadius: RAIO.card, padding: ESPACO.md, gap: 4 },
  estadoTitulo: { ...TIPOGRAFIA.body, fontWeight: "800" },
  estadoTexto: { ...TIPOGRAFIA.caption },
  itemTexto: { ...TIPOGRAFIA.caption, flex: 1 },

  procedenciaLinha: { ...TIPOGRAFIA.caption },
  selos: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
  selo: { borderWidth: 1, borderRadius: RAIO.input, paddingHorizontal: 10, paddingVertical: 6 },
  seloNome: { ...TIPOGRAFIA.micro, fontWeight: "800" },
  seloData: { ...TIPOGRAFIA.micro, fontWeight: "500" },
  procedenciaNota: { ...TIPOGRAFIA.micro },

});
