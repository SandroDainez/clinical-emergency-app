#!/usr/bin/env node
/**
 * O CATÁLOGO DE ANTIMICROBIANOS — sobreposição e buraco reprovam.
 *
 * PROMETE: que as faixas de cada fármaco cubram a reta de ClCr SEM SOBREPOSIÇÃO e
 *   SEM BURACO, de 0 ao infinito; que toda faixa declare `metodoDaTFG` e
 *   procedência (fonte + força, ou `pendente` COM a pendência escrita); que as
 *   três modalidades de diálise existam, ainda que como `sem_dados` declarado; e
 *   que os quatro estados de `ajusteRenal` sejam coerentes com as faixas.
 * NÃO PROMETE: que a dose esteja certa, nem que a fonte seja a melhor. Isso é
 *   leitura de bula, e é do médico. A trava garante que o CATÁLOGO não pode
 *   mentir por construção.
 * UNIVERSO: `lib/antimicrobianos/catalogo.ts`, compilado, com piso no retrato.
 *
 * ── ⚠️ POR QUE SOBREPOSIÇÃO E BURACO SÃO A TRAVA CENTRAL ───────────────────
 *
 * Enquanto a dose morava em ternários (`tfg > 50 ? A : tfg >= 25 ? B : …`),
 * sobreposição era invisível: o encadeamento SEMPRE devolve alguma coisa, e a
 * primeira condição verdadeira vence. Ninguém enxerga que duas faixas se cruzam
 * lendo `if`s — e um buraco simplesmente cai no `else`, com a dose errada.
 *
 * Como DADO, os dois viram impossíveis por construção: **um ClCr pertence a
 * exatamente uma faixa, ou a trava reprova.**
 *
 * ⚠️ E A FRONTEIRA É O PONTO CEGO CLÁSSICO. Um erro em `> 50` × `>= 50` muda a
 * dose EXATAMENTE no valor 50 — um único ponto da reta, que nenhum teste de
 * amostra pega e nenhuma revisão lê. Por isso a inclusividade é declarada campo a
 * campo, e conferida aqui.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { conferirUniverso } = require("./lib/universo.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "atm-"));

execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, "lib/antimicrobianos/catalogo.ts"),
], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });

// ⚠️ O `tsc` com UM arquivo só achata a saída: sem `--rootDir`, o diretório
// comum vira `lib/antimicrobianos` e o `.js` sai na RAIZ do tmp. Procurar o
// caminho longo devolve MODULE_NOT_FOUND — e isso seria lido como "o catálogo
// não existe", que é o oposto do que aconteceu.
const { CATALOGO_DE_ANTIMICROBIANOS: CAT } = require(path.join(tmp, "catalogo.js"));
fs.rmSync(tmp, { recursive: true, force: true });

const falhas = [];
const ESTADOS = ["ajusta", "nao_ajusta", "contraindicado", "sem_dados"];
const METODOS = ["cockcroft_gault", "ckd_epi", "mdrd", "sem_dados"];

if (!CAT || !CAT.length) {
  console.log("\n❌ catálogo vazio — isto é \"não consegui olhar\", não \"nenhum fármaco com problema\".\n");
  process.exit(1);
}

const confereProcedencia = (onde, p) => {
  if (!p || !p.fonte) return falhas.push(`${onde}: sem \`fonte\`.`);
  if (p.forca === "pendente" && !p.pendencia) {
    falhas.push(`${onde}: força "pendente" SEM \`pendencia\` escrita — pendência sem alvo é silêncio com etiqueta.`);
  }
  if (!p.forca) falhas.push(`${onde}: sem \`forca\`.`);
};

let faixas = 0, dialises = 0;

for (const f of CAT) {
  if (!ESTADOS.includes(f.ajusteRenal)) {
    falhas.push(`${f.id}: \`ajusteRenal\` inválido ("${f.ajusteRenal}") — só ${ESTADOS.join(" | ")}.`);
  }
  confereProcedencia(`${f.id} · fonteDoFarmaco`, f.fonteDoFarmaco);
  confereProcedencia(`${f.id} · doseUsual`, f.doseUsual?.procedencia);

  // ── as três modalidades existem, nem que seja como ausência declarada ────
  for (const modo of ["HD", "CRRT", "SLED"]) {
    const d = f.dialise?.[modo];
    dialises += 1;
    if (!d) { falhas.push(`${f.id}: diálise \`${modo}\` ausente — "sem_dados" é resposta válida; silêncio não é.`); continue; }
    if (d.estado === "sem_dados") {
      if (!d.pendencia) falhas.push(`${f.id} · ${modo}: "sem_dados" sem pendência escrita.`);
    } else {
      confereProcedencia(`${f.id} · diálise ${modo}`, d.procedencia);
      if (!d.relacaoComASessao) falhas.push(`${f.id} · ${modo}: sem \`relacaoComASessao\` — é ela que muda a HORA da dose.`);
    }
  }

  if (f.ajusteRenal !== "ajusta") {
    if ((f.faixas ?? []).length) falhas.push(`${f.id}: \`ajusteRenal\` é "${f.ajusteRenal}" e mesmo assim declara faixas.`);
    // ⚠️ OS QUATRO ESTADOS RENDERIZAM TEXTO — NENHUM RENDERIZA SILÊNCIO. Esta
    // conferência nasceu de uma MUTAÇÃO QUE PASSOU VERDE: apagar a frase "não
    // requer ajuste" das observações não reprovava nada, e a tela ficava sem a
    // informação que evita o subajuste por conta própria. Texto em lista solta é
    // opcional na prática; campo obrigatório se confere.
    if (!f.textoDoEstado?.texto) {
      falhas.push(
        `${f.id}: \`ajusteRenal\` é "${f.ajusteRenal}" e não há \`textoDoEstado\`.\n` +
        `      ⚠️ "Não requer ajuste" é CONTEÚDO: quem procura e não acha ajusta por conta e SUBDOSA.\n` +
        `      Os quatro estados renderizam texto — nenhum renderiza silêncio.`
      );
    } else {
      confereProcedencia(`${f.id} · textoDoEstado`, f.textoDoEstado.procedencia);
    }
    continue;
  }

  // ⚠️ EIXO DE INDICAÇÃO: quando existe, CADA coluna é conferida inteira, com as
  // mesmas regras. Um fármaco cuja dose depende do sítio (pip-tazo, e vários
  // beta-lactâmicos que vêm) tem duas retas para cobrir, não uma — e um buraco na
  // segunda coluna é tão perigoso quanto na primeira.
  const conjuntos = f.indicacoes
    ? f.indicacoes.map((i) => [`${f.id} [${i.id}]`, i.faixas])
    : [[f.id, f.faixas ?? []]];

  if (f.indicacoes && (f.faixas ?? []).length) {
    falhas.push(`${f.id}: tem eixo de indicação E faixas soltas — duas fontes de verdade sobre a mesma dose.`);
  }
  for (const [rotuloBase, listaBase] of conjuntos) {
  // ── ⚠️ O EIXO DE PESO ────────────────────────────────────────────────────
  //
  // Quando as faixas declaram `peso`, cada BALDE DE PESO tem a sua própria reta
  // de clearance, e cada uma é conferida inteira. Um buraco no balde dos obesos
  // é tão perigoso quanto no dos demais — e é justamente o balde que ninguém
  // testa, porque o caso comum passa pelo outro.
  const baldes = new Map();
  for (const x of listaBase) {
    const chave = x.peso ? `${x.peso.de}–${x.peso.ate ?? "∞"} kg` : "";
    if (!baldes.has(chave)) baldes.set(chave, []);
    baldes.get(chave).push(x);
  }
  if (baldes.size > 1) {
    // As faixas de peso também não podem se sobrepor nem deixar buraco.
    // ⚠️ DESDUPLICA POR VALOR, NÃO POR REFERÊNCIA. `new Set` de objetos guarda
    // identidade: dois `{de:0,ate:120}` escritos em faixas diferentes são objetos
    // diferentes, e a lista vinha com repetição — o que fazia a conferência
    // acusar sobreposição de uma faixa com ela mesma. Falso positivo, e do tipo
    // que faria alguém "consertar" o catálogo que estava certo.
    const pesos = [...new Map(
      listaBase.filter((x) => x.peso).map((x) => [`${x.peso.de}|${x.peso.ate}`, x.peso])
    ).values()].sort((a, b) => a.de - b.de);
    if (pesos[0].de !== 0) falhas.push(`${rotuloBase}: o eixo de PESO começa em ${pesos[0].de} kg, não em 0.`);
    if (pesos[pesos.length - 1].ate !== null) falhas.push(`${rotuloBase}: o eixo de PESO termina em ${pesos[pesos.length - 1].ate} kg — acima disso não há dose.`);
    for (let i = 0; i < pesos.length - 1; i += 1) {
      if (pesos[i].ate !== pesos[i + 1].de) {
        falhas.push(`${rotuloBase}: eixo de PESO com ${pesos[i].ate > pesos[i + 1].de ? "SOBREPOSIÇÃO" : "BURACO"} entre ${pesos[i].ate} e ${pesos[i + 1].de} kg.`);
      }
    }
  }
  for (const [balde, lista] of baldes) {
  const rotulo = balde ? `${rotuloBase} {${balde}}` : rotuloBase;
  if (!lista.length) {
    falhas.push(`${rotulo}: declara "ajusta" e não tem faixa nenhuma.`);
    continue;
  }

  const fx = [...lista].sort((a, b) => a.de - b.de);
  faixas += fx.length;
  for (const x of fx) {
    confereProcedencia(`${rotulo} · faixa ${x.de}–${x.ate ?? "∞"}`, x.procedencia);
    // ⚠️ O NÚMERO CONCRETO TEM PROCEDÊNCIA PRÓPRIA: quando a fonte fala em
    // fração ("metade da dose") e a tela mostra "500 mg", a aritmética é NOSSA.
    if (x.doseConcreta) confereProcedencia(`${rotulo} · faixa ${x.de}–${x.ate ?? "∞"} · doseConcreta`, x.doseConcreta.procedencia);
    // ⚠️ A NOTA DE FAIXA TAMBÉM DECLARA A SUA: dose de MDR e infusão estendida
    // são prática de paciente crítico, não a tabela da bula — regra B.
    if (x.notaDeFaixa) confereProcedencia(`${rotulo} · faixa ${x.de}–${x.ate ?? "∞"} · notaDeFaixa`, x.notaDeFaixa.procedencia);
    if (!METODOS.includes(x.metodoDaTFG)) {
      falhas.push(
        `${rotulo} · faixa ${x.de}–${x.ate ?? "∞"}: \`metodoDaTFG\` inválido ("${x.metodoDaTFG}").\n` +
        `      ⚠️ Bula pressupõe Cockcroft-Gault; corte de diretriz renal pressupõe CKD-EPI. Usar a TFG\n` +
        `      de uma equação numa faixa calibrada com a outra é TRANSPOSIÇÃO.`
      );
    }
  }

  // ── A RETA COMEÇA EM ZERO ────────────────────────────────────────────────
  if (fx[0].de !== 0) falhas.push(`${rotulo}: a primeira faixa começa em ${fx[0].de}, não em 0 — anúrico cairia fora do catálogo.`);
  const ultima = fx[fx.length - 1];
  if (ultima.ate !== null) falhas.push(`${rotulo}: a última faixa termina em ${ultima.ate} — ClCr acima disso não teria dose.`);

  // ── SOBREPOSIÇÃO E BURACO, fronteira a fronteira ────────────────────────
  for (let i = 0; i < fx.length - 1; i += 1) {
    const a = fx[i], b = fx[i + 1];
    if (a.ate === null) { falhas.push(`${rotulo}: faixa sem teto no meio da lista.`); continue; }
    if (a.ate > b.de) {
      falhas.push(
        `${rotulo}: SOBREPOSIÇÃO — a faixa ${a.de}–${a.ate} invade a ${b.de}–${b.ate ?? "∞"}.\n` +
        `      ⚠️ Em ternário isto era invisível: a primeira condição verdadeira vencia, e a segunda dose\n` +
        `      nunca aparecia. Como dado, um ClCr pertence a exatamente UMA faixa.`
      );
      continue;
    }
    if (a.ate < b.de) {
      falhas.push(
        `${rotulo}: BURACO — nada cobre ClCr entre ${a.ate} e ${b.de}.\n` +
        `      ⚠️ No ternário o buraco caía no \`else\`, com a dose do extremo. Aqui ele reprova.`
      );
      continue;
    }
    // Mesma fronteira: exatamente UM dos dois lados tem de possuí-la.
    const donoDeBaixo = a.ateInclusivo === true;
    const donoDeCima = b.deInclusivo !== false;
    if (donoDeBaixo && donoDeCima) {
      falhas.push(
        `${rotulo}: SOBREPOSIÇÃO NO PONTO ${a.ate} — as duas faixas reivindicam a fronteira.\n` +
        `      ⚠️ Um ponto só da reta, que amostra nenhuma pega: é o erro de \`> 50\` × \`>= 50\`.`
      );
    }
    if (!donoDeBaixo && !donoDeCima) {
      falhas.push(`${rotulo}: BURACO NO PONTO ${a.ate} — nenhuma das duas faixas reivindica a fronteira.`);
    }
  }
  }
  }
}

console.log("\nCatálogo de antimicrobianos — sobreposição e buraco reprovam\n");
console.log(`   universo: ${CAT.length} fármacos · ${faixas} faixas renais · ${dialises} entradas de diálise`);
const okF = conferirUniverso("valida-antimicrobianos", "farmacos", CAT.length);
const okX = conferirUniverso("valida-antimicrobianos", "faixas", faixas);

// ── PROVA DE COBERTURA: cada valor cai em exatamente uma faixa ─────────────
const AMOSTRA = [0, 5, 9, 10, 15, 19, 20, 24, 25, 30, 39, 40, 45, 49, 50, 55, 59, 60, 75, 89, 90, 91, 120, 200];
for (const f of CAT.filter((x) => x.ajusteRenal === "ajusta")) {
  const listas = f.indicacoes ? f.indicacoes.map((i) => [i.id, i.faixas]) : [["", f.faixas]];
  for (const [ind, listaToda] of listas) {
  const chaves = [...new Set(listaToda.map((x) => (x.peso ? `${x.peso.de}–${x.peso.ate ?? "∞"}` : "")))];
  for (const chave of chaves) {
  const lista = listaToda.filter((x) => (x.peso ? `${x.peso.de}–${x.peso.ate ?? "∞"}` : "") === chave);
  for (const clcr of AMOSTRA) {
    const achadas = lista.filter((x) => {
      const piso = x.deInclusivo === false ? clcr > x.de : clcr >= x.de;
      const teto = x.ate === null ? true : x.ateInclusivo ? clcr <= x.ate : clcr < x.ate;
      return piso && teto;
    });
    if (achadas.length !== 1) {
      falhas.push(`${f.id}${ind ? ` [${ind}]` : ""}${chave ? ` {${chave} kg}` : ""}: ClCr ${clcr} cai em ${achadas.length} faixa(s) — tem de cair em exatamente 1.`);
    }
  }
  }
  }
}
console.log(`   cobertura conferida em ${AMOSTRA.length} valores de ClCr por fármaco, fronteiras incluídas`);

const todasAsFaixas = CAT.flatMap((f) => (f.indicacoes ? f.indicacoes.flatMap((i) => i.faixas) : (f.faixas ?? [])));
const pendentes = todasAsFaixas.filter((x) => x.procedencia?.forca === "pendente");
console.log(`   ⚠️ faixas com procedência PENDENTE: ${pendentes.length} de ${todasAsFaixas.length} — o portão da AM-7 cobra isto antes de qualquer fármaco novo`);

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} problema(s):\n`);
  for (const x of falhas) console.log("   " + x);
  console.log("");
  process.exit(1);
}
if (!okF || !okX) { console.log("❌ universo abaixo do piso.\n"); process.exit(1); }
console.log("\n✅ nenhuma sobreposição, nenhum buraco — e toda faixa declara método e procedência\n");
