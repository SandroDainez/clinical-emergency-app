import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { abrirModulo, pressables, texto } from "./helpers";

/**
 * Rede larga: todo módulo abre, renderiza conteúdo e não derruba o app.
 *
 * É o teste mais barato e o que mais rende durante a migração. Os módulos serão
 * repaginados um a um (Fases 6 e 7); este arquivo pega na hora o caso em que uma
 * tela migrada quebra em runtime — inclusive as exceções de invariante que o
 * reducer do ACLS lança de propósito.
 */

/** Catálogo de clinical-modules.ts (id → título exibido). */
const MODULOS: Array<[string, string]> = [
  // O cabeçalho compacto do PCR mostra o rótulo clínico do módulo, não o título
  // do catálogo — "ACLS · Adulto" em vez de "PCR Adulto".
  ["pcr-adulto", "ACLS"],
  ["drogas-vasoativas", "Drogas Vasoativas"],
  ["correcoes-eletroliticas", "Correções eletrolíticas"],
  ["ritmos-acls", "Ritmos de Parada"],
  ["farmacologia-acls", "Farmacologia"],
  ["bradicardia-acls", "Bradicardia"],
  ["taquicardia-acls", "Taquicardia"],
  ["causas-reversiveis-acls", "Causas Reversíveis"],
  ["pcr-gestacao-acls", "PCR na Gestação"],
  ["ovace-adulto", "Engasgo"],
  ["pos-pcr-acls", "Pós-PCR"],
  ["calculadoras-clinicas", "Calculadoras"],
];

// ⚠️ 30 → 12 EM 2026-08-27. A reestruturação removeu a arquitetura clínica antiga;
// sobraram o PCR Adulto e seus satélites do ACLS mais as calculadoras. O número é
// conferido contra `clinical-modules.ts` logo abaixo, para que módulo novo não
// consiga entrar no app e ficar FORA desta rede — que é a rede mais barata que existe.
test("o catálogo cobre os 12 módulos clínicos, e não deixa nenhum de fora", () => {
  expect(MODULOS).toHaveLength(12);
  const fonte = readFileSync(join(__dirname, "..", "clinical-modules.ts"), "utf8");
  const idsDoApp = [...fonte.matchAll(/^\s*id: "([a-z0-9-]+)",/gm)].map((m) => m[1]);
  expect(idsDoApp.length).toBeGreaterThan(5); // vacuidade: leitura quebrada ≠ nada a cobrir
  expect([...idsDoApp].sort()).toEqual(MODULOS.map(([id]) => id).sort());
});

for (const [id, titulo] of MODULOS) {
  test(`módulo "${id}" abre sem erro`, async ({ page }) => {
    const erros: string[] = [];
    // Sem tolerância: L-001 foi corrigido (generateStaticParams em
    // app/modulos/[id].tsx). Qualquer erro de hidratação agora é regressão.
    page.on("pageerror", (e) => erros.push(e.message));

    await abrirModulo(page, id);

    const conteudo = await texto(page);
    expect(conteudo, `"${id}" deveria exibir seu título`).toContain(titulo);
    expect(
      conteudo.length,
      `"${id}" deveria renderizar conteúdo, não uma tela vazia`
    ).toBeGreaterThan(200);
    await expect(
      pressables(page).first(),
      `"${id}" deveria ter algo tocável`
    ).toBeVisible();

    expect(erros, `"${id}" lançou exceção em runtime`).toEqual([]);
  });
}
