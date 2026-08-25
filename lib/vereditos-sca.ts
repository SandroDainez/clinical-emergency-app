import type { TreeValues, Veredito } from "../core/decision-tree/types";
import { BETABLOQUEADOR_AGUDO_DOSE, BETABLOQUEADOR_INDICACAO } from "./betabloqueador-agudo";
import { NITRATO_DOSE_SL } from "./nitrato-dose";
import { temAlgum } from "../core/decision-tree/estado-clinico";

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
  if (v.pde5_recente === "sim") {
    return { nivel: "vermelho", titulo, motivo: "Uso recente de inibidor de PDE-5 — risco de hipotensão grave." };
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
    motivo: `PAS ${v.pas} mmHg, sem contraindicação identificada.`,
    instrucao: [NITRATO_DOSE_SL],
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
