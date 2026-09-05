import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import { HIPERCAPNIA_EXCECAO_NA_SDRA, HIPERCAPNIA_PERMISSIVA_ONDE_NAO_APLICAR, HIPERCAPNIA_VETO_ANTES_DE_PERMITIR } from "./lib/hipercapnia-permissiva";
import { TABELA_LOW_PEEP, TABELA_PEEP_FONTE, TABELA_PEEP_RESSALVA } from "./lib/tabela-peep";
import { ALVOS_TCE, TCE_HIPERVENTILACAO, TCE_HIPERVENTILACAO_PROIBIDA } from "./lib/alvos-tce";
import { FENTANIL_ANALGOSEDACAO } from "./lib/fentanil-analgosedacao";
import {
  ALARMES_APNEIA,
  ALARMES_CONDUTA,
  ALARMES_PRESSAO,
  ALARMES_PRINCIPIO,
  ALARMES_VOLUME,
} from "./lib/alarmes-ventilador";

/**
 * Fluxo interativo de Ventilação Mecânica invasiva no adulto.
 * Baseado em: ARDSNet (NEJM 2000) · Surviving Sepsis 2021 · ERS/ESICM 2017 ·
 * ACCP Weaning 2017 · Berlim 2012 + Nova Definição Global de SDRA (AJRCCM 2024) ·
 * Miller's Anesthesia 9ª ed.
 *
 * Ordem: indicação/modo + sedação (analgesia primeiro) → PESO PREDITO (define o VC)
 * → ajuste inicial protetor → ESTRATÉGIA POR PATOLOGIA → segurança (Pplat/DP) →
 * troubleshooting (DOPES + assincronia) → DESMAME (elegibilidade → TRE → extubação
 * ou reconectar) → destino.
 *
 * O peso predito e o volume corrente-alvo (4–8 mL/kg) são calculados pela ALTURA.
 * NÃO substitui o julgamento clínico nem o protocolo institucional.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round0(n: number): string {
  return Math.round(n).toString();
}

/**
 * Sexo, normalizado — ou `null` quando não dá para afirmar.
 *
 * ── POR QUE ISTO NÃO TEM DEFAULT ─────────────────────────────────────────────
 *
 * Existiam DUAS implementações de peso predito neste app, e elas discordavam
 * exatamente onde ninguém olha: no sexo AUSENTE.
 *
 *   árvore/calculadoras:  `sexo === "feminino" ? 45,5 : 50`   → assumia HOMEM
 *   ventilation-engine:   `/^m/i.test(sex)`                    → assumia MULHER
 *
 * Mesmo paciente, mesmo app, PBW diferente: a 175 cm, 70,6 × 66,1 kg — Vt de
 * 423 × 396 mL. Nenhuma das duas avisava; as duas devolviam um número.
 *
 * E o `/^m/i` ainda classificava **"Mulher" como masculino**, porque testava a
 * INICIAL. Não era risco teórico: o campo é um `TextInput` de valor livre, com
 * os presets como botões de conveniência abaixo.
 *
 * Sexo é categoria, não prefixo, e sexo ausente é DESCONHECIDO — não é homem
 * nem mulher por omissão. Quem chama trata o `null`; ninguém chuta.
 */
export type SexoNormalizado = "masculino" | "feminino";

export function normalizarSexo(sexo: string | undefined | null): SexoNormalizado | null {
  const s = String(sexo ?? "").trim().toLowerCase();
  if (!s) return null;
  if (s === "masculino" || s === "homem") return "masculino";
  if (s === "feminino" || s === "mulher") return "feminino";
  // LETRA SOLTA É RECUSADA — e não por preciosismo.
  //
  // O EAP gravava `"m"` para MULHER (`sexo === "h" ? 50 : 45,5`); o motor de VM
  // lia `/^m/i` como MASCULINO. A mesma letra, sexos opostos, no mesmo app. E o
  // valor CRUZA os módulos: `handleSetValue` guarda `sexo` no contexto do
  // paciente e o próximo módulo pré-preenche o campo com ele — então uma
  // mulher registrada no EAP virava homem na Ventilação, com Vt 27 mL maior
  // em SARA.
  //
  // Aceitar "m" seria escolher um dos dois significados e errar o outro em
  // silêncio. Recusar faz o app perguntar de novo, uma vez, e acertar.
  return null;
}

/**
 * Peso predito (PBW) — ARDSNet, NEJM 2000;342:1301-8.
 *
 *   homem  50   + 0,91 × (altura_cm − 152,4)
 *   mulher 45,5 + 0,91 × (altura_cm − 152,4)
 *
 * Devolve `null` quando o sexo não é determinável ou a altura é implausível.
 * ESTA É A ÚNICA implementação do app — `npm run test:vm` recusa o build se
 * aparecer uma segunda.
 */
export function predictedBodyWeight(
  alturaCm: number,
  sexo: string | undefined | null
): number | null {
  const s = normalizarSexo(sexo);
  if (!s) return null;
  if (!Number.isFinite(alturaCm) || alturaCm < 120 || alturaCm > 230) return null;
  const base = s === "feminino" ? 45.5 : 50;
  return base + 0.91 * (alturaCm - 152.4);
}

function deriveVent(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const altura = toNumber(values.altura);
  const pbwCalc = altura != null ? predictedBodyWeight(altura, values.sexo) : null;
  if (pbwCalc != null) {
    const pbw = Math.max(pbwCalc, 0);
    out.pbw = round0(pbw);
    out.vc6 = round0(6 * pbw); // alvo 6 mL/kg
    out.vc4 = round0(4 * pbw); // mínimo protetor
    out.vc8 = round0(8 * pbw); // máximo inicial
  } else {
    out.pbw = "calc. pela altura";
    out.vc6 = "6 mL/kg PBW";
    out.vc4 = "4 mL/kg PBW";
    out.vc8 = "8 mL/kg PBW";
  }
  return out;
}

export const ventilationDecisionTree: DecisionTreeDefinition = {
  id: "vm_adulto_2024",
  version: "2024.2",
  label: "Ventilação Mecânica",
  entryNodeId: "entry",
  derive: deriveVent,
  nodes: {
    // ── 1. Indicação, modo e sedação ───────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Ventilação mecânica — objetivo, modo e sedação",
      summary: "Definir objetivo (oxigenação × ventilação), modo inicial e a sedação (analgesia primeiro).",
      actions: [
        "Indicação/objetivo: oferecer suporte invasivo quando houver falha de oxigenação ou ventilação apesar do suporte adequado, incapacidade de proteger a via aérea, trabalho respiratório/fadiga incompatíveis com ventilação sustentável ou deterioração previsível que torne a intubação posterior mais arriscada. P/F, pH, PaCO₂, frequência respiratória e GCS medem gravidade, mas nenhum corte isolado é requisito universal para iniciar ventilação invasiva.",
        "Modo inicial: VCV (garante VC, monitora Pplat/complacência) ou PCV (limita pressão) assistido-controlado. PSV para desmame.",
        "SEDAÇÃO — analgesia primeiro (analgosedação):",
        "MODOS ALÉM DO BÁSICO, e o que cada um resolve: PRVC / VC+ entrega o volume-alvo com limite de pressão — útil quando se quer proteção com adaptação automática; PC-AC controla a pressão e o Vt varia com a complacência, então o Vt tem de ser VIGIADO, não presumido; SIMV NÃO é primeira escolha na instabilidade aguda (o desmame por redução de FR mandatória é mais lento e a assincronia é maior); CPAP não tem I:E nem FR mandatória — é PEEP e FiO₂, para quem ventila sozinho.",
        FENTANIL_ANALGOSEDACAO,
        "Sedativo titulável só se necessário — propofol 5–50 mcg/kg/min ou dexmedetomidina 0,2–1,5 mcg/kg/h (preferir a midazolam: menos delirium). Alvo RASS −2 a 0 (sedação LEVE é o padrão — PADIS 2018); mais profundo só por indicação declarada.",
        "Monitorização: capnografia waveform, oximetria, curvas do ventilador. Cabeceira 30–45°.",
        "Gasometria arterial quando clinicamente indicada após estabilização ou mudanças ventilatórias relevantes; capnografia, oximetria e curvas orientam reavaliação contínua. Não impor um intervalo universal fixo.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados para o peso predito",
      intro: "Toque nos valores. A ALTURA (não o peso real) define o volume corrente protetor.",
      fields: [
        {
          id: "altura",
          label: "Altura",
          unit: "cm",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["150", "160", "165", "170", "175", "180", "190"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "sexo",
          label: "Sexo",
          presets: [
            { value: "masculino", label: "Masculino" },
            { value: "feminino", label: "Feminino" },
          ],
        },
      ],
      next: "ajuste_inicial",
    },

    // ── 2. Ajuste inicial protetor ─────────────────────────────────────────────
    ajuste_inicial: {
      id: "ajuste_inicial",
      type: "action",
      title: "Ajuste inicial protetor",
      summary: "Volume baixo guiado pelo peso predito desde o início. Peso predito ≈ {pbw} kg.",
      actions: [
        "Volume corrente: alvo {vc6} mL (6 mL/kg PBW; faixa {vc4}–{vc8} mL = 4–8 mL/kg). NUNCA usar o peso atual, sobretudo em obesos.",
        "Frequência respiratória e ventilação-minuto devem ser ajustadas à fisiologia e ao distúrbio ácido-base. Em adulto sem grande alteração metabólica/obstrutiva, 12–16/min pode ser um ponto de partida, mas NÃO forçar PaCO₂ 35–45 ou pH normal antes de considerar o cenário; TCE, obstrução e acidose metabólica têm alvos próprios nos ramos abaixo. Vigiar auto-PEEP e ajustar I:E/fluxo ao tempo expiratório necessário.",
        "PEEP e FiO₂ não têm um único par correto para todos. Em pulmão sem hipoxemia importante, PEEP 5 cmH₂O é um ponto de partida comum; SARA/obesidade podem exigir PEEP maior e obstrução pode exigir outra estratégia. Após a intubação, usar FiO₂ suficiente para segurança imediata e titular para a menor FiO₂ que alcance o alvo de oxigenação apropriado ao cenário, evitando hiperóxia.",
        "Trigger sensível (pressão −1 a −2 cmH₂O ou fluxo 1–3 L/min) sem autociclagem.",
        "Segurança mecânica: medir pressão de platô e driving pressure. Na SARA, limitar Pplat a ≤ 30 cmH₂O tem recomendação forte. Driving pressure é marcador prognóstico útil e deve ser minimizada junto com Vt/PEEP, mas ≤ 15 cmH₂O não deve aparecer como corte universal com o mesmo nível de evidência.",
        "QUANDO REMEDIR: a Pplat não é medida uma vez. Reavaliar após mudanças relevantes de Vt, PEEP, mecânica pulmonar, posição ou condição clínica e com frequência proporcional à instabilidade; não usar um relógio universal de 4–8 h para todos.",
        // ALARMES — o passo que faltava no ajuste inicial (V5).
        //
        // A árvore montava o ventilador inteiro e nunca mandava configurar
        // alarme. É aqui que entra, não num nó próprio: alarme é parte do
        // ajuste inicial, e separá-lo criaria um passo que se pula.
        ALARMES_PRINCIPIO,
        ALARMES_PRESSAO,
        ALARMES_VOLUME,
        ALARMES_APNEIA,
        ALARMES_CONDUTA,
      ],
      next: "patologia",
    },

    // ── 3. Estratégia por patologia ────────────────────────────────────────────
    patologia: {
      id: "patologia",
      type: "decision",
      title: "Estratégia ventilatória por patologia",
      question: "Qual o cenário dominante? (os parâmetros mudam de forma importante)",
      evidence: [
        "Cada patologia tem alvos próprios de VC, FR, PEEP, I:E e gasometria — escolher orienta os ajustes.",
        "SARA → ventilação protetora rigorosa; obstrutivo (asma/DPOC) → expiração longa e PEEP baixo (auto-PEEP); TCE → normoventilação; choque séptico → liberação precoce; ICC/EAP → PEEP mais alto; obeso → PEEP mais alto + ramped.",
      ],
      options: [
        { id: "sara", label: "SARA / ARDS", next: "pat_sara" },
        { id: "obstrutivo", label: "Asma / DPOC (obstrutivo)", next: "pat_obstrutivo" },
        { id: "tce", label: "TCE grave / HIC", next: "pat_tce" },
        { id: "choque", label: "Choque séptico", next: "pat_choque" },
        { id: "icc", label: "ICC / EAP cardiogênico", next: "pat_icc" },
        { id: "obeso", label: "Obeso (IMC ≥ 35)", next: "pat_obeso" },
        { id: "acidose", label: "Acidose metabólica grave (CAD, sepse, IRA)", next: "pat_acidose" },
        { id: "neuromuscular", label: "Fraqueza neuromuscular (miastenia, Guillain-Barré)", next: "pat_neuromuscular" },
        { id: "normal", label: "Pulmão normal / outro", next: "pat_normal" },
      ],
    },

    pat_sara: {
      id: "pat_sara",
      type: "action",
      title: "SARA — ventilação protetora e terapias adjuvantes",
      summary: "Global Definition 2024 amplia Berlim: P/F ≤ 300 ou S/F ≤ 315 quando SpO₂ ≤ 97%, incluindo HFNO ≥ 30 L/min. VC {vc4}–{vc6} mL por PBW.",
      actions: [
        // ── V1 · SDRA CONFIRMADA × HIPOXEMIA EM INVESTIGAÇÃO ──────────────
        //
        // O engine morto tinha um CENÁRIO próprio para "hipoxêmico sem SDRA
        // confirmado". Ele NÃO virou opção irmã de `sara` no nó `patologia`,
        // por assimetria de dano: a SDRA é SUBdiagnosticada, e oferecer um
        // ramo mais brando exatamente no ponto de maior dúvida diagnóstica
        // daria menos rigor a quem mais precisa. Quem tem SDRA e cai no ramo
        // brando recebe PEEP menor; o erro oposto custa PEEP a mais e sedação.
        //
        // O conteúdo entra AQUI, dentro do ramo da SDRA, como distinção
        // interna — o paciente duvidoso recebe o cuidado maior por padrão, e
        // lê a razão.
        "ESTE RAMO ATENDE OS DOIS: a SDRA confirmada por Berlim E a hipoxemia difusa ainda em investigação (pneumonia grave, sepse pulmonar). Se você chegou aqui sem os critérios fechados, siga assim mesmo — e reavalie Berlim a cada gasometria e imagem. Pneumonia grave com hipoxemia difusa é, com frequência, SDRA em evolução, e o custo de esperar o critério fechar é ventilar sem proteção enquanto isso.",
        "O QUE VALE PARA OS DOIS: o VOLUME CORRENTE protetor. Vt 4–6 mL/kg PBW não é tratamento da SDRA — é a forma de ventilar quem tem lesão pulmonar aguda de qualquer grau, e não há motivo para esperar o diagnóstico para deixar de causar volutrauma.",
        "O QUE PODE DIFERIR: a titulação da PEEP. Enquanto Berlim NÃO fecha, a PEEP pode ser menos agressiva — PEEP alta em lesão pulmonar aguda SEM SDRA não mostrou benefício (AMIB/SBPT 2025), e PEEP sem lastro tem custo hemodinâmico real. Fechados os critérios, subir para a faixa da gravidade abaixo.",
        "VC 4–6 mL/kg PBW ({vc4}–{vc6} mL): iniciar em 6, reduzir 1 mL/kg se Pplat > 30 (até 4).",
        "Pplat ≤ 30 cmH₂O. Monitorar driving pressure (Pplat − PEEP) como marcador de estresse mecânico e titular para o menor valor compatível com ventilação/oxigenação seguras; não tratá-la como corte universal isolado.",
        "NOVA DEFINIÇÃO GLOBAL de SDRA (2024) — amplia Berlim: inclui SDRA NÃO INTUBADA em cateter nasal de alto fluxo ≥ 30 L/min ou VNI/CPAP ≥ 5 cmH₂O; aceita SpO₂/FiO₂ ≤ 315 (quando SpO₂ ≤ 97%) como alternativa ao P/F ≤ 300; aceita ULTRASSOM como imagem; em locais com poucos recursos não exige PEEP nem dispositivo específico.",
        "SEM GASOMETRIA? A relação SpO₂/FiO₂ substitui a PaO₂/FiO₂, e os DOIS pontos de corte saem da MESMA reta (Rice 2007: S/F = 64 + 0,84 × P/F) — mas respondem a perguntas diferentes, e usar um pelo outro troca diagnóstico por gravidade: S/F ≤ 315 equivale a P/F ≤ 300 e responde «É SDRA?» (sensibilidade 91%, mas especificidade de apenas 56% — superestima); S/F ≤ 235 equivale a P/F ≤ 200 e responde «É SDRA MODERADA ou pior?» (85% / 85%, mais equilibrado). Válido só com SpO₂ ≤ 97%, fora do platô da curva.",
        "PEEP: iniciar por estratégia PEEP/FiO₂ validada (tabela ARDSNet no próximo passo) e individualizar por oxigenação, recrutabilidade, mecânica e hemodinâmica. Em SARA moderada-grave, considerar PEEP mais alta sem manobras de recrutamento de alta pressão; evitar recrutamento agressivo/prolongado.",
        "FiO₂ mínima para SpO₂ 88–95% / PaO₂ 55–80. FR 12–35 (pH ≥ 7,20 — hipercapnia permissiva, PaCO₂ até 55–60).",
        HIPERCAPNIA_EXCECAO_NA_SDRA,
        HIPERCAPNIA_PERMISSIVA_ONDE_NAO_APLICAR,
        "SARA moderada-grave com P/F < 150 apesar de ventilação protetora: posição PRONA por sessão prolongada (≥ 12–16 h/dia; PROSEVA usou ~16 h). Bloqueador neuromuscular NÃO é rotina: considerar em pacientes selecionados, especialmente assincronia/drive excessivo que impeçam ventilação protetora. Em SARA grave refratária, considerar avaliação precoce para ECMO-VV em centro experiente conforme critérios e reversibilidade.",
      ],
      next: "tabela_peep",
    },

    /**
     * A tabela existia como INSTRUÇÃO e não como conteúdo: quatro pontos do app
     * mandavam "titular pela tabela PEEP/FiO₂ ARDSNet" e ela não estava em
     * lugar nenhum. Quem procurasse não acharia — e concluiria que o problema
     * era dele.
     *
     * Ela entra como REFERÊNCIA, com os valores do app ao lado. O app não passa
     * a recomendar a tabela: mostra os dois e declara a escolha. Ver o
     * comentário em lib/tabela-peep.ts.
     */
    tabela_peep: {
      id: "tabela_peep",
      type: "action",
      title: "Tabela PEEP/FiO₂ (ARDSNet) — referência para titulação",
      summary: "A tabela low-PEEP/high-FiO₂ do ARDSNet é um ponto de partida validado; a PEEP deve ser individualizada pela resposta de oxigenação, mecânica e hemodinâmica.",
      actions: [
        ...TABELA_LOW_PEEP.map((l) => `FiO₂ ${l.fio2} → PEEP ${l.peep} cmH₂O`),
        `⚠️ ${TABELA_PEEP_RESSALVA}`,
        `Fonte: ${TABELA_PEEP_FONTE}`,
        "Em SARA moderada-grave, diretrizes contemporâneas permitem estratégia de PEEP mais alta, mas não definem uma única tabela superior para todos. Individualizar e evitar manobras de recrutamento de alta pressão/prolongadas.",
      ],
      next: "seguranca",
    },

    pat_obstrutivo: {
      id: "pat_obstrutivo",
      type: "action",
      title: "Asma / DPOC — evitar auto-PEEP (expiração longa)",
      summary: "Prioridade: minimizar hiperinsuflação dinâmica, garantir expiração completa e titular PEEP/ventilação pela mecânica, não pela normalização da PaCO₂.",
      actions: [
        "VC 6–8 mL/kg PBW ({vc6}–{vc8} mL). Iniciar com FR baixa/moderada (por exemplo, ~10–12/min em obstrução grave) e titular pela expiração completa, auto-PEEP, pH e ventilação-minuto; não perseguir PaCO₂ normal às custas de hiperinsuflação.",
        "Encurtar o tempo inspiratório e prolongar a expiração: I:E frequentemente 1:3–1:4 e fluxo inspiratório alto (~60–100 L/min) são pontos de partida, ajustados pelas curvas e pelo retorno do fluxo expiratório a zero antes do próximo ciclo.",
        "PEEP externa: não aplicar uma fórmula universal. Em paciente passivo/controlado com hiperinsuflação, priorizar tempo expiratório e PEEP baixa conforme mecânica. Em DPOC com esforço espontâneo, auto-PEEP e dificuldade de disparo, PEEP externa pode reduzir trabalho/trigger; titular abaixo da PEEPi medida (frequentemente ~50–80%, cerca de 70% como referência) observando PEEP total, volume expirado, hemodinâmica e hiperinsuflação.",
        "Hipercapnia permissiva: aceitar elevação da PaCO₂ quando necessária para evitar hiperinsuflação; não existe PaCO₂-alvo universal. Guiar tolerância por pH, hemodinâmica e contraindicações à hipercapnia. Na exacerbação de DPOC com risco de retenção de CO₂, titular oxigênio de forma controlada (alvo usual SpO₂ 88–92% enquanto se avaliam gasometria e resposta), individualizando se houver indicação diversa.",
        // O módulo citava auto-PEEP sete vezes e NUNCA dizia como medir nem o
        // que fazer quando ele descompensa. Citar um achado sem o gesto que o
        // encontra é ensinar a palavra, não a conduta.
        "COMO MEDIR o auto-PEEP: pausa expiratória ao fim da expiração, com o paciente SEM esforço (sedado, ou em modo controlado), segurando até o traçado de pressão estabilizar. O valor que aparecer ACIMA do PEEP ajustado é o auto-PEEP. Em respiração espontânea a medida não é confiável — nesse caso, guie-se pela curva de fluxo expiratório que não retorna ao zero antes da próxima inspiração.",
        "⚠️ HIPERINSUFLAÇÃO DINÂMICA COM INSTABILIDADE (hipotensão súbita/AESP, fluxo expiratório sem retornar a zero): desconectar brevemente do ventilador para permitir expiração e corrigir FR, tempo expiratório, fluxo e Vt. Em asma grave/peri-parada, compressão manual do tórax pode ser considerada por equipe experiente para ajudar a aliviar hiperinsuflação. Não assumir auto-PEEP se a instabilidade persistir: excluir pneumotórax hipertensivo e outras causas imediatamente.",
        "Adjuvantes: manter broncodilatador inalatório no circuito. Na exacerbação asmática grave que não responde ao tratamento inicial, MgSO₄ IV 2 g em infusão única pode ser considerado; não é terapia rotineira para todos. Ketamina pode ser escolhida como agente de sedação/peri-intubação por perfil hemodinâmico e potencial broncodilatador, mas não deve ser apresentada como broncodilatador específico de eficácia comprovada. Em DPOC de alto risco, considerar suporte não invasivo pós-extubação conforme o contexto clínico.",
      ],
      next: "seguranca",
    },

    pat_tce: {
      id: "pat_tce",
      type: "action",
      title: "TCE grave / HIC — normoventilação",
      summary: "Evitar hiper e hipocapnia. Proteger a perfusão cerebral.",
      actions: [
        "VC 6–8 mL/kg PBW ({vc6}–{vc8} mL); FR 14–18; I:E 1:2.",
        `Alvos: SpO₂ ${ALVOS_TCE.spo2}, PaCO₂ ${ALVOS_TCE.paco2} (NORMOventilação), PPC ${ALVOS_TCE.ppc}, PIC ${ALVOS_TCE.pic}.`,
        TCE_HIPERVENTILACAO,
        TCE_HIPERVENTILACAO_PROIBIDA,
        `Cabeceira 30°; PEEP ${ALVOS_TCE.peep} — ${ALVOS_TCE.peepTeto}`,
        "PEEP alta pode elevar a PIC por queda do retorno venoso — mas HIPÓXIA É PIOR QUE PEEP: não se aceita SpO₂ baixa para poupar PIC.",
        "Evitar hipoxemia e hipotensão (lesão cerebral secundária).",
      ],
      next: "seguranca",
    },

    pat_choque: {
      id: "pat_choque",
      type: "action",
      title: "Choque séptico com VM",
      summary: "Ventilar de forma protetora sem criar metas gasométricas artificiais; hemodinâmica e evolução para SARA definem os ajustes.",
      actions: [
        "Sem SARA: VC 6–8 mL/kg PBW ({vc6}–{vc8} mL) é faixa protetora razoável; se houver SARA, usar a estratégia específica com alvo ~6 mL/kg e Pplat ≤ 30. FR, I:E e PEEP devem ser titulados à ventilação, oxigenação, mecânica e hemodinâmica, sem uma PEEP fixa para todo choque séptico.",
        "Oxigenação: titular FiO₂ conforme contexto; na insuficiência respiratória hipoxêmica associada à sepse, metas práticas costumam ficar aproximadamente entre SpO₂ 90–96%, individualizadas. Não usar PaCO₂ 35–45 nem lactato como alvos ventilatórios universais; interpretar PaCO₂ pelo distúrbio ácido-base e lactato pela perfusão/causa clínica.",
        "Usar a menor sedação compatível com conforto, segurança e sincronia; avaliar prontidão para liberação da VM de forma padronizada pelo menos diariamente quando a causa e a hemodinâmica permitirem.",
        "Se evoluir para SARA (P/F ≤ 300) → migrar para a estratégia protetora de SARA.",
      ],
      next: "seguranca",
    },

    pat_icc: {
      id: "pat_icc",
      type: "action",
      title: "ICC / EAP cardiogênico — pressão positiva titulada à hemodinâmica",
      summary: "Pressão positiva pode melhorar congestão/oxigenação e reduzir pós-carga do VE, mas deve ser titulada à resposta respiratória e hemodinâmica.",
      actions: [
        "Se intubado, manter ventilação protetora com VC 6–8 mL/kg PBW ({vc6}–{vc8} mL) e ajustar FR/I:E pela ventilação e mecânica, sem buscar normocapnia automática.",
        "PEEP/pressão positiva: titular para aliviar trabalho respiratório e melhorar oxigenação/congestão, observando pressão arterial, débito e função do VD. Não usar 8–12 cmH₂O como faixa obrigatória; em choque cardiogênico ou falência de VD, aumentos de pressão intratorácica podem piorar a hemodinâmica.",
        "Oxigênio deve tratar hipoxemia, evitando hiperóxia; ajustar FiO₂ à SpO₂ e ao contexto. PaCO₂ pode refletir fadiga/gravidade, mas 35–45 mmHg não é alvo ventilatório universal no EAP.",
        "Quando não há indicação imediata de intubação e o paciente coopera, CPAP/BiPAP deve ser considerada precocemente no EAP cardiogênico com desconforto respiratório; se houver falha, exaustão, rebaixamento, choque ou incapacidade de proteger via aérea, não atrasar IOT.",
        "E A REGRA VALE ALÉM DO EAP: na exacerbação de DPOC com acidose respiratória, a VNI de primeira linha reduz intubação e mortalidade — nos ensaios agrupados de UTI, intubação de 63% para 21% e mortalidade de 25% para 9%. ⚠️ O GANHO DEPENDE DO CENÁRIO: em enfermaria o efeito é bem menor que em UTI, e a melhor indicação é a acidose respiratória MODERADA a grave. Acidose muito grave ou rebaixamento por hipercapnia têm alto risco de falha — a VNI ali só com IOT pronta.",
      ],
      next: "seguranca",
    },

    pat_obeso: {
      id: "pat_obeso",
      type: "action",
      title: "Obesidade — peso predito + PEEP individualizada",
      summary: "VC pelo peso PREDITO (nunca o atual); PEEP e pressões devem considerar parede torácica, fechamento de via aérea e hemodinâmica.",
      actions: [
        "VC 6–8 mL/kg do peso PREDITO ({vc6}–{vc8} mL) — jamais pelo peso atual. Ajustar FR pela ventilação e pela mecânica, sem perseguir normocapnia automaticamente.",
        "PEEP: pacientes com obesidade frequentemente necessitam níveis maiores para contrariar fechamento de via aérea/atelectasia, mas não usar 8–12 cmH₂O como faixa obrigatória. Titular à oxigenação, complacência, hemodinâmica e, quando disponível, pressão transpulmonar/EIT.",
        "Posição elevada/ramped ajuda mecânica e oxigenação. Manobras de recrutamento não são rotina; considerar apenas de forma seletiva, monitorizada e evitando pressões altas/prolongadas.",
        "Oxigênio e ventilação devem ser titulados ao contexto: evitar hiperóxia e reconhecer hipercapnia crônica/síndrome de hipoventilação da obesidade quando presentes. No alto risco de falha pós-extubação, considerar suporte não invasivo profilático conforme o perfil clínico.",
      ],
      next: "seguranca",
    },

    /**
     * ACIDOSE METABÓLICA GRAVE — o cenário em que a FR é a droga.
     *
     * Não é variação de parâmetro, é fisiologia oposta às outras seis: o
     * paciente chega compensando com ventilação-minuto enorme (Kussmaul), e
     * ajustar a FR "normal" de 12–16 derruba a única coisa que segurava o pH.
     * Nenhum dos cenários anteriores manda casar a FR com a ventilação-minuto
     * prévia — o `pat_choque` chega mais perto (16–20) e ainda é metade do
     * que uma CAD grave precisa.
     */
    pat_acidose: {
      id: "pat_acidose",
      type: "action",
      title: "Acidose metabólica grave — preservar a compensação ventilatória",
      summary: "A intubação pode remover abruptamente uma compensação respiratória crítica; minimizar apneia e restaurar ventilação-minuto suficiente imediatamente após o tubo.",
      actions: [
        "⚠️ O RISCO ESPECÍFICO AQUI é perder a compensação respiratória. Na acidose metabólica grave, o paciente pode depender de ventilação-minuto muito elevada; após a intubação, uma queda abrupta dessa ventilação pode elevar rapidamente a PaCO₂, piorar a acidemia e precipitar colapso hemodinâmico.",
        "PaCO₂: não buscar 35–45 mmHg por rotina. Usar a PaCO₂/ventilação pré-intubação quando disponível como referência fisiológica; a fórmula de Winter [PaCO₂ esperada ≈ 1,5 × HCO₃ + 8 (±2)] estima a compensação esperada e ajuda a reconhecer distúrbio respiratório associado, mas não substitui o estado real do paciente.",
        "VENTILAÇÃO-MINUTO: restaurar prontamente ventilação compatível com a compensação prévia/necessária, titulando pela PaCO₂, pH, curva de fluxo e mecânica. Não aplicar uma fórmula universal em mL/kg/min para todos os pacientes acidóticos.",
        "COMO ENTREGAR ISSO SEM ABANDONAR PROTEÇÃO: manter Vt 6–8 mL/kg PBW ({vc6}–{vc8} mL) e obter ventilação-minuto principalmente pela FR/fluxo, reavaliando Pplat, auto-PEEP e tendência da driving pressure; não usar 15 cmH₂O como corte universal isolado.",
        "O LIMITE DA FR É OBSERVÁVEL, NÃO UM NÚMERO: subir a FR até casar a ventilação-minuto prévia, e o limite é o AUTO-PEEP aparecendo — medido por pausa expiratória, a mesma manobra do ramo obstrutivo. FR alta encurta a expiração; quando o ar não sai por completo, parou de compensar e começou a aprisionar.",
        "Se a ventilação necessária não puder ser entregue sem auto-PEEP, pressões excessivas ou instabilidade, tratar agressivamente a causa da acidose e discutir terapias específicas (por exemplo, bicarbonato ou terapia renal substitutiva) apenas quando houver indicação pela etiologia, gravidade e contexto — não como resposta automática a um número de pH.",
        "REAVALIAR PRECOCEMENTE após estabilizar a ventilação: gasometria e mecânica devem ser repetidas conforme a gravidade e a velocidade de mudança. Ajustar pela tendência de pH/PaCO₂ e pela compensação fisiológica esperada, sem impor intervalo fixo de 20–30 min ou alvo universal de pH.",
        "PERI-INTUBAÇÃO: minimizar o tempo sem ventilação; quando viável e seguro, preservar ventilação espontânea durante preparação/pré-oxigenação e iniciar ventilação mecânica imediatamente após confirmar o tubo. Planejar antecipadamente suporte hemodinâmico e primeira tentativa bem-sucedida.",
        // O veto que a estrutura do módulo tornava necessário (R-40).
        HIPERCAPNIA_VETO_ANTES_DE_PERMITIR,
        HIPERCAPNIA_PERMISSIVA_ONDE_NAO_APLICAR,
      ],
      next: "seguranca",
    },

    /**
     * FRAQUEZA NEUROMUSCULAR — falência de BOMBA, pulmão íntegro.
     *
     * O ganho aqui é de VIGILÂNCIA, não de correção: cair em `pat_normal` não
     * produz parâmetro errado, produz cegueira para o que acontece depois.
     * Em GBS ventilado, atelectasia em 49%, lesão pulmonar aguda em 13% e PAV
     * em 56% — a deterioração pulmonar não é exceção, é o curso esperado.
     */
    pat_neuromuscular: {
      id: "pat_neuromuscular",
      type: "action",
      title: "Fraqueza neuromuscular — falência de bomba, pulmão normal",
      summary: "A mecânica pulmonar é normal se não houver aspiração ou infecção. O problema é o músculo, e a vigilância é o que muda o desfecho.",
      actions: [
        "A MECÂNICA PULMONAR É NORMAL — o que falhou foi a BOMBA (músculo respiratório), não o parênquima. Isso inverte o risco: o perigo aqui não é volutrauma, é ATELECTASIA.",
        "Mesmo com parênquima inicialmente preservado, usar Vt protetor 6–8 mL/kg PBW ({vc6}–{vc8} mL) e acompanhar Pplat/drive de forma contextual. Não aumentar Vt para compensar fraqueza muscular.",
        "PEEP e FiO₂ devem ser tituladas à oxigenação e à mecânica; não há necessidade de PEEP alta ou manobras de recrutamento de rotina apenas por fraqueza neuromuscular. Piora desproporcional da oxigenação exige procurar atelectasia, aspiração, pneumonia ou outra doença pulmonar associada.",
        "⚠️ O DESCOLAMENTO É O SINAL QUE IMPORTA: se a oxigenação piorar MAIS do que a fraqueza explica, há causa pulmonar sobreposta — aspiração, pneumonia, atelectasia lobar. Fraqueza não causa hipoxemia grave por si; hipoxemia grave aqui é outra doença.",
        "Complicações respiratórias e ventilação prolongada são frequentes em fraqueza neuromuscular grave; evitar percentuais fixos de uma coorte como previsão individual e acompanhar trajetória clínica, secreções, tosse e infecção.",
        "DEPURAÇÃO DE SECREÇÕES é parte central do tratamento: avaliar força da tosse e carga de secreção; usar aspiração, fisioterapia/posicionamento e técnicas de assistência à tosse quando indicadas e disponíveis.",
        "Liberação/extubação deve integrar trajetória da doença, força inspiratória, função bulbar, tosse/secreções, troca gasosa e tolerância ao teste espontâneo; pressão inspiratória máxima ou capacidade vital isoladas não devem decidir sozinhas.",
      ],
      next: "seguranca",
    },

    pat_normal: {
      id: "pat_normal",
      type: "action",
      title: "Pulmão normal / outro — manter protetor",
      summary: "Mesmo sem doença pulmonar, ventilar de forma protetora.",
      actions: [
        "Pulmão sem lesão específica: iniciar com VC protetor 6–8 mL/kg PBW ({vc6}–{vc8} mL) e parâmetros convencionais de FR/I:E/PEEP, titulando ventilação, oxigenação, mecânica e hemodinâmica em vez de manter números fixos por rotina.",
        "Usar a menor FiO₂ que mantenha oxigenação adequada ao contexto clínico, evitando tanto hipoxemia quanto hiperóxia; não impor SpO₂ 94–98% como faixa universal para todo paciente ventilado.",
        "Monitorar Pplat e driving pressure como parte da proteção pulmonar; Pplat ≤ 30 cmH₂O é referência importante quando aplicável, enquanto driving pressure deve ser interpretada pela tendência e pelo cenário, sem corte universal isolado.",
        "Pós-operatório cardíaco: favorecer estratégia de fast-track/extubação precoce em pacientes selecionados e clinicamente prontos; o marco de 6 h é usado em protocolos/estudos, mas não deve obrigar extubação antes de critérios de segurança. Monitorar função do VD e hemodinâmica.",
      ],
      next: "seguranca",
    },

    // ── 4. Checagem de segurança ───────────────────────────────────────────────
    seguranca: {
      id: "seguranca",
      type: "decision",
      title: "Pressões dentro do alvo?",
      question: "A pressão de platô está dentro do alvo do cenário e a mecânica está estável ou melhorando?",
      evidence: [
        "Pressão de platô (pausa inspiratória de 0,5 s, sem esforço) reflete a pressão alveolar — manter ≤ 30 cmH₂O.",
        "Driving pressure = platô − PEEP. Monitorar tendência e reduzir estresse mecânico quando possível; valores menores costumam associar-se a melhor prognóstico, mas 15 cmH₂O não deve funcionar como corte universal isolado para todos os cenários.",
      ],
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "seguranca_guiada" },
        { id: "sim", label: "Sim — mecânica aceitável", next: "monitorizacao" },
        { id: "nao", label: "Não — Pplat alta ou mecânica piorando", next: "pressao_alta" },
      ],
    },

    seguranca_guiada: {
      id: "seguranca_guiada",
      type: "action",
      title: "Meça antes de decidir",
      summary: "A segurança mecânica depende da pressão de platô medida corretamente e da tendência da mecânica — não de impressão visual do ventilador.",
      actions: [
        "Meça a pressão de platô com pausa inspiratória, sem esforço ativo do paciente; confirme também PEEP e volume corrente entregues.",
        "Use Pplat ≤ 30 cmH₂O como referência importante quando aplicável ao cenário e compare com a tendência prévia; driving pressure deve ser interpretada no contexto, sem transformar 15 cmH₂O em corte universal isolado.",
        "Se a Pplat está acima do alvo do cenário OU a mecânica está piorando, responda NÃO e abra o troubleshooting de pressão alta. Se está dentro do alvo e estável/melhorando, responda SIM.",
        "Se a medida não é confiável por esforço/dissincronia, corrija a condição de medição antes de classificar.",
      ],
      next: "seguranca",
    },

    pressao_alta: {
      id: "pressao_alta",
      type: "action",
      title: "Pressão de platô / driving pressure altas — reduzir",
      summary: "Proteger o pulmão: menos volume, diferenciar complacência × resistência.",
      actions: [
        // R-40: este nó é TRANSVERSAL — os 7 cenários chegam aqui via
        // `seguranca`. O veto vem ANTES da permissão porque quem chega a um nó
        // de pressão alta lê a primeira linha e age.
        HIPERCAPNIA_VETO_ANTES_DE_PERMITIR,
        HIPERCAPNIA_PERMISSIVA_ONDE_NAO_APLICAR,
        "Fora desses casos: reduzir o VC 1 mL/kg em direção a 4 mL/kg PBW ({vc4} mL), aceitando hipercapnia permissiva (pH ≥ 7,20).",
        "Diferenciar: Pplat alta = complacência (recrutamento/PEEP, derrame, distensão, edema); pico alto com platô normal = resistência (broncoespasmo, secreção, tubo dobrado/mordido).",
        "COMPONENTE RESISTIVO: pressão resistiva = Ppico − Pplatô. Aumento relevante em relação ao basal sugere maior resistência (secreção, broncoespasmo, tubo dobrado/mordido ou obstrução). Resistência das vias aéreas = (Ppico − Pplatô) / fluxo, em cmH₂O/L/s; interpretar com o fluxo usado e a tendência, sem transformar um único número em diagnóstico.",
        "Tratar a causa: broncodilatador, aspirar, drenar derrame/pneumotórax, ajustar PEEP.",
        "Reavaliar Pplat e driving pressure após cada ajuste.",
      ],
      next: "monitorizacao",
    },

    // ── 5. Monitorização / troubleshooting ─────────────────────────────────────
    monitorizacao: {
      id: "monitorizacao",
      type: "decision",
      title: "Reavaliação e problemas",
      question: "Há deterioração aguda, hipoxemia ou assincronia?",
      evidence: [
        "Deterioração aguda → DOPES: Deslocamento do tubo, Obstrução, Pneumotórax, Equipamento, empilhamento (Stacking/auto-PEEP).",
        "Assincronia comum: trigger delay, esforço ineficaz (missed trigger), duplo disparo, auto-PEEP, fome de fluxo, ciclagem tardia, autociclagem.",
      ],
      options: [
        { id: "problema", label: "Sim — investigar (DOPES / assincronia)", next: "troubleshooting" },
        { id: "estavel", label: "Não — estável, avaliar desmame", next: "desmame_check" },
      ],
    },

    troubleshooting: {
      id: "troubleshooting",
      type: "action",
      title: "Troubleshooting — DOPES + assincronia",
      summary: "Deterioração: desconectar e ventilar à mão separa problema do paciente × do circuito.",
      actions: [
        "Deterioração ameaçadora: priorizar oxigenação/ventilação e percorrer DOPES. Se necessário, desconectar do ventilador e ventilar manualmente com BVM em O₂ 100% enquanto avalia D: deslocamento/seletivo do tubo; O: obstrução/secreção/dobra; P: pneumotórax hipertensivo; E: equipamento/circuito; S: stacking/auto-PEEP. Pneumotórax hipertensivo com instabilidade é diagnóstico clínico (POCUS ajuda sem atrasar): descomprimir imediatamente. Em parada/hipotensão grave e equipe habilitada, toracostomia aberta/finger é opção efetiva; descompressão por agulha deve usar cateter adequado e sítio conforme protocolo/anatomia (4º–5º EIC linha axilar anterior ou 2º EIC linha médio-clavicular), seguida de drenagem definitiva.",
        "Assincronia — esforço ineficaz/auto-PEEP: reduzir sedação, reduzir auto-PEEP (↓FR, ↑fluxo), ajustar PEEP externo.",
        "Assincronia — duplo disparo/fome de fluxo: aumentar Ti/fluxo, mudar para PCV; se drive muito forte na SARA grave, considerar BNM.",
        "Assincronia — ciclagem tardia (DPOC): reduzir Ti ou critério de ciclagem em PSV (↓% do pico de fluxo).",
        "Hipoxemia refratária: confirmar tubo/circuito e causas reversíveis; otimizar FiO₂ e PEEP conforme estratégia do cenário. Na SARA, pronar quando critérios forem preenchidos; bloqueio neuromuscular apenas em selecionados quando assincronia/drive impedir ventilação protetora. Manobras de recrutamento de alta pressão não são rotina e as prolongadas devem ser evitadas.",
      ],
      next: "desmame_check",
    },

    // ── 6. Desmame e extubação (loop de reavaliação diária) ────────────────────
    desmame_check: {
      id: "desmame_check",
      type: "decision",
      title: "Elegível para avaliar desmame?",
      question: "A causa da VM está controlada e o paciente preenche os critérios de elegibilidade?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "Avaliar prontidão diariamente quando a causa da VM estiver melhorando: oxigenação e hemodinâmica suficientes para sustentar respiração espontânea, drive presente e ausência de nova deterioração. Cortes isolados não substituem a avaliação clínica.",
      evidence: [
        "Neuro: obedece comandos (GCS ≥ 8, RASS ≥ −2); drive inspiratório espontâneo presente.",
        "Ausência de: agitação incontrolável, convulsão ativa, isquemia miocárdica ativa, sepse não controlada.",
      ],
      options: [
        { id: "elegivel", label: "Sim — elegível: realizar TRE", next: "tre" },
        { id: "nao_elegivel", label: "Não — manter VM e reavaliar diariamente", next: "destino" },
      ],
    },

    tre: {
      id: "tre",
      type: "action",
      title: "Teste de Respiração Espontânea (TRE)",
      summary: "TRE pode ser realizado com ou sem pressão de suporte. Avaliar tolerância clínica e troca gasosa; IRRS/RSBI não é obrigatório para decidir prontidão ou sucesso.",
      actions: [
        "Minimizar sedação e confirmar que o paciente consegue iniciar esforço espontâneo. O TRE pode ser realizado com pressão de suporte baixa ou sem pressão de suporte (por exemplo, peça em T/CPAP), conforme protocolo e contexto; não há um único método obrigatório.",
        "IRRS/RSBI (FR/VC em litros) pode ser usado como informação adicional quando disponível, mas a AARC 2024 não exige seu cálculo para determinar prontidão para TRE.",
        "Durante o TRE, considerar sucesso quando o paciente mantém troca gasosa e padrão respiratório/hemodinâmico aceitáveis sem sinais progressivos de intolerância. Interpretar SpO₂, FR, FC, pressão, esforço, consciência e desconforto em conjunto — não por um único corte.",
        "Interromper o TRE se houver deterioração sustentada da oxigenação, esforço respiratório importante, alteração de consciência, instabilidade hemodinâmica, arritmia nova relevante ou desconforto progressivo; reconectar e investigar a causa.",
      ],
      next: "tre_resultado",
    },

    tre_resultado: {
      id: "tre_resultado",
      type: "decision",
      title: "Resultado do TRE",
      question: "O paciente tolerou o TRE (preencheu os critérios de sucesso)?",
      evidence: [
        "TRE bem-sucedido → avaliar extubação (tosse, secreções, via aérea).",
        "TRE com falha → reconectar ao ventilador em modo de repouso e investigar a causa.",
      ],
      options: [
        { id: "sucesso", label: "Sucesso — avaliar extubação", next: "extubacao" },
        { id: "falha", label: "Falha — reconectar e investigar", next: "reconectar" },
      ],
    },

    extubacao: {
      id: "extubacao",
      type: "action",
      title: "Extubação — checagem final e prevenção de falha",
      summary: "Confirmar via aérea e tosse antes de extubar; prevenir falha pós-extubação.",
      actions: [
        "Tosse eficaz ao comando (tosse fraca prediz falha); secreções manejáveis sem aspiração excessiva; ausência de obstrução de VA.",
        "Teste de cuff leak NÃO é rotina para todos: considerar em quem já está apto à extubação e tem alto risco de estridor/edema laríngeo. Se o teste sugerir alto risco, administrar corticoide sistêmico com antecedência (ATS/CHEST: pelo menos 4 h antes) e individualizar o esquema; não é necessário repetir o cuff leak obrigatoriamente.",
        "VNI profilática pós-extubação se alto risco (DPOC, IC, P/F < 150, hipercapnia crônica, obeso, ≥ 2 fatores) — reduz reintubação (EPICO). HFN para hipoxemia moderada (OPERA).",
        "Estridor pós-extubação: tratar edema de via aérea conforme gravidade, fornecer oxigenação e preparar reintubação precoce se houver obstrução progressiva, fadiga ou falha respiratória; não esperar um intervalo fixo diante de deterioração.",
        "Monitorar nas primeiras horas — reintubação é fator de pior prognóstico.",
      ],
      next: "destino_extubado",
    },

    reconectar: {
      id: "reconectar",
      type: "action",
      title: "Falha do TRE — reconectar e investigar",
      summary: "Não insistir durante intolerância: reconectar, tratar a causa da falha e repetir a avaliação quando a prontidão retornar.",
      actions: [
        "Reconectar ao ventilador em suporte confortável e suficiente para aliviar o trabalho respiratório; não impor período universal de 24 h antes de nova avaliação.",
        "Investigar a causa da falha: sobrecarga cardíaca (disfunção de VE no desmame), fraqueza muscular/ICU-AW, sedação residual, distúrbio metabólico, infecção, hiper/hipovolemia.",
        "Otimizar: balanço hídrico, eletrólitos, nutrição (proteína 1,3 g/kg/dia), mobilização precoce, reduzir sedação.",
        "Usar avaliação padronizada de prontidão pelo menos diariamente e repetir o TRE quando o paciente voltar a preencher condições clínicas para respiração espontânea.",
      ],
      next: "destino",
    },

    // ── 7. Destinos ────────────────────────────────────────────────────────────
    destino: {
      id: "destino",
      type: "transition",
      title: "UTI — VM contínua e reavaliação diária",
      summary: "Paciente ventilado → cuidado intensivo, bundles e avaliação diária de desmame.",
      disposition: "icu",
      exitCriteria: [
        "Manter ventilação protetora e analgosedação titulada; em SARA, Pplat ≤ 30 cmH₂O. Monitorar driving pressure sem transformá-la em corte universal. Avaliar diariamente redução de sedação e prontidão para TRE quando apropriado.",
        "Bundle ABCDEF (dor, despertar/respiração espontânea quando apropriados, escolha de sedação, delirium, mobilização e família) e prevenção de PAV com cabeceira 30–45°, higiene oral/escovação, manejo de secreção subglótica quando disponível e pressão do cuff monitorizada. Clorexidina oral não é rotina universal; seguir protocolo/local e indicações específicas.",
        "Reavaliar gasometria e mecânica conforme necessidade clínica e evolução. Considerar traqueostomia quando houver expectativa de ventilação prolongada ou outras indicações relevantes, individualizando momento, prognóstico, via aérea, secreções e objetivos de cuidado; não usar 7–14 dias como relógio obrigatório.",
        "Reavaliar diariamente a prontidão para desmame quando a causa estiver controlada.",
      ],
      targets: [],
    },

    destino_extubado: {
      id: "destino_extubado",
      type: "transition",
      title: "Pós-extubação — observação monitorizada",
      summary: "Extubado → vigilância de falha nas primeiras horas.",
      disposition: "observation",
      exitCriteria: [
        "Após extubação, monitorizar SpO₂, FR, esforço respiratório, consciência e sinais de obstrução durante o período de maior risco, com intensidade e duração definidas pelo perfil clínico em vez de uma janela obrigatória de 24–48 h.",
        "Manter VNI/HFN profilático nos pacientes de alto risco conforme indicado.",
        "Fisioterapia respiratória e motora; reavaliar deglutição antes de dieta VO.",
        "Reintubar prontamente se falha respiratória — não retardar.",
      ],
      targets: [],
    },
  },
};
