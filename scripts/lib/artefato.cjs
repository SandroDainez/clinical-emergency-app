/**
 * ⚠️⚠️⚠️ O QUE O ARTEFATO É — ⛔ medido nele, ⛔ e ⛔ não deduzido do nome.
 *
 * ── ⚠️ A D-128, EM UMA FRASE ──────────────────────────────────────────────
 *
 * ⛔ `npm run build:web` ⛔ e `npm run build:web:teste` ⛔ produzem ⛔ **⛔ o
 * mesmo `dist/`**, ⛔ com ⛔ o mesmo nome, ⛔ os mesmos arquivos ⛔ e ⛔ a mesma
 * cara. ⛔ A diferença ⛔ é ⛔ **⛔ invisível de fora**: ⛔ o primeiro inlina as
 * credenciais do Supabase ⛔ e ⛔ o segundo ⛔ não (`EXPO_NO_DOTENV=1`).
 *
 * ⛔ ⛔ Com backend embutido, a guarda de `app/_layout.tsx` ⛔ resolve sessão
 * ⛔ e ⛔ **⛔ devolve `/modulos/*` para `/`**. ⚠️ A suíte então mede ⛔ a tela de
 * login ⛔ achando que mede ⛔ o módulo — ⛔ e falha ⛔ com « element was detached
 * from the DOM », ⛔ que ⛔ é ⛔ o sintoma, ⛔ e ⛔ **⛔ não** a causa.
 * ⛔ 26 testes vermelhos, ⛔ 2026-09-08, ⛔ por ⛔ um build trocado.
 *
 * ── ⚠️⚠️ POR QUE ⛔ NÃO OLHAR ⛔ O NOME ────────────────────────────────────
 *
 * ⛔ Decisão do autor, 2026-09-09: *"⛔ Não usar heurística baseada só em
 * presença de arquivos ⛔ ou nome de pasta."*
 *
 * ⚠️ ⛔ Então ⛔ o que se lê aqui ⛔ são ⛔ **⛔ duas propriedades ⛔ do próprio
 * artefato**, ⛔ as mesmas ⛔ que `prova-ambiente-coerente.cjs` ⛔ já usa ⛔ como
 * canário — ⛔ e ⛔ é ⛔ de propósito ⛔ que ⛔ são as mesmas: ⛔ duas medidas
 * ⛔ diferentes ⛔ da mesma coisa ⛔ seriam ⛔ a segunda verdade.
 *
 *   1. o **pré-render** desenhou `guarda-cobertura`? (só desenha com backend)
 *   2. o **bundle do cliente** construiu o cliente Supabase de verdade?
 */
const fs = require("node:fs");
const path = require("node:path");

/** ⚠️ Universo ausente ⛔ é ⛔ erro, ⛔ e ⛔ não « zero ». */
class ArtefatoIlegivel extends Error {}

function localizarBundle(dist) {
  const web = path.join(dist, "_expo", "static", "js", "web");
  if (!fs.existsSync(web)) {
    throw new ArtefatoIlegivel(
      `⛔ ${dist} não parece um export do Expo: falta \`_expo/static/js/web\`.`
    );
  }
  const entry = fs.readdirSync(web).find((f) => f.startsWith("entry-") && f.endsWith(".js"));
  if (!entry) {
    throw new ArtefatoIlegivel(
      `⛔ ${dist} tem a pasta do bundle, mas nenhum \`entry-*.js\` dentro — ` +
        `export incompleto ou interrompido.`
    );
  }
  return path.join(web, entry);
}

/**
 * ⚠️ Lê o artefato ⛔ e devolve ⛔ o que ⛔ ele **⛔ é**. ⛔ Lança
 * `ArtefatoIlegivel` ⛔ quando ⛔ não há o que medir — ⛔ seguir verde ⛔ sobre
 * ⛔ o vazio ⛔ é ⛔ o defeito ⛔ que ⛔ esta biblioteca ⛔ existe ⛔ para ⛔ impedir.
 */
function medirArtefato(dist) {
  if (!fs.existsSync(dist)) {
    throw new ArtefatoIlegivel(`⛔ ${dist} não existe — rode o build antes.`);
  }

  const caminhoDoBundle = localizarBundle(dist);
  const bundle = fs.readFileSync(caminhoDoBundle, "utf8");

  const rotaPreRender = path.join(dist, "modulos", "pcr-adulto.html");
  if (!fs.existsSync(rotaPreRender)) {
    throw new ArtefatoIlegivel(
      `⛔ ${dist} não tem \`modulos/pcr-adulto.html\` — sem o HTML pré-renderizado ` +
        `não há como medir se o build enxergou backend.`
    );
  }
  const backendNoPreRender = fs
    .readFileSync(rotaPreRender, "utf8")
    .includes("guarda-cobertura");

  const i = bundle.indexOf('Object.defineProperty(e,"supabase"');
  if (i < 0) {
    throw new ArtefatoIlegivel(
      `⛔ o módulo \`supabase\` não foi encontrado no bundle de ${dist}. ` +
        `A FORMA do módulo mudou: a medição do artefato precisa ser revista ` +
        `antes de confiar em qualquer selo.`
    );
  }
  const backendNoCliente = /createClient\)\("http/.test(bundle.slice(i, i + 700));

  return {
    dist,
    caminhoDoBundle,
    backendNoPreRender,
    backendNoCliente,
    /** ⚠️ Só é « embutido » quando ⛔ os dois lados concordam que sim. */
    backendEmbutido: backendNoPreRender && backendNoCliente,
    /** ⚠️ Um artefato com ⛔ duas verdades ⛔ não é selável ⛔ de jeito nenhum. */
    coerente: backendNoPreRender === backendNoCliente,
  };
}

/** ⚠️ O que cada modo declara sobre o backend. ⛔ Uma tabela, ⛔ não um `if`. */
const MODOS = Object.freeze({
  teste: { script: "build:web:teste", backendEmbutido: false },
  producao: { script: "build:web", backendEmbutido: true },
});

const NOME_DO_SELO = "artefato.json";
const VERSAO_DO_CONTRATO = 1;

module.exports = {
  ArtefatoIlegivel,
  MODOS,
  NOME_DO_SELO,
  VERSAO_DO_CONTRATO,
  medirArtefato,
};
