#!/usr/bin/env node
/**
 * GERADOR do arquivo de perguntas ao autor — os NÚMEROS vêm do dado.
 *
 * ⚠️ POR QUE ELE EXISTE: a primeira versão do arquivo foi escrita à mão e
 * envelheceu em três rodadas. Ela ainda dizia `hipocalcemia < 7 mg/dL` depois de
 * o corte ter mudado para `< 1,9 mmol/L`, e `hipofosfatemia < 1` depois de virar
 * `< 0,32 mmol/L`. É o R-114 — o número dentro do texto — desta vez num
 * documento de auditoria, que é onde ninguém pensa em olhar.
 *
 * Mesmo princípio do texto derivado da tela: o número vive uma vez, no dado, e o
 * documento se atualiza sozinho.
 *
 * ⚠️ O QUE AINDA É DIGITADO AQUI, dito para não virar mentira: a UNIDADE DE
 * EXIBIÇÃO de cada distúrbio (a mesma de `getDefaultUnit` na tela) e a prosa das
 * perguntas. Nenhum limiar, nenhuma dose.
 *
 * Uso: npm run gera:perguntas
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const SAIDA = path.join(RAIZ, "auditoria", "PERGUNTAS-AO-AUTOR-2026-08-23.md");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "perg-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(RAIZ, "lib", "eletrolitos", "gravidade.ts"),
  path.join(RAIZ, "lib", "eletrolitos", "referencias.ts"),
  path.join(RAIZ, "lib", "anion-gap.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
const G = require(path.join(tmp, "eletrolitos", "gravidade.js"));
const R = require(path.join(tmp, "eletrolitos", "referencias.js"));
const AG = require(path.join(tmp, "anion-gap.js"));

/** Unidade em que a TELA exibe cada distúrbio — igual a `getDefaultUnit`. */
const UNIDADE_DE_EXIBICAO = {
  hyponatremia: "mEq/L", hypernatremia: "mEq/L", hypokalemia: "mEq/L", hyperkalemia: "mEq/L",
  hypochloremia: "mEq/L", hyperchloremia: "mEq/L",
  hypocalcemia: "mg/dL", hypercalcemia: "mg/dL", hypomagnesemia: "mg/dL",
  hypermagnesemia: "mg/dL", hypophosphatemia: "mg/dL", hyperphosphatemia: "mg/dL",
};
const ROTULO = {
  hyponatremia: "hiponatremia", hypernatremia: "hipernatremia",
  hypokalemia: "hipocalemia", hyperkalemia: "hipercalemia",
  hypocalcemia: "hipocalcemia", hypercalcemia: "hipercalcemia",
  hypomagnesemia: "hipomagnesemia", hypermagnesemia: "hipermagnesemia",
  hypophosphatemia: "hipofosfatemia", hyperphosphatemia: "hiperfosfatemia",
  hypochloremia: "hipocloremia", hyperchloremia: "hipercloremia",
};
const n = (v) => String(v).replace(".", ",");

/** Descreve TODO corte numérico de um distúrbio — com ou sem unidade de fonte. */
function cortesDe(disturbio) {
  const uni = UNIDADE_DE_EXIBICAO[disturbio];
  const out = [];
  const desc = (c) => {
    switch (c.tipo) {
      case "abaixoDe": return `< ${n(c.valor)} ${c.unidade ?? uni}`;
      case "aPartirDe": return `≥ ${n(c.valor)} ${c.unidade ?? uni}`;
      case "acimaDe": return `> ${n(c.valor)} ${c.unidade ?? uni}`;
      case "faixa": return `${n(c.de)} a ${n(c.ate)} ${c.unidade ?? uni}`;
      default: return null;
    }
  };
  const colher = (c) => {
    if (c.tipo === "combinado") { colher(c.faixa); return; }
    const d = desc(c);
    if (d && !out.includes(d)) out.push(d);
  };
  for (const g of G.GRAVIDADE_POR_DISTURBIO[disturbio]) g.cortes.forEach(colher);
  return out;
}
/** O mesmo corte, com a conversão quando ele mora na unidade da fonte. */
function cortesComConversao(disturbio) {
  const out = [];
  for (const g of G.GRAVIDADE_POR_DISTURBIO[disturbio]) {
    const t = G.corteDoDegrau(disturbio, g);
    if (t && !out.includes(t)) out.push(t);
  }
  return out.length ? out : cortesDe(disturbio);
}

const SEM_FONTE = ["hyponatremia", "hypernatremia", "hypokalemia", "hyperkalemia",
  "hypomagnesemia", "hypermagnesemia", "hypochloremia", "hyperchloremia"];

const linhasSemFonte = SEM_FONTE.map((d) => {
  const c = cortesDe(d);
  return `| ${ROTULO[d]} | ${c.length ? c.join(" · ") : "— *(degrau único, sem corte numérico)*"} |`;
}).join("\n");

const condutaPendente = Object.entries(R.REFERENCIAS_DOS_ELETROLITOS)
  .filter(([, v]) => v.procedencia.forca === "pendente")
  .map(([, v]) => `\`${R.texto(v)}\``).join(" · ");

const md = `# Perguntas ao autor — 2026-08-23

**Cinco perguntas abertas** e cinco já respondidas, listadas no fim para o
registro.

⚠️ **Os limiares deste arquivo vêm do dado, não estão digitados aqui.** Ele é
gerado por \`npm run gera:perguntas\` a partir de \`lib/eletrolitos/gravidade.ts\`,
\`lib/eletrolitos/referencias.ts\` e \`lib/anion-gap.ts\`. A primeira versão foi
escrita à mão e envelheceu em três rodadas — ainda dizia \`hipocalcemia < 7 mg/dL\`
depois de o corte ter mudado. É o R-114 num documento de auditoria, que é onde
ninguém pensa em olhar.

---

# ABERTAS

## 1 · Os quatro eletrólitos que continuam sem fonte

**Destrava:** tirar oito distúrbios da pendência permanente — hoje eles não têm
como sair dela.

⚠️ **Não pergunto mais "qual a referência-base"**, e a razão é a **R-110**, que
saiu da sua própria recusa: *quando existe cutoff formal, cita-se a
sociedade/diretriz; quando não existe, classifica-se como prática aceita ou
referência de revisão — e não se inventa graduação.* Uma referência única para
doze distúrbios de origens diferentes seria exatamente o que o senhor recusou.

**Cálcio e fósforo saíram desta lista** (Society for Endocrinology e o consenso
que o senhor nomeou). Restam **sódio, potássio, magnésio e cloro**:

| distúrbio | corte hoje |
|---|---|
${linhasSemFonte}

> **Para cada um: existe cutoff formal de sociedade?**
> Se **sim**, qual documento. Se **não**, a resposta legítima é *"prática aceita"*
> ou *"referência de revisão"* — e o número fica com essa força, declarada.

⚠️ **Magnésio segue intocado**, como o senhor pediu: os dois cortes continuam
exatamente como estavam, aguardando conferência **número a número**.

⚠️ **Hipo e hipercloremia não têm corte numérico** — viraram degrau único quando
o senhor confirmou que não têm escala de apresentação. A pergunta neles é só se a
afirmação está certa, e ela já está na lista das respondidas.

**E as referências de conduta da camada 2, todas sem fonte:**
${condutaPendente}

---

## 2 · O verbatim da SSC 2021 — e a força que ele carrega

**Destrava:** fechar a D-82; hoje três números do critério do corticoide e da
vasopressina estão no app sem verbatim no repositório.

A frase corrigida diz *"Considerar hidrocortisona 200 mg/dia se a dose se
mantiver ≥ 0,25 por pelo menos 4 h"* e *"não esperar chegar a 0,5"*.

> **O verbatim da SSC 2021, e o grau daquele trecho.**
> ⚠️ Se o critério estiver no **texto de prática** e não na recomendação
> graduada, a força é \`pratica_aceita\`, não \`recomendacao_formal\`. O próprio
> texto do app já suspeita disso.

---

## 3 · Coronárias — qual das duas leituras vale (D-81)

**Destrava:** o espanhol e o português afirmam coisas **diferentes** sobre o
estado das diretrizes; hoje o app diz as duas.

- **PT:** *"A ACC/AHA 2025 MANTÉM STEMI/NSTEMI e incorpora só parte desse
  reconhecimento; as diretrizes australianas de 2025 adotaram a nomenclatura
  OMI. O app usa a nomenclatura corrente de propósito."*
- **ES:** *"No es nomenclatura oficial de las guías actuales, y esta app no la
  adopta como criterio."*

> **Qual das duas fica?** A outra é reescrita para dizer o mesmo.

---

## 4 · Para onde reaponto o auditor de trombolítico (D-83)

**Destrava:** a dose de trombolítico por peso está **sem auditoria** desde o
refactor \`a9b16ad\` — teto, monotonicidade e peso ausente deixaram de ser
conferidos.

\`scripts/auditoria-doses-criticas.cjs\` compilava \`avc/calculators.ts\` e
\`coronary/calculators.ts\`, apagados naquele commit. As funções não existem mais
com o mesmo nome, e escolher qual código de hoje ocupa o lugar delas é decidir
**o que auditar** — escopo, não conserto.

> **Para onde eu reaponto?**

---

## 5 · Ânion gap — dois cortes e um fator, herdados sem fonte (D-95)

**Destrava:** a interpretação do AG saiu do verde, mas os três números que a
sustentam continuam sem procedência.

Nenhum foi escolhido por mim — os três já estavam no app:

| número | onde estava | o que é |
|---|---|---|
| **> ${n(AG.CORTE_AG.elevadoAcimaDe)}** | \`agRef > ${n(AG.CORTE_AG.elevadoAcimaDe)}\` no código | corte de AG elevado |
| **< ${n(AG.CORTE_AG.baixoAbaixoDe)}** | na linha de referência da própria calculadora | corte de AG baixo |
| **${n(AG.FATOR_ALBUMINA.valor)}** | \`ag + ${n(AG.FATOR_ALBUMINA.valor)} * (${n(AG.FATOR_ALBUMINA.porGDlAbaixoDe)} - alb)\` | correção pela albumina, por 1 g/dL abaixo de ${n(AG.FATOR_ALBUMINA.porGDlAbaixoDe)} |

> **1.** Quais cortes de AG **alto** e **baixo** o senhor adota, e com que fonte?
> **2.** O fator **${n(AG.FATOR_ALBUMINA.valor)}** — a referência clássica é
> **Figge et al.** Confirma? O verbatim precisa ser transcrito antes de a força
> subir de \`pendente\`.

---

# RESPONDIDAS

Ficam aqui para o registro: o que o senhor decidiu, quando, e onde está aplicado.

## ✅ Os três distúrbios sem escala de apresentação — 2026-08-23

**Pergunta:** hiperfosfatemia, hipocloremia e hipercloremia repetiam o mesmo
texto nos dois degraus. Era preguiça de redação ou é a clínica?

**Resposta do autor:** é a clínica. Cloro é **marcador**, não doença — o paciente
não tem "sintoma de cloro"; hiperfosfatemia aguda manifesta-se **pelo que causa**
(hipocalcemia sintomática), não por si. **A tela é que estava errada**, sugerindo
uma escala de sintomas que não existe.

**Aplicado:** um degrau só, com o texto dele — *"A gravidade aqui não muda a
apresentação. O que muda a conduta é a causa e a velocidade de instalação"* (e,
na hiperfosfatemia, *"…e o cálcio associado"*). \`forca: definicao\`, assinado.
**Nenhum sintoma foi inventado** para preencher o degrau que saiu.

## ✅ Cálcio: sintoma primeiro, número depois — 2026-08-23

**Resposta do autor:** *"A presença de manifestações clínicas relevantes deve
prevalecer sobre uma classificação exclusivamente numérica."*

**Aplicado**, com os **três pesos** que ele separou — e o peso virou campo, não
redação:

- **define** (6): parestesia perioral e de extremidades · espasmo carpopedal ou
  tetania · Trousseau ou Chvostek · laringoespasmo ou estridor · convulsão ·
  QT prolongado e/ou arritmia
- **apoia** (1): broncoespasmo
- **exigeCompatibilidade** (2): hipotensão refratária a vasopressor · disfunção
  miocárdica aguda — ⚠️ **altamente inespecíficas no crítico**, lembradas quando
  o cálcio já está baixo, **nunca concluindo sozinhas**

## ✅ Cálcio ionizado: sem corte próprio — 2026-08-23

**Resposta do autor:** não criar faixas de gravidade para o ionizado. Usa-se o
valor medido, a **referência do laboratório** e o contexto. **Proibido converter**
o corte do total/ajustado para o ionizado.

**Aplicado:** com ionizado, **nenhum corte numérico casa** — nem o degrau de base,
porque classificar por queda é classificar. As notas de **pH** e de
**método/equipamento** aparecem na tela. E o ramo sintomático responde igual nos
três ensaios, então **quem tem o melhor exame deixou de receber a pior resposta**.

## ✅ O corte de hipocalcemia, e a unidade da fonte — 2026-08-23

**Pergunta:** o app usava \`< 7 mg/dL\` e a fonte diz \`< 1,9 mmol/L\` (≈ 7,62). Não
são o mesmo corte.

**Resposta do autor:** fidelidade à fonte. *"O valor é armazenado na unidade
original da fonte e convertido programaticamente para exibição."*

**Aplicado.** Hoje, vindo do dado:

- **hipocalcemia — grave:** ${cortesComConversao("hypocalcemia").join(" · ")}
- **hipofosfatemia — grave:** ${cortesComConversao("hypophosphatemia").join(" · ")}

⚠️ **Mudou classificação de paciente real:** o assintomático entre 7,0 e 7,6
mg/dL, que era "leve a moderada", passou a **grave**.

## ✅ Hipercalcemia: as faixas e o 14,0 mg/dL — 2026-08-23

**Resposta do autor:** o corte canônico permanece **> 3,5 mmol/L**, armazenado na
unidade da fonte; a apresentação em mg/dL é derivada. **14,0 mg/dL exatos não
entram** em correção urgente por critério numérico isolado. **Mostrar as duas
unidades na tela.** E: *"não arredondar o valor convertido para redefinir a
lógica de classificação"* — que virou trava.

**Aplicado.** As faixas, vindas do dado:

${G.GRAVIDADE_POR_DISTURBIO.hypercalcemia.map((g) => {
  const c = G.corteDoDegrau("hypercalcemia", g);
  return `- **${g.rotulo}** — ${c ?? "degrau de base"}`;
}).join("\n")}

Com o texto de conduta dele na faixa intermediária, em **campo próprio** —
porque classificação e conduta são camadas diferentes: a faixa classifica, o
texto conduz.
`;

fs.writeFileSync(SAIDA, md);
console.log(`✅ ${path.relative(RAIZ, SAIDA)} gerado — limiares vindos do dado`);
