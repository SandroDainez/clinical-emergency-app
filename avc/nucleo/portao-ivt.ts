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
import { estadoDaReavaliacao, reavaliacaoPressoricaIncompleta, ultimaPressaoCompleta } from "./derivacoes";
import { barreiraDeReperfusao } from "./derivacoes-c";
import { acoesDoBloqueio } from "./derivacoes-e";
import { bloqueiosCorrigiveis, impedimentosDeSeguranca, type EfeitoNaAcao } from "./derivacoes-d";
import { vereditoDaTrombolise } from "./veredito-da-trombolise";
import { ESTADO_DA_ACAO } from "../conteudo/superficie-e";

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
  /**
   * ⚠️⚠️ ⛔ A REAVALIAÇÃO COMEÇOU ⛔ E ⛔ NÃO TERMINOU — ⛔ meia aferição.
   *
   * ⛔ Estado **próprio**, ⛔ e ⛔ não a `informacao_incompleta` genérica da
   * candidatura: ⛔ aquela fala do catálogo de recomendações; ⛔ **esta** é uma
   * pendência específica da correção pressórica (decisão do autor, item 3).
   */
  | "afericao_incompleta"
  /** ⚠️ O catálogo tem **COR 3** que alcança este caso. */
  | "nao_recomendada"
  /**
   * ⚠️⚠️ A COMPOSIÇÃO **RESPONDEU CONTRA** (D1, commit 6): fora da janela padrão
   * ⛔ sem rota estendida que alcance, ⛔ ou déficit assumido como ⛔ não
   * incapacitante ⛔ sem outra rota. ⛔ É resposta do aplicativo (nível 3),
   * ⛔ nunca *"contraindicada"* — ⛔ e o motivo nomeia o critério.
   */
  | "nao_sustentada"
  /**
   * ── ⚠️⚠️ OS TRÊS ESTADOS DA INCERTEZA TIPADA (R3, commit 7) ─────────────
   *
   * ⚠️ *"Incerteza relevante ⛔ não pode virar liberação automática"* (autor).
   * ⛔ Nenhum dos três é contraindicação; ⛔ cada um nomeia o gesto que resolve.
   */
  /** ⚠️ Coletas discordantes ⛔ ou plaquetas sem unidade — ⛔ o app ⛔ não elege. */
  | "reconciliacao_pendente"
  /** ⚠️ Exame ⛔ não colhido **com** motivo de suspeita, ⛔ ou com varfarina/heparina em uso. */
  | "resultado_pendente"
  /**
   * ⚠️⚠️ A fonte manda **julgar individualmente** (DOAC, CMB > 10, itens
   * relativos). ⛔ Não retém navegação ⛔ nem registro; ⛔ e ⛔ não é convertido em
   * liberação automática (**HR-4**).
   */
  | "julgamento_individual_pendente"
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
  /**
   * ⚠️⚠️ ⛔ De QUAL camada ⛔ ele vem — ⛔ e ⛔ elas ⛔ não se misturam.
   *
   * ⚠️ `classe` (R1, 2026-09-12): a barreira de reperfusão **⛔ ainda ⛔ não
   * aberta** — ⛔ imagem ⛔ não registrada ⛔ ou ⛔ sem laudo. ⛔ Não é segurança
   * (⛔ ninguém afirmou hemorragia, **E-23**) ⛔ e ⛔ não é correção (⛔ não há
   * aferição que a resolva): ⛔ é a exclusão que a fonte exige **antes** de
   * qualquer reperfusão (**E-08**), ⛔ e que ⛔ ainda ⛔ não está na trilha.
   */
  readonly camada: "seguranca" | "correcao" | "veredito" | "classe";
  /**
   * ⚠️⚠️ O EFEITO TIPADO SOBRE A AÇÃO (R3) — ⛔ presente nos motivos de
   * segurança. ⛔ `exige_julgamento` ⛔ nunca coexiste com `impede` no mesmo
   * motivo, ⛔ e a prova dos críticos mede ⛔ isso.
   */
  readonly efeito?: EfeitoNaAcao;
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

/**
 * ⚠️ Os motivos de segurança vêm **prontos** de `impedimentosDeSeguranca()`
 * (R3, commit 7) — ⛔ rótulo do campo, valor, fonte, o que falta ⛔ e o efeito
 * tipado. ⛔ O portão ⛔ não reinterpreta ⛔ nenhum deles (**I6**).
 */
function motivoDeSeguranca(i: ReturnType<typeof impedimentosDeSeguranca>[number]): MotivoDoPortao {
  return {
    id: i.id,
    camada: "seguranca",
    efeito: i.efeito,
    rotulo: i.rotulo,
    dado: i.dado,
    fonte: i.fonte,
    oQueFalta: i.oQueFalta,
    leva: i.leva,
    campo: i.campo,
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
    (a) => a.estado === ESTADO_DA_ACAO.iniciada
      || a.estado === ESTADO_DA_ACAO.realizada
      /** ⚠️ Interrompida (D2): ⛔ houve gesto — ⛔ e ⛔ ele ⛔ também ⛔ não prova resolução. */
      || a.estado === ESTADO_DA_ACAO.interrompida
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
/**
 * ⚠️ `agoraMs` obrigatório (commit 3): ⛔ o portão decide sobre a ação, ⛔ e a
 * ação depende de um veredito que depende do relógio (**E-21**).
 */
export function estadoDoPortaoIVT(estado: EstadoAvc, agoraMs: number): PortaoIVT {
  const veredito = vereditoDaTrombolise(estado, agoraMs);
  const motivos: MotivoDoPortao[] = [];

  /* ── 1 · segurança ⛔ NÃO corrigível ─────────────────────────────────── */

  /**
   * ⚠️⚠️ A IMAGEM ENTRA PELA **BARREIRA DE CLASSE** (R1, commit 2 · 2026-09-12),
   * ⛔ e ⛔ não mais por `veredito.tipo === "retida"`.
   *
   * ── ⚠️⚠️ ⛔ O FURO QUE ISTO FECHA (AVC-01) ─────────────────────────────
   *
   * ⛔ O veredito ⛔ só dizia `retida` para achado positivo ⛔ ou divergência.
   * ⚠️ Com **⛔ nenhuma TC registrada**, ⛔ ele seguia para o catálogo, ⛔ e ⛔ um
   * paciente ⛔ só com peso saía `indicada` — ⛔ e o portão, lendo ⛔ só o veredito,
   * **liberava a administração ⛔ sem exclusão de hemorragia**. ⛔ F-16 rec. 1
   * (COR 1 · A) ⛔ e §5.3 da spec ⛔ não admitem ⛔ isso.
   *
   * ⚠️ A barreira é **uma** função, em C (**I6**); ⛔ aqui ⛔ só se escolhe a
   * camada do motivo: ⛔ achado positivo/divergência é **segurança**; ⛔ imagem
   * ausente ⛔ ou ⛔ sem laudo é **classe** — ⛔ e ⛔ nenhuma das duas libera.
   */
  const barreira = barreiraDeReperfusao(estado);
  if (barreira.estado === "retida") {
    const ehAchado = barreira.motivo === "hemorragia_presente" || barreira.motivo === "divergente";
    motivos.push({
      id: ehAchado ? "imagem" : "imagem_nao_excluida",
      camada: ehAchado ? "seguranca" : "classe",
      rotulo: barreira.curto,
      fonte: barreira.fonte,
      oQueFalta: barreira.oQueFalta,
      leva: barreira.leva,
      campo: barreira.campo,
    });
  }

  /**
   * ⚠️⚠️ TODA a segurança de D, **tipada** (R3, commit 7): ⛔ cortes cruzados,
   * itens ⛔ não corrigíveis, coletas discordantes, exames pendentes com
   * suspeita ⛔ ou varfarina/heparina, juízo ⛔ não respondido, julgamento
   * individual, condição resolutiva ⛔ e risco declarado. ⛔ O portão consome;
   * ⛔ não reinterpreta.
   */
  const impedimentos = impedimentosDeSeguranca(estado);
  for (const i of impedimentos) motivos.push(motivoDeSeguranca(i));

  /** ⚠️ ⛔ Só o que **impede** nomeia o estado de segurança: achado de imagem ⛔ e `impede`. */
  const seguranca = motivos.filter(
    (m) => m.camada === "seguranca" && (m.efeito === undefined || m.efeito === "impede")
  );
  const reconciliar = impedimentos.some((i) => i.efeito === "impede_ate_reconciliar");
  const resultadoPendente = impedimentos.some((i) => i.efeito === "impede_ate_resultado");
  const juizoPendente = impedimentos.some((i) => i.efeito === "aguarda_juizo");
  const julgamentoPendente = impedimentos.some((i) => i.efeito === "exige_julgamento");

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

  /* ── 2b · o critério da composição que respondeu contra (D1) ─────────── */

  /**
   * ⚠️ ⛔ Segurança contradita ⛔ **não** entra aqui: ⛔ ela ⛔ já está na camada
   * de segurança, ⛔ com valor ⛔ e fonte — ⛔ repeti-la seria uma segunda verdade
   * sobre o mesmo corte (**I6**).
   */
  if (veredito.tipo === "nao_sustentada") {
    for (const c of veredito.criteriosAvaliados) {
      if (c.estado !== "contradito" || c.papel === "seguranca") continue;
      motivos.push({
        id: `criterio-${c.id}`,
        camada: "veredito",
        rotulo: c.rotulo,
        dado: c.valor,
        fonte: c.fonte,
        oQueFalta: c.oQueFalta,
        leva: c.leva,
        campo: c.campo,
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
  /**
   * ── ⚠️⚠️ ⛔ A AFERIÇÃO COMEÇADA ⛔ E ⛔ NÃO TERMINADA ──────────────────────
   *
   * ⚠️ *"Medida parcial ⛔ não é nova normalidade, ⛔ não é ausência de medida
   * ⛔ e ⛔ não é resolução"* (autor, **item 13**). ⛔ Ela **mantém** o bloqueio
   * ⛔ e diz **o que falta**.
   */
  const parcial = reavaliacaoPressoricaIncompleta(estado);
  const ultimaCompleta = ultimaPressaoCompleta(estado);
  if (parcial !== undefined) {
    motivos.push({
      id: "afericao_incompleta",
      camada: "correcao",
      rotulo: "Nova aferição incompleta",
      /**
       * ⚠️ ⛔ Mostra a metade que existe ⛔ e nomeia a que falta — ⛔ e ⛔ nunca
       * as junta com a metade da aferição anterior (**D-120**).
       */
      dado: `PAS ${parcial.pas ?? "—"} · PAD ${parcial.pad ?? "—"}`,
      fonte: "F-04",
      oQueFalta:
        parcial.pad === undefined
          ? "A diastólica desta mesma aferição"
          : "A sistólica desta mesma aferição",
      leva: "estabilizacao",
      campo: parcial.pad === undefined ? "pad" : "pas",
    });
    /**
     * ⚠️⚠️ ⛔ E A ÚLTIMA MEDIDA VÁLIDA **⛔ NÃO É SOBRESCRITA** — ⛔ as duas
     * informações coexistem (autor, **item 2**).
     */
    if (ultimaCompleta !== undefined) {
      motivos.push({
        id: "ultima_pressao_completa",
        camada: "correcao",
        rotulo: "Última aferição completa",
        dado: `${ultimaCompleta.pas}/${ultimaCompleta.pad} mmHg`,
        fonte: "F-04",
        oQueFalta: "Continua sendo a pressão conhecida deste paciente",
        leva: "estabilizacao",
      });
    }
  }

  const reavaliacao = estadoDaReavaliacao(estado);
  if (reavaliacao === "corrigida_sem_exame") {
    motivos.push({
      id: "reavaliacao_neurologica",
      camada: "correcao",
      rotulo: "Glicemia corrigida, e o déficit ainda não foi reavaliado",
      /**
       * ⚠️⚠️ ⛔ **SEM `dado`** — ⛔ e ⛔ isso é correção da revisão visual da
       * Fase 7: ⛔ eu punha `reavaliacao` aqui, ⛔ e a tela mostrava
       * *"— corrigida_sem_exame"*. ⛔ Identificador interno ⛔ não é linguagem
       * clínica, ⛔ e o rótulo acima ⛔ já diz a mesma coisa em português.
       */
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
        /** ⚠️ Resposta contra da composição (D1) — ⛔ corrigir a PA ⛔ não muda isso. */
        : veredito.tipo === "nao_sustentada"
        ? "nao_sustentada"
        /**
         * ⚠️⚠️ A INCERTEZA RELEVANTE (R3) — ⛔ antes do corrigível: ⛔ tratar a
         * PA ⛔ não reconcilia duas coletas ⛔ nem traz um resultado que ⛔ não
         * foi colhido. ⛔ Nenhum dos dois libera.
         */
        : reconciliar
        ? "reconciliacao_pendente"
        : resultadoPendente
        ? "resultado_pendente"
        /**
         * ⚠️⚠️ ⛔ ANTES do corrigível ⛔ e do aguardando: ⛔ a aferição pela
         * metade é ⛔ o que o médico tem de terminar **agora**, ⛔ e dizer
         * *"corrija a pressão"* a quem ⛔ já está medindo ⛔ é a tela ⛔ não ter
         * visto o gesto.
         */
        : parcial !== undefined
        ? "afericao_incompleta"
        : reavaliacao === "corrigida_sem_exame" || (corrigiveis.length > 0 && algumEmAndamento)
          ? "aguardando_reavaliacao"
          : corrigiveis.length > 0
            ? "bloqueado_corrigivel"
            /**
             * ⚠️⚠️ **HR-4**: julgamento individual pendente ⛔ não bloqueia
             * navegação ⛔ nem registro, ⛔ mas ⛔ não é convertido em liberação
             * automática. ⛔ E ⛔ nunca vira `bloqueado_seguranca`.
             */
            : julgamentoPendente
            ? "julgamento_individual_pendente"
            /** ⚠️ **HR-3**: o juízo da rec. 10 ⛔ ainda ⛔ não respondido é dado que falta — ⛔ a pergunta, ⛔ não o exame. */
            : veredito.tipo === "incompleta" || juizoPendente
              ? "informacao_incompleta"
              : veredito.tipo === "sem_criterios"
                ? "sem_criterios"
                /**
                 * ⚠️⚠️⚠️ ⛔ A CLASSE ⛔ AINDA ⛔ NÃO ABERTA ⛔ NUNCA LIBERA (R1).
                 *
                 * ⛔ Imagem ⛔ não registrada ⛔ ou ⛔ sem laudo é **dado que
                 * falta** — ⛔ e ⛔ por isso o estado é `informacao_incompleta`,
                 * ⛔ e ⛔ não um bloqueio de segurança: ⛔ ninguém afirmou
                 * hemorragia (**E-23**). ⚠️ O motivo `imagem_nao_excluida`,
                 * acima, diz o gesto que abre a classe.
                 *
                 * ⚠️ Invariante medida pela prova dos críticos (caso 25):
                 * `liberado ⇒ barreira liberada`.
                 */
                : barreira.estado === "retida"
                  ? "informacao_incompleta"
                  : "liberado";

  return { estado: estadoFinal, liberado: estadoFinal === "liberado", motivos };
}
