#!/usr/bin/env node
/**
 * MEDIÇÃO — não é trava. Não reprova nada, não corrige nada, sem código de saída.
 *
 * ⚠️ O DEFEITO QUE ELE PROCURA, e ele nasceu dentro do próprio motor desta
 * auditoria (2026-08-23):
 *
 *   O `restante` engolia o cálcio ionizado e devolvia "Leve a moderada".
 *   **Classificar por QUEDA é classificar** — com a agravante de parecer
 *   conclusão e ser omissão.
 *
 * É a irmã clínica do "verde por ausência" (R-108): lá, um instrumento que não
 * rodava dizia "está tudo bem"; aqui, um caminho que não sabe classificar **diz o
 * grau mais brando**.
 *
 * ⚠️ E REPARE O VIÉS: cair no último degrau erra SEMPRE para o lado
 * tranquilizador. Um app de emergência que erra para "leve" na dúvida é o oposto
 * do que ele existe para ser.
 *
 * ── O QUE ELE CONTA, dito antes do número (R-101) ──────────────────────────
 *
 *   1. ramo TERMINAL de ternário (o `:` que responde quando nada bateu)
 *   2. `else` FINAL, sem `if` — o último da cadeia
 *   3. `default:` de switch que CONCLUI em vez de recusar
 *   4. `??` / `||` completando com grau brando
 *   5. valor-padrão de parâmetro que representa ESTADO CLÍNICO
 *
 * ⚠️ E O QUE ELE NÃO MARCA, de propósito: o MEIO da escada. "GCS 15 — normal" e
 * "RASS −1 a −2 — sedação leve" são faixas MEDIDAS, não quedas. A primeira
 * versão os acusou, e marcar escada como defeito é o ruído que faz alguém
 * desligar o instrumento.
 *
 * ⚠️ CONTAGEM É PISO: o vocabulário de "grau brando" é digitado aqui e não cobre
 * o que ninguém escreveu ainda. Achado por regex é candidato, não veredito — a
 * lista existe para ser lida por gente.
 */
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");

/** Palavras que representam o GRAU MAIS BRANDO — o destino do defeito. */
const BRANDO = /"(?:[^"]*\b(?:leve|moderad[ao]|estável|estavel|baixo risco|baixa|normal|sem gravidade|não grave|nao grave|verde|ok|nenhum[ao]?)\b[^"]*)"/i;
/** Palavras que representam CLASSIFICAÇÃO ou CONDUTA. */
const CLINICO = /\b(gravidade|severidade|classifica|rotulo|rótulo|tone|risco|degrau|conduta|grau|prioridade|triagem)\b/i;

function arquivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", ".expo", "scripts", "e2e", "auditoria"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(p, acc);
    else if (/\.tsx?$/.test(e.name) && !/\.d\.ts$/.test(e.name)) acc.push(p);
  }
  return acc;
}
const TODOS = arquivos(RAIZ);
const achados = [];
const add = (arq, linha, especie, trecho) =>
  achados.push({ arq: path.relative(RAIZ, arq), linha, especie, trecho: trecho.trim().slice(0, 110) });

let elseFinais = 0, defaults = 0, terminais = 0, padroes = 0, coalesc = 0;
for (const arq of TODOS) {
  const linhas = fs.readFileSync(arq, "utf8").split("\n");
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^\s*(\/\/|\*|\/\*)/.test(l)) continue;

    // ⚠️ O ALVO É O FIM DA CADEIA, NÃO O MEIO.
    //
    // A primeira versão marcava QUALQUER ternário com palavra branda, e devolveu
    // "GCS 15 — normal" e "RASS −1 a −2 — sedação leve": degraus LEGÍTIMOS de
    // escada, onde o brando é uma faixa medida e não uma queda. Marcar escada
    // como defeito é o ruído que faz alguém desligar o instrumento.
    //
    // O que interessa é o RAMO TERMINAL: aquele que responde quando NENHUMA
    // condição bateu.

    // 1. ramo final de ternário: começa com `:` e NÃO tem outro `?` depois
    if (/^\s*:\s*/.test(l) && !/\?/.test(l) && BRANDO.test(l) && CLINICO.test(linhas.slice(Math.max(0, i - 6), i + 1).join(" "))) {
      terminais++; add(arq, i + 1, "ramo TERMINAL de ternário", l); continue;
    }
    // 2. `else` sem `if` — o último da cadeia
    if (/\belse\b(?!\s+if)/.test(l)) {
      const janela = linhas.slice(i, i + 4).join(" ");
      if (BRANDO.test(janela) && CLINICO.test(linhas.slice(Math.max(0, i - 6), i + 4).join(" "))) {
        elseFinais++; add(arq, i + 1, "else FINAL (sem if)", janela); continue;
      }
    }
    // 3. `default:` que CONCLUI em vez de recusar
    if (/^\s*default\s*:/.test(l)) {
      const janela = linhas.slice(i, i + 3).join(" ");
      if (BRANDO.test(janela)) { defaults++; add(arq, i + 1, "default de switch que CONCLUI", janela); continue; }
    }
    // 4. `??` / `||` completando com grau brando — a queda escrita em uma linha
    if (/(?:\?\?|\|\|)\s*"(?:leve|moderad[ao]|normal|estável|estavel|baixo|verde|green|ok)"/i.test(l)) {
      coalesc++; add(arq, i + 1, "?? / || completando com grau brando", l); continue;
    }
    // 5. parâmetro com padrão que representa ESTADO CLÍNICO
    if (/\w+\s*(?::\s*[\w"|\s]+)?=\s*"(?:leve|moderada|estavel|estável|normal|baixo)"/i.test(l) && CLINICO.test(l)) {
      padroes++; add(arq, i + 1, "padrão de parâmetro clínico", l); continue;
    }
  }
}

console.log(`\nUNIVERSO (R-101): ${TODOS.length} arquivos .ts/.tsx varridos`);
console.log(`  vocabulário de "grau brando": ${String(BRANDO).length} caracteres de regex, DIGITADO — a contagem é PISO`);
console.log(`\nACHADOS: ${achados.length}  ·  ramo terminal ${terminais} · else final ${elseFinais} · default ${defaults} · ??/|| ${coalesc} · padrão de parâmetro ${padroes}\n`);
const porArquivo = new Map();
for (const a of achados) porArquivo.set(a.arq, [...(porArquivo.get(a.arq) ?? []), a]);
for (const [arq, lista] of [...porArquivo].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`── ${arq} (${lista.length})`);
  for (const a of lista) console.log(`   :${String(a.linha).padEnd(5)} [${a.especie}] ${a.trecho}`);
}
console.log(`\n⚠️ MEDIÇÃO: sem código de saída. Achado por regex é CANDIDATO, não veredito.\n`);
