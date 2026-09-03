import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import { ALVOS_TCE } from "./lib/alvos-tce";
// A topização usa volume grande de anestésico local em mucosa, que absorve
// rápido — é onde o LAST nasce fora do bloco. Ponteiro curto; a conduta
// completa está em Intoxicações (lib/last-emulsao-lipidica.ts é a fonte).
import { LAST_PONTEIRO_CURTO } from "./lib/last-emulsao-lipidica";
import { FENTANIL_ANALGOSEDACAO } from "./lib/fentanil-analgosedacao";
import { FORA_DE_ESCOPO_PEDIATRICO } from "./lib/escopo-pediatrico";
import {
  VIA_AEREA_AMBAS_DIFICEIS,
  VIA_AEREA_BASE_DA_CONCLUSAO,
  VIA_AEREA_COMO_LER,
  VIA_AEREA_EFONA_DIFICIL,
  VIA_AEREA_GUIA_INTRO,
  VIA_AEREA_LARINGOSCOPIA_DIFICIL,
  VIA_AEREA_PRECEDENCIA_EFONA,
  VIA_AEREA_SEM_PREDITOR,
  VIA_AEREA_VENTILACAO_DIFICIL,
} from "./lib/via-aerea-quatro-dominios";
import {
  ANAFILAXIA_BLOQUEADOR,
  ANAFILAXIA_GATILHO_BLOQUEADOR,
  MG_POR_KG,
  mgPorKg,
  ISR_AJUSTE_NO_INSTAVEL,
} from "./lib/doses-isr";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";
import {
  NA_DUVIDA_BLOQUEADOR,
  NA_DUVIDA_CICO,
  NA_DUVIDA_INDUCAO,
} from "./lib/na-duvida";

/**
 * Fluxo interativo da Intubação em Sequência Rápida (ISR) no adulto.
 * Ordem real do procedimento (os "7 P's"): Preparação → Pré-oxigenação →
 * otimização fisiológica/Pré-tratamento → Paralisia com indução (agente conforme
 * a hemodinâmica + bloqueador neuromuscular) → Posicionamento → Passagem do tubo
 * com Prova (capnografia) → Pós-intubação. Inclui decisão de via aérea difícil.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * As doses de indução e de bloqueador são calculadas automaticamente pelo peso.
 *
 * NÃO substitui o julgamento clínico nem o protocolo institucional. A decisão e a
 * responsabilidade finais são do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

function deriveRsi(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    // Multiplicadores IMPORTADOS de lib/doses-isr.ts (D-14). Escrevê-los aqui à
    // mão era o defeito: a fonte única existia e ninguém a consumia (R-25).
    out.etom = round1(MG_POR_KG.etomidato * peso);
    out.ketaInd = round1(MG_POR_KG.cetamina.estavel * peso);
    out.ketaShock = round1(MG_POR_KG.cetamina.instavel * peso);
    out.ketaAsma = round1(MG_POR_KG.cetamina.asma * peso);
    out.propInd = round1(MG_POR_KG.propofol.estavel * peso);
    out.propLow = round1(MG_POR_KG.propofol.reduzido * peso);
    out.succLow = round1(MG_POR_KG.succinilcolina.min * peso);
    out.succHigh = round1(MG_POR_KG.succinilcolina.max * peso);
    out.rocu = round1(MG_POR_KG.rocuronio * peso);
    out.sugam = Math.round(MG_POR_KG.sugamadex * peso).toString();
    out.fenta = Math.round(MG_POR_KG.fentanilMcg * peso).toString();
    out.lido = round1(MG_POR_KG.lidocaina * peso);
  } else {
    // O fallback sem peso NÃO é texto traduzível: "0,3 mg/kg" não tem palavra em
    // português e a varredura não o vê. É valor de token, e por isso pode vir do
    // formatador — que é justamente o uso legítimo dele.
    out.etom = mgPorKg(MG_POR_KG.etomidato);
    out.ketaInd = mgPorKg(MG_POR_KG.cetamina.estavel);
    out.ketaShock = mgPorKg(MG_POR_KG.cetamina.instavel);
    out.ketaAsma = mgPorKg(MG_POR_KG.cetamina.asma);
    out.propInd = mgPorKg(MG_POR_KG.propofol.estavel);
    out.propLow = mgPorKg(MG_POR_KG.propofol.reduzido);
    out.succLow = mgPorKg(MG_POR_KG.succinilcolina.min);
    out.succHigh = mgPorKg(MG_POR_KG.succinilcolina.max);
    out.rocu = mgPorKg(MG_POR_KG.rocuronio);
    out.sugam = mgPorKg(MG_POR_KG.sugamadex);
    out.fenta = mgPorKg(MG_POR_KG.fentanilMcg, "mcg/kg");
    out.lido = mgPorKg(MG_POR_KG.lidocaina);
  }
  return out;
}

export const rsiDecisionTree: DecisionTreeDefinition = {
  id: "isr_rsi_adulto",
  version: "2024.1",
  label: "ISR — Via aérea",
  entryNodeId: "entry",
  derive: deriveRsi,
  nodes: {
    // ── 1. Preparação ──────────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Preparação — indicação e plano",
      summary: "Indicação de via aérea definitiva (FLOW) + checklist SOAP-ME antes de qualquer droga.",
      actions: [
        "Confirmar a indicação (mnemônico FLOW): Failure (falência ventilatória — apneia, PaCO₂ > 55 + pH < 7,20 refratário à VNI); Lungs (falência de oxigenação — SpO₂ < 90% com FiO₂ 1,0, SARA grave, EAP refratário); Obstruction (angioedema, epiglotite, trauma/queimadura de VA, anafilaxia); Work (FR > 35, musculatura acessória, paradoxo abdominal, fadiga). Também: GCS ≤ 8 com risco de aspiração.",
        "Checklist SOAP-ME: Sucção (Yankauer), O₂ (fonte com flush, MNR, BVM), Aparato (laringoscópio Mac 3/4 ou Miller 2/3 + videolaringoscópio, TOT 7,0/7,5 com cuff testado, estilete, bougie, cânula orofaríngea), Posição, Monitor/medicações, ETCO₂.",
        "Monitor completo (PA, ECG, SpO₂, capnografia waveform), 2 acessos venosos; equipe e funções definidas (operador, assistente, fármacos).",
        "Definir plano A/B/C e ter à mão o kit de via aérea difícil: VL, ML de 2ª geração (i-gel/LMA Supreme), kit de cricotireoidostomia (bisturi + tubo 6,0 com cuff).",
        "Posição: sniffing (cabeça elevada 20–30°). Obeso/gestante: ramped — alinhar meato auditivo externo aos ombros.",
        "Fonte deste módulo: The Walls Manual of Emergency Airway Management, 6ª ed., 2023 (7 P\u2019s, LEMON/MOANS) · Difficult Airway Society 2025: algoritmo linear A/B/C/D, oxigenação contínua durante o manejo, maximizar sucesso na primeira tentativa e confirmar ventilação com capnografia waveform.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados do paciente",
      intro: "Toque nos valores (ou adicione). O peso calcula as doses; a PA orienta o indutor.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado (kg)",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "pesoOrigem",
          label: "Este peso é",
          optional: true,
          presets: [
            { value: "estimado", label: "Estimado" },
            { value: "real", label: "Real (pesado)" },
          ],
        },
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "80", "90", "110", "130", "160"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "spo2",
          label: "SpO₂",
          unit: "%",
          allowCustom: true,
          customKeyboard: "numeric",
          optional: true,
          presets: ["85", "88", "90", "94", "98", "100"].map((v) => ({ value: v, label: v })),
        },
      ],
      // A avaliação de via aérea difícil vinha DEPOIS da pré-oxigenação —
      // gastava-se 3–5 min de MNR antes de saber a estratégia, inclusive antes
      // da decisão de técnica acordada, que muda tudo. No 7 P's do Walls a
      // avaliação é parte da Preparação, antes da pré-oxigenação.
      next: "via_dificil",
    },

    // ── 2. Pré-oxigenação ──────────────────────────────────────────────────────
    preoxigenacao: {
      id: "preoxigenacao",
      type: "action",
      title: "Pré-oxigenação",
      summary: "Maximizar a reserva de O₂ e manter oxigenação durante toda a sequência. Escolher a interface conforme gravidade, fisiologia e dificuldade prevista — não encurtar a pré-oxigenação do paciente crítico a um tempo fixo.",
      actions: [
        "Pré-oxigenar com FiO₂ 1,0 e cabeceira elevada, usando a interface que entregue melhor oxigenação e vedação para aquele paciente. No crítico, obeso ou gestante, não substituir otimização por um atalho fixo de 30–90 s: induzir após obter a melhor reserva possível sem atrasar uma via aérea que esteja se deteriorando.",
        "Hipoxemia grave (PaO₂/FiO₂ < 150): preferir pré-oxigenação com ventilação não invasiva quando factível. Diretrizes SCCM sugerem VNI nesse grupo; a ATS 2026 recomenda HFNC ou VNI para reduzir hipoxemia peri-intubação.",
        "Se laringoscopia difícil é esperada ou a interface escolhida for HFNC, manter alto fluxo durante a tentativa quando possível; o DAS 2025 prioriza oxigenação contínua ao longo do manejo.",
        "Agitação/delirium impedindo máscara, VNI ou HFNC: considerar pré-oxigenação assistida por medicação, com monitorização e plano de via aérea já preparado.",
        "Entre indução e laringoscopia, ventilação suave com BVM pode ser usada para prevenir hipoxemia no crítico: vedação a duas mãos quando necessário, PEEP e o menor volume que produza elevação torácica. Individualizar ou evitar se o risco de regurgitação/aspiração for excepcionalmente alto.",
        "Posição: cabeceira elevada/semi-Fowler; no obeso, ramped com alinhamento do meato auditivo externo ao esterno/ombro para otimizar pré-oxigenação e laringoscopia.",
      ],
      next: "otimizacao",
    },

    // ── 3. Predição de via aérea difícil (avaliada ANTES da pré-oxigenação) ───────────────────────────────────────
    via_dificil: {
      id: "via_dificil",
      type: "decision",
      title: "Via aérea difícil prevista?",
      question: "Há preditores de via aérea/ventilação difícil (LEMON / MOANS)?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "PREVER VIA DIFÍCIL MUDA O QUE SE FAZ, NÃO SÓ O QUE SE ESPERA: chame ajuda antes, use videolaringoscópio de primeira, tenha o plano de resgate montado e considere a via aérea acordada. Os critérios de LEMON e MOANS estão abaixo.",
      evidence: [
        "LEMON: Look (anatomia), Evaluate 3-3-2, Mallampati, Obstrução, Neck (mobilidade).",
        "MOANS (ventilação com máscara difícil): Mask seal, Obesidade/Obstrução, Age > 55, No teeth, Stiffness.",
      ],
      options: [
        { id: "sim", label: "Sim — preditores presentes", next: "via_dificil_plano" },
        {
          id: "nao",
          label: "Não — avaliei os quatro domínios",
          next: "preoxigenacao",
        },
        {
          // O default sob dúvida aqui é o lado perigoso: quem hesita responde
          // "não" e induz sem plano de resgate. É o caso puro do critério.
          id: "nao_sei",
          label: "Não sei dizer — me guie pelo que olhar",
          next: "via_aerea_dados",
        },
      ],
    },

    /**
     * ⚠️ GUIA DOS QUATRO DOMÍNIOS — nó novo, e o motivo fica escrito.
     *
     * O guia que já existe neste módulo (`rsi_instab_dados`) é de
     * INSTABILIDADE HEMODINÂMICA — PAS, consciência, perfusão, congestão.
     * Conferido campo a campo: INTERSEÇÃO ZERO com via aérea difícil. Reusá-lo
     * mandaria quem hesita para um guia que responde outra pergunta, e ele
     * sairia de lá achando que avaliou.
     *
     * ── TAMANHO, E A ORDEM QUE ELE IMPÕE ────────────────────────────────────
     *
     * São ONZE sinais, acima do limite de oito que torna um guia usável antes
     * de uma intubação. Nenhum eixo foi cortado — a ordem é que resolve: os
     * CINCO PRIMEIROS são os de maior rendimento (servem a 2–4 domínios cada) e
     * são obrigatórios; os seis últimos refinam e são opcionais, então quem
     * parar no meio parou tendo respondido o que mais decide.
     *
     * ── SEM REPETIR PERGUNTA ────────────────────────────────────────────────
     *
     * Cada sinal é perguntado UMA vez e conta para todos os domínios a que
     * pertence — obesidade conta para os quatro, obstrução para três, abertura
     * bucal para três. Perguntar o mesmo item três vezes é o ruído que faz
     * abandonar o guia no meio.
     */
    via_aerea_dados: {
      id: "via_aerea_dados",
      type: "input",
      title: "Vamos olhar juntos",
      intro: VIA_AEREA_GUIA_INTRO,
      fields: [
        {
          id: "obstrucao",
          label: "1. Há algo obstruindo ou sujando a via aérea agora — estridor, rouquidão nova, sangue, vômito, edema de língua ou lábios, massa visível?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "obesidade",
          label: "2. É obeso, ou tem pescoço curto e grosso?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "aberturaBucal",
          label: "3. Peça para abrir a boca: cabem TRÊS dedos seus entre os dentes?",
          presets: [
            { value: "sim", label: "Sim — cabem 3" },
            { value: "nao", label: "Não — cabem menos" },
          ],
        },
        {
          id: "cervicalAlterado",
          label: "4. O pescoço tem cirurgia prévia, radioterapia, tumor, massa, hematoma ou trauma?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "marcosPalpaveis",
          label: "5. Passe o dedo no pescoço: você SENTE as cartilagens (pomo de Adão e o anel abaixo dele)?",
          presets: [
            { value: "sim", label: "Sim — sinto" },
            { value: "nao", label: "Não — não consigo sentir" },
          ],
        },
        {
          id: "tireomento",
          label: "6. Do queixo ao osso do pescoço, cabem TRÊS dedos?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim — cabem 3" },
            { value: "nao", label: "Não — cabem menos" },
          ],
        },
        {
          id: "pescoco",
          label: "7. Consegue inclinar a cabeça para trás e levar o queixo ao peito, sem dor e sem colar?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não — pescoço travado ou imobilizado" },
          ],
        },
        {
          id: "orofaringe",
          label: "8. Com a boca aberta e a língua para fora: dá para ver o fundo da garganta (a úvula inteira)?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim — vejo bem" },
            { value: "nao", label: "Não — vejo pouco ou nada" },
          ],
        },
        {
          id: "rigidez",
          label: "9. O pulmão está duro de ventilar — asma grave, DPOC descompensado, SARA, ou a barriga empurrando o diafragma?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "barbaDentes",
          label: "10. Tem barba cheia, ou não tem dentes?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "idadeRonco",
          label: "11. Tem mais de 55 anos, ronca muito ou tem apneia do sono?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
      ],
      next: {
        possiveis: [
          "via_aerea_efona",
          "via_aerea_ambas",
          "via_aerea_ventilacao",
          "via_dificil_plano",
          "via_aerea_sem_preditor",
        ],
        escolher: (v) => {
          const sim = (k: string) => v[k] === "sim";
          const nao = (k: string) => v[k] === "nao";

          // Cada sinal conta para todos os domínios a que pertence — perguntado
          // uma vez, somado onde vale.
          const laringoscopia =
            sim("obstrucao") || sim("obesidade") || nao("aberturaBucal") ||
            sim("cervicalAlterado") || nao("tireomento") || nao("pescoco") || nao("orofaringe");
          const ventilacao =
            sim("obstrucao") || sim("obesidade") || sim("rigidez") ||
            sim("barbaDentes") || sim("idadeRonco");
          const extraglotico =
            sim("obstrucao") || sim("obesidade") || nao("aberturaBucal") || sim("rigidez");
          const efona =
            sim("cervicalAlterado") || nao("marcosPalpaveis") ||
            (sim("obesidade") && nao("marcosPalpaveis"));

          // ⚠️ O eFONA TEM PRECEDÊNCIA SOBRE OS OUTROS TRÊS, e a razão precisa
          // estar escrita também NA TELA (não só aqui): laringoscopia,
          // ventilação e extraglótico difíceis mudam o PLANO — que aparelho,
          // quem chama, como pré-oxigena. O eFONA difícil muda a DECISÃO DE
          // INDUZIR, porque é o resgate do resgate. Quem lê sem essa frase acha
          // que é só mais uma saída entre quatro.
          if (efona) return "via_aerea_efona";
          if (laringoscopia && (ventilacao || extraglotico)) return "via_aerea_ambas";
          if (ventilacao || extraglotico) return "via_aerea_ventilacao";
          if (laringoscopia) return "via_dificil_plano";
          return "via_aerea_sem_preditor";
        },
      },
    },

    via_aerea_efona: {
      id: "via_aerea_efona",
      type: "action",
      title: "O plano D também é difícil — decida ANTES de bloquear",
      summary: VIA_AEREA_COMO_LER,
      actions: [VIA_AEREA_PRECEDENCIA_EFONA, VIA_AEREA_EFONA_DIFICIL, VIA_AEREA_AMBAS_DIFICEIS, VIA_AEREA_BASE_DA_CONCLUSAO],
      next: "via_dificil_estrategia",
    },

    via_aerea_ambas: {
      id: "via_aerea_ambas",
      type: "action",
      title: "Intubação difícil com resgate frágil",
      summary: VIA_AEREA_COMO_LER,
      actions: [VIA_AEREA_AMBAS_DIFICEIS, VIA_AEREA_BASE_DA_CONCLUSAO],
      next: "via_dificil_estrategia",
    },

    via_aerea_ventilacao: {
      id: "via_aerea_ventilacao",
      type: "action",
      title: "A rede de resgate é que está frágil",
      summary: VIA_AEREA_COMO_LER,
      actions: [VIA_AEREA_VENTILACAO_DIFICIL, VIA_AEREA_BASE_DA_CONCLUSAO],
      next: "via_dificil_plano",
    },

    via_aerea_sem_preditor: {
      id: "via_aerea_sem_preditor",
      type: "action",
      title: "Sem preditor nos quatro domínios",
      summary: VIA_AEREA_COMO_LER,
      actions: [VIA_AEREA_SEM_PREDITOR, VIA_AEREA_BASE_DA_CONCLUSAO],
      next: "preoxigenacao",
    },

    via_dificil_plano: {
      id: "via_dificil_plano",
      type: "action",
      title: "Via aérea difícil — preparar resgate",
      summary: "Não bloquear sem um plano de resgate definido.",
      actions: [
        VIA_AEREA_LARINGOSCOPIA_DIFICIL,
  VIA_AEREA_PRECEDENCIA_EFONA,
        "Chamar ajuda experiente; usar videolaringoscópio de primeira escolha.",
        "Preparar dispositivos de resgate: máscara laríngea, bougie, kit de cricotireoidostomia aberto.",
        "Definir claramente o gatilho para a via cirúrgica ('não intuba, não ventila').",
      ],
      next: "via_dificil_estrategia",
    },

    /**
     * ── POR QUE ESTE NÓ EXISTE ────────────────────────────────────────────────
     *
     * O nó acima dizia "considerar intubação acordada" e seguia DIRETO para a
     * indução: quem escolhesse a técnica acordada não tinha para onde ir — o
     * fluxo sempre desembocava em induzir e bloquear. "Considerar" sem caminho
     * é menção decorativa, e este foi o primeiro achado da auditoria que não é
     * número errado: é uma VIA CLÍNICA que o app não permitia percorrer.
     * Também não existia a saída "não intubar agora" — nem toda avaliação de
     * via aérea termina em intubação.
     */
    via_dificil_estrategia: {
      id: "via_dificil_estrategia",
      type: "decision",
      title: "Estratégia diante da via aérea difícil",
      question: "Com o plano de resgate pronto: qual estratégia para esta via aérea?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 4 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 4, tirar um não abre
      // nada — abaixaria para 3 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ URGÊNCIA EXTREMA NÃO ESPERA TÉCNICA ACORDADA. Se há apneia ou obstrução completa iminente, o caminho é ISR com o kit cirúrgico ABERTO na mesa — a via acordada exige tempo e colaboração, e nenhum dos dois existe aí.",
      evidence: [
        "ISR com plano A/B/C: quando a dificuldade prevista é manejável e a urgência não permite alternativa — a maioria dos casos.",
        "VIA ACORDADA (paciente ventilando espontaneamente durante a laringoscopia): anatomia muito desfavorável + paciente colaborativo + tempo disponível. Preserva o drive — se a visualização falhar, o paciente continua respirando.",
        "ADIAR: se a indicação não é imediata e a otimização (VNI/HFN, posição, reavaliação com ajuda experiente) pode transformar uma via impossível agora numa via difícil depois.",
        "Urgência extrema (apneia, obstrução completa iminente) NÃO espera técnica acordada — ISR com kit cirúrgico aberto.",
      ],
      options: [
        { id: "isr", label: "ISR com plano A/B/C pronto", next: "preoxigenacao" },
        { id: "acordada", label: "Via aérea ACORDADA (mantém ventilação espontânea)", next: "via_acordada" },
        { id: "adiar", label: "Adiar — otimizar e reavaliar antes de intubar", next: "adiar_iot" },
      ],
    },

    via_acordada: {
      id: "via_acordada",
      type: "action",
      title: "Via aérea acordada — topização e sedação leve",
      summary: "O paciente continua ventilando durante toda a tentativa. NÃO usar bloqueador neuromuscular.",
      actions: [
        "Topização: lidocaína tópica na via aérea (spray/atomizador 4%; máx ~4 mg/kg somando todas as vias) — é a base da técnica, não a sedação.",
        LAST_PONTEIRO_CURTO,
        "Sedação LEVE mantendo o drive: cetamina em doses fracionadas de 10–20 mg IV (dissociação leve preservando respiração) OU dexmedetomidina 1 mcg/kg em 10 min. NÃO usar bolus de indução.",
        "Videolaringoscópio ou broncoscópio flexível, com o operador mais experiente disponível.",
        "Visualizou as cordas e passou o tubo → confirmar por capnografia. SÓ ENTÃO induzir e aprofundar sedação.",
        "Falhou ou o paciente não tolera → ainda está ventilando: recuar, reoxigenar e reavaliar a estratégia (nova tentativa, ISR com kit cirúrgico aberto, ou via cirúrgica eletiva com equipe).",
        "Antissialogogo se houver tempo; aspiração pronta; O₂ contínuo (cânula nasal/HFN) durante toda a tentativa.",
      ],
      next: "confirmacao",
    },

    adiar_iot: {
      id: "adiar_iot",
      type: "transition",
      title: "Intubação adiada — otimizar e reavaliar",
      summary: "Decisão ativa, não omissão: melhorar as condições antes de tentar, com critérios de retorno definidos.",
      disposition: "observation",
      exitCriteria: [
        "Ponte de oxigenação: VNI ou HFN com monitorização contínua — SpO₂, FR, trabalho respiratório, consciência.",
        "Otimizar o que tornou a via difícil ou o paciente instável: posição, volemia, broncodilatador, reversão de sedativo, anafilaxia tratada.",
        "Acionar quem faltava: anestesiologia, otorrino/cirurgia, broncoscópio, sala preparada.",
        "GATILHOS DE RETORNO IMEDIATO à intubação: rebaixamento, falha da VNI/HFN (SpO₂ < 90% ou FR subindo), estridor progressivo, fadiga.",
        "Reavaliação formal em intervalo curto e definido — adiar sem hora de reavaliar é abandonar.",
      ],
      targets: [],
    },

    // ── 4. Otimização fisiológica ──────────────────────────────────────────────
    otimizacao: {
      id: "otimizacao",
      type: "decision",
      title: "Otimização hemodinâmica",
      question: "Há instabilidade (PAS < 90 / choque / hipoperfusão)?",
      summary: "PAS informada: {pas} mmHg.",
      evidence: [
        "'Reanimar antes de intubar': a indução + pressão positiva pioram a hipotensão e podem causar PCR peri-intubação.",
        "Otimizar pré-carga e PA reduz o risco de colapso após a indução.",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "rsi_instab_dados" },
        { id: "sim", label: "Sim — instável", next: "otimizar" },
        { id: "nao", label: "Não — estável", next: "pretratamento" },
      ],
    },

    rsi_instab_dados: {
      id: "rsi_instab_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: camposDeInstabilidade(),
      // Aqui o LIMÍTROFE vai para o mesmo destino do instável, e isso é
      // deliberado — é o único módulo em que isso acontece.
      //
      // Nos outros, chamar de instável quem não é leva a tratar demais. Aqui o
      // "tratamento" é otimizar a pré-carga e a pressão ANTES de induzir, e o
      // custo disso é baixo: um pouco de volume e um vasopressor à mão. O custo
      // do erro oposto é PCR peri-intubação, porque a indução e a pressão
      // positiva derrubam quem já estava no limite. Diante de meio critério, o
      // certo é otimizar.
      next: roteamentoDeInstabilidade({
        instavel: "otimizar",
        limitrofe: "rsi_limitrofe",
        estavel: "pretratamento",
      }),
    },

    rsi_limitrofe: {
      id: "rsi_limitrofe",
      type: "action",
      title: "Achado isolado — otimize mesmo assim antes de induzir",
      summary:
        "Não fecha critério de instabilidade, mas na intubação a margem é outra: quem está no limite colapsa com a indução.",
      actions: [
        "A indução tira o tônus simpático e a pressão positiva reduz o retorno venoso. Quem tem QUALQUER sinal de má perfusão antes da laringoscopia pode parar depois dela.",
        "Índice de choque (FC ÷ PAS) acima de 0,9 prevê colapso/PCR peri-intubação mesmo com pressão ainda normal (Heffner, J Crit Care 2013) — some 100 de FC com 100 de PAS e o risco já está lá. A partir de 0,8 já se prevê hipotensão pós-intubação; 0,9 é o limiar do desfecho mais grave, e é o que este passo vigia.",
        "OTIMIZE ANTES: volume conforme o contexto, vasopressor preparado (bolus de push-dose ou infusão já montada e conectada), pré-oxigenação caprichada.",
        "Escolha a dose do indutor pensando na hemodinâmica: reduzir a dose do indutor e manter a do bloqueador é o padrão em quem está no limite.",
        "Se houver tempo, reavalie após a otimização — muitos saem do limítrofe antes da laringoscopia.",
      ],
      next: "otimizar",
    },

    otimizar: {
      id: "otimizar",
      type: "action",
      title: "Reanimar antes de intubar",
      summary: "Estabilizar a hemodinâmica antes da indução — indução + pressão positiva pioram a hipotensão e podem causar PCR peri-intubação.",
      actions: [
        "Volume: bolus de cristaloide 250–500 mL se responsivo; iniciar/otimizar vasopressor (noradrenalina) para PAS adequada.",
        "Ter push-dose pressor à mão para hipotensão pós-indução (ex.: noradrenalina 8–12 mcg IV em bolus, repetir conforme resposta).",
        "Preferir indutor hemodinamicamente estável (cetamina; etomidato em dose plena).",
        "Corrigir hipóxia e acidose graves na medida do possível antes de prosseguir.",
      ],
      next: "pretratamento",
    },

    // ── 4b. Pré-tratamento (uso seletivo, ~3 min antes da indução) ─────────────
    pretratamento: {
      id: "pretratamento",
      type: "action",
      title: "Pré-tratamento — uso seletivo por cenário",
      summary: "Adjuvantes opcionais, ~3 min antes da indução. Pular se não houver indicação específica.",
      actions: [
        "Fentanil {fenta} mcg IV (1–3 mcg/kg, 3 min antes): atenua a resposta simpática à laringoscopia. Indicado em coronariopatia, HAS grave, hipertensão intracraniana (HIC). Cuidado: rigidez torácica se > 5 mcg/kg.",
        "Lidocaína {lido} mg IV (1,5 mg/kg, 3 min antes): atenua HIC e broncoespasmo. Considerar em TCE grave e asma/DPOC (evidência limitada, perfil seguro).",
        FORA_DE_ESCOPO_PEDIATRICO,
        "Em asma/broncoespasmo: salbutamol inalatório antes da indução.",
        "Sem indicação dos itens acima → seguir direto para a indução.",
      ],
      next: "inducao",
    },

    // ── 5. Indução ─────────────────────────────────────────────────────────────
    inducao: {
      id: "inducao",
      type: "decision",
      title: "Agente de indução",
      question: "Qual o perfil hemodinâmico para escolher o indutor?",
      summary: NA_DUVIDA_INDUCAO,
      evidence: [
        "ESTÁVEL: propofol {propInd} mg (1,5–2 mg/kg) — início ultrarrápido, reduz PIC/PIO, antiemético; ou etomidato {etom} mg (0,3 mg/kg) — hemodinamicamente neutro.",
        "INSTÁVEL/choque: cetamina {ketaShock} mg (1 mg/kg; 0,5 mg/kg em choque grave) ou etomidato {etom} mg. EVITAR propofol e midazolam (hipotensão).",
        "Cenários: asma/broncoespasmo → cetamina {ketaAsma} mg (2 mg/kg, broncodilatação); TCE/HIC → cetamina (segura com ventilação normal) ou propofol; status epilepticus → propofol ou midazolam; coronariopatia/HAS → etomidato ou cetamina+fentanil.",
        "Fentanil NÃO é hipnótico — usar SEMPRE com um indutor, nunca isolado.",
      ],
      options: [
        { id: "estavel", label: "Estável → propofol / etomidato", next: "ind_estavel" },
        { id: "instavel", label: "Instável / choque → cetamina (ou etomidato)", next: "ind_cetamina" },
      ],
    },

    ind_estavel: {
      id: "ind_estavel",
      type: "action",
      title: "Indução — paciente estável",
      summary: "Propofol ou etomidato. Administrar imediatamente antes do bloqueador.",
      actions: [
        "Propofol {propInd} mg IV (1,5–2 mg/kg) em bolus — início 15–45 s. Reduzir para {propLow} mg (1 mg/kg) em idosos. Cuidado: hipotensão dose-dependente.",
        "Alternativa hemodinamicamente neutra: etomidato {etom} mg IV (0,3 mg/kg) — início 15–45 s; mioclonias e supressão adrenal transitória.",
        "Asma/broncoespasmo: preferir cetamina {ketaAsma} mg (2 mg/kg).",
        "Injetar o indutor em bolus rápido e, em < 30 s, o bloqueador neuromuscular. NÃO ventilar no intervalo de apneia (salvo SpO₂ < 90%).",
      ],
      next: "bloqueador",
    },

    ind_cetamina: {
      id: "ind_cetamina",
      type: "action",
      title: "Cetamina — dose calculada",
      summary: "Preferida na instabilidade — simpatomimético, preserva a PA. Broncodilatadora.",
      actions: [
        // ⚠️ CONSUMO ACRESCENTADO (2026-08-17) — a constante existia em
        // `lib/doses-isr.ts` e NENHUM nó a usava, enquanto este nó reduzia o
        // indutor e não dizia nada sobre o bloqueador.
        //
        // É R-77: quem lê "reduza a dose no instável" reduz AS DUAS, e um
        // bloqueio incompleto é laringoscopia com o paciente reagindo — pior que
        // a hipotensão que se queria evitar. A regra é assimétrica de propósito.
        ISR_AJUSTE_NO_INSTAVEL,
        "Cetamina {ketaShock} mg IV (1 mg/kg) no instável/choque; 0,5 mg/kg se choque grave; até {ketaInd} mg (1,5 mg/kg) se mais estável.",
        "Alternativa em instabilidade: etomidato {etom} mg IV (0,3 mg/kg).",
        "Manter vasopressor/push-dose disponível (noradrenalina 8–12 mcg IV em bolus).",
        "Injetar o indutor em bolus rápido e, em < 30 s, o bloqueador neuromuscular. NÃO ventilar no intervalo de apneia (salvo SpO₂ < 90%).",
      ],
      next: "bloqueador",
    },

    // ── 6. Bloqueador neuromuscular ────────────────────────────────────────────
    bloqueador: {
      id: "bloqueador",
      type: "decision",
      title: "Bloqueador neuromuscular",
      question: "A succinilcolina está contraindicada?",
      summary: NA_DUVIDA_BLOQUEADOR,
      evidence: [
        // A lista trazia a deficiência GENÉTICA de colinesterase (pseudocolinesterase
        // atípica) e não a inibição ADQUIRIDA — organofosforado. O módulo de
        // intoxicações já avisava ("bloqueio prolongado pela inibição da
        // colinesterase"); este, que é onde a droga se escolhe, não.
        "Contraindicações importantes da succinilcolina (usar rocurônio quando presentes): hipercalemia conhecida ou suspeita clinicamente relevante — não usar K⁺ > 5,5 como corte universal; após a fase aguda de queimadura grave, trauma múltiplo, denervação/lesão de neurônio motor superior ou imobilização prolongada, pelo risco de hipercalemia grave; rabdomiólise/esmagamento; miopatias/distrofias musculares e miotonias; suscetibilidade pessoal/familiar à hipertermia maligna; pseudocolinesterase atípica OU inibição adquirida da colinesterase (intoxicação por organofosforado — bloqueio prolongado); trauma ocular aberto/franca perfuração ocular — preferir bloqueador não despolarizante.",
        "Succinilcolina: início 45–60 s, duração ultracurta 8–12 min. Sem antídoto.",
        ANAFILAXIA_BLOQUEADOR,
        ANAFILAXIA_GATILHO_BLOQUEADOR,
        "Rocurônio 1,2 mg/kg: início 45–60 s, duração 45–70 min. Antídoto: sugamadex 16 mg/kg reverte em < 3 min — com sugamadex disponível, mesma segurança que SCh.",
      ],
      options: [
        { id: "nao", label: "Não — usar succinilcolina", next: "blq_succinilcolina" },
        { id: "sim", label: "Sim — usar rocurônio", next: "blq_rocuronio" },
      ],
    },

    blq_succinilcolina: {
      id: "blq_succinilcolina",
      type: "action",
      title: "Succinilcolina — dose calculada",
      summary: "Início rápido e duração ultracurta (8–12 min). Máx 200 mg.",
      actions: [
        "Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg; 2 mg/kg em obesos; máx 200 mg) em bolus ultrarrápido, logo após o indutor.",
        "Aguardar as fasciculações cessarem / relaxamento (~45–60 s) antes da laringoscopia.",
        "Se surgir contraindicação, trocar por rocurônio {rocu} mg.",
        "Prosseguir para o posicionamento e a passagem do tubo.",
      ],
      next: "intubacao",
    },

    blq_rocuronio: {
      id: "blq_rocuronio",
      type: "action",
      title: "Rocurônio — dose calculada",
      summary: "Alternativa segura quando a SCh é contraindicada. Antídoto: sugamadex.",
      actions: [
        "Rocurônio {rocu} mg IV (1,2 mg/kg) em bolus ultrarrápido, logo após o indutor.",
        "Início ~45–60 s; duração longa (45–70 min) — ter plano de resgate definido.",
        "ANTÍDOTO CICO: sugamadex {sugam} mg IV (16 mg/kg) reverte em < 3 min. Ter SEMPRE disponível quando usar rocurônio para ISR.",
        "Prosseguir para o posicionamento e a passagem do tubo.",
      ],
      next: "intubacao",
    },

    // ── 7. Passagem do tubo ────────────────────────────────────────────────────
    intubacao: {
      id: "intubacao",
      type: "action",
      title: "Posicionamento e passagem do tubo",
      summary: "Aguardar relaxamento (45–60 s). Tentativa otimizada; limitar a apneia. Máx 2 tentativas por operador/dispositivo.",
      actions: [
        "Confirmar relaxamento (ausência de tônus mandibular) antes da laringoscopia.",
        "Laringoscopia direta (Mac 3/4 ou Miller 2/3) ou videolaringoscópio (1ª escolha em VA difícil prevista ou após falha de LD; melhora a visão em > 90%).",
        "Sem visualizar a glote: bougie + manobra BURP (Backward-Upward-Rightward). Trocar para VL se Cormack-Lehane III/IV na LD.",
        "Avançar o TOT 2–3 cm abaixo das cordas; insuflar o cuff 20–30 cmH₂O. Profundidade na comissura: homem 21–23 cm, mulher 19–21 cm.",
        "Limitar a tentativa a ~30 s ou até SpO₂ ~90% → reoxigenar (BVM/HFN) entre tentativas. Máximo 2 tentativas com o mesmo operador/dispositivo.",
      ],
      next: "confirmacao",
    },

    confirmacao: {
      id: "confirmacao",
      type: "decision",
      title: "Confirmação (Prova)",
      question: "A capnografia (ETCO₂) confirma a posição traqueal?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⚠️ ETCO₂ AUSENTE É ESÔFAGO ATÉ PROVA EM CONTRÁRIO — retire o tubo e ventile. Nenhum outro sinal desfaz esta conclusão.",
      evidence: [
        "Capnografia waveform é o padrão-ouro: onda de ETCO₂ persistente em ≥ 6 ventilações.",
        "Confirmar também: ausculta 5 pontos (epigástrio + 2 axilas + 2 ápices), expansão torácica simétrica, condensação no tubo, SpO₂ mantendo/subindo; RX (tubo 2–3 cm acima da carina).",
      ],
      options: [
        { id: "sim", label: "Sim — ETCO₂ confirma traqueia", next: "pos_intubacao" },
        { id: "nao", label: "Não — sem confirmação / esôfago", next: "falha" },
      ],
    },

    falha: {
      id: "falha",
      type: "action",
      title: "Sem confirmação — corrigir e reoxigenar",
      summary: "Não insistir às cegas. Remover tubo esofágico, reoxigenar e reabordar com plano B.",
      actions: [
        "Intubação esofágica (ETCO₂ ausente): retirar o tubo IMEDIATAMENTE, ventilar com BVM + O₂ e reoxigenar antes de nova tentativa.",
        "Intubação seletiva (murmúrio ausente à esquerda): recuar o tubo 1–2 cm e reconfirmar.",
        "Trocar para videolaringoscópio / operador mais experiente; usar bougie + BURP.",
        "Manter oxigenação apneica (HFN 60 L/min) e BVM entre tentativas.",
      ],
      next: "cico_check",
    },

    cico_check: {
      id: "cico_check",
      type: "decision",
      title: "Consegue oxigenar/ventilar?",
      question: "Após a falha, é possível manter a oxigenação (BVM ou máscara laríngea)?",
      summary: NA_DUVIDA_CICO,
      evidence: [
        "Já houve falha de tentativas de IOT — a decisão agora é se há oxigenação adequada.",
        "Oxigenando = há tempo para nova tentativa otimizada com plano B (VL, bougie, ML).",
        "NÃO oxigena (CICO — cannot intubate, cannot oxygenate) com SpO₂ caindo = via aérea cirúrgica imediata.",
      ],
      options: [
        { id: "oxigena", label: "Sim — oxigenando: nova tentativa com plano B", next: "intubacao" },
        { id: "cico", label: "Não — CICO (não intuba, não ventila)", next: "cico" },
      ],
    },

    cico: {
      id: "cico",
      type: "action",
      title: "CICO — declarar via aérea difícil",
      summary: "Não intuba, não ventila, SpO₂ caindo. Chamar ajuda e preparar via aérea cirúrgica.",
      actions: [
        "DECLARAR via aérea difícil em voz alta. Chamar ajuda (anestesiologista, otorrino, cirurgião).",
        "Tentar resgate ventilatório: BVM + cânula orofaríngea; máscara laríngea de 2ª geração (i-gel / LMA Supreme).",
        "Se usou rocurônio: sugamadex {sugam} mg IV (16 mg/kg) — reverte em < 3 min; considerar despertar o paciente.",
        "Se a oxigenação não for restaurada → via aérea cirúrgica SEM demora.",
      ],
      next: "via_cirurgica",
    },

    via_cirurgica: {
      id: "via_cirurgica",
      type: "action",
      title: "Via aérea cirúrgica — cricotireoidostomia",
      summary: "SpO₂ em queda e todas as tentativas falharam → não retardar.",
      actions: [
        "Cricotireoidostomia cirúrgica (padrão em adultos) — técnica scalpel-finger-tube (Walls): incisão vertical na pele + incisão horizontal na membrana cricotireóidea + tubo 6,0 com cuff.",
        "Cricotireoidostomia por agulha (kit transtraqueal + O₂ a jato): apenas como ponte (< 30–45 min, risco de barotrauma).",
        "Traqueostomia: mais demorada — reservar para sala cirúrgica.",
        "Confirmar a posição por capnografia e seguir para o manejo pós-intubação.",
      ],
      next: "pos_intubacao",
    },

    // ── 8. Pós-intubação ───────────────────────────────────────────────────────
    pos_intubacao: {
      id: "pos_intubacao",
      type: "action",
      title: "Manejo pós-intubação",
      summary: "Iniciar sedoanalgesia IMEDIATAMENTE. Fixar, ventilar com segurança e tratar hipotensão.",
      actions: [
        "SEDOANALGESIA já: propofol 5–50 mcg/kg/min OU midazolam 0,02–0,1 mg/kg/h.",
        FENTANIL_ANALGOSEDACAO,
        "Alvo RASS −2 a 0 (sedação LEVE é o padrão — PADIS 2018); mais profundo só por indicação declarada. NUNCA deixar paralisado sem sedação — sob bloqueio, o alvo é RASS −5.",
        "Fixar o tubo; registrar a profundidade; RX de tórax (ponta 2–3 cm acima da carina).",
        "Ventilador (pulmão normal): VCV/PCV, VC 6–8 mL/kg de peso PREDITO (calculado pela ALTURA, nunca o peso real nem tabela antropométrica), FR 12–16, PEEP 5, FiO₂ 1,0 → titular para SpO₂ ≥ 94% (reduzir o quanto antes), I:E 1:2.",
        `Ajustes por cenário: TCE → PaCO₂ ${ALVOS_TCE.paco2}, PEEP ${ALVOS_TCE.peep} (hiperventilar só em herniação aguda); SARA → VC 4–6 mL/kg, PEEP alto, driving pressure ≤ 15; asma/DPOC → FR 8–12, tempo expiratório longo, PEEP 3–5, hipercapnia permissiva.`,
        "Hipotensão pós-IOT (comum): SF 250–500 mL, reduzir PEEP, descartar pneumotórax; noradrenalina 8–12 mcg IV em bolus se refratária.",
        "Gasometria arterial 20–30 min após a IOT para ajuste fino. Capnografia contínua.",
      ],
      next: "destino",
    },

    destino: {
      id: "destino",
      type: "transition",
      title: "UTI / cuidado pós-intubação",
      summary: "Paciente intubado → monitorização intensiva.",
      disposition: "icu",
      exitCriteria: [
        "Transferir para UTI com ventilação mecânica e sedação tituladas.",
        "Manter capnografia, oximetria e monitorização hemodinâmica contínuas.",
        "Tratar a causa de base que motivou a via aérea definitiva.",
        "Reavaliar parâmetros ventilatórios e sedação periodicamente.",
      ],
      targets: [],
    },
  },
};

/**
 * ── REBAIXAMENTO E VIA AÉREA — FONTE ÚNICA, DONA AQUI ────────────────────────
 *
 * Vive no módulo de via aérea porque é aqui que a indicação se decide: o FLOW
 * pergunta falência ventilatória, de oxigenação, obstrução e trabalho; avalia
 * preditores de dificuldade; e prepara o material. A calculadora do Glasgow
 * CONSOME esta frase.
 *
 * ── O QUE ELA CORRIGE (R-19) ─────────────────────────────────────────────────
 *
 * A tela do Glasgow dizia, na faixa ≤ 8: "🚨 IOT indicada". Afirmação solta, e
 * ela era o ÚNICO lugar do app que não qualificava a regra — a ISR diz "GCS ≤ 8
 * COM RISCO DE ASPIRAÇÃO" dentro do FLOW, a eclâmpsia diz "GCS ≤ 8
 * PERSISTENTE", o TCE fala no contexto do trauma.
 *
 * "GCS ≤ 8 intuba" é das regras mais repetidas e mais mal aplicadas da
 * emergência, e erra exatamente onde a causa é reversível em minutos.
 */
export const GLASGOW_AVALIAR_VIA_AEREA =
  "Rebaixamento neste nível exige AVALIAÇÃO imediata da via aérea — não intubação automática. A regra \"GCS ≤ 8 intuba\" erra justamente onde a causa é reversível em minutos: pós-ictal, hipoglicemia e intoxicação por opioide costumam recuperar a consciência com o tratamento específico, e o paciente acaba intubado por um número que já estava subindo. O que decide é a capacidade de proteger a via aérea, a trajetória (melhorando ou piorando) e a causa. Abrir o módulo ISR/Via aérea, que avalia indicação, preditores de dificuldade e preparo.";
