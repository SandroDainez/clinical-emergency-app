import type { InputField, TreeValues } from "../core/decision-tree/types";

/**
 * DESCOBERTA GUIADA — as emergências do renal que ainda não tinham conjunto.
 *
 * ── ⚠️ ISTO ESTENDE `lib/instabilidade-guiada.ts`, NÃO O SUBSTITUI ─────────
 *
 * Aquele arquivo já tem o padrão inteiro e é o que a 2/6 (perfusão) usa sem
 * mudar uma linha: `OPCAO_GUIADA` → `InputNode` com observações de beira de
 * leito → função pura conclui → o fluxo segue. Os critérios são os da AHA, com
 * a distinção instável/limítrofe/estável, e continuam valendo aqui.
 *
 * O que faltava não era mecanismo: era CONTEÚDO. Congestão, ácido-base, uremia
 * e diurese não têm conjunto de sinais em lugar nenhum do app. É isso que este
 * arquivo acrescenta, no mesmo molde e com a mesma promessa.
 *
 * ⚠️ O NOME `instabilidade-guiada` FICOU ESTREITO — o padrão é geral e o nome
 * não é, e é o nome que vai impedir outros módulos de perceberem que podem usar
 * o padrão. O renome NÃO entra nesta rodada: renomear no meio da correção do
 * renal misturaria duas mudanças e estragaria o retrato antes/depois. Fica
 * registrado como trabalho próprio, logo depois do renal aprovado.
 *
 * ── A FORMA, QUE É O QUE IMPEDE O DEFEITO DE VOLTAR ────────────────────────
 *
 * "Não sei" é RAMO DO FLUXO, nunca parágrafo. Cada conjunto aqui é de uma a
 * seis perguntas CONCRETAS, respondíveis olhando o paciente ou o monitor, e
 * termina devolvendo a resposta à pergunta original. Nenhum deles acaba em
 * texto para ler: transformar a dúvida em explicação já foi reprovado duas
 * vezes neste app.
 */

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

/** Rótulo da terceira saída. Igual em todas as seis, para o olho reconhecer. */
export const OPCAO_DESCOBRIR = "Não sei — me ajude a descobrir";

/* ── 3/6 · CONGESTÃO ───────────────────────────────────────────────────────── */

export const CAMPOS_DE_CONGESTAO: InputField[] = [
  {
    id: "spo2",
    label: "Saturação em ar ambiente",
    unit: "%",
    presets: ["86", "90", "94", "97"].map((v) => ({ value: v, label: v })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro valor",
  },
  {
    id: "fr",
    label: "Frequência respiratória",
    unit: "rpm",
    presets: ["14", "20", "28", "36"].map((v) => ({ value: v, label: v })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro valor",
  },
  { id: "acessoria", label: "Está usando musculatura acessória para respirar?", presets: SIM_NAO },
  { id: "ortopneia", label: "Não consegue ficar deitado?", presets: SIM_NAO },
  { id: "crepitacoes", label: "Ouve estalidos (crepitações) na ausculta dos pulmões?", presets: SIM_NAO },
  {
    id: "o2Subindo",
    label: "A necessidade de oxigênio subiu nas últimas horas?",
    presets: SIM_NAO,
    optional: true,
  },
];

/**
 * ⚠️ HIPOXEMIA É O QUE TORNA A CONGESTÃO EMERGÊNCIA — hipervolemia sem
 * hipoxemia não é esta pergunta. Por isso saturação baixa ou esforço
 * respiratório bastam, e os sinais de congestão sozinhos (crepitações,
 * ortopneia) só fecham quando acompanhados de um dos dois.
 */
export function concluiCongestao(v: TreeValues): "sim" | "nao" {
  const spo2 = Number(String(v.spo2 ?? "").replace(",", "."));
  const fr = Number(String(v.fr ?? "").replace(",", "."));
  const hipoxemia = Number.isFinite(spo2) && spo2 < 92;
  const esforco = v.acessoria === "sim" || (Number.isFinite(fr) && fr >= 28);
  const congestao = v.crepitacoes === "sim" || v.ortopneia === "sim" || v.o2Subindo === "sim";
  if (hipoxemia && congestao) return "sim";
  if (esforco && congestao) return "sim";
  // Hipoxemia isolada ainda manda tratar: pode não ser congestão, mas é
  // ameaça à vida, e o app não pode devolver "não" para quem satura 86%.
  if (hipoxemia) return "sim";
  return "nao";
}

/* ── 4/6 · ÁCIDO-BASE ──────────────────────────────────────────────────────── */

export const CAMPOS_DE_ACIDOSE: InputField[] = [
  {
    id: "ph",
    label: "pH da gasometria",
    presets: ["7.0", "7.15", "7.25", "7.35"].map((v) => ({ value: v, label: v.replace(".", ",") })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro valor",
  },
  {
    id: "hco3",
    label: "Bicarbonato",
    unit: "mEq/L",
    presets: ["6", "10", "16", "22"].map((v) => ({ value: v, label: v })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro valor",
    optional: true,
  },
];

/** Sinais que sobram quando não há gasometria — e eles são PRESUNTIVOS. */
export const CAMPOS_SEM_GASOMETRIA: InputField[] = [
  {
    id: "kussmaul",
    label: "Respiração profunda e rápida, puxando muito ar (Kussmaul)?",
    presets: SIM_NAO,
  },
  {
    id: "taquipneiaSemHipoxemia",
    label: "Respiração acelerada com saturação boa — sem hipoxemia que explique?",
    presets: SIM_NAO,
  },
  { id: "rebaixado", label: "Está rebaixado ou confuso?", presets: SIM_NAO },
];

export const ACIDOSE_SEM_GASOMETRIA =
  "⚠️ SEM GASOMETRIA A RESPOSTA É PRESUNTIVA. Estes sinais sugerem acidose metabólica, não a medem — e nenhum deles diz o pH. O exame continua sendo necessário: peça em paralelo.";

/**
 * ⚠️ O CORTE É O ÚNICO QUE O REPOSITÓRIO ESCREVE, E A TRANSPOSIÇÃO ESTÁ
 * DECLARADA: `pH < 7,0` é o limiar de GRAVE do módulo de CAD/EHH (consenso
 * 2024), onde ele marca a acidose grave e a indicação de discutir bicarbonato.
 * Não é um corte de acidemia da injúria renal — é o corte de acidose grave que
 * este app já usa, aplicado aqui por coerência interna e não por fonte renal.
 *
 * Nenhum número foi acrescentado por memória. Acidemia entre 7,0 e 7,30 não
 * vira "não é problema": vira "não é a emergência desta tela", e a segunda
 * metade da pergunta — "ou que não responde ao tratamento" — continua sendo do
 * julgamento de quem está tratando, com a gasometria na mão.
 */
export function concluiAcidose(v: TreeValues): "sim" | "nao" {
  const ph = Number(String(v.ph ?? "").replace(",", "."));
  if (Number.isFinite(ph)) return ph < 7 ? "sim" : "nao";
  const sinais = [v.kussmaul, v.taquipneiaSemHipoxemia, v.rebaixado].filter((x) => x === "sim");
  return sinais.length >= 2 ? "sim" : "nao";
}

/* ── 5/6 · UREMIA ──────────────────────────────────────────────────────────── */

export const CAMPOS_DE_UREMIA: InputField[] = [
  { id: "encefalopatia", label: "Está rebaixado, confuso ou com encefalopatia sem outra causa?", presets: SIM_NAO },
  { id: "asterixis", label: "Peça para estender as mãos: elas batem, como um aceno involuntário (asterixis)?", presets: SIM_NAO },
  { id: "atrito", label: "Ouve atrito ao auscultar o coração (atrito pericárdico)?", presets: SIM_NAO },
  { id: "vomitos", label: "Náusea e vômitos que não param?", presets: SIM_NAO },
  { id: "sangramento", label: "Sangramento — gengiva, nariz, digestivo, ou sítio de punção que não para?", presets: SIM_NAO },
];

/**
 * ⚠️ A TRAVA CLÍNICA DESTA EMERGÊNCIA: o que indica terapia de substituição é a
 * UREMIA SINTOMÁTICA, não o número da ureia. Por isso nenhum campo aqui pede
 * ureia — um valor alto sem sintoma não entra nesta conta, e um valor que
 * ninguém colheu não impede a conclusão.
 */
export const UREMIA_NAO_E_NUMERO =
  "⚠️ UREIA ISOLADA NÃO INDICA DIÁLISE. O que decide é a uremia SINTOMÁTICA — encefalopatia, pericardite, sangramento. Número alto sem sintoma não é indicação, e a diretriz recusa decidir por limiar isolado.";

export function concluiUremia(v: TreeValues): "sim" | "nao" {
  const sinais = [v.encefalopatia, v.asterixis, v.atrito, v.vomitos, v.sangramento];
  return sinais.some((x) => x === "sim") ? "sim" : "nao";
}

/* ── 6/6 · DIURESE ─────────────────────────────────────────────────────────── */

export const CAMPOS_DE_DIURESE: InputField[] = [
  {
    id: "temSonda",
    label: "O paciente tem sonda vesical?",
    presets: [
      { value: "sim", label: "Tem" },
      { value: "nao", label: "Não tem" },
    ],
  },
  {
    id: "debitoUltimaHora",
    label: "Com sonda: quanto saiu na última hora?",
    unit: "mL",
    presets: ["0", "10", "30", "60"].map((v) => ({ value: v, label: v })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro valor",
    optional: true,
  },
  {
    id: "bexigaPalpavel",
    label: "Sem sonda: a bexiga está palpável (globo) ou cheia ao ultrassom?",
    presets: [...SIM_NAO, { value: "nao_avaliado", label: "Não consegui avaliar" }],
    optional: true,
  },
];

/**
 * ⚠️ A TRAVA MAIS BARATA DE ERRAR DO MÓDULO: antes de chamar de anúria, excluir
 * RETENÇÃO URINÁRIA. Bexiga cheia não é anúria — é obstrução, que é reversível
 * em minutos e já tem lugar próprio no fluxo. Tratar retenção como anúria manda
 * o paciente para a investigação errada com a solução do lado.
 */
export const BEXIGA_CHEIA_NAO_E_ANURIA =
  "⚠️ BEXIGA CHEIA NÃO É ANÚRIA — é obstrução, e ela se resolve em minutos. Rim que não filtra dá bexiga vazia; bexiga cheia com o paciente sem urinar é saída bloqueada.";

export type ConclusaoDeDiurese = "obstrucao" | "sim" | "nao";

export function concluiDiurese(v: TreeValues): ConclusaoDeDiurese {
  // A retenção vem antes de tudo: é a única resposta que muda o DESTINO, e não
  // só a resposta.
  if (v.temSonda === "nao" && v.bexigaPalpavel === "sim") return "obstrucao";
  const debito = Number(String(v.debitoUltimaHora ?? "").replace(",", "."));
  if (v.temSonda === "sim" && Number.isFinite(debito)) {
    // 30 mL/h é o piso grosseiro de 0,5 mL/kg/h no adulto de 60 kg — abaixo
    // disso, o app trata como oligúria que merece a conduta.
    return debito < 30 ? "sim" : "nao";
  }
  // Sem sonda e sem globo, ou sem conseguir avaliar: não dá para afirmar que a
  // diurese está preservada. Segue como se estivesse caindo, que é o lado
  // seguro — e a próxima tela do fluxo é justamente a exclusão de obstrução.
  return "sim";
}

/* ── VOLEMIA · "o rim está recebendo sangue?" ──────────────────────────────── */

/**
 * ⚠️ NASCEU DE UMA FUSÃO INDEVIDA, E A REGRA JÁ EXISTIA (R-70): a opção do nó
 * dizia "Nem seco nem congesto, OU NÃO CONSIGO DEFINIR" — juntando DESCARTEI
 * com NÃO SEI numa tecla só. Quem avaliou e concluiu euvolemia e quem não fez
 * ideia iam para o mesmo lugar, e o app não tinha como oferecer ajuda a quem
 * precisava, nem respeitar quem não precisava.
 *
 * Os sinais aqui são os que o próprio nó já listava em `evidence` e `summary` —
 * nada de fonte nova: o que muda é que agora eles são PERGUNTA, não texto.
 */
export const CAMPOS_DE_VOLEMIA: InputField[] = [
  { id: "perdas", label: "Houve perda clara — vômito, diarreia, sangramento, dreno, jejum prolongado?", presets: SIM_NAO },
  { id: "mucosaSeca", label: "Mucosa seca, língua seca, axila sem suor?", presets: SIM_NAO },
  { id: "edema", label: "Edema de membros, ou inchaço que deixa marca do dedo?", presets: SIM_NAO },
  { id: "jugular", label: "Veias do pescoço cheias com a cabeceira elevada (estase jugular)?", presets: SIM_NAO },
  { id: "crepitacoesVol", label: "Estalidos (crepitações) na ausculta dos pulmões?", presets: SIM_NAO },
  { id: "ascite", label: "Barriga distendida com líquido (ascite)?", presets: SIM_NAO },
];

export type Volemia = "seco" | "congesto" | "indefinido";

/**
 * ⚠️ CONGESTO GANHA DO SECO QUANDO OS DOIS APARECEM. É a regra escrita no
 * próprio nó: insuficiência cardíaca descompensada e cirrose com ascite têm rim
 * hipoperfundido COM excesso de água — e ali volume PIORA. Errar para o lado do
 * volume nesses dois é o erro que não se desfaz rápido.
 */
export function concluiVolemia(v: TreeValues): Volemia {
  const congesto = [v.edema, v.jugular, v.crepitacoesVol, v.ascite].some((x) => x === "sim");
  if (congesto) return "congesto";
  if (v.perdas === "sim" || v.mucosaSeca === "sim") return "seco";
  return "indefinido";
}

/* ── CONTEXTO DE RISCO PARA HIPERCALEMIA ───────────────────────────────────── */

/**
 * Quando o traçado não dá para ler, é o risco de base que decide — e ele se
 * responde olhando prescrição e história, não o monitor.
 */
export const CAMPOS_DE_RISCO_DE_K: InputField[] = [
  { id: "kAnuria", label: "Está anúrico ou oligúrico?", presets: SIM_NAO },
  { id: "kRenal", label: "Tem injúria renal aguda ou doença renal crônica conhecida?", presets: SIM_NAO },
  { id: "kFarmaco", label: "Usa IECA, BRA, espironolactona ou suplemento de potássio?", presets: SIM_NAO },
  { id: "kLise", label: "Rabdomiólise, esmagamento, queimadura extensa ou lise tumoral?", presets: SIM_NAO },
];

export function temRiscoDeHipercalemia(v: TreeValues): boolean {
  return [v.kAnuria, v.kRenal, v.kFarmaco, v.kLise].some((x) => x === "sim");
}
