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

/**
 * ⚠️ O TERCEIRO EIXO, DESCOBERTO NA CEFAZOLINA — e ele NÃO cabia no que existia.
 *
 * A profilaxia cirúrgica da cefazolina depende do PESO: o label dá 1–2 g abaixo
 * de 120 kg e 3 g de 120 kg para cima. Escrever isso como uma frase dentro do
 * campo `dose` ("1 a 2 g se < 120 kg · 3 g se ≥ 120 kg") seria gambiarra: o
 * número viraria PROSA, e nenhuma trava poderia conferir sobreposição, buraco ou
 * fronteira — que é exatamente o que este catálogo existe para garantir.
 *
 * Então o peso virou eixo, com a mesma disciplina do clearance: limites
 * explícitos, e a trava exige que as faixas de peso cubram a reta sem se
 * sobrepor. Vale para o que vem: aminoglicosídeo, vancomicina e as doses de
 * profilaxia por peso são todas assim.
 */
export type FaixaDePeso = { de: number; ate: number | null };

/**
 * ⚠️ AS MODALIDADES DE SUBSTITUIÇÃO RENAL SÃO VALORES DO MESMO EIXO — não uma
 * seção à parte.
 *
 * A cefepima mostrou: **CAPD é uma LINHA da mesma tabela**, lado a lado com
 * "30 a 60" e "11 a 29", com a mesma lógica. Enquanto a diálise vivia num campo
 * separado, ela **não herdava nada** — nem a trava de fronteira, nem os eixos,
 * nem a obrigatoriedade de fonte por linha. E foi por isso que a hemodiálise da
 * cefepima "precisou" de variação por indicação como caso especial: ela era caso
 * especial só por estar fora da estrutura.
 *
 * ⚠️ CRRT É UM VALOR SÓ, COM NOTA. As doses diferem entre CVVH, CVVHD e CVVHDF,
 * e os labels quase nunca distinguem — **fingir a distinção sem fonte seria pior
 * que não tê-la.**
 */
export type ModalidadeDeTRS = "HD" | "DP" | "CRRT" | "SLED";

export const MODALIDADES: ModalidadeDeTRS[] = ["HD", "DP", "CRRT", "SLED"];

/**
 * Uma linha do eixo renal. Ou ela é CONTÍNUA (faixa de clearance) ou é
 * CATEGÓRICA (modalidade de TRS) — nunca as duas, e nunca nenhuma.
 */
/**
 * ⚠️ A DOSE ESTRUTURADA — e ela existe porque TRÊS defeitos diferentes tinham a
 * mesma causa: **número dentro de texto.**
 *
 *   · o meropeném — "metade da dose recomendada" tem um REFERENTE que o dado não
 *     representava; alguém o resolveu à mão e virou número fixo, certo numa
 *     indicação e errado nas outras;
 *   · o mg/kg — o motor procurava a string "mg/kg" e usava `parseFloat`, que cala
 *     ou erra com "1,5 g/kg", "mg/kg/dia", "7,5 a 10 mg/kg";
 *   · a unidade — nunca esteve declarada, então converter era adivinhar.
 *
 * **Texto é para humano ler; o motor precisa de valor, unidade e referente.** E o
 * texto passa a ser DERIVADO da estrutura — nunca o contrário. A trava confere
 * que o texto exibido bate com o dado, coisa impossível enquanto a dose era prosa.
 */
export type DoseEstruturada =
  | { tipo: "absoluta"; min: number; max?: number; unidade: "mg" | "g" | "UI"; porQuilo?: boolean }
  /** ⚠️ "metade da dose recomendada" — e a base vem do EIXO, como no label. */
  | { tipo: "fracaoDaBase"; fracao: number }
  | { tipo: "igualABase" }
  /** Quando a fonte não dá dose: o texto é a própria ausência. */
  | { tipo: "textoLivre" };

/** Horas entre doses — número, faixa, ou o que a fonte disser por extenso. */
export type IntervaloEstruturado = { horas: number } | { min: number; max: number } | { texto: true };

export type LinhaRenal = {
  /** Quando existe, esta linha só vale nesta faixa de PESO (kg). */
  peso?: FaixaDePeso;
  /** CONTÍNUA: limite inferior, INCLUSIVO por padrão. */
  de?: number;
  /** CONTÍNUA: limite superior, EXCLUSIVO por padrão. `null` = sem teto. */
  ate?: number | null;
  deInclusivo?: boolean;
  ateInclusivo?: boolean;
  /** CATEGÓRICA: a modalidade de substituição renal. */
  modalidade?: ModalidadeDeTRS;
  /**
   * ⚠️ O TEXTO É DERIVADO DA ESTRUTURA. Ele continua existindo porque é a chave
   * de tradução (D-19) e porque é o que o humano lê — mas `valor` é o que o motor
   * usa, e a trava confere que os dois dizem a mesma coisa.
   */
  dose?: string;
  intervalo?: string;
  /** O que o MOTOR usa. Ausente só em `semDados`. */
  valor?: DoseEstruturada;
  intervaloHoras?: IntervaloEstruturado;
  /** ⚠️ Ausência DECLARADA, com a razão — nunca silêncio. */
  semDados?: string;
  /** O que a tela mostra quando a fonte fala em fração. Procedência própria. */
  doseConcreta?: { texto: string; procedencia: ProcedenciaDeFaixa };
  /** O que vale só nesta linha — MDR, meningite, relação com a sessão. */
  notaDeFaixa?: { texto: string; procedencia: ProcedenciaDeFaixa };
  metodoDaTFG: MetodoDaTFG;
  procedencia: ProcedenciaDeFaixa;
};

/** Compatibilidade de nome — uma faixa é uma linha contínua. */
export type FaixaRenal = LinhaRenal;

/**
 * ⚠️ O EIXO DE ENTRADA — e o TIPO É ENUMERADO, FECHADO.
 *
 * String livre viraria depósito: em três fármacos ninguém saberia mais o que é
 * eixo e o que é gambiarra. **Tipo novo só com decisão explícita.**
 *
 * ⚠️ E O EIXO CARREGA A PERGUNTA QUE O APP FAZ. Ele não é só estrutura de dado:
 * se a pergunta morar no componente, o próximo fármaco esquece de fazê-la.
 */
export type TipoDeEixo = "indicacao" | "esquema_habitual" | "peso";

export type EixoDeEntrada = {
  tipo: TipoDeEixo;
  /** A pergunta, literal, que a tela faz antes de mostrar dose. */
  pergunta: string;
  /** O texto da saída "não sei" — que NUNCA escolhe por ele. */
  naoSei: string;
  /**
   * ⚠️ A CHAVE É COMPOSTA — `farmaco.eixo.valor` —, e o `id` aqui é só o último
   * pedaço. Id global colidiria em silêncio: dois fármacos com "tratamento" e um
   * responderia pelo outro, sem nada quebrar. Falha silenciosa é o modo de falha
   * mais caro, e é o que este projeto passa o dia caçando.
   */
  valores: { id: string; rotulo: string; base?: DoseEstruturada; linhas: LinhaRenal[] }[];
};

export type AjusteRenal = "ajusta" | "nao_ajusta" | "contraindicado" | "sem_dados";

export type Antimicrobiano = {
  id: string;
  nome: string;
  classe: string;
  /**
   * ⚠️ A DOSE USUAL É DERIVADA, NÃO ESCRITA — só a VIA fica, porque não se deduz
   * de faixa nenhuma.
   *
   * Ela era prosa ao lado da base estruturada, dizendo a mesma coisa sem nada
   * entre as duas: R-95 na peça recém-nascida. A saída não foi uma trava
   * conferindo as duas — foi **não ter duas**. `doseUsualDerivada()` monta o texto
   * a partir da BASE de cada valor do eixo, ou da faixa SEM TETO (que é, por
   * definição, a dose com função renal normal).
   */
  doseUsual: { via: string; procedencia: ProcedenciaDeFaixa };
  doseMaxima?: { valor: string; procedencia: ProcedenciaDeFaixa };
  /**
   * ⚠️ A DOSE DE ATAQUE — CAMPO QUE FALTAVA, e a ceftazidima foi o terceiro
   * fármaco seguido a pedi-lo (vancomicina, cefepima em HD, e agora esta).
   *
   * Ela **não é a dose usual** e **não é a primeira faixa**: depende do volume de
   * distribuição, não da eliminação, e por isso não desce com o clearance.
   * Acomodá-la em `doseUsual` faria a tela mostrar dose de manutenção com nome de
   * ataque — que é exatamente o erro clínico que a vancomicina existe para não
   * cometer.
   *
   * ⚠️ `quando` guarda a REDAÇÃO DA FONTE. O label da ceftazidima distingue
   * "may be given" (na suspeita de insuficiência renal) de "is recommended" (na
   * hemodiálise), e a diferença não é estilo.
   */
  doseDeAtaque?: {
    dose: string;
    quando: string;
    /**
     * ⚠️ QUANDO O ATAQUE É CALCULADO, E NÃO ESCRITO. O nome aponta para O QUE SE
     * CALCULA, nunca para o fármaco: o motor não pode saber nome de remédio
     * (`test:motor-antibiotico`), e a fórmula tem UMA dona no repositório — a
     * mesma que a sepse usa. Repetir a fórmula aqui a faria divergir a partir de
     * certo peso, que foi exatamente o defeito que a dona única corrigiu.
     */
    calculo?: "ataque_glicopeptideo_peso_real";
    procedencia: ProcedenciaDeFaixa;
  }[];
  ajusteRenal: AjusteRenal;
  /**
   * ⚠️ O QUE A TELA DIZ QUANDO NÃO HÁ LINHA — obrigatório em `nao_ajusta`,
   * `contraindicado` e `sem_dados`.
   *
   * Nasceu de uma mutação que passou VERDE: apagar a frase "não requer ajuste"
   * das observações não reprovava nada. Texto em lista solta é opcional na
   * prática; campo obrigatório se confere.
   */
  textoDoEstado?: { texto: string; procedencia: ProcedenciaDeFaixa };
  /**
   * O EIXO RENAL, quando o fármaco não tem eixo de entrada: faixas de clearance
   * E modalidades de TRS, no mesmo lugar, sob a mesma trava.
   */
  linhas: LinhaRenal[];
  /** Quando existe, `linhas` fica vazio e cada valor traz o seu conjunto. */
  eixo?: EixoDeEntrada;
  /**
   * ⚠️ A BASE DE REFERÊNCIA — obrigatória quando alguma linha usa
   * `fracaoDaBase` ou `igualABase`. Sem ela, "metade da dose" não tem metade de
   * quê, e foi exatamente esse buraco que produziu a D-79.
   */
  base?: DoseEstruturada;
  fonteDoFarmaco: ProcedenciaDeFaixa;
  observacoes: { texto: string; procedencia: ProcedenciaDeFaixa }[];
};
