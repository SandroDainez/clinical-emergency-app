import type { TreeValues, Veredito } from "../core/decision-tree/types";
import { BETABLOQUEADOR_AGUDO_DOSE, BETABLOQUEADOR_INDICACAO } from "./betabloqueador-agudo";
import { NITRATO_DOSE_IV, NITRATO_DOSE_SL, NITRATO_DOSE_SL_ALTERNATIVA } from "./nitrato-dose";
import { temAlgum } from "../core/decision-tree/estado-clinico";
import { JANELA_PDE5_DESCONHECIDA_H, lerPde5 } from "./pde5";
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

/**
 * SUSPEITA DE VD — derivada de CONTEXTO, nunca da ausência de um exame.
 *
 * ⚠️ CORREÇÃO DO AUTOR (2026-08-25). A primeira versão deste desenho bloqueava
 * o nitrato em TODO infarto inferior enquanto V3R–V4R não fosse registrado.
 * Era overblocking: a maioria dos inferiores não tem VD hemodinamicamente
 * relevante, e negar nitrato a todos eles por causa de um exame ainda não
 * feito troca um risco por outro.
 *
 * A suspeita exige o supra inferior E pelo menos um elemento compatível. O
 * mais discriminante está aqui de propósito: HIPOTENSÃO COM PULMÕES LIMPOS é o
 * padrão que separa o VD da falência de ventrículo esquerdo — no VE a mesma
 * hipotensão vem com congestão.
 *
 * Fonte da conduta: `VD_CONTRAINDICA_PRE_CARGA` (lib/oclusao-sem-supra.ts) —
 * "o nitrato sublingual dado por reflexo na dor torácica é o mecanismo mais
 * comum" de hipotensão grave no VD infartado.
 */
export function suspeitaDeVd(v: TreeValues): boolean {
  if (v.supra_inferior !== "sim") return false;
  const pas = num(v.pas);
  const hipotenso = Number.isFinite(pas) && pas < 100;
  const pulmoesLimpos = temAlgum(v, "ausculta_pulmonar", ["Limpa"]) && !congestao(v);
  return hipoperfusao(v) || (hipotenso && pulmoesLimpos) || (Number.isFinite(pas) && pas < 90);
}

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
  const pas = num(v.pas);

  if (Number.isFinite(pas) && pas < 90) {
    return { nivel: "vermelho", titulo, motivo: `PAS ${v.pas} mmHg — abaixo de 90, o limiar da própria dose.` };
  }
  // ⚠️ DESCONHECIDO NÃO É NEGATIVO (regra do autor, 2026-08-26). `undefined`
  // aqui significa "ninguém perguntou ainda", e `nao_sei` significa "perguntei
  // e ele não sabe" — nos dois casos o app NÃO demonstrou que o nitrato é
  // seguro, e a nitroglicerina com PDE-5 recente causa hipotensão refratária,
  // que é uma das poucas coisas que a dor torácica pode piorar até a morte.
  //
  // Tratar ausência de resposta como ausência de contraindicação era o defeito:
  // o app liberava a dose sobre um dado que nunca teve.
  //
  // ⚠️ A JANELA É POR FÁRMACO, NÃO UM "SIM/NÃO" (correção do autor,
  // 2026-08-26). Eu havia proposto tratar uso habitual como contraindicação
  // permanente; a ACC/AHA 2025 não cria essa categoria — ela dá janelas
  // (12 h avanafila · 24 h sildenafila/vardenafila · 48 h tadalafila). Ver
  // `lib/pde5.ts` para por que "permanente" teria sido inferência minha
  // promovida a regra.
  const pde5 = lerPde5(v);
  if (pde5.estado === "nao_perguntado") {
    return {
      nivel: "vermelho",
      titulo,
      motivo: "Uso de inibidor de PDE-5 ainda não verificado — pergunte antes de administrar.",
    };
  }
  if (pde5.estado === "dentro_da_janela") {
    return {
      nivel: "vermelho",
      titulo,
      motivo: `Última dose de inibidor de PDE-5 há ${pde5.desdeUltimaDoseH} h — dentro da janela de ${pde5.janelaH} h.`,
    };
  }
  if (pde5.estado === "indeterminado") {
    return {
      nivel: "vermelho",
      titulo,
      motivo:
        pde5.falta === "horario"
          ? "Usou inibidor de PDE-5 e o horário da última dose não foi determinado — a janela não pode ser aplicada."
          : pde5.falta === "farmaco"
            ? `Fármaco não identificado e última dose há ${pde5.desdeUltimaDoseH} h — abaixo das ${JANELA_PDE5_DESCONHECIDA_H} h que afastariam qualquer um deles.`
            : "Uso de inibidor de PDE-5 não afastado.",
    };
  }
  if (suspeitaDeVd(v)) {
    return {
      nivel: "vermelho",
      titulo,
      motivo: "Suspeita de infarto de VD — o ventrículo direito infartado depende de pré-carga. Registre V3R–V4R.",
    };
  }
  if (!Number.isFinite(pas)) {
    return { nivel: "vermelho", titulo, motivo: "Pressão não medida — a dose exige PAS conhecida e ≥ 90 mmHg." };
  }
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
  return {
    nivel: "verde",
    titulo,
    motivo: "Sem alergia, sem sangramento ativo e dissecção afastada no portão.",
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

  if (Number.isFinite(pas) && pas < 90) {
    return { nivel: "vermelho", titulo, motivo: `PAS ${v.pas} mmHg — hipotensão contraindica a morfina.` };
  }
  if (v.cor_perfusao === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Sinais de hipoperfusão — instabilidade hemodinâmica contraindica a morfina." };
  }
  if (v.cor_consciencia === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Rebaixamento do nível de consciência — a depressão respiratória se soma ao que já existe." };
  }
  if (suspeitaDeVd(v)) {
    return {
      nivel: "vermelho",
      titulo,
      motivo: "Suspeita de infarto de VD — a venodilatação reduz a pré-carga de que o ventrículo direito depende.",
    };
  }
  // ⚠️ A DOSE NÃO PODE VIVER NO AMARELO. Descobri isto conferindo o shell:
  // `CardDeVeredito` renderiza `instrucao` em QUALQUER nível — o comentário ao
  // lado afirma que ela "só aparece com o veredito que a autoriza", mas quem
  // sustenta isso é a disciplina de quem escreve o veredito, não o componente.
  // Hoje não quebra porque só o verde define `instrucao`; pôr a dose num
  // amarelo a imprimiria ANTES da decisão, que é o defeito de origem em forma
  // nova. `test:dose-governada` passou a cobrar isso.
  //
  // Então o amarelo PERGUNTA, e só o "prosseguir" registrado produz a dose.
  if (v.decisao_morfina === "prosseguir") {
    return {
      nivel: "verde",
      titulo,
      motivo: "Função respiratória avaliada e decisão registrada — dor refratária apesar do anti-isquêmico.",
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
  // ⚠️ AMARELO, NÃO VERDE, no melhor caso. Ver o bloco no topo: a retenção de
  // CO₂ / DPOC não é derivável do que se coletou, e chamar de verde seria o app
  // afirmando "sem contraindicação" sobre algo que ele não olhou.
  return {
    nivel: "amarelo",
    titulo,
    motivo:
      "Sem contraindicação entre as que o app consegue avaliar. Falta a que ele não avalia: insuficiência respiratória grave com retenção de CO₂ ou DPOC. Morfina só se a dor persistir apesar do anti-isquêmico otimizado.",
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
