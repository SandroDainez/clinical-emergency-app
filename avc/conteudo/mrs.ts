/**
 * mRS — a escala de Rankin modificada, como INSTRUMENTO NEUTRO e reutilizável.
 *
 * ⚠️⚠️ A CADEIA DE FONTES TEM DOIS ELOS, COM PAPÉIS DIFERENTES (decisão do autor,
 * 2026-08-29), e ⛔ nenhum deles prova o que é do outro:
 *
 *   · **F-26 · Cincura C, Pontes-Neto OM, Neville IS, et al.** *Validation of the
 *     NIHSS, Modified Rankin Scale and Barthel Index in Brazil: The Role of
 *     Cultural Adaptation and Structured Interviewing.* Cerebrovasc Dis.
 *     2009;27(2):119–122 · DOI 10.1159/000177918 — sustenta que existe versão
 *     **brasileira culturalmente adaptada**, e que a **entrevista estruturada**
 *     melhora a concordância entre avaliadores;
 *   · **F-27 · Diretrizes da SBACV para doença cerebrovascular extracraniana,
 *     Quadro 4** — fornece os **descritores 0–6 em português**.
 *
 * ⛔⛔ ⛔ NÃO ATRIBUIR OS DESCRITORES A CINCURA. Eles ⛔ não são apresentados naquele
 * artigo nesta forma, e pendurá-los lá seria inventar procedência — exatamente o
 * que **E-30** existe para impedir. A rastreabilidade é **por afirmação**.
 *
 * ⚠️ ⛔ Nenhum descritor foi escrito de memória (**E-31**): o texto veio do Quadro 4,
 * repassado pelo autor, e está em `protocols/fontes-verbatim/mrs-br.md` com a
 * conferência clínica declarada como pendente.
 */

export type GrauMrs = {
  readonly grau: string;
  /** ⚠️ Texto do Quadro 4 (F-27). ⛔ Não parafrasear, ⛔ não "melhorar". */
  readonly descritor: string;
};

/**
 * ⚠️⚠️ O ESPANHOL DOS DESCRITORES — decisão do autor, 2026-08-29, que **fechou
 * D-116** e corrigiu a minha leitura de E-31.
 *
 * Eu havia deixado os descritores em português na tela espanhola, argumentando
 * que traduzi-los produziria "uma escala de Rankin em espanhol sem fonte". O
 * autor desfez o argumento:
 *
 * > *"Isso ⛔ não viola E-31: traduzir fielmente uma fonte ⛔ não é inventar
 * > conteúdo clínico. A fonte continua sendo o Quadro 4 brasileiro; o texto
 * > espanhol é apenas uma **tradução de apresentação**, com rastreabilidade para
 * > a fonte original."*
 *
 * ⚠️ A distinção que isto fixa, e que vale para o app inteiro: **E-31 proíbe
 * escrever conteúdo clínico sem fonte** — ⛔ não proíbe exibir, noutro idioma, o
 * conteúdo que TEM fonte. O que seria proibido é apresentar a versão espanhola
 * como **fonte independente**, ou traduzir o **verbatim auditável** (§6.14), que
 * continua em inglês em `protocols/fontes-verbatim/`.
 *
 * ⛔ A fonte clínica dos graus continua sendo **F-27** (SBACV, Quadro 4), em
 * português, e ⛔ nenhuma versão espanhola do mRS foi consultada ou citada.
 * Registrado em `protocols/fontes-verbatim/mrs-br.md`.
 *
 * ⚠️ Vive AQUI, e ⛔ não solto no dicionário, porque o rótulo da tela é **montado**
 * (`grau · descritor`): a string final ⛔ nunca existe como literal, e por isso
 * ⛔ nenhuma varredura de texto poderia alcançá-la. Quem a alcança é
 * `test:i18n-opcoes`, que carrega o módulo e enumera as opções de verdade.
 */

/**
 * A ESCALA INTEIRA — 0 a 6, como a fonte a publica.
 *
 * ⚠️ Ela é **neutra**: mede função, e ⛔ não sabe se está sendo usada antes ou
 * depois de um AVC. Quem decide qual recorte usar é o campo que a consome.
 */
export const GRAUS_MRS: readonly GrauMrs[] = [
  { grau: "0", descritor: "assintomático" },
  { grau: "1", descritor: "sem déficit significativo" },
  { grau: "2", descritor: "leve incapacidade" },
  { grau: "3", descritor: "incapacidade moderada" },
  { grau: "4", descritor: "moderada a grave" },
  { grau: "5", descritor: "grave" },
  { grau: "6", descritor: "óbito" },
] as const;

/**
 * OS GRAUS QUE O **mRS PRÉVIO** PODE ASSUMIR — ⚠️ 0 a 5, e ⛔ nunca 6.
 *
 * ⚠️⚠️ A ESCALA É 0–6; O CAMPO É 0–5, e a diferença ⛔ não é corte arbitrário: o
 * campo pergunta a funcionalidade **ANTES deste AVC**, e ⛔ não existe função
 * basal "óbito" em quem está sendo avaliado agora. Filtrar aqui — e ⛔ não na
 * escala — é o que mantém o instrumento reutilizável e fiel à fonte.
 */
export const GRAUS_MRS_PREVIO: readonly GrauMrs[] = GRAUS_MRS.filter((g) => g.grau !== "6");

/** ⚠️ O rótulo que vai à tela: o grau E o descritor, ⛔ nunca o número sozinho. */
export function rotuloDoGrau(g: GrauMrs): string {
  return `${g.grau} · ${g.descritor}`;
}
