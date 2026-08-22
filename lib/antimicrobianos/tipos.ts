/**
 * O CATÁLOGO DE ANTIMICROBIANOS — dado, não código.
 *
 * ── ⚠️ POR QUE A ESTRUTURA VEM ANTES DOS FÁRMACOS ──────────────────────────
 *
 * Hoje o app tem **3 fármacos · 10 cortes de ClCr · ZERO fonte no nível do
 * limiar** (D-74). Acrescentar 25 fármacos com a estrutura atual produziria ~70
 * cortes de dose sem procedência — cada um deles **dose de antimicrobiano em
 * paciente renal**.
 *
 * **Multiplicar o defeito por sete seria o pior desfecho possível desta
 * sequência**, e seria feito por nós, de propósito, sabendo. Por isso: primeiro a
 * estrutura com fonte por faixa (AM-7), depois os fármacos, um a um, cada um já
 * com procedência — e nenhum entra sem.
 *
 * ── ⚠️ POR QUE DADO, E NÃO `if` NO MOTOR ───────────────────────────────────
 *
 * A dose morava em ternários encadeados dentro de `compute`. Com 28 fármacos isso
 * é ingovernável, e é onde nasce faixa sobreposta: ninguém enxerga sobreposição
 * lendo `tfg > 50 ? A : tfg >= 25 ? B : tfg >= 10 ? C : D`. Como DADO, a
 * sobreposição e o buraco viram **impossíveis por construção** — a trava
 * `test:antimicrobianos` reprova os dois —, não "improváveis por revisão".
 *
 * ── ⚠️ A FRONTEIRA É DECLARADA, NÃO ADIVINHADA ─────────────────────────────
 *
 * `de` é INCLUSIVO e `ate` é EXCLUSIVO por padrão. Quando a fonte diz "> 50",
 * a faixa de baixo termina COM o 50 (`ateInclusivo: true`) e a de cima começa
 * SEM ele (`deInclusivo: false`). Sem isso, migrar `tfg > 50 ? A : tfg >= 25 ? B`
 * mudaria a conduta **exatamente no valor 50** — e mudança de dose em um ponto é
 * a que ninguém percebe.
 */

/** O que a fonte autoriza, e com que força. Ver AM-7. */
export type ProcedenciaDeFaixa = {
  /** Documento, seção e ano — ou a pendência declarada, nunca vazio. */
  fonte: string;
  forca: "recomendacao_formal" | "pratica_aceita" | "mecanismo_fisiologico" | "definicao" | "pendente";
  /** Obrigatório quando `forca` é "pendente": o que falta e onde procurar. */
  pendencia?: string;
  /** Classe/grau literal, quando houver. */
  classeOuGrau?: string;
};

/**
 * ⚠️ QUAL EQUAÇÃO A FAIXA PRESSUPÕE. Bula de aminoglicosídeo pressupõe
 * Cockcroft-Gault (clearance ABSOLUTO); corte de KDIGO pressupõe CKD-EPI
 * (indexada por superfície). Usar a TFG de uma equação numa faixa calibrada com
 * a outra é TRANSPOSIÇÃO — a mesma família do pH < 7,0 vindo da cetoacidose.
 * No obeso e no caquético as duas se separam bastante.
 */
export type MetodoDaTFG = "cockcroft_gault" | "ckd_epi" | "mdrd" | "sem_dados";

export type FaixaRenal = {
  /** Limite inferior, INCLUSIVO por padrão. */
  de: number;
  /** Limite superior, EXCLUSIVO por padrão. `null` = sem teto. */
  ate: number | null;
  deInclusivo?: boolean;
  ateInclusivo?: boolean;
  dose: string;
  intervalo: string;
  metodoDaTFG: MetodoDaTFG;
  procedencia: ProcedenciaDeFaixa;
};

/**
 * ⚠️ OS QUATRO ESTADOS RENDERIZAM TEXTO — NENHUM RENDERIZA SILÊNCIO.
 *
 * `nao_ajusta` é dos estados mais úteis do catálogo, e o app hoje não sabe
 * dizê-lo: quem procura "ceftriaxona + insuficiência renal" e não acha nada
 * ajusta por conta e SUBDOSA.
 *
 * E ele previne um erro clássico e grave: **polimixina B não se ajusta por
 * função renal; colistina sim.** Trocar as duas é evento adverso. Um catálogo que
 * diz `nao_ajusta` COM FONTE vale mais que uma tabela de faixas.
 */
export type AjusteRenal = "ajusta" | "nao_ajusta" | "contraindicado" | "sem_dados";

/**
 * ⚠️ DIÁLISE ENTRA AGORA, NÃO DEPOIS. Paciente em HD intermitente, CVVHD/CVVHDF
 * ou SLED é rotina de UTI, e a dose muda mais aí do que entre faixas de ClCr. Se
 * o modelo não previsse isso desde o início, seria refeito em três meses.
 *
 * `sem_dados` é resposta VÁLIDA e aparece na tela: é informação clínica
 * verdadeira, e preencher o buraco com o primeiro número plausível é o que o
 * R-97 proíbe.
 */
export type DoseEmDialise = {
  dose: string;
  intervalo: string;
  /** Relação com a sessão — é ela que muda a hora da dose. */
  relacaoComASessao: "antes" | "depois" | "independente" | "sem_dados";
  procedencia: ProcedenciaDeFaixa;
} | {
  estado: "sem_dados";
  /** A modalidade sobre a qual não há dado — separada do texto, de propósito. */
  sobre: string;
  pendencia: string;
};

export type Antimicrobiano = {
  id: string;
  nome: string;
  classe: string;
  doseUsual: { dose: string; via: string; intervalo: string; procedencia: ProcedenciaDeFaixa };
  doseMaxima?: { valor: string; procedencia: ProcedenciaDeFaixa };
  ajusteRenal: AjusteRenal;
  /** Vazio quando `ajusteRenal` não é "ajusta" — e aí o texto vem do estado. */
  faixas: FaixaRenal[];
  dialise: { HD: DoseEmDialise; CRRT: DoseEmDialise; SLED: DoseEmDialise };
  /** Documento que autoriza a dose do fármaco — bula/prescribing information. */
  fonteDoFarmaco: ProcedenciaDeFaixa;
  /**
   * ⚠️ AFIRMAÇÕES SEPARADAS, COM FORÇA PRÓPRIA — nunca misturadas com a faixa.
   *
   * Em paciente crítico, dose de bula frequentemente SUBDOSA: clearance renal
   * aumentado, volume de distribuição alterado, beta-lactâmico dependente de
   * tempo acima da CIM. Isso não é a faixa da bula — é outra afirmação, de outra
   * procedência, e é a regra B outra vez: uma tela, duas afirmações, duas forças.
   */
  observacoes: { texto: string; procedencia: ProcedenciaDeFaixa }[];
};
