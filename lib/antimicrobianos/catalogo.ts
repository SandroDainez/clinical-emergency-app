import type { Antimicrobiano, ProcedenciaDeFaixa } from "./tipos";

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
 * ⚠️ A FRASE É LITERAL E A MODALIDADE VIAJA À PARTE. Montá-la com template
 * (`... para ${o_que} ...`) produziria uma frase que nunca vira chave de
 * dicionário — o usuário em espanhol a leria em português (D-19/R-82). O texto
 * é um só, e o `sobre` diz de qual modalidade se trata.
 */
const SEM_DADOS_DIALISE = (sobre: string) => ({
  estado: "sem_dados" as const,
  sobre,
  pendencia:
    "⚠️ SEM DADOS NO REPOSITÓRIO para esta modalidade. Isto é ausência DECLARADA, não \"não precisa ajustar\" — e aparece na tela como tal.",
});

export const CATALOGO_DE_ANTIMICROBIANOS: Antimicrobiano[] = [
  {
    id: "vancomicina",
    nome: "Vancomicina",
    classe: "Glicopeptídeo",
    doseUsual: {
      dose: "25–30 mg/kg de ataque (peso real, máx 3 g)",
      via: "IV",
      intervalo: "dose única de ataque",
      procedencia: PENDENTE_DA_MIGRACAO,
    },
    ajusteRenal: "ajusta",
    // ⚠️ `pratica_aceita`, NÃO recomendação formal de bula — e o contexto diz por
    // quê: o consenso 2020 recomenda ALVO (AUC/MIC 400–600) e abandonou o vale
    // isolado; a escada por faixa de clearance é OPERACIONALIZAÇÃO, não texto do
    // documento. Verbatim: `protocols/fontes-verbatim/vancomicina-consenso-2020.md`.
    faixas: [
      { de: 0, ate: 20, dose: "10–15 mg/kg", intervalo: "48/48h ou por nível", metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      { de: 20, ate: 40, dose: "10–15 mg/kg", intervalo: "24/24h", metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      { de: 40, ate: 60, dose: "10–15 mg/kg", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      // ⚠️ O 90 PERTENCE A ESTA FAIXA: o código dizia `tfg > 90 ? … : tfg >= 60 ? …`.
      { de: 60, ate: 90, ateInclusivo: true, dose: "15–20 mg/kg", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
      { de: 90, ate: null, deInclusivo: false, dose: "15–20 mg/kg", intervalo: "8/8h", metodoDaTFG: METODO, procedencia: CONSENSO_VANCO_2020 },
    ],
    dialise: {
      // ⚠️ AS DUAS AFIRMAÇÕES, DECLARADAS — e a conduta NÃO foi rebaixada para o
      // label. Ele diz "poorly removed by dialysis", e isso reflete membranas de
      // BAIXA permeabilidade da época em que o texto foi escrito. O consenso 2020
      // diz o oposto, com a razão: "vancomycin is cleared substantially by
      // contemporary high-permeability hemodialyzers", e recomenda dose A CADA
      // sessão. Corrigir para o label deixaria o app atualizado na procedência e
      // ERRADO na clínica — subdosando quem está em HD.
      //
      // ⚠️ E O NÚMERO NÃO FOI TROCADO POR MIM: o consenso tabela 25 mg/kg de
      // ataque e 10 mg/kg de manutenção (após o fim da sessão, alta
      // permeabilidade); o app mostra 15–20 mg/kg. Os dois valores estão lado a
      // lado na D-77, para o autor decidir. Trocar dose a partir de leitura minha
      // é o que o método não admite (R-5).
      HD: {
        dose: "15–20 mg/kg",
        intervalo: "após a sessão",
        relacaoComASessao: "depois",
        procedencia: CONSENSO_VANCO_2020,
      },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
    },
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
    doseUsual: { dose: "3,375 g (outras indicações) · 4,5 g (pneumonia nosocomial)", via: "IV", intervalo: "6/6h", procedencia: LABEL_PIPTAZO },
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
    faixas: [],
    // ⚠️ AS DUAS COLUNAS DO LABEL, COMO DADO — e não mais uma escolhida e a outra
    // em nota de rodapé. Fecha a D-78: a tela já perguntava a indicação, e o
    // catálogo agora sabe que ela existe.
    indicacoes: [
      {
        id: "outras",
        rotulo: "Outras indicações",
        faixas: [
          { de: 0, ate: 20, dose: "2,25 g", intervalo: "8/8h", metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 20, ate: 40, ateInclusivo: true, dose: "2,25 g", intervalo: "6/6h", metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 40, ate: null, deInclusivo: false, dose: "3,375 g", intervalo: "6/6h", metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
        ],
      },
      {
        id: "pneumonia",
        rotulo: "Pneumonia nosocomial",
        faixas: [
          { de: 0, ate: 20, dose: "2,25 g", intervalo: "6/6h", metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 20, ate: 40, ateInclusivo: true, dose: "3,375 g", intervalo: "6/6h", metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
          { de: 40, ate: null, deInclusivo: false, dose: "4,5 g", intervalo: "6/6h", metodoDaTFG: METODO, procedencia: LABEL_PIPTAZO },
        ],
      },
    ],
    dialise: {
      HD: { dose: "2,25 g", intervalo: "12/12h + 0,75 g após cada sessão", relacaoComASessao: "depois", procedencia: LABEL_PIPTAZO },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
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
    doseUsual: { dose: "1 g", via: "IV", intervalo: "8/8h", procedencia: PENDENTE_DA_MIGRACAO },
    // ⚠️ QUATRO FAIXAS, E O APP TINHA TRÊS. A faixa `< 10` NÃO EXISTIA: o motor
    // devolvia 12/12h para quem tem a menor depuração, quando o label manda
    // 24/24h — o DOBRO da exposição diária de um carbapenêmico neurotóxico, em
    // paciente anúrico e em geral sedado, onde mioclonia e crise convulsiva
    // passam por "encefalopatia da sepse".
    //
    // ⚠️ E A DOSE CAI À METADE em ClCr < 25, não só o intervalo. O motor dizia
    // "500 mg–1 g" — o label diz METADE da dose recomendada.
    //
    // Verbatim em `protocols/fontes-verbatim/meropenem-label-dailymed.md`.
    ajusteRenal: "ajusta",
    faixas: [
      {
        de: 0, ate: 10,
        dose: "METADE da dose recomendada",
        doseConcreta: { texto: "500 mg", procedencia: METADE_DE_1G },
        intervalo: "24/24h",
        metodoDaTFG: METODO,
        procedencia: LABEL_MEROPENEM,
      },
      {
        de: 10, ate: 25, ateInclusivo: true,
        dose: "METADE da dose recomendada",
        doseConcreta: { texto: "500 mg", procedencia: METADE_DE_1G },
        intervalo: "12/12h",
        metodoDaTFG: METODO,
        procedencia: LABEL_MEROPENEM,
      },
      {
        // ⚠️ A TABELA DO LABEL É EM NÚMEROS INTEIROS ("10 to 25" e "26 to 50") e
        // deixa 25,1–25,9 sem faixa. Este app precisa cobrir a reta inteira, e a
        // escolha está DECLARADA aqui: o fracionário acima de 25 segue a faixa de
        // cima. É operacionalização NOSSA, não do label.
        de: 25, ate: 50, deInclusivo: false, ateInclusivo: true,
        dose: "dose recomendada",
        doseConcreta: { texto: "1 g", procedencia: METADE_DE_1G },
        notaDeFaixa: { texto: "MDR/meningite: 2 g 12/12h", procedencia: PRATICA_CRITICO },
        intervalo: "12/12h",
        metodoDaTFG: METODO,
        procedencia: LABEL_MEROPENEM,
      },
      {
        de: 50, ate: null, deInclusivo: false,
        dose: "dose recomendada (500 mg em cSSSI · 1 g em intra-abdominal)",
        doseConcreta: { texto: "1 g", procedencia: METADE_DE_1G },
        notaDeFaixa: { texto: "MDR: 2 g 8/8h em infusão de 3 h · meningite: 2 g 8/8h", procedencia: PRATICA_CRITICO },
        intervalo: "8/8h",
        metodoDaTFG: METODO,
        procedencia: LABEL_MEROPENEM,
      },
    ],
    dialise: {
      // ⚠️ "INFORMAÇÃO INADEQUADA" É CONTEÚDO, NÃO LACUNA — e não é "não precisa
      // ajustar". O label diz textualmente que não há informação suficiente para
      // hemodiálise e diálise peritoneal.
      HD: {
        estado: "sem_dados" as const,
        sobre: "hemodiálise intermitente",
        pendencia:
          "⚠️ O LABEL DIZ, TEXTUALMENTE, QUE A INFORMAÇÃO É INADEQUADA para hemodiálise e diálise peritoneal. Isto NÃO é \"não precisa ajustar\": é ausência de dose recomendada, declarada pela própria bula.",
      },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
    },
    fonteDoFarmaco: LABEL_MEROPENEM,
    observacoes: [
      {
        // Farmacocinética, não posologia — e por isso vive aqui, com força
        // própria, e não dentro da faixa.
        texto: "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem do label) — mas o label NÃO diz qual dose dar após a sessão.",
        procedencia: LABEL_MEROPENEM,
      },
      { texto: "MDR: 2 g em 100 mL SF → infundir em 3 h.", procedencia: PENDENTE_DA_MIGRACAO },
    ],
  },
  {
    id: "cefazolina",
    nome: "Cefazolina",
    classe: "Cefalosporina de 1ª geração",
    doseUsual: {
      dose: "500 mg a 1 g (infecção moderada a grave) · 1 a 1,5 g (grave/ameaçadora)",
      via: "IV ou IM",
      intervalo: "6/6h a 8/8h",
      procedencia: LABEL_CEFAZOLINA,
    },
    // ⚠️ O EIXO DE INDICAÇÃO COUBE. O de PESO NÃO EXISTIA — e a profilaxia
    // precisa dele: o label dá 1–2 g abaixo de 120 kg e 3 g de 120 kg para cima.
    // Escrever isso dentro do campo `dose` seria gambiarra: o número viraria
    // prosa e nenhuma trava conferiria fronteira. O eixo foi criado.
    ajusteRenal: "ajusta",
    faixas: [],
    indicacoes: [
      {
        id: "tratamento",
        rotulo: "Tratamento",
        faixas: [
          { de: 0, ate: 10, ateInclusivo: true, dose: "METADE da dose usual", intervalo: "18/18h a 24/24h", metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "⚠️ Toda redução vale APÓS uma dose de ataque apropriada à gravidade da infecção — a frase está só no label clássico.", procedencia: LABEL_CEFAZOLINA } },
          { de: 10, ate: 35, deInclusivo: false, dose: "METADE da dose usual", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "⚠️ Toda redução vale APÓS uma dose de ataque apropriada à gravidade da infecção.", procedencia: LABEL_CEFAZOLINA } },
          { de: 35, ate: 55, dose: "dose usual INTEIRA", intervalo: "8/8h ou mais espaçado", metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA },
          { de: 55, ate: null, dose: "dose usual INTEIRA", intervalo: "6/6h a 8/8h", metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA },
        ],
      },
      {
        id: "profilaxia",
        rotulo: "Profilaxia cirúrgica",
        // ⚠️ A DOSE PRÉ-INCISÃO DEPENDE DO PESO, NÃO DO CLEARANCE — e o label não
        // dá dose de profilaxia para ClCr < 55. Isso NÃO virou "use a mesma":
        // virou faixa com procedência PENDENTE e alvo nomeado, porque inventar
        // aqui é o caminho do 126 mg/dL.
        faixas: [
          { peso: { de: 0, ate: 120 }, de: 0, ate: 55, deInclusivo: true, dose: "⚠️ o label não traz esquema de profilaxia para ClCr < 55 — isso NÃO significa que a profilaxia esteja contraindicada", intervalo: "—", metodoDaTFG: METODO, procedencia: SEM_FONTE_PROFILAXIA },
          { peso: { de: 0, ate: 120 }, de: 55, ate: null, dose: "1 a 2 g", intervalo: "dose única, ½ h a 1 h antes da incisão", metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "Cirurgia longa (≥ 2 h): 500 mg a 1 g durante o ato. Pós-operatório: 500 mg a 1 g 6/6h–8/8h por 24 h. ⚠️ O label NÃO dá intervalo numérico de redose.", procedencia: LABEL_CEFAZOLINA } },
          { peso: { de: 120, ate: null }, de: 0, ate: 55, deInclusivo: true, dose: "⚠️ o label não traz esquema de profilaxia para ClCr < 55 — isso NÃO significa que a profilaxia esteja contraindicada", intervalo: "—", metodoDaTFG: METODO, procedencia: SEM_FONTE_PROFILAXIA },
          { peso: { de: 120, ate: null }, de: 55, ate: null, dose: "3 g", intervalo: "dose única, ½ h a 1 h antes da incisão", metodoDaTFG: METODO, procedencia: LABEL_CEFAZOLINA,
            notaDeFaixa: { texto: "⚠️ 120 kg ou mais: 3 g. O label não repete a dose intraoperatória nem a de 24 h para esta faixa de peso.", procedencia: LABEL_CEFAZOLINA } },
        ],
      },
    ],
    dialise: {
      // ⚠️ "hemodialysis" NÃO APARECE EM NENHUM DOS CINCO SETIDS LIDOS. Isto é
      // ausência conferida, com onde se procurou — não ausência presumida.
      HD: {
        estado: "sem_dados" as const,
        sobre: "hemodiálise intermitente",
        pendencia:
          "⚠️ A PALAVRA \"hemodialysis\" NÃO APARECE EM NENHUM DOS CINCO SETIDS de cefazolina lidos no DailyMed. Só há diálise PERITONEAL, e como farmacocinética, não como dose. Ausência conferida — não presumida.",
      },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
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
      dose: "1 a 2 g por dia (teto de 4 g/dia)",
      via: "IV em ~30 min",
      intervalo: "1×/dia, ou dividido 12/12h",
      procedencia: LABEL_CEFTRIAXONA,
    },
    doseMaxima: { valor: "4 g/dia — e 2 g/dia se houver disfunção hepática E renal significativa", procedencia: LABEL_CEFTRIAXONA },
    // ⚠️ `nao_ajusta` É CONTEÚDO, NÃO AUSÊNCIA — e é o estado que este catálogo
    // nunca tinha usado de verdade. Quem procura "ceftriaxona + insuficiência
    // renal" e não acha nada ajusta por conta e SUBDOSA. A tela diz, afirmando.
    //
    // ⚠️ E A EXCEÇÃO É A QUE IMPORTA NA UTI: renal E hepática JUNTAS têm teto de
    // 2 g/dia. É o cirrótico com injúria renal aguda, que não é caso raro.
    ajusteRenal: "nao_ajusta",
    textoDoEstado: {
      texto: "NÃO REQUER AJUSTE por função renal isolada — é excretada por via biliar E renal. ⚠️ EXCEÇÃO: com disfunção HEPÁTICA e renal significativa JUNTAS, não passar de 2 g/dia.",
      procedencia: LABEL_CEFTRIAXONA,
    },
    faixas: [],
    dialise: {
      // ⚠️ NÃO É REMOVIDA — e por isso não há dose suplementar. Isto é conteúdo
      // positivo do label, e evita a redose "por precaução" que subiria a
      // exposição sem ganho.
      HD: {
        dose: "sem dose suplementar",
        intervalo: "manter o esquema habitual",
        relacaoComASessao: "independente",
        procedencia: LABEL_CEFTRIAXONA,
      },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
    },
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
 * A faixa que contém um ClCr — respeitando a inclusividade declarada.
 *
 * ⚠️ QUANDO O FÁRMACO TEM EIXO DE INDICAÇÃO, ELE MANDA: pedir a faixa sem dizer a
 * indicação devolve `undefined`, e não a primeira coluna. Escolher a coluna por
 * omissão é exatamente o defeito que o pip-tazo tinha.
 */
export function faixaPara(farmaco: Antimicrobiano, clcr: number, indicacao?: string, pesoKg?: number) {
  const lista = farmaco.indicacoes
    ? (farmaco.indicacoes.find((i) => i.id === indicacao)?.faixas ?? [])
    : farmaco.faixas;
  return lista.find((f) => {
    // ⚠️ O PESO FILTRA ANTES DO CLEARANCE: sem peso informado, a faixa que exige
    // peso não é candidata — devolver a do balde errado seria pior que devolver
    // nada, porque a dose sairia com cara de calculada.
    if (f.peso) {
      if (pesoKg === undefined) return false;
      const dentro = pesoKg >= f.peso.de && (f.peso.ate === null || pesoKg < f.peso.ate);
      if (!dentro) return false;
    }
    const acimaDoPiso = f.deInclusivo === false ? clcr > f.de : clcr >= f.de;
    const abaixoDoTeto = f.ate === null ? true : f.ateInclusivo ? clcr <= f.ate : clcr < f.ate;
    return acimaDoPiso && abaixoDoTeto;
  });
}
