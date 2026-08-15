/**
 * 5 Hs e 5 Ts — pistas diagnósticas e CONDUTA ESPECÍFICA de cada causa.
 *
 * ⚠️ NÃO CONFUNDIR COM `lib/causas-reversiveis.ts`, que tem só os NOMES para
 * caber num card de consulta rápida. Aqui está o detalhe.
 *
 * ── POR QUE ISTO SAIU DA TELA E VIROU LIB ───────────────────────────────────
 *
 * O dado morava dentro de `acls-reversible-causes-screen.tsx`, e por isso só
 * podia ser lido por quem renderiza React. O `protocol.json` — que alimenta o
 * painel de causas ABERTO DURANTE A PARADA — tinha a sua PRÓPRIA lista das dez,
 * com condutas genéricas:
 *
 *     hipo_hipercalemia → "Considerar correção específica conforme a suspeita"
 *     pneumotorax       → "Descompressão torácica imediata se a suspeita for forte"
 *     acidose           → "Considerar gasometria e corrigir a causa de base"
 *
 * As dez eram assim. Enquanto isso, o módulo de consulta — auditado nesta fase —
 * tinha o sítio anatômico, o comprimento da agulha, o limiar de pH e a sequência
 * da hipercalemia com os dois sais de cálcio.
 *
 * É R-48 na inversão mais grave que a auditoria encontrou: o conteúdo
 * ESPECÍFICO na superfície de CONSULTA, e o genérico na superfície de AÇÃO —
 * a que está aberta enquanto alguém comprime o tórax.
 *
 * Movendo o dado para cá, as duas superfícies passam a CONSUMIR a mesma coisa.
 * A tela renderiza; o reducer monta as ações do painel da parada a partir de
 * `ACOES_NA_PARADA`.
 */

import {
  HIPERCALEMIA_NA_PARADA,
  PNEUMOTORAX_NA_PARADA,
  TAMPONAMENTO_NA_PARADA,
  TEP_NA_PARADA_COMPROMISSO,
} from "./causas-na-parada";

export type Cause = {
  /**
   * O id da mesma causa em `protocol.json`, que é a superfície de AÇÃO — o
   * painel aberto DURANTE a parada. Explícito e não por posição: reordenar a
   * lista aqui não pode trocar a conduta de duas causas lá.
   */
  protocolId: string;
  letter: string;
  name: string;
  clues: string[];
  intervention: string;
  interventionDetail?: string;
};

export type CauseGroup = {
  id: "H" | "T";
  groupLabel: string;
  groupSubtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  causes: Cause[];
};

// ── Dados clínicos ─────────────────────────────────────────────────────────────

/**
 * Conteúdo clínico dos Hs e Ts — consumido também pela versão migrada
 * (acls-reversible-causes-screen-v2.tsx). Importado, nunca copiado.
 */
export const CAUSE_GROUPS: CauseGroup[] = [
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
        protocolId: "hipoxia",
        clues: [
          "Cianose, SpO₂ baixa antes da PCR",
          "Obstrução de via aérea, broncoespasmo grave",
          "Via aérea não estabelecida durante a RCP",
        ],
        intervention: "Abrir via aérea + ventilação com O₂ a 100%",
        interventionDetail:
          "Confirmar expansão torácica bilateral. Intubar se não resolvido. Causa mais comum em PCR pediátrica. → Via aérea e parâmetros em ISR e Ventilação Mecânica.",
      },
      {
        letter: "H",
        name: "Hipovolemia",
        protocolId: "hipovolemia",
        clues: [
          "Sangramento ativo ou histórico de trauma/hemorragia",
          "Veias jugulares colabadas, pele seca e fria",
          "PCR após diarreia, vômitos intensos ou queimaduras extensas",
        ],
        intervention: "Reposição volêmica agressiva + controle da hemorragia",
        interventionDetail:
          "SF 0,9% ou cristaloide em bolus. Em trauma: controle cirúrgico é prioritário — fluidos não substituem hemostasia. → Estratégia de reposição e controle de sangramento em Choque e Politrauma.",
      },
      {
        letter: "H",
        name: "Hidrogênio (acidose)",
        protocolId: "acidose",
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
        protocolId: "hipo_hipercalemia",
        clues: [
          "Hipercalemia: dialítico, insuficiência renal, ECG com onda T apiculada ou QRS alargado",
          "Hipocalemia: diuréticos, diarreia prolongada, hipomagnesemia associada",
          "Ritmo de PCR que não responde a medicação padrão",
        ],
        intervention: "Hipercalemia: gluconato de cálcio + insulina/glicose + bicarbonato",
        interventionDetail:
          HIPERCALEMIA_NA_PARADA + " " +
          "Gluconato de cálcio 10% 10 mL IV + insulina regular 10 U + glicose 50% 50 mL. Hipocalemia: reposição de KCl + magnésio.",
      },
      {
        letter: "H",
        name: "Hipotermia",
        protocolId: "hipotermia",
        clues: [
          "Temperatura central < 30°C",
          "Exposição ao frio, afogamento em água fria, PCR prolongada sem aquecimento",
          "PCR refratária sem causa aparente em ambiente frio",
        ],
        intervention: "Aquecimento ativo + RCP contínua até normotermia",
        interventionDetail:
          "\"Não está morto até estar quente e morto.\" Considerar ECMO para aquecimento em hipotermia grave. ABAIXO DE 30 °C não é só \"menos eficaz\" — muda a conduta: SUSPENDER as drogas IV (a adrenalina não age no miocárdio frio e ACUMULA, com toxicidade ao reaquecer) e LIMITAR a desfibrilação a até 3 choques, adiando novas tentativas até a temperatura passar de 30 °C. Manter a RCP sem interrupção enquanto aquece: a decisão de parar é pela temperatura, não pelo tempo. → Reaquecimento extracorpóreo (ECMO/CEC) tem o melhor desfecho na hipotermia grave com parada: acionar a equipe EM PARALELO à RCP, não depois dela.",
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
        protocolId: "pneumotorax_hipertensivo",
        clues: [
          "MV abolido unilateralmente, desvio de traqueia (tardio)",
          "Jugulares distendidas, hipotensão + hipertimpanismo à percussão",
          "Após intubação, VM ou trauma torácico",
        ],
        intervention: "Descompressão imediata com agulha no 2º EIC, linha hemiclavicular",
        interventionDetail:
          PNEUMOTORAX_NA_PARADA + " " +
          "Agulha 14G no 2º espaço intercostal, linha médio-clavicular. Seguida de drenagem torácica definitiva. Não aguardar RX.",
      },
      {
        letter: "T",
        name: "Tamponamento cardíaco",
        protocolId: "tamponamento_cardiaco",
        clues: [
          "Trauma torácico penetrante ou contuso recente",
          "Tríade de Beck (hipotensão + jugulares distendidas + bulhas abafadas) — nem sempre completa",
          "AESP com complexos de baixa amplitude no ECG; US à beira leito confirma",
        ],
        intervention: "Pericardiocentese de emergência + cirurgia se disponível",
        interventionDetail:
          TAMPONAMENTO_NA_PARADA + " " +
          "Pericardiocentese: agulha no ângulo xifoesternal, 45°, aspirar sangue. US-guiada se possível. Em trauma penetrante: toracotomia de ressuscitação.",
      },
      {
        letter: "T",
        name: "Trombose coronária (IAM)",
        protocolId: "trombose_coronaria",
        clues: [
          "PCR em contexto de dor precordial, síncope ou equivalente isquêmico recente",
          "ECG (quando disponível): supradesnivelamento de ST, BRE novo",
          "Paciente com fatores de risco cardiovascular",
        ],
        intervention: "RCP de alta qualidade + cineangiocoronariografia emergencial pós-ROSC",
        interventionDetail:
          "Trombolítico durante RCP em ausência de laboratório de hemodinâmica (evidência limitada). Pós-ROSC: ECG urgente; se IAMCSST → hemodinâmica. → Critérios de reperfusão e tempos porta-balão no módulo Síndromes Coronarianas.",
      },
      {
        letter: "T",
        name: "Tromboembolia pulmonar (TEP)",
        protocolId: "trombose_pulmonar",
        clues: [
          "Dispneia súbita, dor pleurítica ou hemoptise antes da PCR",
          "Imobilização prolongada, cirurgia recente, gestação, TEP prévio",
          "AESP sem causa identificada, dilatação de VD ao US",
        ],
        intervention: "Trombolítico sistêmico durante RCP ou embolectomia cirúrgica",
        // Este card é consultado NO MEIO da parada — é o pior lugar possível
        // para dizer só "não há dose estabelecida, siga o protocolo local".
        // Serviço sem protocolo escrito é a regra, não a exceção, e o vazio
        // empurra para a improvisação. O esquema abaixo vem rotulado como o mais
        // usado na prática, não como recomendação da AHA. Mesmo texto da árvore
        // do TEP, para as duas telas não divergirem.
        interventionDetail:
          TEP_NA_PARADA_COMPROMISSO + " " +
          "Fibrinólise é razoável na PCR por TEP confirmado, e pode ser considerada quando o TEP é apenas suspeito. A AHA 2025 não fixa esquema. SEM protocolo institucional, o mais usado e mais descrito é alteplase 50 mg IV em BÓLUS durante a RCP, repetindo 50 mg em 15–20 min se a parada persistir (ERC e séries publicadas — não é dose chancelada pela AHA; registre a fonte). MANTER RCP por 60–90 min após a dose antes de considerar encerrar. Considerar ECMO.",
      },
      {
        letter: "T",
        name: "Tóxicos (intoxicações)",
        protocolId: "toxinas",
        clues: [
          "História de exposição a fármaco, drogas ou toxina",
          "Anisocoria, miose extrema, QT longo, QRS alargado no ECG",
          "PCR em paciente jovem sem cardiopatia prévia",
        ],
        intervention: "Antídoto específico + suporte prolongado + toxicologia",
        interventionDetail:
          "Tricíclicos: bicarbonato 1–2 mEq/kg. Opioides: naloxona 0,4–2 mg IV se o opioide for desconhecido — fentanil e análogos podem exigir mais de 2 mg ou infusão; se a equipe deu o opioide, titular 0,1–0,2 mg. A meia-vida da naloxona é MENOR que a da maioria dos opioides: a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado — vigiar por horas. Organofosforados: atropina em altas doses. Intoxicação grave: considerar ECMO. → O antídoto é específico de cada agente, e listar alguns aqui criaria a mesma lista parcial que este módulo existe para evitar: abrir Intoxicações Exógenas.",
      },
    ],
  },
];

/**
 * As condutas indexadas pelo id de `protocol.json`, para o painel que abre
 * DURANTE a parada.
 *
 * A conduta curta vem primeiro porque é o que se lê em movimento; o detalhe
 * vem em seguida, para quem tem dois segundos. Derivado — nunca escrito à mão —
 * para que a próxima correção no módulo de consulta chegue à parada sozinha.
 */
export const ACOES_NA_PARADA: Record<string, string[]> = Object.fromEntries(
  CAUSE_GROUPS.flatMap((grupo) =>
    grupo.causes.map((causa) => [
      causa.protocolId,
      [causa.intervention, causa.interventionDetail].filter(
        (linha): linha is string => typeof linha === "string" && linha.length > 0
      ),
    ])
  )
);
