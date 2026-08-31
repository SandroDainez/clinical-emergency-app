/**
 * O CAMPO CLÍNICO DO AVC — a forma que TODA superfície usa.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela.
 *
 * ── POR QUE ISTO SAIU DE `superficie-a.ts` (2026-08-28) ────────────────────
 *
 * Enquanto existia uma superfície só, tipo e conteúdo podiam morar juntos. Com
 * a Superfície B, `valorDaOpcao` seria escrita DUAS vezes — e o comentário que
 * ela carrega diz exatamente o que acontece quando as duas divergem: um rótulo
 * novo cai cru no estado e `ternario()`, que só conhece `sim`/`nao`/`nao_sei`,
 * o lê como **não**. Duas cópias de um de-para é a mesma família da I6 (cálculo
 * em dois lugares): as duas "funcionam", e a que decide é a errada.
 *
 * ⚠️ Isto ⛔ NÃO é motor genérico do app (§9.1). É o vocabulário de UM módulo, e
 * ⛔ não sai de `avc/` enquanto um segundo módulo clínico não exigir o mesmo de
 * forma independente.
 */

import type { SuperficieId } from "../nucleo/tipos";

/** Como o campo é preenchido. ⛔ Nunca caixa de texto para valor clínico (§0.3). */
export type TipoDeCampo =
  /** Grandeza: barra + ajuste fino. `0` = não informado até a interação (§0.2). */
  | "grandeza"
  /** Escolha tocável. `0` não se aplica; ⛔ sem texto livre (§7.6). */
  | "escolha"
  /** Hora e minuto. ⛔ Nunca barra deslizante (§7.5). */
  | "hora"
  /**
   * Vários achados que coexistem no mesmo paciente (§7.6).
   *
   * ⚠️ ⛔ NÃO é escolha única "por conveniência de implementação": é o contrário
   * — usar escolha única onde a clínica permite coexistência obrigaria o médico
   * a eleger UM achado entre os que ele está vendo ao mesmo tempo.
   */
  | "multipla"
  /**
   * Instrumento com itens próprios, aberto e preenchido item a item.
   *
   * ⚠️ A definição dos itens ⛔ NÃO mora no campo: mora na calculadora, com
   * fonte (ver `avc/conteudo/nihss.ts`). O campo só declara que é escala.
   */
  | "escala"
  /**
   * Grau de uma escala com DESCRITOR — uma escolha por linha, ⛔ não um chip.
   *
   * ⚠️ O número sozinho ⛔ não se responde: "mRS 3" só significa alguma coisa
   * para quem tem a tabela na cabeça, e o pedido do autor foi exatamente esse —
   * o descritor tem de estar visível no momento de escolher.
   */
  | "grau"
  /**
   * ⚠️⚠️ TEXTO LIVRE — e ele existe para **um** caso, com trava própria.
   *
   * ⛔⛔ §0.3 PROÍBE CAIXA DE TEXTO PARA VALOR CLÍNICO, e a proibição continua
   * inteira: um valor clínico digitado ⛔ não tem opções, ⛔ não tem os três vazios
   * de E-37, ⛔ não tem faixa e ⛔ não se deriva. É a porta por onde entra conteúdo
   * sem fonte.
   *
   * ⚠️ O único campo que o usa é a **identificação do paciente**, que ⛔ não é
   * afirmação clínica — é `natureza: "administrativo"`.
   *
   * ⚠️ **A prova de cada superfície reprova `texto` em campo clínico.** Sem essa
   * trava, este tipo seria a maior regressão possível do módulo.
   */
  | "texto"
  /**
   * ⚠️⚠️ NÚMERO DIGITADO DIRETAMENTE — ⛔ sem barra, e com ajuste por ±.
   *
   * ── A FRONTEIRA DE §0.3, fixada pelo autor em 2026-08-30 ────────────────
   *
   * > *"Entrada numérica estruturada ⛔ não é texto livre. Um valor clínico pode
   * > ser digitado diretamente quando o campo declara tipo numérico, unidade
   * > quando aplicável, semântica explícita de ⛔ não informado, validação
   * > determinística e arredondamento compatível com o passo."*
   *
   * ⚠️ **Por que ⛔ não é `grandeza`:** a barra sugere **contínuo** e **faixa
   * normal**. Num analito de laboratório isso é falso — os cortes de F-10 são
   * **limiares de decisão**, e ⛔ não faixas de normalidade. E o gesto real do
   * médico é **transcrever** um número do laudo, ⛔ não deslizar até ele.
   *
   * ⛔ E o `min`/`max` da faixa aqui é **técnico**: ⛔ não aparece na tela, ⛔ não
   * vira mensagem de limite e ⛔ não alimenta derivação.
   */
  | "numerico";

/**
 * A faixa de uma grandeza — ⚠️⚠️ é **LIMITE TÉCNICO DE ENTRADA**, e ⛔ NUNCA
 * limite clínico.
 *
 * ── REFORÇADO PELO AUTOR EM 2026-08-30 ────────────────────────────────────
 *
 * > *"Os cortes clínicos da regra e os limites do controle são coisas
 * > completamente diferentes. O corte pode ser `INR > 1,7`; isso ⛔ não significa
 * > que o INR máximo registrável seja 8."*
 *
 * ⚠️ Eu havia proposto faixas "plausíveis" para os analitos de laboratório —
 * INR 0,8–8, plaquetas até 1.000.000 — escolhidas por conveniência de barra. Um
 * laboratório que reporte valor acima do teto deixaria o médico **sem como
 * registrar um resultado verdadeiro**, e é a mesma família de **E-52**: o
 * componente numérico fabricando ausência onde há informação.
 *
 * ⛔ O teto existe porque o controle precisa de um; ⛔ ele ⛔ não é afirmação
 * clínica, ⛔ não aparece na tela como faixa, e ⛔ não é fonte de ⛔ nenhuma regra.
 *
 * ⚠️⚠️ LEIA ANTES DE MEXER: estes números existem só para a barra ter começo e
 * fim. ⛔ Nenhum deles significa "normal", "seguro" ou "tratável". As faixas são
 * deliberadamente MAIS LARGAS que o plausível, porque uma barra que não alcança
 * o valor real do paciente é pior que uma barra larga: ela obriga o médico a
 * registrar um número falso.
 *
 * ⚠️⚠️ ⛔ NÃO EXISTE "POSIÇÃO DE PARTIDA". Enquanto ninguém tocou, o polegar fica
 * no `min` e o valor lido é **não informado** (§0.2).
 */
export type Faixa = {
  readonly min: number;
  readonly max: number;
  /** Incremento de −/+. ⚠️ Fino de propósito: a barra faz o grosso. */
  readonly passo: number;
};

/**
 * ⚠️⚠️ A TEMPORALIDADE DE UM FATO — decidida pelo autor em 2026-08-29, e ela
 * SUBSTITUIU um booleano `repetivel` que eu havia proposto.
 *
 * ⚠️ O booleano ⛔ não dava conta de três coisas diferentes, e a terceira foi ele
 * quem nomeou: *"'ainda ⛔ não realizada' às 14h e 'realizada' às 15h ⛔ não são
 * contraditórios ⛔ nem correção. Ambos foram verdadeiros em seus momentos."*
 *
 * ⚠️ É ela que decide **qual operação de §7.16 a tela oferece**.
 */
export type Temporalidade =
  /** Há UMA verdade. Valor novo diz que o anterior ⛔ nunca foi verdade ⇒ **correção**. */
  | "estavel"
  /**
   * Observação **de um evento**, que convive com as anteriores ⇒ **nova aferição**.
   *
   * ⚠️⚠️ EXIGE INSTÂNCIA. Um INR sem coleta e um achado sem estudo ficam órfãos:
   * duas TCs produzem dois resultados, e sem a instância ninguém sabe qual achado
   * pertence a qual exame.
   */
  | "afericao"
  /** Estados **sucessivos** do episódio, cada um verdadeiro no seu instante. */
  | "estado";

/**
 * ⚠️ A NATUREZA DO CAMPO — e ela existe por causa de **um** caso.
 *
 * ⚠️⚠️ `identificacao` é o primeiro campo ⛔ NÃO CLÍNICO do módulo, e a regra de
 * que todo campo aponta para um slot `F-nn` (**E-30**) ⛔ não pode ser afrouxada
 * para todos só porque um deles ⛔ não é afirmação clínica. Declarar a natureza
 * é o que mantém a exigência de pé para os outros 50.
 */
export type NaturezaDoCampo = "clinico" | "administrativo";

export type Campo = {
  readonly id: string;
  /**
   * ⚠️⚠️ A CASA SEMÂNTICA — **onde o fato mora**, que ⛔ NÃO é onde ele é
   * preenchido (decisão do autor, 2026-08-29).
   *
   * > *"Um fato tem um único id e uma única casa semântica. Qualquer superfície
   * > que precise dele pode mostrar o valor ou permitir preenchê-lo, sempre
   * > escrevendo no mesmo fato e na mesma trilha."*
   *
   * ⚠️ **⛔ NÃO SE ESCREVE CAMPO A CAMPO**: `comCasa()` carimba o módulo inteiro.
   * Escrita à mão, ela poderia discordar do arquivo — e um campo declarando casa
   * errada é a duplicação voltando com outro nome.
   *
   * ⚠️ E a regra que a protege: **o fato pertence à espécie dele; a decisão
   * apenas o consome.** ⛔ Sem isso, em três superfícies o DOAC vira "da
   * trombólise", o mRS vira "da trombectomia" e a creatinina vira "do contraste".
   */
  readonly casa: SuperficieId;
  /** ⚠️ Qual operação de §7.16 este campo aceita. */
  readonly temporalidade: Temporalidade;
  /** ⚠️ Ausente equivale a `"clinico"` — o caso comum. */
  readonly natureza?: NaturezaDoCampo;
  /**
   * ⚠️⚠️ ESTE CAMPO **QUALIFICA OUTRO**, e ⛔ não é medida independente.
   *
   * ── POR QUE ISTO EXISTE (autor, 2026-08-30) ─────────────────────────────
   *
   * > *"`plaquetas_unidade` ⛔ não precisa ser um fato clínico independente no
   * > mesmo sentido de INR. É metadado da grandeza informada. Separar demais
   * > cria a possibilidade de a unidade de uma aferição ser acidentalmente
   * > associada ao valor de outra."*
   *
   * ⚠️ `80` **+** `mil/mm³` constituem **uma** medida. A derivação lê a unidade
   * **da mesma instância** do valor, e ⛔ nunca globalmente — e a prova constrói
   * duas coletas com unidades diferentes para exigir isso.
   */
  readonly atributoDe?: string;
  /**
   * ⚠️⚠️ ESTE CAMPO PERTENCE A UM **EVENTO COMPOSTO**, e o nome dele é este.
   *
   * ⚠️ Campos que compartilham `instanciaDe` são **metades da mesma aferição**:
   * `pas` e `pad` de uma medida, `inr` e `plaquetas` de uma coleta, os achados
   * de um estudo. Todo fato desses campos carrega a `instancia` a que pertence,
   * e a prova reprova o que a esquecer.
   *
   * ⚠️ Ausente = o fato se basta sozinho. É o caso da maioria.
   */
  readonly instanciaDe?: string;
  readonly rotulo: string;
  readonly tipo: TipoDeCampo;
  /** Para `escolha` e `multipla`: as opções, em PT. ⚠️ Sempre com saída para quem não sabe. */
  readonly opcoes?: readonly string[];
  /**
   * Para `multipla`: as opções que ⛔ NÃO coexistem com nenhuma outra.
   *
   * ⚠️ "Nenhum desses" e "Não sei" são estados do EXAME INTEIRO, ⛔ não achados
   * ao lado dos outros. Sem declará-los, "nenhum desses + tosse ineficaz" seria
   * um registro possível — e ⛔ não existe paciente assim.
   */
  readonly exclusivas?: readonly string[];
  readonly unidade?: string;
  /** Para `grandeza`: os limites da barra. ⛔ Nunca limites clínicos (ver `Faixa`). */
  readonly faixa?: Faixa;
  /**
   * Frase curta e **permanente** sob o rótulo, quando a pergunta sozinha é
   * ambígua o bastante para gerar resposta errada.
   *
   * ⚠️ USAR COM PARCIMÔNIA. Texto explicativo permanente rouba a leitura de
   * relance que a porta do pronto-socorro exige (§7.3). O que é fidelidade à
   * fonte vai em `nota`, atrás do ⓘ; aqui só entra o que muda a RESPOSTA.
   */
  readonly ajuda?: string;
  /**
   * ⚠️ O campo aceita **DESCONHECIDO como RESPOSTA** (§7.5 item 6, **E-02**).
   *
   * ⚠️⚠️ ⛔ NÃO É "pode ficar em branco" — todo campo pode. É o contrário: é
   * declarar que "ninguém sabe dizer" é uma resposta clínica COM CONSEQUÊNCIA
   * PRÓPRIA, diferente de "ainda não perguntei".
   */
  readonly aceitaDesconhecido?: true;
  /**
   * ⚠️⚠️ **E-10 · O ZERO DESTA GRANDEZA É RESPOSTA CLÍNICA**, ⛔ não ausência.
   *
   * §0.2 declara duas famílias de campo numérico com semânticas OPOSTAS para o
   * mesmo dígito: em peso, PAS e glicemia o zero inicial é "ainda não
   * informado"; em **escala e escore** — NIHSS total, item do NIHSS, mRS — o
   * zero é **resposta legítima**, e frequentemente a mais importante.
   *
   * ⚠️ ISTO TEM CONSEQUÊNCIA DE CONTROLE, e é por isso que é declarado no
   * conteúdo e ⛔ não deduzido na tela: com o polegar no mínimo, o botão `−` do
   * `NumericStepper` nasce DESABILITADO (`noMinimo`), e `+` sobe para 1. Sem
   * uma porta explícita, "NIHSS 0" — o escore do paciente da Table 4, cuja
   * população é justamente **NIHSS 0–5** — só seria registrável soltando a
   * barra exatamente onde ela já está, ou passando por um `1` que ninguém
   * mediu e que ficaria na trilha como medida.
   *
   * ⛔ Marcar isto numa grandeza comum reintroduziria o valor predeterminado
   * que §0.2 proíbe: um toque em "registrar 0" num campo de peso gravaria um
   * peso de 0 kg. Só escala e escore.
   */
  readonly zeroValido?: true;
  /** Qual relógio clínico este campo alimenta — ⛔ nunca um genérico (E-36). */
  readonly relogio?: string;
  /**
   * O slot que sustenta a existência clínica do campo (**E-30**).
   *
   * ⚠️ Vazio ⛔ **só** é aceitável em campo `natureza: "administrativo"` — e a
   * prova de cada superfície confere exatamente isso, campo a campo.
   */
  readonly fonte: string;
  /**
   * ⚠️ SEMPRE `false` — em TODAS as superfícies.
   *
   * Se algum dia alguém puser `true`, o campo tem de ser conferido contra as
   * doze marcas 🚫 de `CONSOLIDACAO-CLINICA-AVC.md`, e as provas de superfície
   * reprovam o arquivo se aparecer um `true` sem passar por lá (E-49).
   */
  readonly bloqueiaTerapia: false;
  /**
   * ⚠️ A LISTA DE OPÇÕES NASCE FECHADA, e o VALOR ESCOLHIDO fica visível.
   *
   * ⚠️⚠️ ⛔ NÃO É PARA ESCONDER PERGUNTA — §7.3 proíbe conteúdo decisório nascendo
   * recolhido, e a prova de cada superfície confere isso campo a campo. É para a
   * lista LONGA de um campo que só importa quando há achado: o sítio da oclusão
   * tem onze opções e ocupa 682 px num celular de 375, um quarto da superfície
   * inteira, para uma pergunta que ⛔ não se responde na maioria dos casos.
   *
   * ⚠️ O que fica atrás do toque é a LISTA, ⛔ nunca a resposta: a linha fechada
   * mostra o que foi escolhido — o mesmo comportamento que o `grau` do mRS já
   * tinha, agora declarado no conteúdo em vez de deduzido do tipo.
   */
  readonly recolhivel?: true;
  /**
   * ⚠️ Como se chama o gesto de correção DESTE campo — ⛔ quando "Corrigir
   * resultado" ⛔ não descreve o que está sendo corrigido.
   *
   * ⚠️⚠️ `plaquetas_unidade` é o caso: o médico ⛔ não corrige um **resultado**, ele
   * corrige a **unidade** em que o resultado foi lido. Botão que mente sobre o
   * que faz é botão que ⛔ não vai ser tocado — ou vai ser tocado por engano.
   */
  readonly rotuloDeCorrecao?: string;
  /** Nota de fidelidade quando a fonte exige cuidado de leitura. */
  /**
   * ⚠️⚠️ APARECE SÓ QUANDO O CONTEXTO EXISTE — ⛔ e é DADO, ⛔ não função.
   *
   * ⚠️ Nasceu do marco de wake-up: ele é necessário à janela estendida ⛔ e
   * seria ruído na esmagadora maioria dos atendimentos. ⛔ Esconder ⛔ não é
   * apagar — o campo existe, ⛔ e a condição é legível ⛔ e conferível.
   *
   * ⛔ Uma função aqui tornaria o conteúdo impossível de carregar numa trava.
   */
  readonly apareceQuando?: { readonly campo: string; readonly valor: string };
  readonly nota?: string;
};

/**
 * O QUE SE **ESCREVE** num módulo de conteúdo — ⚠️ tudo menos a casa.
 *
 * ⚠️⚠️ A CASA ⛔ NÃO SE DIGITA. Ela é carimbada por `comCasa()`, uma vez por
 * módulo. Escrita campo a campo, ela poderia discordar do arquivo que a declara
 * — e um campo dizendo morar noutra casa é a duplicação voltando disfarçada.
 */
export type CampoDeclarado = Omit<Campo, "casa">;

/** Um bloco de campos, como o módulo o escreve. */
export type GrupoDeclarado = {
  readonly id: string;
  readonly titulo: string;
  /** Campos que este módulo POSSUI. ⚠️ Recebem a casa dele. */
  readonly campos: readonly CampoDeclarado[];
  /**
   * ⚠️⚠️ CAMPOS DE OUTRA CASA, exibidos e preenchíveis AQUI — a segunda metade da
   * regra do autor (2026-08-29):
   *
   * > *"Propriedade do fato ⛔ não é local de preenchimento. Qualquer superfície
   * > que precise dele pode mostrar o valor ou permitir preenchê-lo, sempre
   * > escrevendo no mesmo fato e na mesma trilha."*
   *
   * ⚠️ Eles chegam **já carimbados** pela casa deles, e `comCasa()` ⛔ **não** os
   * toca. É por isso que o emprestado ⛔ não precisa de marcador próprio: a
   * própria `casa` diferente da superfície já o identifica — e ⛔ não há como um
   * empréstimo virar declaração por descuido.
   *
   * ⛔⛔ E ⛔ NUNCA uma segunda versão do campo: é o **mesmo objeto**, com o mesmo
   * id, os mesmos rótulos e as mesmas opções. Copiar o campo para cá seria
   * recriar exatamente a duplicação que esta arquitetura existe para matar.
   */
  readonly emprestados?: readonly Campo[];
  readonly nota?: string;
  readonly recolhido?: true;
};

export type Grupo = Omit<GrupoDeclarado, "campos"> & { readonly campos: readonly Campo[] };

/** ⚠️ Tudo que o bloco DESENHA — o que ele possui mais o que ele toma emprestado. */
export function camposDoGrupo(g: Grupo): readonly Campo[] {
  return [...g.campos, ...(g.emprestados ?? [])];
}

/**
 * ⚠️ O campo aparece? ⛔ Sem condição declarada, SEMPRE — o padrão ⛔ não é
 * esconder. ⚠️ A leitura do valor entra por argumento para este módulo seguir
 * sendo conteúdo puro, carregável em qualquer trava ⛔ sem arrastar o estado.
 */
export function campoAparece(c: Campo, valorDe: (campo: string) => unknown): boolean {
  if (!c.apareceQuando) return true;
  return valorDe(c.apareceQuando.campo) === c.apareceQuando.valor;
}

/**
 * CARIMBA A CASA em todos os campos de todos os blocos de um módulo.
 *
 * ⚠️ Uma linha por módulo, e ⛔ nenhuma por campo: é o que torna **impossível** um
 * campo declarar casa errada, em vez de apenas improvável.
 */
export function comCasa(casa: SuperficieId, grupos: readonly GrupoDeclarado[]): readonly Grupo[] {
  return grupos.map((g) => ({ ...g, campos: g.campos.map((c) => ({ ...c, casa })) }));
}

/**
 * OS DOIS ROTULOS EXCLUSIVOS DA SELEÇÃO MÚLTIPLA — ⚠️ fonte única.
 *
 * ⚠️ Eles são lidos em DOIS lugares: o conteúdo os oferece como opção, e a
 * derivação precisa saber que "Nenhum desses" ⛔ não é um achado. Escritos duas
 * vezes, bastaria mudar um deles para a derivação passar a contar "Nenhum
 * desses" como achado presente — negativa virando positiva em silêncio.
 */
export const SEM_ACHADOS = "Nenhum desses";
export const NAO_SEI = "Não sei";
export const EXCLUSIVAS_PADRAO = [SEM_ACHADOS, NAO_SEI] as const;

/** ⚠️ As três respostas que nunca colapsam (E-23, §7.7). */
export const SIM_NAO_NAO_SEI = ["Sim", "Não", "Não sei"] as const;

/**
 * A mesma tríade, com a saída chamada **Incerto**.
 *
 * ⚠️ POR QUE UM SEGUNDO CONJUNTO EM VEZ DE TRADUZIR "Não sei": em achado que o
 * médico está **examinando agora**, "não sei" soa a falha de anamnese e empurra
 * para um "Não" apressado. "Incerto" é a resposta honesta de quem olhou e não
 * concluiu — e é justamente ela que ⛔ não pode virar "Não" (E-23).
 */
export const SIM_NAO_INCERTO = ["Sim", "Não", "Incerto"] as const;

/**
 * Rótulo de opção → valor gravado na trilha.
 *
 * ⚠️ MORA AQUI, ⛔ NÃO NA TELA, e ⛔ NÃO EM DUAS CÓPIAS. A tela já fez este
 * de-para inline uma vez; se alguém acrescentasse uma opção lá, ela cairia crua
 * no estado e `ternario()` — que só conhece `sim`, `nao_perguntado` e `nao_sei`
 * — a leria como **não**. Um rótulo novo viraria negativa silenciosa, que é
 * exatamente o que E-23 proíbe.
 *
 * ⚠️ `Incerto` e `Não sei` gravam o MESMO valor de propósito: para o motor as
 * duas são a ausência de conclusão. A diferença é de linguagem na tela, e é a
 * tela que a desfaz de volta em `opcaoDoValor`.
 *
 * ⚠️ Um rótulo que ⛔ não está aqui volta como ele mesmo — é o caso dos campos de
 * **vocabulário próprio** (origem do peso, lateralidade, mRS). Eles ⛔ não podem
 * ser lidos por `ternario()`, e as provas de superfície conferem isso.
 */
export function valorDaOpcao(opcao: string): string {
  switch (opcao) {
    case "Sim":
      return "sim";
    case "Não":
      return "nao";
    case "Não sei":
    case "Incerto":
      return "nao_sei";
    default:
      return opcao;
  }
}

/** O rótulo que este campo usa para um valor gravado — ⛔ nunca o valor cru. */
export function opcaoDoValor(campo: Campo, valor: string): string | undefined {
  return campo.opcoes?.find((o) => valorDaOpcao(o) === valor);
}
