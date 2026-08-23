#!/usr/bin/env node
/**
 * MEDIÇÃO — não é trava. Não reprova, não corrige, sem código de saída.
 *
 * ⚠️ A PERGUNTA (R-115): **de onde vem o critério de cada trava?**
 *
 * Em 2026-08-23 descobriu-se que `valida-calculadoras` rodava a varredura do
 * ânion gap SEM albumina e **exigia que a calculadora dissesse "normal"**. Ela
 * dizia — e a trava aprovava. Quem a escreveu olhou o que o app fazia, achou
 * razoável, e transformou o comportamento em exigência. **A partir dali o defeito
 * ficou PROTEGIDO: consertá-lo passaria a reprovar.**
 *
 * ⚠️ E a inversão perversa: quanto mais travas o repositório tem, MAIS CARO fica
 * corrigir um erro antigo — cada trava escrita a partir do comportamento
 * observado é uma âncora.
 *
 * ── COMO ELE CLASSIFICA, dito antes do número ───────────────────────────────
 *
 *   FONTE CLÍNICA   — o cabeçalho nomeia diretriz, bula, consenso ou publicação
 *   DECISÃO DO AUTOR — o cabeçalho registra decisão datada do autor
 *   ESTRUTURA        — o critério é sobre FORMA (unicidade, alcance, tipo,
 *                      cobertura, tradução) e não afirma nada clínico
 *   ⚠️ NÃO DECLARADA — nenhuma das três aparece. **É achado, não "provavelmente
 *                      está certo"** — inclui as candidatas a fossilizar defeito.
 *
 * ⚠️ CLASSIFICAÇÃO POR VOCABULÁRIO É PISO. Um cabeçalho que cite a fonte com
 * outras palavras cai em "não declarada" — e cair ali significa "não consegui
 * ver", nunca "não existe" (R-13).
 */
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const DIR = path.join(RAIZ, "scripts");

const EH_INSTRUMENTO = (n) => /^(valida|auditoria|mapa|censo)-/.test(n) && n.endsWith(".cjs");

/** Nomes de documento clínico que aparecem nos cabeçalhos deste repositório. */
const FONTE_CLINICA = /\b(KDIGO|UKKA|AHA|ACC|SSC|Surviving Sepsis|ESC|ESICM|ERA-EDTA|Society for Endocrinology|DailyMed|bula|label|diretriz|guideline|consenso|ATLS|ACLS|Brain Trauma|NICE|Sanford|ANVISA|publicaç|Figge|Riccardi|Rafique|JACEP|Lancet|NEJM|BMJ|JAMA|SBA|AMIB|ASA|DAS|ILCOR|ERC|WSES|IDSA|ADA|ESPEN)\b/i;
/**
 * ⚠️ ENSAIO NOMEADO TAMBÉM É FONTE. `valida-avc` deriva o critério da POPULAÇÃO
 * do WAKE-UP (oclusão de grande vaso não era exigida; trombectomia planejada era
 * exclusão) — isso é evidência citada, não comportamento observado.
 */
const ENSAIO = /\b(ensaio|estudo|trial|WAKE-UP|EXTEND|DAWN|DEFUSE|ANDROMEDA|ADRENAL|APROCCHSS|ARDSnet|CRASH|PROPPR|TTM|randomiz)\b/i;
/** Marcas de decisão registrada do autor. */
const DECISAO_DO_AUTOR = /\b(decis[ãa]o do autor|confirmado pelo autor|CONFIRMADO PELO AUTOR|o autor decidiu|declarado_por|autoriza[çc][ãa]o do autor|parecer do autor|Dr\. Sandro Dainez)\b/i;
/** Marcas de critério ESTRUTURAL — sobre forma, não sobre clínica. */
const ESTRUTURAL = /\b(uma c[óo]pia|dona [úu]nica|alcan[çc]|[óo]rf[ãa]|tradu[çc][ãa]o|dicion[áa]rio|chave|import|render|univers|piso|c[óo]digo de sa[íi]da|procedênc|proced[êe]nc|declara[çc][ãa]o|comprimento|caracteres|nomenclatura|grafia|duplica|monot[ôo]nic|sobreposi[çc][ãa]o|buraco|alcan[çc][áa]vel|inalcan[çc][áa]vel)\b/i;

const arquivos = fs.readdirSync(DIR).filter(EH_INSTRUMENTO).sort();
const linhas = [];
const contagem = { fonte: 0, autor: 0, estrutura: 0, naoDeclarada: 0 };

for (const arq of arquivos) {
  const texto = fs.readFileSync(path.join(DIR, arq), "utf8");
  // ⚠️ SÓ O CABEÇALHO. O corpo cita nome de fármaco e de diretriz o tempo todo
  // (é o que ele confere); usar o arquivo inteiro faria toda trava parecer ter
  // fonte, que é justamente o falso verde que esta medição procura.
  //
  // ⚠️ E O CABEÇALHO É O BLOCO `/** … */` INTEIRO. A primeira versão cortava no
  // primeiro `const` e perdia metade do texto — `valida-avc` explica o critério
  // pela população do ensaio WAKE-UP DEZ linhas depois do corte, e caiu em "não
  // declarada" por isso. Medir menos do que existe é o mesmo falso negativo que
  // esta varredura persegue.
  const fim = texto.indexOf("*/");
  const cabecalho = fim > 0 ? texto.slice(0, fim + 2) : texto.slice(0, 4000);

  const temFonte = FONTE_CLINICA.test(cabecalho) || ENSAIO.test(cabecalho);
  const temAutor = DECISAO_DO_AUTOR.test(cabecalho);
  const temEstrutura = ESTRUTURAL.test(cabecalho);
  let classe;
  if (temFonte) { classe = "FONTE CLÍNICA"; contagem.fonte++; }
  else if (temAutor) { classe = "DECISÃO DO AUTOR"; contagem.autor++; }
  else if (temEstrutura) { classe = "ESTRUTURA"; contagem.estrutura++; }
  else { classe = "⚠️ NÃO DECLARADA"; contagem.naoDeclarada++; }
  linhas.push({ arq, classe, temFonte, temAutor, temEstrutura });
}

console.log(`\nUNIVERSO (R-101): ${arquivos.length} instrumentos em scripts/ · só o CABEÇALHO de cada um foi lido`);
console.log(`  ⚠️ classificação por vocabulário: a contagem é PISO, e "não declarada" significa "não consegui ver", nunca "não existe"\n`);
console.log(`FONTE CLÍNICA ${contagem.fonte} · DECISÃO DO AUTOR ${contagem.autor} · ESTRUTURA ${contagem.estrutura} · ⚠️ NÃO DECLARADA ${contagem.naoDeclarada}\n`);

for (const classe of ["⚠️ NÃO DECLARADA", "FONTE CLÍNICA", "DECISÃO DO AUTOR", "ESTRUTURA"]) {
  const lista = linhas.filter((l) => l.classe === classe);
  console.log(`\n════ ${classe} (${lista.length}) ════`);
  for (const l of lista) console.log(`   ${l.arq}`);
}
console.log(`\n⚠️ MEDIÇÃO: sem código de saída. As da primeira lista são as CANDIDATAS a fossilizar defeito — cada uma precisa de leitura humana.\n`);
