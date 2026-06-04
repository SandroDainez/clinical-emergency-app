import { Text, View } from "react-native";

/**
 * Card de condução do ciclo de RCP — "modo instrutor ACLS".
 * Mostra, em cada ciclo de 2 minutos, os lembretes que um instrutor de ACLS
 * cobra ativamente: qualidade das compressões, troca de compressor, acesso
 * vascular, via aérea avançada + capnografia e causas reversíveis (5H/5T).
 * É puramente informativo — não adiciona toques obrigatórios ao fluxo.
 */

type CprGuidanceItem = {
  icon: string;
  text: string;
  tone: "base" | "switch" | "airway" | "access" | "causes" | "capno";
};

type CprGuidanceCardProps = {
  stateId: string;
  advancedAirwaySecured?: boolean;
  cycleNumber?: number;
};

const CPR_STATE_IDS = [
  "rcp_1",
  "rcp_2",
  "rcp_3",
  "nao_chocavel_epinefrina",
  "nao_chocavel_ciclo",
];

function isFirstCprCycle(stateId: string) {
  return stateId === "rcp_1" || stateId === "nao_chocavel_epinefrina";
}

function shouldReviewReversibleCauses(stateId: string) {
  return (
    stateId === "rcp_3" ||
    stateId === "nao_chocavel_epinefrina" ||
    stateId === "nao_chocavel_ciclo"
  );
}

function buildGuidanceItems(
  stateId: string,
  advancedAirwaySecured: boolean
): CprGuidanceItem[] {
  const items: CprGuidanceItem[] = [];

  // Qualidade das compressões — sempre
  items.push({
    icon: "⏱",
    text: "Compressões 100–120/min · 5–6 cm · deixar o tórax voltar",
    tone: "base",
  });

  // Troca de compressor — a cada ciclo de 2 min
  items.push({
    icon: "🔄",
    text: "Trocar quem comprime agora — evitar fadiga (a cada 2 min)",
    tone: "switch",
  });

  // Ventilação — depende de via aérea avançada
  if (advancedAirwaySecured) {
    items.push({
      icon: "🫁",
      text: "Via aérea avançada: 1 ventilação a cada 6 s · compressões contínuas",
      tone: "airway",
    });
    items.push({
      icon: "📈",
      text: "Capnografia: ETCO₂ < 10 = melhorar RCP · salto súbito = possível ROSC",
      tone: "capno",
    });
  } else {
    items.push({
      icon: "🫁",
      text: "30 compressões : 2 ventilações (sem via aérea avançada)",
      tone: "base",
    });
    // Considerar via aérea avançada a partir do 2º ciclo (após acesso garantido)
    if (!isFirstCprCycle(stateId)) {
      items.push({
        icon: "🩺",
        text: "Considerar via aérea avançada (IOT ou supraglótica) + capnografia",
        tone: "airway",
      });
    }
  }

  // Acesso vascular — primeiro ciclo
  if (isFirstCprCycle(stateId)) {
    items.push({
      icon: "💉",
      text: "Obter acesso IV (1ª escolha) ou IO",
      tone: "access",
    });
  }

  // Causas reversíveis — ciclos refratários
  if (shouldReviewReversibleCauses(stateId)) {
    items.push({
      icon: "🔎",
      text: "Pensar nas causas: 5 H e 5 T (hipovolemia, hipóxia, H⁺, K⁺, hipotermia · pneumotórax, tamponamento, toxinas, TEP, IAM)",
      tone: "causes",
    });
  }

  return items;
}

function toneColor(tone: CprGuidanceItem["tone"]): string {
  switch (tone) {
    case "switch":
      return "#fbbf24"; // amarelo — ação que se esquece
    case "airway":
      return "#22d3ee"; // cyan
    case "access":
      return "#a78bfa"; // roxo
    case "causes":
      return "#fb923c"; // laranja
    case "capno":
      return "#4ade80"; // verde
    default:
      return "#93c5fd"; // azul base
  }
}

export default function CprGuidanceCard({
  stateId,
  advancedAirwaySecured,
  cycleNumber,
}: CprGuidanceCardProps) {
  if (!CPR_STATE_IDS.includes(stateId)) {
    return null;
  }

  const items = buildGuidanceItems(stateId, advancedAirwaySecured ?? false);

  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: "#0f172a",
        borderWidth: 1,
        borderColor: "#1e293b",
        paddingHorizontal: 18,
        paddingVertical: 16,
        gap: 12,
      }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}>
          Conduta deste ciclo · 2 min
        </Text>
        {typeof cycleNumber === "number" && cycleNumber > 0 ? (
          <View
            style={{
              borderRadius: 999,
              backgroundColor: "rgba(14,116,144,0.18)",
              borderWidth: 1,
              borderColor: "#0e7490",
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#22d3ee" }}>
              Ciclo {cycleNumber}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 10 }}>
        {items.map((item, index) => (
          <View
            key={`${item.tone}-${index}`}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                backgroundColor: "rgba(148,163,184,0.08)",
                borderWidth: 1,
                borderColor: toneColor(item.tone),
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
              <Text style={{ fontSize: 13 }}>{item.icon}</Text>
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 13.5,
                lineHeight: 19,
                fontWeight: item.tone === "switch" ? "700" : "500",
                color: item.tone === "switch" ? "#fde68a" : "#cbd5e1",
              }}>
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
