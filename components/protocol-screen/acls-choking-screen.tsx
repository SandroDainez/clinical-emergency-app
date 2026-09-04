import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";
import { ClinicalShellHost } from "../ui-v2/clinical-shell-host";
import { useTr } from "../../lib/use-tr";
import { OVACE_CAUSA_JA_IDENTIFICADA, OVACE_NA_PCR } from "../../lib/ovace-na-pcr";
import {
  executeClinicalContextNavigation,
  getClinicalContextNavigation,
} from "../../lib/clinical-context-navigation";

export type SinalDeGravidade = { sinal: string; detalhe: string };

export type PassoOvace = {
  ordem: string;
  titulo: string;
  detalhe: string;
  alerta?: boolean;
};

/**
 * OVACE adulto — conteúdo clínico preservado da implementação anterior.
 * Fonte declarada pelo módulo: AHA 2025, Destaques das Diretrizes de RCP e ACE,
 * Figura 6 / SBV adulto. Esta mudança é de superfície/UX; não altera sequência,
 * critérios de gravidade, exceções, condutas ou handoff para PCR.
 */
export const SINAIS_DE_GRAVIDADE: SinalDeGravidade[] = [
  {
    sinal: "Tosse fraca ou ausente",
    detalhe:
      "A tosse eficaz é o melhor mecanismo de desobstrução — quando ela enfraquece, a obstrução virou grave.",
  },
  {
    sinal: "Incapaz de falar",
    detalhe: "Não consegue emitir som nem responder. Pergunte: “Você está engasgado?”",
  },
  {
    sinal: "Alteração de cor (cianose)",
    detalhe: "Lábios e extremidades azulados indicam hipóxia já instalada.",
  },
  {
    sinal: "Estado mental alterado",
    detalhe: "Sonolência, confusão ou perda de contato — precede a inconsciência.",
  },
  { sinal: "Apneia", detalhe: "Ausência de esforço respiratório eficaz." },
];

export const PASSOS_OVACE: PassoOvace[] = [
  {
    ordem: "1",
    titulo: "Verifique a segurança do local",
    detalhe:
      "Antes de qualquer manobra, garanta que o ambiente é seguro para você e para a vítima.",
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

function ActionRow({ index, children, critical }: { index: number; children: string; critical?: boolean }) {
  const tr = useTr();
  return (
    <View style={s.actionRow}>
      <View style={[s.actionBadge, critical ? s.actionBadgeCritical : null]}>
        <Text style={s.actionBadgeText}>{index}</Text>
      </View>
      <Text style={s.actionText}>{tr(children)}</Text>
    </View>
  );
}

function SupportStep({ passo }: { passo: PassoOvace }) {
  const tr = useTr();
  return (
    <View style={[s.supportStep, passo.alerta ? s.supportStepCritical : null]}>
      <View style={s.supportStepHeader}>
        <View style={[s.smallBadge, passo.alerta ? s.smallBadgeCritical : null]}>
          <Text style={s.smallBadgeText}>{passo.ordem}</Text>
        </View>
        <Text style={s.supportStepTitle}>{tr(passo.titulo)}</Text>
      </View>
      <Text style={s.supportStepBody}>{tr(passo.detalhe)}</Text>
    </View>
  );
}

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
        <View style={s.contextRow}>
          <Text style={s.contextText}>
            {tr(
              "Siga uma decisão por vez. O app preserva o contexto do atendimento e conduz do reconhecimento às manobras, reavaliação e transição para PCR quando necessária.",
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showSupport }}
            onPress={() => setShowSupport((current) => !current)}
            style={({ pressed }) => [s.detailsButton, pressed ? s.pressed : null]}>
            <Text style={s.detailsButtonText}>{tr(showSupport ? "OCULTAR DETALHES" : "VER DETALHES ›")}</Text>
          </Pressable>
        </View>

        <View style={s.primaryCard}>
          <Text style={s.eyebrow}>{tr("• DECISÃO — FAZER AGORA")}</Text>
          <Text style={s.title}>{tr("Reconhecimento — classifique a obstrução")}</Text>
          <Text style={s.summary}>
            {tr(
              "Leve: tosse forte, fala e respira. Grave: tosse fraca/ausente, incapaz de falar, cianose, alteração mental ou apneia.",
            )}
          </Text>

          <View style={s.innerPanel}>
            <Text style={s.innerLabel}>{tr("DECIDA AGORA")}</Text>
            <Text style={s.question}>{tr("A obstrução é leve ou grave?")}</Text>
            <HorizontalChoiceSelector
              value={gravidade}
              options={[
                { value: "leve", label: tr("Obstrução leve"), tone: "success" },
                { value: "grave", label: tr("Obstrução grave"), tone: "critical" },
              ]}
              onChange={(value) => {
                setGravidade(value as "leve" | "grave");
                setDesfecho(undefined);
              }}
              accessibilityLabel={tr("Classificar gravidade da obstrução")}
              testID="ovace-gravidade"
            />
          </View>

          {gravidade === "leve" ? (
            <View style={s.actionPanel}>
              <Text style={s.innerLabel}>{tr("CONDUTA — FAZER AGORA")}</Text>
              <ActionRow index={1}>INCENTIVE A TOSSE.</ActionRow>
              <ActionRow index={2}>
                Não faça golpes nem compressões enquanto a vítima tosse com força, fala e respira.
              </ActionRow>
              <ActionRow index={3}>
                Observe continuamente; se a tosse enfraquecer ou surgir qualquer sinal de gravidade, reclassifique como obstrução grave.
              </ActionRow>
            </View>
          ) : null}

          {gravidade === "grave" ? (
            <View style={[s.actionPanel, s.actionPanelCritical]}>
              <Text style={s.innerLabelCritical}>{tr("CONDUTA — EXECUTE AGORA")}</Text>
              <ActionRow index={1} critical>Acione ajuda.</ActionRow>
              <ActionRow index={2} critical>
                5 GOLPES NAS COSTAS → 5 COMPRESSÕES ABDOMINAIS. Repita ciclos até expelir o objeto ou a vítima ficar inconsciente.
              </ActionRow>
              <ActionRow index={3} critical>
                Na gestação em fase final — ou se não for possível circundar o abdome — faça 5 compressões TORÁCICAS na metade inferior do esterno; os 5 golpes nas costas permanecem.
              </ActionRow>
            </View>
          ) : null}
        </View>

        {gravidade === "grave" ? (
          <View style={s.primaryCard}>
            <Text style={s.eyebrow}>{tr("• REAVALIAÇÃO — APÓS CADA CICLO")}</Text>
            <Text style={s.title}>{tr("O que aconteceu após as manobras?")}</Text>
            <Text style={s.summary}>
              {tr("A resposta às manobras define se o ciclo continua, se entra observação pós-expulsão ou se o atendimento transita imediatamente para RCP.")}
            </Text>

            <View style={s.innerPanel}>
              <HorizontalChoiceSelector
                value={desfecho}
                options={[
                  { value: "mantem", label: tr("Mantém obstrução"), tone: "warning" },
                  { value: "expulso", label: tr("Objeto expelido"), tone: "success" },
                  { value: "inconsciente", label: tr("Ficou inconsciente"), tone: "critical" },
                ]}
                onChange={(value) => setDesfecho(value as "mantem" | "expulso" | "inconsciente")}
                accessibilityLabel={tr("Registrar resposta às manobras")}
                testID="ovace-desfecho"
              />
            </View>

            {desfecho === "mantem" ? (
              <View style={s.actionPanel}>
                <Text style={s.innerLabel}>{tr("CONDUTA — CONTINUE AGORA")}</Text>
                <ActionRow index={1}>Continue os ciclos de 5 + 5.</ActionRow>
                <ActionRow index={2}>Reavalie após cada ciclo até expulsão ou inconsciência.</ActionRow>
              </View>
            ) : null}

            {desfecho === "expulso" ? (
              <View style={s.actionPanel}>
                <Text style={s.innerLabel}>{tr("APÓS A EXPULSÃO")}</Text>
                <Text style={s.supportStepBody}>{tr(PASSOS_OVACE[4].detalhe)}</Text>
              </View>
            ) : null}

            {desfecho === "inconsciente" ? (
              <View style={[s.actionPanel, s.actionPanelCritical]}>
                <Text style={s.innerLabelCritical}>{tr("TRANSIÇÃO CRÍTICA — PCR")}</Text>
                <Text style={s.supportStepBody}>{tr(OVACE_NA_PCR)}</Text>
                <Text style={s.supportStepBody}>{tr(OVACE_CAUSA_JA_IDENTIFICADA)}</Text>
                <Pressable
                  onPress={() => {
                    executeClinicalContextNavigation(pcrNavigation, (href) => router.push(href as never));
                  }}
                  style={({ pressed }) => [s.pcrButton, pressed ? s.pressed : null]}>
                  <Text style={s.pcrButtonText}>{tr("Abrir PCR no adulto")}</Text>
                  <Text style={s.pcrButtonChevron}>›</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {showSupport ? (
          <View style={s.supportCard}>
            <Text style={s.eyebrow}>{tr("• APOIO CLÍNICO E TÉCNICA")}</Text>
            <Text style={s.title}>{tr("Sequência completa e sinais de gravidade")}</Text>

            <View style={s.updateBox}>
              <Text style={s.updateTitle}>{tr("Mudou em 2025 — golpes nas costas vêm primeiro")}</Text>
              <Text style={s.supportStepBody}>
                {tr(
                  "A AHA 2025 passou a recomendar ciclos de 5 golpes nas costas seguidos de 5 compressões abdominais no adulto com obstrução grave responsiva.",
                )}
              </Text>
            </View>

            <Text style={s.sectionTitle}>{tr("Sinais de obstrução grave")}</Text>
            {SINAIS_DE_GRAVIDADE.map((item) => (
              <View key={item.sinal} style={s.signRow}>
                <View style={s.signDot} />
                <View style={s.signCopy}>
                  <Text style={s.signTitle}>{tr(item.sinal)}</Text>
                  <Text style={s.supportStepBody}>{tr(item.detalhe)}</Text>
                </View>
              </View>
            ))}

            <Text style={s.sectionTitle}>{tr("Do reconhecimento à RCP")}</Text>
            {PASSOS_OVACE.map((passo) => <SupportStep key={passo.ordem} passo={passo} />)}

            <View style={s.footerBox}>
              <Text style={s.footerTitle}>{tr("Não confundir com via aérea difícil da intubação")}</Text>
              <Text style={s.supportStepBody}>
                {tr(
                  "Este módulo é do engasgo presenciado, com a vítima ainda respondendo ou recém-inconsciente. Corpo estranho encontrado durante a intubação, angioedema e abscesso são situações de via aérea difícil — ver o módulo de ISR.",
                )}
              </Text>
              <Text style={s.sourceText}>
                {tr("Baseado em AHA 2025 — Destaques das Diretrizes de RCP e ACE, Figura 6 e Suporte Básico de Vida em adultos")}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={s.bottomHint}>
          {tr("Depois de executar e conferir a conduta acima, registre a resposta do paciente e siga para a próxima decisão.")}
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b1421" },
  scroll: { flex: 1 },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 42,
    gap: 14,
  },
  contextRow: { gap: 12, alignItems: "flex-start" },
  contextText: { color: "#aeb9c9", fontSize: 15, lineHeight: 22, fontWeight: "500" },
  detailsButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#72aef8",
    justifyContent: "center",
    backgroundColor: "#142234",
  },
  detailsButtonText: { color: "#8ec2ff", fontSize: 13, fontWeight: "800", letterSpacing: 0.7 },
  primaryCard: {
    width: "100%",
    backgroundColor: "#142234",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#34465e",
    borderLeftWidth: 5,
    borderLeftColor: "#f3a29c",
    padding: 20,
    gap: 14,
  },
  supportCard: {
    width: "100%",
    backgroundColor: "#142234",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#34465e",
    padding: 20,
    gap: 14,
  },
  eyebrow: { color: "#aebbd0", fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  title: { color: "#f3f6fb", fontSize: 23, lineHeight: 30, fontWeight: "800", letterSpacing: -0.4 },
  summary: { color: "#aeb9c9", fontSize: 15, lineHeight: 22, fontWeight: "500" },
  innerPanel: {
    width: "100%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#31435b",
    backgroundColor: "#0d1928",
    padding: 16,
    gap: 12,
  },
  innerLabel: { color: "#f3a29c", fontSize: 13, fontWeight: "900", letterSpacing: 0.9 },
  innerLabelCritical: { color: "#ffaaa3", fontSize: 13, fontWeight: "900", letterSpacing: 0.9 },
  question: { color: "#f3f6fb", fontSize: 18, lineHeight: 24, fontWeight: "800" },
  actionPanel: {
    width: "100%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#31435b",
    backgroundColor: "#0d1928",
    padding: 16,
    gap: 11,
  },
  actionPanelCritical: { borderColor: "#9d5b58" },
  actionRow: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  actionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3a29c",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionBadgeCritical: { backgroundColor: "#ff9f98" },
  actionBadgeText: { color: "#142234", fontSize: 14, fontWeight: "900" },
  actionText: { flex: 1, color: "#f0f4fa", fontSize: 16, lineHeight: 23, fontWeight: "700" },
  pcrButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#a94f4a",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pcrButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  pcrButtonChevron: { color: "#fff", fontSize: 24, fontWeight: "700" },
  updateBox: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#42618a",
    backgroundColor: "#0d1928",
    padding: 16,
    gap: 7,
  },
  updateTitle: { color: "#8ec2ff", fontSize: 16, lineHeight: 22, fontWeight: "800" },
  sectionTitle: { color: "#f3f6fb", fontSize: 17, lineHeight: 23, fontWeight: "800", marginTop: 4 },
  signRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  signDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#f3a29c", marginTop: 7 },
  signCopy: { flex: 1, gap: 2 },
  signTitle: { color: "#f3f6fb", fontSize: 15, lineHeight: 21, fontWeight: "800" },
  supportStep: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#31435b",
    backgroundColor: "#0d1928",
    padding: 14,
    gap: 8,
  },
  supportStepCritical: { borderColor: "#9d5b58" },
  supportStepHeader: { flexDirection: "row", gap: 10, alignItems: "center" },
  smallBadge: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: "#315f97",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBadgeCritical: { backgroundColor: "#a94f4a" },
  smallBadgeText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  supportStepTitle: { flex: 1, color: "#f3f6fb", fontSize: 15, lineHeight: 21, fontWeight: "800" },
  supportStepBody: { color: "#b6c1d0", fontSize: 14, lineHeight: 21, fontWeight: "500" },
  footerBox: {
    borderTopWidth: 1,
    borderTopColor: "#31435b",
    paddingTop: 14,
    gap: 8,
  },
  footerTitle: { color: "#f3f6fb", fontSize: 15, lineHeight: 21, fontWeight: "800" },
  sourceText: { color: "#8290a4", fontSize: 12, lineHeight: 18, fontWeight: "500", marginTop: 4 },
  bottomHint: { color: "#95a2b4", fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 2 },
  pressed: { opacity: 0.82 },
});
