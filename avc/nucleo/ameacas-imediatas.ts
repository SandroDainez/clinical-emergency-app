/**
 * AMEAÇAS IMEDIATAS — a checagem que vem **antes** do protocolo.
 *
 * ── ⚠️⚠️ O QUE ORIGINOU ────────────────────────────────────────────────────
 *
 * > *"⛔ Não seria mais interessante uma avaliação inicial de riscos iminentes
 * > ⛔ e estabilização antes de prosseguir? Porque o princípio de atendimento
 * > emergencial é estabilização — ⛔ não adianta seguir um fluxo bonito ⛔ e bem
 * > feito com a deterioração ⛔ sem intervenção."* — autor, 2026-09-06
 *
 * ⚠️⚠️ ⛔ ELE ESTAVA CORRIGINDO UM ERRO MEU. ⛔ Eu havia posto o card da
 * tomografia como **primeiro bloco do módulo** — ⛔ e, com isso, a imagem passou
 * a valer mais que a via aérea. ⚠️ A regra mestra do app (`PRIORIDADE_A`) já
 * dizia o contrário desde 2026-08-30: *"Avaliar ⛔ e tratar ameaças imediatas
 * antes de avançar no fluxo"* — ⛔ mas ela era uma faixa cinza **abaixo** do
 * card que a contradizia.
 *
 * ── ⚠️⚠️ O QUE ESTE ARQUIVO ⛔ NÃO FAZ ──────────────────────────────────────
 *
 * ⛔ **⛔ Não inventa limiar.** ⚠️ Para via aérea ⛔ e respiração, o **próprio
 * campo** pergunta pela ameaça (*"nível de consciência rebaixado?"*), ⛔ então
 * a resposta *"sim"* **é** o achado — ⛔ sem corte ⛔ nenhum. ⚠️ Para pressão ⛔ e
 * glicemia, quem decide é `bloqueiosCorrigiveis`, com os cortes transcritos
 * (F-04, F-06). ⛔ ⛔ Nenhum número nasce aqui (**E-31**).
 *
 * ⛔ **⛔ Não trava ⛔ nada (E-11).** ⚠️ Ele **ordena a atenção**, ⛔ e ⛔ não o
 * acesso: qualquer fase continua abrindo de qualquer outra. ⛔ Estabilização
 * primeiro é prioridade **visual ⛔ e clínica**, ⛔ e ⛔ não um portão.
 *
 * ⛔ **⛔ Não afirma por ausência (E-23).** ⚠️ Eixo ⛔ não avaliado é
 * `nao_avaliado` — ⛔ e ⛔ nunca *"sem ameaça"*.
 */
import type { EstadoAvc } from "./estado";
import { numero } from "./leitura";
import { oxigenio, pressaoArterial, suporteDeViaAerea } from "./derivacoes";
import { bloqueiosCorrigiveis } from "./derivacoes-d";
import { CORTES_GLICEMICOS, type CorteGlicemico } from "../conteudo/correcao-glicemica";

/**
 * ⚠️⚠️ TRÊS ESTADOS, ⛔ e ⛔ não dois.
 *
 * ⛔ *"⛔ Não avaliado"* ⛔ e *"avaliado, sem ameaça"* ⛔ não podem parecer a mesma
 * coisa: ⛔ um é trabalho pendente, o outro é um **achado negativo** (**E-37**).
 *
 * ── ⚠️⚠️ ⛔ E O QUARTO NASCEU DE UM DEFEITO CLÍNICO (2026-09-06) ────────────
 *
 * ⛔ Relato do autor: *"aparece PA ⛔ e glicemia como ⛔ não sendo ameaça apesar
 * de estarem muito fora do padrão de normalidade"*. ⚠️ Na captura: **PA 80/46**
 * ⛔ e **glicemia 579** — ⛔ os dois com **✓ avaliado**.
 *
 * ⛔ **A causa:** C ⛔ e D perguntavam à lista de **bloqueios da trombólise** se
 * havia bloqueio, ⛔ e liam *"⛔ não há"* como *"⛔ não há ameaça"*. ⚠️ São coisas
 * diferentes: o corte de F-04 é **pré-IVT** (≥185/110) ⛔ e ⛔ não define
 * *"pressão normal"*; a hiperglicemia **⛔ não bloqueia** a trombólise ⛔ e mesmo
 * assim a fonte manda tratá-la.
 *
 * ⚠️⚠️ ⛔ E O AVISO JÁ ESTAVA ESCRITO NESTE ARQUIVO, três linhas acima do
 * defeito: *"Medida ⛔ sem bloqueio ⛔ não vira 'sem ameaça' automaticamente"*.
 * ⛔ **Comentário ⛔ não executa** — ⛔ é a terceira vez hoje.
 *
 * ⚠️ `medido` é o que o app pode dizer ⛔ sem inventar limiar: **há número, ⛔ e a
 * fonte que este módulo transcreve ⛔ não prescreve ⛔ nada para ele**. ⛔ Ele ⛔ não
 * carrega ✓, porque ✓ é afirmação, ⛔ e o app ⛔ não tem como afirmar.
 */
export type EstadoDaAmeaca = "nao_avaliado" | "sem_ameaca" | "medido" | "ameaca";

export type AmeacaImediata = {
  readonly id: string;
  /** ⚠️ A letra do ABCDE — ⛔ e ⛔ ela ⛔ não cobre tudo, o que a nota já diz. */
  readonly letra: string;
  readonly nome: string;
  readonly estado: EstadoDaAmeaca;
  /** ⚠️ O que se lê quando há ameaça — ⛔ vem da derivação, ⛔ e ⛔ não da tela. */
  readonly achado?: string;
  /** ⚠️ Onde se resolve — ⛔ toda ameaça leva a um campo (**E-26**). */
  readonly campo: string;
  /**
   * ⚠️⚠️ ⛔ O QUE FAZER — ⛔ e ⛔ ele existe porque o autor apontou o buraco:
   *
   * > *"apareceu ameaça registrada, porém ⛔ não oferece caminho para
   * >  tratamento das ameaças que foram registradas"*
   *
   * ⛔ O eixo dizia **que** havia ameaça ⛔ e parava aí. ⚠️ A frase vem da
   * **fonte transcrita** (F-04, F-06, F-18, F-19), ⛔ e ⛔ nunca da tela.
   */
  readonly conduta?: string;
  /**
   * ⚠️ Para qual superfície a conduta leva. ⛔ `undefined` quando o tratamento
   * ⛔ não mora em outra tela — ⛔ aí o caminho é o próprio campo.
   */
  readonly leva?: string;
  /**
   * ⚠️⚠️ O VALOR MEDIDO — ⛔ e ⛔ ele mora AQUI, ⛔ e ⛔ não num card à parte.
   *
   * ⛔ **O defeito que isto desfaz:** PA ⛔ e glicemia apareciam em **dois
   * blocos**, separados pelo card da tomografia — o **número** num, o
   * **julgamento** no outro. ⚠️ Com PA 198/112, o médico lia *"198/112"* num
   * lugar ⛔ e *"acima da meta pré-trombólise"* noutro, ⛔ e precisava cruzar os
   * dois para entender um fato só.
   *
   * ⛔ `undefined` nos eixos que ⛔ não têm número (via aérea, respiração):
   * ⛔ eles ⛔ não medem — ⛔ eles observam.
   */
  readonly valor?: string;
  readonly unidade?: string;
};

/**
 * ⚠️⚠️ ⛔ ESTE ARQUIVO ⛔ NÃO LÊ CAMPO POR CONTA PRÓPRIA — corrigido em
 * 2026-09-06, ⛔ e a correção veio de auditoria.
 *
 * ── ⛔ O BUG QUE ISTO DESFAZ ────────────────────────────────────────────────
 *
 * ⛔ A primeira versão tinha um `respostaSim()` local: *"se o valor ⛔ não é
 * `sim`, ⛔ então é `sem_ameaca`"*. ⚠️ Três formas de errar, ⛔ e a pior delas
 * ⛔ **afirmava o negativo**:
 *
 *   ⛔ **`disfuncao_bulbar` é seleção MÚLTIPLA.** O estado guarda os rótulos
 *      unidos por separador — ⛔ nunca `"sim"`. ⚠️ Um paciente com tosse
 *      ineficaz ⛔ e acúmulo de saliva caía no `else` ⛔ e a tela desenhava
 *      **✓ "Avaliado"** na via aérea dele.
 *   ⛔ **`nao_perguntado`** (o valor que o desfazer grava) ⛔ também caía no
 *      `else` — campo desfeito lia como avaliado.
 *   ⛔ **`"incerto"`** ⛔ nunca chega ao estado: `valorDaOpcao("Incerto")` grava
 *      `"nao_sei"`. ⛔ A comparação era morta.
 *
 * ⚠️⚠️ ⛔ E O AVISO JÁ ESTAVA ESCRITO, em `leitura.ts`: *"⛔ NUNCA LER ESSE
 * CAMPO POR `ternario()`: cinco achados presentes lidos como 'não há
 * disfunção'. É a negativa silenciosa que **E-23** proíbe, na pergunta que
 * decide via aérea."* ⛔ Eu reimplementei a leitura por fora ⛔ e caí nela.
 *
 * ⚠️ Agora os eixos A ⛔ e B **reusam as derivações que já existem**
 * (`suporteDeViaAerea`, `oxigenio`) — ⛔ uma verdade por fato (**I6**).
 */
function daConclusao(conclusao: string): EstadoDaAmeaca {
  if (conclusao === "sim") return "ameaca";
  if (conclusao === "nao") return "sem_ameaca";
  /** ⛔ `desconhecido` ⛔ e qualquer outro ⛔ não viram achado negativo (**E-37**). */
  return "nao_avaliado";
}

/**
 * ⚠️⚠️ OS QUATRO EIXOS — ⛔ e ⛔ eles ⛔ não são "o ABCDE inteiro".
 *
 * ⚠️ São os eixos que **esta tela registra**, ⛔ e a nota de `PRIORIDADE_A` já
 * declara isso: *"os blocos seguem a ordem do ABCDE onde há correspondência com
 * o que esta tela registra"*. ⛔ Prometer um ABCDE completo aqui seria promessa
 * que o conteúdo ⛔ não sustenta.
 */
/**
 * ⚠️⚠️ ⛔ EM QUE CORTE TRANSCRITO ESTE NÚMERO CAI — ⛔ e ⛔ nenhum limiar nasce
 * aqui: ⛔ os quatro números (50, 60, 180, 400) vêm escritos na `faixa` de cada
 * corte, ⛔ e a trava confere que a frase ⛔ e o número dizem o mesmo.
 *
 * ⚠️ `de` inclusivo, `ate` exclusivo — ⛔ 60 é *"de 60 a 180"*, ⛔ e ⛔ não
 * *"abaixo de 60"*.
 */
function corteGlicemico(g: number | undefined): CorteGlicemico | undefined {
  if (g === undefined) return undefined;
  return CORTES_GLICEMICOS.find(
    (c) => (c.de === undefined || g >= c.de) && (c.ate === undefined || g < c.ate)
  );
}

export function ameacasImediatas(estado: EstadoAvc): readonly AmeacaImediata[] {
  const bloqueios = bloqueiosCorrigiveis(estado);
  const bloqueio = (id: string) => bloqueios.find((b) => b.id === id);

  const viaAerea = ((): AmeacaImediata => {
    /**
     * ⚠️ `suporteDeViaAerea` já combina consciência ⛔ e disfunção bulbar, ⛔ e
     * já lê a seleção múltipla do jeito certo (`selecaoDe`). ⛔ Reimplementar
     * daria **duas verdades** sobre a mesma via aérea (**I6**).
     */
    const l = suporteDeViaAerea(estado);
    const estadoDoEixo = daConclusao(l.conclusao);
    return {
      id: "via_aerea",
      letra: "A",
      nome: "Via aérea",
      estado: estadoDoEixo,
      /** ⚠️ A frase curta é da derivação — ⛔ a tela ⛔ não reescreve o achado. */
      achado: estadoDoEixo === "ameaca" ? l.curto : undefined,
      /** ⚠️ A conduta é a **frase longa da própria leitura** — ⛔ nada novo. */
      conduta: estadoDoEixo === "ameaca" ? l.texto : undefined,
      campo: "consciencia_rebaixada",
    };
  })();

  const respiracao = ((): AmeacaImediata => {
    const l = oxigenio(estado);
    const estadoDoEixo = daConclusao(l.conclusao);
    return {
      id: "respiracao",
      letra: "B",
      nome: "Respiração",
      estado: estadoDoEixo,
      achado: estadoDoEixo === "ameaca" ? l.curto : undefined,
      conduta: estadoDoEixo === "ameaca" ? l.texto : undefined,
      campo: "hipoxia",
    };
  })();

  /**
   * ⚠️⚠️ C ⛔ e D usam os CORTES TRANSCRITOS, ⛔ e ⛔ nenhum inventado aqui.
   *
   * ⛔ Medida ⛔ sem bloqueio ⛔ não vira *"sem ameaça"* automaticamente: o corte
   * de F-04 é **pré-trombólise**, ⛔ e ⛔ não define "pressão normal". ⚠️ O que
   * este eixo diz é: *há bloqueio corrigível registrado?* — ⛔ e ⛔ nada além.
   *
   * ⚠️⚠️ ⛔ E *"MEDIDA"* USA `numero()`, ⛔ e ⛔ não `valor !== undefined`: ⛔ um
   * fato **sempre** tem valor — inclusive `"nao_perguntado"` —, ⛔ e a checagem
   * anterior dava *"avaliado"* para um campo que o médico havia desfeito.
   */
  const pressao = ((): AmeacaImediata => {
    const b = bloqueio("pressao_acima_da_meta");
    /**
     * ⚠️ As duas metades vêm da **mesma aferição** — ⛔ e ⛔ é por isso que o
     * valor sai de `pressaoArterial()`, ⛔ e ⛔ não de dois `numero()` soltos:
     * a sistólica das 14h com a diastólica das 15h daria uma pressão que
     * ⛔ nunca existiu (D-120).
     */
    const m = pressaoArterial(estado).medida;
    return {
      id: "pressao",
      letra: "C",
      nome: "Pressão arterial",
      /**
       * ⚠️⚠️ ⛔ **⛔ NUNCA `sem_ameaca`** — ⛔ e ⛔ é aqui que estava o defeito.
       *
       * ⛔ O único corte que este módulo transcreve para a PA é o **pré-IVT**
       * (≥185/110, F-04). ⚠️ ⛔ Ele responde *"precisa baixar antes de
       * trombolisar?"*, ⛔ e ⛔ **⛔ não** *"esta pressão está boa?"*. ⛔ Uma PA de
       * **80/46** ⛔ não cruza esse corte — ⛔ e ⛔ o app desenhava ✓.
       *
       * ⚠️ ⛔ E o app ⛔ não vai passar a acender por hipotensão: ⛔ **⛔ nenhuma
       * fonte transcrita aqui dá limiar inferior**, ⛔ e inventá-lo seria a
       * conduta nascendo na tela (**E-31**). ⛔ O que ⛔ ele para de fazer é
       * **afirmar o contrário**.
       */
      estado: b ? "ameaca" : m ? "medido" : "nao_avaliado",
      achado: b?.formulacao,
      conduta: b ? "Abrir Correções — a fonte traz os agentes e as doses" : undefined,
      leva: b ? "correcoes" : undefined,
      campo: "pas",
      valor: m ? `${m.pas}/${m.pad}` : undefined,
      unidade: "mmHg",
    };
  })();

  const glicemia = ((): AmeacaImediata => {
    /**
     * ⚠️⚠️ ⛔ ELE ⛔ NÃO PERGUNTA MAIS À LISTA DE **BLOQUEIOS** — ⛔ e essa troca
     * é a correção inteira.
     *
     * ⛔ `bloqueiosCorrigiveis` responde *"o que segura a trombólise?"*, ⛔ e ⛔ só
     * a **hipoglicemia <60** segura. ⚠️ A hiperglicemia **⛔ não bloqueia** — ⛔ a
     * própria transcrição escreve isso — ⛔ e mesmo assim a fonte manda agir:
     * *"avaliar necessidade de tratamento, ⛔ sem atrasar a reperfusão"* acima
     * de 180, ⛔ e *"corrigir, investigar cetoacidose ⛔ ou estado
     * hiperosmolar"* acima de 400.
     *
     * ⛔ Lendo a lista errada, **579 mg/dL** saía com **✓ avaliado**.
     *
     * ⚠️ Agora ⛔ ele lê `CORTES_GLICEMICOS` — ⛔ os mesmos cortes transcritos de
     * F-06 ⛔ e F-18 —, ⛔ e a frase que aparece é a **da fonte**.
     */
    const g = numero(estado, "glicemia");
    const corte = corteGlicemico(g);
    return {
      id: "glicemia",
      letra: "D",
      nome: "Glicemia",
      estado:
        corte === undefined ? "nao_avaliado" : corte.pedeConduta ? "ameaca" : "medido",
      /** ⚠️ A natureza é da fonte — ⛔ a tela ⛔ não batiza faixa glicêmica. */
      achado: corte?.pedeConduta ? corte.natureza : undefined,
      conduta: corte?.pedeConduta ? corte.conduta : undefined,
      leva: corte?.pedeConduta ? "correcoes" : undefined,
      campo: "glicemia",
      valor: g === undefined ? undefined : String(g),
      unidade: "mg/dL",
    };
  })();

  return [viaAerea, respiracao, pressao, glicemia];
}

/**
 * ⚠️ ⛔ Há alguma ameaça **registrada**? — ⛔ e ⛔ isso ⛔ não é o mesmo que
 * *"⛔ ainda ⛔ não avaliado"*.
 */
export function haAmeacaAberta(lista: readonly AmeacaImediata[]): boolean {
  return lista.some((a) => a.estado === "ameaca");
}

/** ⚠️ Quantos eixos ⛔ ainda ⛔ não foram avaliados. ⛔ Contagem, ⛔ e ⛔ não juízo. */
export function eixosNaoAvaliados(lista: readonly AmeacaImediata[]): number {
  return lista.filter((a) => a.estado === "nao_avaliado").length;
}
