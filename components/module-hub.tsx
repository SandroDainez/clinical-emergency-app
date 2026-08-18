import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { assertModuleGroupsCoverage, MODULE_AREA_LABELS } from "@/constants/module-area-labels";
import { getPalette, SECAO_DO_HUB } from "@/design-system/paleta-de-area";
import CardDeModulo, { type ModuloDoCard } from "./hub/card-de-modulo";
import { IDS_DA_SECAO_PCR, TITULO_DA_SECAO_PCR } from "@/constants/secao-do-pcr";
import { getClinicalModules } from "../clinical-modules";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";
import { openClinicalModule } from "../lib/open-clinical-module";
import { isModuleFree } from "../lib/subscription";
import { useSubscription } from "../lib/subscription-context";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../lib/language-context";
import { tr as trBase } from "../lib/i18n";
import LanguageSelector from "./language-selector";

const BOTTOM_PAD = 32;

const MODULE_ICON: Record<string, string> = {
  "pcr-adulto":               "♥",
  "sepse-adulto":             "🦠",
  "drogas-vasoativas":        "💊",
  "isr-rapida":               "🫁",
  "edema-agudo-pulmao":       "💧",
  "cetoacidose-hiperosmolar": "🧪",
  "ventilacao-mecanica":      "💨",
  "anafilaxia":               "⚡",
  "avc":                      "🧠",
  "correcoes-eletroliticas":  "⚗️",
  "sindromes-coronarianas":   "🫀",
  "ritmos-acls":              "〜",
  "farmacologia-acls":        "Rx",
  "bradicardia-acls":         "↓♡",
  "taquicardia-acls":         "↑♡",
  "causas-reversiveis-acls":  "HT",
  "pcr-gestacao-acls":        "OB",
  "ovace-adulto":             "VA",
  "pos-pcr-acls":             "✓",
  "tep":                      "🩸",
  "pre-eclampsia":            "🤰",
  "sedoanalgesia":            "💉",
  "calculadoras-clinicas":    "🧮",
  "politrauma":               "🚑",
  "tce":                      "🤕",
  "crises-convulsivas":       "🫨",
  "intoxicacoes-exogenas":    "☠️",
  "choque":                   "📉",
  "insuficiencia-respiratoria": "😮‍💨",
  "abdome-agudo":             "🩻",
  "injuria-renal-aguda":      "🫘",
};

export default function ModuleHub() {
  const { locale } = useLanguage();
  const tr = (pt: string) => trBase(pt, locale);
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useSubscription();
  const role = getAuthRole();

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAuthRole();
    // On web a full reload is more reliable than router.replace inside a tabs stack
    if (typeof window !== "undefined") {
      window.location.replace("/");
    } else {
      router.replace("/");
    }
  }

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

  // ⚠️ TODO MÓDULO É CARD PRÓPRIO — não há mais sub-card.
  //
  // Até 2026-08-17, oito módulos ACLS eram filtrados para fora desta lista e
  // redesenhados DENTRO do card do PCR, sob um divisor "MÓDULOS ACLS". O
  // Engasgo (OVACE) era um deles — um módulo de paciente CONSCIENTE, de pé,
  // apresentado como item da parada. A razão está em `constants/module-groups.ts`.
  //
  // ⚠️ A CÓPIA (`[...modules]`) NÃO É ENFEITE. Antes havia um `.filter()` antes
  // do `.sort()`, e era ele que criava o array novo. Tirado o filtro, um
  // `modules.sort()` ordenaria EM CIMA do array devolvido por
  // `getClinicalModules()` — mutando a lista de origem do app inteiro.
  // ── CENÁRIO ANTES DE CONSULTA ──────────────────────────────────────────
  //
  // ⚠️ ESTA É A ORDEM QUE O MÉDICO VÊ. `constants/module-groups.ts` NÃO ordena
  // nada — existe para cobertura e validação —, e reordenar aquele array não muda
  // um pixel desta tela. Foi o erro cometido e relatado em 2026-08-17.
  //
  // ── O DEFEITO QUE ORIGINOU ─────────────────────────────────────────────
  //
  // O hub ordenava os 31 módulos por TÍTULO, alfabeticamente. Isso punha
  // `Farmacologia no ACLS` na 5ª posição e `Ritmos de Parada` na 7ª — duas telas
  // de TABELA no meio dos guias, por F e por R. O bloco das etiquetas já havia
  // consertado o rótulo (as duas dizem CONSULTA) e a posição seguia dizendo o
  // contrário; etiqueta e posição são lidas juntas, e quem abre o app com um
  // paciente lê a posição primeiro.
  //
  // O critério: quem tem paciente vem antes; quem quer tabela vai buscá-la. Dentro
  // de cada camada, alfabético — que é previsível e não exige manutenção.
  const SO_CONSULTA = new Set(["CONSULTA", "Calculadoras"]);
  const ehConsulta = (id: string) => SO_CONSULTA.has(MODULE_AREA_LABELS[id] ?? "");
  const primaryModules = [...modules]
    .sort((a, b) => {
      if (a.id === "pcr-adulto") return -1;
      if (b.id === "pcr-adulto") return 1;
      const ca = ehConsulta(a.id) ? 1 : 0;
      const cb = ehConsulta(b.id) ? 1 : 0;
      if (ca !== cb) return ca - cb;
      return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
    });

  // ⚠️ A ETIQUETA SÓ APARECE ONDE DIZ O QUE O TÍTULO NÃO DIZ (R-91) — e o
  // critério é o mesmo nas duas seções. A lista abaixo é a dos ecos MEDIDOS:
  // etiqueta contida no título, por texto, por sigla ou por abreviatura. São 24
  // dos 30; as 6 que sobram estão todas na seção do PCR, e isso não foi escolha:
  // lá o título nomeia um sub-assunto e a etiqueta diz de que ele é sub-assunto;
  // aqui cada card JÁ É o seu próprio cenário.
  const ETIQUETA_ECO = new Set([
    "pcr-gestacao-acls", "pos-pcr-acls", "sepse-adulto", "choque", "avc",
    "sindromes-coronarianas", "isr-rapida", "politrauma", "tce",
    "intoxicacoes-exogenas", "anafilaxia", "abdome-agudo", "sedoanalgesia",
    "calculadoras-clinicas", "drogas-vasoativas", "tep", "ventilacao-mecanica",
    "edema-agudo-pulmao", "insuficiencia-respiratoria", "crises-convulsivas",
    "cetoacidose-hiperosmolar", "correcoes-eletroliticas", "injuria-renal-aguda",
    "pre-eclampsia",
  ]);

  // ── SEÇÃO 1 · DENTRO DO MÓDULO PCR ADULTO — UI 2.0, três colunas ──────────
  //
  // ⚠️ PD-9: a seção é AGRUPAMENTO VISUAL, nunca aninhamento. Cada card continua
  // tocável direto e com o mesmo peso dos outros; a seção não é um nível de
  // navegação. E R-91: a etiqueta só aparece onde diz o que o título não diz —
  // aqui sobram seis das oito, e as duas que somem (PCR na Gestação, Cuidados
  // Pós-PCR) somem porque o título já as nomeia.
  const montarCard = (id: string): ModuloDoCard | null => {
    const mod = modules.find((m) => m.id === id);
    if (!mod) return null;
    return {
      id: mod.id,
      titulo: mod.title,
      descritor: mod.description,
      // ⚠️ ÁREA e ETIQUETA são campos diferentes de propósito: a área SEMPRE
      // existe (é ela que dá a cor); a etiqueta some quando seria eco do título.
      area: MODULE_AREA_LABELS[id] ?? "Módulo",
      etiqueta: ETIQUETA_ECO.has(id) ? "" : (MODULE_AREA_LABELS[id] ?? ""),
      rota: mod.route as string,
      bloqueado: !isModuleFree(id) && !isPremium,
    };
  };

  const cardsDaSecao = IDS_DA_SECAO_PCR.map(montarCard).filter(Boolean) as ModuloDoCard[];
  const idsDaSecao = new Set<string>(IDS_DA_SECAO_PCR);

  // ── SEÇÃO 2 · QUANDO O CENÁRIO É OUTRO — os 23 restantes ─────────────────
  //
  // A ordem é a MESMA da lista antiga (`primaryModules`): cenário antes de
  // consulta, e alfabético dentro de cada camada. Nada foi reordenado nesta
  // passada — trocou-se o CARD, não o critério, e `e2e/ordem-do-hub` continua
  // medindo a lista principal.
  const cardsDoResto = primaryModules
    .filter((m) => m.id !== "pcr-adulto" && !idsDaSecao.has(m.id))
    .map((m) => montarCard(m.id))
    .filter(Boolean) as ModuloDoCard[];

  function renderSecaoPcr() {
    // ⚠️ VACUIDADE NA TELA: seção sem card não pode virar bloco vazio silencioso.
    if (cardsDaSecao.length === 0) return null;
    return (
      <View style={s.secao} key="secao-pcr">
        <Text style={s.secaoTitulo}>{tr(TITULO_DA_SECAO_PCR).toUpperCase()}</Text>
        <View style={s.grade}>
          {cardsDaSecao.map((c) => (
            <View style={s.colunaDaGrade} key={c.id}>
              <CardDeModulo mod={c} tr={tr} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderPcrHeroCard(mod: (typeof modules)[0]) {
    function handlePress() {
      void openClinicalModule(router, mod.id, mod.route as Href);
    }
    return (
      <View key={mod.id} style={s.heroWrapper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr(mod.title)}
          onPress={handlePress}
          style={({ pressed }) => [s.heroCard, pressed && s.heroCardPressed]}>

          {/* Top row: badge + icon */}
          <View style={s.heroTopRow}>
            <View style={s.heroBadgeRow}>
              <View style={s.heroEyebrowBadge}>
                <Text style={s.heroEyebrowText}>★ {tr("GUIA PRINCIPAL")}</Text>
              </View>
              <View style={s.heroAclsBadge}>
                <Text style={s.heroAclsText}>AHA · ACLS 2025</Text>
              </View>
            </View>
            <View style={s.heroIconBox}>
              <Text style={s.heroIconText}>♥</Text>
            </View>
          </View>

          {/* Title + description */}
          <Text style={s.heroTitle}>{tr(mod.title)}</Text>
          <Text style={s.heroDesc}>{tr(mod.description)}</Text>

          {/* ⚠️ OS CHIPS DE SUB-MÓDULO SAÍRAM JUNTO COM O ANINHAMENTO.
              Listavam quatro módulos ACLS DENTRO do card do PCR — a mesma
              afirmação visual que o desaninhamento desfez, só que em miniatura.
              Mantê-los seria continuar dizendo "isto faz parte da parada" para
              módulos que agora têm card e etiqueta próprios. */}

          {/* CTA */}
          <View style={s.heroCta}>
            <Text style={s.heroCtaText}>Iniciar guia ACLS →</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  function renderCard(mod: (typeof modules)[0]) {
    const areaLabel: string = MODULE_AREA_LABELS[mod.id] ?? "Módulo";
    const palette = getPalette(areaLabel);
    const icon = MODULE_ICON[mod.id] ?? "•";
    const isLocked = !isModuleFree(mod.id) && !isPremium;

    function handlePress() {
      if (isLocked) {
        router.push("/paywall");
      } else {
        void openClinicalModule(router, mod.id, mod.route as Href);
      }
    }

    return (
      <View key={mod.id} style={[s.cardWrapper, isLocked && s.cardWrapperLocked]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr(mod.title)}
          onPress={handlePress}
          style={({ pressed }) => [
            s.card,
            { borderLeftColor: isLocked ? "#334155" : palette.accent },
            pressed && s.cardPressed,
            isLocked && s.cardLocked,
          ]}>
          <View style={[s.iconBox, { backgroundColor: isLocked ? "#1e293b" : palette.iconBg }]}>
            <Text style={[s.iconText, { color: isLocked ? "#475569" : palette.accent }]}>
              {isLocked ? "🔒" : icon}
            </Text>
          </View>
          <View style={s.cardBody}>
            {isLocked ? (
              <View style={s.proBadge}>
                <Text style={s.proBadgeText}>PRO</Text>
              </View>
            ) : (
              <View style={[s.badge, { backgroundColor: palette.badgeBg }]}>
                <Text style={[s.badgeText, { color: palette.badgeText }]}>{tr(areaLabel)}</Text>
              </View>
            )}
            <Text
              style={[s.cardTitle, isLocked && s.cardTitleLocked]}
              numberOfLines={1}>
              {tr(mod.title)}
            </Text>
            <Text style={[s.cardDesc, isLocked && s.cardDescLocked]} numberOfLines={2}>
              {tr(mod.description)}
            </Text>
          </View>
          <Text style={[s.cardArrow, { color: isLocked ? "#334155" : palette.accent }]}>
            {isLocked ? "›" : "›"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          {/* account bar — logout + admin link */}
          <View style={s.accountBar}>
            <LanguageSelector compact />
            {role === "admin" && (
              <Pressable
                style={({ pressed }) => [s.accountBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/admin-users")}>
                <Text style={s.accountBtnAdmin}>⚙ Admin</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [s.accountBtn, pressed && { opacity: 0.7 }]}
              onPress={() => void handleLogout()}>
              <Text style={s.accountBtnLogout}>{tr("Sair")}</Text>
            </Pressable>
          </View>

          <View style={s.headerTop}>
            <View style={s.appBadge}>
              <Text style={s.appBadgeText}>{tr("EMERGÊNCIA")}</Text>
            </View>
            {isPremium ? (
              <View style={s.proBadgeHeader}>
                <Text style={s.proBadgeHeaderText}>✓ PRO</Text>
              </View>
            ) : (
              <View style={s.guidelinesBadge}>
                <Text style={s.guidelinesText}>✓ {tr("Diretrizes atualizadas")}</Text>
              </View>
            )}
          </View>
          <Text style={s.headerTitle}>{tr("Guia de emergências")}</Text>
          <Text style={s.headerSub}>
            {primaryModules.length} {tr("módulos · baseado em evidências · AHA · ESC · ADA · WAO")}
          </Text>
          <Text style={s.headerDisclaimer}>
            {tr("Material de referência de uso privado — não é protocolo institucional. A decisão final é sempre do médico.")}
          </Text>
          {!isPremium && (
            <Pressable
              style={({ pressed }) => [s.upgradeBar, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/paywall")}>
              <Text style={s.upgradeBarText}>
                🔒 {tr("7 módulos desbloqueados com o plano Pro — ver planos →")}
              </Text>
            </Pressable>
          )}
        </View>

        {/* ⚠️ A SEÇÃO VEM DEPOIS DO HERÓI, sempre. Na primeira montagem ela ficou
            ACIMA dele: a tela dizia «dentro do módulo PCR Adulto» antes de o
            módulo existir na página. Por isso o herói é desenhado aqui, fora do
            map, e a seção logo em seguida — a ordem passa a ser estrutural em vez
            de depender da posição do PCR dentro da lista. */}
        {(() => {
          const heroi = primaryModules.find((m) => m.id === "pcr-adulto");
          return heroi ? renderPcrHeroCard(heroi) : null;
        })()}

        {renderSecaoPcr()}

        {cardsDoResto.length > 0 ? (
          <View style={s.secao}>
            <Text style={s.secaoTitulo}>{tr("QUANDO O CENÁRIO É OUTRO")}</Text>
            <View style={s.grade}>
              {cardsDoResto.map((c) => (
                <View style={s.colunaDaGrade} key={c.id}>
                  <CardDeModulo mod={c} tr={tr} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Aviso permanente — apoio educacional / responsabilidade do profissional */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>{tr("⚠ Ferramenta de apoio")}</Text>
          <Text style={s.disclaimerText}>
            {tr("Conteúdo de ")}<Text style={s.disclaimerStrong}>{tr("apoio educacional e à decisão clínica")}</Text>
            {tr(", baseado em diretrizes vigentes. Não substitui o julgamento clínico nem a avaliação individual do paciente. A conduta e a responsabilidade pelo atendimento são sempre do profissional de saúde assistente, que deve considerar as implicações éticas e legais.")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  secao: {
    backgroundColor: SECAO_DO_HUB.fundo,
    borderWidth: 1,
    borderColor: SECAO_DO_HUB.borda,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingTop: 13,
    paddingBottom: 11,
    gap: 9,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: SECAO_DO_HUB.titulo,
  },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  colunaDaGrade: { width: "31.5%", minWidth: 104 },
  screen: { flex: 1, backgroundColor: "#292e38" },
  scroll: { flex: 1 },
  disclaimer: {
    marginTop: 6,
    backgroundColor: "#11161f",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262f3d",
    padding: 14,
    gap: 5,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#aab6c6",
    letterSpacing: 0.3,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#aab6c6",
  },
  disclaimerStrong: {
    color: "#aab6c6",
    fontWeight: "700",
  },
  scrollInner: {
    paddingHorizontal: 14,
    paddingTop: 14,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },

  header: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    gap: 6,
  },
  accountBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  accountBtn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#292e38",
  },
  accountBtnAdmin: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7fb3ff",
  },
  accountBtnLogout: {
    fontSize: 12,
    fontWeight: "700",
    color: "#aab6c6",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  appBadge: {
    backgroundColor: "#1e6fd9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  appBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#ffffff",
  },
  guidelinesBadge: {
    backgroundColor: "#052e16",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#166534",
  },
  guidelinesText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#4ade80",
    letterSpacing: 0.2,
  },
  proBadgeHeader: {
    backgroundColor: "#0d2a2d",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#7fb3ff",
  },
  proBadgeHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7fb3ff",
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#aab6c6",
    lineHeight: 17,
  },
  headerDisclaimer: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#aab6c6",
    lineHeight: 15,
    fontStyle: "italic",
  },
  upgradeBar: {
    backgroundColor: "#0d2a2d",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7fb3ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  upgradeBarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#67e8f9",
    lineHeight: 17,
  },

  list: { gap: 8 },

  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#383e4a",
    borderWidth: 1,
    borderColor: "#565e6c",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardWrapperLocked: {
    borderColor: "#565e6c",
    shadowOpacity: 0.15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderLeftWidth: 4,
    backgroundColor: "#383e4a",
  },
  cardLocked: {
    backgroundColor: "#161d2e",
  },
  cardPressed: { backgroundColor: "#273448" },
  cardTitleLocked: { color: "#aab6c6" },
  cardDescLocked: { color: "#aab6c6" },

  proBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#431407",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: "#92400e",
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#fbbf24",
    textTransform: "uppercase",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: { fontSize: 17, fontWeight: "700", lineHeight: 21 },

  cardBody: { flex: 1, gap: 3 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.3 },
  cardDesc: { fontSize: 13, fontWeight: "500", color: "#aab6c6", lineHeight: 19 },
  cardArrow: { fontSize: 22, fontWeight: "600", lineHeight: 24, flexShrink: 0 },

  // ── PCR Hero Card ────────────────────────────────────────────
  heroWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  heroCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#2563eb",
    gap: 12,
  },
  heroCardPressed: { backgroundColor: "#0f2548" },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroBadgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  heroEyebrowBadge: {
    backgroundColor: "#1d4ed8",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  heroEyebrowText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#bfdbfe",
    textTransform: "uppercase",
  },
  heroAclsBadge: {
    backgroundColor: "#383e4a",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#565e6c",
  },
  heroAclsText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#60a5fa",
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroIconText: { fontSize: 22 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f1f5f9",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  heroDesc: {
    fontSize: 14,
    color: "#93c5fd",
    lineHeight: 20,
    fontWeight: "500",
  },
  heroCta: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 2,
  },
  heroCtaText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
});
