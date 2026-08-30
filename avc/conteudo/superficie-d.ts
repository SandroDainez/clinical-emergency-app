/**
 * CONTEÚDO DA SUPERFÍCIE D — Segurança para trombólise.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela.
 *
 * ── ⚠️⚠️ O QUE D É, E O QUE ELA ⛔ NÃO É ─────────────────────────────────────
 *
 * > *"D é proprietária da **interpretação** de segurança, ⛔ não dos fatos."*
 *
 * ⛔ D ⛔ **não redeclara** ⛔ nenhum fato de Paciente, Laboratório, A ou C. Os ~30
 * antecedentes que a Table 8 nomeia **já existem** em Paciente, em três blocos
 * recolhidos, com as janelas temporais **no rótulo da opção**. D os **lê**.
 *
 * ⚠️ Ela declara ⛔ **três** fatos próprios, e os três são **juízo**, ⛔ nunca
 * antecedente — ver `FATOS_PROPRIOS_D`.
 *
 * ── ⚠️⚠️ A REGRA QUE GOVERNA O ARQUIVO INTEIRO ──────────────────────────────
 *
 * > *"O ponto mais delicado continua sendo manter **verbo da fonte + estado
 * > derivado** sem transformar tudo num 'pode/⛔ não pode trombolisar'
 * > simplificado."* — autor, 2026-08-30
 *
 * ⛔⛔ **⛔ NÃO EXISTE ESTADO AGREGADO "CONTRAINDICADO"** neste módulo. Cada item
 * carrega **o verbo da própria fonte**, e a gradação dentro da faixa dita
 * "absoluta" é preservada literalmente: *should not be administered* ·
 * *likely contraindicated* · *potentially harmful* · *should be avoided*
 * (**E-45**).
 *
 * ⚠️⚠️ E a Table 8 **⛔ não tem COR/LOE em célula nenhuma**, e a própria legenda
 * declara a faixa mais restritiva *"unsupported by clinical evidence"*
 * (**E-48**). ⛔ Por isso ⛔ nenhum item daqui é "regra": todos são
 * **situação a considerar**, com o verbo dito.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { Campo, CampoDeclarado, Grupo, GrupoDeclarado } from "./campo";
import { camposDoGrupo, comCasa, NAO_SEI, SIM_NAO_INCERTO } from "./campo";

export type CampoD = CampoDeclarado;

/**
 * OS ESTADOS DERIVADOS DE SEGURANÇA — ⚠️ os **sete** que o autor fixou, mais um
 * oitavo que ⛔ **não é restrição**.
 *
 * ── ⚠️⚠️ ⛔ POR QUE EXISTE UM OITAVO, E POR QUE ELE ⛔ NÃO CONTRARIA OS SETE ────
 *
 * Os sete enumeram **restrições** e **estados epistêmicos**. Mas a **faixa 1** da
 * Table 8 existe, e nela a fonte **declara risco baixo**: *"risk of harm …
 * likely low"*, *"benefit likely outweighs risk"*, *"does not appear to have an
 * increased risk"*. ⛔ Chamar isso de `desconhecido` seria **falso**, e chamar de
 * `situacao_individualizada` seria **inventar cautela que a fonte ⛔ não pede**.
 *
 * ⚠️⚠️ **E O NOME IMPORTA** — o autor recusou `sem_restricao_declarada`:
 *
 * > *"'Sem restrição' soa mais forte do que a diretriz permite e pode ser lido
 * > como 'liberado'. `baixa_preocupacao_declarada` diz apenas o que sabemos: a
 * > fonte colocou aquele cenário no lado de **menor preocupação**."*
 *
 * ⚠️ A própria Table 8 se descreve como *"general gradient of risk"*, e a legenda
 * diz que a faixa favorável ⛔ **não** está ligada a recomendações acionáveis.
 * ⛔ Chamá-la de "sem restrição" promoveria gradiente a liberação.
 *
 * ⛔⛔ **O VERBO ESPECÍFICO DE CADA ITEM PREVALECE SOBRE O AGRUPAMENTO.** O estado
 * agrupa; o verbo decide.
 *
 * ⛔ Ele ⛔ **nunca** nasce de silêncio: item ⛔ não perguntado é `nao_perguntado`.
 */
export type EstadoDeSeguranca =
  | "contraindicacao_nao_corrigivel"
  | "bloqueio_corrigivel"
  | "risco_aumentado"
  | "informacao_insuficiente"
  | "situacao_individualizada"
  | "desconhecido"
  | "nao_perguntado"
  | "baixa_preocupacao_declarada";

/**
 * ⚠️⚠️ UM ITEM INTERPRETADO — e o **verbo é obrigatório**.
 *
 * ⛔ Um item sem verbo é um item achatado: ele diria "risco aumentado" onde a
 * fonte disse *"may be at increased risk of harm"*, e a diferença entre as duas
 * frases é a diferença entre uma regra e uma consideração.
 */
export type ItemDeSeguranca = {
  /** ⚠️ EXATAMENTE o rótulo da opção em Paciente — a derivação casa por ele. */
  readonly opcao: string;
  /** O campo de origem, na casa dele. ⛔ D ⛔ não o possui. */
  readonly campo: string;
  readonly fonte: string;
  /** A faixa da Table 8, ou `rec` quando há recomendação com COR/LOE. */
  readonly faixa: "1" | "2" | "3" | "rec";
  /** ⚠️ Fragmento **verbatim**, em inglês, como a fonte escreveu. */
  readonly verbo: string;
  readonly estado: EstadoDeSeguranca;
  /** ⚠️ A fonte manda decidir caso a caso — convive com `risco_aumentado`. */
  readonly individualizada?: true;
  /** ⚠️ A especialidade que a fonte nomeia. ⛔ ⛔ Não é pendência (E-49). */
  readonly consulta?: string;
  /** ⚠️ A fonte declara condição que **modifica o risco** — ⛔ raríssimo. */
  readonly corrigivel?: true;
  readonly nota?: string;
};

const F07 = "F-07";

/**
 * ⚠️⚠️ A FORMULAÇÃO CLÍNICA EM PORTUGUÊS — **derivada do verbo, e ⛔ nunca escrita
 * item a item**.
 *
 * ── ⛔ O DEFEITO DE UX QUE ISTO FECHA (autor, 2026-08-30) ────────────────────
 *
 * > *"Guardar o verbo original em inglês está corretíssimo para auditoria, mas
 * > eu ⛔ não usaria apenas o inglês como texto clínico principal da tela. Em
 * > emergência, o médico brasileiro ⛔ não deveria precisar traduzir
 * > `potentially harmful and should not be administered` sob pressão."*
 *
 * ⚠️⚠️ **⛔ POR QUE UM MAPA FECHADO, E ⛔ NÃO UM CAMPO POR ITEM.** Escrita item a
 * item, a tradução **deriva**: dois itens com o mesmo verbo ganhariam frases
 * diferentes, e uma delas ficaria mais forte que a outra sem ⛔ ninguém perceber.
 * Aqui o verbo é a **chave**: mesmo verbo, mesma frase, sempre — e a trava
 * confere a **bijeção**.
 *
 * ⛔⛔ **⛔ NENHUMA TRADUÇÃO PODE FORTALECER ⛔ NEM SUAVIZAR O VERBO.** Cada *hedge* do
 * inglês tem par obrigatório em português — *likely* → **provavelmente**,
 * *may* → **pode**, *is unknown* → **desconhecid**‑ — e a trava mede isso
 * *hedge* a *hedge*. ⛔ A tradução ⛔ **nunca substitui** a fonte: ela acompanha.
 */
export const FORMULACAO_PT: Readonly<Record<string, string>> = {
  "may increase the risk of symptomatic hemorrhage":
    "pode aumentar o risco de hemorragia sintomática",
  "may be at increased risk of intracranial hemorrhage … weighed … in an individualized manner":
    "pode haver risco aumentado de hemorragia intracraniana, a ser ponderado de forma individualizada",
  "risk of harm … likely low. Benefit likely outweighs risk … should be considered":
    "o risco de dano é provavelmente baixo, e o benefício provavelmente supera o risco; a fonte diz que deve ser considerado",
  "potentially harmful and should not be administered":
    "potencialmente danoso, e a fonte diz que não deve ser administrado",
  "likely contraindicated":
    "provavelmente contraindicado",
  "risk of harm … likely low … should be considered":
    "o risco de dano é provavelmente baixo; a fonte diz que deve ser considerado",
  "safety … is unknown":
    "a segurança é desconhecida",
  "reasonably safe within 4.5 h and probably recommended":
    "razoavelmente seguro dentro de 4,5 horas, e provavelmente recomendado",
  "should be considered as benefit likely outweighs risk":
    "deve ser considerado, porque o benefício provavelmente supera o risco",
  "does not appear to have an increased risk of ICH":
    "não parece haver risco aumentado de hemorragia intracraniana",
  "risk … is unknown and IV thrombolysis should be avoided":
    "o risco é desconhecido, e a fonte diz que a trombólise deve ser evitada",
  "should not be administered":
    "a fonte diz que não deve ser administrado",
  "risk of hemopericardium":
    "há risco de hemopericárdio",
  "probably has greater benefit than risk":
    "provavelmente tem mais benefício que risco",
  "may be reasonable in individual cases":
    "pode ser razoável em casos individuais",
  "probably has greater benefit than risk in most patients and should be considered":
    "provavelmente tem mais benefício que risco na maioria dos pacientes, e a fonte diz que deve ser considerado",
  "may be considered on an individual basis":
    "pode ser considerado caso a caso",
  "may be considered … Careful consideration … in consultation with neurosurgical and neurocritical care":
    "pode ser considerado, com avaliação cuidadosa e em conjunto com neurocirurgia e neurointensivismo",
  "may be at increased risk of harm":
    "pode haver risco aumentado de dano",
  "may be at increased risk of harm and serious systemic hemorrhage requiring transfusion":
    "pode haver risco aumentado de dano e de hemorragia sistêmica grave com necessidade de transfusão",
  "…may be candidates… Consideration … on an individual basis in conjunction with GI or GU consultation":
    "pode ser candidato, com consideração caso a caso junto da avaliação especializada",
  "may be considered in individual cases":
    "pode ser considerado em casos individuais",
};

/** ⚠️ A frase em português deste verbo. ⛔ Verbo sem par é erro, e a trava reprova. */
export function formulacaoDoVerbo(verbo: string): string | undefined {
  return FORMULACAO_PT[verbo];
}

/**
 * ⚠️ Os pares de *hedge* e as formas proibidas vivem na **trava**
 * (`scripts/prova-avc-superficie-d.cjs`): são **critério de medição**, e ⛔ não
 * conteúdo do app. Escritos aqui, o varredor de PT cobraria tradução para
 * vocabulário que ⛔ nunca chega à tela.
 */

/**
 * ⚠️⚠️ OS ANTECEDENTES INTRACRANIANOS — e as **duas armadilhas de par** que a
 * fonte esconde: `extra-axial × intra-axial` e `cervical × intracraniana` são
 * pares da **mesma família anatômica** em **faixas opostas** (**E-06**).
 */
export const ITENS_INTRACRANIANOS: readonly ItemDeSeguranca[] = [
  {
    opcao: "Hemorragia intracraniana prévia",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "2",
    verbo: "may increase the risk of symptomatic hemorrhage",
    estado: "risco_aumentado", individualizada: true,
    nota: "A fonte diferencia angiopatia amiloide, de risco maior, da hemorragia de causa modificável.",
  },
  {
    opcao: "AVC isquêmico nos últimos 3 meses",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "2",
    verbo: "may be at increased risk of intracranial hemorrhage … weighed … in an individualized manner",
    estado: "risco_aumentado", individualizada: true,
  },
  {
    opcao: "Neoplasia intracraniana extra-axial",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "1",
    verbo: "risk of harm … likely low. Benefit likely outweighs risk … should be considered",
    estado: "baixa_preocupacao_declarada",
  },
  {
    opcao: "Neoplasia intracraniana intra-axial",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "3",
    verbo: "potentially harmful and should not be administered",
    estado: "contraindicacao_nao_corrigivel",
  },
  {
    opcao: "Lesão medular aguda nos últimos 3 meses",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "3",
    verbo: "likely contraindicated",
    estado: "contraindicacao_nao_corrigivel",
  },
  {
    opcao: "Aneurisma intracraniano não roto",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "1",
    verbo: "risk of harm … likely low … should be considered",
    estado: "baixa_preocupacao_declarada",
  },
  {
    opcao: "Malformação vascular intracraniana não rota",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "2",
    verbo: "safety … is unknown",
    estado: "informacao_insuficiente",
  },
  {
    opcao: "Dissecção arterial cervical extracraniana",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "1",
    verbo: "reasonably safe within 4.5 h and probably recommended",
    estado: "baixa_preocupacao_declarada",
  },
  {
    opcao: "Dissecção arterial intracraniana",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "2",
    verbo: "safety … is unknown",
    estado: "informacao_insuficiente",
  },
  {
    opcao: "AVC durante procedimento angiográfico",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "1",
    verbo: "should be considered as benefit likely outweighs risk",
    estado: "baixa_preocupacao_declarada",
  },
  {
    opcao: "Doença de Moya-Moya",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "1",
    verbo: "does not appear to have an increased risk of ICH",
    estado: "baixa_preocupacao_declarada",
  },
  {
    opcao: "Imunoterapia amiloide ou ARIA",
    campo: "antecedentes_intracranianos", fonte: F07, faixa: "3",
    verbo: "risk … is unknown and IV thrombolysis should be avoided",
    estado: "contraindicacao_nao_corrigivel",
    nota: "A fonte declara desconhecimento e mesmo assim manda evitar. As duas coisas convivem na mesma frase.",
  },
];

export const ITENS_SISTEMICOS: readonly ItemDeSeguranca[] = [
  {
    opcao: "Endocardite infecciosa",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "3",
    verbo: "should not be administered",
    estado: "contraindicacao_nao_corrigivel",
  },
  {
    opcao: "Dissecção de arco aórtico",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "3",
    verbo: "potentially harmful and should not be administered",
    estado: "contraindicacao_nao_corrigivel",
  },
  {
    opcao: "Infarto com supradesnivelamento nos últimos 3 meses",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "2",
    verbo: "risk of hemopericardium",
    estado: "risco_aumentado", consulta: "Cardiologia",
    /**
     * ⚠️⚠️ A NOTA DE DOSE É DA FONTE, e ⛔ não conduta escrita aqui: ela diz que,
     * em AVC e STEMI concomitantes, a trombólise deve ser *"at a dose
     * appropriate for **cerebral ischemia**"*. ⛔ A dose em si mora na Reperfusão.
     */
    nota: "Em AVC e infarto com supradesnivelamento concomitantes, a fonte diz que a dose deve ser a apropriada para a isquemia cerebral.",
  },
  {
    opcao: "Infarto do miocárdio remoto",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "1",
    verbo: "probably has greater benefit than risk",
    estado: "baixa_preocupacao_declarada",
  },
  {
    opcao: "Pericardite aguda",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "2",
    verbo: "may be reasonable in individual cases",
    estado: "situacao_individualizada", consulta: "Cardiologia",
  },
  {
    opcao: "Trombo em átrio ou ventrículo esquerdo",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "2",
    verbo: "may be reasonable in individual cases",
    estado: "situacao_individualizada", consulta: "Cardiologia",
  },
  {
    opcao: "Neoplasia sistêmica ativa",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "2",
    verbo: "safety … is unknown",
    estado: "informacao_insuficiente", consulta: "Oncologia",
  },
  {
    opcao: "Uso de droga recreativa",
    campo: "antecedentes_cardio_sistemicos", fonte: F07, faixa: "1",
    verbo: "probably has greater benefit than risk in most patients and should be considered",
    estado: "baixa_preocupacao_declarada",
  },
];

/**
 * ⚠️⚠️ PROCEDIMENTOS — aqui vivem os pares de **E-06** em que a **janela** é o
 * que separa dois estados opostos do mesmo antecedente.
 */
export const ITENS_PROCEDIMENTOS: readonly ItemDeSeguranca[] = [
  {
    opcao: "Neurocirurgia nos últimos 14 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "3",
    verbo: "potentially harmful and should not be administered",
    estado: "contraindicacao_nao_corrigivel",
  },
  {
    opcao: "Neurocirurgia entre 14 dias e 3 meses",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "may be considered on an individual basis",
    estado: "situacao_individualizada", consulta: "Neurocirurgia",
  },
  {
    opcao: "Traumatismo craniano moderado a grave nos últimos 14 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "3",
    verbo: "likely contraindicated",
    estado: "contraindicacao_nao_corrigivel",
    nota: "A fonte qualifica: mais de 30 minutos de inconsciência e Glasgow abaixo de 13, ou hemorragia, contusão ou fratura de crânio na imagem.",
  },
  {
    opcao: "Traumatismo craniano moderado a grave entre 14 dias e 3 meses",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "may be considered … Careful consideration … in consultation with neurosurgical and neurocritical care",
    estado: "situacao_individualizada", consulta: "Neurocirurgia e neurointensivismo",
  },
  {
    opcao: "Cirurgia de grande porte fora do sistema nervoso nos últimos 10 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "may be at increased risk of harm",
    estado: "risco_aumentado", consulta: "Cirurgia",
  },
  {
    opcao: "Trauma de grande porte fora do sistema nervoso nos últimos 14 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "may be at increased risk of harm and serious systemic hemorrhage requiring transfusion",
    estado: "risco_aumentado", consulta: "Cirurgia",
  },
  {
    opcao: "Sangramento gastrointestinal ou geniturinário nos últimos 21 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "may be at increased risk of harm",
    estado: "risco_aumentado", consulta: "Gastroenterologia ou urologia",
    /**
     * ⚠️⚠️ O ÚNICO ITEM DA TABLE 8 COM CONDIÇÃO DE MODIFICAÇÃO DECLARADA:
     * *"if the GI/GU bleeding has been **treated and risk modified/reduced**"*.
     *
     * ⛔ E ⛔ isso ⛔ **não** é "corrigir um fato": é **estado do episódio** que muda
     * durante o atendimento. Ver `sangramento_tratado` em `FATOS_PROPRIOS_D`.
     */
    corrigivel: true,
  },
  {
    opcao: "Sangramento gastrointestinal ou geniturinário remoto e estável",
    campo: "procedimentos_recentes", fonte: F07, faixa: "1",
    verbo: "…may be candidates… Consideration … on an individual basis in conjunction with GI or GU consultation",
    estado: "situacao_individualizada", consulta: "Gastroenterologia ou urologia",
  },
  {
    opcao: "Punção arterial em vaso não compressível nos últimos 7 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "safety … is unknown",
    estado: "informacao_insuficiente",
  },
  {
    opcao: "Punção dural nos últimos 7 dias",
    campo: "procedimentos_recentes", fonte: F07, faixa: "2",
    verbo: "may be considered in individual cases",
    estado: "situacao_individualizada",
  },
];

/** ⚠️ O mapa inteiro, e a derivação ⛔ não conhece outro caminho. */
export const ITENS_DE_SEGURANCA: readonly ItemDeSeguranca[] = [
  ...ITENS_INTRACRANIANOS,
  ...ITENS_SISTEMICOS,
  ...ITENS_PROCEDIMENTOS,
];

/** ⚠️ Os campos de múltipla que D lê — todos com casa **Paciente**. */
export const CAMPOS_LIDOS_DE_PACIENTE: readonly string[] = [
  "antecedentes_intracranianos",
  "antecedentes_cardio_sistemicos",
  "procedimentos_recentes",
  "antiagregante_em_uso",
  "anticoagulante_em_uso",
  "doac_ultima_dose",
  "informacao_previa_cmb",
  "mrs_previo",
];

/** ⚠️ Do Laboratório — os quatro cortes da faixa absoluta, mais a unidade. */
export const CAMPOS_LIDOS_DO_LABORATORIO: readonly string[] = [
  "plaquetas", "plaquetas_unidade", "inr", "aptt", "tp",
];

/** ⚠️ De A — os dois bloqueios corrigíveis, ⛔ e nada mais. */
export const CAMPOS_LIDOS_DE_A: readonly string[] = ["glicemia", "pas", "pad"];

/** ⚠️ De C — ⛔ só o que governa a classe. */
export const CAMPOS_LIDOS_DE_C: readonly string[] = ["estudo_resultado", "hipodensidade_clara"];

/**
 * OS CORTES LABORATORIAIS — ⚠️ **faixa absoluta**, e a construção da frase
 * importa.
 *
 * > *"The safety and efficacy of IV thrombolysis for AIS in patients with
 * > platelets <100,000/mm³, INR>1.7, aPTT>40s, or PT>15s **is unknown though may
 * > substantially increase risk of harm and should not be administered**."*
 *
 * ⚠️⚠️ A fonte declara **desconhecimento** e mesmo assim **contraindica**. ⛔ Não
 * suavizar, e ⛔ não achatar: as duas metades da frase são ditas.
 */
export const CORTES_LABORATORIAIS = {
  plaquetas: { campo: "plaquetas", limite: 100_000, comparacao: "menor", unidade: "/mm³" },
  inr: { campo: "inr", limite: 1.7, comparacao: "maior", unidade: "" },
  aptt: { campo: "aptt", limite: 40, comparacao: "maior", unidade: "s" },
  tp: { campo: "tp", limite: 15, comparacao: "maior", unidade: "s" },
} as const;

export const VERBO_DOS_CORTES =
  "is unknown though may substantially increase risk of harm and should not be administered";

/**
 * OS TRÊS FATOS QUE D POSSUI — ⚠️ e os três são **juízo**, ⛔ nunca antecedente.
 *
 * > *"⛔ Não usaria 'Paciente' simplesmente para tudo que D ⛔ não possui. O
 * > critério semântico continua valendo."* — autor, 2026-08-30
 */
export const FATOS_PROPRIOS_D: readonly CampoD[] = [
  {
    id: "incerteza_diagnostica",
    temporalidade: "estado",
    /**
     * ⚠️⚠️ JUÍZO DO EPISÓDIO, e a casa é **D** por causa do leitor:
     *
     * > *"a pergunta 'isso pode ser stroke mimic?' ⛔ só ganha significado porque
     * > altera a leitura de segurança/reperfusão. Em B ela ficaria órfã de
     * > interpretação."*
     *
     * ⛔ E ⛔ não é antecedente: ⛔ não continuaria verdadeira sem este episódio.
     */
    rotulo: "Há incerteza diagnóstica ou suspeita de simulador de AVC",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    ajuda: "Registra a dúvida clínica sobre o diagnóstico. A fonte declara risco baixo de dano com a trombólise nesta situação.",
    fonte: F07,
    bloqueiaTerapia: false,
    nota: "A fonte diz que, salvo contraindicações absolutas, o risco de dano com a trombólise é baixo na incerteza diagnóstica.",
  },
  {
    id: "motivo_para_suspeitar_alteracao_coagulacao",
    temporalidade: "estado",
    /**
     * ⚠️⚠️ O GATILHO DA REC. 10 — **COR 2a · B-NR**, e é **julgamento**:
     *
     * > *"it is reasonable that IVT **not be delayed** while waiting for
     * > hematologic or coagulation testing **if there is no reason to suspect an
     * > abnormal result**"*
     *
     * ⚠️ É este juízo — e ⛔ não a existência do exame — que decide se o
     * coagulograma pendente vira pendência. ⛔ Sem ele, o app cobraria exame em
     * todo paciente, que é exatamente o atraso que a recomendação proíbe.
     */
    rotulo: "Há razão para suspeitar de coagulação alterada",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    ajuda: "A fonte diz para não atrasar a trombólise esperando exames de coagulação quando não há razão para suspeitar de resultado anormal.",
    fonte: "F-10",
    bloqueiaTerapia: false,
  },
  {
    id: "sangramento_tratado",
    temporalidade: "estado",
    /**
     * ⚠️⚠️ **ESTADO DO EPISÓDIO**, e ⛔ jamais antecedente estável:
     *
     * > *"fatos que mudam durante o atendimento, como 'sangramento tratado e
     * > risco reduzido', precisam ser estado do episódio ou ação, ⛔ não um
     * > antecedente estável de Paciente."*
     *
     * ⚠️ É o único item da Table 8 com condição de modificação **declarada**:
     * *"if the GI/GU bleeding has been treated and risk modified/reduced"*.
     */
    rotulo: "O sangramento foi tratado e o risco foi reduzido",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    ajuda: "A fonte cita esta condição para o sangramento gastrointestinal ou geniturinário recente.",
    fonte: F07,
    bloqueiaTerapia: false,
  },
];

/**
 * AS CONSULTAS — ⚠️ **ação e registro de D**, e ⛔ **nunca pendência** (E-49).
 *
 * ⚠️ A fonte nomeia a especialidade dentro de itens específicos. Registrar que
 * ela foi acionada é útil; **cobrá-la** transformaria uma consideração em
 * tarefa que retém terapia tempo-dependente.
 */
export const CONSULTAS_D: readonly CampoD[] = [
  {
    id: "consultas_acionadas",
    temporalidade: "estado",
    rotulo: "Consultas especializadas acionadas",
    tipo: "multipla",
    opcoes: [
      "Cirurgia",
      "Gastroenterologia ou urologia",
      "Cardiologia",
      "Oncologia",
      "Neurocirurgia",
      "Neurocirurgia e neurointensivismo",
      "Nenhuma",
      NAO_SEI,
    ],
    exclusivas: ["Nenhuma", NAO_SEI],
    ajuda: "Registro do que foi acionado. Nada no atendimento espera por uma consulta.",
    fonte: F07,
    bloqueiaTerapia: false,
  },
];

const GRUPOS_D_DECLARADOS: readonly GrupoDeclarado[] = [
  {
    id: "juizo",
    titulo: "Juízo de segurança",
    campos: FATOS_PROPRIOS_D,
    nota: "A fonte não traz classe de recomendação em nenhuma célula da tabela de contraindicações, e declara a faixa mais restritiva como não sustentada por evidência clínica. Cada item é apresentado com o verbo da própria fonte.",
  },
  { id: "consultas", titulo: "Consultas especializadas", campos: CONSULTAS_D, recolhido: true },
];

export const GRUPOS_D: readonly Grupo[] = comCasa("seguranca", GRUPOS_D_DECLARADOS);

export const TODOS_OS_CAMPOS_D: readonly Campo[] = GRUPOS_D.flatMap((g) => [...g.campos]);
export const CAMPOS_NA_TELA_D: readonly Campo[] = GRUPOS_D.flatMap((g) => [...camposDoGrupo(g)]);

export function campoDeD(id: string): Campo {
  const c = TODOS_OS_CAMPOS_D.find((x) => x.id === id);
  if (!c) throw new Error(`Campo de D inexistente: ${id}`);
  return c;
}

export const SAIDA_SEM_CONCLUSAO_D: Readonly<Record<string, string>> = {
  incerteza_diagnostica: "Incerto",
  motivo_para_suspeitar_alteracao_coagulacao: "Incerto",
  sangramento_tratado: "Incerto",
  consultas_acionadas: NAO_SEI,
};

export const SUPERFICIE_D: SuperficieId = "seguranca";
