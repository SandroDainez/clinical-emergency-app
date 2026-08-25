/**
 * LBBB NOVO — POR QUE NÃO É EQUIVALENTE AUTOMÁTICO DE STEMI (2025)
 *
 * ⚠️ ISTO CORRIGE UMA REGRA ANTIGA. As diretrizes STEMI de 2004/2013 tratavam
 * BRE novo/presumivelmente novo com sintomas isquêmicos como equivalente de
 * STEMI, classe I de reperfusão emergente. A diretriz-fonte deste módulo NÃO
 * MANTÉM ISSO.
 *
 * ── A CITAÇÃO, LITERAL ──────────────────────────────────────────────────────
 *
 * Nota de rodapé da Tabela 3 (critérios ECG), ACC/AHA/ACEP/NAEMSP/SCAI 2025
 * (Circulation, DOI 10.1161/CIR.0000000000001309), lida por inteiro nesta
 * sessão a partir do PDF oficial (confirmação por busca literal no texto
 * completo, 2026-08-24):
 *
 * "New or presumably new LBBB at presentation occurs infrequently and should
 * not be considered diagnostic of AMI in isolation; clinical correlation is
 * required. A new LBBB in an asymptomatic patient does not constitute a
 * STEMI equivalent."
 *
 * ── E OS CRITÉRIOS DE SGARBOSSA/SGARBOSSA MODIFICADO? ───────────────────────
 *
 * ⚠️ BUSCA LITERAL NO TEXTO COMPLETO DA DIRETRIZ (grep por "sgarbossa",
 * "concordant", "discordant" nas ~7.684 linhas do PDF) NÃO ENCONTROU NENHUMA
 * OCORRÊNCIA. A diretriz-fonte deste módulo não adota, não cita e não graduta
 * os critérios de Sgarbossa (Sgarbossa et al., NEJM 1996) nem os critérios
 * modificados de Smith (Smith et al., Ann Emerg Med 2012) como ferramenta
 * diagnóstica recomendada.
 *
 * Isso NÃO significa que os critérios sejam inválidos — têm literatura própria
 * e uso difundido na prática de emergência/cardiologia intervencionista. Mas,
 * pelo pedido explícito do autor ("se a diretriz não suportar uma consequência
 * terapêutica explícita, não codificar como automática"), eles entram aqui
 * como APOIO AO RACIOCÍNIO — nunca como gatilho automático de reperfusão.
 *
 * ── A CONDUTA QUE O APP DE FATO CODIFICA ────────────────────────────────────
 *
 * LBBB novo/presumivelmente novo isolado, sem sintomas ativos: NÃO ativa a via
 * de reperfusão emergente. LBBB novo + dor isquêmica ativa e/ou instabilidade
 * hemodinâmica: correlação clínica ativa — decisão de acionar hemodinâmica é
 * do médico, apoiada (não decidida) pelos critérios de Sgarbossa quando
 * disponíveis, e NUNCA um "sim" automático de fibrinólise só pelo BRE.
 */
export const LBBB_NAO_EQUIVALENTE_ISOLADO =
  "⚠️ LBBB NOVO NÃO É EQUIVALENTE AUTOMÁTICO DE STEMI (correção da diretriz 2025 em relação a versões antigas). Ocorre pouco e não deve ser considerado diagnóstico de IAM isoladamente — exige correlação clínica. Em paciente ASSINTOMÁTICO, um LBBB novo NÃO constitui equivalente de STEMI.";

/**
 * A CITAÇÃO LITERAL, RENDERIZADA — não só em comentário.
 *
 * Nota de rodapé da Tabela 3, ACC/AHA/ACEP/NAEMSP/SCAI 2025, lida por inteiro
 * nesta sessão a partir do PDF oficial (DOI 10.1161/CIR.0000000000001309).
 */
export const LBBB_CITACAO_LITERAL_2025 =
  '⚠️ FONTE — nota de rodapé da Tabela 3 (ACC/AHA/ACEP/NAEMSP/SCAI 2025): "New or presumably new LBBB at presentation occurs infrequently and should not be considered diagnostic of AMI in isolation; clinical correlation is required. A new LBBB in an asymptomatic patient does not constitute a STEMI equivalent."';

/** A ausência de Sgarbossa no texto, declarada onde o médico vê — não só em comentário. */
export const SGARBOSSA_AUSENTE_NA_FONTE_2025 =
  '⚠️ BUSCA LITERAL no texto completo da diretriz 2025 (~7.684 linhas do PDF oficial, por "sgarbossa"/"concordant"/"discordant") NÃO ENCONTROU NENHUMA OCORRÊNCIA. Sgarbossa e Sgarbossa modificado vêm de literatura complementar (Sgarbossa 1996; Smith 2012), não desta diretriz.';

export const LBBB_SGARBOSSA_APOIO =
  "SGARBOSSA / SGARBOSSA MODIFICADO — APOIO, NÃO REGRA DESTA DIRETRIZ. Os critérios de Sgarbossa (concordância de ST ≥1 mm; infra em V1–V3 ≥1 mm; discordância excessiva ≥5 mm) e os modificados de Smith (razão ST/S ≤ −0,25) NÃO constam no texto da ACC/AHA/ACEP/NAEMSP/SCAI 2025 — vêm de literatura complementar (Sgarbossa 1996; Smith 2012). Use como apoio ao julgamento clínico do BRE novo sintomático, nunca como critério que decide sozinho a fibrinólise.";

export const LBBB_CORRELACAO_ATIVA =
  "LBBB NOVO + DOR ISQUÊMICA ATIVA/INSTABILIDADE — correlação clínica positiva. A conduta segue pela via de reperfusão com a mesma urgência do STEMI, por decisão clínica apoiada em Sgarbossa quando disponível — não porque o BRE, isolado, seja equivalente.";

export const LBBB_ISOLADO_SEM_CORRELACAO =
  "LBBB NOVO ISOLADO, SEM DOR ATIVA NEM INSTABILIDADE — não ative a via de reperfusão emergente por este achado isolado. Siga a via de troponina seriada/ECG seriado, como SCA sem supra, e reclassifique se surgir correlação clínica.";
