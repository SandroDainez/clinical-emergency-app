import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

import {
  ALERGIA_BL_ALTERNATIVA,
  ALERGIA_BL_ESTRATIFICAR,
  ALERGIA_BL_EXCECAO_CEFTAZIDIMA,
  ALERGIA_BL_REVISAO,
} from "./lib/alergia-beta-lactamico";
import {
  PRECAUCOES_AEREO,
  PRECAUCOES_CONTATO,
  PRECAUCOES_GOTICULAS,
  PRECAUCOES_NAO_FAZER,
  PRECAUCOES_REGRA,
} from "./lib/precaucoes-isolamento";
import { ADRENALINA_CHOQUE_FAIXA, ADRENALINA_CHOQUE_LIMIARES } from "./lib/adrenalina-no-choque";
import { VASOPRESSINA_APRESENTACAO, VASOPRESSINA_DOSE, VASOPRESSINA_QUANDO_ASSOCIAR } from "./lib/vasopressina";
import { HIDROCORTISONA_APRESENTACAO } from "./lib/hidrocortisona";
import { DOBUTAMINA_ATE_20, DOBUTAMINA_FAIXA_USUAL, DOBUTAMINA_INDICACAO_SEPSE_FRACA, DOBUTAMINA_INICIO } from "./lib/dobutamina";
import {
  ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
  ATB_PONTEIRO_CALCULADORA,
  rotuloAtaqueVancomicina,
} from "./lib/dose-antibiotico-renal";
/**
 * Fluxo interativo de Sepse e Choque Séptico no adulto.
 * Baseado em: Surviving Sepsis Campaign (SSC) 2026 (SCCM) · Sepsis-3 (JAMA 2016) ·
 * SSC Bundle 2018 · ILAS 2021.
 *
 * Ordem (pacote da 1ª hora): reconhecimento (SOFA/qSOFA) → lactato + culturas →
 * antibiótico de amplo espectro por FOCO ≤ 1 h → cristaloide 30 mL/kg se hipoperfusão
 * → vasopressor (PAM ≥ 65) → corticoide se refratário → controle do foco →
 * reavaliação dinâmica → suporte orgânico / destino (UTI).
 *
 * Valores por TOQUE com opção de valor próprio. Volume (30 mL/kg) e doses pelo peso.
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

function deriveSepsis(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    const vol = 30 * peso;
    out.fluidVol = round0(vol); // 30 mL/kg
    out.fluidVolL = (Math.round((vol / 1000) * 10) / 10).toString().replace(".", ",");
    out.noraStart = (Math.round(0.05 * peso * 100) / 100).toString().replace(".", ","); // 0,05 mcg/kg/min
    // ⚠️ FONTE ÚNICA — e os dois lados JÁ DIVERGIAM (R-12 com cálculo).
    // Aqui era `round0(27.5 * peso)`, SEM TETO; a calculadora aplicava máx 3 g.
    // A 130 kg isto prescrevia 3.575 mg contra 3.000 mg dela — e o lado que
    // prescreve era o errado. Medição completa em lib/dose-antibiotico-renal.ts.
    out.vancoLoad = rotuloAtaqueVancomicina(peso);
  } else {
    out.fluidVol = "30 mL/kg";
    out.fluidVolL = "30 mL/kg";
    out.noraStart = "0,05 mcg/kg/min";
    out.vancoLoad = rotuloAtaqueVancomicina(undefined);
  }
  return out;
}

export const sepsisDecisionTree: DecisionTreeDefinition = {
  id: "sepse_ssc_2024",
  version: "2024.1",
  label: "Sepse / Choque Séptico",
  entryNodeId: "entry",
  derive: deriveSepsis,
  nodes: {
    // ── 1. Reconhecimento (Sepsis-3) ───────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de sepse — reconhecimento (Sepsis-3)",
      summary: "Infecção + disfunção orgânica. Cada hora de atraso no ATB ↑ mortalidade ~7%.",
      actions: [
        "SEPSE (Sepsis-3): disfunção orgânica com risco de vida por resposta desregulada à infecção — critério prático SOFA agudo ≥ 2 (mortalidade > 10%).",
        "CHOQUE SÉPTICO: sepse + vasopressor para PAM ≥ 65 + lactato > 2 mmol/L apesar de volume adequado (mortalidade > 40%).",
        "qSOFA (triagem fora da UTI, 1 ponto cada): FR ≥ 22, alteração mental (GCS < 15), PAS ≤ 100. qSOFA ≥ 2 = alto risco → acionar avaliação completa (não substitui o SOFA).",
        "Monitor, oximetria, PA, 2 acessos venosos calibrosos; O₂ se SpO₂ < 94%.",
        "Acionar o protocolo institucional de sepse e marcar o TEMPO ZERO (início do pacote da 1ª hora).",
        "Exames: gasometria com lactato, HMG, função renal/hepática, eletrólitos, coagulograma, bilirrubinas (compõem o SOFA).",
        // ISOLAMENTO NO PRIMEIRO CONTATO — e por isso está no nó de entrada.
        //
        // Parecia conduta de internação (fora do escopo por PD-1) e não é:
        // decide-se ANTES de tocar o paciente, pela síndrome, sem esperar
        // cultura. É a única conduta deste fluxo que protege TERCEIROS.
        PRECAUCOES_REGRA,
        PRECAUCOES_GOTICULAS,
        PRECAUCOES_AEREO,
        PRECAUCOES_CONTATO,
        PRECAUCOES_NAO_FAZER,
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados iniciais",
      intro: "Toque nos valores (ou adicione). Definem hipoperfusão e a dose de volume.",
      fields: [
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "80", "90", "100", "110", "120"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "lactato",
          label: "Lactato",
          unit: "mmol/L",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["1", "2", "3", "4", "6", "8"].map((v) => ({ value: v, label: v })),
        },
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
      ],
      next: "culturas",
    },

    // ── 2. Culturas antes do antibiótico ───────────────────────────────────────
    culturas: {
      id: "culturas",
      type: "action",
      title: "Lactato + culturas ANTES do antibiótico",
      summary: "Não atrasar o ATB além de ~45 min para coletar hemocultura.",
      actions: [
        "Lactato sérico (venoso/arterial). > 2 = repetir em 2 h da coleta anterior (clearance ≥ 10%/2h). > 4 mmol/L = hipoperfusão grave → ressuscitar independentemente da PA.",
        "2 pares de hemoculturas (aeróbia + anaeróbia) de sítios diferentes, ≥ 10 mL/frasco, ANTES do antibiótico.",
        "SUSPEITA DE ENDOCARDITE (sopro novo, prótese valvar, usuário de droga injetável, embolia periférica, febre sem foco): os MESMOS 2 pares já bastam — o critério maior do Duke-ISCVID 2023 é micro-organismo típico em 2 ou mais AMOSTRAS SEPARADAS. A exigência de 3 pares com 30 min de intervalo foi RETIRADA na revisão de 2023; punção separada para cada amostra segue sendo boa prática, mas não é mais requisito. O que muda na suspeita de endocardite é o ECOCARDIOGRAMA precoce e a duração do tratamento, não o número de frascos.",
        "Culturas dirigidas ao foco: urina (EAS+urocultura), secreção respiratória, líquor, líquido peritoneal, ferida.",
        "Identificar o foco provável para guiar o esquema empírico (próximo passo).",
      ],
      next: "foco_atb",
    },

    // ── 3. Antibiótico empírico por FOCO (≤ 1 h) ───────────────────────────────
    foco_atb: {
      id: "foco_atb",
      type: "decision",
      title: "Antibiótico empírico — qual o foco provável?",
      question: "Selecione o foco infeccioso mais provável (define o esquema empírico).",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 8 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 8, tirar um não abre
      // nada — abaixaria para 7 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⏱ O RELÓGIO DO ANTIBIÓTICO JÁ ESTÁ CORRENDO: choque séptico ou sepse PROVÁVEL pedem antibiótico IMEDIATO, idealmente em até 1 hora. Sepse POSSÍVEL sem choque admite até 3 horas, depois de uma avaliação rápida que confirme a infecção.",
      evidence: [
        "Janela (SSC 2026): choque séptico OU sepse PROVÁVEL → antibiótico IMEDIATO, idealmente ≤ 1 h. Sepse POSSÍVEL sem choque → até 3 h, após avaliação rápida que confirme a infecção.",
        "Cobertura baseada no foco + flora local (CCIH) + risco de MDR.",
        "Vancomicina (se MRSA): ataque {vancoLoad} mg (25–30 mg/kg), manutenção 15–20 mg/kg 8–12h, alvo AUC/MIC 400–600.",
        "De-escalonar em 48–72 h conforme culturas. Sempre adaptar à epidemiologia local.",
        // ALERGIA A BETA-LACTÂMICO — dita AQUI, não nos nove nós de esquema.
        //
        // Os nove prescrevem beta-lactâmico e nenhum dizia o que fazer no
        // alérgico. Repetir a ressalva em cada um seria nove cópias divergindo
        // (R-12); pô-la no nó de escolha do foco a coloca no caminho de TODOS,
        // uma vez só, e ANTES de qualquer prescrição — que é quando a decisão
        // é tomada.
        ALERGIA_BL_ESTRATIFICAR,
        ALERGIA_BL_ALTERNATIVA,
        ALERGIA_BL_EXCECAO_CEFTAZIDIMA,
        ALERGIA_BL_REVISAO,
      ],
      options: [
        { id: "pac", label: "Pneumonia comunitária (PAC) grave", next: "atb_pac" },
        { id: "pav", label: "Pneumonia hospitalar / PAV", next: "atb_pav" },
        { id: "urosepse", label: "Urossepse / pielonefrite", next: "atb_urosepse" },
        { id: "abdominal", label: "Abdominal / peritonite", next: "atb_abdominal" },
        { id: "iptm", label: "Pele e partes moles", next: "atb_iptm" },
        { id: "meningite", label: "Meningite bacteriana", next: "atb_meningite" },
        { id: "cateter", label: "Cateter (CRBSI)", next: "atb_cateter" },
        { id: "neutropenia", label: "Neutropenia febril", next: "atb_neutropenia" },
        { id: "indeterminado", label: "Foco indeterminado", next: "atb_indeterminado" },
      ],
    },

    atb_pac: {
      id: "atb_pac",
      type: "action",
      title: "ATB — Pneumonia comunitária grave",
      summary: "Cobrir S. pneumoniae, Legionella, H. influenzae, atípicos.",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        "Ceftriaxona 1–2 g IV/24h + Azitromicina 500 mg IV/24h.",
        "Alternativa: Amoxicilina-clavulanato 2,2 g IV/8h + Azitromicina.",
        "Considerar cobertura de Pseudomonas/MRSA se fatores de risco (bronquiectasia, ATB recente, colonização).",
        "Iniciar em ≤ 1 h; não atrasar pela coleta de culturas.",
      ],
      next: "volume_check",
    },

    atb_pav: {
      id: "atb_pav",
      type: "action",
      title: "ATB — Pneumonia hospitalar / PAV",
      summary: "Cobrir P. aeruginosa, MRSA, Gram-negativos MDR.",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Piperacilina-tazobactam 4,5 g IV/6h (ou Meropenem 1–2 g IV/8h se risco de MDR).",
        "+ Vancomicina {vancoLoad} mg ataque (25–30 mg/kg) e manutenção (ou Linezolida 600 mg IV/12h) para MRSA.",
        "Ajustar à flora local (CCIH) e desescalonar em 48–72 h.",
      ],
      next: "volume_check",
    },

    atb_urosepse: {
      id: "atb_urosepse",
      type: "action",
      title: "ATB — Urossepse / pielonefrite grave",
      summary: "Cobrir E. coli (considerar ESBL), Klebsiella, Enterococcus.",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Ceftriaxona 1–2 g IV/24h (sem risco de ESBL).",
        "Ertapenem 1 g IV/24h (risco de ESBL) ou Piperacilina-tazobactam 4,5 g IV/6h.",
        "Avaliar obstrução (pielonefrite obstrutiva exige drenagem urgente — controle do foco).",
      ],
      next: "volume_check",
    },

    atb_abdominal: {
      id: "atb_abdominal",
      type: "action",
      title: "ATB — Infecção abdominal / peritonite",
      summary: "Cobrir Gram-negativos entéricos, anaeróbios, Enterococcus.",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Piperacilina-tazobactam 4,5 g IV/6h OU Meropenem 1 g IV/8h + Metronidazol 500 mg IV/8h (se carbapenem sem cobertura anaeróbia adequada).",
        "Ertapenem 1 g IV/24h em casos sem Pseudomonas/ambulatorial.",
        "Controle do foco precoce (drenagem/cirurgia) é essencial — não adiar.",
      ],
      next: "volume_check",
    },

    atb_iptm: {
      id: "atb_iptm",
      type: "action",
      title: "ATB — Pele e partes moles grave",
      summary: "Cobrir S. aureus (MRSA), Streptococcus, anaeróbios (fasciite).",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Vancomicina {vancoLoad} mg ataque (25–30 mg/kg) + Piperacilina-tazobactam 4,5 g IV/6h.",
        "Fasciite necrotizante: adicionar Clindamicina 900 mg IV/8h (inibe produção de toxina) + DESBRIDAMENTO cirúrgico de emergência.",
        "Suspeita de fasciite/gangrena → cirurgia imediata (mortalidade ↑ 9%/hora de atraso).",
      ],
      next: "volume_check",
    },

    atb_meningite: {
      id: "atb_meningite",
      type: "action",
      title: "ATB — Meningite bacteriana",
      summary: "Cobrir S. pneumoniae, N. meningitidis, Listeria (> 50 anos / imunossuprimido).",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        "Ceftriaxona 2 g IV/12h + Dexametasona 10 mg IV/6h × 4 dias (iniciar ANTES ou junto ao 1º ATB).",
        "A dexametasona no adulto é dose FIXA de 10 mg, não por quilo: a diretriz brasileira de meningite bacteriana aguda usa 10 mg de 6/6 h por 4 dias. A formulação internacional por peso (0,15 mg/kg) carrega teto de 10 mg/dose e satura em 67 kg — abaixo do peso adulto médio, ou seja, a maioria receberia o teto de qualquer forma e o cálculo só adicionaria oportunidade de erro.",
        "Adicionar Ampicilina 2 g IV/4h se > 50 anos ou imunocomprometido (Listeria).",
        "Não atrasar o ATB pela TC/punção lombar se sinais de gravidade.",
      ],
      next: "volume_check",
    },

    atb_cateter: {
      id: "atb_cateter",
      type: "action",
      title: "ATB — Bacteremia por cateter (CRBSI)",
      summary: "Cobrir S. aureus, SCN, Candida, Gram-negativos.",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Vancomicina {vancoLoad} mg ataque (25–30 mg/kg) + Cefepima 2 g IV/8h (se neutropênico ou MDR suspeito).",
        "+ Micafungina 100 mg IV/24h se candidemia suspeita.",
        "RETIRAR o cateter suspeito (obrigatória em S. aureus, Candida, BGN) — controle do foco.",
      ],
      next: "volume_check",
    },

    atb_neutropenia: {
      id: "atb_neutropenia",
      type: "action",
      title: "ATB — Neutropenia febril",
      summary: "Cobrir P. aeruginosa e Gram-negativos; antipseudomonas obrigatório.",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Cefepima 2 g IV/8h (monoterapia se sem MDR) OU Piperacilina-tazobactam 4,5 g IV/6h OU Meropenem 1 g IV/8h (risco MDR/Pseudomonas).",
        "+ Vancomicina {vancoLoad} mg ataque se cateter, mucosite ou instabilidade.",
        "Início imediato (< 1 h) — emergência oncológica.",
      ],
      next: "volume_check",
    },

    atb_indeterminado: {
      id: "atb_indeterminado",
      type: "action",
      title: "ATB — Foco indeterminado (sepse sem foco)",
      summary: "Cobertura ampla: Gram-negativos + Gram-positivos (MRSA).",
      actions: [
        ATB_PRIMEIRA_DOSE_NAO_AJUSTA,
        ATB_PONTEIRO_CALCULADORA,
        "Piperacilina-tazobactam 4,5 g IV/6h + Vancomicina {vancoLoad} mg ataque (25–30 mg/kg).",
        "Meropenem 1–2 g IV/8h + Vancomicina se MDR/hospitalar.",
        "Buscar ativamente o foco (imagem, exame físico seriado) e desescalonar conforme culturas.",
      ],
      next: "volume_check",
    },

    // ── 4. Ressuscitação volêmica ──────────────────────────────────────────────
    volume_check: {
      id: "volume_check",
      type: "decision",
      title: "Indicação de ressuscitação volêmica",
      question: "Há hipotensão (PAS < 90 / PAM < 65) OU lactato ≥ 4 mmol/L?",
      summary: "PAS informada: {pas} mmHg · lactato: {lactato} mmol/L.",
      evidence: [
        "Pelo menos 30 mL/kg de cristaloide nas primeiras 3 h na hipoperfusão induzida por sepse — em ALÍQUOTAS e com reavaliação após cada uma. Não é volume automático.",
        "Cristaloide BALANCEADO (Ringer lactato) preferido ao SF 0,9% (SMART/SALT-ED: menos LRA e acidose hiperclorêmica). NÃO usar gelatinas/amidos (HES).",
        "⚠️ EXCEÇÃO — traumatismo cranioencefálico associado: preferir solução salina 0,9% e EVITAR albumina. Soluções balanceadas são relativamente hipotônicas e podem agravar o edema cerebral.",
        "PESO para o cálculo: usar o peso corporal REAL. Em IMC > 30 kg/m², pode-se usar peso ajustado ou ideal — documentando qual descritor foi escolhido.",
        "SSC 2026: cristaloide isoladamente, em vez da associação rotineira com albumina. Albumina suplementar pode ser considerada após grandes volumes de cristaloide ou em situações selecionadas, como cirrose.",
        "Bolus de 500 mL com reavaliação dinâmica após cada um — não infundir tudo sem reavaliar.",
      ],
      options: [
        { id: "sim", label: "Sim — hipotensão ou lactato ≥ 4", next: "volume" },
        { id: "nao", label: "Não — sem hipoperfusão", next: "reaval_perfusao" },
      ],
    },

    volume: {
      id: "volume",
      type: "action",
      title: "Cristaloide 30 mL/kg — dose calculada",
      summary: "Bolus inicial nas primeiras 3 h, reavaliando a resposta a cada 500 mL.",
      actions: [
        "Cristaloide balanceado {fluidVol} mL (≈ {fluidVolL} L = 30 mL/kg) em bolus de 500 mL, reavaliando.",
        "Responsividade a fluidos (parâmetros DINÂMICOS, não PVC): VPP > 13% (VM sem arritmia), VVS > 10%, elevação passiva de pernas ↑ DC ≥ 10%, mini-fluido 100 mL ↑ VE ≥ 10%, VCI colapsável ao POCUS.",
        "PARAR fluidos quando: PAM ≥ 65, lactato em queda, diurese ≥ 0,5 mL/kg/h, perfusão melhorando OU sinais de sobrecarga (B-lines, SpO₂ ↓). Evitar balanço fortemente positivo > 10 L.",
        "Albumina 4–5%: considerar só se já recebeu > 3–4 L de cristaloide e ainda precisa de volume (não de rotina).",
        "Repetir o lactato em 2 h da coleta anterior (meta: clearance ≥ 10%/2h → normalizar < 2 mmol/L).",
      ],
      next: "reaval_pam",
    },

    reaval_pam: {
      id: "reaval_pam",
      type: "decision",
      title: "Reavaliação após volume",
      question: "Após a ressuscitação, a PAM permanece < 65 mmHg?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⚠️ NÃO ESPERE TERMINAR O VOLUME PARA COMEÇAR O VASOPRESSOR quando a hipotensão é grave — os dois correm em paralelo, e acesso periférico calibroso serve para começar.",
      evidence: [
        "Choque séptico = hipotensão que exige vasopressor para PAM ≥ 65 + lactato > 2 apesar de volume adequado.",
        "SSC 2026: alvo inicial de PAM 65 mmHg; em pacientes com ≥ 65 anos é aceitável mirar 60–65 mmHg.",
      ],
      options: [
        { id: "sim", label: "Sim — PAM < 65 (choque)", next: "vasopressor" },
        { id: "nao", label: "Não — PAM ≥ 65", next: "foco_check" },
      ],
    },

    // ── 5. Vasopressor / inotrópico / corticoide ───────────────────────────────
    vasopressor: {
      id: "vasopressor",
      type: "action",
      title: "Vasopressor — alvo PAM ≥ 65 mmHg",
      summary: "Noradrenalina é a 1ª linha (SOAP II). Preferir acesso central, mas não atrasar.",
      actions: [
        "NOREPINEFRINA IV em bomba, iniciar ≈ {noraStart} mcg/kg/min (0,05 mcg/kg/min) e titular para PAM ≥ 65 — em ≥ 65 anos aceita-se 60–65 (SSC 2026); 70–75 em hipertenso crônico. Preparo: solução de 16 mcg/mL do módulo Drogas Vasoativas.",
        // ⚠️ A RESSALVA É CONDICIONADA, e a segunda frase existe para impedir a
        // leitura de "tanto faz": a noradrenalina segue 1ª linha no choque
        // séptico em geral. A alternativa é específica da disfunção cardíaca.
        "⚠️ COM DISFUNÇÃO CARDÍACA CONCOMITANTE — e só nesse caso — a SSC 2026 sugere noradrenalina OU adrenalina como 1ª linha. Sem disfunção cardíaca, a 1ª linha é noradrenalina.",
        "2ª linha — " + VASOPRESSINA_DOSE,
        VASOPRESSINA_QUANDO_ASSOCIAR,
        VASOPRESSINA_APRESENTACAO,
        "3ª linha — " + ADRENALINA_CHOQUE_FAIXA,
        ADRENALINA_CHOQUE_LIMIARES,
        "DISFUNÇÃO MIOCÁRDICA séptica (baixo DC apesar de PAM ≥ 65: ScvO₂ < 70%, lactato persistente): considerar INOTRÓPICO — não de rotina.",
        DOBUTAMINA_INDICACAO_SEPSE_FRACA,
        // D-21: as DUAS opções, porque a diretriz dá as duas. O app oferecia só
        // a dobutamina com dose, e a adrenalina isolada aparecia apenas no
        // texto — quem lê executa o que tem número.
        "OPÇÃO A — dobutamina somada à noradrenalina:",
        DOBUTAMINA_INICIO,
        DOBUTAMINA_FAIXA_USUAL,
        DOBUTAMINA_ATE_20,
        "OPÇÃO B — adrenalina isolada, em pé de igualdade pela SSC 2026:",
        ADRENALINA_CHOQUE_FAIXA,
        "Considerar acesso central + cateter arterial para PA invasiva.",
      ],
      next: "via_aerea_ponteiro",
    },

    // R-33 — a Sepse é o módulo em que a via aérea entra com mais frequência, e
    // a delegação existente era de PLANTÃO (card universal "Estabilização
    // primeiro"), não de CONDUTA. Fecha o item menor da D-24.
    via_aerea_ponteiro: {
      id: "via_aerea_ponteiro",
      type: "action",
      title: "Se precisar intubar",
      summary: "A sepse é a causa clínica que mais leva à via aérea — e a indução muda com o choque.",
      actions: [
        "Doses de indução e bloqueio, escolha do hipnótico no choque, pré-oxigenação e checklist: módulo de ISR (Intubação em Sequência Rápida).",
        "⚠️ NÃO reduza a dose do BLOQUEADOR por causa do choque — reduzir bloqueio piora a laringoscopia. O que se reduz é o HIPNÓTICO.",
        "→ Abrir o módulo de ISR pelo menu de módulos. O fluxo da sepse continua: intubar não encerra o tratamento da sepse.",
      ],
      // ActionNode não aceita `targets` (é de TransitionNode) — o ponteiro fica
      // no texto, como nos demais nós de ação do app. A navegação por targets
      // exigiria transformar isto num nó de transição, o que encerraria o
      // fluxo da sepse no meio: o paciente que intuba CONTINUA em sepse.
      next: "corticoide_check",
    },

    corticoide_check: {
      id: "corticoide_check",
      type: "decision",
      title: "Corticoide no choque refratário",
      question: "Há necessidade PERSISTENTE de vasopressor após a ressuscitação inicial e a correção de causas reversíveis?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 5 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 5, tirar um não abre
      // nada — abaixaria para 4 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ NÃO EXISTE LIMIAR DE DOSE OU DE TEMPO DE VASOPRESSOR QUE AUTORIZE OU PROÍBA O CORTICOIDE. Noradrenalina ≥ 0,25 mcg/kg/min por ≥ 4 h é o critério dos ensaios e uma REFERÊNCIA DE PRÁTICA — não é portão, e não deve impedir a indicação em quem já tem necessidade persistente de vasopressor.",
      evidence: [
        "Corticoide NÃO é indicado em sepse sem choque.",
        "SSC 2026 (recomendação condicional, baixa certeza, a favor): corticoide IV no choque séptico. ⚠️ NÃO existe limiar universal de dose ou de duração do vasopressor para iniciar — o gatilho é a necessidade PERSISTENTE de vasopressor, não um número.",
        "NE ≥ 0,25 mcg/kg/min por ≥ 4 h é REFERÊNCIA DE PRÁTICA e o critério dos ensaios, útil como parâmetro — mas NÃO É PORTÃO, e não deve impedir a indicação em quem já tem necessidade persistente. A SSC 2021 condicionava a esse limiar; a SSC 2026 REMOVEU o gatilho de dose e de duração, e recomenda corticoide no choque séptico sem número de entrada.",
        "Hidrocortisona IV 200 mg/dia, em doses intermitentes (50 mg 6/6 h) OU infusão contínua, conforme o protocolo institucional. Não há superioridade estabelecida entre as duas formas.",
        "ADRENAL: reversão mais rápida do choque (sem ganho de mortalidade); APROCCHSS (hidrocortisona + fludrocortisona): redução de mortalidade.",
      ],
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "corticoide_guiado" },
        { id: "sim", label: "Sim — vasopressor persistente", next: "corticoide" },
        { id: "nao", label: "Não — choque revertido ou causa reversível corrigida", next: "foco_check" },
      ],
    },

    corticoide_guiado: {
      id: "corticoide_guiado",
      type: "action",
      title: "Como decidir sem inventar um corte de dose",
      summary: "A decisão é clínica: necessidade persistente de vasopressor após ressuscitação inicial e correção ativa das causas reversíveis — não um número universal de noradrenalina ou de horas.",
      actions: [
        "Confirme que a ressuscitação inicial foi realizada e que perfusão/pressão foram reavaliadas.",
        "Procure e corrija causas reversíveis de hipotensão persistente: hipovolemia/responsividade, sangramento, pneumotórax/tamponamento, disfunção de bomba, sedação excessiva e outras causas compatíveis com o caso.",
        "Se, apesar disso, o paciente CONTINUA dependente de vasopressor para sustentar perfusão/pressão, responda SIM. Se o vasopressor foi retirado ou a hipotensão se resolveu ao corrigir a causa, responda NÃO.",
        "Não transforme NE ≥ 0,25 mcg/kg/min por ≥ 4 h em portão obrigatório; neste módulo ele é apenas referência de prática/ensaios.",
      ],
      next: "corticoide_check",
    },

    corticoide: {
      id: "corticoide",
      type: "action",
      title: "Hidrocortisona — choque séptico refratário",
      summary: "Reduz o tempo de reversão do choque. Manter até desmame do vasopressor.",
      actions: [
        "Hidrocortisona 200 mg/dia IV — infusão contínua (200 mg em 50 mL SF a 2,1 mL/h) ou 50 mg IV/6h. Infusão contínua tem menos hiperglicemia/hipernatremia (ADRENAL).",
        HIDROCORTISONA_APRESENTACAO,
        "Considerar fludrocortisona 50 mcg/dia VO/SNE associada (APROCCHSS — redução de mortalidade).",
        "Manter até reversão do choque (desmame do vasopressor); desmame gradual em 2–3 dias.",
        "Monitorar glicemia e natremia. Contraindicações relativas: infecção fúngica invasiva não controlada, TB ativa disseminada.",
      ],
      next: "foco_check",
    },

    // ── 6. Controle do foco ────────────────────────────────────────────────────
    foco_check: {
      id: "foco_check",
      type: "decision",
      title: "Controle do foco infeccioso",
      question: "Há foco que exija controle (drenagem/cirurgia/retirada de dispositivo)?",
      evidence: [
        "Controle do foco é o 3º pilar (tão importante quanto ATB e ressuscitação). Atraso aumenta mortalidade.",
        "Focos: abscesso (< 12 h), peritonite por perfuração (< 6 h), fasciite necrotizante (emergência — 9%/h), colangite (CPRE < 24 h), empiema (dreno < 24 h), pionefrose (< 12 h), cateter/dispositivo infectado (< 24 h).",
      ],
      options: [
        { id: "sim", label: "Sim — foco que precisa de controle", next: "foco_acao" },
        { id: "nao", label: "Não / foco sem indicação de procedimento", next: "destino" },
      ],
    },

    foco_acao: {
      id: "foco_acao",
      type: "action",
      title: "Controle do foco — agir precocemente",
      summary: "Antibiótico não substitui a remoção da fonte. Realizar após estabilização mínima.",
      actions: [
        "Imagem dirigida (US/TC) para localizar e caracterizar o foco.",
        "Acionar a especialidade (cirurgia, urologia, radiologia intervencionista, gastro/CPRE) — drenagem/desbridamento/derivação conforme o foco.",
        "Remover dispositivos/cateteres suspeitos (obrigatório em S. aureus, Candida, BGN).",
        "Timing: abscesso < 12 h, peritonite < 6 h, fasciite imediata, colangite/empiema/cateter < 24 h.",
      ],
      next: "destino",
    },

    reaval_perfusao: {
      id: "reaval_perfusao",
      type: "action",
      title: "Reavaliação e monitorização",
      summary: "Sem hipoperfusão evidente — manter vigilância ativa.",
      actions: [
        "Manter monitorização contínua; reavaliar PA, FC, FR, diurese e nível de consciência.",
        "Repetir o lactato em 2 h da coleta anterior se o inicial estava alterado (clearance ≥ 10%/2h).",
        "Reavaliar a resposta ao antibiótico e a evolução do foco.",
        "Escalonar imediatamente se surgir hipotensão, lactato ascendente ou disfunção orgânica.",
      ],
      next: "destino",
    },

    // ── 7. Destino e suporte orgânico ──────────────────────────────────────────
    destino: {
      id: "destino",
      type: "transition",
      title: "UTI — suporte orgânico e reavaliação",
      summary: "Choque séptico e sepse com disfunção orgânica → cuidado intensivo.",
      disposition: "icu",
      exitCriteria: [
        "Internar em UTI se choque, necessidade de vasopressor ou disfunção orgânica significativa.",
        "Suporte orgânico (SSC 2021): glicemia 140–180; transfusão se Hb < 7 (8–9 em isquemia); VM protetora (VC 6 mL/kg, Pplat ≤ 30); profilaxia de TEV (HBPM) e de úlcera de estresse (IBP se VM ≥ 48 h/coagulopatia); nutrição enteral precoce (24–48 h); sedação leve RASS −1/−2; mobilização precoce.",
        "De-escalonamento do ATB em 48–72 h por culturas; duração 7–10 dias (5–7 se foco controlado); PCT para apoiar suspensão; TRS na LRA grau 3 com indicação clássica.",
        "Metas: PAM ≥ 65, clearance de lactato ≥ 10%/2h → < 2, diurese ≥ 0,5 mL/kg/h, temperatura < 38,3 °C.",
        "Critérios de alta da UTI: vasopressor suspenso ≥ 24 h, lactato normalizado, função orgânica em recuperação, ATB VO possível. Atenção à síndrome pós-UTI (PICS).",
      ],
      targets: [],
    },
  },
};
