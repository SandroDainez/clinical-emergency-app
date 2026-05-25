import { ScrollView, StyleSheet, Text, View } from "react-native";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Cause = {
  letter: string;
  name: string;
  clues: string[];
  intervention: string;
  interventionDetail?: string;
};

type CauseGroup = {
  id: "H" | "T";
  groupLabel: string;
  groupSubtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  causes: Cause[];
};

// ── Dados clínicos ─────────────────────────────────────────────────────────────

const CAUSE_GROUPS: CauseGroup[] = [
  {
    id: "H",
    groupLabel: "5 Hs",
    groupSubtitle: "Causas metabólicas e sistêmicas",
    accentColor: "#1d4ed8",
    accentBg: "#0f172a",
    accentBorder: "#1e293b",
    causes: [
      {
        letter: "H",
        name: "Hipóxia",
        clues: [
          "Cianose, SpO₂ baixa antes da PCR",
          "Obstrução de via aérea, broncoespasmo grave",
          "Via aérea não estabelecida durante a RCP",
        ],
        intervention: "Abrir via aérea + ventilação com O₂ a 100%",
        interventionDetail:
          "Confirmar expansão torácica bilateral. Intubar se não resolvido. Causa mais comum em PCR pediátrica.",
      },
      {
        letter: "H",
        name: "Hipovolemia",
        clues: [
          "Sangramento ativo ou histórico de trauma/hemorragia",
          "Veias jugulares colabadas, pele seca e fria",
          "PCR após diarreia, vômitos intensos ou queimaduras extensas",
        ],
        intervention: "Reposição volêmica agressiva + controle da hemorragia",
        interventionDetail:
          "SF 0,9% ou cristaloide em bolus. Em trauma: controle cirúrgico é prioritário — fluidos não substituem hemostasia.",
      },
      {
        letter: "H",
        name: "Hidrogênio (acidose)",
        clues: [
          "Gasometria com pH < 7,1 ou bicarbonato muito baixo",
          "Cetoacidose diabética, insuficiência renal grave",
          "Intoxicação por salicilatos ou álcool tóxico",
        ],
        intervention: "Tratar a causa + bicarbonato de sódio 8,4% se pH < 7,1",
        interventionDetail:
          "Bicarbonato 1 mEq/kg IV. Indicado também em hipercalemia grave e intoxicação por antidepressivos tricíclicos.",
      },
      {
        letter: "H",
        name: "Hipo/Hipercalemia",
        clues: [
          "Hipercalemia: dialítico, insuficiência renal, ECG com onda T apiculada ou QRS alargado",
          "Hipocalemia: diuréticos, diarreia prolongada, hipomagnesemia associada",
          "Ritmo de PCR que não responde a medicação padrão",
        ],
        intervention: "Hipercalemia: gluconato de cálcio + insulina/glicose + bicarbonato",
        interventionDetail:
          "Gluconato de cálcio 10% 10 mL IV + insulina regular 10 U + glicose 50% 50 mL. Hipocalemia: reposição de KCl + magnésio.",
      },
      {
        letter: "H",
        name: "Hipotermia",
        clues: [
          "Temperatura central < 30°C",
          "Exposição ao frio, afogamento em água fria, PCR prolongada sem aquecimento",
          "PCR refratária sem causa aparente em ambiente frio",
        ],
        intervention: "Aquecimento ativo + RCP contínua até normotermia",
        interventionDetail:
          "\"Não está morto até estar quente e morto.\" Considerar ECMO para aquecimento em hipotermia grave. Epinefrina e desfibrilação menos eficazes abaixo de 30°C.",
      },
    ],
  },
  {
    id: "T",
    groupLabel: "5 Ts",
    groupSubtitle: "Causas obstrutivas e mecânicas",
    accentColor: "#7c2d12",
    accentBg: "#0f172a",
    accentBorder: "#1e293b",
    causes: [
      {
        letter: "T",
        name: "Tensão (pneumotórax hipertensivo)",
        clues: [
          "MV abolido unilateralmente, desvio de traqueia (tardio)",
          "Jugulares distendidas, hipotensão + hipertimpanismo à percussão",
          "Após intubação, VM ou trauma torácico",
        ],
        intervention: "Descompressão imediata com agulha no 2º EIC, linha hemiclavicular",
        interventionDetail:
          "Agulha 14G no 2º espaço intercostal, linha médio-clavicular. Seguida de drenagem torácica definitiva. Não aguardar RX.",
      },
      {
        letter: "T",
        name: "Tamponamento cardíaco",
        clues: [
          "Trauma torácico penetrante ou contuso recente",
          "Tríade de Beck (hipotensão + jugulares distendidas + bulhas abafadas) — nem sempre completa",
          "AESP com complexos de baixa amplitude no ECG; US à beira leito confirma",
        ],
        intervention: "Pericardiocentese de emergência + cirurgia se disponível",
        interventionDetail:
          "Pericardiocentese: agulha no ângulo xifoesternal, 45°, aspirar sangue. US-guiada se possível. Em trauma penetrante: toracotomia de ressuscitação.",
      },
      {
        letter: "T",
        name: "Trombose coronária (IAM)",
        clues: [
          "PCR em contexto de dor precordial, síncope ou equivalente isquêmico recente",
          "ECG (quando disponível): supradesnivelamento de ST, BRE novo",
          "Paciente com fatores de risco cardiovascular",
        ],
        intervention: "RCP de alta qualidade + cineangiocoronariografia emergencial pós-ROSC",
        interventionDetail:
          "Trombolítico durante RCP em ausência de laboratório de hemodinâmica (evidência limitada). Pós-ROSC: ECG urgente; se IAMCSST → hemodinâmica.",
      },
      {
        letter: "T",
        name: "Tromboembolia pulmonar (TEP)",
        clues: [
          "Dispneia súbita, dor pleurítica ou hemoptise antes da PCR",
          "Imobilização prolongada, cirurgia recente, gestação, TEP prévio",
          "AESP sem causa identificada, dilatação de VD ao US",
        ],
        intervention: "Trombolítico sistêmico durante RCP ou embolectomia cirúrgica",
        interventionDetail:
          "Alteplase 50 mg IV em bolus durante PCR por TEP maciço confirmado ou altamente suspeito. RCP por pelo menos 60–90 min após trombólise. Considerar ECMO.",
      },
      {
        letter: "T",
        name: "Tóxicos (intoxicações)",
        clues: [
          "História de exposição a fármaco, drogas ou toxina",
          "Anisocoria, miose extrema, QT longo, QRS alargado no ECG",
          "PCR em paciente jovem sem cardiopatia prévia",
        ],
        intervention: "Antídoto específico + suporte prolongado + toxicologia",
        interventionDetail:
          "Tricíclicos: bicarbonato 1–2 mEq/kg. Opioides: naloxona 0,4–2 mg IV. Organofosforados: atropina em altas doses. Intoxicação grave: considerar ECMO.",
      },
    ],
  },
];

// ── Componentes ───────────────────────────────────────────────────────────────

function CauseCard({ cause, group }: { cause: Cause; group: CauseGroup }) {
  return (
    <View style={[cc.card, { borderLeftColor: group.accentColor }]}>
      <View style={cc.header}>
        <View style={[cc.letterBadge, { backgroundColor: group.accentColor }]}>
          <Text style={cc.letterText}>{cause.letter}</Text>
        </View>
        <Text style={cc.causeName}>{cause.name}</Text>
      </View>

      {/* Reconhecimento */}
      <View style={cc.section}>
        <Text style={cc.sectionLabel}>Reconhecer</Text>
        {cause.clues.map((clue, i) => (
          <View key={i} style={cc.clueRow}>
            <View style={[cc.clueDot, { backgroundColor: group.accentColor }]} />
            <Text style={cc.clueText}>{clue}</Text>
          </View>
        ))}
      </View>

      {/* Intervenção */}
      <View style={[cc.interventionBlock, { backgroundColor: group.accentColor }]}>
        <Text style={cc.interventionLabel}>Intervenção</Text>
        <Text style={cc.interventionText}>{cause.intervention}</Text>
      </View>
      {cause.interventionDetail ? (
        <Text style={cc.interventionNote}>{cause.interventionDetail}</Text>
      ) : null}
    </View>
  );
}

function GroupHeader({ group }: { group: CauseGroup }) {
  return (
    <View style={[gh.block, { backgroundColor: group.accentBg, borderColor: group.accentBorder }]}>
      <View style={[gh.letterPill, { backgroundColor: group.accentColor }]}>
        <Text style={gh.letter}>{group.id}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[gh.label, { color: group.accentColor }]}>{group.groupLabel}</Text>
        <Text style={[gh.sublabel, { color: group.accentColor }]}>{group.groupSubtitle}</Text>
      </View>
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsReversibleCausesScreen() {
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>ACLS · Referência</Text>
        <Text style={s.introTitle}>Causas Reversíveis</Text>
        <Text style={s.introSubtitle}>5 Hs e 5 Ts</Text>
        <View style={s.introRule} />
        <Text style={s.introBody}>
          Durante toda PCR sem causa óbvia, pesquise e trate as causas reversíveis em paralelo
          com a RCP. O reconhecimento e a intervenção precoce são determinantes para o ROSC.
        </Text>
      </View>

      {/* Checklist rápido */}
      <View style={s.checklistCard}>
        <Text style={s.checklistTitle}>Checklist mental — revisão rápida</Text>
        <View style={s.checklistRow}>
          <View style={s.checklistCol}>
            <Text style={[s.checklistGroupLabel, { color: "#1d4ed8" }]}>5 Hs</Text>
            {["Hipóxia", "Hipovolemia", "Hidrogênio (acidose)", "Hipo/Hipercalemia", "Hipotermia"].map((h) => (
              <View key={h} style={s.checklistItem}>
                <View style={[s.checklistDot, { backgroundColor: "#1d4ed8" }]} />
                <Text style={s.checklistText}>{h}</Text>
              </View>
            ))}
          </View>
          <View style={s.checklistDivider} />
          <View style={s.checklistCol}>
            <Text style={[s.checklistGroupLabel, { color: "#7c2d12" }]}>5 Ts</Text>
            {["Tensão (PTX)", "Tamponamento", "Trombose coronária", "Tromboembolia pulmonar", "Tóxicos"].map((t) => (
              <View key={t} style={s.checklistItem}>
                <View style={[s.checklistDot, { backgroundColor: "#c2410c" }]} />
                <Text style={s.checklistText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Grupos e cards */}
      {CAUSE_GROUPS.map((group) => (
        <View key={group.id} style={s.group}>
          <GroupHeader group={group} />
          {group.causes.map((cause) => (
            <CauseCard key={cause.name} cause={cause} group={group} />
          ))}
        </View>
      ))}

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>Quando suspeitar de causa reversível?</Text>
        <Text style={s.footerBody}>
          AESP e assistolia têm sempre uma causa subjacente — pesquise sistematicamente. Mesmo
          em FV refratária, uma causa reversível não tratada impede o ROSC. Use US à beira
          leito (POCUS) sempre que disponível para tamponamento, TEP e hipovolemia.
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos do GroupHeader ────────────────────────────────────────────────────

const gh = StyleSheet.create({
  block: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  letterPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  letter: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sublabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
    lineHeight: 17,
  },
});

// ── Estilos do CauseCard ──────────────────────────────────────────────────────

const cc = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    borderLeftWidth: 5,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  letterBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  letterText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  causeName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
    flex: 1,
  },
  section: {
    gap: 7,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#64748b",
  },
  clueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  clueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  clueText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
    flex: 1,
    lineHeight: 19,
  },
  interventionBlock: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 3,
  },
  interventionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.7)",
  },
  interventionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 20,
  },
  interventionNote: {
    fontSize: 12,
    lineHeight: 18,
    color: "#94a3b8",
    fontWeight: "500",
    paddingHorizontal: 2,
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
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
    color: "#22d3ee",
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
    color: "#94a3b8",
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: {
    height: 1,
    backgroundColor: "#334155",
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // ── Checklist ──
  checklistCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  checklistRow: {
    flexDirection: "row",
    gap: 0,
  },
  checklistCol: {
    flex: 1,
    gap: 7,
  },
  checklistGroupLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  checklistDivider: {
    width: 1,
    backgroundColor: "#334155",
    marginHorizontal: 14,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  checklistDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  checklistText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    lineHeight: 18,
  },

  // ── Grupo ──
  group: {
    gap: 10,
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 10,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#22d3ee",
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#94a3b8",
    fontWeight: "500",
  },
  footerRule: {
    height: 1,
    backgroundColor: "#1e293b",
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 0.2,
  },
});
