import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import ReferenceBackHeader from "./reference-back-header";
import { useTr } from "../../lib/use-tr";
import { markProtocolSessionForResume } from "../../lib/module-session-navigation";
import { OVACE_CAUSA_JA_IDENTIFICADA, OVACE_NA_PCR } from "../../lib/ovace-na-pcr";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type SinalDeGravidade = { sinal: string; detalhe: string };

export type PassoOvace = {
  ordem: string;
  titulo: string;
  detalhe: string;
  alerta?: boolean;
};

// ── Dados clínicos ────────────────────────────────────────────────────────────

/**
 * Engasgo (OVACE) no adulto — conteúdo clínico.
 *
 * Fonte: Destaques das Diretrizes de RCP e ACE de 2025 da American Heart
 * Association, edição em português do Brasil (JN-1580), Figura 6 e a seção de
 * Suporte Básico de Vida em adultos.
 *
 * POR QUE ESTE MÓDULO EXISTE — E O QUE MUDOU EM 2025
 *
 * A AHA 2025 introduziu um algoritmo NOVO para obstrução de via aérea por corpo
 * estranho no adulto, e a mudança inverte o que se ensinava: o primeiro gesto
 * passou a ser GOLPES NAS COSTAS, e só depois as compressões abdominais. Antes,
 * a manobra de escolha no adulto era a compressão abdominal isolada.
 *
 * O app não tinha nenhum conteúdo de OVACE — a auditoria do bundle ACLS contra
 * a fonte primária registrou essa lacuna explicitamente. Um médico que abrisse
 * o app diante de um engasgo não encontrava nada, e quem se guiasse pela
 * memória do curso antigo faria a sequência desatualizada.
 *
 * Exportado para reúso por uma eventual versão v2 da tela — importado, nunca
 * copiado, como nas demais telas de referência do ACLS.
 */
export const SINAIS_DE_GRAVIDADE: SinalDeGravidade[] = [
  { sinal: "Tosse fraca ou ausente", detalhe: "A tosse eficaz é o melhor mecanismo de desobstrução — quando ela enfraquece, a obstrução virou grave." },
  { sinal: "Incapaz de falar", detalhe: "Não consegue emitir som nem responder. Pergunte: “Você está engasgado?”" },
  { sinal: "Alteração de cor (cianose)", detalhe: "Lábios e extremidades azulados indicam hipóxia já instalada." },
  { sinal: "Estado mental alterado", detalhe: "Sonolência, confusão ou perda de contato — precede a inconsciência." },
  { sinal: "Apneia", detalhe: "Ausência de esforço respiratório eficaz." },
];

export const PASSOS_OVACE: PassoOvace[] = [
  {
    ordem: "1",
    titulo: "Verifique a segurança do local",
    detalhe: "Antes de qualquer manobra, garanta que o ambiente é seguro para você e para a vítima.",
  },
  {
    ordem: "2",
    titulo: "Obstrução é GRAVE ou leve?",
    detalhe:
      "Se a vítima tosse com força, fala e respira, a obstrução é LEVE: INCENTIVE A TOSSE e continue observando. Não interfira — a tosse é mais eficaz que qualquer manobra. Se houver qualquer sinal de gravidade, siga adiante.",
  },
  {
    ordem: "3",
    titulo: "Acione o sistema de emergência",
    detalhe:
      "Na obstrução grave, chame ajuda ANTES de esgotar as manobras. A vítima que perde a consciência pode evoluir rapidamente para parada cardiorrespiratória.",
  },
  {
    ordem: "4",
    titulo: "5 golpes nas costas → 5 compressões abdominais",
    detalhe:
      "Faça ciclos repetidos: 5 golpes (tapas) firmes entre as escápulas, com a base da mão, seguidos de 5 compressões abdominais. Repita até o objeto ser expelido ou a vítima ficar inconsciente. ONDE COMPRIMIR: punho fechado ACIMA DO UMBIGO e ABAIXO do apêndice xifoide, envolvido pela outra mão, com tração rápida para dentro e para cima. Comprimir alto demais é o mecanismo da lesão visceral — e é o erro de quem nunca fez a manobra.",
    alerta: true,
  },
  {
    ordem: "5",
    titulo: "Se o objeto for expelido",
    detalhe:
      "AVALIAÇÃO MÉDICA É NECESSÁRIA MESMO EM QUEM FICOU ASSINTOMÁTICO — sair andando não descarta nada. Três motivos: lesão de via aérea pelo objeto ou pela manobra, corpo estranho residual que não foi expelido inteiro, e lesão visceral pelas compressões abdominais. Mantenha a vítima em observação até a chegada do serviço médico de emergência.",
  },
  {
    ordem: "6",
    titulo: "Se a vítima ficar INCONSCIENTE",
    detalhe:
      "Inicie a RCP imediatamente e siga o algoritmo de SBV do adulto até a chegada do suporte avançado. Comece pelas COMPRESSÕES.",
    alerta: true,
  },
];

// ── Componentes ───────────────────────────────────────────────────────────────

function CardPasso({ passo }: { passo: PassoOvace }) {
  const tr = useTr();
  return (
    <View style={[cp.card, passo.alerta ? cp.cardAlerta : null]}>
      <View style={cp.header}>
        <View style={[cp.ordemBadge, passo.alerta ? cp.ordemBadgeAlerta : null]}>
          <Text style={cp.ordemTexto}>{passo.ordem}</Text>
        </View>
        <Text style={cp.titulo}>{tr(passo.titulo)}</Text>
      </View>
      <Text style={cp.detalhe}>{tr(passo.detalhe)}</Text>
    </View>
  );
}

// ── Tela ──────────────────────────────────────────────────────────────────────

export default function AclsChokingScreen() {
  const tr = useTr();
  const router = useRouter();
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      <ReferenceBackHeader label={tr("ACLS · Engasgo (OVACE)")} />

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · Referência")}</Text>
        <Text style={s.introTitle}>{tr("Engasgo (OVACE) no Adulto")}</Text>
        <Text style={s.introSubtitle}>{tr("Obstrução de via aérea por corpo estranho")}</Text>
        <View style={s.introRule} />
        <Text style={s.introBody}>
          {tr(
            "A obstrução leve se resolve com a própria tosse. A obstrução grave é uma emergência de minutos: a vítima que perde a consciência evolui rapidamente para parada.",
          )}
        </Text>
      </View>

      {/* O que mudou */}
      <View style={s.mudouCard}>
        <Text style={s.mudouEyebrow}>{tr("Mudou em 2025")}</Text>
        <Text style={s.mudouTitulo}>{tr("Golpes nas costas vêm PRIMEIRO")}</Text>
        <Text style={s.mudouCorpo}>
          {tr(
            "A AHA 2025 passou a recomendar ciclos de 5 golpes nas costas SEGUIDOS de 5 compressões abdominais. Antes, a manobra de escolha no adulto era a compressão abdominal isolada. Quem se guiar pela memória do curso antigo vai começar pela manobra errada.",
          )}
        </Text>
      </View>

      {/* Sinais de gravidade */}
      <View style={s.sinaisCard}>
        <Text style={s.sinaisTitulo}>{tr("Sinais de obstrução GRAVE")}</Text>
        <Text style={s.sinaisIntro}>
          {tr("Qualquer um destes já define obstrução grave e manda agir:")}
        </Text>
        {SINAIS_DE_GRAVIDADE.map((s2) => (
          <View key={s2.sinal} style={s.sinalLinha}>
            <View style={s.sinalMarcador} />
            <View style={s.sinalTextos}>
              <Text style={s.sinalNome}>{tr(s2.sinal)}</Text>
              <Text style={s.sinalDetalhe}>{tr(s2.detalhe)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Passos */}
      <View style={s.grupo}>
        <View style={s.grupoHeader}>
          <Text style={s.grupoTitulo}>{tr("Sequência")}</Text>
          <Text style={s.grupoSubtitulo}>{tr("Do reconhecimento à RCP")}</Text>
        </View>
        {PASSOS_OVACE.map((p) => (
          <CardPasso key={p.ordem} passo={p} />
        ))}
      </View>

      {/* PONTE PARA A PCR — R-33.
          O passo 6 mandava "iniciar a RCP" e não oferecia caminho nenhum: nem
          ponteiro, nem `targets`, nem router. Busca por `pcr-adulto` nesta tela
          retornava zero, no momento em que a pessoa acaba de MUDAR DE
          ALGORITMO. E a particularidade da boca vivia só aqui — na superfície
          de onde ela SAIU, não naquela em que ela está. */}
      <View style={s.pcrCard}>
        <Text style={s.pcrTitulo}>{tr("Virou parada — o que muda na RCP")}</Text>
        <Text style={s.pcrCorpo}>{tr(OVACE_NA_PCR)}</Text>
        <Text style={s.pcrCorpo}>{tr(OVACE_CAUSA_JA_IDENTIFICADA)}</Text>
        <Pressable
          onPress={() => {
            // Pré-marca a hipóxia como SUSPEITA no destino: a causa já é
            // conhecida, e o app não deve pedir que se procure o que a própria
            // navegação sabe. "suspeita" e não "abordada" — ela só é abordada
            // quando o objeto sair.
            markProtocolSessionForResume("pcr_adulto", ["hipoxia"]);
            router.push("/modulos/pcr-adulto?from_module=ovace-adulto" as Href);
          }}
          style={({ pressed }) => [s.pcrBotao, pressed && s.pcrBotaoPressed]}>
          <Text style={s.pcrBotaoTexto}>{tr("Abrir PCR no adulto")}</Text>
          <Text style={s.pcrBotaoChevron}>›</Text>
        </Pressable>
      </View>

      {/* Exceção da gestante e do obeso */}
      <View style={s.excecaoCard}>
        <Text style={s.excecaoTitulo}>{tr("⚠️ Quando as compressões são TORÁCICAS")}</Text>
        <Text style={s.excecaoCorpo}>
          {tr(
            "Na gestação em fase final — ou sempre que o socorrista não conseguir circundar o abdome da vítima — as 5 compressões são TORÁCICAS, não abdominais. ONDE: na METADE INFERIOR DO ESTERNO — a MESMA referência da compressão da RCP, que você já conhece. Os 5 golpes nas costas continuam iguais.",
          )}
        </Text>
      </View>

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>{tr("Não confundir com a via aérea difícil da intubação")}</Text>
        <Text style={s.footerBody}>
          {tr(
            "Este módulo é do engasgo presenciado, com a vítima ainda respondendo ou recém-inconsciente. Corpo estranho encontrado durante a intubação, angioedema e abscesso são via aérea difícil — ver o módulo de ISR.",
          )}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>
          {tr("Baseado em AHA 2025 — Destaques das Diretrizes de RCP e ACE (JN-1580), Figura 6 e Suporte Básico de Vida em adultos")}
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos do CardPasso ──────────────────────────────────────────────────────

const cp = StyleSheet.create({
  card: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#565e6c",
    borderLeftWidth: 5,
    borderLeftColor: "#1d4ed8",
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAlerta: { borderLeftColor: "#c2410c" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  ordemBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#1d4ed8",
  },
  ordemBadgeAlerta: { backgroundColor: "#c2410c" },
  ordemTexto: { fontSize: 14, fontWeight: "800", color: "#f1f5f9" },
  titulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: 22,
  },
  detalhe: { fontSize: 13, lineHeight: 20, color: "#aab6c6", fontWeight: "500" },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#292e38" },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },

  introCard: {
    backgroundColor: "#383e4a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#7fb3ff",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#aab6c6",
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: { height: 1, backgroundColor: "#565e6c" },
  introBody: { fontSize: 14, lineHeight: 21, color: "#aab6c6", fontWeight: "500" },

  mudouCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#7fb3ff",
    gap: 6,
  },
  mudouEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#7fb3ff",
  },
  mudouTitulo: {
    fontSize: 19,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  mudouCorpo: { fontSize: 13, lineHeight: 20, color: "#aab6c6", fontWeight: "500" },

  sinaisCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 12,
  },
  sinaisTitulo: { fontSize: 15, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.2 },
  sinaisIntro: { fontSize: 13, lineHeight: 19, color: "#aab6c6", fontWeight: "500" },
  sinalLinha: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  sinalMarcador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
    backgroundColor: "#c2410c",
  },
  sinalTextos: { flex: 1, gap: 1 },
  sinalNome: { fontSize: 14, fontWeight: "800", color: "#f1f5f9", lineHeight: 20 },
  sinalDetalhe: { fontSize: 12, lineHeight: 18, color: "#aab6c6", fontWeight: "500" },

  grupo: { gap: 10 },
  grupoHeader: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  grupoTitulo: { fontSize: 18, fontWeight: "800", color: "#7fb3ff", letterSpacing: -0.2 },
  grupoSubtitulo: { fontSize: 12, fontWeight: "600", color: "#aab6c6", lineHeight: 17 },

  pcrCard: {
    backgroundColor: "#2a1f2e",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#a855f7",
    gap: 10,
  },
  pcrTitulo: { fontSize: 15, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.2 },
  pcrCorpo: { fontSize: 13, lineHeight: 20, color: "#e2d9e7", fontWeight: "600" },
  pcrBotao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3b2a42",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a855f7",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 44,
  },
  pcrBotaoPressed: { opacity: 0.85 },
  pcrBotaoTexto: { fontSize: 14, fontWeight: "800", color: "#f1f5f9" },
  pcrBotaoChevron: { fontSize: 18, fontWeight: "800", color: "#a855f7" },

  excecaoCard: {
    backgroundColor: "#3a2f2a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#c2410c",
    gap: 8,
  },
  excecaoTitulo: { fontSize: 15, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.2 },
  excecaoCorpo: { fontSize: 13, lineHeight: 20, color: "#e7d9d2", fontWeight: "600" },

  footerCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 10,
  },
  footerTitle: { fontSize: 13, fontWeight: "800", color: "#7fb3ff" },
  footerBody: { fontSize: 13, lineHeight: 20, color: "#aab6c6", fontWeight: "500" },
  footerRule: { height: 1, backgroundColor: "#565e6c" },
  footerSource: { fontSize: 11, fontWeight: "600", color: "#aab6c6", letterSpacing: 0.2 },
});
