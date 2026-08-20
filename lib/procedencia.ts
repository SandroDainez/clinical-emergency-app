import metadata from "../protocols/guidelines_metadata.json";

/**
 * PROCEDÊNCIA — os selos da página de assinatura, DERIVADOS da fonte única.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (medido em 2026-08-20) ───────────────────────
 *
 * A página de assinatura exibia seis selos escritos à mão — AHA 2020 · SSC 2021
 * · ESC 2021 · ADA 2022 · WAO 2021 · ARDSnet — sob a frase "baseados nas
 * principais diretrizes mundiais". Nenhum deles era conferido contra o conteúdo
 * real, e o resultado mentia nas DUAS direções:
 *
 *   · para MENOS — a bradicardia já usa AHA 2025, e o selo dizia 2020: a página
 *     subvendia trabalho que já estava feito;
 *   · para MAIS — "principais diretrizes mundiais" é promessa de venda que
 *     ninguém verificou.
 *
 * É o mesmo defeito do rodapé "KDIGO 2012" que acabou de sair do módulo renal,
 * agravado por estar numa tela de compra, sob o CRM do autor.
 *
 * ── POR QUE GERAR, E NÃO CORRIGIR À MÃO ────────────────────────────────────
 *
 * Selo corrigido à mão volta a mentir na próxima atualização de diretriz, e
 * ninguém percebe. Derivado de `guidelines_metadata.json` — a MESMA fonte que
 * alimenta os módulos — ele não pode divergir: quando a fonte de um módulo é
 * atualizada, a página se atualiza junto.
 *
 * ⚠️ E O SELO CARREGA A DATA DE REVISÃO, não só o ano da diretriz. É a
 * diferença entre "usamos a AHA 2025" e "usamos a AHA 2025, revista em
 * 05/2026" — a segunda é verificável e é o que o método deste projeto produz.
 */

/**
 * ⚠️ O CAMPO FOI PARTIDO EM DOIS (schema 2.0), E A RAZÃO É UM DEFEITO MEDIDO.
 *
 * `year` fazia dois trabalhos — "ano da publicação de fora" e "ano da nossa
 * síntese" — e o selo não tinha como saber qual dos dois estava mostrando. Na
 * prática ele acabava preenchido com a data de INGESTÃO: a fonte da hipoglicemia
 * entrou como 2026 sendo um documento de 2017, e só foi notado porque o selo
 * ficaria absurdo.
 *
 *   base   a publicação de FORA em que a fonte se apoia. É fato, não escolha.
 *          Lista quando são várias — e o selo mostra a MAIS RECENTE.
 *   nossa  quando NÓS escrevemos ou revisamos. Também é fato.
 *
 * ⚠️ `base[].ano: null` = NÃO DETERMINÁVEL PELO REGISTRO. O selo então não exibe
 * ano nenhum, e a fonte entra no relatório de dívida. Selo sem ano é honesto;
 * selo com ano errado, não — é a mesma regra do rodapé ausente ser melhor que o
 * rodapé mentiroso.
 */
type Base = { referencia: string; ano?: number | null };

type Diretriz = {
  id: string;
  name: string;
  base?: Base[];
  nossa?: { versao?: string | null; revisadoEm?: string | null };
  modules_using?: string[];
  url?: string;
  citation?: string;
};

const DIRETRIZES = (metadata as { guidelines: Diretriz[] }).guidelines;

export type Selo = {
  id: string;
  /** Sigla curta, o que cabe num chip. */
  sigla: string;
  /** Ano da publicação de FORA. Vazio quando não determinável pelo registro. */
  anoDaBase: string;
  /** Quando NÓS revisamos, em mm/aaaa. */
  revisto: string;
  /** Quantos módulos a usam — é o que ordena a lista. */
  modulos: number;
  /** Nome completo, para leitor de tela e para a lista longa. */
  nome: string;
};

/**
 * Siglas dos selos.
 *
 * ⚠️ ISTO É ROTULAGEM, NÃO CONTEÚDO: o `name` do metadata é longo demais para
 * um chip ("Surviving Sepsis Campaign (SSC) — Bundle e Guideline de Sepse"). A
 * sigla encurta o NOME; a versão e a data continuam vindo do metadata, e são
 * elas que podem mentir se forem escritas à mão. Um id sem sigla aqui aparece
 * pelo próprio id — falta de rótulo não pode virar selo invisível.
 */
const SIGLA: Record<string, string> = {
  aha_ecc_2025_destaques_ptbr: "AHA ECC",
  medcampus_acls_adultos_v13: "ACLS",
  medcampus_acls_guia_rapido_v1: "ACLS — guia rápido",
  aha_acls_2020: "AHA ACLS",
  ssc_sepsis_2021: "Surviving Sepsis",
  sepsis3_definitions_2016: "Sepsis-3",
  vasopressors_ssc_2021: "SSC — vasoativos",
  esc_hf_acute_decomp_2021: "ESC — IC aguda",
  ada_dka_hhs_2024: "ADA — CAD/EHH",
  wao_anaphylaxis_2020: "WAO — anafilaxia",
  ardsnet_protective_vent_2000: "ARDSNet",
  ards_ventilation_ardsnett: "ARDSNet — VM",
  difficult_airway_rsi_2022: "Via aérea difícil",
  electrolyte_disorders_core_2026: "Eletrólitos",
  padis_devlin_2018_abcdef: "PADIS",
  medcampus_avc_adultos_v14: "AVC",
  medcampus_sca_adultos_v10: "SCA",
  medcampus_tep_adultos_v13: "TEP",
  einstein_tep_v3: "TEP — Einstein",
  medcampus_arritmias_adultos_v10: "Arritmias",
  medcampus_sepse_choque_adultos_v14: "Sepse e choque",
  einstein_choque_adulto_2024: "Choque — Einstein",
  sbdcv_avc_fase_aguda: "AVC — fase aguda",
  einstein_vmi_adultos_2025: "VM — Einstein",
  einstein_hic_adultos_2024: "HIC — Einstein",
  einstein_tce_pathway: "TCE — Einstein",
  dir_uue_10_politrauma_2025: "Politrauma",
  mullhi_status_epilepticus_2025: "Estado de mal",
  einstein_intoxicacao_exogena_adulto: "Intoxicações",
  anvisa_microbiota_2021: "ANVISA — microbiota",
  bula_adenosina_fresenius_2023: "Bula — adenosina",
  sabiston_20ed: "Sabiston",
  usp_medicina_intensiva_5ed_2022: "USP — medicina intensiva",
  millers_anesthesia_review_2025: "Miller — anestesia",
  knaus_apache2_1985: "APACHE II",
  moreno_saps3_2005: "SAPS 3",
  idsa_antimicrobials: "IDSA — antimicrobianos",
  cdc_isolation_2007_update: "CDC — isolamento",
  sofa_score_original: "SOFA",
  einstein_msd_preeclampsia_2025: "Pré-eclâmpsia — Einstein",
  guia_obstetrico_preeclampsia_2025: "Pré-eclâmpsia — guia obstétrico",
  einstein_politica_sedacao_pol0360: "Sedação — Einstein",
  einstein_intoxicacao_metanol_2025: "Metanol — Einstein",
  kdigo_aki_2012: "KDIGO — injúria renal",
};

function mmAAAA(iso?: string): string {
  if (!iso || !/^\d{4}-\d{2}/.test(iso)) return "";
  const [ano, mes] = iso.split("-");
  return `${mes}/${ano}`;
}

/**
 * O ano da BASE que o selo mostra: o mais recente entre as publicações de fora.
 *
 * ⚠️ Devolve `undefined` quando nenhuma base tem ano — e é o caso de 13 das 45
 * fontes hoje. O selo então mostra só o nome e a data da nossa revisão.
 */
function anoDaBase(d: Diretriz): number | undefined {
  const anos = (d.base ?? []).map((b) => b.ano).filter((a): a is number => typeof a === "number");
  return anos.length ? Math.max(...anos) : undefined;
}

/**
 * Os selos, ordenados por quantos módulos a fonte sustenta.
 *
 * ⚠️ FONTE SEM MÓDULO NÃO VIRA SELO. Um selo é a promessa "isto sustenta o que
 * você vai usar"; fonte declarada que nenhum módulo consome não sustenta nada, e
 * exibi-la seria a mesma promessa vazia de antes, só que gerada.
 */
export function selosDeProcedencia(limite = 8): Selo[] {
  return DIRETRIZES.filter((d) => (d.modules_using?.length ?? 0) > 0)
    .map((d) => ({
      id: d.id,
      sigla: SIGLA[d.id] ?? d.id,
      anoDaBase: anoDaBase(d) ? String(anoDaBase(d)) : "",
      revisto: mmAAAA(d.nossa?.revisadoEm ?? undefined),
      modulos: d.modules_using?.length ?? 0,
      nome: d.name,
    }))
    .sort((a, b) => b.modulos - a.modulos || a.sigla.localeCompare(b.sigla))
    .slice(0, limite);
}

/** Números da procedência — o que a página afirma, medido e não estimado. */
export function resumoDeProcedencia(): {
  fontes: number;
  modulos: number;
  /** Fontes cujo ano da base não é determinável pelo registro — dívida. */
  semAnoDeBase: number;
  revisaoMaisAntiga: string;
  revisaoMaisRecente: string;
} {
  const comModulo = DIRETRIZES.filter((d) => (d.modules_using?.length ?? 0) > 0);
  const modulos = new Set(comModulo.flatMap((d) => d.modules_using ?? []));
  const datas = comModulo
    .map((d) => d.nossa?.revisadoEm ?? undefined)
    .filter((x): x is string => Boolean(x))
    .sort();
  return {
    fontes: comModulo.length,
    modulos: modulos.size,
    semAnoDeBase: comModulo.filter((d) => anoDaBase(d) === undefined).length,
    revisaoMaisAntiga: mmAAAA(datas[0]),
    revisaoMaisRecente: mmAAAA(datas[datas.length - 1]),
  };
}
