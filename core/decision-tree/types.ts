/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LEGACY_ACLS_RUNTIME — manter temporariamente apenas para bradicardia    ║
 * ║  e taquicardia. Não utilizar em novos módulos clínicos.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Em 2026-08-27 a arquitetura clínica antiga foi removida do app: 19 árvores de
 * decisão e 20 telas de fluxo saíram. Sobraram DOIS módulos que ainda dependem
 * deste motor — `acls-bradycardia-tree` e `acls-tachycardia-tree` — porque eles
 * pertencem ao PCR Adulto, que é área preservada.
 *
 * ⚠️ ISTO NÃO É A BASE DO PRÓXIMO MÓDULO. O AVC, e tudo que vier depois, nasce
 * na arquitetura nova. Acrescentar módulo aqui é reinstalar o problema que a
 * reestruturação existiu para desfazer.
 *
 * Este arquivo sai do app quando bradicardia e taquicardia forem reescritas.
 *
 * Registrado como **D-107** em `auditoria/DIVIDAS-CONHECIDAS.md`.
 */
export type DecisionOption = {
  id: string;
  label: string;
  next: string;
  /** Opcional: torna a opção visível apenas se a expressão de guarda for verdadeira. */
  showIf?: (values: TreeValues) => boolean;
  /**
   * ⚠️ A RESPOSTA VIAJA — e é por isso que este campo existe (R-122).
   *
   * Uma pergunta cujas respostas convergem para o mesmo destino só se justifica
   * se a resposta for CARREGADA ADIANTE. Se não é carregada, é toque que não
   * muda nada e não guarda nada — e o app vai reperguntar a mesma coisa três
   * telas depois.
   *
   * ⚠️ E O LIMITE, QUE É A METADE QUE PROTEGE: o que se grava aqui NÃO PODE
   * INFLUENCIAR CLASSIFICAÇÃO CLÍNICA. Serve para não reperguntar; nunca para
   * decidir gravidade. `valida-estado-nao-classifica` cobra isso.
   */
  grava?: { campo: string; valor: string };
  /**
   * PESO VISUAL NA REAVALIAÇÃO (Design System V2 v3, piloto coronarianas) —
   * OPCIONAL e só consumido quando a UI v3 está ligada para o módulo.
   *
   * ⚠️ NÃO É HIERARQUIA FIXA. O pedido do autor foi explícito: "peso visual
   * deve refletir gravidade clínica real, não uma hierarquia fixa universal".
   * Por isso o peso vem do CONTEÚDO de cada opção — quem escreve o nó decide,
   * caso a caso, se "sem sucesso" pesa mais que "complicação" ali —, nunca de
   * uma regra de layout que trata todo "não sei" como neutro ou toda falha
   * como crítica em qualquer contexto.
   *
   * Ausente = peso igual entre as opções (comportamento atual, inalterado).
   */
  gravidade?: "critica" | "alerta" | "favoravel" | "neutra";
};

/**
 * ── PRAZO DECLARADO NUM NÓ ──────────────────────────────────────────────────
 *
 * A árvore é DADO; o cronômetro é COMPORTAMENTO. O prazo é a costura, e por isso
 * é declarado como dado — mesmo precedente do `Roteamento`, que declara
 * `possiveis` porque a auditoria de grafo percorre estaticamente e não segue
 * função.
 *
 * ── A IDEIA QUE ORGANIZA O TIPO ─────────────────────────────────────────────
 *
 * O cronômetro NÃO é um contador — é uma pergunta sobre O QUE MEDIR, e a
 * pergunta muda com a fase. Por isso `marco` não tem default: um relógio sem
 * marco declarado responde "quanto tempo o app está aberto", que é a única
 * pergunta que nunca interessa.
 */
export type MarcoDePrazo =
  /** O evento clínico: início da crise, do trauma, da ingestão. */
  | "inicioDoEvento"
  /** A última dose administrada — para repique de fármaco. */
  | "ultimaDose"
  /** O início de uma terapia que muda o critério (anestésico no status). */
  | "inicioDoAnestesico"
  /**
   * O PRIMEIRO CONTATO MÉDICO (FMC).
   *
   * ⚠️ NÃO É "a chegada". A meta de ≤10 min para o ECG de 12 derivações conta
   * do primeiro contato médico — e por isso vale igual no pronto-socorro, no
   * pré-hospitalar e no paciente já internado que passa a ter dor. "Da
   * chegada" só coincide com o FMC num desses três cenários.
   *
   * ⚠️ E NÃO É A ABERTURA DO MÓDULO. O app não tem como saber quando o
   * atendimento começou; usar a abertura como âncora responderia "há quanto
   * tempo o app está aberto" e o atraso apareceria sempre como zero — o
   * cronômetro mentindo a favor, que é o modo de falha que esta camada inteira
   * existe para evitar. A âncora é INFORMADA, e enquanto não for, `PrazoAtivo`
   * devolve `semMarco: true` e a tela diz "pendente" sem afirmar atraso.
   */
  | "primeiroContatoMedico"
  /** A entrada neste nó. Só para prazos que de fato começam na tela. */
  | "entradaNoNo";

export type Prazo = {
  /** Identidade do relógio. Nós da mesma linha do tempo compartilham. */
  id: string;
  /** Minutos desde o MARCO. */
  aos: number;
  /** De onde conta. SEM default de propósito. */
  marco: MarcoDePrazo;
  /** O que a tela diz quando vence. Literal, para ser traduzível (D-19). */
  aoVencer: string;
  /** Para onde o fluxo DEVERIA ir. Sugere; nunca navega sozinho. */
  sugereNo?: string;
  /**
   * O que acontece DEPOIS de vencer. Sem default: um relógio que estoura em
   * silêncio ensina que o problema acabou justamente quando ele piorou.
   */
  aoUltrapassar: "seguirContando" | "trocarDeMarco";
  /** Obrigatório quando `aoUltrapassar` é "trocarDeMarco". */
  proximoMarco?: MarcoDePrazo;
  /** Texto exibido depois da última marca da linha. Literal. */
  aoUltrapassarTexto?: string;
};

/** O que o runtime devolve para a tela sobre um prazo. */
export type PrazoAtivo = {
  id: string;
  /** Minutos decorridos desde o marco. */
  decorridoMin: number;
  /** Minutos até vencer. Negativo quando já venceu. */
  restanteMin: number;
  vencido: boolean;
  /** true quando o marco de origem não existe — contagem impossível. */
  semMarco: boolean;
  /** true quando a contagem começou do "não sei" e SUBESTIMA o real. */
  subestima: boolean;
  texto: string;
  sugereNo?: string;
};

type BaseNode = {
  id: string;
  title: string;
  summary?: string;
  /**
   * Mostra o bloco de TERAPIAS EM PARALELO abaixo do conteúdo deste nó.
   *
   * ⚠️ OPT-IN EXPLÍCITO, NÃO AUTOMÁTICO. Seria mais curto renderizar o bloco em
   * todo nó da árvore que o declara — e aí ele apareceria também nas telas em
   * que a terapia É o assunto principal, duplicando os mesmos cards logo abaixo
   * deles. Marcar nó a nó custa uma linha e deixa auditável em qual momento do
   * atendimento o bloco acompanha o médico.
   */
  comTerapias?: boolean;
  /** Prazos que este nó declara. Ausente na esmagadora maioria dos nós. */
  prazos?: Prazo[];
};

/**
 * COMPARATIVO VISUAL — padrões desenhados lado a lado, dentro de uma decisão.
 *
 * ── ⚠️ POR QUE UM CAMPO NOVO NO NÚCLEO ─────────────────────────────────────
 *
 * Porque havia uma classe de pergunta que o app não sabia fazer: a de
 * RECONHECIMENTO DE PADRÃO. "O ECG tem ondas T apiculadas?" é, para quem não
 * tem experiência, uma tradução de frase em imagem — e ela caía justamente no
 * ramo mais letal do módulo renal. Descrever em texto o que se reconhece com o
 * olho transfere ao usuário a tarefa mais difícil da tela.
 *
 * `evidence` não serve: é lista de critérios em texto, e o problema é
 * exatamente o texto. Um nó de ação também não: a pergunta ainda não foi
 * respondida quando o desenho aparece — ele é o INSTRUMENTO da resposta.
 *
 * ── A REGRA QUE IMPEDE ISTO DE VIRAR ENFEITE ────────────────────────────────
 *
 * ⚠️ UMA IMAGEM SÓ ENTRA NUMA TELA SE MUDA A RESPOSTA DA PERGUNTA DAQUELA TELA.
 * Padrão diagnóstico que o usuário precisa reconhecer entra; anatomia
 * ilustrativa, ícone decorativo e esquema "educativo" não. É decisão do médico,
 * e existe porque a poluição de tela já foi o defeito mais caro deste app.
 *
 * Os três textos são literais, e por isso traduzíveis (D-19). `figura` é id de
 * desenho, não texto: não passa por tradução e é conferido por trava.
 */
export type ComparativoVisual = {
  /** Id do traçado em `design-system/tracado-de-ecg.ts`. */
  figura: string;
  /** Como se chama o padrão. */
  rotulo: string;
  /** O que ele significa — uma linha. */
  significado: string;
  /** O que fazer diante dele. Sem isto o desenho vira ilustração. */
  conduta: string;
  /**
   * O CARD É O PRÓPRIO BOTÃO (Design System V2 v3, segunda correção pós-
   * validação física, 2026-08-24) — OPCIONAL.
   *
   * ⚠️ POR QUE ISTO EXISTE: a v3 renderizava o comparativo como galeria (não
   * tocável) E, embaixo, a lista de `options` repetia CADA nome de padrão como
   * uma linha própria — "De Winter" aparecia como card E como botão de texto
   * logo abaixo. Numa tela com 4 padrões, isso dobra a altura sem dobrar a
   * informação, e foi exatamente o que estourou o viewport de 375×667
   * ("6 cards + 8 opções... voltam a transformar a decisão em busca de
   * informação", relato do autor).
   *
   * Quando declarado, `optionId` referencia o `DecisionOption.id` que este
   * card seleciona ao ser tocado — o renderer usa isso para (a) tornar o
   * próprio card tocável e (b) OMITIR da lista de opções qualquer opção já
   * coberta por um card, sem duplicar.
   *
   * Ausente = comportamento de sempre: card só ilustra, a lista de opções
   * mostra todas — nenhum dos outros consumidores (renal, bradicardia,
   * taquicardia) declara isto, e nenhum muda.
   */
  optionId?: string;
  /**
   * ID DE FOTO DE REFERÊNCIA REAL — OPCIONAL (Bloco 4, 2026-08-24).
   *
   * ⚠️ SUBSTITUI o traçado sintético (`tracadoDeEcg(figura, ...)`) quando
   * presente — pedido explícito do autor: "não usar os ECGs sintéticos
   * atuais como referência final; usar as imagens de referência já
   * fornecidas". É um ID DE STRING, não o `require()` da imagem — o
   * `require()` fica em `components/protocol-screen/imagens-ecg-referencia.ts`
   * (só ele passa pelo Metro); este arquivo de árvore continua sendo
   * `require()`ável por Node puro nos validadores, sem asset transform.
   * Ausente = comportamento de sempre (traçado sintético desenhado por
   * `tracadoDeEcg`) — nenhum outro consumidor (renal, bradicardia,
   * taquicardia, PCR, TEP) declara isto, e nenhum muda.
   */
  imagemReal?: string;
};

/**
 * AÇÃO PARALELA — o que acontece AO MESMO TEMPO, e por isso NÃO vira nó.
 *
 * ── A REGRA ARQUITETURAL DO MOTOR (decisão do autor, 2026-08-25) ────────────
 *
 * **Se vira nó, é sequencial. Se é paralelo, não vira nó.**
 *
 * A emergência acontece em paralelo — monitor sendo montado enquanto o ECG é
 * obtido enquanto a história é colhida. Um motor que só tem nós transforma
 * tudo isso numa FILA DE TELAS, e a fila mente sobre o atendimento: sugere
 * que o médico espera terminar A para começar B. Foi exatamente o defeito
 * medido na auditoria da SCA — "peso → 22 ações → decidir reperfusão" fazia
 * a interface dizer que a reperfusão espera as doses. Não espera.
 *
 * ⚠️ POR QUE ENTIDADE E NÃO `string[]` (decisão explícita do autor): texto
 * livre resolveria hoje e travaria amanhã. Já se sabe o que virá — marcar
 * "ECG solicitado", registrar peso, abrir calculadora, marcar coleta,
 * registrar que a hemodinâmica foi acionada, e levar esses dados adiante.
 * O tipo nasce extensível para que isso não exija reescrever o contrato do
 * motor universal depois. O que NÃO se faz nesta rodada é construir o
 * sistema inteiro: `label` é o único campo obrigatório, e os demais entram
 * quando houver consumidor real.
 */
export type ParallelAction = {
  /** O que está acontecendo em paralelo — a frase que aparece na tela. */
  label: string;
  /**
   * Id estável, para quando esta ação precisar ser referenciada (marcada
   * como feita, ligada a um campo, consultada por um nó adiante).
   * Opcional enquanto ninguém referencia.
   */
  id?: string;
  /**
   * Natureza da ação — orienta a renderização e, no futuro, o que o motor
   * faz com ela. `informa` é o padrão quando ausente.
   *
   *   informa  · só declara que aquilo corre junto (estado de hoje)
   *   coleta   · deveria capturar um dado (peso, tempo, coleta laboratorial)
   *   aciona   · dispara algo fora do app (hemodinâmica, equipe, transporte)
   */
  tipo?: "informa" | "coleta" | "aciona";
  /**
   * Campo de `TreeValues` que esta ação alimenta, quando `tipo: "coleta"`.
   * Reservado — nenhum consumidor ainda. Existe para que a ligação
   * ação-paralela → dado não exija mudar o tipo depois.
   */
  campo?: string;
};


/**
 * ── O ESTADO CLÍNICO VIVO ───────────────────────────────────────────────────
 *
 * Os tipos abaixo existem porque o app deixou de ser uma sequência de
 * perguntas e passou a ser uma ficha clínica que ACUMULA. A regra que o autor
 * fixou em 2026-08-25:
 *
 *   TELA recebe dado → MOTOR lembra → PRÓXIMA tela usa → decisão é derivada →
 *   se houver problema corrigível, trata → remede → retorna → libera ou bloqueia.
 *
 * Nunca: a tela 1 pergunta a PA e a tela 6 pergunta de novo se há hipertensão.
 */

/** Uma medição — com quando e de onde veio. */
export type Medicao = {
  valor: string;
  /** Milissegundos epoch. Injetado, nunca lido do relógio dentro do motor. */
  em: number;
  /**
   * De onde veio o dado. `aferido` × `estimado` muda a confiança de uma dose
   * calculada por peso; `corrigido` marca a re-medida depois de um tratamento.
   */
  origem?: "aferido" | "estimado" | "informado" | "corrigido" | "derivado";
  /**
   * O valor que esta medição substituiu. Redundante com a trilha — e de
   * propósito.
   *
   * ⚠️ QUEM LÊ UMA MEDIÇÃO ISOLADA PRECISA DO PAR (2026-08-25). O sumário do
   * caso mostra linhas, não a trilha inteira: "PA 194/116 → 168/96, após
   * intervenção, 13:42" é UMA linha, e reconstruí-la obrigaria todo consumidor
   * a percorrer o array e parear índices — trabalho que cada um faria de um
   * jeito, alguns errado.
   */
  anterior?: string;
  /**
   * Por que o valor mudou. `apos_intervencao` é o que distingue "a PA baixou
   * porque foi tratada" de "a PA baixou sozinha" — e a diferença é clínica.
   */
  motivo?: "primeira_medida" | "apos_intervencao" | "reavaliacao" | "correcao_de_registro";
};

/**
 * Valor clínico com memória. O que a tela mostra é `atual`; o que a auditoria
 * (e a própria tela de correção) precisa é a trilha: 194/116 → tratamento →
 * 168/96.
 */
export type ValorClinico = {
  atual: string;
  em: number;
  origem?: Medicao["origem"];
  /** Da mais antiga para a mais recente, sem a atual. */
  anteriores: Medicao[];
};

/** Semáforo de uma ação clínica. */
export type NivelVeredito = "verde" | "amarelo" | "vermelho";

/**
 * ⚠️ O MOTIVO É DERIVADO, NÃO ESCRITO À MÃO. "Não administrar nitrato" sem
 * dizer por quê obriga o médico a procurar o que o app já sabe. O veredito
 * carrega o achado que o produziu — "PAS 82 mmHg", não "hipotensão".
 */
export type Veredito = {
  /**
   * O id do `VereditoSpec` que o produziu — INJETADO PELO MOTOR, não escrito
   * por quem avalia.
   *
   * ⚠️ SEM ELE A TELA PRECISARIA DE UM ÍNDICE PARALELO ("o terceiro veredito
   * é o do betabloqueador"), e índice paralelo quebra em silêncio no dia em
   * que alguém reordena a lista: o botão de administrar passaria a registrar
   * o fármaco errado.
   */
  id?: string;
  nivel: NivelVeredito;
  /** O que está sendo julgado: "Nitrato", "AAS", "Betabloqueador". */
  titulo: string;
  /** A frase que aparece na tela, já com o achado concreto. */
  motivo: string;
  /**
   * ⚠️ AMARELO É O ÚNICO QUE OFERECE ESCOLHA (regra do autor, 2026-08-25).
   * Vermelho bloqueia AQUELA ação — não o fluxo — e não tem "prosseguir
   * mesmo assim"; o caminho é corrigir o dado ou seguir sem ela. Verde
   * libera. Só o amarelo (risco × benefício) devolve a decisão ao médico,
   * e ela fica registrada.
   */
  /**
   * ESTA TERAPIA ESTÁ PENDENTE DE RESOLUÇÃO e o bloco em paralelo deve chamar
   * atenção.
   *
   * ⚠️ NÃO É "está vermelho". Vermelho é estado RESOLVIDO — o app sabe que não
   * pode e disse por quê. `cobrar` é o oposto: ninguém decidiu ainda, e o
   * fármaco é sensível o bastante para o silêncio ser um risco. Hoje só o AAS
   * o usa: é o mais sensível ao tempo da SCA e pode ser administrado enquanto
   * o ECG é obtido.
   *
   * ⚠️ E COBRAR NÃO É ABRIR. Regra do autor (2026-08-27): o bloco chama atenção
   * pela BORDA e o resumo recolhido já diz o motivo — mas nunca se abre
   * sozinho, porque competiria com a decisão principal da tela.
   */
  cobrar?: boolean;
  decisao?: DecisaoOferecida;
  /**
   * A instrução concreta — dose, via, intervalo — que só faz sentido quando a
   * ação está liberada.
   *
   * ⚠️ POR QUE A DOSE MORA NO VEREDITO E NÃO NA LISTA DE AÇÕES DO NÓ: na
   * validação visual de 2026-08-25, a tela mostrava "🔴 Nitrato — pressão não
   * medida" e, três linhas abaixo, "NITROGLICERINA SUBLINGUAL — 0,3–0,4 mg".
   * A dose de um fármaco contraindicado impressa na mesma tela do bloqueio é
   * o defeito que os vereditos existem para eliminar; deixá-la aqui garante
   * que ela apareça apenas com o veredito que a autoriza.
   */
  instrucao?: string[];
};

/**
 * As saídas possíveis de uma decisão clínica.
 *
 * ⚠️ UM BOOLEANO NÃO BASTA (correção do autor, 2026-08-25). Saber que "houve
 * decisão" não permite reconstruir o atendimento. O sumário precisa poder
 * dizer "hipotensão identificada → intervenção realizada → PA corrigida →
 * medicamento liberado", e para isso a decisão tem de dizer QUAL saída ocorreu:
 * quem corrigiu antes não fez a mesma coisa que quem seguiu sem a medicação, e
 * quem escalonou não fez nenhuma das duas.
 */
export type TipoDeSaida =
  | "prosseguir"
  | "nao_prosseguir"
  | "corrigir_antes"
  | "contraindicar"
  | "escalonar";

export type SaidaDeDecisao = {
  tipo: TipoDeSaida;
  /** O texto do botão — é tela, e por isso passa por interpolação. */
  label: string;
};

/**
 * A decisão que um veredito amarelo oferece.
 *
 * `campo` é onde o `tipo` escolhido fica gravado em `TreeValues`, para que o
 * roteamento derivado possa lê-lo como qualquer outro valor.
 */
export type DecisaoOferecida = {
  campo: string;
  saidas: SaidaDeDecisao[];
};

/**
 * Uma decisão efetivamente tomada — o registro, não a oferta.
 */
export type DecisaoRegistrada = {
  /** O id do VereditoSpec a que a decisão responde. */
  vereditoId: string;
  tipo: TipoDeSaida;
  /** O nível do veredito no momento da decisão — o contexto em que se decidiu. */
  nivelNoMomento: NivelVeredito;
  /** O motivo exibido quando a decisão foi tomada, congelado como estava. */
  motivoNoMomento: string;
  em: number;
};

/**
 * Estado de execução de uma ação clínica. Separado do veredito de propósito:
 * "liberada" não é "feita", e "contraindicada" não é "esquecida".
 */
export type EstadoDaAcao = "pendente" | "realizada" | "contraindicada" | "nao_indicada";

/**
 * O caso inteiro, num objeto serializável.
 *
 * ⚠️ TUDO QUE É CLÍNICO PRECISA SOBREVIVER À RETOMADA (2026-08-25). Guardar só
 * `valores` — como a sessão de fluxo fazia — devolve o número atual e joga fora
 * a trilha, as decisões e o que já foi executado: a tela voltaria mostrando
 * "168/96 aferido agora", sem o 194/116 nem a evidência do impedimento
 * corrigido, e uma ação já realizada reapareceria como pendente.
 */
export type EstadoSerializado = {
  noAtual: string;
  caminho: string[];
  valores: TreeValues;
  historico: Record<string, Medicao[]>;
  /** Id do veredito → instante em que a ação foi executada. */
  realizadas: Record<string, number>;
  decisoes: DecisaoRegistrada[];
};

/** Um veredito declarado por um nó — a função é pura e recebe o estado. */
export type VereditoSpec = {
  id: string;
  avaliar: (values: TreeValues) => Veredito;
};

/**
 * CONDIÇÃO CORRIGÍVEL — o laço tratar → remedir → recalcular.
 *
 * ⚠️ É a peça que faltava para o app ser assistente e não formulário. A PA de
 * 194/116 não é um beco: é um impedimento com tratamento conhecido e
 * re-medida. O nó declara o que medir de novo; o motor recalcula o veredito
 * com a medição nova e a trilha fica registrada.
 */
export type CondicaoCorrigivel = {
  id: string;
  /** Campos que a re-medida atualiza (ex.: ["pas", "pad"]). */
  remedir: string[];
  /** Verdadeiro enquanto o impedimento persistir. */
  persiste: (values: TreeValues) => boolean;
};

export type DecisionNode = BaseNode & {
  type: "decision";
  question: string;
  evidence?: string[];
  /**
   * Padrões desenhados que a pergunta manda comparar. Ver `ComparativoVisual`.
   *
   * ⚠️ NÃO É CAMADA RECOLHIDA. `evidence` e `porque` ficam atrás de um toque
   * porque explicam; o comparativo é o instrumento da resposta e aparece
   * aberto — esconder o desenho devolveria a pergunta ao texto.
   */
  comparativo?: ComparativoVisual[];
  /**
   * O que corre AO MESMO TEMPO desta decisão — não consome passo, não
   * bloqueia. Ver `ParallelAction`.
   */
  emParalelo?: ParallelAction[];
  /** Semáforos derivados do estado. Ver `VereditoSpec`. */
  vereditos?: VereditoSpec[];
  options: DecisionOption[];
};

/**
 * Roteamento DERIVADO — o app conclui em vez de perguntar.
 *
 * Nasceu de um pedido explícito: o usuário sem experiência não sabe responder
 * "há sinais de instabilidade?". A saída escolhida foi desmembrar a pergunta de
 * especialista em observações simples que qualquer um responde (a PA está
 * abaixo de 90? o paciente está sonolento?) e deixar o APP concluir.
 *
 * Para isso o nó de coleta precisa poder ir para lugares diferentes conforme o
 * que foi respondido. Mas um `next` que é função pura quebraria a auditoria: o
 * script de máquinas de estado percorre o grafo estaticamente e não consegue
 * seguir uma função.
 *
 * Por isso o roteamento declara os alvos POSSÍVEIS separadamente da escolha:
 * `possiveis` alimenta a validação e a alcançabilidade, `escolher` decide em
 * tempo de execução, e o motor garante que a escolha esteja entre os possíveis.
 */
export type Roteamento = {
  /** Todos os destinos que este nó pode assumir. Usado na validação estática. */
  possiveis: string[];
  /** Destino a partir dos valores coletados. Deve devolver um dos `possiveis`. */
  escolher: (values: TreeValues) => string;
};

export type ProximoNo = string | Roteamento;

/**
 * A FORÇA DA AFIRMAÇÃO — que TIPO de coisa a tela está dizendo.
 *
 * ── ⚠️ POR QUE `fonte` NÃO BASTA ───────────────────────────────────────────
 *
 * `fonte` responde DE ONDE VEIO. Não responde QUE TIPO DE AFIRMAÇÃO É. Hoje, na
 * mesma tela e com a mesma aparência, convivem:
 *
 *   · "5 golpes nas costas + 5 compressões abdominais" — AHA 2025, Classe 1, Nível A;
 *   · "furosemida pode aumentar a excreção urinária de potássio" — plausibilidade
 *     fisiológica, sem estudo de eficácia no cenário agudo.
 *
 * As duas têm fonte. As duas parecem iguais. **O usuário sem experiência não tem
 * como distinguir** — e ele é a população-alvo do app.
 *
 * A §20 da especificação do renal já mandava distinguir "recomendação
 * estabelecida · prática razoável · evidência limitada · decisão dependente do
 * contexto". Ficou como intenção em prosa por meses, e prosa não se cumpre
 * sozinha: virou campo.
 */
export type ForcaDaAfirmacao =
  /** A diretriz recomenda, e a classe/grau dela está declarada. */
  | "recomendacao_formal"
  /** Consenso, painel de especialistas, prática difundida. Não é recomendação graduada. */
  | "pratica_aceita"
  /** Plausível pela fisiologia; SEM evidência de eficácia no cenário. */
  | "mecanismo_fisiologico"
  /**
   * ⚠️ DEFINIÇÃO NÃO SE GRADUA — e por isso ela é um valor, não um caso especial
   * de recomendação.
   *
   * Uma diretriz não RECOMENDA que o estágio 3 seja o estágio 3: ela ESTABELECE.
   * Não se discorda de uma definição — adota-se ou não. Exigir classe/grau aqui
   * produziria uma classe que a fonte não dá, que é declaração falsa.
   *
   * ⚠️ E O RISCO DELA É OUTRO: não é evidência fraca, é VERSÃO DESATUALIZADA.
   * Por isso o campo obrigatório é a VERSÃO, e ela aparece na tela. Liga direto
   * na emenda E-9: a KDIGO 2026 segue draft, e no dia em que mudar o
   * estadiamento, é este campo que denuncia o app.
   */
  | "definicao";

/**
 * A procedência de um nó de conduta — força, fonte e o que cada força obriga.
 *
 * ⚠️ `contextoDaFonte` É O CAMPO QUE IMPEDE A TRANSPOSIÇÃO, e ele nasceu do erro
 * mais repetido deste projeto: pH < 7,0 vindo da cetoacidose, 126 mg/dL vindo do
 * diagnóstico de diabetes em jejum, UKKA 7.1 vindo da hipercalemia crônica na
 * comunidade. Nenhum linter julga semanticamente se houve transposição — mas
 * **exigir o campo obriga quem escreve a olhar**, e o que se declara, se confere.
 */
export type ProcedenciaDaConduta = {
  forca: ForcaDaAfirmacao;
  /** Referência curta, como aparece na tela. */
  fonte: string;
  /** Obrigatório em `recomendacao_formal`: a classe/grau LITERAL da fonte. */
  classeOuGrau?: string;
  /** Obrigatório em `pratica_aceita`: consenso, painel, revisão, bula… */
  tipoDeDocumento?: string;
  /** Obrigatório em `mecanismo_fisiologico`: o que falta de evidência. */
  lacunaDeEvidencia?: string;
  /**
   * Obrigatório em `definicao`: a versão adotada. É ela que envelhece — e é o
   * único aviso que o app dá quando a fonte publica uma revisão.
   */
  versao?: string;
  /**
   * Obrigatório quando o contexto ORIGINAL da fonte — população, cenário,
   * agudo × crônico — difere do nó que a usa.
   */
  contextoDaFonte?: string;
};

/**
 * UMA DECLARAÇÃO POR AFIRMAÇÃO — porque uma tela pode afirmar duas coisas.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-21) ────────────────────────────────
 *
 * `procedencia` é do NÓ, e isso pressupõe que toda tela faz uma afirmação só.
 * A revisão das dez pendências do renal mostrou que não: `pre_renal` diz
 * "cristaloide isotônico, não coloide" — que é **recomendação formal 2B** — e
 * também "dê em alíquotas e reavalie", que a KDIGO **não recomenda em lugar
 * nenhum**. `fazer_agora` mistura conduta com transição para outro módulo.
 *
 * Com um selo por tela, as duas viram uma: ou o 2B carimba a alíquota (força
 * emprestada), ou a alíquota rebaixa o 2B (força perdida). **As duas mentem, e
 * mentem para lados opostos.**
 *
 * ── COMO ISSO É DIFERENTE DE PARTIR O NÓ ──────────────────────────────────
 *
 * Partir seria a solução de arquitetura, e ela custa um passo a mais no fluxo —
 * quem está com o paciente na frente pagaria por um problema de catalogação.
 * Aqui a tela continua uma; **o que se separa é a declaração**.
 *
 * ⚠️ `afirmacao` É O TEXTO EXATO do item de `actions` que a declaração cobre. Não
 * é rótulo nem resumo: a trava confere identidade, não semelhança — se o item
 * mudar de redação, a declaração precisa mudar junto, e é isso que impede a
 * procedência ficar apontando para uma frase que já não existe.
 */
export type DeclaracaoDeAfirmacao = {
  /** O item de `actions`, LITERAL, que esta declaração cobre. */
  afirmacao: string;
  /** Ausente = `conduta`, e conduta exige `procedencia`. Ver `ActionNode.natureza`. */
  natureza?: "conduta" | "transicao" | "organizacao_do_atendimento";
  /** Proibida quando a natureza não é conduta — declarar força ali seria mentira. */
  procedencia?: ProcedenciaDaConduta;
};

export type ActionNode = BaseNode & {
  type: "action";
  /**
   * O que corre AO MESMO TEMPO destas ações — não consome passo, não
   * bloqueia. Ver `ParallelAction`.
   */
  emParalelo?: ParallelAction[];
  /** Semáforos derivados do estado. Ver `VereditoSpec`. */
  vereditos?: VereditoSpec[];
  /** Impedimentos com tratamento e re-medida. Ver `CondicaoCorrigivel`. */
  corrigiveis?: CondicaoCorrigivel[];
  /**
   * Ferramenta auxiliar aberta por um toque, sem sair do ponto do protocolo.
   * OPCIONAL — ausente, nada muda: nenhum dos módulos existentes declara.
   * Ver `FerramentaAuxiliar`.
   */
  ferramenta?: FerramentaAuxiliar;
  actions: string[];
  /**
   * O PORQUÊ — atrás de um toque, ao lado da ação que ele explica.
   *
   * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ────────────────────────────────
   *
   * O passo de entrada da IRA tinha 44 instruções numa tela. Cada uma legível —
   * essa parte já tinha sido consertada —, o conjunto impossível. O critério que
   * faltava é do médico: UM PASSO MOSTRA SÓ O QUE PRECISA SER FEITO ANTES DA
   * PRÓXIMA DECISÃO. O que explica, justifica, lista critérios, estadia ou cita
   * fonte sai da tela e fica atrás de um toque. Nada se perde: muda de camada.
   *
   * `ActionNode` não tinha onde pôr isso. `evidence` existe só em `DecisionNode`
   * (C2), e nenhum nó de ação a usava — então a camada não existia para passos
   * de ação, que são a maioria.
   *
   * ── ⚠️ POR QUE UM CAMPO NOVO, E NÃO `evidence` NO ActionNode ──────────────
   *
   * Porque as duas coisas têm promessas diferentes, e juntá-las apagaria a
   * distinção que `valida-prazo-visivel` protege. `evidence` é o CRITÉRIO que
   * sustenta uma DECISÃO — quem lê está escolhendo entre opções. `porque` é a
   * RAZÃO de uma AÇÃO já decidida — quem lê está executando, e o "por quê"
   * existe para o usuário SEM EXPERIÊNCIA, que é a maior parte deles.
   *
   * ⚠️ VALE A MESMA REGRA DE PRAZO: nada com PRAZO ou PRECEDÊNCIA pode viver só
   * aqui. `valida-prazo-visivel` vigia este campo junto com `evidence`, pelo
   * mesmo motivo e com o mesmo teto — o toque esconde, e prazo escondido é a
   * única classe cujo custo é o paciente.
   *
   * OPCIONAL de propósito: os nós que já existem seguem válidos sem tocar em
   * nenhum deles.
   */
  porque?: string[];
  /**
   * Que tipo de afirmação esta tela faz. Ver `ProcedenciaDaConduta`.
   *
   * ⚠️ OPCIONAL NO TIPO, OBRIGATÓRIO NA TRAVA — e a diferença é deliberada: os
   * módulos que ainda não foram classificados continuam compilando, e
   * `test:forca-da-afirmacao` cobra por módulo, conforme cada um entra. Nó sem
   * procedência e sem pendência declarada reprova.
   */
  procedencia?: ProcedenciaDaConduta;
  /**
   * QUANDO A TELA AFIRMA MAIS DE UMA COISA — uma declaração por afirmação.
   *
   * ⚠️ `procedencia` É O PADRÃO DA TELA; `declaracoes` são as EXCEÇÕES NOMEADAS.
   * Não são duas fontes de verdade: são default e exceção, e a exceção diz a
   * qual item ela se aplica. `pre_renal` é o caso: a tela inteira é prática
   * aceita — desafio volêmico não é recomendado por diretriz nenhuma —, MENOS a
   * escolha do fluido, que é recomendação formal 2B. Um selo só faria o 2B
   * carimbar a alíquota, ou a alíquota rebaixar o 2B.
   *
   * ⚠️ Uma declaração que repete o padrão é ruído e reprova: exceção que não
   * excepciona só ensina a ignorar exceções.
   */
  declaracoes?: DeclaracaoDeAfirmacao[];
  /**
   * O QUE ESTE NÓ É — e nem todo nó de ação faz afirmação clínica.
   *
   * ⚠️ `transicao` — só roteia para outro módulo. A força é a das condutas do
   * módulo de DESTINO, e restá-la aqui seria DUPLICAR PROCEDÊNCIA, que é
   * exatamente como dois módulos divergem com o tempo.
   *
   * ⚠️ `organizacao_do_atendimento` — "acionar a nefrologia", "colher o exame",
   * "abrir a prescrição". Não são recomendações graduadas: são o fluxo do
   * atendimento. **Exigir força delas produziria declaração falsa** — o defeito
   * que este campo existe para impedir.
   *
   * Ausente = `conduta`, e conduta exige `procedencia`.
   */
  natureza?: "conduta" | "transicao" | "organizacao_do_atendimento";
  /**
   * ESTE PASSO É UM RESULTADO DERIVADO, NÃO UMA CONDUTA COMUM (Design System
   * V2 v3, piloto coronarianas) — OPCIONAL, só consumido quando a UI v3 está
   * ligada para o módulo.
   *
   * Marca os nós de ação que na verdade são "o app concluiu algo a partir dos
   * dados coletados" (ex.: "Grupo B — oclusão de alto risco"), para que a tela
   * renderize como card de resultado (título grande + próxima ação), não como
   * lista numerada de condutas. A variante é semântica, não decorativa — seu
   * significado é o mesmo do card e não depende da cor escolhida na tela.
   *
   * Ausente = renderização de ação comum (comportamento atual, inalterado).
   */
  enfase?: "resultado_critico" | "resultado_alerta" | "resultado_neutro" | "resultado_favoravel";
  next: ProximoNo;
};

export type TransitionTarget = {
  moduleId: string;
  label: string;
  reason: string;
};

/**
 * FERRAMENTA AUXILIAR ABERTA A PARTIR DE UM NÓ DE AÇÃO — e o que ela NÃO é.
 *
 * ⚠️ ISTO NÃO É UMA TRANSIÇÃO. `TransitionTarget` encaminha o ATENDIMENTO para
 * outro módulo: o caso sai daqui e continua lá. Isto abre uma FERRAMENTA e o
 * médico volta ao mesmo ponto — a calculadora de vasoativos para descobrir
 * quantos mL/h correspondem a 10 mcg/min, e depois seguir a via de SCA de onde
 * parou.
 *
 * ⚠️ E POR ISSO NÃO MEXE EM NADA (regra do autor, 2026-08-25): abrir a
 * ferramenta não chama `advance()`, não marca ação como realizada, não resolve
 * veredito, não registra decisão e não altera o caminho clínico. Um atalho que
 * mexesse no estado seria uma transição disfarçada, e o médico voltaria para
 * um protocolo que andou sozinho enquanto ele fazia uma conta.
 *
 * Reusa `moduleId` e a mesma navegação com `from_module` que os atalhos já
 * usam — nenhuma segunda lógica de roteamento.
 */
export type FerramentaAuxiliar = {
  moduleId: string;
  /** Texto do botão. É tela, e por isso é interpolado e traduzível. */
  label: string;
};

export type TransitionNode = BaseNode & {
  type: "transition";
  disposition: "discharge" | "observation" | "icu" | "other_module";
  exitCriteria: string[];
  targets: TransitionTarget[];
};

// ── Nó de coleta de valor por TOQUE (sem digitação obrigatória) ───────────────
export type InputPreset = {
  /** Valor armazenado (string). */
  value: string;
  /** Rótulo exibido no botão. */
  label: string;
};

export type InputField = {
  /** Chave onde o valor é guardado (usável em tokens {chave}). */
  id: string;
  label: string;
  unit?: string;
  /** Botões de valores rápidos. */
  presets: InputPreset[];
  /** Permite o usuário adicionar um valor próprio quando não está nos presets. */
  allowCustom?: boolean;
  /** Texto do campo "outro" (quando allowCustom). */
  customLabel?: string;
  /** Teclado do campo custom. */
  customKeyboard?: "numeric" | "default";
  /** Campo opcional não bloqueia o "continuar". */
  optional?: boolean;
  /**
   * Só mostra o campo quando a condição vale.
   *
   * ⚠️ EXISTE PORQUE PERGUNTA IRRELEVANTE É RUÍDO, e ruído numa tela clínica
   * não é neutro: ele empurra o que importa para fora da dobra e ensina a
   * passar o olho. "Qual inibidor de PDE-5?" para quem respondeu "não usou" é
   * o caso que motivou o campo.
   *
   * O motor filtra ANTES de calcular `canContinue` e antes de entregar os
   * campos à tela — campo oculto não cobra resposta. Sem isso o botão diria
   * "Falta 1 campo" apontando para algo que não está desenhado.
   */
  showIf?: (values: TreeValues) => boolean;
  /**
   * Checklist: o campo aceita VÁRIOS presets marcados ao mesmo tempo.
   *
   * ⚠️ POR QUE ISTO FALTAVA (2026-08-25): todo preset era mutuamente
   * exclusivo, e havia perguntas em que isso é clinicamente falso. "Dor
   * retroesternal + irradiação para o braço + sudorese + náusea" é UM paciente,
   * não quatro alternativas — obrigar a escolher uma delas descartava o resto
   * do quadro na entrada do fluxo.
   *
   * O valor continua sendo `string` (ver SEP em `estado-clinico.ts`): a leitura
   * passa por `selecionados()` / `temAlgum()`, e `TreeValues` fica intacto.
   */
  multiplo?: boolean;
  /**
   * ID de um escore de `clinical-calculators-engine` a ser embutido no passo,
   * recolhido, para o usuário calcular ali mesmo em vez de sair do fluxo.
   *
   * Existe porque pedir NIHSS e mandar abrir outro módulo trava quem não sabe o
   * escore — e quem sabe não precisava do desvio. Vale para qualquer escore
   * registrado: os pesos vêm de lá, nunca copiados, para que a calculadora do
   * fluxo e a da tela de calculadoras não possam divergir.
   */
  calculadora?: string;
};

export type InputNode = BaseNode & {
  type: "input";
  /** Instrução curta acima dos campos. */
  intro?: string;
  fields: InputField[];
  /** Semáforos derivados do estado. Ver `VereditoSpec`. */
  vereditos?: VereditoSpec[];
  next: ProximoNo;
};

export type DecisionTreeNode = DecisionNode | ActionNode | TransitionNode | InputNode;

/** Valores coletados + derivados, usados em tokens {chave} e guardas. */
export type TreeValues = Record<string, string | undefined>;

export type DecisionTreeDefinition = {
  /**
   * Campos de entrada que FIXAM um marco de tempo.
   *
   * Declarado como dado, e não escondido num `if` do runtime, pelo mesmo motivo
   * do `Roteamento.possiveis`: quem lê a árvore precisa ver que aquele campo
   * arma um relógio. O valor do campo é o TEMPO DECORRIDO em minutos, ou
   * "desconhecido".
   */
  marcos?: Record<string, MarcoDePrazo>;
  id: string;
  version: string;
  label: string;
  entryNodeId: string;
  nodes: Record<string, DecisionTreeNode>;
  /**
   * Calcula valores DERIVADOS a partir dos valores coletados (ex.: dose por peso).
   * Os derivados ficam disponíveis em tokens {chave} nos textos e em guardas showIf.
   * Função pura — não deve ter efeitos colaterais.
   */
  derive?: (values: TreeValues) => Record<string, string>;
  /**
   * Faixa de aviso que acompanha o atendimento inteiro, e não um nó só.
   *
   * ⚠️ POR QUE NÃO USAR `prazos` PARA ISTO. `Prazo` é declarado NÓ A NÓ e
   * `getPrazos()` não conhece o estado clínico: um prazo de ECG colado em vinte
   * telas continuaria cobrando o ECG depois de ele ter sido feito. Cobrança que
   * não some quando o problema é resolvido ensina o médico a ignorar a faixa —
   * e aí ela também não serve quando importa.
   *
   * Como o veredito, é DERIVADO a cada render e NUNCA gravado: corrigir o dado
   * muda a faixa na hora, e não existe estado de alerta para dessincronizar.
   * Opcional — as outras árvores não declaram e nada muda para elas.
   */
  alertaPersistente?: (values: TreeValues, agora: number) => AlertaPersistente | null;
  /**
   * TERAPIAS QUE CORREM EM PARALELO ÀS DECISÕES.
   *
   * ── ⚠️ POR QUE ISTO NÃO É UM NÓ ────────────────────────────────────────
   *
   * Na primeira versão da V2 as terapias eram a DÉCIMA tela: o app mandava
   * ativar a hemodinâmica, trombolisar e reavaliar em 90 minutos — e só então
   * oferecia o nitrato. No atendimento real a terapia anti-isquêmica corre AO
   * LADO da decisão de reperfusão, e o fluxograma do autor diz isso com todas
   * as letras: "TERAPIAS EM PARALELO" é caixa lateral da Decisão 2, não etapa
   * posterior.
   *
   * ⚠️ E EM 375 px NÃO É CARD LATERAL. Decisão do autor: bloco compacto
   * ancorado ABAIXO da decisão, recolhido, mostrando o estado de cada fármaco
   * em uma linha com o motivo. Ele nunca abre sozinho — nem quando há vermelho,
   * porque o vermelho já se anuncia no resumo. A decisão da tela continua sendo
   * o elemento dominante.
   *
   * `campos` são os dados que só passam a fazer sentido DENTRO do bloco — hoje
   * "a dor persiste?", que só existe depois de o nitrato ter sido administrado.
   */
  terapiasEmParalelo?: {
    vereditos: VereditoSpec[];
    campos?: InputField[];
  };
};

/**
 * O que a faixa de aviso diz. `nivel` só governa a cor; o texto é literal para
 * poder ser traduzido (D-19).
 */
export type AlertaPersistente = {
  id: string;
  /**
   * "info" = lembrete dentro do esperado · "atencao" = meta ultrapassada ou
   * medida ausente · "critico" reservado para quando houver dano em curso.
   */
  nivel: "info" | "atencao" | "critico";
  texto: string;
  /** Segunda linha, para a medida — separada para a tela poder abreviar. */
  detalhe?: string;
  /**
   * Substituições `{chave}` aplicadas DEPOIS da tradução.
   *
   * ⚠️ NÃO INTERPOLAR ANTES (D-19, defeito medido em 2026-08-25): um texto
   * montado como `` `Primeiro contato há ${n} min` `` nunca casa com a entrada
   * do dicionário PT→ES, e a faixa volta ao português no meio do app em
   * espanhol. O literal vai com o token; o número entra depois.
   */
  valores?: Record<string, string>;
};

export type DecisionTreeLogEntry = {
  timestamp: number;
  event: "enter" | "answer" | "advance" | "reset" | "value";
  nodeId: string;
  nodeType: DecisionTreeNode["type"];
  optionId?: string;
  optionLabel?: string;
  fieldId?: string;
  value?: string;
};

export type DecisionTreeValidationIssue = {
  level: "error" | "warning";
  message: string;
  nodeId?: string;
};

/**
 * O passo como a tela o recebe. A união discrimina por `kind`; a interseção
 * acrescenta o que vale para QUALQUER tipo de passo.
 *
 * ⚠️ INTERSEÇÃO EM VEZ DE REPETIR O CAMPO NAS QUATRO VARIANTES: repetido, um
 * dia alguém acrescenta a quinta variante e esquece — e o bloco de terapias
 * some sem erro de compilação, exatamente no tipo de nó novo.
 */
export type FrontendTreeStep = FrontendTreeStepBase & {
  /** Terapias que acompanham este passo, quando o nó declara `comTerapias`. */
  terapias?: { vereditos: Veredito[]; campos: InputField[] };
};

type FrontendTreeStepBase =
  | {
      id: string;
      kind: "decision";
      title: string;
      question: string;
      summary?: string;
      evidence: string[];
      /** Padrões desenhados, já interpolados. Ver `DecisionNode.comparativo`. */
      comparativo: ComparativoVisual[];
      /** O que corre em paralelo, já interpolado. Ver `ParallelAction`. */
      emParalelo: ParallelAction[];
      /** Semáforos já avaliados contra o estado atual. */
      vereditos: Veredito[];
      /** `gravidade`, já propagada. Ver `DecisionOption.gravidade`. */
      options: Array<{ id: string; label: string; gravidade?: DecisionOption["gravidade"] }>;
    }
  | {
      id: string;
      kind: "action";
      title: string;
      summary?: string;
      actions: string[];
      /** O que corre em paralelo, já interpolado. Ver `ParallelAction`. */
      emParalelo: ParallelAction[];
      /** Semáforos já avaliados contra o estado atual. */
      vereditos: Veredito[];
      /** O porquê, recolhido. Ver `ActionNode.porque`. */
      porque: string[];
      /** Força e procedência, já interpoladas. Ver `ProcedenciaDaConduta`. */
      procedencia?: ProcedenciaDaConduta;
      /** Uma declaração por afirmação, já interpoladas. Ver `DeclaracaoDeAfirmacao`. */
      declaracoes: DeclaracaoDeAfirmacao[];
      /** Ver `ActionNode.enfase`. */
      enfase?: ActionNode["enfase"];
      /**
       * Ferramenta auxiliar, já interpolada. Ausente na esmagadora maioria dos
       * nós — e ausente significa que nada muda. Ver `FerramentaAuxiliar`.
       */
      ferramenta?: FerramentaAuxiliar;
      canContinue: true;
    }
  | {
      id: string;
      kind: "input";
      title: string;
      summary?: string;
      intro?: string;
      fields: InputField[];
      /** Valores atuais por field id. */
      values: TreeValues;
      /**
       * A trilha de medições por campo — só os campos que já foram medidos.
       *
       * ⚠️ É O QUE SUSTENTA A RE-MEDIDA (2026-08-25): a tela de correção
       * precisa mostrar "194/116 → 168/96", e não apenas o valor novo. Sem a
       * trilha, tratar e re-medir apagaria a evidência do impedimento.
       */
      historico: Record<string, Medicao[]>;
      /** Vereditos derivados desta tela — ver `vereditos` na variante decision. */
      vereditos: Veredito[];
      /** true quando todos os campos obrigatórios têm valor. */
      canContinue: boolean;
    }
  | {
      id: string;
      kind: "transition";
      title: string;
      summary?: string;
      disposition: TransitionNode["disposition"];
      exitCriteria: string[];
      targets: TransitionTarget[];
    };
