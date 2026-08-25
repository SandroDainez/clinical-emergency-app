/**
 * Betabloqueador na fase aguda da SCA — em fonte única.
 *
 * ⚠️ REESCRITO (2026-08-25, correção pré-congelamento) — a versão anterior
 * trazia "metoprolol tartarato 25–50 mg VO a cada 6–12h" como se fosse a
 * posologia da ACC/AHA 2025. O autor corrigiu: **essa dose não vem da
 * guideline 2025**, e apresentá-la ao lado da atribuição da fonte daria
 * procedência de diretriz a um número que ela não fixa. O que a fonte
 * declara é o **quando/em quem**, não o miligrama:
 *
 *   → terapia ORAL PRECOCE, nas primeiras 24 h,
 *   → apenas em paciente ESTABILIZADO,
 *   → e sem contraindicações.
 *
 * Por isso a dose específica saiu daqui. Se você quiser um fármaco/dose
 * fixos na tela, isso volta como decisão clínica declarada — com a fonte
 * daquele número, que não é a diretriz de 2025.
 *
 * ⚠️ IV FICA SEPARADO, POR DECISÃO EXPLÍCITA. Betabloqueador intravenoso na
 * fase aguda é outra indicação, com outro perfil de risco (o push IV de
 * rotina tem histórico de aumentar choque cardiogênico em subgrupos
 * vulneráveis — COMMIT/CCS-2). Este arquivo cobre SÓ a via oral precoce;
 * nenhuma constante daqui deve ser reaproveitada para justificar IV.
 *
 * ⚠️ A MANUTENÇÃO PÓS-ALTA é fase diferente e vive em
 * `coronary-decision-tree.ts` (`prevencao_secundaria`) — succinato de
 * liberação prolongada, uma vez ao dia. Não confundir com o início agudo.
 */
export const BETABLOQUEADOR_INDICACAO =
  "Betabloqueador — SÓ EM PACIENTE SELECIONADO, não é terapia automática de todo IAM: indicado para controle de frequência cardíaca e efeito anti-isquêmico em quem está hemodinamicamente estável, sem sinais de baixo débito.";

export const BETABLOQUEADOR_AGUDO_DOSE =
  "Via ORAL, precoce (primeiras 24 h), apenas em paciente já ESTABILIZADO e sem contraindicações. ⚠️ Este app não fixa fármaco/dose aqui: a ACC/AHA 2025 recomenda o momento e o perfil do paciente, não uma posologia específica — seguir a padronização do serviço.";

// ⚠️ IV É OUTRA INDICAÇÃO — declarado, não silenciado. Sem esta linha, a
// ausência de menção ao IV poderia ser lida como "tanto faz a via".
export const BETABLOQUEADOR_IV_SEPARADO =
  "⚠️ Betabloqueador INTRAVENOSO não é a via desta recomendação — é indicação separada, com risco próprio na fase aguda. Não converter a orientação oral acima em prescrição IV.";

export const BETABLOQUEADOR_CONTRAINDICACAO =
  "NÃO iniciar se: IC aguda, baixo débito, BAV de 2º/3º grau sem marcapasso, ou broncoespasmo ativo.";
