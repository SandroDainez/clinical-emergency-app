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
export type ProcedenciaDoAG = {
  fonte: string | null;
  /**
   * `pendente`            — ninguém conferiu ainda.
   * `decisao_do_autor`    — escolha datada e assinada.
   * `literatura_primaria` — publicação, ⚠️ NÃO guideline.
   * `pratica_aceita`      — número consagrado sem cutoff formal. É resposta
   *                         legítima, não pendência disfarçada (R-110).
   */
  forca: "pendente" | "decisao_do_autor" | "literatura_primaria" | "pratica_aceita";
  alvo: string;
  declaradoPor?: string;
};

/**
 * ⚠️ A FÓRMULA É DADO, NÃO SÓ CÓDIGO — decisão do autor, 2026-08-23.
 *
 * **O app usa AG = Na − (Cl + HCO₃), SEM potássio.** Existe a variante com K
 * (Na + K − Cl − HCO₃), e as duas dão números diferentes com intervalos de
 * referência diferentes: trocar uma pela outra sem trocar o intervalo desloca
 * TODA a classificação, e o rótulo continua o mesmo na tela.
 *
 * ⚠️ POR ISSO O TEXTO É DERIVADO DOS TERMOS, e não escrito ao lado deles: duas
 * cópias da fórmula (uma no rótulo, outra na conta) é o R-95 no lugar mais caro
 * possível. Mudar o rótulo aqui muda a conta junto — e a trava confere que a
 * ENGINE calcula o que estes termos dizem.
 */
export const FORMULA_DO_AG = {
  /** Somados. */
  positivos: ["Na"] as const,
  /** Subtraídos. */
  negativos: ["Cl", "HCO₃"] as const,
  procedencia: {
    fonte: null,
    forca: "decisao_do_autor",
    declaradoPor: "Dr. Sandro Dainez, 2026-08-23",
    alvo:
      "escolha entre AG com e sem potássio — decisão do autor: SEM potássio. O intervalo de referência e os cortes só se definem depois da fórmula fixada, e não foram tocados nesta rodada",
  } as ProcedenciaDoAG,
};

/** "AG = Na − (Cl + HCO₃)" — derivado dos termos, nunca escrito ao lado. */
export function textoDaFormula(): string {
  const pos = FORMULA_DO_AG.positivos.join(" + ");
  const neg = FORMULA_DO_AG.negativos.join(" + ");
  return `AG = ${pos} − (${neg})`;
}

/**
 * O cálculo, a partir dos MESMOS termos que geram o rótulo.
 * ⚠️ A engine chama esta função. Se alguém somar o potássio lá dentro sem mexer
 * aqui, a trava vê a divergência entre o que a fórmula declara e o que a
 * calculadora devolve.
 */
export function calcularAG(valores: Record<string, number>): number | null {
  let total = 0;
  for (const t of FORMULA_DO_AG.positivos) {
    if (valores[t] == null) return null;
    total += valores[t];
  }
  for (const t of FORMULA_DO_AG.negativos) {
    if (valores[t] == null) return null;
    total -= valores[t];
  }
  return total;
}

/**
 * ⚠️ FATOR HERDADO, SEM VERBATIM. Ele JÁ ESTAVA no código (`ag + 2.5 * (4 - alb)`)
 * e continua exatamente o mesmo — o que mudou é passar a declarar que ninguém
 * conferiu a fonte dele.
 */
export const FATOR_ALBUMINA = {
  valor: 2.5,
  porGDlAbaixoDe: 4,
  // ⚠️ FIGGE É LITERATURA PRIMÁRIA, NÃO GUIDELINE — e o rótulo na tela diz isso
  // (decisão do autor, 2026-08-23). A diferença importa: uma relação publicada e
  // amplamente adotada não é uma recomendação graduada de sociedade, e chamar de
  // guideline seria inflar exatamente como a auditoria proíbe.
  procedencia: {
    fonte: "Figge et al. — relação entre albumina e ânion gap",
    forca: "literatura_primaria",
    declaradoPor: "Dr. Sandro Dainez, 2026-08-23",
    alvo:
      "verbatim de Figge et al. a transcrever em protocols/fontes-verbatim/. ⚠️ A força já está declarada como literatura primária / prática aceita — NÃO é guideline",
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
/**
 * ⚠️ 8–12 mEq/L É ORIENTAÇÃO, E O INTERVALO DO LABORATÓRIO PREVALECE — decisão
 * do autor, 2026-08-23.
 *
 * A razão é a mesma do cálcio ionizado, e ela vai para a tela: **a metodologia
 * analítica interfere**. Dois laboratórios medem o mesmo sangue e devolvem
 * intervalos de referência diferentes; um número decorado atravessa os dois e
 * erra num deles.
 */
export const CORTE_AG = {
  elevadoAcimaDe: 12,
  baixoAbaixoDe: 8,
  procedencia: {
    fonte: null,
    forca: "pratica_aceita",
    declaradoPor: "Dr. Sandro Dainez, 2026-08-23",
    alvo:
      "8–12 mEq/L é ORIENTAÇÃO, não cutoff formal — prática aceita, declarada como tal (R-110). ⚠️ O intervalo do laboratório PREVALECE sobre estes números, e a tela diz isso",
  } as ProcedenciaDoAG,
};

export const AG_LABORATORIO_PREVALECE =
  "⚠️ 8–12 mEq/L é ORIENTAÇÃO, não cutoff formal: o intervalo de referência do SEU laboratório prevalece, porque a metodologia analítica interfere no resultado.";

export const AG_SEM_ALBUMINA =
  "⚠️ NÃO É POSSÍVEL INTERPRETAR O ÂNION GAP SEM A ALBUMINA. Ela é o principal ânion não medido: quando cai, o AG cai junto e MASCARA uma acidose de AG elevado que existe. Albumina 2,0 com AG 12 corresponde a um AG corrigido de ~17.";

export const AG_SEM_ALBUMINA_PORQUE =
  "Informe a albumina para que o AG seja corrigido e interpretado. Sem ela, o valor medido isolado não separa «não há acidose de AG elevado» de «há, e a albumina baixa a escondeu».";

export const AG_BAIXO =
  "ÂNION GAP BAIXO — não é «normal». Procure hipoalbuminemia (a causa mais comum), paraproteína do mieloma múltiplo e intoxicação por lítio ou brometo.";

export const AG_FATOR_ROTULO =
  "Correção pela albumina: relação de Figge — literatura primária / prática aceita, não guideline.";

export const AG_ELEVADO_CAUSAS =
  "MUDPILES: Metanol/Metformina, Uremia, Diabética (CAD), Propilenoglicol/Paracetaldeído, Isoniazida, Lactato, Etilenoglicol, Salicilatos.";

export const AG_NA_FAIXA =
  "Ânion gap corrigido dentro da faixa de referência. Se há acidose, considere a hiperclorêmica (HARDUPS): HCO₃ perdido (diarreia), ATR, reposição de NaCl, fístula pancreática, urostomia, pós-hipocápnia, espironolactona.";
