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
  /** Como a FONTE diz — "METADE da dose recomendada", "2,25 g". */
  dose: string;
  intervalo: string;
  /**
   * ⚠️ O QUE A TELA MOSTRA, quando a fonte fala em fração e o médico precisa do
   * número. "METADE da dose recomendada" é fiel ao label e inútil com o paciente
   * na frente; "500 mg" é útil e pressupõe qual é a dose recomendada. As duas
   * coisas existem, e a segunda tem **procedência própria** — é operacionalização
   * nossa, não texto da fonte. Regra B, aplicada à mesma faixa.
   */
  doseConcreta?: { texto: string; procedencia: ProcedenciaDeFaixa };
  /**
   * ⚠️ O QUE VALE SÓ NESTA FAIXA, e não é o texto da fonte — a dose de MDR ou de
   * meningite, a infusão estendida. Vive aqui, com PROCEDÊNCIA PRÓPRIA, porque a
   * alternativa seria um `if` no motor testando o mesmo limiar de novo: aí a
   * FRONTEIRA teria duas cópias, e mudar uma delas faria a nota desaparecer em
   * silêncio na outra.
   */
  notaDeFaixa?: { texto: string; procedencia: ProcedenciaDeFaixa };
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
  /**
   * ⚠️ O QUE A TELA DIZ QUANDO NÃO HÁ FAIXA — obrigatório em `nao_ajusta`,
   * `contraindicado` e `sem_dados`.
   *
   * Nasceu de uma mutação que passou VERDE: apagar a frase "não requer ajuste"
   * das observações não reprovava nada, e a tela ficava sem a informação que
   * evita o subajuste por conta própria. Enquanto o texto morava numa lista
   * solta, ele era opcional na prática — agora é campo, e campo obrigatório se
   * confere.
   */
  textoDoEstado?: { texto: string; procedencia: ProcedenciaDeFaixa };
  /** Vazio quando `ajusteRenal` não é "ajusta" — e aí o texto vem do estado. */
  faixas: FaixaRenal[];
  /**
   * ⚠️ A DOSE NEM SEMPRE DEPENDE SÓ DA FUNÇÃO RENAL — e o pip-tazo mostrou.
   *
   * A Tabela 1 do label dele tem DUAS colunas de indicação, com doses e
   * intervalos diferentes na mesma faixa de clearance. Um catálogo com uma dose
   * por faixa não consegue representar isso: ou escolhe uma coluna (decidindo
   * clínica pelo usuário), ou perde a outra.
   *
   * Quando este campo existe, ele MANDA — `faixas` fica vazio e cada indicação
   * traz o seu conjunto completo, conferido pela mesma trava.
   */
  indicacoes?: { id: string; rotulo: string; faixas: FaixaRenal[] }[];
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
