/**
 * Feature flag do Design System Clínico V2 "v3" — piloto de coronarianas.
 *
 * ⚠️ MESMO PADRÃO DE `lib/ui-v2-flag.ts`, E DE PROPÓSITO. A UI 2.0 já provou
 * este mecanismo (migração módulo a módulo, sem reverter commit, sem redeploy
 * de emergência) — reaproveitar a arquitetura testada é mais seguro que
 * inventar uma segunda forma de fazer a mesma coisa.
 *
 * Diferença deliberada em relação ao v2: lá o padrão hoje é "all" (rollout
 * completo, já validado). Aqui o padrão é só o piloto — "sindromes-coronarianas"
 * — porque esta rodada tem instrução explícita do autor: "Implementar apenas em
 * sindromes-coronarianas. Não migrar outros módulos ainda." Os outros 30
 * módulos continuam recebendo `emV3 = false` e renderizam exatamente como
 * hoje — nenhuma linha de UI deles muda com este arquivo.
 *
 * Como ligar/desligar sem rebuild (mesma precedência do v2: localStorage → env → padrão):
 *
 *   EXPO_PUBLIC_UI_V3=sindromes-coronarianas   # padrão, nem precisa declarar
 *   EXPO_PUBLIC_UI_V3=off                      # desliga o piloto também
 *   localStorage.setItem("ui-v3", "off")       # no navegador, sem rebuild
 *
 * Regra idêntica ao v2: esta flag decide SÓ qual árvore de componentes visuais
 * renderizar. Nunca fluxo clínico, ordem de etapas, timers ou decisão — os
 * caminhos v3/v2/legado consomem o mesmo engine, os mesmos nós, o mesmo `next`.
 */

import { useEffect, useMemo, useState } from "react";

const CHAVE_LOCAL = "ui-v3";
const TUDO = "all";
const DESLIGADO = "off";
/** Piloto desta rodada — não "all". Ver cabeçalho do arquivo. */
const PADRAO = "sindromes-coronarianas";

function preferenciaLocal(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(CHAVE_LOCAL);
  } catch {
    return null;
  }
}

function origemDaConfiguracao(): string {
  return preferenciaLocal() ?? process.env.EXPO_PUBLIC_UI_V3 ?? PADRAO;
}

function conjuntoHabilitado(): Set<string> {
  const bruto = origemDaConfiguracao().trim().toLowerCase();
  if (!bruto || bruto === DESLIGADO || bruto === "false" || bruto === "0") return new Set();
  if (bruto === TUDO || bruto === "true" || bruto === "1") return new Set([TUDO]);
  return new Set(bruto.split(",").map((id) => id.trim()).filter(Boolean));
}

export function isUiV3Enabled(moduloId: string): boolean {
  const habilitados = conjuntoHabilitado();
  if (habilitados.size === 0) return false;
  return habilitados.has(TUDO) || habilitados.has(moduloId.toLowerCase());
}

function habilitadoPorAmbiente(moduloId: string): boolean {
  const bruto = (process.env.EXPO_PUBLIC_UI_V3 ?? PADRAO).trim().toLowerCase();
  if (!bruto || bruto === DESLIGADO || bruto === "false" || bruto === "0") return false;
  if (bruto === TUDO || bruto === "true" || bruto === "1") return true;
  return bruto.split(",").map((id) => id.trim()).includes(moduloId.toLowerCase());
}

/**
 * Versão da flag para usar DENTRO do render — mesma razão do v2 (L-001):
 * o primeiro render do cliente tem de bater com o do build estático.
 */
export function useUiV3Enabled(moduloId: string): boolean {
  const doBuild = useMemo(() => habilitadoPorAmbiente(moduloId), [moduloId]);
  const [ligado, setLigado] = useState(doBuild);

  useEffect(() => {
    setLigado(isUiV3Enabled(moduloId));
  }, [moduloId]);

  return ligado;
}
