#!/usr/bin/env node
/**
 * Trava de arquitetura: o aplicativo não pode voltar a acoplar IA.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A decisão que esta trava protege
 *
 * Nesta fase o app é determinístico: regras codificadas, máquinas de estado,
 * cálculos, temporizadores e conteúdo médico previamente aprovado. Nada de RAG,
 * banco vetorial, tutor clínico, chat médico ou resposta generativa durante o
 * atendimento.
 *
 * Havia um assistente de IA (OpenAI, via edge function) importado pela tela ativa
 * do PCR, desligado por `EXPO_PUBLIC_ACLS_AI_ENABLED=false`. Desligado por flag
 * ainda é acoplado: continua importado, continua mantido, e volta a funcionar com
 * uma variável de ambiente. Foi removido — e esta trava existe para que a remoção
 * não seja desfeita sem decisão explícita.
 *
 * ## O que ela NÃO impede
 *
 * Não impede uma integração futura. O plano prevê um "Plano B — tutor clínico
 * futuro", e quando ele for decidido, este arquivo é o lugar de registrar a
 * mudança: some daqui o termo autorizado, com a justificativa. O objetivo é que
 * ninguém religue IA por acidente, não que ninguém possa religar nunca.
 *
 * Uso: node scripts/valida-sem-ia.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");

/** Termos que denunciam serviço de IA acoplado ao aplicativo. */
const PROIBIDOS = [
  { termo: /\bopenai\b/i, motivo: "provedor de IA" },
  { termo: /api\.openai\.com/i, motivo: "chamada direta à API da OpenAI" },
  { termo: /\banthropic\b/i, motivo: "provedor de IA" },
  { termo: /\bdeepseek\b/i, motivo: "provedor de IA" },
  { termo: /generativelanguage|\bgemini\b/i, motivo: "provedor de IA" },
  { termo: /\bacls-ai\b|AclsAiInsight|requestAclsAiInsight|isAclsAiEnabled/i, motivo: "assistente de IA do ACLS" },
  { termo: /\bembeddings?\b/i, motivo: "banco vetorial / RAG" },
  { termo: /\bpinecone\b|\bweaviate\b|\bqdrant\b|\bchromadb\b/i, motivo: "banco vetorial" },
  { termo: /\blangchain\b|@ai-sdk\//i, motivo: "orquestração de IA" },
];

/**
 * Fora da varredura, e por quê:
 *
 *  - `scripts/` e `auditoria/`: são as ferramentas de auditoria e os relatórios.
 *    Eles CITAM os termos justamente para vigiá-los.
 *  - `node_modules`, `dist`, `.expo`: não são código do app.
 *
 * ── ⚠️⚠️ `supabase/functions/` — AUTORIZADO EM 2026-08-30, COM MOTIVO ─────────
 *
 * ⚠️ Esta trava protege o **aplicativo** de voltar a acoplar IA. `acls-assistant`
 * ⛔ **não é o aplicativo**: é uma Edge Function que roda no servidor, que já
 * estava **implantada** (versão 6, ACTIVE) antes desta auditoria, e cujo fonte
 * ⛔ não existia no repositório.
 *
 * ⚠️⚠️ **E ela ⛔ não tem consumidor no cliente.** ⛔ Nenhum `functions.invoke
 * ("acls-assistant")` existe no app — a única invocação do cliente é
 * `create-user`. ⛔ O acoplamento que a trava proíbe **continua ⛔ não existindo**.
 *
 * ⚠️ O fonte entrou no repositório por **exigência da auditoria**: ela estava
 * aberta ao mundo, consumindo a chave da OpenAI sem autenticação, e ⛔ não dava
 * para corrigir o que ⛔ não estava versionado.
 *
 * ⛔⛔ ISTO ⛔ NÃO AUTORIZA religar IA no app. Se um dia o cliente passar a chamar
 * a função, o acoplamento volta a ser do aplicativo — e aí a decisão é outra, e
 * é do autor.
 */
const IGNORAR = /node_modules|\.expo|dist|^scripts\/|^auditoria\/|\.git|^supabase\/functions\//;

function listar(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, e.name);
    const rel = path.relative(appDir, completo);
    if (IGNORAR.test(rel)) continue;
    if (e.isDirectory()) listar(completo, acc);
    else if (/\.(ts|tsx|js|jsx|json)$/.test(e.name)) acc.push(rel);
  }
  return acc;
}

const violacoes = [];
for (const rel of listar(appDir)) {
  const conteudo = fs.readFileSync(path.join(appDir, rel), "utf8");
  conteudo.split("\n").forEach((linha, i) => {
    const limpa = linha.trim();
    if (limpa.startsWith("//") || limpa.startsWith("*")) return;
    for (const { termo, motivo } of PROIBIDOS) {
      if (termo.test(linha)) {
        violacoes.push({ arquivo: rel, linha: i + 1, motivo, trecho: limpa.slice(0, 120) });
      }
    }
  });
}

if (violacoes.length) {
  console.error(`\n❌ ${violacoes.length} acoplamento(s) de IA no aplicativo:\n`);
  for (const v of violacoes) {
    console.error(`  ${v.arquivo}:${v.linha} — ${v.motivo}`);
    console.error(`     ${v.trecho}`);
  }
  console.error(
    "\nO app desta fase é determinístico por decisão de arquitetura. Se a integração\n" +
      "passou a ser desejada, a autorização entra em scripts/valida-sem-ia.cjs junto\n" +
      "com o motivo — não se remove a trava em silêncio.\n"
  );
  process.exit(1);
}

console.log("\n✅ Nenhum serviço de IA acoplado ao aplicativo.\n");
