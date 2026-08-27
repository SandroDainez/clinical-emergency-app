import type { TreeValues, Veredito } from "../core/decision-tree/types";
import { BETABLOQUEADOR_AGUDO_DOSE, BETABLOQUEADOR_INDICACAO } from "./betabloqueador-agudo";
import { NITRATO_DOSE_IV, NITRATO_DOSE_SL, NITRATO_DOSE_SL_ALTERNATIVA } from "./nitrato-dose";
import { temAlgum } from "../core/decision-tree/estado-clinico";
import { lerPde5 } from "./pde5";
import { contraindicacaoDoNitrato, suspeitaDeVd } from "./nitrato-contraindicacao";
import { estadoTerapiaAntiIsquemica, porQueNitratoForaDeOpcao } from "./terapia-anti-isquemica";
import { estadoDoAas, resumoDoAas } from "./aas-estado";
import { MORFINA_TETO } from "./morfina-dispneia";

/**
 * VEREDITOS DA SCA — nitrato, AAS e betabloqueador.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ─────────────────────────────────────────────
 *
 * Até aqui, as ressalvas de segurança dos três fármacos eram TEXTO: "salvo
 * alergia/sangramento ativo" dentro da ação do AAS, "⛔ NÃO USAR nitrato
 * se…" numa lista recolhida, "NÃO iniciar se…" no card do betabloqueador. O
 * app dizia a regra e deixava a aplicação por conta de quem lê — no meio de
 * uma emergência, com o paciente na frente.
 *
 * ⚠️ VEREDITO É A MESMA REGRA, MAS APLICADA. O app já conhece PAS, FC,
 * perfusão, edema pulmonar e ausculta; ele pode responder "não administre
 * nitrato, PAS 82 mmHg" em vez de imprimir o critério e esperar que o médico
 * faça a conta com os olhos.
 *
 * ── AS TRÊS REGRAS QUE GOVERNAM TUDO AQUI (autor, 2026-08-25) ───────────────
 *
 * 1. 🔴 bloqueia AQUELA ação, nunca o atendimento. Não existe "prosseguir
 *    mesmo assim": o caminho é corrigir o dado ou seguir sem o fármaco.
 * 2. 🟡 devolve a escolha ao médico, e a decisão fica registrada com o tipo.
 * 3. 🟢 libera — e "liberado" não é "feito": a execução é registrada à parte.
 *
 * ⚠️ E A REGRA DE FONTE: nenhuma faixa intermediária foi inventada. Onde a
 * fonte auditada dá limiar binário (nitrato, betabloqueador), o veredito é
 * binário. Amarelo só existe onde há de fato uma escolha clínica sem resposta
 * única — a dissecção não resolvida no AAS.
 */

// ── Auxiliares de leitura ──────────────────────────────────────────────────

const num = (v: string | undefined): number =>
  v === undefined ? NaN : Number(String(v).replace(",", "."));

/** Sinais de baixo débito/hipoperfusão já coletados no bloco de ameaça. */
function hipoperfusao(v: TreeValues): boolean {
  return v.cor_perfusao === "sim" || v.cor_pulso_alterado === "ausente" || v.cor_pulso_alterado === "fraco";
}

/**
 * Congestão pulmonar com repercussão. Combina o achado do bloco de ameaça com
 * a ausculta da Tela 2b — os dois dizem coisas diferentes: `cor_edema_pulmonar`
 * já exige repercussão clínica real, e a ausculta pode flagrar o quadro antes
 * disso.
 */
function congestao(v: TreeValues): boolean {
  return v.cor_edema_pulmonar === "sim" || temAlgum(v, "ausculta_pulmonar", ["Estertores"]);
}

// ── NITRATO ────────────────────────────────────────────────────────────────

// ⚠️ `suspeitaDeVd` MUDOU DE CASA (2026-08-27) e é reexportada daqui para os
// consumidores existentes não quebrarem. Ela agora vive em
// `nitrato-contraindicacao.ts`, junto das outras condições do nitrato, porque
// `estadoTerapiaAntiIsquemica` precisa dela sem depender deste arquivo — este
// importa aquele, e o contrário fecharia um ciclo.
export { suspeitaDeVd };


/**
 * ⚠️ A QUEDA > 30 mmHg DO BASAL NÃO É GATE AQUI (correção do autor,
 * 2026-08-25). O app não tem PA basal documentada, e a primeira medida no
 * pronto-socorro NÃO é a pressão habitual do paciente — usá-la como basal
 * seria inventar um dado. O critério vive onde a própria fonte o coloca:
 * `NITRATO_MONITORIZACAO`, como razão para INTERROMPER depois de administrar,
 * não para negar antes.
 */
export function vereditoNitrato(v: TreeValues): Veredito {
  const titulo = "Nitrato";

  // ⚠️ AS CONDIÇÕES VIVEM EM `nitrato-contraindicacao.ts`, e não aqui, porque
  // `estadoTerapiaAntiIsquemica` precisa da MESMA resposta. Duas cópias da regra
  // divergiriam em silêncio; e o estado derivado CHAMAR este veredito faria a
  // ordem de avaliação determinar comportamento clínico (barrado pelo autor).
  const ci = contraindicacaoDoNitrato(v);
  if (ci.presente) {
    return { nivel: "vermelho", titulo, motivo: ci.texto };
  }

  const pde5 = lerPde5(v);
  return {
    nivel: "verde",
    titulo,
    motivo:
      pde5.estado === "fora_da_janela"
        ? `PAS ${v.pas} mmHg; última dose de PDE-5 há ${pde5.desdeUltimaDoseH} h, fora da janela de ${pde5.janelaH} h.`
        : `PAS ${v.pas} mmHg, sem contraindicação identificada.`,
    // ⚠️ AS TRÊS LINHAS, NA ORDEM DE QUEM PRESCREVE NO BRASIL: o dinitrato
    // primeiro (é o que está na gaveta), a nitroglicerina SL como alternativa
    // (é o que a guideline nomeia), e a via EV para dor persistente,
    // hipertensão ou congestão — que manda calcular na calculadora, fonte
    // única de concentração e mL/h.
    instrucao: [NITRATO_DOSE_SL, NITRATO_DOSE_SL_ALTERNATIVA, NITRATO_DOSE_IV],
  };
}

// ── AAS ────────────────────────────────────────────────────────────────────

/**
 * ⚠️ O ÚNICO AMARELO DOS TRÊS, e ele é legítimo: com suspeita de dissecção
 * NÃO RESOLVIDA não existe resposta única — antitrombótico numa dissecção é
 * catastrófico, e negar AAS numa SCA real também custa. Quem decide é o
 * médico, e a decisão fica registrada com o tipo escolhido.
 *
 * O portão aórtico (`portao_grupo_a`/`portao_grupo_b`) já existe e já roteia;
 * este veredito o CONSOME — não recria triagem nenhuma.
 */
export function vereditoAas(v: TreeValues): Veredito {
  const titulo = "AAS";

  if (v.aas_alergia === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Alergia a AAS relatada." };
  }
  if (v.aas_sangramento === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Sangramento ativo — antitrombótico contraindicado agora." };
  }
  if (v.aas_alergia === "nao_sei" || v.aas_sangramento === "nao_sei") {
    return {
      nivel: "amarelo",
      titulo,
      motivo: "Alergia ou sangramento ativo não afastados.",
      decisao: {
        campo: "decisao_aas",
        saidas: [
          { tipo: "prosseguir", label: "Administrar — benefício supera o risco" },
          { tipo: "corrigir_antes", label: "Checar alergia/sangramento antes" },
          { tipo: "nao_prosseguir", label: "Não administrar agora" },
        ],
      },
    };
  }
  // ⚠️ O VERDE REFLETE O ESTADO DO AAS, e é o que faz a cobrança persistir.
  //
  // Regra do autor (2026-08-27): "não quero travar a tela inicial até o médico
  // clicar em AAS, nem esconder o problema se ele avançar sem administrar. O app
  // deve permitir continuar e continuar cobrando até o estado ser resolvido."
  //
  // Quatro estados, e só um cobra. `nao_avaliado` é o único em que ninguém
  // decidiu — administrado e "decidido não administrar" são resoluções, e
  // contraindicado nem chega aqui (sai no vermelho acima).
  const estado = estadoDoAas(v);
  const resumo = resumoDoAas(v);

  if (estado === "administrado") {
    return { nivel: "verde", titulo, motivo: `AAS ${resumo.texto}.` };
  }
  if (estado === "nao_administrado") {
    return { nivel: "verde", titulo, motivo: "Decidido não administrar agora — registrado." };
  }

  return {
    nivel: "verde",
    titulo,
    motivo:
      estado === "nao_avaliado"
        ? "AAS ainda não resolvido — administrar, ou registrar que não foi administrado."
        : "Sem alergia, sem sangramento ativo e dissecção afastada no portão.",
    cobrar: estado === "nao_avaliado",
    instrucao: ["AAS 300 mg mastigável agora (162–325 mg)."],
  };
}

// ── BETABLOQUEADOR ─────────────────────────────────────────────────────────

/**
 * ⚠️ VERDE/VERMELHO APENAS, POR DECISÃO DE FONTE (autor, 2026-08-25). O
 * amarelo clinicamente correto seria o paciente estável COM risco de choque
 * cardiogênico — e os critérios objetivos desse risco não foram auditados
 * nesta sessão. O app já se recusa a calcular GRACE pelo mesmo motivo.
 *
 * ⚠️ E O RISCO DE CHOQUE NÃO VIRA PERGUNTA: "há risco de choque cardiogênico?"
 * é uma CONCLUSÃO, e pedir conclusão é o que este app não faz. Fica como
 * pendência de fonte, não como campo subjetivo novo.
 *
 * As contraindicações abaixo são as sustentadas pela ACC/AHA 2025 conforme
 * lista do autor: IC aguda/Killip II–IV, baixo débito, PR > 240 ms, BAV de
 * 2º/3º sem marcapasso, bradicardia grave e broncoespasmo ativo.
 */
export function vereditoBetabloqueador(v: TreeValues): Veredito {
  const titulo = "Betabloqueador oral precoce";
  const fc = num(v.fc);

  if (congestao(v)) {
    return { nivel: "vermelho", titulo, motivo: "Congestão pulmonar/IC aguda — não iniciar agora." };
  }
  if (hipoperfusao(v)) {
    return { nivel: "vermelho", titulo, motivo: "Sinais de baixo débito — não iniciar agora." };
  }
  if (Number.isFinite(fc) && fc < 50) {
    return { nivel: "vermelho", titulo, motivo: `FC ${v.fc} bpm — bradicardia.` };
  }
  if (v.bb_broncoespasmo === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Broncoespasmo ativo." };
  }
  // ⚠️ "NÃO SEI" NÃO LIBERA. A dúvida sobre BAV/PR longo tem correção — olhar
  // o ECG que já está na mão — e é isso que a ajuda oferece. Tratar dúvida
  // como ausência de contraindicação seria o default mais perigoso possível.
  if (v.bb_bav === "sim" || v.bb_bav === "nao_sei") {
    return {
      nivel: "vermelho",
      titulo,
      motivo:
        v.bb_bav === "sim"
          ? "BAV de 2º/3º grau sem marcapasso ou PR > 240 ms."
          : "BAV/PR longo não afastado — confira o ECG que já está na mão.",
    };
  }
  return {
    nivel: "verde",
    titulo,
    motivo: "Estável, sem congestão, bradicardia, BAV/PR longo ou broncoespasmo.",
    instrucao: [BETABLOQUEADOR_INDICACAO, BETABLOQUEADOR_AGUDO_DOSE],
  };
}


// ── MORFINA ────────────────────────────────────────────────────────────────

/**
 * ⚠️ ESTE VEREDITO NASCEU DE UM FURO NA PRÓPRIA REGRA DE DOSE GOVERNADA
 * (achado de 2026-08-26). A Rodada 1 tirou a dose de `actions` para o nitrato e
 * para o betabloqueador — e a morfina ficou de fora. Em TRÊS telas o app
 * imprimia "2–4 mg IV lento, repetível a cada 5–15 min, teto 10–15 mg" solto na
 * lista, com as contraindicações como prosa ao lado, que é exatamente o arranjo
 * que os vereditos existem para eliminar. `test:dose-governada` cobria dois
 * fármacos e chamava a regra de cumprida.
 *
 * A formulação do autor não menciona nome de fármaco: "nenhuma dose acionável
 * pode ser apresentada antes de o app ter avaliado e liberado as
 * contraindicações relevantes para aquele medicamento".
 *
 * ── POR QUE NUNCA HÁ VERDE AUTOMÁTICO ──────────────────────────────────────
 *
 * O app deriva quatro das cinco contraindicações escritas no módulo —
 * hipotensão, hipoperfusão, rebaixamento de consciência e VD. A quinta,
 * INSUFICIÊNCIA RESPIRATÓRIA COM RETENÇÃO DE CO₂ OU DPOC, não é derivável do
 * que se coletou: não existe campo para ela, e inventar um valor seria o oposto
 * do que esta camada faz.
 *
 * Chamar isso de verde seria o app afirmando "sem contraindicação" sobre uma
 * contraindicação que ele não olhou. Por isso o melhor caso é AMARELO — decisão
 * clínica explícita, com o tipo registrado —, e não porque a morfina seja
 * proibida, mas porque a liberação depende de um dado que só o médico tem.
 *
 * Isso também é coerente com o texto que já estava no módulo: morfina "só se
 * dor refratária apesar de anti-isquêmico otimizado". Nunca foi automática.
 */
export function vereditoMorfina(v: TreeValues): Veredito {
  const titulo = "Morfina";
  const pas = num(v.pas);

  // ── 1. BLOQUEIOS OBJETIVOS — precedência sobre tudo ─────────────────────
  //
  // ⚠️ ESTES VÊM DOS DADOS BRUTOS, NÃO DO ESTADO DA TERAPIA ANTI-ISQUÊMICA. A
  // separação é do autor e é a que impede o defeito de repetir: quando "a etapa
  // anterior foi resolvida?" e "o fármaco pode?" moram na mesma pergunta, um
  // achado que deveria ser cautela vira bloqueio.
  if (Number.isFinite(pas) && pas < 90) {
    return { nivel: "vermelho", titulo, motivo: `PAS ${v.pas} mmHg — hipotensão contraindica a morfina.` };
  }
  if (v.cor_perfusao === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Sinais de hipoperfusão — instabilidade hemodinâmica contraindica a morfina." };
  }
  if (v.cor_consciencia === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Rebaixamento do nível de consciência — a depressão respiratória se soma ao que já existe." };
  }

  // ⚠️ O VD SAIU DAQUI, E ERA UM BUG MEU (correção do autor, 2026-08-27).
  //
  // A versão anterior tinha `if (suspeitaDeVd(v)) return vermelho`. O texto de
  // onde construí o veredito — `MORFINA_CONTRAINDICACOES` — diz "IAM de
  // ventrículo direito COM HIPOTENSÃO", e eu deixei o qualificador para trás. O
  // veredito ficou mais restritivo que a própria fonte de onde saiu.
  //
  // A diretriz separa as duas drogas: o nitrato se evita na suspeita de VD; a
  // morfina se considera para dor refratária à terapia anti-isquêmica
  // maximamente tolerada, com monitorização. VD com PA e perfusão preservadas
  // NÃO é contraindicação — é cautela, e a hipotensão que de fato bloqueia já
  // foi checada acima, com ou sem VD.
  //
  // ⚠️ O DEFEITO ATINGIA AS DUAS ÁRVORES: esta função é consumida pela V1 e
  // pela V2. `test:vd-nao-bloqueia-morfina` existe para isso não voltar.
  // Evidência direta (V3R–V4R) OU a heurística. A cautela vale nos dois: o que
  // muda entre eles é o quão cedo se sabe, não o cuidado exigido.
  const vd = v.vd_confirmado === "sim" || suspeitaDeVd(v);
  const cautelaVd = vd
    ? " ⚠️ VD acometido: monitorize a PA a cada dose — a venodilatação reduz a pré-carga de que ele depende."
    : "";

  // ── 2. A DECISÃO JÁ TOMADA ──────────────────────────────────────────────
  if (v.decisao_morfina === "prosseguir") {
    return {
      nivel: "verde",
      titulo,
      motivo: "Função respiratória avaliada e decisão registrada — dor refratária apesar do anti-isquêmico." + cautelaVd,
      instrucao: [MORFINA_TETO],
    };
  }
  if (v.decisao_morfina === "nao_prosseguir" || v.decisao_morfina === "corrigir_antes") {
    return {
      nivel: "vermelho",
      titulo,
      motivo:
        v.decisao_morfina === "corrigir_antes"
          ? "Decidido otimizar o anti-isquêmico antes — a morfina não é o próximo passo."
          : "Decidido não administrar morfina agora.",
    };
  }

  // ── 3. O ESTADO DA ETAPA ANTI-ISQUÊMICA ─────────────────────────────────
  //
  // Lido de `estadoTerapiaAntiIsquemica`, que deriva dos dados brutos. Este
  // veredito NÃO chama `vereditoNitrato`: não há ordem de avaliação, e portanto
  // não há como a ordem virar comportamento clínico.
  const etapa = estadoTerapiaAntiIsquemica(v);

  if (etapa === "nao_avaliada") {
    // ⚠️ CINZA CONCEITUAL, EXPRESSO COMO VERMELHO SEM DECISÃO: não é
    // contraindicação, é ordem. A morfina entra para dor refratária à terapia
    // anti-isquêmica — e ela ainda não foi resolvida.
    return {
      nivel: "vermelho",
      titulo,
      motivo: "A etapa anti-isquêmica ainda não foi resolvida. Avalie o nitrato antes — a morfina é para dor que persiste apesar dele.",
    };
  }

  if (etapa === "nitrato_realizado_dor_resolvida") {
    return {
      nivel: "vermelho",
      titulo,
      motivo: "Nitrato administrado e dor resolvida — sem indicação de morfina agora.",
    };
  }

  const contexto =
    etapa === "nitrato_contraindicado"
      ? `O nitrato não é opção neste paciente (${porQueNitratoForaDeOpcao(v) ?? "contraindicado"}), e a dor continua precisando de tratamento.`
      : "Dor persistente apesar do anti-isquêmico.";

  return {
    nivel: "amarelo",
    titulo,
    motivo:
      `${contexto} Sem contraindicação entre as que o app consegue avaliar. Falta a que ele não avalia: ` +
      `insuficiência respiratória grave com retenção de CO₂ ou DPOC.` + cautelaVd,
    decisao: {
      campo: "decisao_morfina",
      saidas: [
        { tipo: "prosseguir", label: "Sem retenção de CO₂ / DPOC — administrar" },
        { tipo: "corrigir_antes", label: "Otimizar o anti-isquêmico primeiro" },
        { tipo: "nao_prosseguir", label: "Não administrar agora" },
      ],
    },
  };
}
