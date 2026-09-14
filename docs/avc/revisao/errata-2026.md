# Errata da AHA/ASA 2026 — conferência contra o repositório (AC-04)

**Estado:** conferida em 2026-09-14 (18ª rodada) · decisões clínicas em branco
**Fonte:** *Correction to: 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke*, *Stroke* 2026;57:e461–e467, DOI 10.1161/STR.0000000000000530 (PDF entregue pelo autor).
**Diretriz conferida:** PDF integral entregue pelo autor, *Stroke* 2026;57:e316–e436, baixado em 13/09/2026 ("current online version").

## 1 · Paginação

- **Na errata:** as páginas são as da publicação *ahead of print* (e2–e109).
- **No PDF integral e no repositório:** paginação impressa e316–e436.
- **Deslocamento conferido:** +315 páginas.
  - Table 8: errata e49–e52 → impressa e364–e367.
  - §5.2 Dysphagia: errata e74 → impressa e389.
- **A versão integral já traz as correções.** Nas quatro linhas conferidas visualmente, o PDF mostra o texto corrigido:
  - Table 8, título;
  - trauma "w/in 14 days";
  - "extensive regions of clear hypodensity";
  - §5.2, recs. 5 e 6.

## 2 · Item a item

Legenda:
- ✅ o repositório já está no texto corrigido.
- ⚠️ afeta o app e pede decisão ou conferência.
- — sem efeito no V1.

| # | errata (página ahead of print → impressa) | correção | efeito no repositório e no app |
|---|---|---|---|
| 1 | e2 → e317 | sumário: §1.1 | — |
| 2 | e5 → e320 | legenda do asterisco ("Limited generalizability in specific subpopulations") | ✅ a nota de generalização da trombectomia já usa o asterisco (`m.generalizacao`); verbatim no ⓘ desde a 17ª rodada |
| 3 | e12 → e327 | §2.2, lacuna sobre transporte alternativo | — |
| 4 | e17 → e332 | §2.5, texto de suporte da rec. 3 (MSU) | — |
| 5–6 | e27, e29 → e342, e344 | §3.2 referências; "TRACE-III" | — |
| 7–8 | e30 → e345 | §3.2 rec. 9, parágrafo de suporte e lacuna (seleção por TC sem contraste na janela tardia) | ⚠️ contexto para AC-20 e F-08; nenhuma recomendação mudou |
| 9 | e36 → e351 | §4.3, "TRUTH study" | — |
| 10 | e40 → e355 | **Table 6 (angioedema):** epinefrina 0,1% 0,3 mL passa de **subcutânea** a **intramuscular** | ⚠️ AC-12: angioedema não existe no app; nada a corrigir, registrar para quando existir |
| 11 | e41 → e356 | §4.6.1 rec. 14 (pediátrica), unidade 0,9 mg/kg | — (pediatria fora do V1) |
| 12 | e42 → e357 | §4.6.2 rec. 1: acrescenta "(max 90 mg)" à alteplase | ✅ `aha-asa-2026-avc-isquemico.md:134` e a ajuda do agente em `superficie-f.ts` já trazem "(max 90 mg)" |
| 13 | e44 → e359 | §4.6.3 rec. 2: passa a exigir **não elegível à trombectomia** e troca "may be reasonable" por "can be beneficial" | ✅ `aha-asa-2026-avc-isquemico.md:297` já traz o texto corrigido com COR 2a · B-R. ⚠️ A errata **não diz** que o COR mudou; o repositório registra 2a. A restrição "não elegível à EVT" liga-se ao **AC-52** (`nao_elegivel_a_evt` nunca satisfeito) |
| 14–15 | e44–e45 → e359–e360 | "TRACE-III" | — |
| 16 | e49 → e364 | **Table 8**, novo título: *Other Situations That May Arise in Thrombolysis Decision-Making* | ✅ o repositório já usa o título novo |
| 17 | e50 → e365 | **Table 8**, trauma maior não SNC: "within 14 days" (antes "between 14 days and 3 months") | ✅ o inventário do repositório já diz "<14 dias" (faixa relativa) |
| 18 | e52 → e367 | **Table 8**, faixa absoluta: "**extensive** regions of clear hypodensity" | ✅ o inventário já diz "hipodensidade extensa"; a definição fabricada foi retirada em 2026-09-09 |
| 19–20 | e53, e55 → e368, e370 | §4.7.2 rec. 2, referências e parágrafo de suporte | — |
| 21 | e63 → e378 | Figure 4: "ABCD2 ≥4" | — (AIT fora do V1) |
| 22 | e74 → e389 | **§5.2 rec. 3:** avaliação instrumental da deglutição ("instrumental swallowing assessment"), com endoscopia ou videofluoroscopia | ⚠️ ver §3 |
| 23 | e74 → e390 | **§5.2 rec. 5 (PES):** COR **2a → 2b**, população "não traqueostomizados", texto novo | — (PES não existe no app) |
| 24 | e74 → e390 | **§5.2 rec. 6 (PES após desmame):** texto novo, "is reasonable to facilitate readiness for decannulation" | — |
| 25–27 | e74–e75 → e389–e390 | §5.2 sinopse, suporte e lacunas | — |
| 28–30 | e85, e89, e90 | equipe AHA e declarações de conflito | — |
| 31–34 | e95–e109 | referências | — |

## 3 · Achado: a seção de disfagia existe (plano até 48 h)

- **Plano até 48 h:** a transversal `degluticao` diz "AHA 2026 § a localizar" desde a 14ª rodada.
- **O que a errata mostrou:** a seção é a **§5.2 Dysphagia**, p. e389–e390. A transcrição do repositório não a tem (busca `dysphag|disfagia|degluti`: 0).
- **Rec. 1 (p. e389):** COR 1, LOE C-EO. Triagem de deglutição à beira do leito antes de iniciar líquido ou alimento, para identificar risco de aspiração.
- **Procedência:** a fonte da tarefa passa a "AHA/ASA 2026 §5.2 rec. 1 (COR 1, C-EO), p. e389", no ⓘ.
  - ⛔ **Isto não valida o conteúdo da tarefa.** A trava de via oral e o vocabulário continuam decisão do autor (AC-88, AC-106), e o conteúdo segue pendente de validação.
  - O verbatim das recs. 1 a 6 não foi colado: fica para o autor.

## 4 · O que falta

- **Verbatim da §5.2:** o agente não reproduz texto longo protegido.
- **COR da §4.6.3 rec. 2:** a errata troca o verbo, mas não diz que a classe mudou. Conferir com o autor se 2a permanece.
