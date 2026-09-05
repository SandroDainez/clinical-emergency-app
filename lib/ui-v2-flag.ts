/**
 * Estado da UI 2.0.
 *
 * A migração incremental terminou: a UI v2/Clinical Cockpit é agora a única
 * interface de atendimento suportada. O shell legado permanece no repositório
 * apenas enquanto a limpeza estrutural termina, mas não pode mais ser reativado
 * por variável de ambiente ou localStorage.
 *
 * Motivo de segurança/consistência: o caminho antigo ainda contém padrões de
 * interação que o produto já proibiu (inclusive fallback de TextInput numérico).
 * Um rollback visual não pode reintroduzir silenciosamente um comportamento que
 * a camada nova bloqueia. Se houver necessidade real de rollback, ele deve ser
 * feito por reversão de código/versionamento, não por feature flag em produção.
 *
 * Esta decisão continua sendo somente de APRESENTAÇÃO. Engine, ordem clínica,
 * timers, decisões e transições não são alterados por este arquivo.
 */

const TUDO = "all";

// Mantido explícito porque a auditoria de padrões lê esta constante para provar
// que todos os módulos estão no mesmo universo visual.
const PADRAO = TUDO;
void PADRAO;

/** A UI v2 é a interface canônica para qualquer módulo. */
export function isUiV2Enabled(_moduloId: string): boolean {
  return true;
}

/** Versão para uso dentro do render; sem troca pós-mount e sem hydration split. */
export function useUiV2Enabled(_moduloId: string): boolean {
  return true;
}
