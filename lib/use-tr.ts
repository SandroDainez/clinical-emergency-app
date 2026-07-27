import { useCallback } from "react";

import { tr as trBase } from "./i18n";
import { useLanguage } from "./language-context";

/**
 * Tradutor ligado ao idioma DO RENDER.
 *
 * Por que existe: chamar `tr("literal")` sem argumento de idioma deixa a chamada
 * elegível a hoisting/constant-folding pelo minificador — em produção o texto
 * congelava no idioma inicial mesmo com o React re-renderizando (bug observado
 * na landing e, antes dele, no cabeçalho do app de PCR). Passando o `locale`
 * vindo do render, a chamada depende de um valor que muda a cada troca de
 * idioma e não pode ser pré-avaliada na build.
 *
 * Usar em TODO componente que exibe texto traduzido:
 *   const tr = useTr();
 *
 * `tr` daqui usa o dicionário completo do app (lib/i18n), que já encadeia os
 * dicionários do ACLS ao final — é um superconjunto de `acls/locales`.
 */
export function useTr(): (pt: string) => string {
  const { locale } = useLanguage();
  return useCallback((pt: string) => trBase(pt, locale), [locale]);
}
