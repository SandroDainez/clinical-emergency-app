import type { Antimicrobiano, DoseEstruturada, LinhaRenal, ModalidadeDeTRS, ProcedenciaDeFaixa } from "./tipos";

/**
 * O CATÁLOGO — hoje com os TRÊS que já existiam, migrados sem mudar um número.
 *
 * ⚠️ NENHUMA DOSE FOI ESCRITA NESTA MIGRAÇÃO. Cada faixa abaixo é a transcrição
 * literal do que o motor já calculava (`clinical-calculators-engine.ts`,
 * ferramenta `dose-antibiotico`), incluindo as fronteiras: onde o código dizia
 * `tfg > 50 ? A : tfg >= 25 ? B`, a faixa de baixo termina COM o 50 e a de cima
 * começa SEM ele. O teste de fronteira prova valor por valor.
 *
 * ⚠️ E NENHUMA PROCEDÊNCIA FOI INVENTADA. A ferramenta declarava UMA referência
 * para os dez cortes — "ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI
 * 2022" — e nada dizia qual sustentava qual. Migrar não descobre a fonte: cada
 * faixa entra com `forca: "pendente"` e a pendência escrita. É o estado honesto,
 * e é o que o portão da AM-7 cobra antes de qualquer fármaco novo.
 */

/** A pendência que TODA faixa migrada carrega, escrita uma vez. */
const PENDENTE_DA_MIGRACAO: ProcedenciaDeFaixa = {
  fonte: "⚠️ SEM FONTE NO NÍVEL DA FAIXA — a ferramenta declarava «ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022» para os dez cortes juntos",
  forca: "pendente",
  pendencia:
    "Abrir a bula/prescribing information do fármaco, seção de ajuste renal, e declarar a fonte DESTA faixa — com seção e ano. ⚠️ Referência terciária (UpToDate, Sanford, Micromedex) entra como `pratica_aceita` com nome do produto e data de consulta, NUNCA como recomendação formal.",
};

/**
 * ⚠️ O MÉTODO DA TFG ESTÁ DECLARADO NO REPOSITÓRIO, e por isso não é suposição:
 * o campo de entrada da ferramenta diz «ClCr ABSOLUTO (mL/min) — não a TFG
 * indexada», e o texto de ajuda (`CLCR_PARA_DOSE`) explica que a absoluta é a que
 * os estudos de ajuste de dose usaram. Logo: Cockcroft-Gault.
 */
const METODO = "cockcroft_gault" as const;

/**
 * O primeiro `forca: "recomendacao_formal"` do catálogo — e ele veio do LABEL,
 * lido no DailyMed, não de fonte terciária. Verbatim em
 * `protocols/fontes-verbatim/meropenem-label-dailymed.md`.
 */
/**
 * ⚠️ A VANCOMICINA É O CASO EM QUE A BULA **NÃO** É A VERDADE ATUAL.
 *
 * O label PLR não tem tabela por ClCr: ele manda dose inicial ≥ 15 mg/kg em
 * qualquer grau de disfunção e ajuste por NÍVEL. A escada por faixa que o app usa
 * não está lá — e isso não a torna errada: dose guiada por função renal com alvo
 * de nível é **prática consolidada**. O que estaria errado é declarar bula onde a
 * bula não fala.
 */
const CONSENSO_VANCO_2020: ProcedenciaDeFaixa = {
  fonte: "Rybak MJ et al. — consenso ASHP/IDSA/PIDS/SIDP 2020, Am J Health Syst Pharm 2020;77(11):835–864",
  forca: "pratica_aceita",
};

/**
 * ⚠️ O NÚMERO CONCRETO DO MEROPENÉM É NOSSO, NÃO DO LABEL. O label diz "one-half
 * recommended dose", e a dose recomendada dele depende da indicação (500 mg em
 * cSSSI, 1 g em intra-abdominal). O app usa 1 g como referência — que é a dose
 * usual do serviço —, e por isso "500 mg" é METADE DE 1 g: aritmética nossa
 * sobre a fração da fonte, declarada como tal.
 */
/** A camada de paciente crítico — afirmação separada, força separada (regra B). */
const PRATICA_CRITICO: ProcedenciaDeFaixa = {
  fonte: "Prática em paciente crítico — dose estendida e infusão prolongada; NÃO consta da tabela de ajuste renal do label",
  forca: "pratica_aceita",
};

const LABEL_CEFTRIAXONA: ProcedenciaDeFaixa = {
  fonte: "Ceftriaxone for injection — US prescribing information. DailyMed setids 5cd2d96f-83e5-4326-ae87-d0ede4ba493a (PLR) e 365fc265-8e6c-432f-9fda-911f5f7fb451 (clássico), lidos em 2026-08-22",
  forca: "recomendacao_formal",
};

const LABEL_CEFAZOLINA: ProcedenciaDeFaixa = {
  fonte: "Cefazolin — US prescribing information. DailyMed setids 18e7366a-1b3e-4010-8f4a-dd559d4f2146 (clássico) e d91a8d13-99a0-4d87-88dc-71cbd37922b4 (PLR), lidos em 2026-08-22",
  forca: "recomendacao_formal",
};

/** O que o label NÃO tem, com o alvo nomeado — nunca preenchido de memória. */
const SEM_FONTE_PROFILAXIA: ProcedenciaDeFaixa = {
  fonte: "⚠️ NÃO ESTÁ NO LABEL — nenhum dos cinco setids lidos traz este número",
  forca: "pendente",
  pendencia:
    "ALVO NOMEADO: diretriz de profilaxia antimicrobiana cirúrgica (ASHP/IDSA/SIS/SHEA), que o autor decide se adota — outra fonte, outra força. NÃO preencher de memória: é exatamente aqui que a tentação é máxima, porque todo mundo sabe de cor.",
};

const LABEL_CEFEPIMA: ProcedenciaDeFaixa = {
  fonte: "Cefepime for injection — US prescribing information, Tabela 2 (ajuste renal no adulto). DailyMed setids 5fd857e5-591f-44ca-80cf-fd903660b03c (PLR) e 1eb8794e-2502-43cc-8a32-dcba78031f15 (clássico), lidos em 2026-08-22",
  forca: "recomendacao_formal",
};

const LABEL_CEFTAZIDIMA: ProcedenciaDeFaixa = {
  fonte: "Ceftazidime for injection — US prescribing information, Tabelas 3 e 4. DailyMed setids 78982c98-7866-49f1-989f-a289c4242358 (FORTAZ) e 112c5457-8d71-49f5-b531-9761d7d38c93 (Sagent), lidos em 2026-08-23",
  forca: "recomendacao_formal",
};

/**
 * ⚠️ O BURACO ESTÁ NA PRÓPRIA TABELA DO LABEL: entre "15 to 6" e "less than 5",
 * o valor 5 a 5,9 não pertence a faixa nenhuma. Este app cobre a reta inteira, e
 * a escolha se apoia na NOTA do próprio label — "a dose MENOR deve ser usada".
 */
const ARREDONDAMENTO_CEFTAZIDIMA: ProcedenciaDeFaixa = {
  fonte: "Operacionalização NOSSA: a tabela do label é em números inteiros e deixa 5 a 5,9 sem faixa. Seguimos a faixa de MENOR exposição, apoiados na NOTA do label ('the lower dose should be used')",
  forca: "pratica_aceita",
};

const METADE_DE_1G: ProcedenciaDeFaixa = {
  fonte: "Operacionalização NOSSA: metade da dose recomendada, adotando 1 g como dose de referência (dose usual do app)",
  forca: "pratica_aceita",
};

const LABEL_PIPTAZO: ProcedenciaDeFaixa = {
  fonte: "Piperacillin and Tazobactam for Injection, USP — US prescribing information, Tabela 1 (coluna «todas as indicações exceto pneumonia nosocomial»). DailyMed setid 39e19789-de4b-4fd1-ab1c-92f59496f496, lido em 2026-08-22",
  forca: "recomendacao_formal",
};

const LABEL_MEROPENEM: ProcedenciaDeFaixa = {
  fonte: "Meropenem for injection (I.V.) — US prescribing information, Tabela 1 (ajuste renal no adulto). DailyMed setid 092ebd9b-77a0-4877-afc3-dd8211730f71, lido em 2026-08-22",
  forca: "recomendacao_formal",
  pendencia: undefined,
};

/**
 * ⚠️ A LINHA DE MODALIDADE SEM DADO — declarada, nunca silenciosa.
 *
 * Antes da refatoração de 2026-08-22 a diálise era um campo à parte (`dialise{}`)
 * e **não herdava nada**: nem a trava de fronteira, nem os eixos, nem a
 * obrigatoriedade de fonte por linha. Agora é LINHA do eixo renal — entra na
 * varredura, exige fonte, e a ausência é um CAMPO com a razão escrita.
 */
const SEM_DADOS = (modalidade: ModalidadeDeTRS, razao: string): LinhaRenal => ({
  modalidade,
  semDados: razao,
  metodoDaTFG: "sem_dados",
  procedencia: {
    fonte: "⚠️ AUSÊNCIA DECLARADA — a fonte lida não traz dose para esta modalidade",
    forca: "pendente",
    pendencia: razao,
  },
});

/** ⚠️ CRRT é UM valor, com nota — ver `ModalidadeDeTRS`. */
const RAZAO_CRRT =
  "⚠️ CRRT É UM VALOR SÓ, COM NOTA: as doses diferem entre CVVH, CVVHD e CVVHDF, e os labels quase nunca distinguem — fingir a distinção sem fonte seria pior que não tê-la. A fonte lida não traz dose para TRS contínua.";

export const CATALOGO_DE_ANTIMICROBIANOS: Antimicrobiano[] = [
  {
    id: "vancomicina",
    nome: "Vancomicina",
    classe: "Glicopeptídeo",
    doseUsual: {
      via: "IV",
      procedencia: PENDENTE_DA_MIGRACAO,
    },
    // ⚠️ O ATAQUE DA VANCOMICINA NÃO SE AJUSTA POR FUNÇÃO RENAL — ele depende do
    // volume de distribuição, não da eliminação. E ele é CALCULADO: a fórmula
    // tem uma dona só no repositório, compartilhada com a sepse.
    doseDeAtaque: [
      {
        dose: "25–30 mg/kg pelo peso REAL (máx 3 g)",
        quando: "sempre, em qualquer grau de disfunção renal — o label diz que a dose inicial não deve ser menor que 15 mg/kg em nenhum grau",
        calculo: "ataque_glicopeptideo_peso_real",
        procedencia: CONSENSO_VANCO_2020,
      },
    ],
    ajusteRenal: "ajusta",
    // ⚠️ `pratica_aceita`, NÃO recomendação formal de bula — e o contexto diz por
    // quê: o consenso 2020 recomenda ALVO (AUC/MIC 400–600) e abandonou o vale
    // isolado; a escada por faixa de clearance é OPERACIONALIZAÇÃO, não texto do
    // documento. Verbatim: `protocols/fontes-verbatim/vancomicina-consenso-2020.md`.
    linhas: [
      { de: 0, ate: 20, dose: "10–15 mg/kg", intervalo: "48/48h ou por nível", valor: { tipo: "absoluta", min: 10, max: 15, unidade: "mg", porQuilo: true }, intervaloHoras: { horas: 48 }, metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      { de: 20, ate: 40, dose: "10–15 mg/kg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 10, max: 15, unidade: "mg", porQuilo: true }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      { de: 40, ate: 60, dose: "10–15 mg/kg", intervalo: "12/12h", valor: { tipo: "absoluta", min: 10, max: 15, unidade: "mg", porQuilo: true }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      // ⚠️ O 90 PERTENCE A ESTA FAIXA: o código dizia `tfg > 90 ? … : tfg >= 60 ? …`.
      { de: 60, ate: 90, ateInclusivo: true, dose: "15–20 mg/kg", intervalo: "12/12h", valor: { tipo: "absoluta", min: 15, max: 20, unidade: "mg", porQuilo: true }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      { de: 90, ate: null, deInclusivo: false, dose: "15–20 mg/kg", intervalo: "8/8h", valor: { tipo: "absoluta", min: 15, max: 20, unidade: "mg", porQuilo: true }, intervaloHoras: { horas: 8 }, metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      // ⚠️ AS DUAS AFIRMAÇÕES DE HD, e a conduta NÃO foi rebaixada para o label:
      // ele diz "poorly removed by dialysis", frase da era das membranas de baixa
      // permeabilidade; o consenso 2020 diz o oposto, com a razão, e recomenda
      // dose A CADA sessão. O número não foi trocado — D-77.
      {
        modalidade: "HD",
        dose: "15–20 mg/kg",
        intervalo: "após a sessão",
        valor: { tipo: "absoluta", min: 15, max: 20, unidade: "mg", porQuilo: true },
        metodoDaTFG: "sem_dados",
        procedencia: CONSENSO_VANCO_2020,
        notaDeFaixa: { texto: "Dosar nível PRÉ-diálise. ⚠️ O consenso 2020 tabela 25 mg/kg de ataque e 10 mg/kg de manutenção (após o fim da sessão, dialisador de alta permeabilidade) — ver D-77.", procedencia: CONSENSO_VANCO_2020 },
      },
      SEM_DADOS("DP", "O consenso 2020 lido não traz dose para diálise peritoneal."),
      SEM_DADOS("CRRT", RAZAO_CRRT),
      SEM_DADOS("SLED", "O consenso 2020 traz recomendação para terapias híbridas (15 mg/kg após o fim), ainda NÃO transcrita para este catálogo — pendência nomeada, não ausência."),
    ],
    fonteDoFarmaco: PENDENTE_DA_MIGRACAO,
    observacoes: [
      { texto: "Alvo AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Vale 15–20 mcg/mL se AUC indisponível.", procedencia: PENDENTE_DA_MIGRACAO },
      { texto: "Diluir 1 g em ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome do homem vermelho.", procedencia: PENDENTE_DA_MIGRACAO },
      { texto: "Dosar nível pré-diálise.", procedencia: PENDENTE_DA_MIGRACAO },
    ],
  },
  {
    id: "piperacilina-tazobactam",
    nome: "Piperacilina-tazobactam",
    classe: "Beta-lactâmico + inibidor de beta-lactamase",
    doseUsual: { via: "IV", procedencia: LABEL_PIPTAZO },
    // ⚠️ A INDICAÇÃO NÃO É PARÂMETRO, É DECISÃO. A Tabela 1 do label tem DUAS
    // colunas — "todas as indicações exceto pneumonia nosocomial" e "pneumonia
    // nosocomial" —, e o app usava a segunda para todo mundo. As faixas abaixo
    // são a coluna de OUTRAS INDICAÇÕES; a de pneumonia vive em `observacoes`
    // até o catálogo ganhar eixo de indicação (D-78).
    //
    // ⚠️ E A LINHA "4,5 g 8/8h" EM 20–40 NÃO EXISTE NO LABEL — procurada no
    // documento inteiro, em coluna nenhuma, sem seção de infusão prolongada. Ela
    // saiu; não foi substituída por adivinhação.
    ajusteRenal: "ajusta",
    linhas: [],
    // ⚠️ AS DUAS COLUNAS DO LABEL, COMO DADO — e não mais uma escolhida e a outra
    // em nota de rodapé. Fecha a D-78: a tela já perguntava a indicação, e o
    // catálogo agora sabe que ela existe.
    eixo: {
      tipo: "indicacao",
      pergunta: "Qual é a indicação?",
      naoSei: "Não sei — ver as duas colunas do label",
      valores: [
      {
        id: "outras",
        rotulo: "Outras indicações",
        linhas: [
          { de: 0, ate: 20, dose: "2,25 g", intervalo: "8/8h", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, intervaloHoras: { horas: 8 }, metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 20, ate: 40, ateInclusivo: true, dose: "2,25 g", intervalo: "6/6h", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, intervaloHoras: { horas: 6 }, metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 40, ate: null, deInclusivo: false, dose: "3,375 g", intervalo: "6/6h", valor: { tipo: "absoluta", min: 3.375, unidade: "g" }, intervaloHoras: { horas: 6 }, metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          // ⚠️ A HEMODIÁLISE TAMBÉM É POR INDICAÇÃO — e antes da refatoração ela
          // vivia fora do eixo, num campo único, com UMA dose para as duas colunas.
          { modalidade: "HD", dose: "2,25 g", intervalo: "12/12h + 0,75 g após cada sessão", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, metodoDaTFG: "sem_dados", procedencia: LABEL_PIPTAZO,
            notaDeFaixa: { texto: "A hemodiálise remove 30% a 40% da dose — daí os 0,75 g após cada sessão.", procedencia: LABEL_PIPTAZO } },
          { modalidade: "DP", dose: "2,25 g", intervalo: "12/12h", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, intervaloHoras: { horas: 12 }, metodoDaTFG: "sem_dados", procedencia: LABEL_PIPTAZO,
            notaDeFaixa: { texto: "CAPD: sem dose adicional.", procedencia: LABEL_PIPTAZO } },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      {
        id: "pneumonia",
        rotulo: "Pneumonia nosocomial",
        linhas: [
          { de: 0, ate: 20, dose: "2,25 g", intervalo: "6/6h", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, intervaloHoras: { horas: 6 }, metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 20, ate: 40, ateInclusivo: true, dose: "3,375 g", intervalo: "6/6h", valor: { tipo: "absoluta", min: 3.375, unidade: "g" }, intervaloHoras: { horas: 6 }, metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 40, ate: null, deInclusivo: false, dose: "4,5 g", intervalo: "6/6h", valor: { tipo: "absoluta", min: 4.5, unidade: "g" }, intervaloHoras: { horas: 6 }, metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { modalidade: "HD", dose: "2,25 g", intervalo: "8/8h + 0,75 g após cada sessão", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, metodoDaTFG: "sem_dados", procedencia: LABEL_PIPTAZO,
            notaDeFaixa: { texto: "A hemodiálise remove 30% a 40% da dose — daí os 0,75 g após cada sessão.", procedencia: LABEL_PIPTAZO } },
          { modalidade: "DP", dose: "2,25 g", intervalo: "8/8h", valor: { tipo: "absoluta", min: 2.25, unidade: "g" }, intervaloHoras: { horas: 8 }, metodoDaTFG: "sem_dados", procedencia: LABEL_PIPTAZO,
            notaDeFaixa: { texto: "CAPD: sem dose adicional.", procedencia: LABEL_PIPTAZO } },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      ],
    },
    fonteDoFarmaco: LABEL_PIPTAZO,
    observacoes: [
      { texto: "PNEUMONIA NOSOCOMIAL é a outra coluna do label: 4,5 g 6/6h acima de 40 · 3,375 g 6/6h entre 20 e 40 · 2,25 g 6/6h abaixo de 20 · hemodiálise 2,25 g 8/8h.", procedencia: LABEL_PIPTAZO },
      { texto: "A hemodiálise remove 30% a 40% da dose administrada — daí os 0,75 g após cada sessão.", procedencia: LABEL_PIPTAZO },
      { texto: "Infusão estendida de 4 h em Pseudomonas: é PRÁTICA (maximiza tempo acima da CIM). O label descreve infusão de 30 minutos e não tem seção de infusão prolongada.", procedencia: PENDENTE_DA_MIGRACAO },
    ],
  },
  {
    id: "meropenem",
    nome: "Meropeném",
    classe: "Carbapenêmico",
    doseUsual: { via: "IV", procedencia: LABEL_MEROPENEM },
    // ⚠️ D-79 FECHADA PELA ESTRUTURA, NÃO À MÃO. A tabela renal do label diz
    // "one-half recommended dose" — e "recommended dose" é um REFERENTE, que
    // depende da indicação: 500 mg em pele e partes moles, 1 g em intra-abdominal.
    // O catálogo fixava 1 g, e a metade saía 500 mg: certo na intra-abdominal e
    // ERRADO na de pele, onde seria 250 mg — o dobro do label, num carbapenêmico
    // neurotóxico, em quem tem ClCr baixo.
    //
    // ⚠️ O ERRO NÃO ESTAVA NA FRONTEIRA, ESTAVA NO REFERENTE. Agora a fração é
    // dado (`fracaoDaBase: 0.5`) e a base vem do EIXO — que é exatamente como o
    // label a escreveu.
    ajusteRenal: "ajusta",
    linhas: [],
    eixo: {
      tipo: "indicacao",
      pergunta: "Qual é a indicação? (é ela que define a dose de referência)",
      naoSei: "Não sei — ver as três. O label dá 500 mg 8/8h em pele e partes moles, 1 g 8/8h em intra-abdominal complicada, e 1 g 8/8h quando a infecção de pele é por Pseudomonas aeruginosa. Meningite, neste label, é indicação PEDIÁTRICA.",
      valores: [
        {
          id: "pele",
          rotulo: "Pele e partes moles",
          base: { tipo: "absoluta", min: 500, unidade: "mg" },
          linhas: [
          { de: 0, ate: 10, dose: "METADE da dose recomendada", intervalo: "24/24h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 10, ate: 25, ateInclusivo: true, dose: "METADE da dose recomendada", intervalo: "12/12h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 25, ate: 50, deInclusivo: false, ateInclusivo: true, dose: "dose recomendada", intervalo: "12/12h", valor: { tipo: "igualABase" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 50, ate: null, deInclusivo: false, dose: "dose recomendada", intervalo: "8/8h", valor: { tipo: "igualABase" }, intervaloHoras: { horas: 8 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
      // ⚠️ AS DUAS FRASES DO LABEL, AGORA COMO LINHAS DO MESMO EIXO. "Informação
      // inadequada" é ausência de dose recomendada — NÃO é "não precisa ajustar";
      // e "prontamente dialisável" é farmacocinética, que muda a conversa sem dar
      // dose. Antes viviam num campo à parte, sem trava.
      {
        modalidade: "HD",
        semDados: "⚠️ O LABEL DIZ, TEXTUALMENTE, QUE A INFORMAÇÃO É INADEQUADA para hemodiálise e diálise peritoneal. Isto NÃO é \"não precisa ajustar\": é ausência de dose recomendada, declarada pela própria bula.",
        metodoDaTFG: "sem_dados",
        procedencia: LABEL_MEROPENEM,
        notaDeFaixa: { texto: "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem) — mas o label NÃO diz qual dose dar após a sessão.", procedencia: LABEL_MEROPENEM },
      },
      {
        modalidade: "DP",
        semDados: "⚠️ O label declara informação INADEQUADA também para diálise peritoneal.",
        metodoDaTFG: "sem_dados",
        procedencia: LABEL_MEROPENEM,
      },
      SEM_DADOS("CRRT", RAZAO_CRRT),
      SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
        },
        {
          id: "pele-pseudomonas",
          rotulo: "Pele — Pseudomonas aeruginosa",
          base: { tipo: "absoluta", min: 1, unidade: "g" },
          linhas: [
          { de: 0, ate: 10, dose: "METADE da dose recomendada", intervalo: "24/24h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 10, ate: 25, ateInclusivo: true, dose: "METADE da dose recomendada", intervalo: "12/12h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 25, ate: 50, deInclusivo: false, ateInclusivo: true, dose: "dose recomendada", intervalo: "12/12h", valor: { tipo: "igualABase" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 50, ate: null, deInclusivo: false, dose: "dose recomendada", intervalo: "8/8h", valor: { tipo: "igualABase" }, intervaloHoras: { horas: 8 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
      // ⚠️ AS DUAS FRASES DO LABEL, AGORA COMO LINHAS DO MESMO EIXO. "Informação
      // inadequada" é ausência de dose recomendada — NÃO é "não precisa ajustar";
      // e "prontamente dialisável" é farmacocinética, que muda a conversa sem dar
      // dose. Antes viviam num campo à parte, sem trava.
      {
        modalidade: "HD",
        semDados: "⚠️ O LABEL DIZ, TEXTUALMENTE, QUE A INFORMAÇÃO É INADEQUADA para hemodiálise e diálise peritoneal. Isto NÃO é \"não precisa ajustar\": é ausência de dose recomendada, declarada pela própria bula.",
        metodoDaTFG: "sem_dados",
        procedencia: LABEL_MEROPENEM,
        notaDeFaixa: { texto: "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem) — mas o label NÃO diz qual dose dar após a sessão.", procedencia: LABEL_MEROPENEM },
      },
      {
        modalidade: "DP",
        semDados: "⚠️ O label declara informação INADEQUADA também para diálise peritoneal.",
        metodoDaTFG: "sem_dados",
        procedencia: LABEL_MEROPENEM,
      },
      SEM_DADOS("CRRT", RAZAO_CRRT),
      SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
        },
        {
          id: "intra-abdominal",
          rotulo: "Intra-abdominal complicada",
          base: { tipo: "absoluta", min: 1, unidade: "g" },
          linhas: [
          { de: 0, ate: 10, dose: "METADE da dose recomendada", intervalo: "24/24h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 10, ate: 25, ateInclusivo: true, dose: "METADE da dose recomendada", intervalo: "12/12h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 25, ate: 50, deInclusivo: false, ateInclusivo: true, dose: "dose recomendada", intervalo: "12/12h", valor: { tipo: "igualABase" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
          { de: 50, ate: null, deInclusivo: false, dose: "dose recomendada", intervalo: "8/8h", valor: { tipo: "igualABase" }, intervaloHoras: { horas: 8 }, metodoDaTFG: METODO, procedencia: LABEL_MEROPENEM },
      // ⚠️ AS DUAS FRASES DO LABEL, AGORA COMO LINHAS DO MESMO EIXO. "Informação
      // inadequada" é ausência de dose recomendada — NÃO é "não precisa ajustar";
      // e "prontamente dialisável" é farmacocinética, que muda a conversa sem dar
      // dose. Antes viviam num campo à parte, sem trava.
      {
        modalidade: "HD",
        semDados: "⚠️ O LABEL DIZ, TEXTUALMENTE, QUE A INFORMAÇÃO É INADEQUADA para hemodiálise e diálise peritoneal. Isto NÃO é \"não precisa ajustar\": é ausência de dose recomendada, declarada pela própria bula.",
        metodoDaTFG: "sem_dados",
        procedencia: LABEL_MEROPENEM,
        notaDeFaixa: { texto: "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem) — mas o label NÃO diz qual dose dar após a sessão.", procedencia: LABEL_MEROPENEM },
      },
      {
        modalidade: "DP",
        semDados: "⚠️ O label declara informação INADEQUADA também para diálise peritoneal.",
        metodoDaTFG: "sem_dados",
        procedencia: LABEL_MEROPENEM,
      },
      SEM_DADOS("CRRT", RAZAO_CRRT),
      SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
        },
      ],
    },
    fonteDoFarmaco: LABEL_MEROPENEM,
    observacoes: [
      { texto: "⚠️ A DOSE DE REFERÊNCIA DEPENDE DA INDICAÇÃO: 500 mg 8/8h em pele e partes moles · 1 g 8/8h em intra-abdominal complicada · 1 g 8/8h se a infecção de pele for por Pseudomonas aeruginosa. A tabela renal do label reduz À METADE dessa base — não de um valor fixo.", procedencia: LABEL_MEROPENEM },
      { texto: "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem do label) — mas o label NÃO diz qual dose dar após a sessão.", procedencia: LABEL_MEROPENEM },
      { texto: "MDR: 2 g em 100 mL SF → infundir em 3 h.", procedencia: PENDENTE_DA_MIGRACAO },
      { texto: "Meningite bacteriana, neste label, é indicação PEDIÁTRICA (3 meses ou mais) — não adulta.", procedencia: LABEL_MEROPENEM },
    ],
  },
  {
    id: "cefepima",
    nome: "Cefepima",
    classe: "Cefalosporina de 4ª geração",
    doseUsual: {
      via: "IV em ~30 min (IM só em ITU leve por E. coli)",
      procedencia: LABEL_CEFEPIMA,
    },
    // ⚠️ A TABELA DO LABEL É MATRICIAL, E A LINHA DE ENTRADA É O ESQUEMA BASAL —
    // não a indicação, não o peso. As quatro colunas da Tabela 2 são os esquemas
    // que se usaria com função normal, e o rodapé que diz isso ("[a] Normal
    // recommended dosing schedule") está SÓ NO LABEL CLÁSSICO.
    //
    // ⚠️ SEM ESSE RODAPÉ, a matriz vira quatro colunas sem nome — e alguém
    // escolheria uma, provavelmente a do meio, com a dose saindo errada e com
    // aparência de tabela oficial. Tabela sem legenda não é tabela.
    ajusteRenal: "ajusta",
    linhas: [],
    eixo: {
      tipo: "esquema_habitual",
      pergunta: "Qual esquema você usaria com função renal NORMAL?",
      naoSei: "Não sei — escolher pela INDICAÇÃO (o label dá o esquema por tipo de infecção): pneumonia 1–2 g 8/8h–12/12h · neutropenia febril 2 g 8/8h · ITU leve/moderada 0,5–1 g 12/12h · ITU grave, pele ou intra-abdominal 2 g 12/12h · Pseudomonas 2 g 8/8h. Sem saber a indicação, veja as quatro colunas lado a lado.",
      valores: [
      {
        id: "e500",
        rotulo: "500 mg 12/12h",
        linhas: [
          { de: 0, ate: 11, dose: "250 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 250, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 11, ate: 29, ateInclusivo: true, dose: "500 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 29, ate: 60, deInclusivo: false, ateInclusivo: true, dose: "500 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 60, ate: null, deInclusivo: false, dose: "500 mg", intervalo: "12/12h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "Acima de 60 mL/min é o esquema NORMAL — a dose inicial não se ajusta; só a manutenção.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "HD", dose: "1 g no dia 1, depois 500 mg", intervalo: "após a sessão, no mesmo horário todo dia", valor: { tipo: "textoLivre" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "A hemodiálise de 3 h remove ~68% do que estava no corpo no início da sessão. ⚠️ Aqui a dose INICIAL também muda — é a única situação em que ela muda.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "DP", dose: "500 mg", intervalo: "48/48h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 48 }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "CAPD é LINHA da mesma tabela do label, ao lado de 30–60 e 11–29.", procedencia: LABEL_CEFEPIMA } },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      {
        id: "e1g12",
        rotulo: "1 g 12/12h",
        linhas: [
          { de: 0, ate: 11, dose: "250 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 250, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 11, ate: 29, ateInclusivo: true, dose: "500 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 29, ate: 60, deInclusivo: false, ateInclusivo: true, dose: "1 g", intervalo: "24/24h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 60, ate: null, deInclusivo: false, dose: "1 g", intervalo: "12/12h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "Acima de 60 mL/min é o esquema NORMAL — a dose inicial não se ajusta; só a manutenção.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "HD", dose: "1 g no dia 1, depois 500 mg", intervalo: "após a sessão, no mesmo horário todo dia", valor: { tipo: "textoLivre" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "A hemodiálise de 3 h remove ~68% do que estava no corpo no início da sessão. ⚠️ Aqui a dose INICIAL também muda — é a única situação em que ela muda.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "DP", dose: "1 g", intervalo: "48/48h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 48 }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "CAPD é LINHA da mesma tabela do label, ao lado de 30–60 e 11–29.", procedencia: LABEL_CEFEPIMA } },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      {
        id: "e2g12",
        rotulo: "2 g 12/12h",
        linhas: [
          { de: 0, ate: 11, dose: "500 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 11, ate: 29, ateInclusivo: true, dose: "1 g", intervalo: "24/24h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 29, ate: 60, deInclusivo: false, ateInclusivo: true, dose: "2 g", intervalo: "24/24h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 60, ate: null, deInclusivo: false, dose: "2 g", intervalo: "12/12h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "Acima de 60 mL/min é o esquema NORMAL — a dose inicial não se ajusta; só a manutenção.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "HD", dose: "1 g no dia 1, depois 500 mg", intervalo: "após a sessão, no mesmo horário todo dia", valor: { tipo: "textoLivre" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "A hemodiálise de 3 h remove ~68% do que estava no corpo no início da sessão. ⚠️ Aqui a dose INICIAL também muda — é a única situação em que ela muda.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "DP", dose: "2 g", intervalo: "48/48h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 48 }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "CAPD é LINHA da mesma tabela do label, ao lado de 30–60 e 11–29.", procedencia: LABEL_CEFEPIMA } },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      {
        id: "e2g8",
        rotulo: "2 g 8/8h",
        linhas: [
          { de: 0, ate: 11, dose: "1 g", intervalo: "24/24h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 11, ate: 29, ateInclusivo: true, dose: "2 g", intervalo: "24/24h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 29, ate: 60, deInclusivo: false, ateInclusivo: true, dose: "2 g", intervalo: "12/12h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA },
          { de: 60, ate: null, deInclusivo: false, dose: "2 g", intervalo: "8/8h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 8 }, metodoDaTFG: METODO, procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "Acima de 60 mL/min é o esquema NORMAL — a dose inicial não se ajusta; só a manutenção.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "HD", dose: "1 g", intervalo: "após a sessão, no mesmo horário todo dia", valor: { tipo: "absoluta", min: 1, unidade: "g" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "A hemodiálise de 3 h remove ~68% do que estava no corpo no início da sessão. ⚠️ Aqui a dose INICIAL também muda — é a única situação em que ela muda.", procedencia: LABEL_CEFEPIMA } },
          { modalidade: "DP", dose: "2 g", intervalo: "48/48h", valor: { tipo: "absoluta", min: 2, unidade: "g" }, intervaloHoras: { horas: 48 }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFEPIMA,
            notaDeFaixa: { texto: "CAPD é LINHA da mesma tabela do label, ao lado de 30–60 e 11–29.", procedencia: LABEL_CEFEPIMA } },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      ],
    },
    fonteDoFarmaco: LABEL_CEFEPIMA,
    observacoes: [
      { texto: "⚠️ A DOSE INICIAL NÃO SE AJUSTA por função renal — só a manutenção. A ÚNICA exceção é a hemodiálise.", procedencia: LABEL_CEFEPIMA },
      { texto: "O label indica a equação de Cockcroft-Gault para estimar o clearance — é a fonte que diz qual usar.", procedencia: LABEL_CEFEPIMA },
      { texto: "Hemodiálise: 1 g no dia 1, depois 500 mg 24/24h para todas as infecções, EXCETO neutropenia febril, que é 1 g 24/24h. Dar sempre APÓS a sessão, no mesmo horário todo dia.", procedencia: LABEL_CEFEPIMA },
      { texto: "⚠️ NEUROTOXICIDADE — suspeite diante de confusão, mioclonia, AFASIA, alucinação, estupor, rebaixamento, crise convulsiva ou estado de mal NÃO CONVULSIVO em paciente com disfunção renal, sobretudo se a dose não foi ajustada. REAVALIE A DROGA: os dois labels divergem entre SUSPENDER (PLR) e CONSIDERAR suspender ou ajustar (clássico). O quadro costuma melhorar após a suspensão e/ou hemodiálise.", procedencia: LABEL_CEFEPIMA },
      { texto: "A maioria dos casos de neurotoxicidade ocorreu em disfunção renal SEM ajuste apropriado — mas há casos COM ajuste apropriado. Ajustar não isenta de vigiar.", procedencia: LABEL_CEFEPIMA },
      { texto: "\"Afasia\" aparece na lista do label PLR e não na do clássico. A lista deste app é a UNIÃO das duas: sinal a mais é vigilância, não erro.", procedencia: LABEL_CEFEPIMA },
      { texto: "Para Pseudomonas aeruginosa, o label manda 2 g IV 8/8h.", procedencia: LABEL_CEFEPIMA },
    ],
  },
  {
    id: "ceftazidima",
    nome: "Ceftazidima",
    classe: "Cefalosporina de 3ª geração (antipseudomonas)",
    doseUsual: {
      via: "IV ou IM",
      procedencia: LABEL_CEFTAZIDIMA,
    },
    // ⚠️ A DOSE DE ATAQUE É EXPLÍCITA NESTE LABEL — e o campo não existia. Ela
    // não desce com o clearance: depende do volume de distribuição.
    doseDeAtaque: [
      { dose: "1 g", quando: "na SUSPEITA de insuficiência renal, antes de estimar a TFG — o label diz \"may be given\"", procedencia: LABEL_CEFTAZIDIMA },
      { dose: "1 g", quando: "em hemodiálise — aqui o label diz \"is recommended\", e a diferença de redação é da fonte", procedencia: LABEL_CEFTAZIDIMA },
      { dose: "1 g", quando: "em diálise peritoneal/CAPD — \"may be given\"", procedencia: LABEL_CEFTAZIDIMA },
    ],
    // ⚠️ ESCADA SIMPLES, NÃO MATRIZ. A gravidade não é coluna: o label a trata em
    // PROSA ("pode aumentar a dose unitária em 50%"), e transformar isso em eixo
    // seria inventar estrutura que a fonte não deu.
    ajusteRenal: "ajusta",
    linhas: [
      { de: 0, ate: 6, dose: "500 mg", intervalo: "48/48h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 48 }, metodoDaTFG: METODO, procedencia: ARREDONDAMENTO_CEFTAZIDIMA,
        notaDeFaixa: { texto: "⚠️ O label diz \"menos de 5\" para 500 mg 48/48h e \"15 a 6\" para 500 mg 24/24h — 5 a 5,9 fica sem faixa NA FONTE. Aqui segue a de MENOR exposição, apoiado na NOTA do label de que a dose menor deve ser usada.", procedencia: ARREDONDAMENTO_CEFTAZIDIMA } },
      { de: 6, ate: 15, ateInclusivo: true, dose: "500 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFTAZIDIMA },
      { de: 15, ate: 30, deInclusivo: false, ateInclusivo: true, dose: "1 g", intervalo: "24/24h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFTAZIDIMA },
      { de: 30, ate: 50, deInclusivo: false, ateInclusivo: true, dose: "1 g", intervalo: "12/12h", valor: { tipo: "absoluta", min: 1, unidade: "g" }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFTAZIDIMA },
      { de: 50, ate: null, deInclusivo: false, dose: "dose da Tabela 3, pela indicação", intervalo: "8/8h a 12/12h", valor: { tipo: "textoLivre" }, intervaloHoras: { min: 8, max: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFTAZIDIMA,
        notaDeFaixa: { texto: "Acima de 50 mL/min não há redução: vale a dose por indicação (1 g usual · 2 g nas graves · 250 mg em ITU não complicada).", procedencia: LABEL_CEFTAZIDIMA } },
      { modalidade: "HD", dose: "1 g", intervalo: "após CADA sessão de hemodiálise", valor: { tipo: "absoluta", min: 1, unidade: "g" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFTAZIDIMA,
        notaDeFaixa: { texto: "Precedida de ataque de 1 g — e aqui o label diz \"is recommended\", não \"may be given\".", procedencia: LABEL_CEFTAZIDIMA } },
      { modalidade: "DP", dose: "500 mg", intervalo: "24/24h", valor: { tipo: "absoluta", min: 500, unidade: "mg" }, intervaloHoras: { horas: 24 }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFTAZIDIMA,
        notaDeFaixa: { texto: "Precedida de ataque de 1 g. Além da via IV, o label permite incorporar 250 mg a cada 2 L do líquido de diálise.", procedencia: LABEL_CEFTAZIDIMA } },
      { modalidade: "CRRT", semDados: "⚠️ TRS CONTÍNUA NÃO EXISTE NESTE LABEL: as palavras hemofiltration, arteriovenous, venovenous, CAVH, CVVH, CAVHD e CVVHD não aparecem em NENHUM dos nove setids varridos. Ausência conferida, não presumida — e é por isso que a nota genérica de CRRT continua valendo aqui.", metodoDaTFG: "sem_dados", procedencia: LABEL_CEFTAZIDIMA },
      SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
    ],
    fonteDoFarmaco: LABEL_CEFTAZIDIMA,
    observacoes: [
      { texto: "⚠️ DOSE POR INDICAÇÃO (Tabela 3 do label), AINDA NÃO ESTRUTURADA NESTE CATÁLOGO: 1 g (usual) · 2 g (meningite, intra-abdominal grave, osso e articulação, infecção muito grave) · 500 mg (ITU complicada, pneumonia não complicada, pele leve) · 250 mg (ITU não complicada). Enquanto não houver eixo de indicação aqui, a faixa acima de 50 mL/min defere a esta lista — e é por isso que ela aparece como texto, com o achado dito.", procedencia: LABEL_CEFTAZIDIMA },
      { texto: "⚠️ A NOTA DO LABEL, EM CAIXA ALTA: se a dose da tabela por indicação for MENOR que a da tabela renal, use A MENOR.", procedencia: LABEL_CEFTAZIDIMA },
      { texto: "Infecção grave que receberia 6 g/dia se o rim fosse normal: o label permite AUMENTAR a dose unitária em 50% ou encurtar o intervalo — e depois guiar por monitorização, gravidade e sensibilidade.", procedencia: LABEL_CEFTAZIDIMA },
      { texto: "⚠️ NEUROTOXICIDADE — níveis elevados em insuficiência renal levam a crise convulsiva, ESTADO DE MAL NÃO CONVULSIVO, encefalopatia, coma, ASTERIXIS, excitabilidade neuromuscular e mioclonia. Os relatos são em pacientes renais tratados com esquema NÃO AJUSTADO. A dose diária total deve ser reduzida na insuficiência renal.", procedencia: LABEL_CEFTAZIDIMA },
      { texto: "⚠️ ESTE LABEL NÃO AFIRMA que o quadro neurológico seja reversível — ao contrário do da cefepima. A frase da superdosagem fala em remover A DROGA por diálise, não em reverter o quadro. A ausência fica declarada, não preenchida com o texto do outro fármaco.", procedencia: LABEL_CEFTAZIDIMA },
      { texto: "O label indica a equação de Cockcroft para estimar o clearance.", procedencia: LABEL_CEFTAZIDIMA },
      { texto: "Não existe linha genérica de Pseudomonas fora da fibrose cística: a cobertura em dose alta cai na linha das infecções muito graves (2 g 8/8h).", procedencia: LABEL_CEFTAZIDIMA },
    ],
  },
  {
    id: "cefazolina",
    nome: "Cefazolina",
    classe: "Cefalosporina de 1ª geração",
    // ⚠️ A BASE DE REFERÊNCIA, DECLARADA: "metade da dose usual" precisa de
    // metade DE QUÊ. Sem este campo, a fração fica sem referente — que foi o
    // buraco que produziu a D-79 no meropeném.
    base: { tipo: "absoluta", min: 500, max: 1000, unidade: "mg" },
    doseUsual: {
      via: "IV ou IM",
      procedencia: LABEL_CEFAZOLINA,
    },
    // ⚠️ O EIXO DE INDICAÇÃO COUBE. O de PESO NÃO EXISTIA — e a profilaxia
    // precisa dele: o label dá 1–2 g abaixo de 120 kg e 3 g de 120 kg para cima.
    // Escrever isso dentro do campo `dose` seria gambiarra: o número viraria
    // prosa e nenhuma trava conferiria fronteira. O eixo foi criado.
    ajusteRenal: "ajusta",
    linhas: [],
    eixo: {
      tipo: "indicacao",
      pergunta: "É tratamento ou profilaxia cirúrgica?",
      naoSei: "Não sei — ver as duas, com o que muda em cada uma",
      valores: [
      {
        id: "tratamento",
        rotulo: "Tratamento",
        linhas: [
          { de: 0, ate: 10, ateInclusivo: true, dose: "METADE da dose usual", intervalo: "18/18h a 24/24h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { min: 18, max: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "⚠️ Toda redução vale APÓS uma dose de ataque apropriada à gravidade da infecção — a frase está só no label clássico.", procedencia: LABEL_CEFAZOLINA } },
          { de: 10, ate: 35, deInclusivo: false, dose: "METADE da dose usual", intervalo: "12/12h", valor: { tipo: "fracaoDaBase", fracao: 0.5 }, intervaloHoras: { horas: 12 }, metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "⚠️ Toda redução vale APÓS uma dose de ataque apropriada à gravidade da infecção.", procedencia: LABEL_CEFAZOLINA } },
          { de: 35, ate: 55, dose: "dose usual INTEIRA", intervalo: "8/8h ou mais espaçado", valor: { tipo: "igualABase" }, intervaloHoras: { min: 8, max: 24 }, metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA },
          { de: 55, ate: null, dose: "dose usual INTEIRA", intervalo: "6/6h a 8/8h", valor: { tipo: "igualABase" }, intervaloHoras: { min: 6, max: 8 }, metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA },
          SEM_DADOS("HD", "⚠️ A palavra \"hemodialysis\" NÃO APARECE em nenhum dos CINCO setids de cefazolina lidos no DailyMed. Ausência conferida, não presumida."),
          { modalidade: "DP", semDados: "O label traz diálise PERITONEAL apenas como farmacocinética (níveis séricos com solução de 50 e 150 mg/L), não como dose recomendada.", metodoDaTFG: "sem_dados", procedencia: LABEL_CEFAZOLINA },
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
        ],
      },
      {
        id: "profilaxia",
        rotulo: "Profilaxia cirúrgica",
        // ⚠️ A DOSE PRÉ-INCISÃO DEPENDE DO PESO, NÃO DO CLEARANCE — e o label não
        // dá dose de profilaxia para ClCr < 55. Isso NÃO virou "use a mesma":
        // virou faixa com procedência PENDENTE e alvo nomeado, porque inventar
        // aqui é o caminho do 126 mg/dL.
        linhas: [
          { peso: { de: 0, ate: 120 }, de: 0, ate: 55, deInclusivo: true, dose: "⚠️ o label não traz esquema de profilaxia para ClCr < 55 — isso NÃO significa que a profilaxia esteja contraindicada", intervalo: "—", valor: { tipo: "textoLivre" }, metodoDaTFG: METODO, procedencia: SEM_FONTE_PROFILAXIA },
          { peso: { de: 0, ate: 120 }, de: 55, ate: null, dose: "1–2 g", intervalo: "dose única, ½ h a 1 h antes da incisão", valor: { tipo: "absoluta", min: 1, max: 2, unidade: "g" }, metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "Cirurgia longa (≥ 2 h): 500 mg a 1 g durante o ato. Pós-operatório: 500 mg a 1 g 6/6h–8/8h por 24 h. ⚠️ O label NÃO dá intervalo numérico de redose.", procedencia: LABEL_CEFAZOLINA } },
          { peso: { de: 120, ate: null }, de: 0, ate: 55, deInclusivo: true, dose: "⚠️ o label não traz esquema de profilaxia para ClCr < 55 — isso NÃO significa que a profilaxia esteja contraindicada", intervalo: "—", valor: { tipo: "textoLivre" }, metodoDaTFG: METODO, procedencia: SEM_FONTE_PROFILAXIA },
          { peso: { de: 120, ate: null }, de: 55, ate: null, dose: "3 g", intervalo: "dose única, ½ h a 1 h antes da incisão", valor: { tipo: "absoluta", min: 3, unidade: "g" }, metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "⚠️ 120 kg ou mais: 3 g. O label não repete a dose intraoperatória nem a de 24 h para esta faixa de peso.", procedencia: LABEL_CEFAZOLINA } },
          SEM_DADOS("HD", "O label não traz esquema de profilaxia em hemodiálise."),
          SEM_DADOS("DP", "O label não traz esquema de profilaxia em diálise peritoneal."),
          SEM_DADOS("CRRT", RAZAO_CRRT),
          SEM_DADOS("SLED", "O label não traz esquema de profilaxia em terapias híbridas."),
        ],
      },
      ],
    },
    fonteDoFarmaco: LABEL_CEFAZOLINA,
    observacoes: [
      { texto: "⚠️ TODA redução de dose no tratamento vale APÓS uma dose de ataque apropriada à gravidade — a frase está só no label clássico, não no PLR.", procedencia: LABEL_CEFAZOLINA },
      { texto: "Profilaxia: a dose pré-incisão depende do PESO (1 a 2 g abaixo de 120 kg · 3 g de 120 kg para cima), não do clearance.", procedencia: LABEL_CEFAZOLINA },
      { texto: "Em cirurgia onde a infecção seria devastadora (cardíaca aberta, artroplastia com prótese), a profilaxia pode seguir por 3 a 5 dias.", procedencia: LABEL_CEFAZOLINA },
      { texto: "⚠️ REDOSE POR PERDA SANGUÍNEA e INTERVALO NUMÉRICO de redose intraoperatória NÃO ESTÃO NO LABEL — em nenhum dos cinco setids. O label diz apenas \"durante cirurgias longas (≥ 2 h)\" e \"a intervalos apropriados\". Alvo nomeado: diretriz de profilaxia cirúrgica (ASHP/IDSA/SIS/SHEA), que o autor decide se adota.", procedencia: SEM_FONTE_PROFILAXIA },
      { texto: "Nenhum dos labels declara dose máxima diária: o único teto é a frase de que doses de até 12 g/dia já foram usadas em casos raros — o que descreve o que ocorreu, não um limite recomendado.", procedencia: LABEL_CEFAZOLINA },
    ],
  },
  {
    id: "ceftriaxona",
    nome: "Ceftriaxona",
    classe: "Cefalosporina de 3ª geração",
    doseUsual: {
      via: "IV em ~30 min",
      procedencia: LABEL_CEFTRIAXONA,
    },
    doseMaxima: { valor: "4 g/dia — e 2 g/dia se houver disfunção hepática E renal significativa", procedencia: LABEL_CEFTRIAXONA },
    // ⚠️ `nao_ajusta` É CONTEÚDO, NÃO AUSÊNCIA — e é o estado que este catálogo
    // nunca tinha usado de verdade. Quem procura "ceftriaxona + insuficiência
    // renal" e não acha nada ajusta por conta e SUBDOSA. A tela diz, afirmando.
    //
    // ⚠️ E A EXCEÇÃO É A QUE IMPORTA NA UTI: renal E hepática JUNTAS têm teto de
    // 2 g/dia. É o cirrótico com injúria renal aguda, que não é caso raro.
    // ⚠️ BASE DECLARADA: a ceftriaxona não tem faixa (não ajusta), e sem base a
    // dose usual não teria de onde ser derivada. 1 a 2 g/dia é o que o label diz.
    base: { tipo: "absoluta", min: 1, max: 2, unidade: "g" },
    ajusteRenal: "nao_ajusta",
    textoDoEstado: {
      texto: "NÃO REQUER AJUSTE por função renal isolada — é excretada por via biliar E renal. ⚠️ EXCEÇÃO: com disfunção HEPÁTICA e renal significativa JUNTAS, não passar de 2 g/dia.",
      procedencia: LABEL_CEFTRIAXONA,
    },
linhas: [
      // ⚠️ NÃO AJUSTA POR CLEARANCE — e mesmo assim as modalidades entram, porque
      // "não é removida por diálise" é conteúdo positivo do label.
      { modalidade: "HD", dose: "sem dose suplementar", intervalo: "manter o esquema habitual", valor: { tipo: "textoLivre" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFTRIAXONA,
        notaDeFaixa: { texto: "Em 6 de 26 pacientes em diálise a eliminação estava muito reduzida: dosar nível se disponível.", procedencia: LABEL_CEFTRIAXONA } },
      { modalidade: "DP", dose: "sem dose suplementar", intervalo: "manter o esquema habitual", valor: { tipo: "textoLivre" }, metodoDaTFG: "sem_dados", procedencia: LABEL_CEFTRIAXONA },
      SEM_DADOS("CRRT", RAZAO_CRRT),
      SEM_DADOS("SLED", "O label não traz dose para terapias híbridas."),
    ],
    fonteDoFarmaco: LABEL_CEFTRIAXONA,
    observacoes: [
      { texto: "NÃO REQUER AJUSTE por função renal isolada — é excretada por via biliar E renal.", procedencia: LABEL_CEFTRIAXONA },
      { texto: "⚠️ EXCEÇÃO: com disfunção HEPÁTICA e renal significativa JUNTAS, não passar de 2 g/dia — e monitorizar de perto.", procedencia: LABEL_CEFTRIAXONA },
      // ⚠️ O PRÓPRIO LABEL SE TENSIONA, e as duas frases entram. Apagar uma para
      // deixar o app coerente seria inventar coerência que a fonte não tem.
      // ⚠️ AS DUAS FRASES DO LABEL NÃO SE CONTRADIZEM — FALAM DE COISAS
      // DIFERENTES, e o enquadramento é o que impede a confusão. "Não requer
      // ajuste" é REGRA DE DOSE, e vive no `textoDoEstado`. A frase abaixo é
      // ALERTA DE VIGILÂNCIA, e vem da seção de reações neurológicas: é sobre o
      // paciente que DESENVOLVE neurotoxicidade, sobretudo em disfunção renal
      // grave. Sem o rótulo de onde cada uma vem, duas frases opostas confundem
      // exatamente o usuário sem experiência que o app existe para ajudar.
      { texto: "⚠️ ALERTA DE VIGILÂNCIA (seção de REAÇÕES NEUROLÓGICAS do label, não a de dosagem): há encefalopatia por ceftriaxona descrita em disfunção renal GRAVE — em pacientes que não receberam ajuste E em pacientes que receberam. Foi reversível com a suspensão. O label pede ajuste apropriado nesses casos. Isto NÃO contradiz a regra de dose acima: aquela é sobre a rotina, esta é sobre vigiar quem já está com disfunção grave.", procedencia: LABEL_CEFTRIAXONA },
      { texto: "Não é removida por hemodiálise nem por diálise peritoneal. Em 6 de 26 pacientes em diálise a eliminação estava muito reduzida: dosar nível se disponível.", procedencia: LABEL_CEFTRIAXONA },
      { texto: "⚠️ CÁLCIO: não administrar junto com solução que contenha cálcio na MESMA linha — precipita. RINGER LACTATO e Hartmann estão nomeados no label e não servem nem para reconstituir.", procedencia: LABEL_CEFTRIAXONA },
      { texto: "Fora do período neonatal, ceftriaxona e solução com cálcio podem ser dadas em SEQUÊNCIA, lavando a linha entre elas com SF 0,9% ou SG 5%.", procedencia: LABEL_CEFTRIAXONA },
      { texto: "⚠️ CONTRAINDICADA em neonato (≤ 28 dias) que precise de solução com cálcio, inclusive nutrição parenteral — risco de precipitação com desfecho fatal descrito.", procedencia: LABEL_CEFTRIAXONA },
      { texto: "Profilaxia cirúrgica: 1 g IV em dose única, de ½ a 2 horas antes da incisão.", procedencia: LABEL_CEFTRIAXONA },
    ],
  },
];

/**
 * ⚠️ O TEXTO É DERIVADO DA ESTRUTURA — nunca o contrário.
 *
 * Enquanto a dose era prosa, "metade da dose recomendada" carregava um referente
 * que ninguém resolvia (D-79), e o motor procurava "mg/kg" com `parseFloat`. Aqui
 * o valor é dado, e o texto sai dele — o que torna possível a trava que confere
 * se o que a tela mostra bate com o que o dado diz.
 */
export function textoDaDose(v: DoseEstruturada, base?: DoseEstruturada): string {
  const numero = (n: number) => String(n).replace(".", ",");
  /**
   * ⚠️ A CONVERSÃO SÓ É POSSÍVEL PORQUE A UNIDADE É DECLARADA. Metade de 1 g dá
   * "0,5 g", que está certo e ninguém prescreve — vira "500 mg". Sem a unidade no
   * dado, isto seria adivinhação sobre string; com ela, é aritmética.
   */
  const normaliza = (d: Extract<DoseEstruturada, { tipo: "absoluta" }>) =>
    d.unidade === "g" && !d.porQuilo && d.min < 1
      ? { ...d, min: d.min * 1000, max: d.max !== undefined ? d.max * 1000 : undefined, unidade: "mg" as const }
      : d;
  const abs = (bruto: Extract<DoseEstruturada, { tipo: "absoluta" }>) => {
    const d = normaliza(bruto);
    return `${numero(d.min)}${d.max !== undefined ? `–${numero(d.max)}` : ""} ${d.unidade}${d.porQuilo ? "/kg" : ""}`;
  };
  if (v.tipo === "absoluta") return abs(v);
  if (v.tipo === "textoLivre") return "";
  // ⚠️ SEM BASE, A FRAÇÃO NÃO TEM METADE DE QUÊ — e a trava reprova antes de
  // chegar aqui. Este retorno existe para não mentir se alguém a chamar direto.
  if (!base || base.tipo !== "absoluta") return v.tipo === "igualABase" ? "dose de referência" : "fração da dose de referência";
  if (v.tipo === "igualABase") return abs(base);
  const fator = v.fracao;
  return abs({
    tipo: "absoluta",
    min: base.min * fator,
    max: base.max !== undefined ? base.max * fator : undefined,
    unidade: base.unidade,
    porQuilo: base.porQuilo,
  });
}

/** A base que vale para um conjunto — a do valor do eixo, ou a do fármaco. */
export function baseDe(farmaco: Antimicrobiano, valorDoEixo?: string): DoseEstruturada | undefined {
  if (farmaco.eixo) return farmaco.eixo.valores.find((v) => v.id === valorDoEixo)?.base ?? farmaco.base;
  return farmaco.base;
}

/**
 * A DOSE USUAL, DERIVADA — uma cópia só.
 *
 * ⚠️ Ela vem da BASE de cada valor do eixo (ou do fármaco) e, quando não há
 * base, da FAIXA SEM TETO — que é, por definição, a dose com função renal
 * normal. Enquanto era prosa ao lado da estrutura, as duas diziam a mesma coisa
 * sem nada entre elas, e a que divergisse seria a que ninguém releria.
 */
export function doseUsualDerivada(f: Antimicrobiano): string {
  const conjuntos = f.eixo
    ? f.eixo.valores.map((v) => ({ rotulo: v.rotulo, base: v.base ?? f.base, linhas: v.linhas }))
    : [{ rotulo: "", base: f.base, linhas: f.linhas }];
  const partes = conjuntos.map((c) => {
    const topo = c.linhas.find((l) => !l.modalidade && l.ate === null);
    const doseTexto = c.base
      ? textoDaDose(c.base)
      : topo?.valor && topo.valor.tipo !== "textoLivre"
        ? textoDaDose(topo.valor, c.base)
        : "";
    // ⚠️ SEM BASE E SEM TOPO ESTRUTURADO, NÃO SE INVENTA: diz-se que depende, e
    // o detalhe fica na observação — é o caso da ceftazidima, cujo topo defere à
    // tabela por indicação que este catálogo ainda não estrutura.
    if (!doseTexto) return `${c.rotulo ? `${c.rotulo}: ` : ""}depende da indicação — ver observações`;
    const intervalo = topo?.intervalo ? ` ${topo.intervalo}` : "";
    return `${c.rotulo ? `${c.rotulo}: ` : ""}${doseTexto}${intervalo}`;
  });
  return partes.join(" · ");
}

/**
 * A LINHA que vale para um caso — contínua (ClCr) ou categórica (modalidade).
 *
 * ⚠️ QUANDO O FÁRMACO TEM EIXO DE ENTRADA, ELE MANDA: pedir a linha sem dizer o
 * valor do eixo devolve `undefined`, e não o primeiro valor. Escolher por omissão
 * é exatamente o defeito que o pip-tazo tinha — e o rodapé da cefepima mostrou o
 * mesmo em outra forma: tabela sem legenda vira palpite com grade.
 */
export function linhasDe(farmaco: Antimicrobiano, valorDoEixo?: string): LinhaRenal[] {
  if (!farmaco.eixo) return farmaco.linhas;
  return farmaco.eixo.valores.find((v) => v.id === valorDoEixo)?.linhas ?? [];
}

export function faixaPara(
  farmaco: Antimicrobiano,
  clcr: number,
  valorDoEixo?: string,
  pesoKg?: number
): LinhaRenal | undefined {
  return linhasDe(farmaco, valorDoEixo).find((f) => {
    if (f.modalidade) return false; // categórica não responde a clearance
    if (f.peso) {
      if (pesoKg === undefined) return false;
      const dentro = pesoKg >= f.peso.de && (f.peso.ate === null || pesoKg < f.peso.ate);
      if (!dentro) return false;
    }
    const acimaDoPiso = f.deInclusivo === false ? clcr > (f.de ?? 0) : clcr >= (f.de ?? 0);
    const abaixoDoTeto =
      f.ate === null || f.ate === undefined ? true : f.ateInclusivo ? clcr <= f.ate : clcr < f.ate;
    return acimaDoPiso && abaixoDoTeto;
  });
}

/** A linha de uma modalidade de TRS — HD, DP, CRRT ou SLED. */
export function linhaDaModalidade(
  farmaco: Antimicrobiano,
  modalidade: ModalidadeDeTRS,
  valorDoEixo?: string
): LinhaRenal | undefined {
  return linhasDe(farmaco, valorDoEixo).find((f) => f.modalidade === modalidade);
}
