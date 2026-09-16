/**
 * TRAVA DAS CHAVES ÓRFÃS — ⚠️ **texto que ⛔ ninguém mostra ⛔ ainda volta**.
 *
 * PROMETE: que ⛔ nenhuma chave de tradução ⛔ que este arquivo lista como
 *   **aposentada** ⛔ continue ⛔ no dicionário — ⛔ e ⛔ que ⛔ nenhuma tela
 *   ⛔ volte a renderizá-la.
 *
 * NÃO PROMETE: que ⛔ **⛔ toda** chave ⛔ sem consumidor ⛔ seja detectada.
 *   ⛔ O dicionário tem milhares de entradas, ⛔ e ⛔ muitas ⛔ pertencem a
 *   ⛔ outros módulos ⛔ ou ⛔ a caminhos ⛔ raros. ⚠️ ⛔ Esta trava guarda
 *   ⛔ **⛔ as que ⛔ foram deliberadamente aposentadas** — ⛔ que ⛔ são as
 *   ⛔ que ⛔ alguém ⛔ pode ressuscitar ⛔ por engano.
 *
 * UNIVERSO: `lib/i18n/modules`, `components` ⛔ e `avc`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO EXISTE PARA FECHAR ─────────────────────────
 *
 * ⛔ ⛔ Em 2026-09-09 o disclaimer manual *"Apoio ao julgamento clínico. A
 * decisão permanece do médico."* ⛔ foi substituído ⛔ pelo componente único.
 * ⚠️ ⛔ A **⛔ renderização** saiu ⛔ das três telas — ⛔ e a **⛔ chave de
 * tradução ⛔ ficou**, ⛔ publicada ⛔ no bundle de produção.
 *
 * ⚠️⚠️ ⛔ ⛔ **⛔ Chave órfã ⛔ é ⛔ como a frase volta.** ⛔ Alguém procura o
 * texto, ⛔ acha a chave, ⛔ e ⛔ conclui ⛔ que ⛔ ele ⛔ ainda é usado — ⛔ e
 * ⛔ reusa. ⛔ Foi ⛔ medido ⛔ **⛔ no bundle**, ⛔ e ⛔ não ⛔ na fonte: ⛔ a
 * página ⛔ não a mostrava, ⛔ e ⛔ ela ⛔ estava ⛔ lá.
 */
const path = require("node:path");
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/**
 * ⚠️⚠️ ⛔ AS APOSENTADAS — ⛔ cada uma ⛔ com ⛔ **⛔ o que ⛔ a substituiu**.
 *
 * ⛔ ⛔ Sem o substituto escrito, ⛔ a lista vira ⛔ proibição ⛔ sem saída —
 * ⛔ e ⛔ quem precisar do texto ⛔ vai reescrevê-lo ⛔ à mão, ⛔ que é
 * ⛔ exatamente ⛔ o que ⛔ se quis ⛔ acabar.
 */
const APOSENTADAS = [
  {
    chave: "Apoio ao julgamento clínico. A decisão permanece do médico.",
    substituto: "AvisoDeApoioClinico, variante `recomendacao` (design-system)",
    quando: "2026-09-09",
  },
  /**
   * ⚠️⚠️ O BLOCO «LEITURAS ANTIGAS» DA GLICEMIA — decisão do autor, 2026-09-16.
   *
   * ⛔ A tela deixou de renderizá-lo; `ERROS_A_EVITAR` fica no conteúdo, como proteção
   * anti-regressão. ⚠️ As chaves de tradução ficariam publicadas no bundle ⛔ sem
   * ninguém para mostrá-las — ⛔ que é exatamente o defeito que esta trava fecha.
   *
   * ⚠️⚠️ As CINCO ERRADAS são as mais perigosas de ressuscitar: quem procurar o texto
   * acha a chave ⛔ e conclui que ainda vale. ⛔ Elas saem do dicionário ⛔ e ficam
   * proibidas aqui, por nome.
   */
  {
    chave: "Glicemia abaixo de 50 é contraindicação absoluta",
    substituto: "faixa «Abaixo de 50 mg/dL» em CORTES_GLICEMICOS (disglicemia grave, não contraindicação)",
    quando: "2026-09-16",
  },
  {
    chave: "Glicemia acima de 400 é contraindicação absoluta",
    substituto: "faixa «Acima de 400 mg/dL» em CORTES_GLICEMICOS (disglicemia grave, não contraindicação)",
    quando: "2026-09-16",
  },
  {
    chave: "Só trombolisar quando a glicemia estiver abaixo de 180",
    substituto: "alvo COR 2a «De 140 a 180 mg/dL» em ALVOS_GLICEMICOS (manejo, não pré-requisito)",
    quando: "2026-09-16",
  },
  {
    chave: "Dez unidades de insulina por via endovenosa para glicemia acima de 300",
    substituto: "TRATAMENTOS_GLICEMICOS (insulinoterapia por protocolo, sem dose fixa)",
    quando: "2026-09-16",
  },
  {
    chave: "Meta de 80 a 130",
    substituto: "alvo COR 3 «Não perseguir de 80 a 130 mg/dL» em ALVOS_GLICEMICOS",
    quando: "2026-09-16",
  },
  /** ⚠️ As cinco CORRETAS só viviam neste bloco; o mesmo conteúdo está nas faixas. */
  {
    chave: "É disglicemia grave. Corrigir e reavaliar o déficit",
    substituto: "faixa «Abaixo de 50 mg/dL» em CORTES_GLICEMICOS",
    quando: "2026-09-16",
  },
  {
    chave: "É disglicemia grave. Déficit incapacitante que persiste após a correção mantém a indicação",
    substituto: "faixa «Acima de 400 mg/dL» em CORTES_GLICEMICOS + PERGUNTA_QUE_DECIDE",
    quando: "2026-09-16",
  },
  {
    chave: "De 140 a 180 é alvo de manejo, e não pré-requisito de reperfusão",
    substituto: "alvo COR 2a «De 140 a 180 mg/dL» em ALVOS_GLICEMICOS",
    quando: "2026-09-16",
  },
  {
    chave: "Insulinoterapia por protocolo dinâmico validado",
    substituto: "TRATAMENTOS_GLICEMICOS",
    quando: "2026-09-16",
  },
  {
    chave: "Não é recomendada para melhorar o desfecho do acidente vascular cerebral",
    substituto: "alvo COR 3 «Não perseguir de 80 a 130 mg/dL» em ALVOS_GLICEMICOS",
    quando: "2026-09-16",
  },
  /** ⚠️ Os dois títulos do bloco: o original ⛔ e o que eu pus por uma hora, em 2026-09-16. */
  {
    chave: "Leituras antigas que hoje estão erradas",
    substituto: "nenhum — o bloco saiu da tela",
    quando: "2026-09-16",
  },
  {
    chave: "Formulações corretas",
    substituto: "nenhum — título provisório do mesmo bloco, que saiu da tela no mesmo dia",
    quando: "2026-09-16",
  },
];

/* ══ ⚠️⚠️ 1 · A CHAVE SAIU DO DICIONÁRIO ═══════════════════════════════ */

{
  const dir = path.join(appDir, "lib", "i18n", "modules");
  const dicionarios = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
  for (const { chave, substituto } of APOSENTADAS) {
    const onde = dicionarios.filter((f) => lerFonte(path.join(dir, f)).includes(`"${chave}"`));
    confere(
      `⚠️⚠️ ⛔ a chave aposentada saiu do dicionário — «${chave.slice(0, 40)}…»`,
      onde.length === 0,
      `⛔ ${onde.join(", ")} — ⛔ ela é publicada ⛔ no bundle ⛔ mesmo ⛔ sem tela ⛔ que a use. ⛔ Use: ${substituto}`
    );
  }
}

/* ══ ⚠️⚠️ 2 · ⛔ E ⛔ NENHUMA TELA VOLTOU A RENDERIZÁ-LA ════════════════ */

{
  const raizes = [
    path.join(appDir, "components"),
    path.join(appDir, "avc"),
  ];
  const arquivos = [];
  const anda = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) anda(p);
      else if (/\.(ts|tsx)$/.test(e.name)) arquivos.push(p);
    }
  };
  raizes.forEach(anda);

  for (const { chave, substituto } of APOSENTADAS) {
    /** ⛔ `tr("…")` — ⛔ a **renderização**, ⛔ e ⛔ não a menção em comentário. */
    const alvo = `tr("${chave}")`;
    const onde = arquivos
      .filter((p) => lerFonte(p).includes(alvo))
      .map((p) => path.relative(appDir, p));
    confere(
      `⚠️ ⛔ nenhuma tela renderiza a frase aposentada`,
      onde.length === 0,
      `⛔ ${onde.join(", ")} — ⛔ duas redações ⛔ para o mesmo recado. ⛔ Use: ${substituto}`
    );
  }
}

if (falhas > 0) {
  console.log(`\n❌ CHAVES ÓRFÃS — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ CHAVES ÓRFÃS — ${ok}/${ok} conferências · ${APOSENTADAS.length} frase(s) aposentada(s)\n`);
