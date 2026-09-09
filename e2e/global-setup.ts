import fs from "node:fs";
import path from "node:path";

/**
 * ⚠️⚠️⚠️ A SUÍTE CONFERE O ARTEFATO ⛔ ANTES DE MEDIR QUALQUER COISA — D-128.
 *
 * ── ⛔ O DEFEITO, MEDIDO ────────────────────────────────────────────────────
 *
 * ⛔ 2026-09-08: rodei a suíte sobre um `dist` de `npm run build:web` ⛔ em vez
 * de `build:web:teste`. ⛔ **⛔ 26 testes do AVC falharam** ⛔ com « element was
 * detached from the DOM ».
 *
 * ⚠️ ⛔ E ⛔ essa mensagem ⛔ **⛔ não** tem ⛔ nada a ver ⛔ com a causa: o build
 * de produção ⛔ inlina as credenciais do Supabase, ⛔ a guarda de
 * `app/_layout.tsx` ⛔ resolve sessão ⛔ e ⛔ **⛔ devolve `/modulos/*` para `/`**.
 * ⛔ A suíte estava medindo ⛔ **⛔ a tela de login**, ⛔ achando que media o
 * módulo. ⛔ Duas horas ⛔ procurando ⛔ bug ⛔ onde ⛔ não havia.
 *
 * ── ⚠️ O CONTRATO ──────────────────────────────────────────────────────────
 *
 * ⛔ Os dois builds ⛔ produzem ⛔ **⛔ o mesmo `dist/`**, ⛔ indistinguível de
 * fora. ⚠️ Então ⛔ o artefato ⛔ passou a ⛔ **⛔ declarar como nasceu**
 * (`dist/artefato.json`), ⛔ e ⛔ o selo ⛔ **⛔ não** é aceito na palavra —
 * `sela-artefato.cjs` ⛔ o confere ⛔ contra ⛔ o próprio artefato ⛔ antes de
 * escrevê-lo (⛔ decisão do autor: *"⛔ não usar heurística baseada só em
 * presença de arquivos ⛔ ou nome de pasta"*).
 *
 * ⛔ ⛔ Ausência de `dist`, export incompleto ⛔ ou selo faltando ⛔ **⛔ reprovam**.
 * ⛔ Seguir verde ⛔ sobre ⛔ o vazio ⛔ é ⛔ o mesmo defeito ⛔ com ⛔ outra roupa.
 *
 * ⚠️ ⛔ Com `E2E_BASE_URL` ⛔ a suíte mede ⛔ **⛔ um servidor remoto**, ⛔ e ⛔ o
 * `dist` local ⛔ não participa — ⛔ conferi-lo ali ⛔ seria ⛔ reprovar ⛔ por um
 * artefato ⛔ que ⛔ ninguém vai usar.
 */

const NOME_DO_SELO = "artefato.json";
const MODO_EXIGIDO = "teste";

type Selo = {
  versaoDoContrato?: number;
  script?: string;
  modo?: string;
  backendEmbutido?: boolean;
  geradoEm?: string;
  commit?: string | null;
};

function reprovar(o_que_foi_encontrado: string, o_que_era_exigido: string): never {
  throw new Error(
    `\n\n❌ ARTEFATO INCOMPATÍVEL COM A SUÍTE (D-128)\n\n` +
      `   encontrado ...... ${o_que_foi_encontrado}\n` +
      `   exigido ......... ${o_que_era_exigido}\n\n` +
      `   Rode \`npm run build:web:teste\` e tente de novo.\n` +
      `   Com um build de produção, a guarda devolve /modulos/* para / e a suíte\n` +
      `   mede a tela de login achando que mede o módulo — o sintoma é\n` +
      `   « element was detached from the DOM », que não diz nada sobre a causa.\n`
  );
}

export default function conferirArtefato() {
  /** ⚠️ Alvo remoto: o `dist` local não é o que está sendo medido. */
  if (process.env.E2E_BASE_URL) {
    return;
  }

  const dist = path.resolve(__dirname, "..", "dist");

  if (!fs.existsSync(dist)) {
    reprovar(`nenhum \`dist/\` em ${dist}`, `um export selado em modo « ${MODO_EXIGIDO} »`);
  }

  const caminhoDoSelo = path.join(dist, NOME_DO_SELO);
  if (!fs.existsSync(caminhoDoSelo)) {
    reprovar(
      `\`dist/\` sem \`${NOME_DO_SELO}\` — build antigo, ou export feito à mão`,
      `um export selado por \`scripts/sela-artefato.cjs\``
    );
  }

  let selo: Selo;
  try {
    selo = JSON.parse(fs.readFileSync(caminhoDoSelo, "utf8")) as Selo;
  } catch (erro) {
    reprovar(
      `\`${NOME_DO_SELO}\` ilegível (${erro instanceof Error ? erro.message : String(erro)})`,
      `um selo JSON válido`
    );
  }

  if (selo.versaoDoContrato !== 1) {
    reprovar(
      `selo com versaoDoContrato = ${String(selo.versaoDoContrato)}`,
      `versaoDoContrato = 1 — o contrato do artefato mudou; releia global-setup`
    );
  }

  if (selo.modo !== MODO_EXIGIDO || selo.backendEmbutido !== false) {
    reprovar(
      `modo « ${String(selo.modo)} » (${String(selo.script)}), ` +
        `backend embutido = ${String(selo.backendEmbutido)}` +
        (selo.commit ? `, commit ${selo.commit}` : ""),
      `modo « ${MODO_EXIGIDO} » (build:web:teste), backend embutido = false`
    );
  }
}
