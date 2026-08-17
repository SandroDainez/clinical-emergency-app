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

/**
 * Padrão da UI 2.0: LIGADA.
 *
 * Ficou desligada durante as Fases 3 a 8 para a migração ser validada tela a
 * tela. Isso teve um custo que só apareceu quando o usuário reportou defeitos:
 * ele estava avaliando a interface ANTIGA e relatando como problemas justamente
 * as coisas já corrigidas — cabeçalho ocupando o topo, painel em chips
 * empilhados, ação principal fora da tela.
 *
 * Melhoria que não chega ao usuário não é melhoria. Com 85 testes E2E cobrindo
 * paridade de conteúdo clínico, travessia dos fluxos, contraste e alvo de
 * toque, o padrão passa a ser a versão nova.
 *
 * Para voltar à antiga: `EXPO_PUBLIC_UI_V2=off`, ou no navegador
 * `localStorage.setItem("ui-v2", "off")`.
 */
const PADRAO = TUDO;

function origemDaConfiguracao(): string {
  return (
    preferenciaLocal() ??
    process.env.EXPO_PUBLIC_UI_V2 ??
    PADRAO
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

/*
 * ⚠️ AQUI VIVIA `COM_CABECALHO_PROPRIO` — uma lista escrita à mão com 24 dos 31
 * módulos, dizendo quais telas desenhavam o próprio cabeçalho. Ela morreu em
 * 2026-08-17 e NÃO deve voltar.
 *
 * O motivo não é estético. A medição em produção, por coordenada, mostrou a
 * lista ERRADA nas SETE ausências: todos os sete módulos que ela deixava de
 * fora desenhavam cabeçalho próprio TAMBÉM, e as telas mostravam o título duas
 * vezes. Um deles era a Injúria Renal Aguda, criada no dia anterior — escrevi o
 * módulo e não escrevi a linha.
 *
 * A inversão: a ROTA não desenha cabeçalho nenhum, e cada tela desenha o seu.
 * Assim não existe mais a pergunta "esta está na lista?", que era a pergunta
 * que ninguém lembrava de responder ao criar um módulo. Uma lista de exceção
 * "hoje vazia" seria a semente do mesmo defeito.
 *
 * Quem garante: `e2e/um-cabecalho-por-tela.spec.ts`, que mede nos 31 e reprova
 * tanto a duplicação quanto a ausência de cabeçalho.
 */

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
