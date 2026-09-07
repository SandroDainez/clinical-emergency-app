/**
 * O PORTÃO DA TROMBÓLISE — ⚠️ **o que separa decidir de administrar**.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ELE EXISTE, ⛔ E ⛔ POR QUE ⛔ NÃO MORA NO VEREDITO ────────
 *
 * ⚠️ Regra central do autor, 2026-09-07:
 *
 * > *"Veredito terapêutico ⛔ não substitui segurança, ⛔ e segurança ⛔ não
 * >  precisa ser deformada para caber no veredito. O portão combina as duas
 * >  camadas ⛔ sem misturá-las."*
 *
 * ⛔ `vereditoDaTrombolise()` fala do **catálogo de recomendações** — COR, LOE,
 * população, verbatim. ⚠️ `derivacoes-d` fala de **segurança** — cortes,
 * contraindicações, bloqueios corrigíveis. ⛔ São duas linguagens diferentes da
 * mesma fonte, ⛔ e fundi-las obrigaria a reclassificar uma como a outra.
 *
 * ── ⚠️⚠️ ⛔ O FURO QUE ELE FECHA, MEDIDO ─────────────────────────────────────
 *
 * ⛔ O mapeamento da Fase 6 encontrou: `vereditoDaTrombolise()` importa
 * ⛔ **apenas** `bloqueiosCorrigiveis` de `derivacoes-d`. ⛔ Com **INR 2,5**,
 * `corteDoAnalito("inr")` devolve `contraindicacao_nao_corrigivel` ⛔ e o
 * veredito devolve `incompleta` com `contra: []`.
 *
 * ⚠️⚠️ ⛔ O MOTOR CLASSIFICAVA A CONTRAINDICAÇÃO ⛔ E ⛔ NINGUÉM A LIA. ⛔ Um
 * portão construído só sobre o veredito deixaria passar ⛔ exatamente esse
 * paciente — ⛔ e a consolidação clínica do projeto lista o corte como bloqueio:
 * *"⛔ `INR >1,7` · `plaquetas <100.000/mm³` · `aPTT >40 s` · `PT >15 s`"*.
 *
 * ── ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO CONTRARIA A CONVENÇÃO 🚫 ───────────────────────────
 *
 * ⛔ O módulo inteiro é construído sob *"⛔ nada bloqueia"* (**E-49**), ⛔ e a
 * convenção 🚫 diz que fato ⛔ não-exigível ⛔ não pode **travar a ação**.
 *
 * ⚠️ ⛔ A própria consolidação separa os dois casos, ⛔ e a PA está do lado que
 * ⛔ **bloqueia**:
 *
 * > 🚫 *"**PA na meta como critério de candidatura** — é bloqueio **da ação**
 * >  (evita **D-01**)"*
 *
 * ⛔ ⛔ Ou seja: a PA ⛔ não entra na **candidatura** — ⛔ e ⛔ é ⛔ por isso que
 * ⛔ este arquivo ⛔ **não toca o veredito**. ⛔ Ela bloqueia **a ação**, ⛔ que é
 * ⛔ exatamente o que o portão faz.
 *
 * ── ⚠️ O QUE ELE ⛔ NÃO FAZ ─────────────────────────────────────────────────
 *
 * ⛔ **⛔ Não grava fato.** Função pura, recalculada a cada leitura (**E-43**).
 * ⛔ **⛔ Não reclassifica.** ⛔ Um corte de segurança ⛔ não vira COR 3 aqui.
 * ⛔ **⛔ Não bloqueia navegação** — ⛔ só a ação de administrar (**E-11**).
 * ⛔ **⛔ Não oferece override.** ⛔ Não existe política de override no projeto,
 *    ⛔ e criar uma seria comportamento clínico novo (decisão do autor, item 7).
 */
import type { EstadoAvc } from "./estado";
import type { SuperficieId } from "./tipos";
import { estadoDaReavaliacao } from "./derivacoes";
import { acoesDoBloqueio } from "./derivacoes-e";
import { cortesLaboratoriais, itensMarcados, bloqueiosCorrigiveis } from "./derivacoes-d";
import { vereditoDaTrombolise } from "./veredito-da-trombolise";
import { ESTADO_DA_ACAO } from "../conteudo/superficie-e";
import { campoDoModulo } from "../conteudo/campos";

/**
 * ⚠️⚠️ SETE ESTADOS, ⛔ E ⛔ NENHUM DELES É *"desabilitado"*.
 *
 * ⚠️ Pedido do autor (**item 5**): *"⛔ Não reduzir todos a 'desabilitado'"*.
 * ⛔ Um botão cinza sem razão ensina o médico a desconfiar da tela — ⛔ e num
 * módulo tempo-dependente, desconfiar custa minutos.
 */
export type EstadoDoPortao =
  /** ⚠️ ⛔ Contraindicação **⛔ não corrigível** ativa — imagem ⛔ ou segurança. */
  | "bloqueado_seguranca"
  /** ⚠️ Há condição com conserto, ⛔ e ⛔ ninguém começou a consertar. */
  | "bloqueado_corrigivel"
  /** ⚠️⚠️ Correção **iniciada**, ⛔ e ⛔ ainda falta o fato que prova resolução. */
  | "aguardando_reavaliacao"
  /** ⚠️ O catálogo tem **COR 3** que alcança este caso. */
  | "nao_recomendada"
  /** ⚠️ Falta dado que o próprio critério favorável exige. */
  | "informacao_incompleta"
  /** ⚠️ ⛔ Nenhum critério implementado fecha o caso. ⛔ Nem sim ⛔ nem não. */
  | "sem_criterios"
  /** ⚠️ ⛔ Nada bloqueia, ⛔ e o catálogo sustenta. */
  | "liberado";

/**
 * ⚠️ Um motivo do portão — ⛔ e ⛔ ele carrega **para onde ir**.
 *
 * ⛔ Pedido do autor (**item 6**): *"⛔ não mostrar apenas botão cinza"*. ⚠️ Cada
 * motivo traz o dado atual, a fonte, o que falta ⛔ e o destino do toque.
 */
export type MotivoDoPortao = {
  readonly id: string;
  /** ⚠️⚠️ ⛔ De QUAL camada ⛔ ele vem — ⛔ e ⛔ elas ⛔ não se misturam. */
  readonly camada: "seguranca" | "correcao" | "veredito";
  readonly rotulo: string;
  /** ⚠️ O valor que sustenta o bloqueio **agora**. */
  readonly dado?: string;
  /** ⚠️ **E-30**: ⛔ nenhuma afirmação clínica sem o slot que a sustenta. */
  readonly fonte: string;
  /** ⚠️ O que precisa acontecer — ⛔ e ⛔ nunca *"resolva o problema"*. */
  readonly oQueFalta: string;
  /** ⚠️ ⛔ Onde o médico resolve isto. ⛔ Motivo sem destino é muro (**E-26**). */
  readonly leva?: SuperficieId;
  readonly campo?: string;
};

export type PortaoIVT = {
  readonly estado: EstadoDoPortao;
  /** ⚠️⚠️ ⛔ `true` ⛔ **só** em `liberado`. ⛔ Derivado, ⛔ e ⛔ nunca digitado. */
  readonly liberado: boolean;
  /**
   * ⚠️⚠️ ⛔ **TODOS** os motivos ativos, ⛔ e ⛔ não só o que nomeia o estado.
   *
   * ⛔ Mostrar só o mais grave esconderia a PA alta de um paciente cuja
   * trombólise a diretriz ⛔ já ⛔ não recomenda — ⛔ e a PA precisa ser tratada
   * ⛔ de ⛔ qualquer forma. ⛔ O estado ordena a atenção; ⛔ a lista ⛔ não
   * esconde ⛔ nada.
   */
  readonly motivos: readonly MotivoDoPortao[];
};

/** ⚠️ O verbo do corte laboratorial já vem da fonte — ⛔ e ⛔ não se reescreve. */
function motivoDoCorte(c: {
  id: string;
  valor?: number;
  limite: number;
  verbo: string;
}): MotivoDoPortao {
  return {
    id: `corte-${c.id}`,
    camada: "seguranca",
    /**
     * ⚠️ ⛔ O rótulo do **campo**, ⛔ e ⛔ não o id cru: a tela mostrava
     * *"inr — 2.5"*. ⛔ Identificador interno ⛔ não é linguagem clínica, ⛔ e a
     * divergência é ⛔ exatamente o lugar onde ⛔ ela precisa ser lida.
     */
    rotulo: campoDoModulo(c.id)?.rotulo ?? c.id,
    dado: c.valor === undefined ? undefined : String(c.valor),
    fonte: "F-10",
    /**
     * ⚠️⚠️ ⛔ *"⛔ Nenhuma"* — ⛔ e ⛔ isso ⛔ não é desistência: o corte ⛔ **não é
     * corrigível** neste módulo. ⛔ Escrever *"corrija o INR"* prometeria uma
     * conduta que a fonte ⛔ não dá (**F-10 ⛔ não traz reversão**).
     */
    oQueFalta: "A fonte não descreve correção para este achado neste módulo",
    leva: "laboratorio",
    campo: c.id,
  };
}

/**
 * ⚠️⚠️ ⛔ A CORREÇÃO COMEÇOU? — ⛔ e ⛔ *começar* ⛔ **não** é *resolver*.
 *
 * ⛔ `acaoResolveBloqueio()` devolve `false` **por construção**, ⛔ e há prova
 * ⛔ que reprova ⛔ qualquer versão que devolva `true`. ⚠️ Aqui ⛔ só se pergunta
 * se **houve gesto**, ⛔ para o portão poder dizer *"em andamento"* ⛔ em vez de
 * ⛔ repetir *"corrija"* ⛔ a quem ⛔ já corrigiu ⛔ e espera a reaferição.
 *
 * ⛔ ⛔ `cancelada` ⛔ não conta: ⛔ nada foi feito.
 */
function correcaoIniciada(estado: EstadoAvc, bloqueio: string): boolean {
  return acoesDoBloqueio(estado, bloqueio).some(
    (a) => a.estado === ESTADO_DA_ACAO.iniciada || a.estado === ESTADO_DA_ACAO.realizada
  );
}

/**
 * ⚠️⚠️ ⛔ A ORDEM É DE GRAVIDADE, ⛔ E ⛔ ELA ⛔ NÃO É ESTILO.
 *
 *   1. ⛔ **Segurança ⛔ não corrigível** — ⛔ nada a fazer agora, ⛔ e ⛔ nenhum
 *      dado novo destrava.
 *   2. ⛔ **COR 3** — a diretriz desaconselha. ⛔ Corrigir a PA ⛔ não muda isso.
 *   3. ⛔ **Corrigível aberto** — ⛔ há conserto, ⛔ e ⛔ ele é o próximo passo.
 *   4. ⛔ **Aguardando reavaliação** — ⛔ o conserto foi feito ⛔ e falta a prova.
 *   5. ⛔ **Falta dado** · **⛔ sem critério** · **liberado**.
 */
export function estadoDoPortaoIVT(estado: EstadoAvc): PortaoIVT {
  const veredito = vereditoDaTrombolise(estado);
  const motivos: MotivoDoPortao[] = [];

  /* ── 1 · segurança ⛔ NÃO corrigível ─────────────────────────────────── */

  /**
   * ⚠️⚠️ A IMAGEM ENTRA PELO VEREDITO, ⛔ e ⛔ não por leitura própria: `retida`
   * ⛔ já é o bloqueio de classe (**R2.1 / E-08**), ⛔ e relê-lo aqui criaria
   * uma segunda verdade sobre o mesmo fato (**I6**).
   */
  if (veredito.tipo === "retida") {
    motivos.push({
      id: "imagem",
      camada: "seguranca",
      rotulo: veredito.frase,
      fonte: "F-16",
      oQueFalta: "Excluir hemorragia intracraniana na imagem",
      leva: "imagem",
    });
  }

  for (const c of cortesLaboratoriais(estado)) {
    if (c.estado === "contraindicacao_nao_corrigivel") motivos.push(motivoDoCorte(c));
  }

  /**
   * ⚠️ Os itens de antecedentes ⛔ e procedimentos que a fonte classifica como
   * ⛔ não corrigíveis — ⛔ eles já vêm interpretados, ⛔ com verbo ⛔ e origem.
   */
  for (const i of itensMarcados(estado)) {
    if (i.estado !== "contraindicacao_nao_corrigivel") continue;
    motivos.push({
      id: `item-${i.id}`,
      camada: "seguranca",
      rotulo: i.rotulo,
      dado: i.formulacao,
      fonte: "F-07",
      oQueFalta: "A fonte não descreve correção para este achado",
      leva: "seguranca",
    });
  }

  const seguranca = motivos.filter((m) => m.camada === "seguranca");

  /* ── 2 · o que a diretriz desaconselha ───────────────────────────────── */

  if (veredito.tipo === "nao_recomendada") {
    for (const m of veredito.contra) {
      motivos.push({
        id: `cor3-${m.id}`,
        camada: "veredito",
        rotulo: m.verbo,
        dado: `COR ${m.cor} · LOE ${m.loe}`,
        fonte: m.slot,
        /**
         * ⚠️⚠️ ⛔ **⛔ NÃO HÁ O QUE FAZER PARA LIBERAR**, ⛔ e dizer o contrário
         * seria prometer um caminho. ⛔ A decisão de divergir da diretriz ⛔ não
         * está implementada (item 7 do autor), ⛔ e inventá-la aqui seria criar
         * conduta.
         */
        oQueFalta: "A diretriz não recomenda a trombólise neste caso",
        leva: "reperfusao",
      });
    }
  }

  /* ── 3 e 4 · o que tem conserto ──────────────────────────────────────── */

  const corrigiveis = bloqueiosCorrigiveis(estado);
  let algumEmAndamento = false;
  for (const b of corrigiveis) {
    const emAndamento = correcaoIniciada(estado, b.id);
    if (emAndamento) algumEmAndamento = true;
    motivos.push({
      id: b.id,
      camada: "correcao",
      rotulo: b.formulacao,
      fonte: b.fonte,
      oQueFalta: emAndamento
        ? `Correção registrada. Falta: ${b.resolvePor.toLowerCase()}`
        : b.resolvePor,
      leva: "correcoes",
    });
  }

  /**
   * ⚠️⚠️ ⛔ A GLICEMIA TEM UM DEGRAU A MAIS, ⛔ E ⛔ ELE É DA FONTE.
   *
   * ⛔ F-06, §4.6.1 *Supportive Text* 5: *"clinical deficits **should be
   * assessed after correction of glucose** to evaluate thrombolytic
   * eligibility"*.
   *
   * ⚠️ ⛔ Corrigida a hipoglicemia, `bloqueiosCorrigiveis` ⛔ já ⛔ não a lista —
   * ⛔ e ⛔ **⛔ ainda ⛔ não está resolvido**: falta o exame neurológico
   * ⛔ **depois** da correção. ⛔ `estadoDaReavaliacao()` ⛔ é quem sabe, ⛔ e
   * ⛔ ele lê a **ordem** dos fatos.
   */
  const reavaliacao = estadoDaReavaliacao(estado);
  if (reavaliacao === "corrigida_sem_exame") {
    motivos.push({
      id: "reavaliacao_neurologica",
      camada: "correcao",
      rotulo: "Glicemia corrigida, e o déficit ainda não foi reavaliado",
      dado: reavaliacao,
      fonte: "F-06",
      oQueFalta: "Um novo exame neurológico depois da correção",
      leva: "neurologico",
      campo: "deficit_focal",
    });
  }

  /* ── o estado, na ordem de gravidade ─────────────────────────────────── */

  const estadoFinal: EstadoDoPortao =
    seguranca.length > 0
      ? "bloqueado_seguranca"
      : veredito.tipo === "nao_recomendada"
        ? "nao_recomendada"
        : reavaliacao === "corrigida_sem_exame" || (corrigiveis.length > 0 && algumEmAndamento)
          ? "aguardando_reavaliacao"
          : corrigiveis.length > 0
            ? "bloqueado_corrigivel"
            : veredito.tipo === "incompleta"
              ? "informacao_incompleta"
              : veredito.tipo === "sem_criterios"
                ? "sem_criterios"
                : "liberado";

  return { estado: estadoFinal, liberado: estadoFinal === "liberado", motivos };
}
