#!/usr/bin/env node
/**
 * INVENTÁRIO DE CONTEÚDO CLÍNICO — preparação da auditoria científica.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O que este script é, e o que ele NÃO é
 *
 * Ele LOCALIZA e CATALOGA afirmações clínicas espalhadas pelo código. Ele não
 * julga se uma dose está certa, não compara com diretriz e não altera nada. Essa
 * separação é do próprio plano de auditoria: inventariar primeiro, auditar depois,
 * em camadas, com papéis distintos.
 *
 * Julgar conteúdo médico aqui seria pior que inútil — daria aparência de auditoria
 * científica a uma varredura de expressões regulares.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ## Por que varredura automática e não leitura
 *
 * São ~80 mil linhas em 222 arquivos clínicos. Leitura manual não termina e, pior,
 * não é reproduzível: a auditoria precisa poder ser REFEITA a cada mudança para
 * mostrar o que entrou e o que saiu. Um script roda de novo; uma leitura, não.
 *
 * O custo é conhecido e aceito: expressão regular acha padrão, não sentido. Há
 * falso positivo (número com unidade que não é conduta) e falso negativo (conduta
 * escrita sem número). Por isso o relatório traz a CONTAGEM e a LOCALIZAÇÃO para
 * revisão humana dirigida — não um veredito.
 *
 * ## Saídas
 *
 * auditoria/inventario-clinico.json  — dados completos, para as camadas seguintes
 * auditoria/inventario-clinico.csv   — para planilha e revisão médica
 * auditoria/INVENTARIO-CLINICO.md    — relatório com as tabelas pedidas no plano
 *
 * Uso: node scripts/inventario-clinico.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const saidaDir = path.join(appDir, "auditoria");

// ── Onde procurar ───────────────────────────────────────────────────────────
//
// A CAMADA importa tanto quanto o arquivo: uma dose dentro de uma árvore de
// decisão é conteúdo no lugar certo; a mesma dose dentro de um componente de tela
// é conteúdo clínico acoplado à interface, que é justamente um dos achados que o
// plano pede para listar.
// ⚠️ REGRA DE COBERTURA: todo arquivo é varrido; a lista abaixo só CLASSIFICA.
//
// A primeira versão listava padrões e varria apenas o que casasse. Resultado: 15
// arquivos com conteúdo clínico ficaram de fora em silêncio, incluindo
// `avc/prescriptions.ts` (50 ocorrências), o `protocol.json` do ACLS, o `engine.ts`
// e as árvores de taquicardia e bradicardia — que terminam em `-tree.ts` e não em
// `-decision-tree.ts`. Um inventário incompleto é pior que nenhum: dá a impressão
// de cobertura que não existe.
//
// Agora a lógica é invertida: varre-se tudo que não está explicitamente excluído, e
// o que não casa com nenhum padrão cai em "outro" — visível no relatório em vez de
// ausente dele.
const CAMADAS = [
  { camada: "protocolo", padrao: /^(protocols\/.+|protocol)\.json$/, descricao: "Protocolos em JSON" },
  { camada: "arvore-decisao", padrao: /-(decision-)?tree\.ts$/, descricao: "Árvores de decisão" },
  { camada: "engine", padrao: /-engine\.ts$|^engine\.ts$/, descricao: "Engines clínicos" },
  { camada: "motor-acls", padrao: /^acls\/(?!locales\/).+\.ts$/, descricao: "Motor do ACLS" },
  { camada: "traducao", padrao: /^(lib\/i18n\/|acls\/locales\/)/, descricao: "Camada de tradução" },
  { camada: "dominio-modulo", padrao: /^(avc|coronary|sepsis|acls-[a-z]+)\//, descricao: "Domínio por módulo" },
  { camada: "interface", padrao: /^components\/.+\.tsx?$/, descricao: "Componentes de interface" },
  { camada: "navegacao", padrao: /^app\/.+\.tsx?$/, descricao: "Rotas e navegação" },
  { camada: "biblioteca", padrao: /^lib\/(?!i18n\/).+\.ts$/, descricao: "Bibliotecas de apoio" },
  { camada: "registro", padrao: /^clinical-modules\.ts$/, descricao: "Registro de módulos" },
  { camada: "outro", padrao: /.*/, descricao: "Não classificado — revisar" },
];

const IGNORAR =
  /node_modules|\.expo|dist|scripts\/|e2e\/|__tests__|\.test\.|\.spec\.|^auditoria\/|\.d\.ts$/;

// ── Categorias clínicas ─────────────────────────────────────────────────────
//
// Os padrões saíram de AMOSTRAGEM do próprio código, não de suposição. O risco de
// cada categoria segue a lista explícita do plano de auditoria: dose, diluição,
// velocidade de infusão, energia de desfibrilação, critério de trombólise,
// contraindicação, sequência de ressuscitação, parâmetro de ventilação, critério
// de intubação, meta hemodinâmica e cálculo de droga são CRÍTICOS ou ALTOS.
const CATEGORIAS = [
  {
    id: "dose",
    rotulo: "Dose de medicamento",
    risco: "crítico",
    padrao: /\b\d+(?:[.,]\d+)?\s*(?:–|-|a|to)?\s*\d*(?:[.,]\d+)?\s*(mg|mcg|µg|g|UI|U|mEq|mmol|ng)\b(?!\/)/i,
  },
  {
    id: "dose-por-peso",
    rotulo: "Dose por peso",
    risco: "crítico",
    padrao: /\b\d+(?:[.,]\d+)?\s*(?:–|-|a)?\s*\d*(?:[.,]\d+)?\s*(?:mg|mcg|µg|g|mL|UI)\s*\/\s*kg\b/i,
  },
  {
    id: "velocidade-infusao",
    rotulo: "Velocidade de infusão",
    risco: "crítico",
    padrao: /(mcg|µg|mg|ng|UI|mL)\s*\/\s*(kg\s*\/\s*)?(min|h|hora)\b/i,
  },
  {
    id: "diluicao",
    rotulo: "Diluição ou concentração",
    risco: "crítico",
    padrao: /\b(dilu[ií]|concentra[çc][ãa]o|ampola|frasco|1\s*:\s*\d{3,}|\d+\s*(mg|mcg|g|UI)\s*\/\s*\d*\s*mL)\b/i,
  },
  {
    id: "energia-desfibrilacao",
    rotulo: "Energia de desfibrilação",
    risco: "crítico",
    padrao: /\b\d+\s*(?:–|-|a)?\s*\d*\s*(?:J\b|joules?)|\bbif[áa]sic|monof[áa]sic/i,
  },
  {
    id: "trombolise",
    rotulo: "Critério de trombólise",
    risco: "crítico",
    padrao: /\b(tromb[óo]lise|trombol[íi]tic|alteplase|tenecteplase|rt-?PA|NIHSS|janela\s+terap[êe]utica)\b/i,
  },
  {
    id: "contraindicacao",
    rotulo: "Contraindicação",
    risco: "crítico",
    padrao: /\b(contraindica|contra-indica|n[ãa]o\s+(?:usar|administrar|aplicar|indicad)|proscrit)/i,
  },
  {
    id: "ventilacao",
    rotulo: "Parâmetro de ventilação",
    risco: "alto",
    padrao: /\b(PEEP|volume\s+corrente|press[ãa]o\s+de\s+plat[ôo]|driving\s+pressure|FiO2|FiO₂|VC\s*\d|mL\/kg\s*(PBW|peso\s+predito))\b/i,
  },
  {
    id: "intubacao",
    rotulo: "Critério ou droga de intubação",
    risco: "alto",
    padrao: /\b(intuba[çc][ãa]o|sequ[êe]ncia\s+r[áa]pida|ISR|laringoscop|bloqueador\s+neuromuscular|succinilcolina|rocur[ôo]nio|etomidato|quetamina|cetamina)\b/i,
  },
  {
    id: "meta-hemodinamica",
    rotulo: "Meta hemodinâmica ou fisiológica",
    risco: "alto",
    padrao: /\b(PAM|PAS|PAD|press[ãa]o\s+arterial|SpO2|SpO₂|SatO2|PaO2|PaCO2|EtCO2|glicemia|lactato)\b[^.]{0,40}(?:[<>≥≤]|\balvo\b|\bmeta\b|\bmanter\b)/i,
  },
  {
    id: "sequencia-ressuscitacao",
    rotulo: "Sequência de ressuscitação",
    risco: "crítico",
    padrao: /\b(RCP|compress[õo]es|ciclo\s+de\s+2\s*min|30\s*:\s*2|desfibrila|cardioversã|choque)\b/i,
  },
  {
    id: "criterio-clinico",
    rotulo: "Critério de inclusão, exclusão ou gravidade",
    risco: "alto",
    padrao: /\b(crit[ée]rio|inclus[ãa]o|exclus[ãa]o|indica[çc][ãa]o|qSOFA|SOFA|Glasgow|escala|score|instabilidade)\b/i,
  },
  {
    id: "tempo-janela",
    rotulo: "Tempo ou janela terapêutica",
    risco: "alto",
    padrao: /\b\d+\s*(?:–|-|a)?\s*\d*\s*(min|minutos?|h|horas?|segundos?)\b/i,
  },
  {
    id: "via-administracao",
    rotulo: "Via de administração",
    risco: "moderado",
    padrao: /\b(IV|IO|IM|VO|SC|EV|intra[óo]sse|endovenos|intramuscul|subcut[âa]ne|inalat[óo]ri|intranasal|retal)\b/,
  },
  {
    id: "exame",
    rotulo: "Exame ou coleta",
    risco: "moderado",
    padrao: /\b(gasometria|hemocultura|culturas?|ECG|eletrocardiograma|radiografia|tomografia|ultrassom|POCUS|troponina|hemograma|creatinina|eletr[óo]litos)\b/i,
  },
];

// Termos que denunciam CÁLCULO codificado — risco crítico porque o erro não
// aparece no texto, aparece no número que chega ao médico.
const PADRAO_CALCULO = /\b(?:const|let|function|=>)\b[^\n]*\b(dose|peso|weight|rate|infus|conc|dilu|calc|mcgKg|mgKg|pbw|bsa|clearance)\w*/i;

// ── Referências ─────────────────────────────────────────────────────────────
const PADRAO_REFERENCIA =
  /\b(AHA|ACLS|ILCOR|ESC|ERC|SSC|Surviving\s+Sepsis|WAO|EAACI|ADA|AAN|ATS|SBC|AMIB|SBA|NICE|UpToDate|diretriz|guideline|baseado\s+em|refer[êe]ncia|fonte:|doi|20\d\d)\b/i;

/**
 * Cadeia sem espaço, em kebab ou snake case: chave de código, não frase clínica.
 *
 * Medido na amostra de conferência: era a fonte principal de falso positivo em
 * "dose" — 3 de 16 achados críticos amostrados.
 */
function ehIdentificador(texto) {
  const t = texto.trim();
  return t.length > 0 && !/\s/.test(t) && /^[a-z0-9]+([-_][a-z0-9]+)+$/i.test(t);
}

function listarArquivos(dir, acc = []) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    const relativo = path.relative(appDir, completo);
    if (IGNORAR.test(relativo)) continue;
    if (entrada.isDirectory()) {
      listarArquivos(completo, acc);
    } else if (/\.(ts|tsx|json|md)$/.test(entrada.name)) {
      acc.push(relativo);
    }
  }
  return acc;
}

function camadaDe(relativo) {
  for (const c of CAMADAS) {
    if (c.padrao.test(relativo)) return c.camada;
  }
  return "outro";
}

/** Módulo a que o arquivo pertence, deduzido do nome. */
function moduloDe(relativo) {
  const base = path.basename(relativo);
  if (/^acls\//.test(relativo)) return "pcr-adulto";
  const sub = relativo.match(/^(avc|coronary|sepsis)\//);
  if (sub) return sub[1];
  const m = base.match(/^([a-z0-9-]+?)-(decision-tree|tree|engine|calculator-screen|screen)\.tsx?$/);
  if (m) return m[1];
  if (base === "protocol.json" || base === "engine.ts") return "pcr-adulto";
  const j = base.match(/^([a-z0-9_]+)\.json$/);
  if (j && /^protocols\//.test(relativo)) return j[1].replace(/_/g, "-");
  if (/^lib\/i18n\//.test(relativo) || /^acls\/locales\//.test(relativo)) return "(tradução)";
  if (/^app\//.test(relativo)) return "(navegação)";
  if (/^components\//.test(relativo)) return "(interface)";
  return "(geral)";
}

/** Texto exibido: o literal de string que contém a afirmação, quando houver. */
function literalDaLinha(linha, indice) {
  const literais = [...linha.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`]*)`/g)];
  for (const lit of literais) {
    const texto = lit[1] ?? lit[2] ?? lit[3] ?? "";
    const inicio = lit.index ?? 0;
    if (indice >= inicio && indice <= inicio + lit[0].length) return texto;
  }
  return literais.length ? literais[0][1] ?? literais[0][2] ?? literais[0][3] ?? "" : undefined;
}

/** Etapa clínica: o `id:` de nó/estado mais próximo acima da linha. */
function etapaProxima(linhas, indiceLinha) {
  for (let i = indiceLinha; i >= 0 && indiceLinha - i < 80; i -= 1) {
    const m = linhas[i].match(/^\s*(?:id|key|stateId)\s*:\s*["']([a-z0-9_.-]+)["']/i);
    if (m) return m[1];
  }
  return undefined;
}

/** Assinatura para detectar a MESMA afirmação em lugares diferentes. */
function assinatura(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9<>≥≤/.,:%-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const achados = [];
/** Todo literal das camadas-fonte — base da comparação entre idiomas. */
const literaisDeOrigem = [];
const arquivos = listarArquivos(appDir);

for (const relativo of arquivos) {
  const conteudo = fs.readFileSync(path.join(appDir, relativo), "utf8");
  const linhas = conteudo.split("\n");
  const camada = camadaDe(relativo);
  const modulo = moduloDe(relativo);
  const arquivoTemReferencia = PADRAO_REFERENCIA.test(conteudo);

  linhas.forEach((linha, i) => {
    if (linha.trim().startsWith("//") || linha.trim().startsWith("*")) return;

    // Base de comparação entre idiomas: TODOS os literais das camadas-fonte, não só
    // os que viraram achado. Uma linha de engine pode ter três literais num
    // ternário, e registrar só o primeiro fazia as outras duas parecerem sem
    // original quando apareciam traduzidas.
    if (camada !== "traducao") {
      for (const lit of linha.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`]*)`/g)) {
        const t = lit[1] ?? lit[2] ?? lit[3] ?? "";
        if (t.length > 3) literaisDeOrigem.push(t);
      }
    }

    const categoriasNaLinha = new Set();
    for (const categoria of CATEGORIAS) {
      const m = categoria.padrao.exec(linha);
      if (!m) continue;
      categoriasNaLinha.add(categoria.id);

      const texto = literalDaLinha(linha, m.index);
      // Sem literal e sem cara de cálculo, é ruído de código.
      if (!texto && !PADRAO_CALCULO.test(linha)) continue;
      // Identificador não é conduta. `dobu-250mg-20ml` e `feni-10mg-1ml` são
      // chaves de apresentação de frasco, não texto que chega ao médico — e
      // entravam como "dose crítica" só por conterem número e unidade.
      if (texto && ehIdentificador(texto)) continue;

      achados.push({
        codigo: `INV-${String(achados.length + 1).padStart(4, "0")}`,
        modulo,
        camada,
        arquivo: relativo,
        linha: i + 1,
        etapa: etapaProxima(linhas, i),
        categoria: categoria.id,
        rotulo: categoria.rotulo,
        risco: categoria.risco,
        textoExibido: (texto ?? linha.trim()).slice(0, 240),
        ehCalculo: PADRAO_CALCULO.test(linha),
        // Referência de VIZINHANÇA: as 12 linhas ao redor. Referência no topo do
        // arquivo não sustenta uma dose 400 linhas abaixo.
        temReferenciaProxima: PADRAO_REFERENCIA.test(
          linhas.slice(Math.max(0, i - 6), i + 6).join("\n")
        ),
        arquivoTemReferencia,
        assinatura: assinatura(texto ?? linha),
      });
    }
  });
}

// ── Agregações ──────────────────────────────────────────────────────────────
const porModulo = new Map();
const porCategoria = new Map();
const porAssinatura = new Map();

for (const a of achados) {
  if (!porModulo.has(a.modulo)) porModulo.set(a.modulo, []);
  porModulo.get(a.modulo).push(a);
  if (!porCategoria.has(a.categoria)) porCategoria.set(a.categoria, []);
  porCategoria.get(a.categoria).push(a);
  if (a.assinatura.length > 12) {
    if (!porAssinatura.has(a.assinatura)) porAssinatura.set(a.assinatura, []);
    porAssinatura.get(a.assinatura).push(a);
  }
}

// Duplicação: mesma afirmação em ARQUIVOS diferentes.
const duplicadas = [...porAssinatura.entries()]
  .map(([sig, itens]) => ({ sig, itens, arquivos: new Set(itens.map((i) => i.arquivo)) }))
  .filter((d) => d.arquivos.size > 1)
  .sort((a, b) => b.arquivos.size - a.arquivos.size);

// Sem referência: crítico/alto sem citação na vizinhança.
const semReferencia = achados.filter(
  (a) => (a.risco === "crítico" || a.risco === "alto") && !a.temReferenciaProxima
);

// Conteúdo clínico fora do lugar.
const naInterface = achados.filter((a) => a.camada === "interface");
const naNavegacao = achados.filter((a) => a.camada === "navegacao");
const naTraducao = achados.filter((a) => a.camada === "traducao");

/**
 * Afirmação clínica que aparece SÓ na camada de tradução.
 *
 * Uma dose traduzida cuja versão original também existe é espelho: duplicação
 * conhecida e gerenciável. Uma dose que existe APENAS na tradução é conteúdo
 * clínico órfão — não há original de onde revisá-la, e mesmo assim ela chega ao
 * médico que usa o app naquele idioma.
 *
 * ## Como comparar entre idiomas
 *
 * Pela CARGA NUMÉRICA, não pelo texto. Comparar texto normalizado foi a primeira
 * tentativa e estava errada: "150 mg IV/IO em bolus" e "150 mg IV/IO en bolo" nunca
 * casam, então TODA tradução parecia órfã — 2.428 falsos positivos, quase o acervo
 * inteiro. Número e unidade são invariantes de idioma; é neles que a comparação se
 * apoia.
 *
 * Continua sendo aproximação: uma dose traduzida cujos números coincidam com os de
 * outra afirmação qualquer conta como espelhada. Erra para MENOS, que é o lado certo
 * de errar aqui — o que sobra na lista tem chance real de ser órfão.
 */
function cargaNumerica(texto) {
  const numeros = [...String(texto).matchAll(/\b(\d+(?:[.,]\d+)?)\s*(mg|mcg|µg|g|ui|meq|mmol|ml|j|min|h)\b/gi)]
    .map((m) => `${m[1].replace(",", ".")}${m[2].toLowerCase()}`)
    .sort();
  return numeros.length ? numeros.join("|") : undefined;
}

// Conjuntos de números por linha de origem. Comparação por SUBCONJUNTO, não por
// igualdade: uma linha de engine costuma trazer vários valores de uma vez
// ("4,5 g IV 6/6h ... 4,5 g IV 8/8h ... 2,25 g IV 8/8h"), enquanto a entrada do
// dicionário traz só um pedaço dela. Exigir impressão idêntica marcava como órfã
// uma dose que tinha original — foi o que a conferência manual de duas amostras
// mostrou, e as duas eram falso positivo.
const conjuntosDeOrigem = literaisDeOrigem
  .map((t) => new Set(numerosDe(t)))
  .filter((c) => c.size > 0);

// Declarada como função para poder ser usada acima na varredura.
function numerosDe(texto) {
  return [...String(texto).matchAll(/\b(\d+(?:[.,]\d+)?)\s*(mg|mcg|µg|g|ui|meq|mmol|ml|j|min|h)\b/gi)].map(
    (m) => `${m[1].replace(",", ".")}${m[2].toLowerCase()}`
  );
}

const soNaTraducao = achados.filter((a) => {
  if (a.camada !== "traducao") return false;
  if (a.risco !== "crítico" && a.risco !== "alto") return false;
  const nums = numerosDe(a.textoExibido);
  // Sem número não dá para rastrear entre idiomas — fica fora para não inventar.
  if (!nums.length) return false;
  return !conjuntosDeOrigem.some((origem) => nums.every((n) => origem.has(n)));
});

// Possível contradição: mesmo medicamento com números diferentes entre módulos.
const MEDICAMENTOS = [
  "adrenalina", "epinefrina", "noradrenalina", "amiodarona", "lidocaína", "atropina",
  "dobutamina", "dopamina", "vasopressina", "midazolam", "fentanil", "etomidato",
  "quetamina", "cetamina", "succinilcolina", "rocurônio", "propofol", "furosemida",
  "hidrocortisona", "metilprednisolona", "magnésio", "bicarbonato", "gluconato",
  "insulina", "alteplase", "tenecteplase", "ceftriaxona", "piperacilina", "vancomicina",
  "meropenem", "difenidramina", "salbutamol", "naloxona", "flumazenil", "diazepam",
];
/**
 * Dose ADJACENTE ao nome do medicamento — até 32 caracteres depois dele.
 *
 * A primeira versão pegava qualquer número na mesma linha do medicamento e
 * produzia listas sem valor: "adrenalina: 1 mg · 10 ml · 300 mg · 150 mg", onde
 * 300 mg e 150 mg eram da amiodarona citada na mesma frase. Uma lista assim não
 * ajuda a revisão médica — atrapalha, porque some no ruído o caso que importa.
 *
 * Com a janela curta, "Adrenalina 1 mg IV" entra e "…adrenalina… amiodarona 300 mg"
 * não. Continua sendo triagem: doses diferentes do mesmo fármaco podem estar
 * certíssimas (indicação, via e população diferentes), e o plano é explícito em não
 * escolher automaticamente qual versão está correta.
 */
const numerosPorMedicamento = new Map();
for (const a of achados) {
  const t = a.textoExibido.toLowerCase();
  for (const med of MEDICAMENTOS) {
    let de = t.indexOf(med);
    while (de !== -1) {
      const janela = t.slice(de + med.length, de + med.length + 32);
      const m = janela.match(/^[^a-z0-9]{0,4}(\d+(?:[.,]\d+)?)\s*(mg|mcg|µg|g|ui|meq|mmol|ml)\b/);
      if (m) {
        // Via, quando declarada logo depois — separa dose IM de dose IV.
        const via = (janela.match(/\b(iv|io|im|vo|sc|ev|inalat|intranasal)\b/) ?? [])[1] ?? "";
        const chave = `${m[1].replace(",", ".")} ${m[2]}${via ? ` ${via.toUpperCase()}` : ""}`;
        if (!numerosPorMedicamento.has(med)) numerosPorMedicamento.set(med, new Map());
        const porValor = numerosPorMedicamento.get(med);
        if (!porValor.has(chave)) porValor.set(chave, []);
        porValor.get(chave).push(a);
      }
      de = t.indexOf(med, de + med.length);
    }
  }
}
const possiveisContradicoes = [...numerosPorMedicamento.entries()]
  .map(([med, porValor]) => ({
    medicamento: med,
    valores: [...porValor.entries()].map(([valor, itens]) => ({
      valor,
      modulos: [...new Set(itens.map((i) => i.modulo))],
      ocorrencias: itens.length,
    })),
  }))
  .filter((c) => c.valores.length > 1 && new Set(c.valores.flatMap((v) => v.modulos)).size > 1)
  .sort((a, b) => b.valores.length - a.valores.length);

// ── Acoplamento com IA ──────────────────────────────────────────────────────
//
// A decisão arquitetural do plano é explícita: nenhum serviço de IA implementado,
// contratado ou ACOPLADO nesta fase. "Acoplado" é a palavra que importa — código
// desligado por flag continua acoplado, porque continua importado, mantido e
// suscetível de ser religado por engano.
//
// Esta verificação não remove nada. Só torna o acoplamento visível, que é
// pré-requisito para decidir sobre ele.
const PADRAO_IA = /\b(openai|anthropic|deepseek|gemini|generativelanguage|embedding|completions|acls-ai|aiInsight|AclsAiInsight)\b/i;
const acoplamentoIA = [];
for (const relativo of arquivos) {
  const conteudo = fs.readFileSync(path.join(appDir, relativo), "utf8");
  conteudo.split("\n").forEach((linha, i) => {
    if (!PADRAO_IA.test(linha)) return;
    if (linha.trim().startsWith("//") || linha.trim().startsWith("*")) return;
    acoplamentoIA.push({ arquivo: relativo, linha: i + 1, trecho: linha.trim().slice(0, 150) });
  });
}

// ── Saída ───────────────────────────────────────────────────────────────────
fs.mkdirSync(saidaDir, { recursive: true });

fs.writeFileSync(
  path.join(saidaDir, "inventario-clinico.json"),
  JSON.stringify(
    {
      geradoPor: "scripts/inventario-clinico.cjs",
      totalAchados: achados.length,
      arquivosVarridos: arquivos.length,
      achados,
      duplicadas: duplicadas.map((d) => ({
        afirmacao: d.itens[0].textoExibido,
        arquivos: [...d.arquivos],
        ocorrencias: d.itens.length,
      })),
      semReferencia: semReferencia.map((a) => a.codigo),
      soNaTraducao: soNaTraducao.map((a) => ({ arquivo: a.arquivo, linha: a.linha, texto: a.textoExibido })),
      possiveisContradicoes,
      acoplamentoIA,
    },
    null,
    1
  )
);

const csv = [
  "codigo;modulo;camada;arquivo;linha;etapa;categoria;risco;texto;calculo;referencia_proxima",
  ...achados.map((a) =>
    [
      a.codigo, a.modulo, a.camada, a.arquivo, a.linha, a.etapa ?? "", a.categoria, a.risco,
      `"${a.textoExibido.replace(/"/g, "'")}"`, a.ehCalculo ? "sim" : "não",
      a.temReferenciaProxima ? "sim" : "não",
    ].join(";")
  ),
].join("\n");
fs.writeFileSync(path.join(saidaDir, "inventario-clinico.csv"), csv);

const contar = (lista, chave) => {
  const m = new Map();
  for (const a of lista) m.set(a[chave], (m.get(a[chave]) ?? 0) + 1);
  return [...m.entries()].sort((x, y) => y[1] - x[1]);
};

const linhasRel = [];
const P = (s = "") => linhasRel.push(s);

P("# Inventário de conteúdo clínico");
P();
P("> Gerado por `node scripts/inventario-clinico.cjs`. **Nenhum código foi alterado.**");
P("> Este documento LOCALIZA conteúdo clínico. Ele não avalia se o conteúdo está");
P("> correto — isso é a Camada 2 em diante, com as fontes em mãos.");
P();
P(`- Arquivos varridos: **${arquivos.length}**`);
P(`- Ocorrências catalogadas: **${achados.length}**`);
P(`- Módulos com conteúdo clínico: **${porModulo.size}**`);
P();
P("## Por módulo");
P();
P("| módulo | ocorrências | crítico | alto | moderado |");
P("|---|---:|---:|---:|---:|");
for (const [modulo, itens] of [...porModulo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const c = itens.filter((i) => i.risco === "crítico").length;
  const al = itens.filter((i) => i.risco === "alto").length;
  const mo = itens.filter((i) => i.risco === "moderado").length;
  P(`| ${modulo} | ${itens.length} | ${c} | ${al} | ${mo} |`);
}
P();
P();
P("> ⚠️ A coluna `módulo` vem do NOME DO ARQUIVO. O mesmo módulo clínico aparece com");
P("> nome em português e em inglês — `sepse`/`sepsis`, `anafilaxia`/`anaphylaxis`,");
P("> `avc`/`acidente-vascular-cerebral`, `rsi`/`isr-rapida`, `eap`/`edema-agudo-pulmao`,");
P("> `coronary`/`sindromes-coronarianas` —, então um mesmo protocolo aparece dividido");
P("> em duas linhas desta tabela. Isso não é defeito do inventário: é como o código");
P("> está, e atrapalha exatamente a auditoria de consistência entre módulos (Camada");
P("> 3), que precisa saber que dois arquivos falam do mesmo protocolo.");
P();
P("## Por categoria");
P();
P("| categoria | risco | ocorrências | módulos |");
P("|---|---|---:|---:|");
for (const [cat, itens] of [...porCategoria.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const def = CATEGORIAS.find((c) => c.id === cat);
  P(`| ${def.rotulo} | ${def.risco} | ${itens.length} | ${new Set(itens.map((i) => i.modulo)).size} |`);
}
P();
P("## Por camada — onde o conteúdo clínico está armazenado");
P();
P("| camada | ocorrências | leitura |");
P("|---|---:|---|");
for (const [camada, n] of contar(achados, "camada")) {
  const desc = CAMADAS.find((c) => c.camada === camada)?.descricao ?? camada;
  P(`| ${desc} | ${n} | |`);
}
P();
P("## Conteúdo clínico acoplado à interface");
P();
P(`**${naInterface.length} ocorrências** em componentes de tela.`);
P();
if (naInterface.length) {
  P("| arquivo | linha | categoria | texto |");
  P("|---|---:|---|---|");
  for (const a of naInterface.slice(0, 40)) {
    P(`| \`${a.arquivo}\` | ${a.linha} | ${a.categoria} | ${a.textoExibido.slice(0, 90)} |`);
  }
  if (naInterface.length > 40) P(`| … | | | mais ${naInterface.length - 40} |`);
}
P();
P("## Conteúdo clínico acoplado à navegação");
P();
P(`**${naNavegacao.length} ocorrências** em rotas.`);
P();
P("## Conteúdo clínico na camada de tradução");
P();
P(`**${naTraducao.length} ocorrências.** Toda dose escrita aqui é uma SEGUNDA fonte da`);
P("mesma informação: mudar a dose no protocolo e não na tradução faz o app dizer");
P("números diferentes conforme o idioma.");
P();
P("### Afirmações clínicas que existem SÓ na tradução");
P();
P(`**${soNaTraducao.length} de ${naTraducao.length}** ocorrências de risco crítico ou alto`);
P("na camada de tradução não têm original correspondente no conteúdo-fonte.");
P();
P("Espelho de uma dose original é duplicação gerenciável. Dose que existe apenas");
P("traduzida é conteúdo clínico órfão: não há de onde revisá-la, e chega ao médico");
P("que usa o app naquele idioma.");
P();
if (soNaTraducao.length) {
  P("| arquivo | linha | texto |");
  P("|---|---:|---|");
  for (const a of soNaTraducao.slice(0, 25)) {
    P(`| \`${a.arquivo}\` | ${a.linha} | ${a.textoExibido.slice(0, 100)} |`);
  }
  if (soNaTraducao.length > 25) P(`| … | | mais ${soNaTraducao.length - 25} |`);
}
P();
P("## Afirmações duplicadas entre arquivos");
P();
P(`**${duplicadas.length} afirmações** aparecem em mais de um arquivo.`);
P();
if (duplicadas.length) {
  P("| ocorrências | arquivos | afirmação |");
  P("|---:|---:|---|");
  for (const d of duplicadas.slice(0, 30)) {
    P(`| ${d.itens.length} | ${d.arquivos.size} | ${d.itens[0].textoExibido.slice(0, 100)} |`);
  }
}
P();
P("## Possíveis contradições — mesmo medicamento, números diferentes");
P();
P("> ⚠️ Lista de SUSPEITAS, não de erros. Doses diferentes podem ser corretas");
P("> (indicações, populações e vias diferentes). Cada linha precisa de olho médico.");
P();
if (possiveisContradicoes.length) {
  P("| medicamento | valores encontrados | módulos |");
  P("|---|---|---|");
  for (const c of possiveisContradicoes.slice(0, 25)) {
    const vals = c.valores.map((v) => v.valor).slice(0, 8).join(" · ");
    const mods = [...new Set(c.valores.flatMap((v) => v.modulos))].slice(0, 6).join(", ");
    P(`| ${c.medicamento} | ${vals} | ${mods} |`);
  }
}
P();
P("## Afirmações de risco crítico ou alto sem referência próxima");
P();
P(`**${semReferencia.length} de ${achados.filter((a) => a.risco !== "moderado").length}**`);
P("ocorrências de risco crítico ou alto não têm citação de diretriz nas 12 linhas ao redor.");
P();
P("> Ausência de referência PRÓXIMA não significa ausência de fundamento: o arquivo");
P("> pode citar a diretriz no cabeçalho. Significa que a afirmação não é rastreável");
P("> ao ser lida no lugar onde está — que é o problema que a Camada 9 vai atacar.");
P();
P("## Acoplamento com inteligência artificial");
P();
P("> A decisão arquitetural do plano é explícita: nenhum serviço de IA");
P("> implementado, contratado ou **acoplado** nesta fase.");
P();
if (acoplamentoIA.length === 0) {
  P("Nenhum acoplamento encontrado.");
} else {
  const arquivosIA = [...new Set(acoplamentoIA.map((a) => a.arquivo))];
  P(`**${acoplamentoIA.length} ocorrências em ${arquivosIA.length} arquivos.**`);
  P();
  P("O caminho existe e está DESLIGADO por variável de ambiente");
  P("(`EXPO_PUBLIC_ACLS_AI_ENABLED=false`), não removido. Desligado por flag ainda é");
  P("acoplado: continua importado pela tela ativa do PCR, continua mantido, e volta a");
  P("funcionar com uma variável de ambiente.");
  P();
  P("| arquivo | ocorrências |");
  P("|---|---:|");
  for (const arq of arquivosIA) {
    P(`| \`${arq}\` | ${acoplamentoIA.filter((a) => a.arquivo === arq).length} |`);
  }
  P();
  P("Nada foi removido. A remoção é decisão de quem define a arquitetura, e o próprio");
  P("plano prevê um \"Plano B — tutor clínico futuro\": pode ser que este seja o ponto");
  P("de extensão que se queira preservar.");
}
P();
P("## Prioridade recomendada para a auditoria");
P();
P("Ordem por risco × volume × acoplamento:");
P();
const prioridade = [...porModulo.entries()]
  .map(([modulo, itens]) => ({
    modulo,
    criticos: itens.filter((i) => i.risco === "crítico").length,
    total: itens.length,
    semRef: itens.filter((i) => i.risco !== "moderado" && !i.temReferenciaProxima).length,
  }))
  .sort((a, b) => b.criticos - a.criticos || b.semRef - a.semRef)
  .slice(0, 15);
P("| # | módulo | críticos | sem referência próxima | total |");
P("|---:|---|---:|---:|---:|");
prioridade.forEach((p, i) => P(`| ${i + 1} | ${p.modulo} | ${p.criticos} | ${p.semRef} | ${p.total} |`));
P();
P("---");
P();
P("### Limites conhecidos desta varredura");
P();
P("- **Expressão regular acha padrão, não sentido.** Há falso positivo (número com");
P("  unidade que não é conduta) e falso negativo (conduta sem número).");
P("- **Não avalia correção clínica.** Nada aqui diz que uma dose está certa ou errada.");
P("- **Duplicação é por texto idêntico.** Duas redações diferentes da mesma conduta");
P("  não são detectadas — só a Camada 3 pega isso.");
P("- **Referência é presença de citação, não sua adequação.** Se a citação sustenta a");
P("  afirmação é assunto da Camada 9.");

fs.writeFileSync(path.join(saidaDir, "INVENTARIO-CLINICO.md"), linhasRel.join("\n") + "\n");

console.log(`\nArquivos varridos: ${arquivos.length}`);
console.log(`Ocorrências catalogadas: ${achados.length}`);
console.log(`  crítico: ${achados.filter((a) => a.risco === "crítico").length}`);
console.log(`  alto: ${achados.filter((a) => a.risco === "alto").length}`);
console.log(`  moderado: ${achados.filter((a) => a.risco === "moderado").length}`);
console.log(`Duplicadas entre arquivos: ${duplicadas.length}`);
console.log(`Sem referência próxima (crítico/alto): ${semReferencia.length}`);
console.log(`Na interface: ${naInterface.length} · na navegação: ${naNavegacao.length} · na tradução: ${naTraducao.length}`);
console.log(`  só na tradução (sem original): ${soNaTraducao.length}`);
console.log(`Possíveis contradições de dose: ${possiveisContradicoes.length}`);
console.log(`Acoplamento com IA: ${acoplamentoIA.length} ocorrências em ${new Set(acoplamentoIA.map((a) => a.arquivo)).size} arquivos`);
console.log(`\nSaída em auditoria/`);
