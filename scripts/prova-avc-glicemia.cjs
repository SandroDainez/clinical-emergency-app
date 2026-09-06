#!/usr/bin/env node
/**
 * TRAVA DO F-18 — glicemia ⛔ e trombólise.
 *
 * PROMETE: que o app ⛔ nunca apresente disglicemia como **contraindicação
 *   absoluta**, ⛔ que ⛔ não invente um valor de "liberação" depois de `>400`,
 *   ⛔ que ⛔ não escreva dose fixa de insulina, ⛔ e que a **pergunta que decide**
 *   — o déficit persistir depois da correção — chegue à tela.
 *
 * NÃO PROMETE: que os cortes sejam clinicamente os melhores. ⚠️ Ela guarda a
 *   **estrutura da decisão**, ⛔ e ⛔ não a escolha dos números.
 *
 * UNIVERSO: `avc/conteudo/correcao-glicemica.ts` ⛔ e a tela que o consome.
 *
 * ── ⚠️⚠️ POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────
 *
 * ⛔ `<50` ⛔ e `>400` foram, por anos, **critério de exclusão** de trombólise —
 * na AHA/ASA 2019 ⛔ e em protocolos brasileiros. ⚠️ A edição de 2026 os trata
 * como definição de **gravidade**, ⛔ e ⛔ não de exclusão.
 *
 * ⚠️⚠️ ⛔ O REFLEXO ANTIGO É O PERIGO: um app que os apresente como
 * contraindicação faria o médico **deixar de trombolisar alguém elegível** —
 * ⛔ e esse erro ⛔ não aparece em ⛔ nenhum log.
 */
const path = require("node:path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const conteudo = lerFonte(path.join(appDir, "avc", "conteudo", "correcao-glicemica.ts"));
const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-e.tsx"));
/**
 * ⚠️ ⛔ Sem o cabeçalho de imports: lá os nomes aparecem em ordem alfabética,
 * ⛔ e comparar posições no arquivo inteiro mediria a ordem do `import`, ⛔ e
 * ⛔ não a ordem em que a tela **desenha**. ⚠️ Bug desta própria trava, na
 * primeira execução.
 */
const corpoDaTela = tela.slice(tela.lastIndexOf("export default function"));
/** ⚠️ ⛔ Sem os comentários: eles CITAM o erro para proibi-lo. */
const semComentarios = conteudo.replace(/\/\*\*[^]*?\*\//g, "").replace(/\/\/.*$/gm, "");

let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️⚠️ GRAVE ⛔ NÃO É CONTRAINDICADO ══════════════════════════════════ */

{
  /**
   * ⚠️ Cada corte grave declara, **em texto**, o que ⛔ não é. ⛔ Deixar isso
   * implícito devolveria o reflexo antigo.
   */
  const graves = ["hipo_grave", "hiper_grave"];
  const semNaoE = graves.filter((id) => {
    const i = semComentarios.indexOf(`id: "${id}"`);
    if (i < 0) return true;
    const bloco = semComentarios.slice(i, i + 700);
    return !/naoE:[^]{0,120}não é contraindicação absoluta/i.test(bloco);
  });
  confere("⚠️⚠️ os dois cortes GRAVES negam a contraindicação absoluta em TEXTO",
    semNaoE.length === 0,
    `⛔ ${semNaoE.join(", ")} ⛔ sem a negação escrita — ⛔ o reflexo antigo volta ⛔ sozinho`);
}

confere("⚠️⚠️ ⛔ NENHUM corte é declarado como contraindicação",
  !/(natureza|conduta):\s*"[^"]*contraindica/i.test(semComentarios),
  "⛔ `<50` ⛔ e `>400` definem **gravidade** na edição de 2026, ⛔ e ⛔ não exclusão");

confere("⚠️ os cinco erros do reflexo antigo estão declarados",
  /ERROS_A_EVITAR/.test(conteudo) && (semComentarios.match(/errado:/g) || []).length >= 5,
  "⛔ quem aprendeu `<50` como exclusão ⛔ não desaprende lendo ⛔ só a faixa nova");

confere("⚠️ ⛔ e eles CHEGAM à tela",
  /ERROS_A_EVITAR/.test(tela),
  "⛔ correção que ⛔ não é exibida ⛔ não corrige ⛔ ninguém");

/* ══ ⚠️⚠️ ⛔ NENHUM LIMIAR DE LIBERAÇÃO INVENTADO ════════════════════════ */

confere("⚠️⚠️ ⛔ NÃO existe valor para 'liberar' a IVT depois de >400",
  !/(liberar|libera|permite|autoriza)[^"]{0,40}(trombólise|IVT|reperfus)/i.test(semComentarios)
  && !/\b<\s*(300|250|200)\b/.test(semComentarios),
  "⛔ a fonte ⛔ não estabelece <300, <250, <200 ⛔ nem <180 como obrigatório (E-31)");

confere("⚠️⚠️ 140–180 se declara **manejo**, ⛔ e ⛔ NÃO porta de entrada",
  /alvo_manejo[^]{0,400}Não é pré-requisito para reperfundir/.test(conteudo),
  "⛔ *'só trombolisar com glicemia <180'* é o erro que esta frase impede");

/* ══ ⚠️⚠️ ⛔ NENHUMA DOSE FIXA DE INSULINA ═══════════════════════════════ */

{
  const i = semComentarios.indexOf('id: "insulina"');
  const bloco = i < 0 ? "" : semComentarios.slice(i, i + 1200);
  confere("⚠️⚠️ a insulina ⛔ NÃO tem campo `dose`",
    i >= 0 && !/\bdose:/.test(bloco),
    "⛔ ⛔ não existe dose fixa recomendada para AVC — escrever uma seria inventá-la");
  confere("⚠️ ⛔ e a ausência é **explicada** ao leitor",
    /Não existe dose fixa recomendada/.test(bloco),
    "⛔ campo vazio ⛔ sem explicação lê como esquecimento, ⛔ e ⛔ não como decisão");
}

confere("⚠️ ⛔ NENHUMA regra do tipo 'X mg/dL = N unidades'",
  !/\d+\s*(UI|unidades)\b/i.test(semComentarios),
  "⛔ a necessidade depende de peso, função renal, potássio, corticoide, CAD, EHH…");

/* ══ ⚠️⚠️ A PERGUNTA QUE DECIDE ═════════════════════════════════════════ */

confere("⚠️⚠️ a pergunta que decide existe ⛔ e é sobre o DÉFICIT",
  /PERGUNTA_QUE_DECIDE/.test(conteudo)
  && /déficit neurológico persiste depois de corrigir/.test(conteudo),
  "⛔ o que decide ⛔ não é o número — ⛔ e a tela ⛔ não pode sugerir que decide");

confere("⚠️ ⛔ e ela ABRE o bloco da glicemia na tela",
  /PERGUNTA_QUE_DECIDE/.test(corpoDaTela)
  && corpoDaTela.indexOf("PERGUNTA_QUE_DECIDE") < corpoDaTela.indexOf("CORTES_GLICEMICOS"),
  "⛔ uma tabela de faixas no topo ensinaria que o número decide");

confere("⚠️ os dois ramos da pergunta estão escritos",
  /seDesaparece/.test(conteudo) && /sePersiste/.test(conteudo)
  && /seDesaparece/.test(tela) && /sePersiste/.test(tela),
  "⛔ ⛔ só o ramo favorável faria o app esconder a hipótese de mimetizador");

/* ══ ⚠️ RASTREABILIDADE ═════════════════════════════════════════════════ */

{
  const tratamentos = semComentarios.split(/\n  \{\n/).filter((b) => /id: "/.test(b) && /nome: "/.test(b));
  const semFonte = tratamentos.filter((b) => !/procedencia: "/.test(b));
  confere("⚠️ todo tratamento declara procedência",
    tratamentos.length >= 5 && semFonte.length === 0,
    `⛔ ${semFonte.length} tratamento(s) ⛔ sem procedência (E-30)`);
}

confere("⚠️ a divergência do volume da glicose está REGISTRADA",
  /30 mL de glicose a 50%/.test(conteudo),
  "⛔ duas fontes descrevem volumes diferentes — ⛔ o app nomeia as duas em vez de escolher");

/* ══ ⚠️⚠️ O NÚMERO ⛔ E A FRASE DIZEM O MESMO ═══════════════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ POR QUE ISTO EXISTE (2026-09-06) ────────────────────────────────
   *
   * ⛔ As faixas eram **⛔ só texto** (*"Acima de 180 e até 400 mg/dL"*), ⛔ e o
   * eixo de ameaça precisava comparar um número. ⚠️ Redigitar 180 ⛔ e 400 no
   * núcleo daria **duas verdades** sobre o mesmo corte (**I6**) — ⛔ e, no dia
   * em que a transcrição mudasse, a que decide seria a cópia esquecida.
   *
   * ⚠️ Agora `de`/`ate` moram colados na frase, ⛔ e esta conferência exige que
   * **todo número declarado apareça na frase transcrita**. ⛔ Um limiar que
   * ⛔ não está escrito na `faixa` é limiar inventado (**E-31**).
   */
  const blocos = semComentarios.split(/\n  \{\n/).filter((b) => /faixa: "/.test(b));
  const incoerentes = [];
  for (const b of blocos) {
    const faixa = (b.match(/faixa: "([^"]+)"/) || [])[1] ?? "";
    const numerosDaFrase = new Set((faixa.match(/\d+/g) ?? []).map(Number));
    for (const chave of ["de", "ate"]) {
      const m = b.match(new RegExp(`\\b${chave}: (\\d+)`));
      if (!m) continue;
      if (!numerosDaFrase.has(Number(m[1]))) {
        incoerentes.push(`${chave}=${m[1]} ⛔ não aparece em "${faixa}"`);
      }
    }
  }
  confere("⚠️⚠️ todo limite numérico está ESCRITO na faixa transcrita",
    blocos.length === 5 && incoerentes.length === 0,
    `⛔ ${incoerentes.join(" · ") || `⛔ ${blocos.length} corte(s) lidos`}`);

  const semPedeConduta = blocos.filter((b) => !/pedeConduta: (true|false)/.test(b));
  confere("⚠️ todo corte declara se PEDE CONDUTA — ⛔ e ⛔ isso ⛔ não é 'bloqueia'",
    semPedeConduta.length === 0,
    `⛔ ${semPedeConduta.length} corte(s) ⛔ sem declarar — ⛔ e foi confundir os dois que pôs ✓ numa glicemia de 579`);
}

if (falhas > 0) {
  console.log(`\n❌ F-18 · GLICEMIA — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ F-18 · GLICEMIA — ${ok}/${ok} conferências · 5 cortes · 5 tratamentos · 3 alvos`);
