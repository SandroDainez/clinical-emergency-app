/**
 * Hidrocortisona — apresentação e o passo que o app não tinha.
 *
 * ── O ACHADO ────────────────────────────────────────────────────────────────
 *
 * R-48 na forma mais completa encontrada nesta auditoria: a apresentação da
 * hidrocortisona NÃO EXISTIA EM NENHUM LUGAR DO APP. Não é "falta na superfície
 * de ação" — faltava em todas.
 *
 * E o fármaco é PÓ LIOFILIZADO: quem chega ao frasco esperando uma solução
 * pronta perde tempo no choque séptico refratário, que é justamente onde o
 * tempo já está curto.
 *
 * ── ⚠️ O VOLUME DE RECONSTITUIÇÃO NÃO ESTÁ AQUI, E É DELIBERADO ────────────
 *
 * Quatro tentativas de fonte primária falharam: o PDF da Blau é digitalizado
 * (imagem), o da Pfizer tem fonte codificada que não extrai, bula.gratis
 * devolveu 403 e o InfoSUS está com certificado expirado.
 *
 * NÃO ESCREVER O NÚMERO É A DECISÃO CERTA, não uma falha: o volume varia por
 * apresentação e por fabricante — frasco simples e Act-O-Vial (com diluente
 * acoplado) não se reconstituem igual. Um número de memória num fármaco que vai
 * em bomba é exatamente o erro que esta auditoria existe para caçar.
 *
 * PENDÊNCIA COM CAMINHO: quem tiver o frasco em mãos fecha isto em trinta
 * segundos, e o número entra como FONTE PRIMÁRIA — melhor que qualquer PDF.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · Bibliomed (genéricos) e bula Solu-Cortef/ANVISA: "pó liofilizado para
 *    solução injetável — 100 mg e 500 mg".
 *  · Solu-Cortef 100 mg contém 134 mg de succinato sódico de hidrocortisona,
 *    equivalentes a 100 mg de hidrocortisona base.
 *  · InfoSUS/SC: padronizada pelo Ministério da Saúde (CBAF) nas DUAS
 *    apresentações.
 */

export const HIDROCORTISONA_APRESENTACAO =
  "APRESENTAÇÃO: succinato sódico de hidrocortisona, PÓ LIOFILIZADO em frasco-ampola de 100 mg e de 500 mg — as duas padronizadas pelo SUS. ⚠️ NÃO VEM PRONTA: precisa ser reconstituída antes de qualquer coisa, e é aí que se perde tempo no choque refratário. CONFIRA O VOLUME DE RECONSTITUIÇÃO NO PRÓPRIO FRASCO — ele varia por apresentação e por fabricante, e o frasco com diluente acoplado (Act-O-Vial) não se reconstitui como o frasco simples. No rótulo, 134 mg de succinato equivalem a 100 mg de hidrocortisona base: a dose que se prescreve é a da BASE.";
