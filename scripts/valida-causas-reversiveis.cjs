/**
 * valida-causas-reversiveis.cjs — a lib e o dono não podem divergir
 *
 * PROMETE: que `lib/causas-reversiveis.ts` (consumida pelo card da AESP em
 *   Ritmos de Parada) tenha EXATAMENTE os mesmos nomes, na mesma ordem, do
 *   módulo dono; e que cada causa do dono tenha intervenção específica.
 * NÃO PROMETE: que os nomes ou as intervenções estejam clinicamente certos —
 *   a conferência é de SINCRONIA e de PRESENÇA, não de fonte.
 * UNIVERSO: os dois arquivos.
 *
 * ── POR QUE ESTA TRAVA EXISTE ───────────────────────────────────────────────
 *
 * A lib foi criada copiando os dez nomes À MÃO do módulo dono. Conferido por
 * execução: nasceu sincronizada. Mas copiar à mão é como o app acumulou boa
 * parte dos defeitos desta auditoria, e a garantia não é o estado de hoje — é
 * o que impede a 11ª causa de nascer só de um lado.
 *
 * Mesmo argumento que criou lib/atropina.ts ANTES do segundo sítio.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
// O dono do DETALHE saiu da tela e virou lib: o painel que abre DURANTE a
// parada precisa do mesmo conteúdo e não pode importar React.
const DONO = "lib/causas-reversiveis-detalhe.ts";
const LIB = "lib/causas-reversiveis.ts";
const falhas = [];
let ok = 0;

const dono = lerFonte(path.join(appDir, DONO));
const lib = lerFonte(path.join(appDir, LIB));

const nomesDono = [...dono.matchAll(/^\s+name: "([^"]+)"/gm)].map((m) => m[1]);
const nomesLib = [...lib.matchAll(/^\s+"([^"]+)",/gm)].map((m) => m[1]);

if (nomesDono.length !== 10) {
  falhas.push(`o dono tem ${nomesDono.length} causas — os 5 Hs e 5 Ts são DEZ. Ou a leitura cegou, ou uma causa sumiu.`);
} else ok++;

if (JSON.stringify(nomesDono) !== JSON.stringify(nomesLib)) {
  const soDono = nomesDono.filter((n) => !nomesLib.includes(n));
  const soLib = nomesLib.filter((n) => !nomesDono.includes(n));
  falhas.push(
    `${LIB} divergiu do dono.\n` +
    (soDono.length ? `    só no dono: ${soDono.join(", ")}\n` : "") +
    (soLib.length ? `    só na lib:  ${soLib.join(", ")}\n` : "") +
    (!soDono.length && !soLib.length ? `    mesmos nomes, ORDEM diferente — e a ordem é 5 Hs depois 5 Ts.\n` : "") +
    `    A lib é consumida pelo card da AESP em Ritmos de Parada: divergir ali é ensinar uma lista\n` +
    `    incompleta no meio de uma parada, que foi o defeito que ela existe para corrigir.`
  );
} else ok++;

// Cada causa precisa de intervenção ESPECÍFICA — o achado do Pré-requisito B.
for (const nome of nomesDono) {
  const i = dono.indexOf(`name: "${nome}"`);
  const bloco = dono.slice(i, i + 1200);
  const m = bloco.match(/intervention: "([^"]+)"/);
  if (!m) {
    falhas.push(`${nome}: sem campo \`intervention\` — causa sem conduta associada.`);
    continue;
  }
  // Genérica = só diz "tratar a causa" sem dizer COMO.
  if (/^(tratar|corrigir|identificar)[^,]{0,25}$/i.test(m[1].trim())) {
    falhas.push(`${nome}: intervenção genérica («${m[1]}») — sem o que FAZER, a causa vira lembrete.`);
  } else ok++;
}


// ── TERCEIRO SÍTIO: protocol.json, que é a superfície de AÇÃO ──────────────
//
// A trava nascera conferindo lib × dono e não sabia deste. O `protocol.json`
// alimenta o painel de causas ABERTO DURANTE A PARADA, e trazia a sua própria
// lista das dez com condutas genéricas — "Considerar correção específica
// conforme a suspeita" — enquanto o módulo de consulta tinha sítio anatômico,
// comprimento de agulha e limiar de pH.
//
// R-48 na inversão mais grave da auditoria: o específico na CONSULTA, o
// genérico na AÇÃO. Agora o reducer monta as ações a partir de ACOES_NA_PARADA,
// e esta conferência garante que os ids continuem casando — um `protocolId`
// digitado errado faria a causa cair silenciosamente no `?? cause.actions`
// genérico, e nada denunciaria.
{
  const protocolo = JSON.parse(lerFonte(path.join(appDir, "protocol.json")));
  const idsProtocolo = (protocolo.reversibleCauses ?? []).map((c) => c.id).sort();
  const idsDono = [...dono.matchAll(/protocolId: "([^"]+)"/g)].map((m) => m[1]).sort();

  if (idsProtocolo.length !== 10) {
    falhas.push(`protocol.json tem ${idsProtocolo.length} causas reversíveis — são DEZ.`);
  } else ok++;

  if (JSON.stringify(idsProtocolo) !== JSON.stringify(idsDono)) {
    const faltando = idsProtocolo.filter((id) => !idsDono.includes(id));
    const sobrando = idsDono.filter((id) => !idsProtocolo.includes(id));
    falhas.push(
      `os ids de protocol.json e do dono não casam.` +
      (faltando.length ? ` SEM conduta específica (cairiam no texto genérico): ${faltando.join(", ")}.` : "") +
      (sobrando.length ? ` No dono e não no protocolo: ${sobrando.join(", ")}.` : "")
    );
  } else ok++;

  // E o mapa tem de estar EXPORTADO e completo: sem ele, o reducer volta ao
  // `?? cause.actions` e as dez condutas viram genéricas de novo, em silêncio.
  if (!/export const ACOES_NA_PARADA/.test(dono)) {
    falhas.push(`${DONO}: ACOES_NA_PARADA não é exportado — o painel da parada volta ao texto genérico do JSON.`);
  } else ok++;

  const reducer = lerFonte(path.join(appDir, "acls/reducer.ts"));
  if (!/ACOES_NA_PARADA\[cause\.id\]/.test(reducer)) {
    falhas.push(
      "acls/reducer.ts deixou de consumir ACOES_NA_PARADA — o painel aberto durante a parada " +
      "volta a mostrar \"Considerar correção específica conforme a suspeita\" nas dez causas."
    );
  } else ok++;
}

console.log(`\nCausas reversíveis — a lib e o dono, sincronizados\n`);
console.log(`   ${nomesDono.length} causas no dono · ${nomesLib.length} na lib\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — dez causas, mesma ordem nos dois, cada uma com conduta própria\n`);
