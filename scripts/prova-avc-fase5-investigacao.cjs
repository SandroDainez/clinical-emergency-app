#!/usr/bin/env node
/**
 * TRAVA DA INVESTIGAÇÃO — ⚠️ **pedir ⛔ não é fazer, ⛔ e fazer ⛔ não é saber**.
 *
 * PROMETE: ⛔ que os três degraus da investigação sigam separados, ⛔ e que
 *   ⛔ nenhum silêncio vire achado —
 *   · **solicitado ≠ realizado ≠ resultado**, ⛔ nos dois sentidos;
 *   · `sugerido` ⛔ e `em_andamento` são **derivados**, ⛔ e ⛔ não fatos;
 *   · TC ⛔ sem resultado ⛔ **não** é TC ⛔ sem hemorragia;
 *   · angio ⛔ sem resultado ⛔ **não** é ausência de oclusão;
 *   · INR ⛔ e plaquetas ⛔ não informados ⛔ **não** são normais;
 *   · os **quatro** analitos de **F-10** ficam no mesmo plano, ⛔ com
 *     consumidor declarado;
 *   · o **condicional** de F-10 sobrevive na tela — *"⛔ não atrasar… **⛔ se
 *     ⛔ não houver razão para suspeitar**"*.
 *
 * NÃO PROMETE: que a imagem esteja clinicamente indicada neste paciente —
 *   ⛔ isso é do médico. ⛔ Aqui se mede **o que o app afirma a partir do que
 *   ⛔ ele tem**, ⛔ e ⛔ nada mais.
 *
 * UNIVERSO: `avc/conteudo/{superficie-c,superficie-d,laboratorio,consumidores}.ts`
 *   × `avc/nucleo/{derivacoes-c,derivacoes-d,derivacoes-lab}.ts` × as telas
 *   da Investigação.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ESTA CLASSE DE ERRO É A MAIS PERIGOSA DA FASE ──────────
 *
 * ⛔ O autor nomeou, 2026-09-07: *"exame solicitado virar exame realizado;
 * exame realizado virar resultado conhecido; resultado ausente virar resultado
 * negativo; campo vazio virar normalidade."*
 *
 * ⚠️ ⛔ Os quatro têm a **mesma forma**: ⛔ um degrau a menos de evidência
 * ⛔ sendo lido como um degrau a mais. ⛔ E o preço é sempre o mesmo — ⛔ uma
 * trombólise decidida sobre um exame que ⛔ ninguém viu.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase5-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "conteudo", "consumidores.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-d.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-lab.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const DC = emT("avc", "nucleo", "derivacoes-c.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const C = emT("avc", "conteudo", "superficie-c.js");
const SD = emT("avc", "conteudo", "superficie-d.js");
const L = emT("avc", "conteudo", "laboratorio.js");
const CONS = emT("avc", "conteudo", "consumidores.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const rel = R.relogioControlado(1_000_000);
const vazio = E.abrirAtendimento(rel);
const s1 = I.nomeDaInstancia(C.ESTUDO, 1);
const c1 = I.nomeDaInstancia(L.COLETA, 1);
const regE = (e, inst, campo, valor) =>
  CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const escolheE = (e, inst, campo, rotulo) => regE(e, inst, campo, CAMPO.valorDaOpcao(rotulo));

/* ══ ⚠️⚠️ 1 · SOLICITADO ≠ REALIZADO ≠ RESULTADO ═════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ OS QUATRO MUNDOS, ⛔ E ⛔ ELES SÃO **DERIVADOS** ────────────────
   *
   * ⚠️ Decisão do autor (**item 3**): `sugerido` ⛔ e `em_andamento` ⛔ não
   * ganham campo. ⛔ Saem de `hora_solicitacao_imagem` ⛔ e das instâncias de
   * `estudo` — ⛔ e a conferência abaixo mede que ⛔ **nenhum fato novo nasceu**.
   */
  const naoDeclarado = ["situacao_do_pedido", "estudo_em_andamento", "exame_sugerido"]
    .filter((id) => CAMPOS.campoDoModulo(id) !== undefined);
  conf(
    "⚠️⚠️ `sugerido` ⛔ e `em_andamento` ⛔ NÃO viraram campo",
    naoDeclarado.length === 0,
    `⛔ ${naoDeclarado.join(" · ")} — estado visual ⛔ não é fato clínico novo (**item 3**)`
  );

  /** ⚠️ 1 · nada pedido, ⛔ nada registrado. */
  conf(
    "⚠️ CASO 1 · ⛔ nada registrado → **sugerido**",
    DC.situacaoDoPedidoDeTc(vazio) === "sugerido",
    `⛔ "${DC.situacaoDoPedidoDeTc(vazio)}"`
  );

  /** ⚠️⚠️ 2 · PEDIDO ⛔ SEM EXAME — ⛔ o salto que ⛔ não pode existir. */
  const pedido = E.registrarFato(
    vazio,
    { campo: "hora_solicitacao_imagem", valor: 1_000_100, horaClinica: 1_000_100 },
    rel
  );
  conf(
    "⚠️⚠️ CASO 2 · pedido ⛔ SEM exame → **em_andamento**, ⛔ e ⛔ NUNCA realizado",
    DC.situacaoDoPedidoDeTc(pedido) === "em_andamento"
    && DC.situacaoDaTcSemContraste(pedido) === "nenhuma_registrada",
    `⛔ ${DC.situacaoDoPedidoDeTc(pedido)} · ${DC.situacaoDaTcSemContraste(pedido)} — ⛔ pedir ⛔ não é fazer`
  );
  conf(
    "⚠️⚠️ ⛔ e o pedido ⛔ NÃO produz exclusão de hemorragia",
    DC.exclusaoDeHemorragia(pedido).exclusao === "sem_informacao",
    `⛔ "${DC.exclusaoDeHemorragia(pedido).exclusao}" — ⛔ um pedido ⛔ não exclui ⛔ nada (**E-23**)`
  );

  /** ⚠️⚠️ 3 · EXAME ⛔ SEM RESULTADO — ⛔ o segundo salto. */
  const feito = escolheE(pedido, s1, "estudo_modalidade", C.MODALIDADE.tcSemContraste);
  conf(
    "⚠️⚠️ CASO 3 · exame ⛔ SEM resultado → **realizado_sem_resultado**",
    DC.situacaoDoPedidoDeTc(feito) === "realizado_sem_resultado"
    && DC.situacaoDaTcSemContraste(feito) === "realizada_resultado_pendente",
    `⛔ ${DC.situacaoDoPedidoDeTc(feito)} · ${DC.situacaoDaTcSemContraste(feito)}`
  );
  conf(
    "⚠️⚠️ ⛔ e o exame feito ⛔ NÃO produz exclusão de hemorragia",
    DC.exclusaoDeHemorragia(feito).exclusao === "sem_informacao",
    `⛔ "${DC.exclusaoDeHemorragia(feito).exclusao}" — ⛔ fazer ⛔ não é saber (**PD-22**)`
  );

  /** ⚠️ 4 · resultado registrado — ⛔ e ⛔ só agora a exclusão existe. */
  const laudo = escolheE(feito, s1, "estudo_resultado", C.RESULTADO_TC.semHemorragia);
  conf(
    "⚠️ CASO 4 · resultado registrado → **resultado_disponivel**, ⛔ e a exclusão aparece",
    DC.situacaoDoPedidoDeTc(laudo) === "resultado_disponivel"
    && DC.exclusaoDeHemorragia(laudo).exclusao === "excluida",
    `⛔ ${DC.situacaoDoPedidoDeTc(laudo)} · ${DC.exclusaoDeHemorragia(laudo).exclusao}`
  );

  /**
   * ⚠️⚠️ ⛔ E O CAMINHO INVERSO EXISTE: exame **⛔ sem pedido registrado**.
   *
   * ⛔ O paciente pode chegar com a TC pronta de outro serviço. ⛔ Exigir o
   * pedido para reconhecer o exame inventaria uma ordem que o mundo ⛔ não tem.
   */
  const semPedido = escolheE(
    escolheE(vazio, s1, "estudo_modalidade", C.MODALIDADE.tcSemContraste),
    s1, "estudo_resultado", C.RESULTADO_TC.semHemorragia
  );
  conf(
    "⚠️⚠️ exame externo ⛔ SEM pedido registrado ⛔ ainda é resultado disponível",
    DC.situacaoDoPedidoDeTc(semPedido) === "resultado_disponivel"
    && DC.imagemSolicitadaEm(semPedido) === undefined,
    "⛔ exigir o pedido para ver o exame inventaria uma ordem que o mundo ⛔ não tem"
  );
}

/* ══ ⚠️⚠️ 2 · DESCONHECIDO ⛔ NÃO É NEGATIVO ═════════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ AS QUATRO NEGATIVAS QUE ⛔ NÃO PODEM NASCER DO SILÊNCIO ────────
   *
   * ⛔ *"TC ⛔ sem resultado ≠ TC ⛔ sem hemorragia; angio ⛔ sem resultado ≠
   * ausência de oclusão; INR ⛔ não informado ≠ INR normal; plaquetas ⛔ não
   * informadas ≠ plaquetas adequadas"* (autor, **item 11**).
   */
  conf(
    "⚠️⚠️ TC ⛔ sem resultado ⛔ NÃO é TC ⛔ sem hemorragia",
    DC.exclusaoDeHemorragia(vazio).exclusao === "sem_informacao"
    && DC.exclusaoDeHemorragia(vazio).conclusao === "desconhecido",
    `⛔ ${DC.exclusaoDeHemorragia(vazio).exclusao} — ⛔ silêncio ⛔ não exclui hemorragia`
  );

  /**
   * ── ⚠️⚠️ ⛔ A PERGUNTA CERTA, ⛔ E ⛔ EU TINHA ESCRITO A ERRADA ─────────────
   *
   * ⛔ A primeira versão media `imagemVascular().vascular === "sem_informacao"`
   * ⛔ com uma angio registrada — ⛔ e reprovou. ⚠️ ⛔ O código estava certo:
   * `imagemVascular` responde *"houve estudo vascular?"*, ⛔ e ⛔ **não**
   * *"há oclusão?"*. ⛔ Com angio registrada, `"registrada"` é a verdade.
   *
   * ⚠️⚠️ ⛔ A garantia que o autor pediu mora no **dossiê**: com o estudo feito
   * ⛔ e o sítio ⛔ não informado, `sitio_oclusao` tem de cair em
   * **⛔ não perguntado** — ⛔ e ⛔ nunca em *"registrado"*, ⛔ que seria o app
   * dizendo ter um dado que ⛔ ninguém deu.
   */
  const angio = escolheE(vazio, s1, "estudo_modalidade", C.MODALIDADE.angioTc);
  const dossie = DC.informacaoParaAFrenteEndovascular(angio);
  conf(
    "⚠️⚠️ angio ⛔ sem resultado ⛔ NÃO é ausência de oclusão",
    dossie.naoPerguntados.includes("sitio_oclusao")
    && !dossie.registrados.includes("sitio_oclusao")
    && dossie.conclusao === "desconhecido",
    `⛔ naoPerguntados=${JSON.stringify(dossie.naoPerguntados)} registrados=${JSON.stringify(dossie.registrados)} — ⛔ oclusão ⛔ não informada ⛔ não é *"sem oclusão"*`
  );
  conf(
    "⚠️ ⛔ e o estudo vascular EXISTE — ⛔ a conferência ⛔ não passa por vacuidade",
    DC.imagemVascular(angio).vascular === "registrada",
    `⛔ "${DC.imagemVascular(angio).vascular}" — ⛔ sem estudo, a asserção acima seria trivial`
  );

  for (const analito of ["inr", "plaquetas"]) {
    const leitura = DD.corteDoAnalito(vazio, analito);
    conf(
      `⚠️⚠️ \`${analito}\` ⛔ não informado ⛔ NÃO é \`${analito}\` normal`,
      leitura.estado === "nao_perguntado" && leitura.valor === undefined,
      `⛔ "${leitura.estado}" valor=${JSON.stringify(leitura.valor)} — ⛔ campo vazio ⛔ não é normalidade (**§0.2**)`
    );
  }

  /**
   * ⚠️⚠️ ⛔ E A COLETA REGISTRADA ⛔ SEM ANALITO ⛔ TAMBÉM ⛔ NÃO É NORMAL.
   *
   * ⛔ *"Coleta realizada, resultados pendentes"* é fato verdadeiro — ⛔ e ⛔ é
   * ⛔ exatamente o degrau em que a tentação de concluir aparece.
   */
  const coletado = escolheE(vazio, c1, "coleta_procedencia", "Este serviço");
  conf(
    "⚠️⚠️ coleta feita ⛔ SEM resultado ⛔ não classifica ⛔ nenhum analito",
    ["inr", "plaquetas", "aptt", "tp"]
      .every((a) => DD.corteDoAnalito(coletado, a).estado === "nao_perguntado"),
    "⛔ coletar ⛔ não é ter resultado — ⛔ o terceiro degrau da mesma escada"
  );
}

/* ══ ⚠️⚠️ 3 · OS QUATRO ANALITOS DE F-10, NO MESMO PLANO ════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ A CORREÇÃO DE 2026-09-07, ⛔ E ⛔ POR QUE ELA VIRA TRAVA ───────
   *
   * ⛔ Eu mapeei *"aPTT ⛔ e TP ⛔ não têm consumidor"* ⛔ e ⛔ estava errado: a
   * leitura é por **chave de objeto**, ⛔ e a varredura por literal ⛔ não a via.
   * ⚠️ O autor tinha decidido, **sobre o meu mapa errado**, declará-los `[]`
   * ⛔ e demovê-los na tela — ⛔ e revogou a decisão quando a evidência chegou.
   *
   * ⚠️⚠️ ⛔ A FONTE OS NOMEIA NA MESMA FRASE (**F-10**):
   *
   * > *"patients with platelets <100,000/mm³, INR>1.7, **aPTT>40s, or PT>15s**
   * >  … is unknown though may substantially increase risk of harm ⛔ and
   * >  should not be administered"*
   *
   * ⛔ Quatro cortes, ⛔ uma frase. ⛔ Separá-los na tela contaria meia regra.
   */
  const chaves = Object.keys(SD.CORTES_LABORATORIAIS);
  conf(
    "⚠️ os QUATRO cortes de F-10 existem, ⛔ e ⛔ nenhum se perdeu",
    chaves.length === 4 && ["plaquetas", "inr", "aptt", "tp"].every((k) => chaves.includes(k)),
    `⛔ ${chaves.join(" · ")}`
  );
  conf(
    "⚠️⚠️ ⛔ e os QUATRO declaram consumidor — ⛔ nenhum com lista vazia",
    chaves.every((k) => (CONS.CONSUMIDORES[k] ?? []).includes("derivacoes-d.ts")),
    `⛔ ${chaves.filter((k) => !(CONS.CONSUMIDORES[k] ?? []).includes("derivacoes-d.ts")).join(" · ")} — ⛔ ter fonte ⛔ não é ter autorização, ⛔ e ⛔ não ter consumidor declarado ⛔ é o oposto do que o motor faz`
  );

  /**
   * ⚠️⚠️ ⛔ MESMO PLANO VISUAL — ⛔ e ⛔ isso é medido no CONTEÚDO, ⛔ e ⛔ não no
   * JSX: ⛔ os quatro moram no **mesmo grupo**, ⛔ e ⛔ nenhum deles está num
   * grupo recolhido.
   */
  const grupoDe = (id) => L.GRUPOS_L.find((g) => g.campos.some((c) => c.id === id));
  const grupos = chaves.map((k) => grupoDe(k)).filter(Boolean);
  conf(
    "⚠️⚠️ os quatro analitos ficam no MESMO grupo, ⛔ e ⛔ ele ⛔ NÃO é recolhido",
    grupos.length === 4
    && new Set(grupos.map((g) => g.id)).size === 1
    && grupos[0].recolhido !== true,
    `⛔ ${grupos.map((g) => g && g.id).join(" · ")} — ⛔ pôr dois num *"outros resultados"* esconderia metade de uma frase de segurança`
  );
}

/* ══ ⚠️⚠️ 4 · O CONDICIONAL DE F-10 SOBREVIVE ═══════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O HEDGE **É** A REGRA ────────────────────────────────────────
   *
   * ⛔ *"⛔ não atrasar a trombólise esperando exames"* ⛔ **sozinho** é falso: a
   * fonte condiciona — *"**if there is no reason to suspect an abnormal
   * result**"*. ⚠️ ⛔ Sem a condição, o app mandaria ignorar coagulograma em
   * paciente anticoagulado.
   *
   * ⛔ ⛔ E o gatilho é **julgamento registrado**
   * (`motivo_para_suspeitar_alteracao_coagulacao`), ⛔ e ⛔ não a existência do
   * exame.
   */
  const campo = CAMPOS.campoDoModulo("motivo_para_suspeitar_alteracao_coagulacao");
  conf(
    "⚠️ o gatilho do condicional existe, ⛔ e é PERGUNTA ao médico",
    campo !== undefined && campo.tipo === "escolha" && campo.fonte === "F-10",
    `⛔ ${JSON.stringify(campo && { tipo: campo.tipo, fonte: campo.fonte })}`
  );

  /**
   * ── ⚠️⚠️ ⛔ ELA MEDIA UM SACO DE TEXTOS, ⛔ E PASSOU VERDE ────────────────
   *
   * ⛔ A primeira versão juntava `ajuda + nota + rotulo` ⛔ e procurava a
   * condição em ⛔ qualquer um deles. ⚠️ A mutação **M13** encurtou a frase
   * para *"⛔ Não atrasa a reperfusão."* ⛔ e ⛔ ela **sobreviveu**: a `nota`
   * ⛔ vizinha ⛔ ainda tinha um *"razão para suspeitar"*.
   *
   * ⚠️⚠️ ⛔ AGORA A COBRANÇA É SOBRE **A FRASE QUE VAI À TELA**, ⛔ e ⛔ ela tem
   * de trazer as **duas** metades: ⛔ a negação ⛔ e a condição. ⛔ Uma sem a
   * outra é a fonte pela metade (**E-45**).
   */
  const hedge = SD.HEDGE_DO_COAGULOGRAMA;
  conf(
    "⚠️⚠️ ⛔ a frase que vai à tela traz a NEGAÇÃO ⛔ e a CONDIÇÃO",
    typeof hedge === "string"
    && /não atrasar/i.test(hedge)
    && /quando não h[áa]|se não h[áa]|razão para suspeitar/i.test(hedge),
    `⛔ "${String(hedge).slice(0, 140)}" — ⛔ *"⛔ não atrasa"* ⛔ sem o *"quando"* vira permissão para ignorar coagulograma em paciente anticoagulado`
  );
  conf(
    "⚠️ ⛔ e é ELA que o campo entrega ao médico",
    campo.ajuda === hedge,
    `⛔ ajuda="${String(campo.ajuda).slice(0, 80)}" — ⛔ duas frases diferentes ⛔ e a trava mediria a que ⛔ não aparece`
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ NENHUMA TELA PODE ENCURTAR PARA O ABSOLUTO. ⛔ A varredura
   * procura a frase seca nas telas da Investigação — ⛔ é o encurtamento que
   * apagaria a condição.
   */
  const telas = ["superficie-c.tsx", "superficie-laboratorio.tsx", "avc-modulo-screen.tsx"];
  const absolutas = telas.filter((f) => {
    const caminho = path.join(appDir, "components", "avc", f);
    if (!fs.existsSync(caminho)) return false;
    const fonte = lerFonte(caminho);
    return /"Não atrasa a reperfusão"|"Não atrasa reperfusão"|"Não atrasa a trombólise"/.test(fonte);
  });
  conf(
    "⚠️⚠️ ⛔ NENHUMA tela escreve a etiqueta ABSOLUTA",
    absolutas.length === 0,
    `⛔ ${absolutas.join(" · ")} — ⛔ a etiqueta seca transforma condicional em permissão`
  );
}

/* ══ ⚠️⚠️ 4b · UMA FASE, ⛔ E O HEDGE NA TELA ═══════════════════════════ */
{
  const telaLab = lerFonte(path.join(appDir, "components", "avc", "superficie-laboratorio.tsx"));
  const telaModulo = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));

  conf(
    "⚠️⚠️ a tela do laboratório DESENHA o condicional, ⛔ e ⛔ não o esconde num ⓘ",
    /HEDGE_DO_COAGULOGRAMA/.test(telaLab) && /avc-laboratorio-hedge/.test(telaLab),
    "⛔ mostrar os quatro analitos ⛔ sem o *quando* soa como *\"consiga os quatro antes de tratar\"*"
  );

  /**
   * ⚠️⚠️ ⛔ UMA CÓPIA SÓ — ⛔ e ⛔ a trava conta. ⛔ A frase escrita duas vezes
   * faria a próxima correção acertar ⛔ uma delas, ⛔ e a outra seguiria na tela.
   */
  /**
   * ⚠️⚠️ ⛔ COMPARAÇÃO **⛔ SEM CAIXA** — 2026-09-09.
   *
   * ⛔ ⛔ A frase começava a sentença ⛔ com minúscula (*"A fonte diz para
   * ⛔ **não** atrasar…"*) ⛔ e passou a **⛔ abrir** a sentença (*"⛔ **Não**
   * atrasar…"*), ⛔ quando o autor pediu linguagem objetiva ⛔ na camada da
   * decisão. ⚠️ ⛔ A busca literal ⛔ passou a contar **⛔ zero** cópias ⛔ e a
   * trava caiu — ⛔ **⛔ sem ⛔ nenhuma cópia ter surgido ⛔ ou sumido**.
   *
   * ⚠️ ⛔ O que ⛔ ela garante ⛔ é *"⛔ existe **⛔ uma** cópia"*, ⛔ e ⛔ isso
   * ⛔ não depende ⛔ de maiúscula. ⛔ Uma trava que quebra ⛔ por caixa
   * ⛔ ensina ⛔ a ignorá-la.
   */
  const FRASE = "não atrasar a trombólise esperando exames de coagulação";
  const contem = (txt) => txt.toLowerCase().includes(FRASE.toLowerCase());
  const dirs = [
    ...fs.readdirSync(path.join(appDir, "avc", "conteudo")).map((f) => ["avc", "conteudo", f]),
    ...fs.readdirSync(path.join(appDir, "components", "avc"))
      .filter((f) => f.endsWith(".tsx")).map((f) => ["components", "avc", f]),
  ];
  const copias = dirs.filter((rel) => {
    const abs = path.join(appDir, ...rel);
    return fs.statSync(abs).isFile() && contem(lerFonte(abs));
  });
  conf(
    "⚠️⚠️ ⛔ o condicional existe em UM lugar só",
    copias.length === 1,
    `⛔ ${copias.map((r) => r.join("/")).join(" · ")} — ⛔ duas cópias ⛔ e a próxima correção acerta ⛔ uma`
  );

  conf(
    "⚠️⚠️ a fase costura as DUAS casas, ⛔ com cabeçalho para cada uma",
    /avc-investigacao-imagem/.test(telaModulo) && /avc-investigacao-laboratorio/.test(telaModulo),
    "⛔ duas telas empilhadas ⛔ sem costura ⛔ não são **uma** fase (**item 5**)"
  );

  /**
   * ⚠️⚠️ ⛔ E A AÇÃO DA IMAGEM SAI DO NÚCLEO, ⛔ e ⛔ não de um ternário na tela.
   *
   * ⛔ A cadeia `resultado_pendente ? … : jaSolicitada ? … : …` estava escrita
   * **duas vezes** ⛔ neste arquivo. ⚠️ Duas cópias de uma regra ⛔ é como nasce
   * a terceira tela oferecendo *"solicitar"* para um exame já registrado.
   */
  conf(
    "⚠️⚠️ a tela lê `situacaoDoPedidoDeTc`, ⛔ e ⛔ NÃO recalcula a situação",
    /situacaoDoPedidoDeTc/.test(telaModulo)
    && !/situacaoDaTcSemContraste\(estado\) === "realizada_resultado_pendente"/.test(telaModulo),
    "⛔ leitura de fato é do núcleo (**I6**) — ⛔ na tela ⛔ ela envelhece junto com o layout"
  );
}

/* ══ ⚠️⚠️ 4c · ⛔ NENHUMA TELA CEGA O PRÓPRIO VALOR ══════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O DEFEITO QUE A REVISÃO VISUAL ACHOU — 2026-09-07 ─────────────
   *
   * ⛔ `superficie-c.tsx` passava `numero={undefined}` **fixo** para o campo do
   * pedido. ⚠️ `CampoDeHora` desenha o valor a partir de `gravado`, ⛔ que vem
   * ⛔ daí — ⛔ então o campo dizia *"Informar horário"* **⛔ mesmo depois de o
   * médico informar**.
   *
   * ⚠️⚠️ ⛔ O FATO ENTRAVA NA TRILHA ⛔ E A TELA ⛔ NÃO MUDAVA: o card de
   * prioridade ⛔ já dizia *"Registrar o exame"* ⛔ enquanto o campo ⛔ ainda
   * pedia o horário. ⛔ Duas telas discordando sobre o mesmo fato, ⛔ e o médico
   * registrando **de novo** por achar que ⛔ não funcionou.
   *
   * ⛔ ⛔ Literal `undefined` no lugar do valor ⛔ não é *"⛔ não se aplica"* —
   * ⛔ é **campo cego**, ⛔ e ⛔ nenhuma tela do AVC pode ter um.
   */
  const dirTelas = path.join(appDir, "components", "avc");
  const telas = fs.readdirSync(dirTelas).filter((f) => f.endsWith(".tsx"));
  conf(
    "⚠️ há telas a vigiar",
    telas.length >= 8,
    `⛔ ${telas.length} — varredura sobre lista vazia fica verde ⛔ sem medir`
  );
  const cegas = telas.filter((f) => /numero=\{undefined\}/.test(lerFonte(path.join(dirTelas, f))));
  conf(
    "⚠️⚠️ ⛔ NENHUMA tela passa `numero={undefined}` fixo",
    cegas.length === 0,
    `⛔ ${cegas.join(" · ")} — ⛔ o campo ⛔ nunca mostraria o que o médico registrou`
  );
}

/* ══ ⚠️⚠️ 5 · AS CASAS, ⛔ E A NAVEGAÇÃO QUE ⛔ NÃO VIRA MURO ═════════════ */
{
  /**
   * ⚠️⚠️ ⛔ AQUI A CASA **⛔ NÃO** MUDA, ⛔ e ⛔ é o inverso da cronologia.
   *
   * ⛔ Na Fase 4 o `dono:` apontava para uma tela ⛔ sem o campo, ⛔ e ⛔ por
   * ⛔ isso a casa foi junto. ⚠️ Aqui `pendenciasDoLaboratorio()` **já** emite
   * `dono: "imagem"` — ⛔ a navegação já chega onde o campo é desenhado, ⛔ e
   * mover a casa ⛔ não resolveria problema ⛔ nenhum (**item 1**).
   */
  const campos = CAMPOS.todosOsCampos();
  const doLab = campos.filter((c) => ["inr", "plaquetas", "aptt", "tp"].includes(c.id));
  conf(
    "⚠️⚠️ os analitos continuam na casa `laboratorio`",
    doLab.length === 4 && doLab.every((c) => c.casa === "laboratorio"),
    `⛔ ${doLab.map((c) => `${c.id}@${c.casa}`).join(" · ")} — composição visual atravessa casa, ⛔ e ⛔ não a move`
  );

  const DL = emT("avc", "nucleo", "derivacoes-lab.js");
  const pend = DL.pendenciasDoLaboratorio(vazio);
  conf(
    "⚠️⚠️ ⛔ e a pendência do laboratório aponta para a fase que o DESENHA",
    pend.every((p) => p.dono === "imagem"),
    `⛔ ${pend.map((p) => `${p.id}→${p.dono}`).join(" · ")} — pendência ⛔ sem mecanismo de resolução é muro (**E-26**)`
  );
}

if (falhas > 0) {
  console.log(`\n❌ INVESTIGAÇÃO — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ INVESTIGAÇÃO — ${ok}/${ok} conferências · 3 degraus, 4 negativas, 4 analitos`);
