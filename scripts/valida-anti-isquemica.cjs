#!/usr/bin/env node
/**
 * PROMETE: que o VD isolado NÃO bloqueie a morfina; que o bloqueio venha do
 *   estado hemodinâmico; e que a morfina leia o estado da terapia
 *   anti-isquêmica nas quatro situações — não avaliada, contraindicada,
 *   realizada com dor resolvida e realizada com dor persistente.
 * NÃO PROMETE: que as doses estejam certas (`test:dose-governada`), que a
 *   janela do PDE-5 esteja certa (`test:pde5-janela`), nem que a árvore da V2
 *   esteja bem desenhada (`test:sca-v2`).
 * UNIVERSO: `lib/vereditos-sca.ts`, `lib/terapia-anti-isquemica.ts` e
 *   `lib/nitrato-contraindicacao.ts` — o núcleo clínico COMPARTILHADO pelas
 *   duas árvores.
 *
 * ── ⚠️ O BUG QUE ESTA TRAVA NASCE PARA IMPEDIR, E ELE ESTAVA PUBLICADO ──────
 *
 * `vereditoMorfina` tinha `if (suspeitaDeVd(v)) return vermelho`. O texto de
 * onde eu construí o veredito — `MORFINA_CONTRAINDICACOES` — diz "IAM de
 * ventrículo direito COM HIPOTENSÃO", e eu deixei o qualificador para trás ao
 * traduzir a frase em código. O veredito ficou MAIS RESTRITIVO QUE A FONTE.
 *
 * A correção é do autor (2026-08-27): a diretriz separa as duas drogas — o
 * nitrato se evita na suspeita de VD; a morfina se considera para dor
 * refratária à terapia anti-isquêmica maximamente tolerada, com monitorização.
 * VD com PA e perfusão preservadas é CAUTELA, não bloqueio.
 *
 * ⚠️ E O DEFEITO ATINGIA AS DUAS ÁRVORES. `lib/vereditos-sca.ts` é consumida
 * pela V1 (95 nós, em produção no preview) e pela V2. Por isso a trava mede a
 * LIB, não uma árvore: é núcleo clínico compartilhado.
 *
 * ── A ARQUITETURA QUE ELA TAMBÉM PROTEGE ────────────────────────────────────
 *
 *     dados brutos → estado clínico derivado → vários vereditos
 *
 * e não `veredito A → veredito B`. Eu havia proposto a segunda; o autor barrou
 * porque a ordem de avaliação passaria a determinar comportamento clínico.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const linhas = [];
let ok = 0;

function confere(descricao, condicao, porque) {
  if (condicao) ok++;
  else falhas.push(`${descricao}\n      ⚠️ ${porque}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "anti-isq-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "lib", "vereditos-sca.ts"),
  path.join(appDir, "core", "decision-tree", "engine.ts"),
], { cwd: appDir, stdio: "pipe" });

const { vereditoMorfina, vereditoNitrato, vereditoAas } = require(path.join(tmp, "lib", "vereditos-sca.js"));
const { estadoDoAas } = require(path.join(tmp, "lib", "aas-estado.js"));
const { estadoTerapiaAntiIsquemica } = require(path.join(tmp, "lib", "terapia-anti-isquemica.js"));
const { DecisionTreeEngine } = require(path.join(tmp, "core", "decision-tree", "engine.js"));

/** Paciente estável, sem nada que bloqueie por si. */
const ESTAVEL = { pas: "128", pad: "78", cor_perfusao: "nao", cor_consciencia: "nao", pde5_recente: "nao" };
const nivel = (v) => vereditoMorfina(v).nivel;
const motivo = (v) => vereditoMorfina(v).motivo;

// ── A. VD ISOLADO NÃO BLOQUEIA A MORFINA ───────────────────────────────────
{
  // VD confirmado por V3R–V4R, hemodinâmica preservada, nitrato fora por isso,
  // dor persistindo. É o caso exato que o autor descreveu.
  const vdPreservado = { ...ESTAVEL, supra_inferior: "sim", vd_confirmado: "sim", dor_persiste: "sim" };

  confere(
    "VD confirmado com PA e perfusão preservadas NÃO bloqueia a morfina",
    nivel(vdPreservado) === "amarelo",
    `veio "${nivel(vdPreservado)}". Este é o bug: o texto-fonte diz "IAM de VD COM HIPOTENSÃO" e o veredito ` +
    `bloqueava por VD sozinho. A diretriz considera morfina para dor refratária com monitorização — negar ` +
    `analgesia a quem tem PA 128 e dor persistente é o erro espelho do que se queria evitar.`
  );

  confere(
    "e o card declara a cautela do VD em vez de silenciar",
    /VD acometido/i.test(motivo(vdPreservado)) && /monitorize a PA/i.test(motivo(vdPreservado)),
    `o motivo não menciona a monitorização. Sem bloqueio E sem cautela, a correção teria trocado um extremo ` +
    `pelo outro: o VD deixaria de importar.`
  );

  confere(
    "o nitrato continua 🔴 com VD confirmado",
    vereditoNitrato(vdPreservado).nivel === "vermelho",
    `o nitrato ficou "${vereditoNitrato(vdPreservado).nivel}". As duas drogas são tratadas de forma DIFERENTE, ` +
    `e é essa diferença que a correção preserva — não afrouxar as duas juntas.`
  );

  // ⚠️ E A EVIDÊNCIA DIRETA PRECISA SER LIDA. Até 2026-08-27 `vd_confirmado`
  // era gravado pela tela do VD e NENHUMA função o consumia.
  const semVd = { ...ESTAVEL, supra_inferior: "sim", dor_persiste: "sim" };
  confere(
    "`vd_confirmado` é efetivamente consumido pelo veredito do nitrato",
    vereditoNitrato({ ...semVd, vd_confirmado: "sim" }).nivel === "vermelho" &&
      vereditoNitrato({ ...semVd, vd_confirmado: "nao" }).nivel !== "vermelho",
    `o campo não muda o veredito. A tela da V2 pergunta V3R–V4R e o app ignoraria a resposta — foi exatamente ` +
    `o que acontecia, com o comentário do nó afirmando o contrário.`
  );
}

// ── B. O QUE DE FATO BLOQUEIA É O ESTADO HEMODINÂMICO ──────────────────────
{
  const BLOQUEIOS = [
    ["hipotensão (PAS 82)", { ...ESTAVEL, pas: "82", dor_persiste: "sim" }, /hipotens/i],
    ["hipoperfusão", { ...ESTAVEL, cor_perfusao: "sim", dor_persiste: "sim" }, /hipoperfus/i],
    ["rebaixamento de consciência", { ...ESTAVEL, cor_consciencia: "sim", dor_persiste: "sim" }, /consci/i],
  ];
  for (const [rotulo, caso, padrao] of BLOQUEIOS) {
    confere(
      `${rotulo} bloqueia a morfina`,
      nivel(caso) === "vermelho" && padrao.test(motivo(caso)),
      `veio "${nivel(caso)}" com motivo "${motivo(caso).slice(0, 70)}". Estes são os bloqueios objetivos, e eles ` +
      `têm precedência sobre qualquer estado da terapia anti-isquêmica.`
    );

    // ⚠️ E BLOQUEIAM COM OU SEM VD — é o estado hemodinâmico que decide.
    confere(
      `${rotulo} bloqueia TAMBÉM sem VD nenhum`,
      nivel({ ...caso, supra_inferior: undefined, vd_confirmado: undefined }) === "vermelho",
      `o bloqueio dependeu do VD. Ele deve vir do estado hemodinâmico sozinho — senão a correção do VD teria ` +
      `aberto um buraco: hipotensão sem VD deixaria de bloquear.`
    );
  }

  confere(
    "VD + hipotensão bloqueia",
    nivel({ ...ESTAVEL, pas: "82", supra_inferior: "sim", vd_confirmado: "sim", dor_persiste: "sim" }) === "vermelho",
    `o caso que o texto-fonte sempre descreveu — "IAM de VD com hipotensão" — precisa continuar bloqueando.`
  );
  linhas.push(`  B. 3 bloqueios objetivos, com e sem VD · VD+hipotensão bloqueia · VD isolado não`);
}

// ── C. AS QUATRO SITUAÇÕES DA TERAPIA ANTI-ISQUÊMICA ───────────────────────
{
  const CASOS = [
    [
      "nitrato não avaliado → morfina aguarda",
      { pas: "128", cor_perfusao: "nao", cor_consciencia: "nao" },
      "nao_avaliada",
      "vermelho",
      /ainda não foi resolvida/i,
    ],
    [
      "nitrato contraindicado + dor persiste → avaliar no contexto",
      { ...ESTAVEL, pde5_recente: "sim", pde5_qual: "tadalafila", pde5_horas: "10", dor_persiste: "sim" },
      "nitrato_contraindicado",
      "amarelo",
      /não é opção neste paciente/i,
    ],
    [
      "nitrato realizado + dor resolvida → sem indicação",
      { ...ESTAVEL, __realizada_nitrato: "1", dor_persiste: "nao" },
      "nitrato_realizado_dor_resolvida",
      "vermelho",
      /sem indicação/i,
    ],
    [
      "nitrato realizado + dor persiste → considerar",
      { ...ESTAVEL, __realizada_nitrato: "1", dor_persiste: "sim" },
      "nitrato_realizado_dor_persistente",
      "amarelo",
      /dor persistente apesar do anti-isquêmico/i,
    ],
  ];

  for (const [rotulo, caso, estadoEsperado, nivelEsperado, padrao] of CASOS) {
    const estado = estadoTerapiaAntiIsquemica(caso);
    confere(
      `estado: ${rotulo}`,
      estado === estadoEsperado,
      `o estado derivado veio "${estado}", esperado "${estadoEsperado}".`
    );
    confere(
      `veredito: ${rotulo}`,
      nivel(caso) === nivelEsperado && padrao.test(motivo(caso)),
      `veio "${nivel(caso)}" com "${motivo(caso).slice(0, 80)}".`
    );
  }

  // ⚠️ E A DOR NÃO PERGUNTADA NÃO VIRA "PERSISTE" (buraco que a mutação M5
  // revelou nesta própria trava: eu testava só "sim" e "nao", nunca a ausência).
  //
  // Presumir que a dor persiste ABRIRIA a morfina sobre um dado que ninguém
  // deu — é a mesma regra do PDE-5 e da reperfusão indeterminada, aplicada aqui.
  // O estado conservador é "dor resolvida": ele não nega analgesia a ninguém,
  // porque basta responder a pergunta para o amarelo aparecer.
  {
    const semResposta = { ...ESTAVEL, __realizada_nitrato: "1" };
    confere(
      "nitrato realizado com a dor NÃO perguntada não vira `dor_persistente`",
      estadoTerapiaAntiIsquemica(semResposta) === "nitrato_realizado_dor_resolvida",
      `veio "${estadoTerapiaAntiIsquemica(semResposta)}". Ausência de resposta viraria indicação de opioide.`
    );
    confere(
      "e a morfina NÃO fica amarela sobre uma dor que ninguém informou",
      nivel(semResposta) !== "amarelo",
      `veio "${nivel(semResposta)}". O amarelo é convite a administrar; ele não pode nascer de um campo vazio.`
    );
  }

  // ⚠️ O AMARELO NÃO IMPRIME DOSE. Vale para os dois amarelos acima.
  for (const [rotulo, caso] of CASOS.filter((c) => c[3] === "amarelo").map((c) => [c[0], c[1]])) {
    const vd = vereditoMorfina(caso);
    confere(
      `${rotulo}: o amarelo pergunta, não imprime posologia`,
      !vd.instrucao || vd.instrucao.length === 0,
      `o amarelo trouxe \`instrucao\`. O shell renderiza instrução em qualquer nível — a dose apareceria ANTES ` +
      `da decisão clínica.`
    );
    confere(
      `${rotulo}: o amarelo oferece decisão registrável`,
      Boolean(vd.decisao) && vd.decisao.saidas.length === 3,
      `o amarelo não oferece as três saídas. Amarelo sem decisão vira aviso que ninguém responde.`
    );
  }
  linhas.push(`  C. 4 estados derivados · 4 vereditos correspondentes · amarelo sem dose`);
}

// ── D. O ESTADO DERIVADO NÃO DECIDE SE A MORFINA PODE ──────────────────────
//
// ⚠️ A SEPARAÇÃO É O PONTO. Quando "a etapa anterior foi resolvida?" e "o
// fármaco pode?" moram na mesma função, um achado que deveria ser cautela vira
// bloqueio — foi exatamente assim que o VD virou contraindicação absoluta.
{
  const fonteEstado = lerFonte("lib/terapia-anti-isquemica.ts");
  confere(
    "`terapia-anti-isquemica` não conhece nível de veredito",
    !/vermelho|amarelo|verde|Veredito/.test(fonteEstado),
    `o módulo de estado menciona nível de veredito. Ele responde "a etapa foi resolvida, e como?" — nunca ` +
    `"o fármaco pode?".`
  );
  confere(
    "`terapia-anti-isquemica` não importa `vereditos-sca`",
    !/from "\.\/vereditos-sca"/.test(fonteEstado),
    `o estado derivado importa os vereditos — é o ciclo que a arquitetura existe para evitar.`
  );

  const fonteVereditos = lerFonte("lib/vereditos-sca.ts");
  confere(
    "nenhum veredito chama outro veredito",
    !/vereditoNitrato\(/.test(fonteVereditos.replace(/export function vereditoNitrato\(/g, "")) &&
      !/vereditoMorfina\(/.test(fonteVereditos.replace(/export function vereditoMorfina\(/g, "")),
    `um veredito chama outro. A ordem de avaliação passaria a determinar comportamento clínico — barrado ` +
    `pelo autor em 2026-08-27.`
  );

  confere(
    "as condições do nitrato vivem em um módulo próprio, consumido pelos dois",
    /from "\.\/nitrato-contraindicacao"/.test(fonteVereditos) &&
      /from "\.\/nitrato-contraindicacao"/.test(fonteEstado),
    `o veredito e o estado não compartilham a mesma fonte das condições. Duas cópias divergem em silêncio, e a ` +
    `que estiver errada é a que decide.`
  );
  linhas.push(`  D. estado não conhece veredito · veredito não chama veredito · condições em fonte única`);
}

// ── E. O MOTOR TORNA A EXECUÇÃO VISÍVEL AOS VEREDITOS ──────────────────────
//
// Sem o espelho em `values`, "o nitrato foi administrado" viveria só em
// `realizadas` e nenhum veredito o veria — foi essa cegueira que me levou a
// propor a dependência entre vereditos.
{
  const arvore = {
    id: "t", version: "1", label: "t", entryNodeId: "n",
    nodes: {
      n: {
        id: "n", type: "action", title: "t", actions: [],
        vereditos: [{ id: "nitrato", avaliar: () => ({ nivel: "verde", titulo: "Nitrato", motivo: "ok" }) }],
        next: "n",
      },
    },
  };
  const motor = new DecisionTreeEngine(arvore, { agora: () => 1000 });
  confere(
    "antes de registrar, a execução não aparece em `values`",
    motor.getValues().__realizada_nitrato === undefined,
    `a chave já existia sem ninguém ter registrado nada.`
  );
  motor.registrarExecucao("nitrato");
  confere(
    "depois de registrar, a execução aparece em `values`",
    Boolean(motor.getValues().__realizada_nitrato),
    `\`registrarExecucao\` não espelhou em \`values\`. Sem isso o estado derivado não enxerga o que foi feito, e ` +
    `a morfina fica presa em "aguarda" para sempre.`
  );
  confere(
    "e o estado derivado passa a enxergar",
    estadoTerapiaAntiIsquemica({ ...ESTAVEL, ...motor.getValues(), dor_persiste: "sim" }) ===
      "nitrato_realizado_dor_persistente",
    `o estado não avançou depois da execução registrada.`
  );
  linhas.push(`  E. execução espelhada em values · estado derivado enxerga o que foi feito`);
}

// ── G. OS QUATRO ESTADOS DO AAS, E SÓ UM COBRA ─────────────────────────────
//
// ⚠️ O AAS NÃO EXISTIA NA V2 até 2026-08-27 — `vereditoAas` estava pronto na lib
// e não era consumido por nó nenhum. O fármaco mais sensível ao tempo da SCA,
// que pode ser dado enquanto o ECG é obtido, estava fora do caminho crítico.
//
// Os quatro estados existem porque "realizada / não realizada" colapsa três
// situações distintas: decidiu não dar · não pode · ninguém olhou. Só a terceira
// precisa ser cobrada, e era justamente a indistinguível.
{
  const LIMPO = { aas_alergia: "nao", aas_sangramento: "nao", disseccao_suspeita: "nao" };
  const CASOS = [
    ["nao_avaliado", { ...LIMPO }, true],
    ["administrado", { ...LIMPO, __realizada_aas: "1" }, false],
    ["nao_administrado", { ...LIMPO, aas_registro: "nao_administrado" }, false],
    ["contraindicado", { ...LIMPO, aas_alergia: "sim" }, false],
  ];

  for (const [esperado, caso, deveCobrar] of CASOS) {
    confere(
      `estado do AAS: ${esperado}`,
      estadoDoAas(caso) === esperado,
      `veio "${estadoDoAas(caso)}".`
    );
    const vd = vereditoAas(caso);
    confere(
      `AAS ${esperado}: ${deveCobrar ? "COBRA" : "não cobra"}`,
      Boolean(vd.cobrar) === deveCobrar,
      `\`cobrar\` veio ${Boolean(vd.cobrar)}. Só "não avaliado" cobra — administrado e "decidido não ` +
      `administrar" são resoluções, e contraindicado sai no vermelho com o motivo.`
    );
  }

  // ⚠️ E A COBRANÇA NÃO TRAVA O FLUXO: o veredito continua VERDE quando não há
  // contraindicação. Ele cobra, não bloqueia — "ação bloqueada ≠ atendimento
  // bloqueado", e aqui nem ação bloqueada existe.
  confere(
    "o AAS não resolvido continua verde — cobra sem impedir",
    vereditoAas({ ...LIMPO }).nivel === "verde",
    `veio "${vereditoAas({ ...LIMPO }).nivel}". Travar a tela mais crítica do fluxo por falta de registro é ` +
    `exatamente o que o autor recusou.`
  );

  confere(
    "com alergia o AAS é vermelho e diz o motivo",
    vereditoAas({ ...LIMPO, aas_alergia: "sim" }).nivel === "vermelho",
    `a contraindicação objetiva precisa continuar bloqueando — cobrar não substitui gating.`
  );
  linhas.push(`  G. 4 estados do AAS · só "não avaliado" cobra · cobrança não trava`);
}

// ── F. Vacuidade ───────────────────────────────────────────────────────────
confere(
  "os quatro estados foram exercitados",
  new Set([
    estadoTerapiaAntiIsquemica({ pas: "128" }),
    estadoTerapiaAntiIsquemica({ ...ESTAVEL, pde5_recente: "sim", pde5_qual: "tadalafila", pde5_horas: "10" }),
    estadoTerapiaAntiIsquemica({ ...ESTAVEL, __realizada_nitrato: "1", dor_persiste: "nao" }),
    estadoTerapiaAntiIsquemica({ ...ESTAVEL, __realizada_nitrato: "1", dor_persiste: "sim" }),
  ]).size === 4,
  `menos de 4 estados distintos saíram das quatro entradas — a trava pode estar medindo um estado só.`
);
linhas.unshift(`  A. VD isolado → 🟡 com cautela · VD lido de V3R–V4R · nitrato segue 🔴`);

console.log("\nTerapia anti-isquêmica — estado derivado, e o VD que deixou de bloquear a morfina\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — o estado diz o que foi resolvido; o veredito diz se pode\n`);
process.exit(0);
