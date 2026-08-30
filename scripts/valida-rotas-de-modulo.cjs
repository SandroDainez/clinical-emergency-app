/**
 * PROMETE: que o segmento `app/modulos/` ⛔ NUNCA volte a ter uma rota estática
 *   irmã de `[id].tsx` — porque uma irmã estática quebra o **voltar do
 *   navegador** entre duas telas de módulo, montando a irmã no lugar da rota
 *   pedida.
 * NÃO PROMETE: que a navegação funcione — isso é `e2e/retomada-de-fluxo`, que
 *   mede o comportamento com cliques reais. Esta trava mede a CONDIÇÃO
 *   estrutural que o produz, porque o e2e ⛔ só a pegaria no módulo que ele
 *   percorre, e o defeito nasce em QUALQUER módulo novo.
 * UNIVERSO: os arquivos de rota de `app/modulos/`, listados e contados.
 *
 * ── O DEFEITO QUE ESTA TRAVA NASCEU PARA MATAR (D-122, 2026-08-30) ─────────
 *
 * `app/modulos/avc.tsx` era rota estática irmã de `[id].tsx`. Com ela ali, o
 * médico entrava em **bradicardia**, abria as **vasoativas** pelo atalho de
 * estabilização, tocava em **voltar** — e caía no **módulo de AVC**, com a URL
 * da bradicardia na barra de endereço. Tela de um paciente sobre o fluxo de
 * outro.
 *
 * ⚠️⚠️ E ele passou **quatro rodadas de `test:all`** como *"1 falhou,
 * pré-existente"*. Vermelho tolerado é vermelho que ⛔ não é mais lido.
 *
 * ⚠️ Investigação: renomear o arquivo ⛔ não resolvia (reproduziu como
 * `zoutro.tsx`), declarar `<Stack.Screen>` ⛔ não resolvia, a forma de diretório
 * (`avc/index.tsx`) ⛔ não resolvia. O que resolve é ⛔ **não haver irmã**.
 */
const fs = require("node:fs");
const path = require("node:path");

const dir = path.resolve(__dirname, "..", "app", "modulos");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const entradas = fs.readdirSync(dir, { withFileTypes: true });
const nomes = entradas.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).sort();

/** ⚠️ `_layout` ⛔ não é rota: ele é a moldura do segmento. */
const ehLayout = (n) => n === "_layout.tsx";
const ehDinamica = (n) => n.startsWith("[");
const rotas = nomes.filter((n) => !ehLayout(n));

confere("o segmento `app/modulos/` foi lido, e ⛔ não está vazio",
  rotas.length >= 1,
  "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");

confere("a rota dinâmica `[id].tsx` continua existindo",
  rotas.some((n) => ehDinamica(n)),
  "sem ela ⛔ nenhum módulo tem tela, e a trava passaria a guardar um segmento morto");

const irmasEstaticas = rotas.filter((n) => !ehDinamica(n));
confere("⛔ NENHUMA rota estática irmã de `[id].tsx`",
  irmasEstaticas.length === 0,
  `encontradas: ${irmasEstaticas.join(", ") || "—"}. `
  + "Uma irmã estática faz o VOLTAR DO NAVEGADOR montar ELA no lugar da rota pedida "
  + "— o médico volta da tela de vasoativas e cai noutro módulo, com a URL do certo. "
  + "Uma tela nova de módulo entra por `[id].tsx`, e o id em `generateStaticParams`");

console.log(`\nRotas em app/modulos/: ${rotas.join(", ")}`);
if (falhas.length > 0) {
  console.error(`\n❌ PROVA DAS ROTAS DE MÓDULO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ PROVA DAS ROTAS DE MÓDULO — ${ok}/${ok} conferências\n`);
