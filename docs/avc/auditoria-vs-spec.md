# Auditoria do AVC existente contra a especificação (PDF v1.1) · índice

> ⚠️ **Arquivo gerado** por `scripts/gerar-indice-auditoria.cjs` — ⛔ não edite à mão.
> Cada seção é **um arquivo** em `docs/avc/auditoria/`, **append-only**: uma rodada nova CRIA um arquivo;
> ⛔ nenhum script reescreve arquivo de seção (`scripts/prova-auditoria-append-only.cjs`, no `test:all`).
> Referências antigas a "`auditoria-vs-spec.md` §7.x" apontam para o arquivo `7.xx-*.md` correspondente.

**Seções:** 31 · **linhas:** 2417

- [Auditoria do AVC existente contra a especificação (PDF v1.1)](auditoria/0-introducao.md)
- [1. Achados ordenados por gravidade](auditoria/1-achados.md)
- [2. Requisitos (RQ-*) · classificação com evidência](auditoria/2-requisitos.md)
- [3. Casos de aceite A01–A18 · há teste? (asserção lida, não o título)](auditoria/3-casos-de-aceite.md)
- [4. Errata · Prabhakaran S et al., *Stroke* 2026;57(8):e461–e467, doi 10.1161/STR.0000000000000530](auditoria/4-errata.md)
- [5. Os 26 commits de 12/09 (`2cc88de..52aa4e2`) · qual spec seguiram e onde divergem do PDF](auditoria/5-commits-de-12-09.md)
- [6. O que não foi verificado](auditoria/6-nao-verificado.md)
- [7. Fechamentos de 2026-09-13 · AC-01 e AC-03](auditoria/7.00-fechamentos-2026-09-13.md)
  - [7.1 · AC-01 — NIHSS "não testável" · commit `ec8f107`](auditoria/7.01-ac-01-nihss-nao-testavel.md)
  - [7.2 · Regras a jusante que consomem o NIHSS](auditoria/7.02-regras-a-jusante-do-nihss.md)
  - [7.3 · AC-03 — portão de população · commit `2e28bd8`](auditoria/7.03-ac-03-portao-de-populacao.md)
  - [7.4 · Suíte e envio](auditoria/7.04-suite-e-envio.md)
  - [7.5 · Entrega 1 · AC-29, D-PEND-13 (AC-26) e D-PEND-14 (AC-28) · commit `207e4be`](auditoria/7.05-entrega-1-ac-29-d-pend-13-14.md)
  - [7.6 · Entrega 2 · AC-02 persistência local-first (D-PEND-02, D-PEND-03) · commit `fa01339`](auditoria/7.06-entrega-2-persistencia.md)
  - [7.7 · Decisões do autor de 2026-09-13 (3ª rodada)](auditoria/7.07-decisoes-rodada-3.md)
  - [7.8 · 3ª rodada de 2026-09-13 · pacotes de revisão médica e correções sem decisão clínica](auditoria/7.08-rodada-3.md)
  - [7.9 · 4ª rodada de 2026-09-13 · achados por leitura, decisões D-PEND-18/19/20 e pacote AC-43 ampliado](auditoria/7.09-rodada-4.md)
  - [7.10 · Limpeza visual e a regressão que ela expôs (2026-09-13) · commits `6ffe520` (processo), `1da11b9` (interface) e `60d580d` («Limpar» com afordância)](auditoria/7.10-limpeza-visual.md)
  - [7.11 · 6ª rodada de 2026-09-13 · D-PEND-21 (opção neutra) e fila consolidada · commits `4447e15` (decisão, só `docs/`) e `4e05527` (código)](auditoria/7.11-rodada-6.md)
  - [7.12 · 7ª rodada de 2026-09-13 · AC-59, D-PEND-22/23/24 e achados de interface · commits `95028a5` (decisões, só `docs/`) e `c7a1956` (código)](auditoria/7.12-rodada-7.md)
  - [7.13 · 8ª rodada de 2026-09-13 · HSA sem atalho, procedência fora do card, card de dose e D-PEND-25 · commits `583dde3` (decisão, só `docs/`) e `7c59d35` (código)](auditoria/7.13-rodada-8.md)
  - [7.14 · 9ª rodada de 2026-09-13 · D-PEND-26 («Limpar» auditado) e AC-64 (§4 da diretriz de HSA 2023) · commits `5705840` (decisão, só `docs/`) e `68da674` (código)](auditoria/7.14-rodada-9.md)
  - [7.15 · 10ª rodada de 2026-09-13 · D-PEND-27, «Paciente piorou» global (AC-10, A11) e transferência/telestroke (T07, A12, A08) · commits `d1edb50` e `f7993d7` (só `docs/`) e `e8fed38` (código)](auditoria/7.15-rodada-10.md)
  - [7.16 · 11ª rodada de 2026-09-13 · «Preciso de ajuda» (fecha AC-10), AC-67, AC-68, AC-69, eixos reabertos e porta do e2e · commits `c2f0c23` (decisões, só `docs/`) e `70149fc` (código)](auditoria/7.16-rodada-11.md)
  - [7.17 · 12ª rodada de 2026-09-13 · auditoria append-only, AC-71, AC-72, AC-73, nome de exame e o contrato de navegação (C05) bloqueado · commits `b580cb8` (decisões), `844b852` (migração) e `bbbf109` (código)](auditoria/7.17-rodada-12.md)
  - [7.18 · 13ª rodada de 2026-09-13 · contrato de navegação com destinos indisponíveis (C05), via aérea como conduta externa (A09) e "Sem essa informação" por marco (A04) · commits `4c110d3` (decisão) e `16b92ac` (código)](auditoria/7.18-rodada-13.md)
  - [7.19 · 14ª rodada de 2026-09-13 · via aérea avançada (AC-76), NIHSS sob sedação como contexto (AC-77), marca no Glasgow (AC-78), A04 com os dois caminhos, leve ≠ incapacitante e plano até 48 h (T08, C08) · commits `1583de4` (decisão) e `3069500` (código)](auditoria/7.19-rodada-14.md)
  - [7.20 · 15ª rodada de 2026-09-13 · capturas antes da entrega, AC-81/82/83/85/88, defeitos das capturas da 14ª rodada e caminho hemorrágico (A07) · commits `24992c2` e `62ba140` (decisões), `ebc736f` (código), `fe95af0` e `e775061` (correções pelo `test:all`)](auditoria/7.20-rodada-15.md)
  - [7.21 · 16ª rodada de 2026-09-13 · regressão de procedência em todas as superfícies, AC-95/98/91/92 e textos · commits `df627c6` (decisões) e `e680ec0` (código)](auditoria/7.21-rodada-16.md)
  - [7.22 · 17ª rodada de 2026-09-14 · AC-106 a AC-111: vocabulário por transversal, pendente com nome, sem inglês na tela, motivos por terapia, nome único da HIC, declaração da equipe · commits `0f05e8f` (decisões), `db9290b` (código) e `91ea49d` (correção pelo `test:all`)](auditoria/7.22-rodada-17.md)
  - [7.23 · 18ª rodada de 2026-09-14 · documentos oficiais no lugar dos dossiês: bula Actilyse (I23-01), HSA 2023 integral, Linha de Cuidados em AVC (MS); errata e Table 8 · commits `8ced5ec` (decisões), `0b56ee4` (código), `636f3ba` (declaração da prova), `d48feaf` e `e8d8a56` (ajuste consciente do e2e da D-PEND-23)](auditoria/7.23-rodada-18.md)
