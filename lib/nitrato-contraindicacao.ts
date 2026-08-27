import type { TreeValues } from "../core/decision-tree/types";
import { lerPde5, JANELA_PDE5_DESCONHECIDA_H } from "./pde5";

/**
 * AS CONTRAINDICAÇÕES DO NITRATO, COMO PREDICADO PURO.
 *
 * ── ⚠️ POR QUE ESTE ARQUIVO EXISTE, E NÃO É UM DETALHE DE ORGANIZAÇÃO ──────
 *
 * Duas coisas precisam da mesma resposta: `vereditoNitrato`, para dizer 🔴 com
 * o motivo, e `estadoTerapiaAntiIsquemica`, para saber se a etapa
 * anti-isquêmica foi resolvida como "não se aplica".
 *
 * A saída fácil seria o estado derivado CHAMAR o veredito. O autor barrou, e
 * pela razão certa (2026-08-27): "eu não faria vereditoMorfina() chamar
 * vereditoNitrato() — a ordem de avaliação pode começar a determinar
 * comportamento clínico". A outra saída fácil seria duplicar as condições nos
 * dois lugares — e duas cópias da mesma regra divergem em silêncio, sendo que a
 * que estiver errada é a que decide.
 *
 * Então a regra vive AQUI, sem depender de ninguém, e os dois consumidores a
 * leem. O grafo fica acíclico:
 *
 *     nitrato-contraindicacao ─┬→ terapia-anti-isquemica ─┐
 *                              └→ vereditos-sca ←─────────┘
 *
 * ── O QUE É CONTRAINDICAÇÃO AQUI ───────────────────────────────────────────
 *
 * PAS < 90 · inibidor de PDE-5 dentro da janela (ou não afastado) · suspeita de
 * infarto de VD · pressão não medida. "Não afastado" conta como presente:
 * desconhecido não é negativo.
 */

export type MotivoNitrato =
  | "hipotensao"
  | "pde5_nao_verificado"
  | "pde5_na_janela"
  | "pde5_indeterminado"
  | "vd"
  | "pa_nao_medida";

export type ContraindicacaoNitrato = { presente: boolean; motivo: MotivoNitrato | null; texto: string };

const SEM: ContraindicacaoNitrato = { presente: false, motivo: null, texto: "" };

function num(x: string | undefined): number {
  return x === undefined || x.trim() === "" ? NaN : Number(x);
}

/**
 * Suspeita de infarto de ventrículo direito.
 *
 * ⚠️ SUPRA INFERIOR SOZINHO NÃO BASTA (regra do autor): é preciso o supra
 * inferior E um sinal de que o VD está comprometendo a hemodinâmica — ou
 * hipoperfusão, ou hipotensão, ou hipotensão com pulmões limpos.
 */
export function suspeitaDeVd(v: TreeValues): boolean {
  if (v.supra_inferior !== "sim") return false;
  const pas = num(v.pas);
  const hipotenso = Number.isFinite(pas) && pas < 90;
  const hipoperfusao = v.cor_perfusao === "sim";
  const pulmoesLimpos = v.cor_edema_pulmonar === "nao";
  return hipoperfusao || (hipotenso && pulmoesLimpos) || hipotenso;
}

/** A contraindicação do nitrato, com o motivo. Função pura, sem dependências. */
export function contraindicacaoDoNitrato(v: TreeValues): ContraindicacaoNitrato {
  const pas = num(v.pas);

  if (Number.isFinite(pas) && pas < 90) {
    return { presente: true, motivo: "hipotensao", texto: `PAS ${v.pas} mmHg — abaixo de 90, o limiar da própria dose.` };
  }

  const pde5 = lerPde5(v);
  if (pde5.estado === "nao_perguntado") {
    return {
      presente: true,
      motivo: "pde5_nao_verificado",
      texto: "Uso de inibidor de PDE-5 ainda não verificado — pergunte antes de administrar.",
    };
  }
  if (pde5.estado === "dentro_da_janela") {
    return {
      presente: true,
      motivo: "pde5_na_janela",
      texto: `Última dose de inibidor de PDE-5 há ${pde5.desdeUltimaDoseH} h — dentro da janela de ${pde5.janelaH} h.`,
    };
  }
  if (pde5.estado === "indeterminado") {
    return {
      presente: true,
      motivo: "pde5_indeterminado",
      texto:
        pde5.falta === "horario"
          ? "Usou inibidor de PDE-5 e o horário da última dose não foi determinado — a janela não pode ser aplicada."
          : pde5.falta === "farmaco"
            ? `Fármaco não identificado e última dose há ${pde5.desdeUltimaDoseH} h — abaixo das ${JANELA_PDE5_DESCONHECIDA_H} h que afastariam qualquer um deles.`
            : "Uso de inibidor de PDE-5 não afastado.",
    };
  }

  // ⚠️ V3R–V4R POSITIVO É EVIDÊNCIA DIRETA, e até 2026-08-27 ninguém a lia.
  // A tela do VD na V2 gravava `vd_confirmado` e NENHUMA função consumia o
  // campo — o médico registrava as derivações direitas e o app ignorava a
  // resposta. Pior: o comentário do nó afirmava que o valor "alimenta o
  // veredito do nitrato".
  //
  // A distinção importa porque `suspeitaDeVd` é HEURÍSTICA e só dispara quando
  // já existe comprometimento hemodinâmico — ou seja, tarde. O supra em
  // V3R–V4R contraindica o nitrato ANTES disso, que é o ponto de fazer o
  // traçado direito.
  if (v.vd_confirmado === "sim") {
    return {
      presente: true,
      motivo: "vd",
      texto: "Supra em V3R–V4R — infarto de ventrículo direito confirmado. O VD depende de pré-carga; a conduta é volume, não vasodilatador.",
    };
  }

  if (suspeitaDeVd(v)) {
    return {
      presente: true,
      motivo: "vd",
      texto: "Suspeita de infarto de VD — o ventrículo direito infartado depende de pré-carga. Registre V3R–V4R.",
    };
  }

  if (!Number.isFinite(pas)) {
    return { presente: true, motivo: "pa_nao_medida", texto: "Pressão não medida — a dose exige PAS conhecida e ≥ 90 mmHg." };
  }

  return SEM;
}
