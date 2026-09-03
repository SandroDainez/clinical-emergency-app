import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";
import { ClinicalShellHost } from "../ui-v2/clinical-shell-host";
import { useRouter } from "expo-router";
import { useTr } from "../../lib/use-tr";
import { TIPOGRAFIA, RAIO, SOMBRA, TEMAS } from "../../design-system/tokens";
import { OVACE_CAUSA_JA_IDENTIFICADA, OVACE_NA_PCR } from "../../lib/ovace-na-pcr";
import { executeClinicalContextNavigation, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";

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
  const [gravidade, setGravidade] = useState<"leve" | "grave" | undefined>();
  const [desfecho, setDesfecho] = useState<"mantem" | "expulso" | "inconsciente" | undefined>();
  const [showSupport, setShowSupport] = useState(false);
  const pcrNavigation = getClinicalContextNavigation("ovace-inconsciente-pcr");
  const step = !gravidade ? 1 : gravidade === "grave" && desfecho ? 3 : 2;
  const phase = !gravidade
    ? "Reconhecimento e classificação"
    : gravidade === "leve"
      ? "Tosse eficaz e observação"
      : desfecho
        ? "Desfecho e próxima ação"
        : "Manobras e reavaliação";
  return (
    <View style={s.screen}>
      <ClinicalShellHost
        protocol={tr("Engasgo (OVACE)")}
        phase={tr(phase)}
        step={step}
        moduleSlug="ovace-adulto"
        onBack={() => router.back()}
        onPush={(href) => router.push(href)}
      />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}>
      {/* Decisão operacional: o usuário precisa saber o que fazer antes de ler a referência. */}
      <View style={s.guideCard}>
        <Text style={s.guideEyebrow}>{tr("DECISÃO AGORA")}</Text>
        <Text style={s.guideTitle}>{tr("A obstrução é leve ou grave?")}</Text>
        <Text style={s.guideBody}>{tr("Leve: tosse forte, fala e respira. Grave: tosse fraca/ausente, incapaz de falar, cianose, alteração mental ou apneia.")}</Text>
        <HorizontalChoiceSelector
          value={gravidade}
          options={[
            { value: "leve", label: tr("Obstrução leve"), tone: "success" },
            { value: "grave", label: tr("Obstrução grave"), tone: "critical" },
          ]}
          onChange={(v) => {
            setGravidade(v as "leve" | "grave");
            setDesfecho(undefined);
          }}
          accessibilityLabel={tr("Classificar gravidade da obstrução")}
          testID="ovace-gravidade"
        />
        {gravidade === "leve" ? (
          <View style={s.guideAction}>
            <Text style={s.guideActionTitle}>{tr("INCENTIVE A TOSSE")}</Text>
            <Text style={s.guideActionText}>{tr("Não faça golpes nem compressões enquanto a vítima tosse com força, fala e respira. Observe continuamente; se a tosse enfraquecer ou surgir qualquer sinal de gravidade, mude para obstrução grave.")}</Text>
          </View>
        ) : null}
        {gravidade === "grave" ? (
          <>
            <View style={[s.guideAction, s.guideActionCritical]}>
              <Text style={s.guideActionTitle}>{tr("5 GOLPES NAS COSTAS → 5 COMPRESSÕES ABDOMINAIS")}</Text>
              <Text style={s.guideActionText}>{tr("Acione ajuda. Repita ciclos de 5 + 5 até expelir o objeto ou a vítima ficar inconsciente. Se ficar inconsciente, inicie RCP pelas compressões.")}</Text>
            </View>
            <View style={s.excecaoCard}>
              <Text style={s.excecaoTitulo}>{tr("⚠️ Quando as compressões são TORÁCICAS")}</Text>
              <Text style={s.excecaoCorpo}>
                {tr(
                  "Na gestação em fase final — ou sempre que o socorrista não conseguir circundar o abdome da vítima — as 5 compressões são TORÁCICAS, não abdominais. ONDE: na METADE INFERIOR DO ESTERNO — a MESMA referência da compressão da RCP, que você já conhece. Os 5 golpes nas costas continuam iguais.",
                )}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {gravidade === "grave" ? (
        <View style={s.guideCard}>
          <Text style={s.guideEyebrow}>{tr("REAVALIE APÓS CADA CICLO")}</Text>
          <Text style={s.guideTitle}>{tr("O que aconteceu após as manobras?")}</Text>
          <HorizontalChoiceSelector
            value={desfecho}
            options={[
              { value: "mantem", label: tr("Mantém obstrução"), tone: "warning" },
              { value: "expulso", label: tr("Objeto expelido"), tone: "success" },
              { value: "inconsciente", label: tr("Ficou inconsciente"), tone: "critical" },
            ]}
            onChange={(v) => setDesfecho(v as "mantem" | "expulso" | "inconsciente")}
            accessibilityLabel={tr("Registrar resposta às manobras")}
            testID="ovace-desfecho"
          />
          {desfecho === "mantem" ? (
            <View style={s.guideAction}>
              <Text style={s.guideActionTitle}>{tr("CONTINUE OS CICLOS DE 5 + 5")}</Text>
              <Text style={s.guideActionText}>{tr("Repita até o objeto ser expelido ou a vítima ficar inconsciente; reavalie após cada ciclo.")}</Text>
            </View>
          ) : null}
          {desfecho === "expulso" ? <CardPasso passo={PASSOS_OVACE[4]} /> : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showSupport }}
        onPress={() => setShowSupport((current) => !current)}
        style={({ pressed }) => [s.supportToggle, pressed && s.supportTogglePressed]}>
        <View style={s.supportToggleCopy}>
          <Text style={s.supportToggleTitle}>{tr("Apoio e sequência completa")}</Text>
          <Text style={s.supportToggleText}>{tr("Sinais de gravidade, atualização de 2025, técnica e fonte")}</Text>
        </View>
        <Text style={s.supportToggleChevron}>{showSupport ? "▲" : "▼"}</Text>
      </Pressable>

      {showSupport ? (
        <>
      {/* Contexto curto depois da decisão dominante; não compete com a ação. */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · FLUXO ASSISTENCIAL")}</Text>
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
        </>
      ) : null}

      {/* PONTE PARA A PCR — R-33.
          O passo 6 mandava "iniciar a RCP" e não oferecia caminho nenhum: nem
          ponteiro, nem `targets`, nem router. Busca por `pcr-adulto` nesta tela
          retornava zero, no momento em que a pessoa acaba de MUDAR DE
          ALGORITMO. E a particularidade da boca vivia só aqui — na superfície
          de onde ela SAIU, não naquela em que ela está. */}
      {desfecho === "inconsciente" ? <View style={s.pcrCard}>
        <Text style={s.pcrTitulo}>{tr("Virou parada — o que muda na RCP")}</Text>
        <Text style={s.pcrCorpo}>{tr(OVACE_NA_PCR)}</Text>
        <Text style={s.pcrCorpo}>{tr(OVACE_CAUSA_JA_IDENTIFICADA)}</Text>
        <Pressable
          onPress={() => {
            executeClinicalContextNavigation(pcrNavigation, (href) => router.push(href as never));
          }}
          style={({ pressed }) => [s.pcrBotao, pressed && s.pcrBotaoPressed]}>
          <Text style={s.pcrBotaoTexto}>{tr("Abrir PCR no adulto")}</Text>
          <Text style={s.pcrBotaoChevron}>›</Text>
        </Pressable>
      </View> : null}

      {/* Rodapé */}
      {showSupport ? <View style={s.footerCard}>
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
      </View> : null}
      </ScrollView>
    </View>
  );
}

// ── Estilos do CardPasso ──────────────────────────────────────────────────────

const cp = StyleSheet.create({
  card: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    borderLeftWidth: 5,
    borderLeftColor: TEMAS.escuro.cores.primary,
    padding: 14,
    gap: 10,
    shadowColor: SOMBRA.shadowColor,
    shadowOpacity: SOMBRA.shadowOpacity,
    shadowRadius: SOMBRA.shadowRadius,
    shadowOffset: SOMBRA.shadowOffset,
    elevation: 3,
  },
  cardAlerta: { borderLeftColor: TEMAS.escuro.cores.warning },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  ordemBadge: {
    width: 30,
    height: 30,
    borderRadius: RAIO.botao,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: TEMAS.escuro.cores.primary,
  },
  ordemBadgeAlerta: { backgroundColor: TEMAS.escuro.cores.warning },
  ordemTexto: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text },
  titulo: {
    fontSize: TIPOGRAFIA.body.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: 22,
  },
  detalhe: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 20, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TEMAS.escuro.cores.bg },
  scroll: { flex: 1, backgroundColor: TEMAS.escuro.cores.bg },
  guideCard: { backgroundColor: TEMAS.escuro.cores.surface, borderRadius: RAIO.card, padding: 18, borderWidth: 2, borderColor: TEMAS.escuro.cores.primary, gap: 12 },
  guideEyebrow: { fontSize: TIPOGRAFIA.micro.fontSize, fontWeight: "900", letterSpacing: 1.2, color: TEMAS.escuro.cores.primary },
  guideTitle: { fontSize: TIPOGRAFIA.title.fontSize, lineHeight: 30, fontWeight: "900", color: TEMAS.escuro.cores.text },
  guideBody: { fontSize: TIPOGRAFIA.body.fontSize, lineHeight: 23, fontWeight: "600", color: TEMAS.escuro.cores.textSecondary },
  guideAction: { borderRadius: RAIO.input, borderWidth: 1, borderColor: TEMAS.escuro.cores.success, backgroundColor: TEMAS.escuro.cores.surface, padding: 14, gap: 6 },
  guideActionCritical: { borderColor: TEMAS.escuro.cores.critical },
  guideActionTitle: { fontSize: TIPOGRAFIA.step.fontSize, lineHeight: 24, fontWeight: "900", color: TEMAS.escuro.cores.text },
  guideActionText: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 22, fontWeight: "600", color: TEMAS.escuro.cores.textSecondary },
  supportToggle: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: RAIO.input,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    backgroundColor: TEMAS.escuro.cores.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  supportTogglePressed: { opacity: 0.84 },
  supportToggleCopy: { flex: 1, gap: 2 },
  supportToggleTitle: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text },
  supportToggleText: { fontSize: TIPOGRAFIA.micro.fontSize, lineHeight: 16, color: TEMAS.escuro.cores.textSecondary },
  supportToggleChevron: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "900", color: TEMAS.escuro.cores.primary },
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
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 20,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 8,
    shadowColor: SOMBRA.shadowColor,
    shadowOpacity: SOMBRA.shadowOpacity,
    shadowRadius: SOMBRA.shadowRadius,
    shadowOffset: SOMBRA.shadowOffset,
    elevation: 3,
  },
  introEyebrow: {
    fontSize: TIPOGRAFIA.micro.fontSize,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: TEMAS.escuro.cores.primary,
  },
  introTitle: {
    fontSize: TIPOGRAFIA.title.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introSubtitle: {
    fontSize: TIPOGRAFIA.body.fontSize,
    fontWeight: "700",
    color: TEMAS.escuro.cores.textSecondary,
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: { height: 1, backgroundColor: TEMAS.escuro.cores.border },
  introBody: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 21, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },

  mudouCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.primary,
    gap: 6,
  },
  mudouEyebrow: {
    fontSize: TIPOGRAFIA.micro.fontSize,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: TEMAS.escuro.cores.primary,
  },
  mudouTitulo: {
    fontSize: TIPOGRAFIA.step.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  mudouCorpo: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 20, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },

  sinaisCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 12,
  },
  sinaisTitulo: { fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text, letterSpacing: -0.2 },
  sinaisIntro: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 19, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },
  sinalLinha: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  sinalMarcador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
    backgroundColor: TEMAS.escuro.cores.warning,
  },
  sinalTextos: { flex: 1, gap: 1 },
  sinalNome: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text, lineHeight: 20 },
  sinalDetalhe: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 18, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },

  grupo: { gap: 10 },
  grupoHeader: {
    borderRadius: RAIO.input,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.border,
    backgroundColor: TEMAS.escuro.cores.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  grupoTitulo: { fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.primary, letterSpacing: -0.2 },
  grupoSubtitulo: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "600", color: TEMAS.escuro.cores.textSecondary, lineHeight: 17 },

  pcrCard: {
    backgroundColor: "#2a1f2e",
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#a855f7",
    gap: 10,
  },
  pcrTitulo: { fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text, letterSpacing: -0.2 },
  pcrCorpo: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 20, color: "#e2d9e7", fontWeight: "600" },
  pcrBotao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3b2a42",
    borderRadius: RAIO.input,
    borderWidth: 1,
    borderColor: "#a855f7",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 44,
  },
  pcrBotaoPressed: { opacity: 0.85 },
  pcrBotaoTexto: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text },
  pcrBotaoChevron: { fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "800", color: "#a855f7" },

  excecaoCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.warning,
    gap: 8,
  },
  excecaoTitulo: { fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text, letterSpacing: -0.2 },
  excecaoCorpo: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 20, color: TEMAS.escuro.cores.text, fontWeight: "600" },

  footerCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 10,
  },
  footerTitle: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.primary },
  footerBody: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 20, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },
  footerRule: { height: 1, backgroundColor: TEMAS.escuro.cores.border },
  footerSource: { fontSize: TIPOGRAFIA.micro.fontSize, fontWeight: "600", color: TEMAS.escuro.cores.textSecondary, letterSpacing: 0.2 },
});
