/**
 * Trava do FLUXO GUIADO — quando o app conclui em vez de perguntar.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * --------------------------
 * "Há sinais de instabilidade ATRIBUÍVEIS à frequência baixa?" é pergunta de
 * especialista: pressupõe saber o que conta como sinal e saber atribuí-lo à
 * frequência. Quem não tem experiência trava aí — e travar num fluxo de
 * emergência é o pior desfecho possível de uma tela.
 *
 * O pedido do autor do app foi desmembrar a pergunta em observações simples que
 * qualquer um responde à beira do leito, e deixar o APP concluir.
 *
 * A conclusão é código. Código que decide conduta clínica precisa de teste, e o
 * teste precisa cobrir a REGRA, não um caminho feliz: cada sinal isolado tem de
 * bastar para concluir instabilidade, porque é assim que a diretriz define.
 *
 * ── ESTE TESTE JÁ ESTEVE ERRADO ──────────────────────────────────────────────
 *
 * A versão anterior provava, com 21 verificações passando, que CADA um dos cinco
 * achados levava sozinho a "instável". O teste estava certo quanto ao código e
 * errado quanto à clínica: ele apenas confirmava o defeito.
 *
 * O defeito era traduzir dois critérios COMPOSTOS da AHA por um elemento só:
 * "sinais de choque" virou "pele pálida, fria ou suada", e "insuficiência
 * cardíaca aguda" virou "falta de ar". Pele suada não é choque; falta de ar não
 * é IC aguda. Um paciente com PAS 110, lúcido, sem dor e sem dispneia era
 * declarado INSTÁVEL só por estar suado — e o fluxo seguia para atropina.
 *
 * Fica registrado porque é a lição mais cara aqui: um teste verde não diz que a
 * regra está certa, diz que o código faz o que alguém escreveu. Quando a regra é
 * clínica, o teste tem de citar a diretriz, não o código.
 *
 * O QUE ELE PROVA
 * ---------------
 * 1. BASTA SOZINHO — hipotensão (PAS < 90), alteração aguda do estado mental,
 *    dor torácica de caráter isquêmico. São critérios inteiros na AHA.
 * 2. PRECISA DO PAR — pele alterada só vira CHOQUE com má perfusão objetiva;
 *    dispneia só vira IC AGUDA com congestão. Sozinhos, NÃO podem concluir
 *    instabilidade.
 * 3. NEM ESTÁVEL — meio critério não é ausência de achado: cai em "limítrofe",
 *    que orienta reavaliar. Chamar de estável esconderia um sinal real.
 * 4. O limiar de PAS é o declarado (< 90), inclusive nas bordas 89/90.
 * 5. O roteamento derivado só devolve destinos que ele mesmo declarou em
 *    `possiveis` — é isso que mantém o grafo auditável estaticamente.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fluxo-guiado-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "acls-bradycardia-tree.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const mod = require(path.join(tempDir, "acls-bradycardia-tree.js"));
const arvore = Object.values(mod).find((v) => v && v.nodes && v.entryNodeId);
assert.ok(arvore, "árvore da bradicardia não foi exportada");

const no = arvore.nodes.instab_dados;
assert.ok(no, "nó guiado instab_dados não existe");
assert.equal(no.type, "input");
assert.ok(typeof no.next === "object", "instab_dados deveria ter roteamento derivado");

const { possiveis, escolher } = no.next;
const INSTAVEL = "instab_conclusao_instavel";
const LIMITROFE = "instab_conclusao_limitrofe";
const ESTAVEL = "instab_conclusao_estavel";

let ok = 0;
const falhas = [];

function checar(descricao, valores, esperado) {
  const obtido = escolher(valores);
  if (!possiveis.includes(obtido)) {
    falhas.push(`${descricao}: destino "${obtido}" fora dos possíveis (${possiveis.join(", ")})`);
    return;
  }
  if (obtido !== esperado) {
    falhas.push(`${descricao}: esperava ${esperado}, obteve ${obtido}`);
    return;
  }
  ok++;
}

// Base: tudo negativo e pressão normal.
const semNada = {
  pas: "120", mental: "nao", dorToracica: "nao",
  perfusao: "nao", perfusaoObjetiva: "nao", dispneia: "nao", congestao: "nao",
};

checar("nenhum achado", semNada, ESTAVEL);

// ── Critérios INTEIROS: bastam sozinhos ─────────────────────────────────────
checar("só alteração do estado mental", { ...semNada, mental: "sim" }, INSTAVEL);
checar("só dor torácica isquêmica", { ...semNada, dorToracica: "sim" }, INSTAVEL);
checar("só hipotensão", { ...semNada, pas: "80" }, INSTAVEL);

// ── Critérios COMPOSTOS: metade não basta ───────────────────────────────────
//
// É o caso que motivou a correção. Pele fria e suada, sozinha, aparece em dor,
// ansiedade, febre, hipoglicemia e reação vagal — concluir instabilidade a
// partir dela leva à atropina em quem não precisa.
checar("só pele alterada — NÃO é choque", { ...semNada, perfusao: "sim" }, LIMITROFE);
checar("só dispneia — NÃO é IC aguda", { ...semNada, dispneia: "sim" }, LIMITROFE);
checar(
  "pele alterada sem conseguir avaliar a perfusão",
  { ...semNada, perfusao: "sim", perfusaoObjetiva: "nao_avaliado" },
  LIMITROFE
);
checar(
  "dispneia sem conseguir avaliar a congestão",
  { ...semNada, dispneia: "sim", congestao: "nao_avaliado" },
  LIMITROFE
);

// ── Compostos COMPLETOS: aí sim ─────────────────────────────────────────────
checar("pele + má perfusão objetiva = choque", { ...semNada, perfusao: "sim", perfusaoObjetiva: "sim" }, INSTAVEL);
checar("dispneia + congestão = IC aguda", { ...semNada, dispneia: "sim", congestao: "sim" }, INSTAVEL);

// O par SEM o achado principal também não fecha: má perfusão objetiva marcada
// sem pele alterada, ou congestão sem dispneia, não constroem o critério.
checar("só má perfusão objetiva, sem pele alterada", { ...semNada, perfusaoObjetiva: "sim" }, ESTAVEL);
checar("só congestão, sem dispneia", { ...semNada, congestao: "sim" }, ESTAVEL);

// Bordas do limiar declarado no próprio nó de origem: PAS < 90.
checar("PAS 89 — abaixo do limiar", { ...semNada, pas: "89" }, INSTAVEL);
checar("PAS 90 — no limiar, não abaixo", { ...semNada, pas: "90" }, ESTAVEL);
checar("PAS 91 — acima", { ...semNada, pas: "91" }, ESTAVEL);

// Combinações não podem inverter o resultado.
checar("hipotensão + sinal", { ...semNada, pas: "70", mental: "sim" }, INSTAVEL);
checar("todos os sinais", {
  pas: "60", mental: "sim", dorToracica: "sim",
  perfusao: "sim", perfusaoObjetiva: "sim", dispneia: "sim", congestao: "sim",
}, INSTAVEL);

// Um critério inteiro presente tira o caso de "limítrofe", mesmo com meio
// composto junto: o inteiro decide.
checar("hipotensão + só pele", { ...semNada, pas: "80", perfusao: "sim" }, INSTAVEL);

// Vírgula decimal: o app grava o que o usuário digita, e pt-BR usa vírgula.
checar("PAS com vírgula", { ...semNada, pas: "88,5" }, INSTAVEL);

// Campo não informado não pode inventar hipotensão.
checar("PAS ausente, sem sinais", { mental: "nao", perfusao: "nao", dorToracica: "nao", dispneia: "nao", congestao: "nao" }, ESTAVEL);

// Os dois destinos declarados precisam existir na árvore.
for (const destino of possiveis) {
  if (!arvore.nodes[destino]) falhas.push(`destino declarado "${destino}" não existe na árvore`);
  else ok++;
}

// ── TAQUICARDIA: mesma decomposição, mesmas regras ──────────────────────────
//
// Os critérios de instabilidade da AHA são os MESMOS nas duas arritmias. Se as
// duas árvores derivarem instabilidade de formas diferentes, uma delas está
// errada — e nada no código impede isso, porque são arquivos separados. Este
// bloco roda a MESMA bateria na taquicardia.
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "acls-tachycardia-tree.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const taqMod = require(path.join(tempDir, "acls-tachycardia-tree.js"));
const taq = Object.values(taqMod).find((v) => v && v.nodes && v.entryNodeId);
assert.ok(taq, "árvore da taquicardia não foi exportada");

const noTaq = taq.nodes.tqi_dados;
assert.ok(noTaq, "nó guiado tqi_dados não existe na taquicardia");
assert.equal(noTaq.type, "input");
assert.ok(typeof noTaq.next === "object", "tqi_dados deveria ter roteamento derivado");

const T_INSTAVEL = "tqi_conclusao_instavel";
const T_LIMITROFE = "tqi_conclusao_limitrofe";
const T_ESTAVEL = "tqi_conclusao_estavel";

function checarTaq(descricao, valores, esperado) {
  const obtido = noTaq.next.escolher(valores);
  if (!noTaq.next.possiveis.includes(obtido)) {
    falhas.push(`taquicardia · ${descricao}: destino "${obtido}" fora dos possíveis`);
    return;
  }
  if (obtido !== esperado) {
    falhas.push(`taquicardia · ${descricao}: esperava ${esperado}, obteve ${obtido}`);
    return;
  }
  ok++;
}

checarTaq("nenhum achado", semNada, T_ESTAVEL);
checarTaq("só estado mental", { ...semNada, mental: "sim" }, T_INSTAVEL);
checarTaq("só dor isquêmica", { ...semNada, dorToracica: "sim" }, T_INSTAVEL);
checarTaq("só hipotensão", { ...semNada, pas: "80" }, T_INSTAVEL);
checarTaq("só pele alterada — NÃO é choque", { ...semNada, perfusao: "sim" }, T_LIMITROFE);
checarTaq("só dispneia — NÃO é IC aguda", { ...semNada, dispneia: "sim" }, T_LIMITROFE);
checarTaq("pele + má perfusão = choque", { ...semNada, perfusao: "sim", perfusaoObjetiva: "sim" }, T_INSTAVEL);
checarTaq("dispneia + congestão = IC aguda", { ...semNada, dispneia: "sim", congestao: "sim" }, T_INSTAVEL);
checarTaq("PAS 89 — abaixo do limiar", { ...semNada, pas: "89" }, T_INSTAVEL);
checarTaq("PAS 90 — no limiar", { ...semNada, pas: "90" }, T_ESTAVEL);
checarTaq("PAS ausente, sem sinais", { mental: "nao", dorToracica: "nao", perfusao: "nao", dispneia: "nao" }, T_ESTAVEL);

for (const destino of noTaq.next.possiveis) {
  if (!taq.nodes[destino]) falhas.push(`taquicardia: destino "${destino}" não existe na árvore`);
  else ok++;
}

// As DUAS árvores têm de concluir igual para a mesma entrada. É o que impede
// uma delas de ser corrigida e a outra não.
const casos = [
  semNada,
  { ...semNada, mental: "sim" },
  { ...semNada, dorToracica: "sim" },
  { ...semNada, pas: "80" },
  { ...semNada, perfusao: "sim" },
  { ...semNada, dispneia: "sim" },
  { ...semNada, perfusao: "sim", perfusaoObjetiva: "sim" },
  { ...semNada, dispneia: "sim", congestao: "sim" },
  { ...semNada, perfusaoObjetiva: "sim" },
  { ...semNada, congestao: "sim" },
];
const grau = (id) => (/instavel/.test(id) ? "instavel" : /limitrofe/.test(id) ? "limitrofe" : "estavel");
for (const caso of casos) {
  const b = grau(no.next.escolher(caso));
  const t = grau(noTaq.next.escolher(caso));
  if (b !== t) {
    falhas.push(
      `bradicardia e taquicardia divergem para ${JSON.stringify(caso)}: ` +
      `bradi="${b}", taqui="${t}" — os critérios de instabilidade da AHA são os mesmos nas duas.`
    );
  } else ok++;
}

// ── TODOS OS MÓDULOS QUE USAM A DECOMPOSIÇÃO COMUM ──────────────────────────
//
// A decomposição vive agora em lib/instabilidade-guiada e é consumida por vários
// módulos. Este bloco confere, para CADA um deles, que a conclusão é a mesma
// para a mesma entrada — e que os destinos declarados existem na árvore.
//
// Vale mais do que testar a função isolada: o risco real não é a função errar,
// é uma árvore ligar os destinos na ordem trocada e mandar o instável para o
// caminho do estável. Isso o teste da função sozinha nunca pegaria.
//
// O destino de CADA grau é declarado aqui, e não deduzido. A primeira versão
// checava só que os três graus caíam em destinos DISTINTOS — e uma mutação que
// trocava instável por estável passava ilesa, porque continuavam distintos.
// Trocar esses dois é o erro mais grave possível neste código: manda o paciente
// em choque para o caminho de quem não tem choque. Tem de estar escrito.
const MODULOS_GUIADOS = [
  {
    arquivo: "acute-abdomen-decision-tree.ts",
    no: "abd_instab_dados",
    espera: { instavel: "catastrofe", limitrofe: "abd_conclusao_limitrofe", estavel: "padrao" },
  },
  {
    arquivo: "shock-decision-tree.ts",
    no: "choque_dados",
    espera: { instavel: "estabilizacao_metas", limitrofe: "choque_limitrofe", estavel: "sem_choque" },
  },
  {
    arquivo: "tep-decision-tree.ts",
    no: "tep_instab_dados",
    espera: { instavel: "ar_suporte", limitrofe: "tep_limitrofe", estavel: "prob" },
  },
];

for (const { arquivo, no: idNo, espera } of MODULOS_GUIADOS) {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
      "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
      "--outDir", tempDir,
      path.join(appDir, arquivo),
    ],
    { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
  );

  const m = require(path.join(tempDir, arquivo.replace(/\.ts$/, ".js")));
  const arv = Object.values(m).find((v) => v && v.nodes && v.entryNodeId);
  if (!arv) { falhas.push(`${arquivo}: árvore não exportada`); continue; }

  const noGuiado = arv.nodes[idNo];
  if (!noGuiado) { falhas.push(`${arquivo}: nó guiado "${idNo}" não existe`); continue; }
  if (noGuiado.type !== "input" || typeof noGuiado.next !== "object") {
    falhas.push(`${arquivo}: "${idNo}" deveria ser input com roteamento derivado`);
    continue;
  }
  ok++;

  // Os campos vêm do módulo comum — se alguém copiar e alterar, o conjunto muda.
  const ids = noGuiado.fields.map((f) => f.id);
  for (const obrigatorio of ["pas", "mental", "dorToracica", "perfusao", "perfusaoObjetiva", "dispneia", "congestao"]) {
    if (!ids.includes(obrigatorio)) {
      falhas.push(`${arquivo}: campo "${obrigatorio}" sumiu do passo guiado — a decomposição deixou de ser a comum`);
    } else ok++;
  }

  // Destinos declarados precisam existir.
  for (const d of noGuiado.next.possiveis) {
    if (!arv.nodes[d]) falhas.push(`${arquivo}: destino "${d}" não existe na árvore`);
    else ok++;
  }

  // Cada grau tem de cair num destino DIFERENTE. Dois graus no mesmo destino
  // significa que a distinção foi perdida na ligação — o app perguntaria sete
  // coisas para concluir sempre a mesma.
  const porGrau = {
    instavel: noGuiado.next.escolher({ ...semNada, pas: "80" }),
    limitrofe: noGuiado.next.escolher({ ...semNada, perfusao: "sim" }),
    estavel: noGuiado.next.escolher(semNada),
  };
  const distintos = new Set(Object.values(porGrau));
  if (distintos.size !== 3) {
    falhas.push(
      `${arquivo}: os três graus não caem em destinos distintos — ${JSON.stringify(porGrau)}. ` +
      `Provável ligação trocada ou repetida.`
    );
  } else ok++;

  // Cada grau no destino DECLARADO. É isto que pega a inversão.
  for (const grau of ["instavel", "limitrofe", "estavel"]) {
    if (porGrau[grau] !== espera[grau]) {
      falhas.push(
        `${arquivo}: grau "${grau}" deveria ir para "${espera[grau]}" e vai para "${porGrau[grau]}". ` +
        `Ligação trocada — o paciente é encaminhado para o caminho errado.`
      );
    } else ok++;
  }
}

// ── AVC: a janela de trombólise não pode ser perguntada de novo ─────────────
//
// O passo exibia "Janela atual: 3–4,5 h" e, logo abaixo, perguntava "o início
// foi há ≤ 4,5 horas?". As cinco opções de janela são inequívocas quanto ao
// limite, então a resposta é derivável — e agora é derivada.
//
// O mapeamento precisa de teste porque um erro aqui manda o paciente para o
// lado errado: liberar trombólise fora da janela, ou negar dentro dela.
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "avc-decision-tree.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const avcMod = require(path.join(tempDir, "avc-decision-tree.js"));
const avc = Object.values(avcMod).find((v) => v && v.nodes && v.entryNodeId);
assert.ok(avc, "árvore do AVC não foi exportada");

const noJanela = avc.nodes.isq_janela;
assert.ok(noJanela, "nó isq_janela não existe");
assert.equal(noJanela.type, "action", "isq_janela deveria concluir, não perguntar");
assert.ok(typeof noJanela.next === "object", "isq_janela deveria ter roteamento derivado");

const TROMBOLISE = "isq_contraindicacoes";
const IMAGEM = "isq_trombectomia_check";

// Os valores vêm dos PRESETS do campo, não inventados aqui: se alguém mudar o
// texto de um preset e esquecer do roteamento, este teste quebra.
const campoJanela = Object.values(avc.nodes)
  .filter((n) => n.type === "input")
  .flatMap((n) => n.fields)
  .find((f) => f.id === "janela");
assert.ok(campoJanela, "campo janela não encontrado");

const esperado = {
  "< 3 h": TROMBOLISE,
  "3–4,5 h": TROMBOLISE,
  "4,5–6 h": IMAGEM,
  "6–24 h": IMAGEM,
  "desconhecido / ao acordar": IMAGEM,
};

for (const preset of campoJanela.presets) {
  const alvo = esperado[preset.value];
  if (!alvo) {
    falhas.push(`preset de janela "${preset.value}" não tem destino previsto no teste — roteamento e presets divergiram`);
    continue;
  }
  const obtido = noJanela.next.escolher({ janela: preset.value });
  if (!noJanela.next.possiveis.includes(obtido)) {
    falhas.push(`janela "${preset.value}": destino "${obtido}" fora dos possíveis`);
  } else if (obtido !== alvo) {
    falhas.push(`janela "${preset.value}": esperava ${alvo}, obteve ${obtido}`);
  } else {
    ok++;
  }
}

// Janela ausente não pode liberar trombólise.
if (noJanela.next.escolher({}) === TROMBOLISE) {
  falhas.push("janela AUSENTE não pode encaminhar para a trombólise — o único erro aceitável aqui é negar, não liberar");
} else {
  ok++;
}

console.log("\nFluxo guiado — instabilidade em 5 módulos + janela do AVC\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
} else {
  console.log(`✅ ${ok} verificações — decomposição comum em bradicardia, taquicardia, abdome agudo, choque e TEP — mesma conclusão, destinos distintos — + janela de trombólise (AVC)`);
}
console.log("");

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
