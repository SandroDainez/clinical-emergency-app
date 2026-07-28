import { expect, test } from "@playwright/test";
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
  ["sepse-adulto", "Sepse"],
  ["drogas-vasoativas", "Drogas Vasoativas"],
  ["correcoes-eletroliticas", "Correções eletrolíticas"],
  ["isr-rapida", "ISR"],
  ["edema-agudo-pulmao", "Edema Agudo de Pulmão"],
  ["cetoacidose-hiperosmolar", "CAD"],
  ["ventilacao-mecanica", "Ventilação mecânica"],
  ["anafilaxia", "Anafilaxia"],
  ["avc", "AVC"],
  ["sindromes-coronarianas", "Síndromes Coronarianas"],
  ["ritmos-acls", "Ritmos de Parada"],
  ["farmacologia-acls", "Farmacologia"],
  ["bradicardia-acls", "Bradicardia"],
  ["taquicardia-acls", "Taquicardia"],
  ["causas-reversiveis-acls", "Causas Reversíveis"],
  ["pos-pcr-acls", "Pós-PCR"],
  ["tep", "Tromboembolia Pulmonar"],
  ["pre-eclampsia", "clâmpsia"],
  ["sedoanalgesia", "Sedoanalgesia"],
  ["calculadoras-clinicas", "Calculadoras"],
  ["politrauma", "Politrauma"],
  ["tce", "TCE"],
  ["crises-convulsivas", "convulsivas"],
  ["intoxicacoes-exogenas", "Intoxicações"],
  ["choque", "Choque"],
  ["insuficiencia-respiratoria", "Insuficiência respiratória"],
  ["abdome-agudo", "Abdome agudo"],
];

test("o catálogo cobre os 28 módulos clínicos", () => {
  expect(MODULOS).toHaveLength(28);
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
