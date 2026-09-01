/**
 * O MOTOR DE MUTAÇÃO — ⚠️ e as três regras que ele aprendeu apanhando.
 *
 * ⚠️⚠️ POR QUE ISTO MORA NO REPOSITÓRIO.
 *
 * ⛔ Estes conjuntos viveram em `/tmp` por uma sessão inteira ⛔ e **sumiram**
 * quando o diretório foi limpo. A suíte continuou reproduzível; a **evidência
 * mais forte, ⛔ não**. ⚠️ Uma trava prova que o código faz o que promete; a
 * mutação prova que **a trava reprova quando o código para de fazer**. ⛔ Sem
 * ela, um verde ⛔ não distingue "está certo" de "⛔ ninguém está medindo".
 *
 * ── ⚠️⚠️ AS TRÊS REGRAS ─────────────────────────────────────────────────────
 *
 * 1 · ⛔ **ÂNCORA QUE ⛔ NÃO CASA É FALHA**, ⛔ e ⛔ não aviso. ⚠️ Uma versão
 *     anterior imprimia `? âncora não encontrada` ⛔ e seguia: mutações
 *     envelheciam em silêncio ⛔ e o placar continuava verde. ⛔ Aqui isso
 *     **reprova**.
 *
 * 2 · ⛔ **MUTAÇÃO EXECUTADA ⛔ NÃO É MUTAÇÃO TESTADA.** ⚠️ Cada mutação declara
 *     **qual trava** deve reprová-la. ⛔ Rodar a trava errada deixa o alvo
 *     "sobrevivendo" ⛔ sem ⛔ nunca ter sido medido.
 *
 * 3 · ⛔ **O ARQUIVO VOLTA SEMPRE.** ⚠️ Restauração em `finally`: uma trava que
 *     estoure no meio ⛔ não pode deixar código mutante no disco de trabalho.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..", "..");

/** ⚠️ Caminhos nomeados — ⛔ mutação ⛔ nunca escreve caminho cru. */
const ARQ = {
  conteudoF: "avc/conteudo/superficie-f.ts",
  conteudoG: "avc/conteudo/superficie-g.ts",
  conteudoA: "avc/conteudo/superficie-a.ts",
  conteudoC: "avc/conteudo/superficie-c.ts",
  campos: "avc/conteudo/campos.ts",
  derivF: "avc/nucleo/derivacoes-f.ts",
  derivG: "avc/nucleo/derivacoes-g.ts",
  apresF: "avc/nucleo/apresentacao-f.ts",
  telaF: "components/avc/superficie-f.tsx",
  telaG: "components/avc/superficie-g.tsx",
  telaC: "components/avc/superficie-c.tsx",
};

/**
 * ⚠️ Roda UM conjunto de mutações contra a trava que ele declara.
 *
 * ⛔ Devolve `{ reprovadas, sobreviventes, ancorasQuebradas }` — e quem chama
 * decide o código de saída. ⚠️ Sobrevivente **e** âncora quebrada são falha.
 */
function rodarConjunto({ nome, trava, mutacoes }) {
  const sobreviventes = [];
  const ancorasQuebradas = [];
  let reprovadas = 0;

  console.log(`\n── ${nome} · trava: ${trava}`);

  for (const m of mutacoes) {
    const arq = path.join(appDir, m.arquivo);
    const original = fs.readFileSync(arq, "utf8");

    /** ⚠️⚠️ REGRA 1 · âncora que ⛔ não casa é FALHA. */
    if (!original.includes(m.de)) {
      ancorasQuebradas.push(m.nome);
      console.log(`  ⚠️ ÂNCORA QUEBRADA  ${m.nome}`);
      continue;
    }

    try {
      fs.writeFileSync(arq, original.replace(m.de, m.para));
      const r = spawnSync("node", [trava], { cwd: appDir, encoding: "utf8" });
      if (r.status === 0) {
        sobreviventes.push(m.nome);
        console.log(`  ✗ SOBREVIVEU       ${m.nome}`);
      } else {
        reprovadas += 1;
        console.log(`  ✓ ${m.nome}`);
      }
    } finally {
      /** ⚠️⚠️ REGRA 3 · o arquivo volta, mesmo se a trava estourar. */
      fs.writeFileSync(arq, original);
    }
  }

  return { nome, reprovadas, sobreviventes, ancorasQuebradas, total: mutacoes.length };
}

module.exports = { ARQ, rodarConjunto, appDir };
