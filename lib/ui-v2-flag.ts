/**
 * Feature flag da UI 2.0 (Fase 0.3 do plano).
 *
 * Permite migrar a interface módulo a módulo mantendo a versão antiga
 * disponível: se uma tela nova apresentar problema durante a validação, basta
 * tirar o módulo da lista — sem reverter commit, sem redeploy de emergência.
 *
 * Como ligar
 * ----------
 * Por variável de ambiente, no `.env.local` (Expo expõe as que começam com
 * EXPO_PUBLIC_ ao app):
 *
 *   EXPO_PUBLIC_UI_V2=all                        # tudo na UI nova
 *   EXPO_PUBLIC_UI_V2=ritmos-acls                # só o piloto
 *   EXPO_PUBLIC_UI_V2=ritmos-acls,farmacologia-acls
 *   EXPO_PUBLIC_UI_V2=off                        # nada (padrão)
 *
 * No navegador também dá para alternar sem rebuild, útil para validar em
 * produção com o usuário junto:
 *
 *   localStorage.setItem("ui-v2", "ritmos-acls")
 *
 * Precedência: localStorage (só web) → variável de ambiente → desligado.
 *
 * Regra importante: esta flag decide APENAS qual árvore de componentes visuais
 * renderizar. Ela nunca deve alterar fluxo clínico, ordem de etapas, timers ou
 * qualquer decisão — os dois caminhos consomem exatamente o mesmo engine.
 */

import { useEffect, useMemo, useState } from "react";

const CHAVE_LOCAL = "ui-v2";
const TUDO = "all";
const DESLIGADO = "off";

/** Lê a preferência do navegador; ausente em nativo ou modo privado. */
function preferenciaLocal(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(CHAVE_LOCAL);
  } catch {
    return null;
  }
}

function origemDaConfiguracao(): string {
  return (
    preferenciaLocal() ??
    process.env.EXPO_PUBLIC_UI_V2 ??
    DESLIGADO
  );
}

function conjuntoHabilitado(): Set<string> {
  const bruto = origemDaConfiguracao().trim().toLowerCase();
  if (!bruto || bruto === DESLIGADO || bruto === "false" || bruto === "0") {
    return new Set();
  }
  if (bruto === TUDO || bruto === "true" || bruto === "1") return new Set([TUDO]);
  return new Set(
    bruto
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

/**
 * A UI 2.0 está ativa para este módulo?
 *
 * @param moduloId id do catálogo em clinical-modules.ts (ex.: "ritmos-acls")
 */
export function isUiV2Enabled(moduloId: string): boolean {
  const habilitados = conjuntoHabilitado();
  if (habilitados.size === 0) return false;
  return habilitados.has(TUDO) || habilitados.has(moduloId.toLowerCase());
}

/** Módulos com a UI 2.0 ligada — para a tela de diagnóstico e para os testes. */
export function listarModulosUiV2(): string[] {
  return [...conjuntoHabilitado()];
}

/** Somente a configuração de build — sem ler localStorage. */
function habilitadoPorAmbiente(moduloId: string): boolean {
  const bruto = (process.env.EXPO_PUBLIC_UI_V2 ?? DESLIGADO).trim().toLowerCase();
  if (!bruto || bruto === DESLIGADO || bruto === "false" || bruto === "0") return false;
  if (bruto === TUDO || bruto === "true" || bruto === "1") return true;
  return bruto.split(",").map((id) => id.trim()).includes(moduloId.toLowerCase());
}

/**
 * Versão da flag para usar DENTRO do render.
 *
 * Por que não chamar `isUiV2Enabled()` direto num componente: na web o app é
 * pré-renderizado no build, onde `localStorage` não existe. Se o render decidir
 * pela flag lida do navegador, o HTML do build mostra uma tela e o primeiro
 * render do cliente mostra outra — hydration mismatch, o mesmo React #418 do
 * L-001. Foi exactamente o que aconteceu ao ligar o piloto da Fase 3.
 *
 * A correção é o primeiro render do cliente coincidir com o do build: começa no
 * valor do ambiente e só depois de montado passa a considerar o localStorage.
 * Em nativo não há pré-render, e o efeito roda imediatamente após o primeiro
 * render — sem diferença prática.
 */
export function useUiV2Enabled(moduloId: string): boolean {
  const doBuild = useMemo(() => habilitadoPorAmbiente(moduloId), [moduloId]);
  const [ligado, setLigado] = useState(doBuild);

  useEffect(() => {
    setLigado(isUiV2Enabled(moduloId));
  }, [moduloId]);

  return ligado;
}
