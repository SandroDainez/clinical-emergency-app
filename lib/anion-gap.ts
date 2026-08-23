/**
 * O ÂNION GAP — e por que ele saiu do verde.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DEFEITO (achado em 2026-08-23, varredura de conclusão por queda)
 *
 * A interpretação era um ternário de dois ramos:
 *
 *   agRef > 12 ? "AG ELEVADO" : { tone: "green", label: "Ânion gap normal" }
 *
 * **Tudo que não era `> 12` virava "normal", em VERDE** — e verde é conclusão:
 * diz "pode seguir". Caíam ali dois casos que não são normais:
 *
 *   1. **O AG BAIXO**, que tem causas próprias (hipoalbuminemia, paraproteína do
 *      mieloma, intoxicação por lítio ou brometo).
 *   2. ⚠️ **O AG SEM ALBUMINA** — e este é o mais consequente.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ O AG PRECISA DA ALBUMINA PELO MESMO MOTIVO QUE O CÁLCIO
 *
 * A albumina é o principal ânion não medido. Quando ela cai, **o AG cai junto — e
 * mascara uma acidose de AG elevado que existe**:
 *
 *   albumina 2,0 · AG medido 12  →  o app dizia "normal", em verde
 *   AG corrigido ≈ 17            →  acidose de ânion gap ELEVADO
 *
 * É o mesmo defeito do cálcio-albumina, **no exame ao lado** — e com a ironia de
 * que o app já pede a albumina desde a rodada passada, para o cálcio.
 *
 * Sem albumina, a resposta honesta não é "normal": é **"não é possível
 * interpretar o AG sem a albumina"** (R-111 — ausência não conclui).
 */
export type ProcedenciaDoAG = { fonte: string | null; forca: "pendente"; alvo: string };

/**
 * ⚠️ FATOR HERDADO, SEM VERBATIM. Ele JÁ ESTAVA no código (`ag + 2.5 * (4 - alb)`)
 * e continua exatamente o mesmo — o que mudou é passar a declarar que ninguém
 * conferiu a fonte dele.
 */
export const FATOR_ALBUMINA = {
  valor: 2.5,
  porGDlAbaixoDe: 4,
  procedencia: {
    fonte: null,
    forca: "pendente",
    alvo:
      "fator de correção do AG pela albumina (≈ 2,5 mEq/L por 1 g/dL abaixo de 4) — alvo: Figge et al., verbatim a transcrever em protocols/fontes-verbatim/. ⚠️ O número já estava no código; o que faltava era dizer que ele não tem fonte conferida",
  } as ProcedenciaDoAG,
};

/**
 * ⚠️ CORTES HERDADOS, SEM FONTE — e a faixa 8–12 já era impressa pelo próprio app
 * na linha de referência ("Normal 8–12 (albumina 4 g/dL)"). Não são escolha
 * minha: são o que o app já dizia, agora ditos onde a auditoria olha.
 *
 * A pergunta de qual corte adotar, e com que fonte, está em
 * auditoria/PERGUNTAS-AO-AUTOR-2026-08-23.md.
 */
export const CORTE_AG = {
  elevadoAcimaDe: 12,
  baixoAbaixoDe: 8,
  procedencia: {
    fonte: null,
    forca: "pendente",
    alvo:
      "cortes de AG elevado (> 12) e baixo (< 8) — herdados da linha de referência do próprio app, sem fonte conferida. Alvo: veredito do autor sobre quais cortes adota e com que fonte",
  } as ProcedenciaDoAG,
};

export const AG_SEM_ALBUMINA =
  "⚠️ NÃO É POSSÍVEL INTERPRETAR O ÂNION GAP SEM A ALBUMINA. Ela é o principal ânion não medido: quando cai, o AG cai junto e MASCARA uma acidose de AG elevado que existe. Albumina 2,0 com AG 12 corresponde a um AG corrigido de ~17.";

export const AG_SEM_ALBUMINA_PORQUE =
  "Informe a albumina para que o AG seja corrigido e interpretado. Sem ela, o valor medido isolado não separa «não há acidose de AG elevado» de «há, e a albumina baixa a escondeu».";

export const AG_BAIXO =
  "ÂNION GAP BAIXO — não é «normal». Procure hipoalbuminemia (a causa mais comum), paraproteína do mieloma múltiplo e intoxicação por lítio ou brometo.";

export const AG_ELEVADO_CAUSAS =
  "MUDPILES: Metanol/Metformina, Uremia, Diabética (CAD), Propilenoglicol/Paracetaldeído, Isoniazida, Lactato, Etilenoglicol, Salicilatos.";

export const AG_NA_FAIXA =
  "Ânion gap corrigido dentro da faixa de referência. Se há acidose, considere a hiperclorêmica (HARDUPS): HCO₃ perdido (diarreia), ATR, reposição de NaCl, fístula pancreática, urostomia, pós-hipocápnia, espironolactona.";
