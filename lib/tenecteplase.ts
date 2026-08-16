/**
 * Tenecteplase (TNK) — apresentação e preparo, na superfície onde é dada.
 *
 * R-48. O módulo calcula a dose por peso e manda dar em bolus único, sem dizer
 * a forma do fármaco. Busca no módulo por "ampola", "frasco", "diluir",
 * "mg/mL": ZERO — para os OITO fármacos que ele administra.
 *
 * ⚠️ E AQUI O ERRO DE PREPARO É A FIBRINÓLISE ERRADA. O TNK vem em pó
 * liofilizado com diluente próprio, e a dose é prescrita em MILIGRAMAS enquanto
 * o frasco também é rotulado em UNIDADES — 1 mg = 200 U. Quem confunde as duas
 * escalas erra por um fator de duzentos, num fármaco de bolus único e sem volta.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · Apresentação nacional: Metalyse (Boehringer) — frasco-ampola de 50 mg
 *    (10.000 U) com seringa de água para injeção acompanhante; a bula declara a
 *    equivalência 1 mg = 200 U.
 *  · ⚠️ NÃO consegui abrir a bula ANVISA em fonte primária nesta sessão. A
 *    equivalência e a apresentação vêm de referências secundárias convergentes,
 *    e por isso o texto manda CONFERIR NO FRASCO em vez de afirmar volumes de
 *    reconstituição. Declarado em vez de inventado (R-5), como na
 *    hidrocortisona.
 */

export const TENECTEPLASE_APRESENTACAO =
  "APRESENTAÇÃO E PREPARO — o TNK vem em PÓ LIOFILIZADO com diluente próprio (frasco de 50 mg = 10.000 U), e é reconstituído na hora. ⚠️ DUAS ESCALAS NO MESMO FRASCO: a dose se prescreve em MILIGRAMAS e o rótulo também traz UNIDADES — 1 mg = 200 U. Confundir as duas erra por um fator de 200, e o TNK é bolus ÚNICO: não há como corrigir depois. Confira no frasco o volume de reconstituição e o volume correspondente à dose calculada ANTES de aspirar, com um segundo profissional conferindo.";
