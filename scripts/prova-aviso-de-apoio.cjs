/**
 * TRAVA DO AVISO DE APOIO À DECISÃO — ⚠️ **um padrão**, ⛔ e ⛔ não trinta frases.
 *
 * PROMETE: que as três variantes tenham o texto do autor, que o aviso ⛔ não
 *   use cor de estado ⛔ nem símbolo, que ⛔ ele ⛔ não desenhe ⛔ sem saída
 *   clínica, que haja **⛔ um** `recomendacao` ⛔ por painel, que o disclaimer
 *   manual antigo ⛔ não coexista com ⛔ ele, que *«O julgamento é seu»* ⛔ e
 *   *«A leitura é sua»* ⛔ permaneçam, que a tela de coleta ⛔ não receba
 *   aviso, que `altoRisco` ⛔ e `calculoDose` ⛔ não fiquem colados, ⛔ e que
 *   aceite ⛔ e `ⓘ` leiam **⛔ a mesma** constante ⛔ com a versão subida.
 *
 * NÃO PROMETE: que o aviso esteja **⛔ visualmente** legível ⛔ em 375 px —
 *   ⛔ isso é revisão de tela, ⛔ e ⛔ mora ⛔ no e2e. ⛔ E ⛔ **⛔ não** promete
 *   que ⛔ os onze pontos ⛔ sejam ⛔ os pontos ⛔ certos: ⛔ o mapa ⛔ foi
 *   decisão clínica do autor, ⛔ e ⛔ uma trava ⛔ não confere ⛔ julgamento
 *   clínico — ⛔ ela confere ⛔ que ⛔ o que foi decidido ⛔ **⛔ continua** ⛔ de
 *   pé.
 *
 * UNIVERSO: `design-system/aviso-de-apoio-clinico.tsx`, as telas do AVC,
 *   `components/consent-screen.tsx` ⛔ e `lib/consentimento.ts`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ⛔ ELA GUARDA ───────────────────────────────────────────
 *
 * ⚠️ Decisão do autor, 2026-09-09: *"criar um padrão único de aviso de apoio à
 * decisão clínica em todo o módulo AVC ⛔ e depois reutilizável nos demais
 * módulos. ⛔ **⛔ Não espalhar textos diferentes escritos manualmente ⛔ em
 * cada tela.**"*
 *
 * ⛔ ⛔ ⛔ **⛔ E ⛔ o risco ⛔ não é estético.** ⛔ Um disclaimer ⛔ que aparece
 * ⛔ **⛔ sempre** ⛔ vira moldura da tela — ⛔ e ⛔ moldura ⛔ ninguém lê.
 * ⚠️ ⛔ Por isso ⛔ metade destas conferências ⛔ mede ⛔ **⛔ onde ⛔ ele ⛔ não
 * pode estar**.
 */
const path = require("node:path");
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) {
    ok++;
    return;
  }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const DS = lerFonte(path.join(appDir, "design-system", "aviso-de-apoio-clinico.tsx"));
const tela = (nome) => lerFonte(path.join(appDir, "components", "avc", nome));

/* ══ ⚠️⚠️⚠️ 1 · AS TRÊS VARIANTES, ⛔ COM O TEXTO DO AUTOR ═══════════════ */

{
  confere(
    "⚠️ as três variantes existem, com o texto aprovado",
    /recomendacao:\s*\n?\s*"Recomendação de apoio baseada nas fontes citadas/.test(DS) &&
      /altoRisco:\s*\n?\s*"Apoio à decisão clínica\. Confirme os dados do paciente/.test(DS) &&
      /calculoDose:\s*\n?\s*"Cálculo baseado nos dados registrados no atendimento/.test(DS),
    "⛔ o texto é do autor, ⛔ palavra por palavra — ⛔ e ⛔ não paráfrase"
  );

  /**
   * ⚠️⚠️ ⛔ A **⛔ SEGUNDA** REDAÇÃO DO ALTO RISCO — revisão do próprio autor:
   * *"eu evitaria «responsabilidade» ⛔ em excesso ⛔ por tom jurídico"*.
   */
  confere(
    "⚠️⚠️ ⛔ o alto risco ⛔ não usa o tom defensivo que o autor recusou",
    /A decisão final e a execução cabem ao médico assistente/.test(DS) &&
      !/são responsabilidade do médico assistente/.test(DS),
    "⛔ um app que ⛔ se defende ⛔ soa como ⛔ quem ⛔ não confia ⛔ em quem ⛔ o usa"
  );
}

/* ══ ⚠️⚠️⚠️ 2 · ⛔ ELE ⛔ NÃO MUDA O JUÍZO CLÍNICO ═══════════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ Exigência do autor: *"o aviso ⛔ não deve mudar a cor clínica,
   * COR/LOE, símbolo ⛔ ou veredito"*.
   */
  confere(
    "⚠️⚠️ ⛔ o aviso é neutro — ⛔ sem cor de estado clínico",
    !/cores\.(critical|warning|success|danger)/.test(DS),
    "⛔ com cor de estado ⛔ o disclaimer ⛔ competiria com o alfabeto clínico (**E-15**), ⛔ e ⛔ viraria alarme"
  );
  confere(
    "⚠️ ⛔ o aviso ⛔ não carrega símbolo",
    !/[⚠✓✗⛔!?]\s*\{?tr\(TEXTO_DO_AVISO/.test(DS) && !/<Icone/.test(DS),
    "⛔ símbolo ⛔ neste app **⛔ é** estado clínico — ⛔ um ⚠️ ⛔ aqui diria *\"há algo errado com este paciente\"*"
  );
}

/* ══ ⚠️⚠️⚠️ 3 · ⛔ SEM SAÍDA CLÍNICA, ⛔ SEM AVISO ══════════════════════ */

{
  confere(
    "⚠️⚠️ ⛔ o componente recusa desenhar sem saída (`ha`)",
    /ha: boolean;/.test(DS) && /if \(!ha\) return null;/.test(DS),
    "⛔ *\"⛔ não mostrar aviso desacoplado de uma saída clínica\"* — ⛔ a guarda mora ⛔ no componente, ⛔ e ⛔ não ⛔ em cada chamada"
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ os painéis de leitura ⛔ passam a condição **⛔ de verdade** —
   * ⛔ `ha` fixo em `true` ⛔ ali ⛔ anularia a guarda ⛔ sem ⛔ ninguém ver.
   */
  for (const [arq, onde] of [
    ["ui/index.tsx", "LeiturasEmBlocos"],
    ["campos-clinicos.tsx", "PainelDeLeituras"],
  ]) {
    const txt = lerFonte(path.join(appDir, "components", "avc", ...arq.split("/")));
    confere(
      `⚠️ ${onde} condiciona o aviso a haver leitura`,
      /ha=\{leituras\.length > 0\}/.test(txt),
      "⛔ painel vazio ⛔ ainda ⛔ não recomendou ⛔ nada — ⛔ e o aviso ⛔ qualificaria ⛔ o silêncio"
    );
  }
}

/* ══ ⚠️⚠️⚠️ 4 · ⛔ **⛔ UM** POR PAINEL, ⛔ E ⛔ NÃO UM POR LEITURA ═══════ */

{
  const painéis = ["ui/index.tsx", "campos-clinicos.tsx"];
  for (const arq of painéis) {
    const txt = lerFonte(path.join(appDir, "components", "avc", ...arq.split("/")));
    const quantos = (txt.match(/variante="recomendacao"/g) ?? []).length;
    confere(
      `⚠️⚠️ ${arq} tem **um** \`recomendacao\`, ⛔ e ⛔ não um por leitura`,
      quantos === 1,
      `⛔ ${quantos} ocorrência(s) — ⛔ na Estabilização, ⛔ um por leitura ⛔ punha a mesma frase **⛔ cinco vezes**`
    );
  }
}

/* ══ ⚠️⚠️⚠️ 5 · ⛔ OS ANTIGOS ⛔ NÃO SOBREVIVEM ═════════════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ A frase manual ⛔ que o componente substitui — ⛔ ela ⛔ não pode
   * ⛔ **⛔ coexistir** com ⛔ ele, ⛔ ou o médico lê ⛔ duas versões ⛔ do mesmo
   * recado.
   */
  const vivos = fs
    .readdirSync(path.join(appDir, "components", "avc"))
    .filter((f) => f.endsWith(".tsx"))
    .filter((f) =>
      /\{tr\("Apoio ao julgamento clínico\. A decisão permanece do médico\."\)\}/.test(
        lerFonte(path.join(appDir, "components", "avc", f))
      )
    );
  confere(
    "⚠️⚠️ ⛔ o disclaimer manual antigo ⛔ não permanece renderizado",
    vivos.length === 0,
    `⛔ ${vivos.join(", ")} — ⛔ duas redações ⛔ para o mesmo recado ⛔ é ⛔ o que esta frente veio desfazer`
  );
}

/* ══ ⚠️⚠️⚠️ 6 · ⛔ O QUE **⛔ NÃO** É DISCLAIMER ⛔ FICA ═════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ Exigência do autor: *"⛔ não substituir frases clínicas específicas
   * como «O julgamento é seu» / «A leitura é sua» ⛔ quando ⛔ elas significam
   * que **⛔ a própria fonte ⛔ não fornece corte ⛔ ou regra**. ⛔ Elas ⛔ não
   * são disclaimer; ⛔ são **⛔ conteúdo clínico**"*.
   */
  const b = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-b.ts"));
  const g = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-g.ts"));
  confere(
    "⚠️⚠️ *«O julgamento é seu»* continua — ⛔ é conteúdo, ⛔ e ⛔ não disclaimer",
    /O julgamento é seu/.test(b),
    "⛔ ela diz que **a fonte ⛔ não dá corte** — ⛔ trocá-la ⛔ pelo genérico ⛔ apagaria ⛔ essa informação"
  );
  confere(
    "⚠️ *«A leitura é sua»* continua, ⛔ pelo mesmo motivo",
    /A leitura é sua/.test(g),
    "⛔ *\"a fonte ⛔ não lista quais condições são essas\"* ⛔ é ⛔ um fato sobre a diretriz"
  );
}

/* ══ ⚠️⚠️⚠️ 7 · O ACEITE ⛔ E O `ⓘ` LEEM **⛔ A MESMA** CONSTANTE ═══════ */

{
  const consent = lerFonte(path.join(appDir, "components", "consent-screen.tsx"));
  confere(
    "⚠️⚠️ o aceite versionado usa a constante, ⛔ e ⛔ não uma cópia",
    /USO_CLINICO_E_LIMITACOES/.test(consent) &&
      /aviso-de-apoio-clinico/.test(consent),
    "⛔ duas cópias divergiriam, ⛔ e o médico ⛔ teria **aceitado um texto ⛔ e lido outro**"
  );
  confere(
    "⚠️ o `ⓘ Uso clínico e limitações` lê a mesma constante",
    /AcessoAoUsoClinico/.test(DS) &&
      DS.indexOf("USO_CLINICO_E_LIMITACOES") < DS.lastIndexOf("USO_CLINICO_E_LIMITACOES"),
    "⛔ *\"expor o **mesmo** conteúdo\"* — ⛔ exigência do autor"
  );

  /**
   * ⚠️⚠️⚠️ ⛔ E A VERSÃO DO ACEITE **⛔ SUBIU**. ⛔ Acrescentar texto ⛔ sem
   * mudar a chave ⛔ deixaria ⛔ quem ⛔ já aceitou ⛔ **⛔ nunca ler** ⛔ o que
   * foi acrescentado.
   */
  const versao = lerFonte(path.join(appDir, "lib", "consentimento.ts"));
  confere(
    "⚠️⚠️ ⛔ a versão do aceite subiu junto com o texto",
    /VERSAO_DO_TEXTO = "2026-09-09"/.test(versao),
    "⛔ o app registraria ⛔ um aceite ⛔ de ⛔ um texto ⛔ que ⛔ aquela pessoa ⛔ não viu"
  );
}

/* ══ ⚠️⚠️⚠️ 8 · ⛔ NADA DE DISCLAIMER EM TELA DE COLETA ═════════════════ */

{
  /**
   * ⚠️ Exigência do autor: *"⛔ não colocar o aviso ⛔ em simples campos de
   * coleta de dados"*. ⛔ **Paciente** ⛔ é a tela de coleta ⛔ do módulo.
   */
  const paciente = tela("superficie-paciente.tsx");
  confere(
    "⚠️⚠️ ⛔ Paciente — tela de coleta — ⛔ não recebe aviso",
    !/AvisoDeApoioClinico/.test(paciente),
    "⛔ perguntar peso ⛔ não recomenda ⛔ nada — ⛔ e disclaimer ⛔ ali ⛔ só ensina ⛔ a ignorar disclaimers"
  );
}

/* ══ ⚠️⚠️⚠️ 9 · ⛔ `altoRisco` ⛔ E `calculoDose` ⛔ NÃO SE EMPILHAM ═════ */

{
  /**
   * ⚠️⚠️ ⛔ Exigência do autor: *"`altoRisco` fica junto da ação/conduta;
   * `calculoDose` fica junto ao número da dose/cálculo. ⛔ **⛔ Não empilhar
   * dois disclaimers grandes.**"*
   *
   * ⛔ ⛔ **⛔ Empilhado** ⛔ é ⛔ um imediatamente depois do outro, ⛔ sem
   * ⛔ nada ⛔ entre eles.
   */
  const empilhados = [];
  for (const f of fs.readdirSync(path.join(appDir, "components", "avc")).filter((x) => x.endsWith(".tsx"))) {
    const txt = lerFonte(path.join(appDir, "components", "avc", f));
    if (/variante="altoRisco"[^]{0,400}?\/>\s*\n\s*<AvisoDeApoioClinico\s*\n?\s*variante="calculoDose"/.test(txt)) {
      empilhados.push(f);
    }
  }
  confere(
    "⚠️⚠️ ⛔ `altoRisco` ⛔ e `calculoDose` ⛔ não ficam colados",
    empilhados.length === 0,
    `⛔ ${empilhados.join(", ")} — ⛔ dois disclaimers grandes seguidos ⛔ viram parede, ⛔ e parede ⛔ ninguém lê`
  );

  /**
   * ⚠️ ⛔ E ⛔ o `calculoDose` ⛔ **⛔ sempre** ⛔ acompanha ⛔ um número: ⛔ nos
   * três lugares em que ⛔ ele aparece, ⛔ há dose ⛔ na mesma tela.
   */
  const comDose = ["conduta-da-fonte.tsx", "superficie-f.tsx", "superficie-hemorragica.tsx"];
  const semNumero = comDose.filter((f) => {
    const txt = tela(f);
    return /variante="calculoDose"/.test(txt) && !/dose|mg|Dose/i.test(txt);
  });
  confere(
    "⚠️ ⛔ o `calculoDose` ⛔ só existe onde ⛔ há dose exibida",
    semNumero.length === 0,
    `⛔ ${semNumero.join(", ")} — ⛔ aviso sobre conferir dose ⛔ sem dose ⛔ qualifica ⛔ o vazio`
  );
}

if (falhas > 0) {
  console.log(`\n❌ AVISO DE APOIO — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ AVISO DE APOIO — ${ok}/${ok} conferências · 3 variantes · 11 pontos\n`);
