import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo das Síndromes Coronarianas Agudas (SCA) no adulto.
 * Ordem real de atendimento: dor torácica → medidas imediatas + AAS → ECG ≤10 min
 * → classificação STEMI x SCA sem supra de ST → terapia antitrombótica/anti-isquêmica
 * → reperfusão (ICP primária x fibrinólise) ou estratégia invasiva por risco → destino.
 *
 * Baseado nas diretrizes AHA/ACC (2021 Chest Pain; 2013/2025 STEMI) e ESC 2023
 * (Acute Coronary Syndromes). Doses de tenecteplase e enoxaparina calculadas por peso.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * NÃO substitui o julgamento clínico nem o protocolo institucional. A decisão e a
 * responsabilidade finais são do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round0(n: number): string {
  return Math.round(n).toString();
}

/** Tenecteplase por faixa de peso (bolus IV único). */
function tnkByWeight(peso: number): number {
  if (peso < 60) return 30;
  if (peso < 70) return 35;
  if (peso < 80) return 40;
  if (peso < 90) return 45;
  return 50;
}

function deriveCoronary(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    out.enoxa = round0(1.0 * peso); // 1 mg/kg SC 12/12h
    out.enoxa75 = round0(0.75 * peso); // ≥75 anos: 0,75 mg/kg
    out.hnfBolus = round0(Math.min(60 * peso, 4000)); // 60 U/kg, máx 4000
    out.hnfInf = round0(Math.min(12 * peso, 1000)); // 12 U/kg/h, máx 1000/h
    out.tnk = tnkByWeight(peso).toString();
    out.tnkHalf = (tnkByWeight(peso) / 2).toString(); // ≥75 anos (STREAM)
  } else {
    out.enoxa = "1 mg/kg";
    out.enoxa75 = "0,75 mg/kg";
    out.hnfBolus = "60 U/kg (máx 4000)";
    out.hnfInf = "12 U/kg/h (máx 1000)";
    out.tnk = "ajustada ao peso";
    out.tnkHalf = "metade da dose";
  }
  return out;
}

export const coronaryDecisionTree: DecisionTreeDefinition = {
  id: "sca_acs_2023",
  version: "2023.1",
  label: "Síndromes Coronarianas",
  entryNodeId: "entry",
  derive: deriveCoronary,
  nodes: {
    // ── 1. Reconhecimento e medidas imediatas ─────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de SCA — dor torácica / equivalente anginoso",
      summary: "Tempo é músculo. Medidas iniciais e ECG em paralelo, sem atrasar.",
      actions: [
        "Monitor cardíaco contínuo, oximetria, PA, 2 acessos venosos; desfibrilador próximo.",
        "ECG de 12 derivações em ATÉ 10 min da chegada (repetir se dor persistir/mudar).",
        "AAS 300 mg mastigável agora (162–325 mg), salvo alergia/sangramento ativo.",
        "O₂ apenas se SpO₂ < 90% ou desconforto respiratório. Coletar troponina.",
        "Anamnese dirigida e exame em paralelo (não atrasar o ECG nem o AAS).",
      ],
      next: "tempo",
    },

    tempo: {
      id: "tempo",
      type: "input",
      title: "Tempo desde o início dos sintomas",
      intro: "Toque na janela. Define a elegibilidade e a urgência da reperfusão no STEMI.",
      fields: [
        {
          id: "tempo_dor",
          label: "Início dos sintomas",
          presets: [
            { value: "< 1 h", label: "< 1 h" },
            { value: "1–3 h", label: "1–3 h" },
            { value: "3–6 h", label: "3–6 h" },
            { value: "6–12 h", label: "6–12 h" },
            { value: "> 12 h", label: "> 12 h" },
            { value: "intermitente / indefinido", label: "Indefinido" },
          ],
        },
      ],
      next: "ecg",
    },

    // ── 2. ECG: classificação primária ────────────────────────────────────────
    ecg: {
      id: "ecg",
      type: "decision",
      title: "ECG de 12 derivações",
      question: "Há supradesnivelamento de ST (ou BRE/BRD novo) com critério?",
      evidence: [
        "Supra de ST ≥ 1 mm (0,1 mV) em ≥ 2 derivações contíguas.",
        "Em V2–V3: ≥ 2 mm (homens ≥ 40a), ≥ 2,5 mm (homens < 40a) ou ≥ 1,5 mm (mulheres).",
        "BRE novo / presumidamente novo com critérios de Sgarbossa; BRD novo com clínica isquêmica.",
        "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável) até definição pela troponina.",
      ],
      options: [
        { id: "stemi", label: "Sim — supra de ST / BRE-BRD novo (STEMI)", next: "stemi_localizacao" },
        { id: "nste", label: "Não — sem supra de ST", next: "nste_trop" },
      ],
    },

    // ════════════════════════ RAMO STEMI ═════════════════════════════════════
    stemi_localizacao: {
      id: "stemi_localizacao",
      type: "action",
      title: "STEMI confirmado — localizar a parede",
      summary: "Localizar o infarto orienta complicações e cuidados específicos.",
      actions: [
        "Anterior/septal (V1–V4): risco de disfunção de VE e bloqueios — atenção hemodinâmica.",
        "Inferior (DII, DIII, aVF): obter V3R–V4R para IAM de VD e V7–V9 para parede posterior.",
        "IAM de VD ou inferior com hipotensão: NÃO usar nitrato/morfina; fazer volume (cristaloide).",
        "Acionar a hemodinâmica/cardiologia AGORA, em paralelo às medicações.",
      ],
      next: "stemi_dados",
    },

    stemi_dados: {
      id: "stemi_dados",
      type: "input",
      title: "Peso para cálculo de dose",
      intro: "Toque no peso (ou adicione). Usado para enoxaparina, heparina e tenecteplase.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "stemi_meds",
    },

    stemi_meds: {
      id: "stemi_meds",
      type: "action",
      title: "Terapia antitrombótica e adjuvante — STEMI",
      summary: "Iniciar em paralelo à definição da reperfusão (não atrasar a reperfusão).",
      actions: [
        "AAS já administrado (300 mg). Manter 81–100 mg/dia.",
        "2º antiplaquetário: se ICP primária → ticagrelor 180 mg OU prasugrel 60 mg (evitar prasugrel se AVC/AIT prévio, > 75a ou < 60 kg). Se fibrinólise → clopidogrel 300 mg (sem ataque e 75 mg se ≥ 75a).",
        "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg, sem bolus IV) OU HNF bolus {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).",
        "Atorvastatina 80 mg VO. Nitrato e morfina (2–4 mg) só se necessário e sem contraindicação (VD/hipotensão/PDE5).",
        "Betabloqueador VO nas primeiras 24 h se SEM IC aguda, baixo débito, BAV ou broncoespasmo.",
      ],
      next: "stemi_reperfusao",
    },

    stemi_reperfusao: {
      id: "stemi_reperfusao",
      type: "decision",
      title: "Estratégia de reperfusão",
      question: "Angioplastia primária (ICP) disponível com tempo porta-balão ≤ 120 min?",
      summary: "Tempo de sintomas: {tempo_dor}.",
      evidence: [
        "ICP primária é preferida quando o tempo porta-balão é ≤ 120 min (meta ≤ 90 min em centro com hemodinâmica).",
        "Se a ICP não for possível em ≤ 120 min e o início for ≤ 12 h → fibrinólise (porta-agulha ≤ 30 min).",
        "Reperfusão indicada até 12 h; entre 12–24 h apenas se isquemia/instabilidade persistente.",
      ],
      options: [
        { id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },
        { id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },
      ],
    },

    stemi_icp: {
      id: "stemi_icp",
      type: "action",
      title: "Angioplastia primária (ICP)",
      summary: "Reperfusão mecânica preferencial. Meta porta-balão ≤ 90 min.",
      actions: [
        "Acionar a sala de hemodinâmica imediatamente; transporte monitorizado.",
        "Confirmar dupla antiagregação e anticoagulação peri-procedimento conforme serviço.",
        "Manter monitorização, tratar arritmias e instabilidade durante o transporte.",
        "Não atrasar a ICP por exames complementares.",
      ],
      next: "stemi_destino",
    },

    stemi_fibrino_check: {
      id: "stemi_fibrino_check",
      type: "decision",
      title: "Contraindicações à fibrinólise",
      question: "Há alguma contraindicação ABSOLUTA à fibrinólise?",
      evidence: [
        "Qualquer hemorragia intracraniana prévia; AVC isquêmico nos últimos 3 meses (exceto < 4,5 h).",
        "Neoplasia ou malformação vascular intracraniana conhecida; TCE/trauma facial grave < 3 meses.",
        "Sangramento ativo (exceto menstruação); suspeita de dissecção de aorta.",
        "Cirurgia intracraniana ou espinhal < 2 meses; HAS grave não controlável (> 185/110).",
      ],
      options: [
        { id: "sem", label: "Sem contraindicação", next: "stemi_fibrinolise" },
        { id: "com", label: "Há contraindicação", next: "stemi_transfer" },
      ],
    },

    stemi_fibrinolise: {
      id: "stemi_fibrinolise",
      type: "action",
      title: "Fibrinólise — dose calculada",
      summary: "Porta-agulha ≤ 30 min. Sempre seguida de estratégia fármaco-invasiva.",
      actions: [
        "Tenecteplase (TNK) {tnk} mg IV em bolus único (≥ 75 anos: reduzir à metade → {tnkHalf} mg).",
        "Associar: clopidogrel (300 mg; 75 mg sem ataque se ≥ 75a) + enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg, sem bolus).",
        "Transferir para centro com ICP: angiografia entre 2–24 h se reperfusão bem-sucedida.",
        "ICP de resgate IMEDIATA se falha (redução do supra de ST < 50% em 60–90 min, dor ou instabilidade).",
      ],
      next: "stemi_destino",
    },

    stemi_transfer: {
      id: "stemi_transfer",
      type: "action",
      title: "Transferência urgente para ICP",
      summary: "Fibrinólise contraindicada → reperfusão mecânica é a única opção.",
      actions: [
        "Acionar transferência imediata para centro com hemodinâmica (ICP de resgate/primária).",
        "Transporte monitorizado com desfibrilador; manter antitrombóticos conforme serviço.",
        "Comunicar a hemodinâmica de destino para reduzir o tempo até o balão.",
        "Tratar instabilidade hemodinâmica/elétrica durante o transporte.",
      ],
      next: "stemi_destino",
    },

    stemi_destino: {
      id: "stemi_destino",
      type: "transition",
      title: "Hemodinâmica → Unidade Coronariana / UTI",
      summary: "Monitorização pós-reperfusão e prevenção de complicações.",
      disposition: "icu",
      exitCriteria: [
        "Internação em unidade coronariana/UTI com monitorização contínua.",
        "Vigiar reoclusão, arritmias de reperfusão, IC e complicações mecânicas.",
        "Manter DAPT, estatina de alta potência, IECA/BRA e betabloqueador conforme tolerância.",
        "Ecocardiograma para avaliar função de VE; planejar prevenção secundária.",
      ],
      targets: [],
    },

    // ════════════════════ RAMO SCA SEM SUPRA DE ST ═══════════════════════════
    nste_trop: {
      id: "nste_trop",
      type: "decision",
      title: "Troponina e alterações isquêmicas",
      question: "Troponina elevada (ou curva ascendente) e/ou alterações isquêmicas dinâmicas?",
      evidence: [
        "Troponina de alta sensibilidade com elevação/queda significativa = NSTEMI.",
        "Infra de ST ≥ 0,5 mm ou inversão de T profunda dinâmica reforçam isquemia.",
        "Protocolo 0 h/1 h (ou 0 h/3 h): troponina seriada para confirmar/descartar.",
        "Sem elevação e ECG sem alteração = avaliar angina instável vs causa não isquêmica (HEART score).",
      ],
      options: [
        { id: "positivo", label: "Sim — troponina+/ST dinâmico (NSTE-ACS)", next: "nste_dados" },
        { id: "negativo", label: "Não — sem elevação / ECG normal", next: "nste_baixo" },
      ],
    },

    nste_dados: {
      id: "nste_dados",
      type: "input",
      title: "Peso para cálculo de dose",
      intro: "Toque no peso (ou adicione). Usado para enoxaparina e heparina.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "nste_meds",
    },

    nste_meds: {
      id: "nste_meds",
      type: "action",
      title: "Terapia antitrombótica e anti-isquêmica — SCA sem supra",
      summary: "Tratar enquanto se define o tempo da estratégia invasiva.",
      actions: [
        "AAS já administrado (300 mg). Manter 81–100 mg/dia.",
        "2º antiplaquetário: ticagrelor 180 mg (manutenção 90 mg 12/12h) — preferir após definição anatômica; clopidogrel 300–600 mg como alternativa.",
        "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg) OU fondaparinux 2,5 mg SC/dia OU HNF bolus {hnfBolus} U + {hnfInf} U/h.",
        "Anti-isquêmico: nitrato (SL/IV) se dor/HAS/IC e sem contraindicação; betabloqueador VO se sem IC aguda/BAV/broncoespasmo.",
        "Atorvastatina 80 mg VO. Morfina 2–4 mg só se dor refratária.",
      ],
      next: "nste_risco",
    },

    nste_risco: {
      id: "nste_risco",
      type: "decision",
      title: "Estratificação de risco → tempo da coronariografia",
      question: "Qual a categoria de risco do paciente?",
      summary: "Define a urgência da estratégia invasiva (ESC 2023).",
      evidence: [
        "MUITO ALTO (invasiva imediata < 2 h): instabilidade hemodinâmica/choque, dor refratária, arritmia ameaçadora/PCR, complicação mecânica, IC aguda, infra de ST extenso + supra em aVR.",
        "ALTO (< 24 h): NSTEMI confirmado por troponina, alterações dinâmicas de ST/T, GRACE > 140.",
        "INTERMEDIÁRIO (< 72 h): DM, TFG < 60, FE < 40%/IC, angina pós-IAM, ICP/CRM prévia, GRACE 109–140.",
      ],
      options: [
        { id: "muito_alto", label: "Muito alto — invasiva imediata (< 2 h)", next: "nste_invasiva_imediata" },
        { id: "alto", label: "Alto — invasiva precoce (< 24 h)", next: "nste_invasiva_precoce" },
        { id: "intermediario", label: "Intermediário — invasiva (< 72 h)", next: "nste_invasiva_precoce" },
      ],
    },

    nste_invasiva_imediata: {
      id: "nste_invasiva_imediata",
      type: "action",
      title: "Estratégia invasiva IMEDIATA (< 2 h)",
      summary: "Conduta semelhante ao STEMI pela instabilidade.",
      actions: [
        "Acionar a hemodinâmica imediatamente — coronariografia/ICP em < 2 h.",
        "Estabilizar em paralelo: arritmias, IC aguda, choque (considerar suporte).",
        "Manter dupla antiagregação e anticoagulação conforme o serviço.",
        "Transporte monitorizado com desfibrilador.",
      ],
      next: "nste_destino",
    },

    nste_invasiva_precoce: {
      id: "nste_invasiva_precoce",
      type: "action",
      title: "Estratégia invasiva precoce/programada",
      summary: "Coronariografia conforme a categoria de risco (< 24 h alto; < 72 h intermediário).",
      actions: [
        "Programar coronariografia: < 24 h (alto risco) ou < 72 h (intermediário).",
        "Manter monitorização contínua, troponina e ECG seriados.",
        "Otimizar terapia antitrombótica e anti-isquêmica enquanto aguarda.",
        "Reclassificar para invasiva imediata se surgir instabilidade ou dor refratária.",
      ],
      next: "nste_destino",
    },

    nste_baixo: {
      id: "nste_baixo",
      type: "action",
      title: "Baixo risco — seriar e estratificar",
      summary: "Sem elevação de troponina e ECG sem alteração isquêmica.",
      actions: [
        "Repetir troponina e ECG (protocolo 0 h/1 h ou 0 h/3 h) e aplicar HEART score.",
        "Se troponina permanece negativa e HEART baixo: considerar teste não invasivo de isquemia ou angio-TC de coronárias.",
        "Manter AAS; só escalar antitrombóticos se confirmar SCA.",
        "Investigar e tratar diagnósticos diferenciais (dissecção, TEP, pericardite, causas não cardíacas).",
      ],
      next: "nste_destino",
    },

    nste_destino: {
      id: "nste_destino",
      type: "transition",
      title: "Unidade coronariana / observação",
      summary: "Destino conforme risco e resposta.",
      disposition: "icu",
      exitCriteria: [
        "NSTE-ACS confirmado: unidade coronariana/UTI até a coronariografia e estabilização.",
        "Baixo risco com investigação negativa: observação/alta com seguimento e teste ambulatorial.",
        "Manter DAPT, estatina de alta potência e prevenção secundária conforme diagnóstico.",
        "Reavaliar a qualquer recorrência de dor, alteração de ECG ou instabilidade.",
      ],
      targets: [],
    },
  },
};
