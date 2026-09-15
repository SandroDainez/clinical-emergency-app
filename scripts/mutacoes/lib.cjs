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
const os = require("node:os");
const { execFileSync, spawnSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..", "..");

/** ⚠️ Caminhos nomeados — ⛔ mutação ⛔ nunca escreve caminho cru. */
const ARQ = {
  conteudoF: "avc/conteudo/superficie-f.ts",
  conteudoG: "avc/conteudo/superficie-g.ts",
  conteudoA: "avc/conteudo/superficie-a.ts",
  /** ⚠️ A cronologia mora aqui desde **C7**, 2026-09-07. */
  conteudoB: "avc/conteudo/superficie-b.ts",
  conteudoC: "avc/conteudo/superficie-c.ts",
  campos: "avc/conteudo/campos.ts",
  derivF: "avc/nucleo/derivacoes-f.ts",
  derivG: "avc/nucleo/derivacoes-g.ts",
  apresF: "avc/nucleo/apresentacao-f.ts",
  telaF: "components/avc/superficie-f.tsx",
  telaG: "components/avc/superficie-g.tsx",
  telaC: "components/avc/superficie-c.tsx",
  conteudoD: "avc/conteudo/superficie-d.ts",
  derivD: "avc/nucleo/derivacoes-d.ts",
  /** ⚠️ Quantos FATOS um gesto numérico escreve — o contrato de correção. */
  rascunho: "avc/nucleo/rascunho-numerico.ts",
  /** ⚠️ O kit visual novo — A, B ⛔ e agora o ASPECTS de C. */
  kit: "components/avc/ui/index.tsx",
  /** AC-13 reaberto, item 3: horário clínico das transições e as regressões E-49. */
  horarioClinico: "avc/nucleo/horario-clinico.ts",
  caminhoHemorragico: "avc/nucleo/caminho-hemorragico.ts",
  vereditoEvt: "avc/nucleo/veredito-da-trombectomia.ts",
  /** AC-13 reaberto, item 4: autoria por nome de exibição e o schema v4. */
  autoria: "avc/persistencia/autoria.ts",
  tiposDaPersistencia: "avc/persistencia/tipos.ts",
  /** AC-13 reaberto · validação: ordem causal, trilha e conteúdo de E (legado «Realizada»). */
  ordemDaAcao: "avc/nucleo/ordem-da-acao.ts",
  transicoesDaAcao: "avc/nucleo/transicoes-da-acao.ts",
  conteudoE: "avc/conteudo/superficie-e.ts",
};

/**
 * ⚠️ Roda UM conjunto de mutações contra a trava que ele declara.
 *
 * ⛔ Devolve `{ reprovadas, sobreviventes, ancorasQuebradas }` — e quem chama
 * decide o código de saída. ⚠️ Sobrevivente **e** âncora quebrada são falha.
 */
/**
 * ⚠️⚠️ CÓPIA ISOLADA — defeito de 2026-09-13.
 *
 * A mutação era gravada no arquivo REAL da árvore ⛔ e só restaurada no `finally`.
 * Às 11:55:25 daquele dia, "a ação de F sai do registro do módulo" estava escrita
 * em `avc/conteudo/campos.ts` enquanto um `build:web:teste` empacotava: o `dist` saiu
 * com o registro da trombólise sem instância. ⛔ Nenhum outro processo pode ver
 * código mutado.
 *
 * ⚠️ Agora: uma cópia por execução (arquivos rastreados ⛔ e não ignorados, com o
 * conteúdo da árvore de trabalho), `node_modules` por link simbólico, ⛔ e a trava
 * roda DENTRO da cópia. A árvore real ⛔ é lida uma vez ⛔ e nunca escrita.
 * Prova: `scripts/prova-mutacoes-isoladas.cjs`.
 */
let copia;
function copiaIsolada() {
  if (copia) return copia;
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), "mutacoes-isoladas-"));
  const lista = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: appDir })
    .toString("utf8").split("\0").filter(Boolean);
  for (const rel of lista) {
    const de = path.join(appDir, rel);
    if (!fs.existsSync(de) || !fs.lstatSync(de).isFile()) continue;
    const para = path.join(destino, rel);
    fs.mkdirSync(path.dirname(para), { recursive: true });
    fs.copyFileSync(de, para);
  }
  const link = path.join(destino, "node_modules");
  fs.symlinkSync(path.join(appDir, "node_modules"), link, "dir");
  process.on("exit", () => {
    try {
      /** ⚠️ O link sai PRIMEIRO: apagar a cópia ⛔ nunca pode alcançar o `node_modules` real. */
      if (fs.lstatSync(link).isSymbolicLink()) fs.unlinkSync(link);
      fs.rmSync(destino, { recursive: true, force: true });
    } catch {
      /* cópia temporária: o sistema limpa `tmpdir` */
    }
  });
  copia = destino;
  return copia;
}

function rodarConjunto({ nome, trava, mutacoes }) {
  const sobreviventes = [];
  const ancorasQuebradas = [];
  let reprovadas = 0;

  console.log(`\n── ${nome} · trava: ${trava}`);

  for (const m of mutacoes) {
    const raiz = copiaIsolada();
    const arq = path.join(raiz, m.arquivo);
    const original = fs.readFileSync(arq, "utf8");

    /** ⚠️⚠️ REGRA 1 · âncora que ⛔ não casa é FALHA. */
    if (!original.includes(m.de)) {
      ancorasQuebradas.push(m.nome);
      console.log(`  ⚠️ ÂNCORA QUEBRADA  ${m.nome}`);
      continue;
    }

    try {
      fs.writeFileSync(arq, original.replace(m.de, m.para));
      const r = spawnSync("node", [trava], { cwd: raiz, encoding: "utf8" });
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

module.exports = { ARQ, rodarConjunto, appDir, copiaIsolada };
