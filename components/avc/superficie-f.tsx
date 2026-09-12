/**
 * SUPERFÍCIE F · Reperfusão — a tela.
 *
 * ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER:
 *
 *   ⛔ **dar veredito.** ⛔ Não existe "pode trombolisar" aqui. A fonte ⛔ não
 *      sustenta esse juízo, e o núcleo foi construído para ⛔ não produzi-lo. A
 *      tela responde *qual é o caminho mais curto até saber*, ⛔ e nada além.
 *
 *   ⛔ **dizer "contraindicado".** COR 3 da fonte é *not recommended* ou
 *      *No Benefit*. A tela repete o verbo dela e ⛔ nunca o converte.
 *
 *   ⛔ **fundir relógios.** Todo prazo aparece com o nome do seu marco. ⛔ Não há
 *      contador global, ⛔ não há "a janela".
 *
 *   ⛔ **calcular dose sem peso**, ⛔ **estimar peso**, ⛔ ou deixar o cálculo
 *      parecer administração.
 *
 * ⚠️ A ORDEM E O AGRUPAMENTO ⛔ NÃO MORAM AQUI: são regras, e regra em JSX ⛔ não
 * se prova. Vivem em `avc/nucleo/apresentacao-f`, e esta tela apenas as lê.
 */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ACAO_DE_TROMBOLISE,
  DECISAO_DE_PROSSEGUIR,
  CAMPO_AGENTE,
  TROMBOLISE_IV,
  IVT_E_EVT_EM_PARALELO,
  PRINCIPIOS_GERAIS,
} from "../../avc/conteudo/superficie-f";
import {
  papelDoVereditoEvt,
  SELO_DO_VEREDITO_EVT,
  FALTAS_EM_PRIMEIRO_PLANO,
  faltasAgrupadas,
  itensDaTela,
  placar,
  type Faixa,
  type ItemDaTela,
  type LeituraDeRelogio,
} from "../../avc/nucleo/apresentacao-f";
import {
  doseDerivada,
  minutosDesdeCampoDoEstado,
  recomendacoesDoEstado,
  type OrigemDoPeso,
} from "../../avc/nucleo/derivacoes-f";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
/**
 * ⚠️⚠️ ⛔ A LEITURA DO PESO — ⛔ e ⛔ ela é a **mesma função** de sempre.
 *
 * ⛔ ⛔ `peso()` é núcleo, ⛔ e ⛔ nunca pertenceu a tela ⛔ nenhuma. ⚠️ O que
 * mudou em 2026-09-08 foi **onde ⛔ ela é apresentada** (**D-126**): ⛔ ela
 * saiu da Estabilização junto com o campo, ⛔ e ⛔ não coube em Paciente, que
 * ⛔ não tem painel de leituras por decisão.
 */
import { peso as leituraDoPeso } from "../../avc/nucleo/derivacoes";
import { ESTADOS } from "../../design-system/estados-clinicos";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import { vereditoDaTrombolise } from "../../avc/nucleo/veredito-da-trombolise";
import { estadoDoPortaoIVT } from "../../avc/nucleo/portao-ivt";
import { vereditoDaTrombectomia } from "../../avc/nucleo/veredito-da-trombectomia";
import { ROTULO_CURTO } from "../../avc/conteudo/superficie-c";
import { instanciasDe, valorNaInstancia } from "../../avc/nucleo/instancia";
import { numeroCurto } from "../../avc/nucleo/formato";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { SETA } from "../../design-system/afordancia";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { acaoPendente } from "../../avc/conteudo/rotulos-clinicos";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { useTr } from "../../lib/use-tr";
import { AvisoDeApoioClinico } from "../../design-system/aviso-de-apoio-clinico";
import { CabecalhoDeBloco, CampoDaSuperficie } from "./campos-clinicos";

/**
 * ⚠️⚠️ ⛔ CADA ESTADO TEM A SUA FRASE — ⛔ e ⛔ nenhum deles é *"desabilitado"*.
 *
 * ⛔ Pedido do autor (**item 5**): *"⛔ Não reduzir todos ao mesmo estado visual
 * ⛔ ou à mesma ação"*. ⚠️ *"⛔ Não recomendada"* ⛔ e *"falta corrigir a pressão"*
 * ⛔ são situações clínicas diferentes, ⛔ e o médico faz coisas diferentes ⛔ em
 * cada uma.
 */
/**
 * ⚠️⚠️ ⛔ O SÍMBOLO ACOMPANHA O TÍTULO — ⛔ e ⛔ vem do vocabulário dos **sete
 * estados**, ⛔ e ⛔ não de um alfabeto novo desta tela (**§47**).
 *
 * ⛔ Cor sozinha ⛔ não é leitura (**E-15**), ⛔ e o item 3 do autor cobra
 * ⛔ exatamente ⛔ isto: texto · símbolo · título · estrutura.
 */
const SIMBOLO_DO_PORTAO: Readonly<Record<string, string>> = {
  bloqueado_seguranca: ESTADOS.impede.simbolo,
  bloqueado_corrigivel: ESTADOS.corrigivel.simbolo,
  afericao_incompleta: ESTADOS.andamento.simbolo,
  aguardando_reavaliacao: ESTADOS.andamento.simbolo,
  nao_recomendada: ESTADOS.impede.simbolo,
  nao_sustentada: ESTADOS.impede.simbolo,
  reconciliacao_pendente: ESTADOS.verificar.simbolo,
  resultado_pendente: ESTADOS.andamento.simbolo,
  julgamento_individual_pendente: ESTADOS.verificar.simbolo,
  informacao_incompleta: ESTADOS.verificar.simbolo,
  sem_criterios: ESTADOS.ausente.simbolo,
  liberado: ESTADOS.favoravel.simbolo,
};

/** ⚠️ Símbolo do estado de cada critério da composição (D1) — ⛔ cor ⛔ nunca decide sozinha (**E-15**). */
const SIMBOLO_DO_CRITERIO: Readonly<Record<string, string>> = {
  satisfeito: ESTADOS.favoravel.simbolo,
  contradito: ESTADOS.impede.simbolo,
  ausente: ESTADOS.verificar.simbolo,
  em_julgamento: ESTADOS.andamento.simbolo,
};

const TITULO_DO_PORTAO: Readonly<Record<string, string>> = {
  bloqueado_seguranca: "Contraindicação de segurança ativa",
  bloqueado_corrigivel: "Há condição a corrigir antes",
  /** ⚠️ ⛔ Ela ⛔ não diz *"PA corrigida"* ⛔ nem *"aguardando decisão"* (item 4). */
  afericao_incompleta: "Nova aferição incompleta — complete para reavaliar",
  aguardando_reavaliacao: "Correção registrada — falta a reavaliação",
  nao_recomendada: "A diretriz não recomenda a trombólise neste caso",
  /** ⚠️ D1: resposta **do aplicativo** — ⛔ nunca *"contraindicada"*; o motivo nomeia o critério. */
  nao_sustentada: "Os critérios registrados não sustentam a trombólise",
  /** ⚠️ R3: incerteza relevante ⛔ não libera — ⛔ e ⛔ nenhum destes é contraindicação. */
  reconciliacao_pendente: "Resultados discordantes — reconcilie antes de decidir",
  resultado_pendente: "Exame pertinente ainda sem resultado",
  julgamento_individual_pendente: "Situação que a fonte manda avaliar individualmente",
  informacao_incompleta: "Faltam dados para concluir",
  sem_criterios: "Nenhum critério da diretriz alcança este caso ainda",
  liberado: "",
};

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onIrParaCampo: (campo: string) => void;
  /** ⚠️ O portão leva à fase onde o bloqueio se resolve — ⛔ motivo sem destino é muro (**E-26**). */
  onAbrirSuperficie: (id: SuperficieId) => void;
  onNovaTrombolise: () => void;
  onEscolherNaInstancia: (instancia: string, campo: string, valor: string) => void;
  onHoraNaInstancia: (instancia: string, campo: string, valor: number) => void;
  onDesfazerNaInstancia: (instancia: string, campo: string) => void;
};

export default function SuperficieF({
  estado,
  agora,
  onEscolher,
  onIrParaCampo,
  onAbrirSuperficie,
  onNovaTrombolise,
  onEscolherNaInstancia,
  onHoraNaInstancia,
  onDesfazerNaInstancia,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [abertos, setAbertos] = useState<readonly string[]>([]);
  const alternar = (id: string) =>
    setAbertos((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  /**
   * ⚠️ Minutos desde um campo de hora. ⛔ Devolve `undefined` — ⛔ nunca zero —
   * quando o marco ⛔ não foi registrado: zero é uma contagem, ausência ⛔ não é.
   */
  const minutosDesdeCampo = useMemo(
    () => (campo: string) => minutosDesdeCampoDoEstado(estado, campo, agora),
    [estado, agora]
  );

  const itens = useMemo(
    () => itensDaTela(recomendacoesDoEstado(estado, agora), minutosDesdeCampo),
    [estado, agora, minutosDesdeCampo]
  );
  const faltas = useMemo(() => faltasAgrupadas(itens), [itens]);
  const naFaixa = (f: Faixa) => itens.filter((i) => i.faixa === f);

  const acoes = naFaixa("acao_com_relogio");
  const aplicaveis = naFaixa("aplicavel");
  const aUmDado = naFaixa("a_um_dado");
  const alertas = naFaixa("alerta_cor3");
  const semFonte = naFaixa("sem_fonte");
  const fora = naFaixa("fora");

  /** ⚠️ ⛔ Nenhum relógio correndo em recomendação ⛔ nenhuma — ⛔ nem uma. */
  const nenhumRelogioCorre = !itens.some((i) => i.relogios.some((r) => r.estado === "correndo"));

  const agente = String(valorAtual(estado, CAMPO_AGENTE.id)?.valor ?? "");
  /**
   * ⚠️⚠️ A ORIGEM DO PESO É TRADUZIDA UMA VEZ, AQUI, ⛔ e o rótulo da TELA
   * continua sendo **a palavra do campo** — ⛔ não a nossa.
   */
  const pesoBruto = valorAtual(estado, "peso")?.valor;
  const origemBruta = String(valorAtual(estado, "peso_origem")?.valor ?? "");
  const origem: OrigemDoPeso | undefined =
    origemBruta === "Estimado pela equipe"
      ? "estimado"
      : origemBruta === "Informado pelo paciente ou família"
        ? "informado"
        : undefined;
  const agenteDose =
    agente === "Alteplase" ? "alteplase" : agente === "Tenecteplase" ? "tenecteplase" : undefined;
  const dose =
    agenteDose !== undefined
      ? doseDerivada(agenteDose, typeof pesoBruto === "number" ? pesoBruto : undefined, origem)
      : undefined;

  /**
   * ⚠️⚠️ O VEREDITO — pedido do autor, 2026-09-06. ⛔ Derivado a cada render,
   * ⛔ e ⛔ **nunca** gravado: quem congela veredito num fato faz a conclusão
   * sobreviver à correção do dado (**E-43**).
   */
  /** ⚠️ ⛔ Com o relógio (commit 3): ⛔ a janela é critério, ⛔ e ⛔ veredito ⛔ sem `agora` ⛔ não é veredito (**E-21**). */
  const veredito = useMemo(() => vereditoDaTrombolise(estado, agora), [estado, agora]);
  /**
   * ── ⚠️⚠️ ⛔ O PORTÃO VEM PRONTO DO NÚCLEO — Fase 6, 2026-09-07 ────────────
   *
   * ⛔ Ele combina **duas camadas** que ⛔ não se misturam: o veredito (catálogo
   * de recomendações) ⛔ e a segurança (cortes, contraindicações, corrigíveis).
   * ⚠️ ⛔ Recompô-las aqui criaria uma segunda verdade sobre a mesma decisão —
   * ⛔ e a regra clínica ⛔ envelheceria junto com o layout (**I6**).
   */
  const portao = useMemo(() => estadoDoPortaoIVT(estado, agora), [estado, agora]);

  /**
   * ⚠️⚠️ O VEREDITO DA EVT — ⛔ **outro motor**, ⛔ e ⛔ não outro ramo do da IVT.
   *
   * ⛔ ⛔ Ele **exige** `agora`: a janela é um dos critérios, ⛔ e ⛔ um veredito
   * de trombectomia ⛔ sem relógio ⛔ não é veredito.
   */
  const vereditoEvt = useMemo(
    () => vereditoDaTrombectomia(estado, agora),
    [estado, agora]
  );
  /**
   * ⚠️⚠️ ⛔ O PAPEL DE COR VEM DO NÚCLEO (**seleção × classe**, R1). ⛔ A tela
   * ⛔ não decide que hemorragia na TC tira o verde do cartão — ⛔ ela recebe
   * ⛔ isso pronto ⛔ e pinta.
   */
  const papelEvt = papelDoVereditoEvt(vereditoEvt);
  /** ⚠️ Quantas administrações já estão na trilha — ⛔ para medir discrepância. */
  const administracoes = instanciasDe(estado, TROMBOLISE_IV).length;


  return (
    <View style={e.raiz} testID="avc-superficie-f-conteudo">
      {/**
        * ── ⚠️⚠️ O VEREDITO DA TROMBÓLISE ────────────────────────────────────
        *
        * > *"O APP DEVE SER CAPAZ DE DIZER SE ESTÁ INDICADO ⛔ OU ⛔ NÃO
        * > TROMBÓLISE COM OS CRITÉRIOS QUE TEM, ⛔ E DEPOIS CLARO QUE A DECISÃO
        * > FINAL É DO MÉDICO."* — autor
        *
        * ⚠️ Quatro saídas, ⛔ e ⛔ não duas: *indicada* · *contraindicada* ·
        * *faltam dados* (nomeando quais) · *nenhum critério alcança ⛔ ainda*.
        * ⛔ Achatar as quatro em sim/⛔ não faria **falta de dado** virar
        * **contraindicação** — ⛔ e alguém deixaria de trombolisar por um campo
        * vazio (**E-37**).
        *
        * ⚠️ A ressalva viaja **dentro** do veredito ⛔ e é impressa aqui: ⛔ a
        * conclusão ⛔ não aparece ⛔ sem ela.
        */}
      <View
        style={[
          e.veredito,
          veredito.tipo === "indicada" && e.vereditoIndicada,
          (veredito.tipo === "retida" || veredito.tipo === "nao_recomendada") && e.vereditoContra,
          /** ⚠️ Resposta contra da composição (D1): cautela, ⛔ e ⛔ não o crítico da segurança. */
          veredito.tipo === "nao_sustentada" && e.evtCautela,
        ]}
        testID="avc-f-veredito"
      >
        {/**
          * ── ⚠️⚠️⚠️ ⛔ `altoRisco` ⛔ ONDE SE DECIDE ⛔ REPERFUNDIR ──────────
          *
          * ⚠️ ⛔ Esta é a decisão ⛔ de maior consequência ⛔ do módulo:
          * ⛔ trombolisar ⛔ ou ⛔ não. ⛔ O aviso ⛔ acompanha o **veredito**,
          * ⛔ e ⛔ o `calculoDose` ⛔ fica ⛔ lá embaixo, ⛔ colado ⛔ ao número
          * — ⛔ separados ⛔ por função, ⛔ e ⛔ **⛔ não empilhados**.
          */}
        <AvisoDeApoioClinico
          variante="altoRisco"
          ha
          tr={tr}
          testID="avc-f-aviso-alto-risco"
        />
        <View style={e.vereditoTopo}>
          <Text
            style={[
              e.vereditoSelo,
              veredito.tipo === "indicada" && e.vereditoSeloIndicada,
              (veredito.tipo === "retida" || veredito.tipo === "nao_recomendada")
                && e.vereditoSeloContra,
            ]}
            testID="avc-f-veredito-tipo"
          >
            {/** ⚠️ Símbolo + palavra (**E-15**) — ⛔ a cor ⛔ nunca decide sozinha. */}
            {/**
              * ⚠️⚠️ ⛔ A PALAVRA *"CONTRAINDICADA"* ⛔ NÃO APARECE — ⛔ e ⛔ isso
              * ⛔ não é eufemismo. ⚠️ COR 3 nesta fonte é *not recommended* /
              * *No Benefit*; traduzir por *"contraindicado"* daria à
              * recomendação uma força que ela ⛔ não tem. ⛔ Reprovado por
              * `prova-avc-apresentacao-f` na primeira versão deste bloco.
              */}
            {veredito.tipo === "indicada"
              ? tr("✓ Trombólise indicada")
              : veredito.tipo === "retida"
                ? tr("✕ Reperfusão retida pela imagem")
                : veredito.tipo === "nao_recomendada"
                  ? tr("✕ A diretriz não recomenda")
                  : veredito.tipo === "nao_sustentada"
                    ? tr("✕ Os critérios não sustentam a trombólise")
                    : veredito.tipo === "incompleta"
                      ? tr("? Ainda não dá para concluir")
                      : tr("· Sem critério aplicável ainda")}
          </Text>
        </View>
        <Text style={e.vereditoFrase}>{tr(veredito.frase)}</Text>

        {/**
          * ── ⚠️⚠️⚠️ OS CRITÉRIOS DA COMPOSIÇÃO (D1, commit 6) ─────────────────
          *
          * ⚠️ Decisão do autor: *"O sistema deverá conseguir explicar quais
          * critérios registrados sustentaram a conclusão."* ⛔ Cada linha vem
          * pronta do núcleo — papel, estado, valor legível, fonte ⛔ e onde
          * resolver. ⛔ A tela ⛔ não recalcula ⛔ nada (**I6**), ⛔ e símbolo +
          * palavra dizem o estado ⛔ sem depender de cor (**E-15**).
          */}
        {veredito.criteriosAvaliados.length > 0 ? (
          <View style={e.vereditoFaltas} testID="avc-f-veredito-criterios">
            <Text style={e.vereditoGrau}>{tr("Critérios da conclusão")}</Text>
            {veredito.criteriosAvaliados.map((c) => (
              <View
                key={c.id}
                style={e.vereditoMotivo}
                testID={`avc-f-veredito-criterio-${c.id}`}
              >
                <Text
                  style={e.vereditoVerbo}
                  testID={`avc-f-veredito-criterio-${c.id}-${c.estado}`}
                >
                  {SIMBOLO_DO_CRITERIO[c.estado]} {tr(c.rotulo)}
                  {c.valor ? ` — ${tr(c.valor)}` : ""}
                </Text>
                <Text style={e.vereditoGrau}>{c.fonte} · {c.localizacao}</Text>
                {c.estado !== "satisfeito" && c.oQueFalta ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={tr(c.oQueFalta)}
                    testID={`avc-f-veredito-criterio-ir-${c.id}`}
                    onPress={() => (c.campo ? onIrParaCampo(c.campo) : onAbrirSuperficie(c.leva))}
                    style={e.vereditoFaltaToque}
                  >
                    <Text style={e.vereditoFalta}>{tr(c.oQueFalta)}</Text>
                    <Text style={e.vereditoFaltaSeta}>{SETA}</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Text style={e.vereditoRessalva} testID="avc-f-veredito-autoria">
              {tr(veredito.autoria)}
            </Text>
          </View>
        ) : null}

        {/** ⚠️ Cada motivo cita COR/LOE ⛔ e o verbo **verbatim** da fonte. */}
        {[...veredito.contra, ...veredito.sustentam].map((m) => (
          <View key={m.id} style={e.vereditoMotivo} testID={`avc-f-veredito-motivo-${m.id}`}>
            <Text style={e.vereditoGrau}>
              {tr("COR")} {m.cor} · {tr("LOE")} {m.loe} · {m.localizacao}
            </Text>
            <Text style={e.vereditoVerbo}>{m.verbo}</Text>
          </View>
        ))}

        {/**
          * ⚠️⚠️ O QUE FALTA, **NOMEADO** — ⛔ e ⛔ nunca "dados insuficientes".
          * ⚠️ Pendência sem nome é muro (**E-26**), ⛔ e o médico ⛔ não adivinha
          * o que colher.
          */}
        {veredito.faltam.length > 0 ? (
          <View style={e.vereditoFaltas} testID="avc-f-veredito-faltas">
            {/**
              * ⚠️⚠️ TOCÁVEL, ⛔ e ⛔ não azul de mentira.
              *
              * ⛔ Na primeira captura elas saíram com a cor de ação ⛔ e ⛔ sem
              * ação: o médico tocaria ⛔ e ⛔ nada aconteceria. ⚠️ Cor de ação em
              * texto inerte ensina a desconfiar de **todo** azul da tela.
              *
              * ⚠️ Agora cada falta leva ao campo onde ela se resolve — que é o
              * que **E-26** exige: pendência sem condição de resolução é muro.
              */}
            {veredito.faltam.map((i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={tr(acaoPendente(i))}
                testID={`avc-f-veredito-falta-${i}`}
                onPress={() => onIrParaCampo(i)}
                style={e.vereditoFaltaToque}
              >
                <Text style={e.vereditoFalta}>{tr(acaoPendente(i))}</Text>
                <Text style={e.vereditoFaltaSeta}>{SETA}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/**
          * ⚠️⚠️ CORRIGÍVEL ⛔ NÃO É CONTRAINDICAÇÃO — ⛔ e por isso aparece como
          * **ressalva**, ⛔ e ⛔ não como motivo contra. ⚠️ PA acima da meta tem
          * conserto; tratá-la como veredito negativo desaconselharia uma
          * trombólise que ⛔ só precisava de anti-hipertensivo.
          */}
        {veredito.corrigirAntes.map((b) => (
          <Text key={b.id} style={e.vereditoCorrigir} testID={`avc-f-veredito-corrigir-${b.id}`}>
            {tr("Corrigir antes")}: {tr(b.formulacao)}
          </Text>
        ))}

        <Text style={e.vereditoRessalva} testID="avc-f-veredito-ressalva">
          {tr(veredito.ressalva)}
        </Text>
      </View>

      {/**
        * ⚠️⚠️ A FAIXA DE PARALELISMO ⛔ NUNCA SAI DA TELA.
        *
        * ⛔ Esconder uma das raias faria o médico ler sequência ou exclusão onde
        * a fonte grada COR 1 · LOE A que ⛔ **não** há nenhuma das duas.
        */}
      <View style={e.paralelo} testID="avc-f-paralelismo">
        <Text style={e.paraleloGrau}>
          {tr("COR")} {IVT_E_EVT_EM_PARALELO.cor} · {tr("LOE")} {IVT_E_EVT_EM_PARALELO.loe}
        </Text>
        <Text style={e.paraleloTexto}>
          {tr("Trombólise e trombectomia correm em paralelo — uma não atrasa a outra.")}
        </Text>
      </View>

      {/**
        * ── ⚠️⚠️⚠️ A RAIA DA TROMBECTOMIA — ⛔ AGORA COM VEREDITO ────────────
        *
        * ⚠️ Autorizada pelo autor em 2026-09-07, ⛔ **depois** de o motor
        * passar pelos casos discriminatórios. ⛔ Até aqui esta raia era
        * informativa ⛔ e dizia *"critérios ⛔ ainda ⛔ não incorporados ao
        * motor"* — ⛔ frase que agora seria **falsa**.
        *
        * ── ⚠️⚠️ ⛔ A TELA ⛔ NÃO RECALCULA ⛔ NADA ──────────────────────────
        *
        * ⚠️ Regra do autor: *"A tela ⛔ não pode recalcular: janela, NIHSS,
        * ASPECTS, PC-ASPECTS, mRS, idade, sítio, efeito de massa, COR/LOE.
        * ⛔ Tudo vem do núcleo."*
        *
        * ⛔ ⛔ Por isso ⛔ **⛔ nenhum** `valorAtual`, ⛔ **⛔ nenhuma**
        * comparação numérica ⛔ e ⛔ **⛔ nenhum** `>=` moram neste bloco:
        * ⛔ até o *"2h08"* ⛔ e o rótulo *"NIHSS"* vêm prontos em `fechouCom`.
        * ⚠️ Uma segunda leitura do mesmo fato divergiria da primeira ⛔ no dia
        * em que o NIHSS calculado passasse a existir (**I6**).
        */}
      <View
        /**
         * ⚠️⚠️ ⛔ O `testID` VEM **ANTES** DO `style` — ⛔ e ⛔ isso ⛔ não é
         * estilo de código.
         *
         * ⛔ ⛔ A trava que promete *"a raia da EVT ⛔ não usa o estilo
         * crítico"* recorta o texto **a partir do `testID`**. ⚠️ Com o `style`
         * acima dele, a mutação *"voltar `vereditoContra`"* passou **verde**.
         * ⛔ Sexta varredura de texto a furar nesta sessão.
         */
        testID="avc-f-evt"
        style={[
          e.veredito,
          papelEvt === "sucesso" && e.vereditoIndicada,
          /**
           * ⚠️⚠️ **CAUTELA**, ⛔ e ⛔ NÃO o crítico do bloqueio de segurança.
           *
           * ⛔ ⛔ `vereditoContra` (borda ⛔ e fundo `critical`) é o estilo de
           * *"Contraindicação de segurança ativa"*. ⚠️ ⛔ Usá-lo aqui fazia
           * *"⛔ não recomendada **por ausência de benefício**"* ter a cara de
           * um bloqueio — ⛔ a cor afirmando o que o texto ⛔ nega.
           */
          papelEvt === "atencao" && e.evtCautela,
        ]}
      >
        <CabecalhoDeBloco titulo={tr("Trombectomia mecânica")} testID="avc-f-bloco-evt" />
        <View style={e.vereditoTopo}>
          {/**
            * ⚠️⚠️ Símbolo **e** palavra (**E-15**), ⛔ e ⛔ o slug ⛔ **nunca**.
            *
            * ⛔ ⛔ *"contraindicada"* ⛔ NÃO aparece: COR 3 aqui é
            * *"is not recommended … No Benefit"* — ⛔ ausência de benefício
            * demonstrada, ⛔ e ⛔ não risco proibitivo.
            */}
          <Text
            style={[
              e.vereditoSelo,
              papelEvt === "sucesso" && e.vereditoSeloIndicada,
              papelEvt === "atencao" && e.evtSeloCautela,
            ]}
            testID={`avc-f-evt-estado-${vereditoEvt.tipo}`}
          >
            {SELO_DO_VEREDITO_EVT[vereditoEvt.tipo].simbolo}{" "}
            {tr(SELO_DO_VEREDITO_EVT[vereditoEvt.tipo].rotulo)}
          </Text>
        </View>
        <Text style={e.vereditoFrase} testID="avc-f-evt-frase">
          {tr(vereditoEvt.frase)}
        </Text>

        {/**
          * ── ⚠️⚠️⚠️ A CLASSE, ⛔ AO LADO DA SELEÇÃO (R1, commit 2) ──────────
          *
          * ⛔ A seleção acima diz o que o catálogo pensa da **população**;
          * ⛔ esta linha diz se a **classe de reperfusão** está aberta — ⛔ a
          * exclusão de hemorragia que F-16 rec. 1 exige **antes** de qualquer
          * intervenção, ⛔ e que §5.3 aplica a *realizar trombectomia*.
          *
          * ⚠️ ⛔ As duas aparecem: ⛔ esconder a seleção ⛔ apagaria informação
          * verdadeira; ⛔ esconder a classe ⛔ pintaria de sucesso o que ⛔ não
          * se pode fazer. ⛔ Símbolo + palavra + o gesto que resolve (**E-15**,
          * **E-26**). ⚠️ A frase é a **mesma** da leitura de imagem (**I6**).
          */}
        {vereditoEvt.classe.estado === "retida" ? (
          <View style={e.portaoMotivo} testID={`avc-f-evt-classe-${vereditoEvt.classe.motivo}`}>
            <Text style={e.portaoRotulo}>
              {vereditoEvt.classe.motivo === "hemorragia_presente"
                || vereditoEvt.classe.motivo === "divergente"
                ? ESTADOS.impede.simbolo
                : ESTADOS.verificar.simbolo}{" "}
              {tr("Reperfusão retida pela imagem")}
            </Text>
            <Text style={e.portaoDado}>{tr(vereditoEvt.classe.curto)}</Text>
            <Text style={e.portaoFonte}>{vereditoEvt.classe.fonte}</Text>
            <Text style={e.portaoFalta}>{tr(vereditoEvt.classe.oQueFalta)}</Text>
            <Pressable
              style={e.portaoIr}
              accessibilityRole="button"
              testID="avc-f-evt-classe-ir"
              onPress={() => onIrParaCampo(vereditoEvt.classe.estado === "retida" ? vereditoEvt.classe.campo : "estudo_resultado")}
            >
              <Text style={e.portaoIrTexto}>{tr("Resolver")} ›</Text>
            </Pressable>
          </View>
        ) : null}

        {/**
          * ⚠️⚠️ A MAIS FORTE PRIMEIRO, ⛔ e as demais **⛔ não somem**.
          *
          * ⚠️ Autor: *"Se mais de uma recomendação realmente se aplicar,
          * preservar. ⛔ Não esconder sobreposição legítima ⛔ apenas para
          * simplificar a tela."* ⛔ Em ⛔ exatamente 6 h, ⛔ duas COR 1
          * alcançam o mesmo paciente — ⛔ e a fonte ⛔ não dá regra para
          * excluir uma delas.
          */}
        {[...vereditoEvt.sustentam, ...vereditoEvt.semForca, ...vereditoEvt.contra].map((m, i) => (
          <View
            key={m.id}
            style={[e.vereditoMotivo, i > 0 && e.evtMotivoSecundario]}
            testID={`avc-f-evt-motivo-${m.id}`}
          >
            <Text style={e.vereditoGrau}>
              {tr("COR")} {m.cor} · {tr("LOE")} {m.loe} · {m.localizacao}
            </Text>
            {/** ⚠️ Verbatim em inglês — ⛔ verbatim ⛔ não se traduz (§6.14). */}
            <Text style={e.vereditoVerbo}>{m.verbo}</Text>

            {/**
              * ⚠️⚠️ O FUNDAMENTO — ⛔ **⛔ só os fatos desta recomendação**.
              *
              * ⛔ ⛔ Autor: *"⛔ Não listar critérios de populações que foram
              * descartadas."* ⚠️ A lista sai de `exige` da própria frase,
              * ⛔ então um M1 ⛔ nunca exibe PC-ASPECTS.
              */}
            {m.fechouCom.length > 0 ? (
              <View style={e.evtFatos} testID={`avc-f-evt-fatos-${m.id}`}>
                {m.fechouCom.map((f) => (
                  <Text
                    key={f.insumo}
                    style={e.evtFato}
                    testID={`avc-f-evt-fato-${m.id}-${f.insumo}`}
                  >
                    {tr(f.rotulo)} {f.valor}
                  </Text>
                ))}
              </View>
            ) : null}

            {/**
              * ⚠️⚠️⚠️ A NOTA DE GENERALIZAÇÃO — ⛔ **desta** recomendação, ⛔ e
              * ⛔ **⛔ nunca** uma lista global de limitações da EVT.
              *
              * ⛔ ⛔ As duas notas da fonte citam grupos ⛔ e expectativas de
              * vida **diferentes** (<3 meses × <6 meses). ⚠️ Uma caixa fixa
              * de *"limitações"* aplicaria critério da população errada.
              *
              * ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO É CONTRAINDICAÇÃO: *"limited
              * generalizability"* pede **julgamento**, ⛔ e ⛔ não exclusão —
              * por isso o rótulo diz ⛔ isso por extenso.
              */}
            {m.generalizacao ? (
              <View style={e.evtGeneralizacao} testID={`avc-f-evt-generalizacao-${m.id}`}>
                <Text style={e.evtGeneralizacaoRotulo}>
                  {m.generalizacao.marcador}{" "}
                  {tr("Generalização limitada — exige julgamento clínico, e não é exclusão")}
                </Text>
                <Text style={e.evtGeneralizacaoTexto}>{m.generalizacao.verbatim}</Text>
              </View>
            ) : null}
          </View>
        ))}

        {/**
          * ⚠️⚠️ O QUE FALTA, **NOMEADO ⛔ E RESOLVÍVEL** (**E-26**).
          *
          * ⛔ ⛔ Autor: *"⛔ Não cobrar dados de recomendações já contraditas."*
          * ⚠️ O núcleo já filtra: ⛔ só entra o que falta a quem **⛔ ainda
          * alcança** o caso.
          */}
        {vereditoEvt.faltam.length > 0 ? (
          <View style={e.vereditoFaltas} testID="avc-f-evt-faltas">
            {vereditoEvt.faltam.map((f) => (
              <Pressable
                key={f.insumo}
                accessibilityRole="button"
                accessibilityLabel={tr(acaoPendente(f.insumo))}
                testID={`avc-f-evt-falta-${f.insumo}`}
                onPress={() => onIrParaCampo(f.campos[0] ?? f.insumo)}
                style={e.vereditoFaltaToque}
              >
                <Text style={e.vereditoFalta}>{tr(acaoPendente(f.insumo))}</Text>
                <Text style={e.vereditoFaltaSeta}>{SETA}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={e.vereditoRessalva} testID="avc-f-evt-ressalva">
          {tr(vereditoEvt.ressalva)}
        </Text>
      </View>

      {/**
        * ── ⚠️⚠️⚠️ AS DUAS INDICADAS AO MESMO TEMPO ────────────────────────
        *
        * ⚠️ ⛔ Esta faixa aparece ⛔ **⛔ só** quando as duas frentes estão de
        * pé. ⛔ Permanente, ela viraria aviso de fundo ⛔ e pararia de ser
        * lida — ⛔ e é ⛔ exatamente neste instante que o erro que a fonte
        * nomeia acontece: **esperar a resposta à trombólise antes de chamar a
        * hemodinâmica**.
        *
        * ⚠️ ⛔ E ⛔ ela ⛔ não sugere competição: as duas raias já são
        * visualmente iguais, ⛔ e a frase fala de **ordem no tempo**, ⛔ não de
        * escolha entre uma ⛔ e outra.
        */}
      {portao.liberado
        && papelEvt === "sucesso" ? (
        <View style={e.paralelo} testID="avc-f-evt-sem-esperar">
          <Text style={e.paraleloGrau}>
            {tr("COR")} {IVT_E_EVT_EM_PARALELO.cor} · {tr("LOE")}{" "}
            {IVT_E_EVT_EM_PARALELO.loe} · {IVT_E_EVT_EM_PARALELO.localizacao}
          </Text>
          <Text style={e.paraleloTexto}>{tr(IVT_E_EVT_EM_PARALELO.frase)}</Text>
          <Text style={e.evtGeneralizacaoTexto}>{IVT_E_EVT_EM_PARALELO.verbatim}</Text>
        </View>
      ) : null}

      {/* ── as duas raias, compactas, sempre visíveis ───────────────────── */}
      <View style={e.raias} testID="avc-f-raias">
        <Raia titulo={tr("Trombólise")} itens={itens} terapia="ivt" testID="avc-f-raia-ivt" />
        <Raia titulo={tr("Trombectomia")} itens={itens} terapia="evt" testID="avc-f-raia-evt" />
      </View>

      {/**
        * ⚠️⚠️ MEDICAMENTO · DOSE · ADMINISTRAÇÃO SUBIRAM PARA CÁ (PD-37).
        *
        * ⛔ Eles eram o **11º bloco** da tela, depois de dez faixas de
        * recomendação. ⚠️ O médico precisa responder *"este paciente recebe
        * reperfusão? qual? quanto? o que faço agora?"* — ⛔ e a resposta
        * operacional estava no fim de um catálogo.
        *
        * ⚠️ Agora a ordem é a clínica: **elegibilidade** (as duas raias, acima)
        * → **medicamento** → **dose** → **administração**. As recomendações,
        * os alertas ⛔ e o que falta colher vêm **depois** — ⛔ eles informam a
        * decisão, ⛔ mas ⛔ não são a decisão.
        *
        * ⛔ ⛔ NADA foi removido ⛔ e ⛔ nenhuma regra clínica mudou: é reordenação
        * de apresentação. As faixas continuam inteiras, logo abaixo.
        */}
      {/* ── agente e dose ────────────────────────────────────────────────── */}
      <View style={e.grupo} testID="avc-f-agente">
        <CabecalhoDeBloco titulo={tr(CAMPO_AGENTE.rotulo)} testID="avc-f-bloco-agente" />
        <View style={e.opcoes}>
          {CAMPO_AGENTE.opcoes.map((op) => {
            const on = agente === op;
            return (
              <Pressable
                key={op}
                style={[e.opcao, on ? e.opcaoAtiva : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                testID={`avc-f-agente-${op}`}
                onPress={() => onEscolher(CAMPO_AGENTE.id, op)}
              >
                <Text style={[e.opcaoTexto, on ? e.opcaoTextoAtivo : null]}>{tr(op)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={e.agenteNota}>{tr(CAMPO_AGENTE.nota)}</Text>

        {/**
          * ⚠️⚠️ O CÁLCULO ⛔ NÃO É A ADMINISTRAÇÃO — e a tela diz isso ⛔ antes de
          * mostrar qualquer número. ⛔ Sem peso ⛔ não há dose: o app ⛔ não estima.
          */}
        <View style={e.dose} testID="avc-f-dose">
          <Text style={e.doseRotulo}>{tr("Cálculo de dose — não é administração")}</Text>
          {dose ? (
            <>
              {/**
                * ⚠️⚠️ ESTE É O NÚMERO QUE VAI NA VEIA — `PAPEL.dose` existe para
                * ele (PD-37). ⚠️ Tabular, peso 800: ⛔ nenhum outro texto desta
                * tela pode competir com ele.
                *
                * ⚠️ O agente entra na MESMA linha porque *"17,5 mg"* sozinho
                * ⛔ não é uma prescrição — miligramas **de quê** é parte do
                * número, ⛔ e ⛔ não explicação dele.
                */}
              {/**
                * ⚠️⚠️ ⛔ `calculoDose` ⛔ **⛔ colado ⛔ ao número** — ⛔ e ⛔ ele
                * ⛔ só existe ⛔ porque ⛔ há dose calculada ⛔ nesta tela.
                * ⛔ Sem `dose`, ⛔ este ramo ⛔ inteiro ⛔ não renderiza.
                */}
              <AvisoDeApoioClinico
                variante="calculoDose"
                ha
                tr={tr}
                testID="avc-f-aviso-calculo-dose"
              />
              <Text style={e.doseValor} testID="avc-f-dose-valor">
                {tr(dose.agente === "alteplase" ? "Alteplase" : "Tenecteplase")}{" "}
                {dose.totalMg} {tr("mg")}
              </Text>
              {/** ⚠️ COMO se chegou ao número — abaixo dele, ⛔ e menor. */}
              <Text style={e.doseSub}>
                {dose.mgPorKg} {tr("mg/kg")} · {tr("máx.")} {dose.maximoMg} {tr("mg")}
              </Text>
              <Text style={e.doseSub} testID="avc-f-dose-origem">
                {tr("peso")} {dose.pesoKg} {tr("kg")} — {tr(origemBruta)}
              </Text>
            </>
          ) : (
            <>
              <Text style={e.doseVazia} testID="avc-f-dose-vazia">
                {tr(
                  "Sem peso registrado e sem agente escolhido, não há dose. O app não estima peso."
                )}
              </Text>
              {/**
                * ── ⚠️⚠️⚠️ **D-126** · A LEITURA DO PESO MORA ⛔ AQUI ────────
                *
                * ⚠️ Decisão do autor, 2026-09-08: *"a casa natural é
                * Reperfusão, porque é ⛔ ali que o peso passa a ter
                * consequência terapêutica na dose do trombolítico"*.
                *
                * ⛔ ⛔ O **fato** continua em Paciente; ⛔ o que aparece ⛔ aqui é
                * a **interpretação**, ⛔ e ⛔ ela aparece ⛔ quando o fato se
                * torna relevante — ⛔ que é ⛔ exatamente o instante em que
                * ⛔ não há dose por falta de peso.
                *
                * ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO CRIA CONSUMIDOR ⛔ NOVO: ⛔ a Reperfusão
                * ⛔ já exige `peso` (`exige: ["peso"]`, ⛔ e `pesoKg` no cálculo).
                * ⛔ A regra de dose ⛔ não foi tocada.
                *
                * ⚠️⚠️ ⛔ E ⛔ **⛔ SÓ QUANDO FALTA**: ⛔ com o peso informado a
                * mesma função devolve *"Peso informado…"*, ⛔ que ⛔ ao lado de
                * *"Sem peso registrado…"* seriam **duas frases se
                * contradizendo** na mesma caixa. ⛔ Medido na primeira
                * execução, ⛔ e ⛔ não previsto.
                *
                * ⚠️ ⛔ E ⛔ ela ⛔ não bloqueia: a frase da fonte é
                * *"⛔ **não atrasar** terapia tempo-dependente"* — ⛔ é o
                * contrário de portão.
                */}
              {leituraDoPeso(estado).conclusao !== "desconhecido" ? null : (
                <Text style={e.doseNaoAtrasa} testID="avc-f-leitura-peso">
                  {tr(leituraDoPeso(estado).curto)}
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {/**
        * ── ⚠️⚠️ ⛔ A DECISÃO — ⛔ O DEGRAU QUE O PORTÃO GOVERNA ─────────────
        *
        * ⚠️ ⛔ Quatro momentos, ⛔ e ⛔ eles ⛔ não falam um pelo outro:
        * **motor recomenda** ≠ **médico decidiu** ≠ **medicação administrada**
        * ≠ **monitorização**.
        *
        * ⚠️⚠️ ⛔ E A INFORMAÇÃO ⛔ NÃO FICA ATRÁS DO PORTÃO — pedido do autor:
        * *"o médico pode precisar ver dose calculada ⛔ ou agente possível
        * ⛔ **enquanto resolve um bloqueio**. O que fica travado é o gesto que
        * transforma aquilo em decisão de tratar"*. ⛔ A dose ⛔ e o agente
        * seguem visíveis, ⛔ acima.
        */}
      <View style={e.grupo} testID="avc-f-decisao-ivt">
        <CabecalhoDeBloco titulo={tr("Decisão sobre prosseguir")} testID="avc-f-bloco-decisao" />

        {!portao.liberado ? (
          <View style={e.portao} testID="avc-f-portao">
            {/**
              * ⚠️⚠️ ⛔ TÍTULO + SÍMBOLO + TEXTO — ⛔ e ⛔ **⛔ nunca ⛔ só cor**
              * (**E-15**, item 3 do autor). ⛔ Quem ⛔ não distingue vermelho de
              * âmbar precisa ler o estado.
              */}
            <Text style={e.portaoTitulo} testID={`avc-f-portao-estado-${portao.estado}`}>
              {SIMBOLO_DO_PORTAO[portao.estado]} {tr(TITULO_DO_PORTAO[portao.estado])}
            </Text>

            {portao.motivos.length === 0 && veredito.faltam.length > 0 ? (
              <Text style={e.portaoFalta} testID="avc-f-portao-faltam">
                {tr("Falta registrar")}: {veredito.faltam.map((i) => tr(acaoPendente(i))).join(" · ")}
              </Text>
            ) : null}

            {/**
              * ⚠️⚠️ ⛔ TODOS OS MOTIVOS, ⛔ E ⛔ NUM SÓ NÍVEL DE ATENÇÃO ⛔ NÃO:
              * ⛔ o primeiro é o que **nomeia o estado**; ⛔ os outros seguem
              * listados ⛔ porque ⛔ **⛔ não podem sumir** ⛔ só ⛔ por existir um
              * bloqueio mais forte (item 4 do autor).
              */}
            {portao.motivos.map((m, i) => (
              <View key={m.id} style={e.portaoMotivo} testID={`avc-f-portao-motivo-${m.id}`}>
                <Text style={e.portaoNivel}>
                  {i === 0 ? tr("Motivo principal") : tr("Também ativo")}
                </Text>
                <Text style={e.portaoRotulo}>{tr(m.rotulo)}</Text>
                {m.dado ? (
                  <Text style={e.portaoDado} testID={`avc-f-portao-dado-${m.id}`}>
                    {tr(m.dado)}
                  </Text>
                ) : null}
                <Text style={e.portaoFonte}>{m.fonte}</Text>
                <Text style={e.portaoFalta}>{tr(m.oQueFalta)}</Text>
                {m.leva ? (
                  <Pressable
                    style={e.portaoIr}
                    accessibilityRole="button"
                    testID={`avc-f-portao-ir-${m.id}`}
                    onPress={() => (m.campo ? onIrParaCampo(m.campo) : onAbrirSuperficie(m.leva as SuperficieId))}
                  >
                    <Text style={e.portaoIrTexto}>{tr("Resolver")} ›</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/**
          * ⚠️ ⛔ O gesto ⛔ só aparece com o portão aberto. ⛔ Desabilitado com a
          * razão ⛔ ao lado seria ⛔ o mesmo botão morto ⛔ com outra roupa — ⛔ e
          * ⛔ a razão ⛔ já está escrita acima, ⛔ com o caminho para resolvê-la.
          */}
        {/**
          * ── ⚠️⚠️ E-47 · A CONDIÇÃO RESOLUTIVA **VISÍVEL** (R3, commit 7) ─────
          *
          * ⚠️ Portão aberto ⛔ não é silêncio: ⛔ sem motivo de suspeita ⛔ e ⛔ sem
          * varfarina/heparina, a IVT pode ser iniciada antes do coagulograma
          * **com regra de suspensão** — ⛔ e a regra precisa estar na tela,
          * ⛔ junto do gesto. ⛔ O mesmo para risco declarado pela fonte.
          */}
        {portao.liberado
          && portao.motivos.some((m) => m.efeito === "condicao_resolutiva" || m.efeito === "informa") ? (
          <View style={e.portao} testID="avc-f-portao-condicoes">
            {portao.motivos
              .filter((m) => m.efeito === "condicao_resolutiva" || m.efeito === "informa")
              .map((m) => (
                <View key={m.id} style={e.portaoMotivo} testID={`avc-f-portao-condicao-${m.id}`}>
                  <Text style={e.portaoNivel}>
                    {m.efeito === "condicao_resolutiva"
                      ? tr("Condição resolutiva vinculada")
                      : tr("Risco declarado pela fonte")}
                  </Text>
                  <Text style={e.portaoRotulo}>{tr(m.rotulo)}</Text>
                  {m.dado ? <Text style={e.portaoDado}>{tr(m.dado)}</Text> : null}
                  <Text style={e.portaoFonte}>{m.fonte}</Text>
                  <Text style={e.portaoFalta}>{tr(m.oQueFalta)}</Text>
                </View>
              ))}
          </View>
        ) : null}

        {portao.liberado ? (
          DECISAO_DE_PROSSEGUIR.map((campo) => (
            <CampoDaSuperficie
              key={campo.id}
              campo={{ ...campo, casa: "reperfusao" }}
              casaAtual="reperfusao"
              bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
              /**
               * ⚠️ ⛔ A trava da Fase 5 pegou ⛔ este arquivo: literal
               * `undefined` ⛔ é **campo cego**. ⛔ Aqui a decisão é `escolha`
               * ⛔ e ⛔ nem usaria o número — ⛔ mas ⛔ o próximo campo deste bloco
               * ⛔ pode ser numérico, ⛔ e ⛔ nasceria mudo.
               */
              numero={(() => {
                const v = valorAtual(estado, campo.id)?.valor;
                return typeof v === "number" ? v : undefined;
              })()}
              agora={agora}
              detalheAberto={false}
              onAlternarDetalhe={() => undefined}
              onEscolher={onEscolher}
              onMedir={() => undefined}
              onHora={() => undefined}
              onDesfazer={() => undefined}
            />
          ))
        ) : null}
      </View>

      {/**
        * ⚠️⚠️ A AÇÃO DE TROMBÓLISE — ⛔ DECIDIR ⛔ NÃO É ADMINISTRAR.
        *
        * ⚠️ A cadeia é: recomendação → decisão do agente → **ação** → monitorização
        * (Superfície G). ⛔ Sem esta ação registrada, a Table 7 ⛔ nunca aparece —
        * ⛔ e o app ⛔ não presume trombólise porque um critério ficou aplicável.
        *
        * ⚠️⚠️ O agente aqui é o **efetivamente utilizado**, ⛔ e ⛔ não corrige o
        * agente em consideração: os dois podem divergir, ⛔ e a trilha guarda os dois.
        */}
      <View style={e.grupo} testID="avc-f-acao-trombolise">
        <CabecalhoDeBloco titulo={tr("Trombólise administrada")} testID="avc-f-bloco-acao-ivt" />
        {instanciasDe(estado, TROMBOLISE_IV).map((inst, i) => (
          <View key={inst} style={e.cartao} testID={`avc-f-trombolise-${inst}`}>
            <Text style={e.grau}>
              {tr("Administração")} {i + 1}
            </Text>
            {ACAO_DE_TROMBOLISE.map((campo) => (
              <CampoDaSuperficie
                key={`${inst}-${campo.id}`}
                campo={{ ...campo, casa: "reperfusao" }}
                casaAtual="reperfusao"
                bruto={String(valorNaInstancia(estado, inst, campo.id)?.valor ?? "")}
                numero={
                  typeof valorNaInstancia(estado, inst, campo.id)?.valor === "number"
                    ? (valorNaInstancia(estado, inst, campo.id)?.valor as number)
                    : undefined
                }
                agora={agora}
                detalheAberto={false}
                onAlternarDetalhe={() => undefined}
                onEscolher={(c, v) => onEscolherNaInstancia(inst, c, v)}
                onMedir={() => undefined}
                onHora={(c, v) => onHoraNaInstancia(inst, c, v)}
                onDesfazer={(c) => onDesfazerNaInstancia(inst, c)}
              />
            ))}
          </View>
        ))}
        {/**
          * ── ⚠️⚠️ ⛔ ESTE GESTO É **DOCUMENTAÇÃO**, ⛔ E ⛔ NUNCA SE TRAVA ─────
          *
          * ⚠️ Regra do autor, 2026-09-07, ⛔ depois de eu ter travado ⛔ ele por
          * engano:
          *
          * > *"o sistema pode bloquear uma decisão **prospectiva**, ⛔ mas
          * >  ⛔ não pode bloquear o registro **retrospectivo** de um fato
          * >  clínico já ocorrido."*
          *
          * ⛔ ⛔ Travá-lo fazia o app **recusar documentar** uma trombólise já
          * dada — ⛔ e, ⛔ pior, ⛔ parava a monitorização da **Table 7**, que
          * nasce ⛔ **deste** registro.
          *
          * ⚠️ ⛔ O portão governa a **decisão**, ⛔ acima. ⛔ Aqui ⛔ só se
          * registra o que aconteceu.
          */}
        <Pressable
          style={e.opcao}
          accessibilityRole="button"
          testID="avc-nova-trombolise"
          onPress={onNovaTrombolise}
        >
          <Text style={e.opcaoTexto}>{tr("Registrar administração")}</Text>
        </Pressable>

        {/**
          * ⚠️⚠️ ⛔ E A DISCREPÂNCIA FICA **AUDITÁVEL**, ⛔ sem impedir ⛔ nada.
          *
          * ⛔ Registrar uma administração com o portão fechado ⛔ não é erro de
          * uso: ⛔ o paciente pode ter chegado trombolisado, ⛔ ou o médico pode
          * ter decidido com dado que o motor ⛔ ainda ⛔ não tem. ⚠️ O que o app
          * deve é **dizer que houve divergência** — ⛔ e ⛔ nunca escondê-la
          * ⛔ nem impedi-la.
          */}
        {administracoes > 0 && !portao.liberado ? (
          <View style={e.discrepancia} testID="avc-f-discrepancia">
            <Text style={e.discrepanciaTitulo}>
              {SIMBOLO_DO_PORTAO[portao.estado]}{" "}
              {tr("Administração registrada apesar de bloqueio identificado")}
            </Text>
            {/**
              * ⚠️⚠️ ⛔ A DIVERGÊNCIA CARREGA **O QUE FOI DIVERGIDO** — ⛔ e ⛔ não
              * ⛔ só que houve divergência.
              *
              * ⚠️ Exigência do autor (**item 4**): associar bloqueio ativo,
              * horário, estado do portão ⛔ e motivos. ⛔ O **horário** ⛔ já vive
              * na trilha do fato registrado (`ivt_inicio`), ⛔ e ⛔ repeti-lo
              * aqui criaria uma segunda verdade sobre o mesmo instante (**I6**).
              */}
            <Text style={e.discrepanciaEstado} testID="avc-f-discrepancia-estado">
              {tr(TITULO_DO_PORTAO[portao.estado])}
            </Text>
            {portao.motivos.map((m) => (
              <Text
                key={m.id}
                style={e.discrepanciaMotivo}
                testID={`avc-f-discrepancia-motivo-${m.id}`}
              >
                {tr(m.rotulo)}
                {m.dado ? ` — ${tr(m.dado)}` : ""} · {m.fonte}
              </Text>
            ))}
          </View>
        ) : null}
      </View>


      {/**
        * ⚠️⚠️ ⛔ NENHUM RELÓGIO CORRENDO — e isso precisa APARECER.
        *
        * ⚠️ Sem este aviso, a tela do paciente vazio ⛔ não mostra relógio
        * ⛔ nenhum, ⛔ e o dado mais urgente do AVC fica invisível até que outra
        * coisa apareça. Encontrado na revisão em largura de celular.
        *
        * ⛔ E ele ⛔ **não** é um contador global: ⛔ não traz número, ⛔ não traz
        * janela ⛔ e ⛔ não soma marcos. É um convite a registrar **os marcos**,
        * no plural — que é o oposto de fundi-los em "a janela".
        */}
      {nenhumRelogioCorre ? (
        <Pressable
          style={e.semRelogio}
          accessibilityRole="button"
          testID="avc-f-sem-relogio"
          onPress={() => onIrParaCampo("hora_ultima_vez_bem")}
        >
          <Text style={e.semRelogioTitulo}>{tr("Nenhum relógio iniciado")}</Text>
          <Text style={e.semRelogioTexto}>
            {/**
              * ⚠️ ⛔ Era *"em Entrada e estabilização"* — ⛔ e a cronologia mudou
              * para a Avaliação AVC em **C7**. ⚠️ ⛔ O texto ⛔ agora ⛔ não
              * codifica o nome da fase: ⛔ o toque leva ao campo, ⛔ e o nome
              * ⛔ não pode mentir de novo na próxima migração.
              */}
            {tr("Registrar os marcos de tempo do atendimento.")}
          </Text>
        </Pressable>
      ) : null}

      {/* ── 1 · ação com relógio correndo ────────────────────────────────── */}
      {acoes.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-acao">
          <CabecalhoDeBloco titulo={tr("Com prazo correndo")} testID="avc-f-bloco-acao" />
          {acoes.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/* ── 2 · aplicável sem prazo correndo ─────────────────────────────── */}
      {aplicaveis.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-aplicavel">
          <CabecalhoDeBloco titulo={tr("Aplicáveis a este paciente")} testID="avc-f-bloco-aplicavel" />
          {aplicaveis.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/* ── 3 · a um dado de fechar ──────────────────────────────────────── */}
      {aUmDado.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-um-dado">
          <CabecalhoDeBloco titulo={tr("Falta um dado para fechar")} testID="avc-f-bloco-um-dado" />
          {aUmDado.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/* ── 4 · alerta COR 3, só quando a população bate ─────────────────── */}
      {alertas.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-cor3">
          <CabecalhoDeBloco titulo={tr("Alertas para este contexto")} testID="avc-f-bloco-cor3" />
          {alertas.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 5 · O AGRUPAMENTO PELA FALTA — a decisão central da tela.
        *
        * ⛔ Uma linha por **dado**, ⛔ e ⛔ não por recomendação. A frase clínica é
        * o que se lê; a contagem fica pequena, porque "abre 11" é informação de
        * arquitetura, ⛔ e ⛔ não de medicina.
        */}
      {faltas.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faltas">
          <CabecalhoDeBloco titulo={tr("O que falta colher")} testID="avc-f-bloco-faltas" />
          {(abertos.includes("__faltas__")
            ? faltas
            : faltas.slice(0, FALTAS_EM_PRIMEIRO_PLANO)
          ).map((f) => (
            <Pressable
              key={f.insumo}
              style={e.falta}
              accessibilityRole="button"
              testID={`avc-f-falta-${f.insumo}`}
              disabled={f.campos.length === 0}
              onPress={() => (f.campos[0] ? onIrParaCampo(f.campos[0]) : undefined)}
            >
              <View style={e.faltaTexto}>
                <Text style={e.faltaMotivo}>{tr(f.motivo)}</Text>
                <Text style={e.faltaQuantas} testID={`avc-f-falta-quantas-${f.insumo}`}>
                  {f.quantas === 1
                    ? tr("1 recomendação depende deste dado")
                    : `${f.quantas} ${tr("recomendações dependem deste dado")}`}
                </Text>
              </View>
              <Text style={e.faltaSeta}>›</Text>
            </Pressable>
          ))}
          {faltas.length > FALTAS_EM_PRIMEIRO_PLANO ? (
            <Pressable
              style={e.foraBotao}
              accessibilityRole="button"
              testID="avc-f-faltas-resto"
              onPress={() => alternar("__faltas__")}
            >
              <Text style={e.foraTexto}>
                {abertos.includes("__faltas__")
                  ? tr("Recolher os demais dados")
                  : `${faltas.length - FALTAS_EM_PRIMEIRO_PLANO} ${tr("outros dados destravam menos")}`}
              </Text>
              <Text style={e.faltaSeta}>{abertos.includes("__faltas__") ? "⌃" : "⌄"}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 6 · DÍVIDA DE FONTE — visível, ⛔ e COMPACTA.
        *
        * ⛔ Ocupar meia tela para dizer que o app ⛔ não sabe transformaria a
        * dívida em protagonista. Marcador curto; a explicação abre ao toque.
        */}
      {semFonte.length > 0 ? (
        <View style={e.grupo} testID="avc-f-sem-fonte">
          {semFonte.map((i) => {
            const aberto = abertos.includes(i.leitura.id);
            return (
              <Pressable
                key={i.leitura.id}
                style={e.divida}
                accessibilityRole="button"
                testID={`avc-f-divida-${i.leitura.id}`}
                onPress={() => alternar(i.leitura.id)}
              >
                <View style={e.dividaTopo}>
                  <Text style={e.dividaMarcador}>{tr("Critério não definido pela fonte")}</Text>
                  <Text style={e.dividaGrau}>
                    {tr("COR")} {i.leitura.cor} · {i.leitura.terapia === "ivt" ? tr("Trombólise") : tr("Trombectomia")}
                  </Text>
                </View>
                <Text style={e.dividaPopulacao}>{tr(i.leitura.populacao)}</Text>
                {aberto ? (
                  <View style={e.dividaDetalhe} testID={`avc-f-divida-detalhe-${i.leitura.id}`}>
                    <Text style={e.dividaTexto}>
                      {tr(
                        "A diretriz não define este critério, então o app não conclui por você. Isto não é dado faltando do paciente, e não é falha do app."
                      )}
                    </Text>
                    <Text style={e.dividaSlot}>
                      {tr("Slot")} {i.leitura.travadaPor} · {i.leitura.localizacao}
                    </Text>
                    <Relogios relogios={i.relogios} onIrParaCampo={onIrParaCampo} />
                  </View>
                ) : (
                  <Text style={e.dividaAbrir}>{tr("Toque para entender por quê")}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ PRINCÍPIO GERAL — ⛔ NÃO recebe veredito de correspondência.
        *
        * ⛔ Ele ⛔ não afirma que se aplica a este paciente; pressupõe elegibilidade
        * ⛔ e diz respeito à condução do tratamento. Fica embaixo, com procedência.
        */}
      <View style={e.grupo} testID="avc-f-principios">
        <CabecalhoDeBloco titulo={tr("Princípio geral")} testID="avc-f-bloco-principios" />
        {PRINCIPIOS_GERAIS.map((g) => (
          <View key={g.id} style={e.principio} testID={`avc-f-principio-${g.id}`}>
            <Text style={e.grau}>
              {tr("COR")} {g.cor} · {tr("LOE")} {g.loe}
            </Text>
            <Text style={e.verbo}>“{g.verbo}”</Text>
            <Text style={e.principioPressupoe}>
              {tr("Pressupõe")}: {tr(g.pressupoe)}. {tr("Não afirma corresponder a este caso.")}
            </Text>
            <Text style={e.fonte}>{g.localizacao}</Text>
          </View>
        ))}
      </View>

      {/* ── 7 · fora da população, recolhidas ────────────────────────────── */}
      {fora.length > 0 ? (
        <View style={e.grupo} testID="avc-f-fora">
          <Pressable
            style={e.foraBotao}
            accessibilityRole="button"
            testID="avc-f-fora-abrir"
            onPress={() => alternar("__fora__")}
          >
            <Text style={e.foraTexto}>
              {fora.length}{" "}
              {fora.length === 1
                ? tr("recomendação não corresponde a este paciente")
                : tr("recomendações não correspondem a este paciente")}
            </Text>
            <Text style={e.faltaSeta}>{abertos.includes("__fora__") ? "⌃" : "⌄"}</Text>
          </Pressable>
          {abertos.includes("__fora__")
            ? fora.map((i) => (
                <View key={i.leitura.id} style={e.foraItem} testID={`avc-f-fora-${i.leitura.id}`}>
                  <Text style={e.foraPopulacao}>{tr(i.leitura.populacao)}</Text>
                  {/**
                    * ⚠️ DIZ **POR QUE** SAIU. "Não corresponde" sem o motivo é o app
                    * pedindo confiança cega.
                    */}
                  <Text style={e.foraMotivo}>
                    {tr("Fora por")}: {i.leitura.incompativeis.map((x) => tr(x)).join(", ")}
                  </Text>
                </View>
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}

/* ── raia compacta ──────────────────────────────────────────────────────── */

function Raia({
  titulo,
  itens,
  terapia,
  testID,
}: {
  titulo: string;
  itens: readonly ItemDaTela[];
  terapia: "ivt" | "evt";
  testID: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const p = placar(itens, terapia);
  const aplicaveis = p.acao_com_relogio + p.aplicavel;
  const potenciais = p.a_um_dado + p.potencial_recolhida;

  return (
    <View style={e.raia} testID={testID}>
      <Text style={e.raiaTitulo}>{titulo}</Text>
      <View style={e.raiaLinha}>
        <Text style={e.raiaNumeroAplicavel} testID={`${testID}-aplicaveis`}>{aplicaveis}</Text>
        <Text style={e.raiaRotulo}>{tr("aplicáveis")}</Text>
      </View>
      <View style={e.raiaLinha}>
        <Text style={e.raiaNumeroPotencial} testID={`${testID}-potenciais`}>{potenciais}</Text>
        <Text style={e.raiaRotulo}>{tr("potenciais")}</Text>
      </View>
      {p.sem_fonte > 0 ? (
        <View style={e.raiaLinha}>
          <Text style={e.raiaNumeroDivida} testID={`${testID}-sem-fonte`}>{p.sem_fonte}</Text>
          <Text style={e.raiaRotulo}>{tr("sem critério na fonte")}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ── cartão de recomendação ─────────────────────────────────────────────── */

function Cartao({
  item,
  aberto,
  onAlternar,
  onIrParaCampo,
}: {
  item: ItemDaTela;
  aberto: boolean;
  onAlternar: () => void;
  onIrParaCampo: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const { leitura } = item;
  const alerta = item.faixa === "alerta_cor3";

  return (
    <Pressable
      style={[e.cartao, alerta ? e.cartaoAlerta : null]}
      accessibilityRole="button"
      testID={`avc-f-rec-${leitura.id}`}
      onPress={onAlternar}
    >
      <Text style={[e.grau, alerta ? e.grauAlerta : null]}>
        {tr("COR")} {leitura.cor} · {tr("LOE")} {leitura.loe} ·{" "}
        {leitura.terapia === "ivt" ? tr("Trombólise") : tr("Trombectomia")}
      </Text>
      <Text style={e.populacao}>{tr(leitura.populacao)}</Text>
      {/**
        * ⚠️⚠️ O VERBO DA FONTE, EM INGLÊS, ⛔ SEM TRADUÇÃO E ⛔ SEM CONVERSÃO.
        * ⛔ *not recommended* ⛔ nunca vira "contraindicado" (§6.14, E-45).
        */}
      <Text style={e.verbo}>“{leitura.verbo}”</Text>

      <Relogios relogios={item.relogios} onIrParaCampo={onIrParaCampo} />

      {leitura.faltam.length > 0 ? (
        /**
         * ⚠️⚠️ AÇÃO CLÍNICA, ⛔ E ⛔ NÃO O NOME DA VARIÁVEL.
         *
         * ⛔ Esta linha imprimia `Falta: deficit_incapacitante` — o identificador
         * interno, na tela clínica. ⛔ `tr()` faz *fallback* para a própria
         * chave, então o slug **atravessava em silêncio**, ⛔ e ⛔ nenhum teste
         * pegava.
         *
         * ⚠️ Agora passa por `acaoPendente()`, ⛔ e o que aparece é o que o
         * médico **faz**: *"Definir se o déficit é incapacitante"*. ⚠️ A fonte é
         * única (`rotulos-clinicos.ts`), ⛔ e a trava `valida-rotulos-clinicos`
         * reprova identificador em texto de tela.
         */
        <Text style={e.falta1} testID={`avc-f-rec-falta-${leitura.id}`}>
          {leitura.faltam.map((x) => tr(acaoPendente(x))).join(" · ")}
        </Text>
      ) : null}

      {aberto ? (
        <View style={e.detalhe} testID={`avc-f-rec-detalhe-${leitura.id}`}>
          {leitura.sustentam.length > 0 ? (
            <Text style={e.sustentam}>
              {tr("Sustentam")}: {leitura.sustentam.map((x) => tr(x)).join(", ")}
            </Text>
          ) : null}
          <Text style={e.fonte}>
            {leitura.localizacao} · {tr("slot")} {leitura.slot}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ── relógios ───────────────────────────────────────────────────────────── */

function Relogios({
  relogios,
  onIrParaCampo,
}: {
  relogios: readonly LeituraDeRelogio[];
  onIrParaCampo: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  if (relogios.length === 0) return null;

  return (
    <>
      {relogios.map((r, i) => (
        /**
         * ⚠️⚠️ TODO PRAZO MOSTRA O NOME DO SEU RELÓGIO — E-36.
         *
         * ⛔ Uma recomendação pode ter DOIS relógios simultâneos, com marcos e
         * faixas diferentes. Eles aparecem empilhados, ⛔ nunca fundidos.
         */
        <View key={`${r.marco}-${r.campo ?? i}`} style={e.relogio} testID={`avc-f-relogio-${r.marco}-${i}`}>
          <View style={e.relogioEsq}>
            <Text style={e.relogioMarco}>{tr(r.rotulo)}</Text>
            {/**
              * ⚠️ Vírgula, ⛔ e ⛔ não ponto: `4.5 h` ⛔ não é como se escreve
              * meia hora em PT-BR ⛔ nem em ES. O formatador já existia no app.
              */}
            <Text style={e.relogioFaixa}>
              {typeof r.deHoras === "number" ? `${numeroCurto(r.deHoras, 0.1)}–` : ""}
              {numeroCurto(r.ateHoras, r.ateHoras % 1 === 0 ? 1 : 0.1)} {tr("h")}
            </Text>
          </View>
          {r.estado === "correndo" ? (
            <Text
              style={[e.relogioTempo, (r.restantesMin ?? 0) <= 60 ? e.relogioApertado : null]}
              testID={`avc-f-relogio-tempo-${r.marco}-${i}`}
            >
              {formatarRestante(r.restantesMin ?? 0, tr)}
            </Text>
          ) : r.estado === "sem_campo" ? (
            /** ⚠️⚠️ A fonte nomeia o marco ⛔ e o app ⛔ não tem onde guardá-lo. */
            <Text style={e.relogioSemCampo} testID={`avc-f-relogio-sem-campo-${r.marco}`}>
              {tr("marco sem campo no app")}
            </Text>
          ) : (
            <Pressable
              style={e.relogioRegistrar}
              accessibilityRole="button"
              testID={`avc-f-relogio-registrar-${r.marco}`}
              onPress={() => (r.campo ? onIrParaCampo(r.campo) : undefined)}
            >
              <Text style={e.relogioSemMarco}>{tr("registrar o marco")}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </>
  );
}

/**
 * ⚠️ Janela vencida ⛔ não some ⛔ e ⛔ não vira zero — ela diz que venceu, porque
 * a recomendação continua existindo e a decisão continua sendo do médico.
 */
function formatarRestante(min: number, tr: (pt: string) => string): string {
  if (min <= 0) return tr("janela vencida");
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} ${tr("min")}`;
}

/* ── estilos ────────────────────────────────────────────────────────────── */

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    /** ⚠️ ⛔ O portão fala **ao lado** da ação — ⛔ e ⛔ nunca no lugar dela. */
    portao: {
      gap: ESPACO.xs,
      padding: ESPACO.sm,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.warning,
      backgroundColor: tema.cores.surface,
      marginBottom: ESPACO.sm,
    },
    portaoTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    portaoMotivo: { gap: 2, paddingTop: ESPACO.xs },
    /** ⚠️ ⛔ A hierarquia é TEXTO, ⛔ e ⛔ não tamanho de fonte ⛔ nem cor. */
    /** ⚠️ ⛔ A raia da EVT — ⛔ densa ⛔ e legível, ⛔ e ⛔ sem cara de decisão. */
    evtNota: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1, marginBottom: ESPACO.xs },
    evtLinha: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.xs, paddingVertical: 2 },
    evtSimbolo: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary, width: 16 },
    evtRotulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, flex: 1, flexShrink: 1 },
    evtEstado: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1 },
    portaoNivel: { ...PAPEL.legenda, color: tema.cores.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
    portaoRotulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, flexShrink: 1 },
    portaoDado: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    portaoFonte: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    portaoFalta: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1 },
    portaoIr: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
      marginTop: ESPACO.xs,
    },
    portaoIrTexto: { ...PAPEL.textoPrincipal, color: tema.cores.primary, fontWeight: "700" },
    /** ⚠️ ⛔ Bloqueado ⛔ e **legível** — ⛔ cinza sobre cinza esconde a razão. */
    opcaoBloqueada: { borderStyle: "dashed", opacity: 0.6 },
    /** ⚠️ ⛔ A divergência é **registro**, ⛔ e ⛔ não repreensão: ⛔ tom de aviso, ⛔ e ⛔ nada de vermelho de erro. */
    discrepancia: {
      gap: 2,
      marginTop: ESPACO.xs,
      padding: ESPACO.sm,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.warning,
      backgroundColor: tema.cores.surface,
    },
    discrepanciaTitulo: { ...PAPEL.textoPrincipal, color: tema.cores.warning, fontWeight: "700", flexShrink: 1 },
    discrepanciaEstado: { ...PAPEL.legenda, color: tema.cores.text, flexShrink: 1 },
    discrepanciaMotivo: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1 },
    opcaoTextoBloqueado: { color: tema.cores.textSecondary },

    raiz: { gap: ESPACO.md },

    /**
     * ⚠️⚠️ O CARD DO VEREDITO — o *"Etapa atual / Elegibilidade"* das
     * referências. ⛔ Ele é o **primeiro** bloco da Reperfusão ⛔ e o único com
     * este tratamento: dois heróis ⛔ não deixam ⛔ nenhum herói.
     *
     * ⚠️ Neutro por padrão. ⛔ A cor só entra quando há **resposta** — verde
     * quando os critérios fecham, vermelho quando há achado que contraindica.
     * ⛔ *"Faltam dados"* fica **neutro**, ⛔ e ⛔ isso ⛔ não é timidez: pintar a
     * ausência de âmbar transformaria toda tela recém-aberta em alarme.
     */
    veredito: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.border,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    },
    vereditoIndicada: {
      borderColor: tema.cores.success,
      backgroundColor: tema.cores.successTint,
    },
    vereditoContra: {
      borderColor: tema.cores.critical,
      backgroundColor: tema.cores.criticalTint,
    },
    vereditoTopo: { flexDirection: "row", alignItems: "center" },
    vereditoSelo: { ...PAPEL.tituloDaDecisao, color: tema.cores.text },
    vereditoSeloIndicada: { color: tema.cores.success },
    vereditoSeloContra: { color: tema.cores.critical },
    vereditoFrase: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    /** ⚠️ O motivo, com a fonte colada nele — ⛔ veredito sem fonte ⛔ não confere. */
    vereditoMotivo: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      padding: ESPACO.sm,
      gap: 2,
    },
    vereditoGrau: { ...PAPEL.micro, color: tema.cores.textSecondary },
    /** ⚠️ Verbatim em inglês — ⛔ verbatim ⛔ não se traduz (§6.14). */
    vereditoVerbo: { ...PAPEL.textoSecundario, color: tema.cores.text },
    vereditoFaltas: { gap: ESPACO.xs },
    /** ⚠️ Alvo de dedo, ⛔ e ⛔ não de mouse. */
    /**
     * ⚠️⚠️ **E-26 EXIGE QUE A PENDÊNCIA SE RESOLVA** — ⛔ e uma pendência que
     * ⛔ não parece tocável ⛔ não se resolve. ⚠️ Ela já levava ao campo certo;
     * ⛔ o que faltava era **parecer que levava**.
     */
    vereditoFaltaToque: {
      minHeight: TOQUE.minimo,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1.5,
      borderColor: tema.cores.primary,
    },
    vereditoFaltaSeta: { ...PAPEL.tituloDeSecao, color: tema.cores.primary },
    /** ⚠️ A falta é dita como **ação**, ⛔ e ⛔ nunca como nome de campo. */
    vereditoFalta: { ...PAPEL.textoPrincipal, color: tema.cores.primary },
    vereditoCorrigir: { ...PAPEL.textoSecundario, color: tema.cores.warning },

    /**
     * ⚠️⚠️ A CONCOMITANTE FICA **RECUADA**, ⛔ e ⛔ NÃO ESCONDIDA.
     *
     * ⚠️ Autor: *"A recomendação mais forte pode ser a principal, e as demais
     * podem aparecer como contexto secundário."* ⛔ Sumir com elas apagaria
     * sobreposição legítima — ⛔ em ⛔ exatamente 6 h, duas COR 1 alcançam o
     * mesmo paciente.
     */
    evtMotivoSecundario: {
      marginLeft: ESPACO.sm,
      backgroundColor: tema.cores.surface,
      borderLeftWidth: 2,
      borderLeftColor: tema.cores.border,
    },
    /**
     * ⚠️⚠️⚠️ ⛔ O ESTILO DE **CAUTELA** — ⛔ e ⛔ ele ⛔ NÃO é o crítico.
     *
     * ⛔ ⛔ `warning`, ⛔ e ⛔ não `critical`: ⛔ o vermelho deste módulo é o de
     * `impede`, ⛔ reservado ao que **impede a ação** — hemorragia, INR acima
     * do corte, plaquetas abaixo. ⚠️ *No Benefit* ⛔ não impede ⛔ nada: ⛔ ele
     * diz que o benefício ⛔ não foi demonstrado ⛔ naquela anatomia.
     *
     * ⚠️ ⛔ E ⛔ **⛔ não** é neutro: ⛔ ausência de benefício ⛔ demonstrada
     * ⛔ não é indiferença.
     */
    evtCautela: {
      borderColor: tema.cores.warning,
      backgroundColor: tema.cores.warningTint,
    },
    evtSeloCautela: { color: tema.cores.warning },
    /** ⚠️ Os fatos que fecharam, em linha — ⛔ e ⛔ sem estourar 375 px. */
    evtFatos: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm, marginTop: 2 },
    evtFato: { ...PAPEL.micro, color: tema.cores.text },
    /**
     * ⚠️⚠️ ⛔ A NOTA ⛔ NÃO USA COR DE ALERTA.
     *
     * ⛔ ⛔ Vermelho ⛔ ou âmbar aqui leria como contraindicação — ⛔ e
     * *"limited generalizability"* ⛔ é o oposto: pede **julgamento**.
     */
    evtGeneralizacao: {
      marginTop: ESPACO.xs,
      paddingTop: ESPACO.xs,
      borderTopWidth: 1,
      borderTopColor: tema.cores.border,
      gap: 2,
    },
    evtGeneralizacaoRotulo: { ...PAPEL.micro, color: tema.cores.textSecondary, fontWeight: "700" },
    evtGeneralizacaoTexto: { ...PAPEL.micro, color: tema.cores.textSecondary },
    /** ⚠️ ⛔ Nunca some, ⛔ e ⛔ nunca vira letra miúda ilegível. */
    vereditoRessalva: { ...PAPEL.legenda, color: tema.cores.textSecondary },

    paralelo: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.primary,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    paraleloGrau: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    paraleloTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    raias: { flexDirection: "row", gap: ESPACO.sm },
    raia: {
      flex: 1,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    raiaTitulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    raiaLinha: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.xs },
    raiaNumeroAplicavel: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    raiaNumeroPotencial: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    raiaNumeroDivida: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    raiaRotulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    grupo: { gap: ESPACO.sm },

    semRelogio: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    semRelogioTitulo: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    semRelogioTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },

    cartao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    cartaoAlerta: { borderColor: tema.cores.warning },
    grau: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    grauAlerta: { color: tema.cores.warning },
    populacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    verbo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontStyle: "italic",
    },
    falta1: { color: tema.cores.warning, fontSize: TIPOGRAFIA.caption.fontSize },
    detalhe: { gap: ESPACO.xs, paddingTop: ESPACO.xs },
    sustentam: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    relogio: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      padding: ESPACO.xs,
    },
    relogioEsq: { flex: 1 },
    relogioMarco: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "600",
    },
    relogioFaixa: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    relogioTempo: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    relogioApertado: { color: tema.cores.warning },
    /** ⚠️ Registrar um marco é ação — ⛔ e ação ⛔ não se escreve como legenda. */
    relogioRegistrar: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1.5,
      borderColor: tema.cores.primary,
    },
    relogioSemMarco: { color: tema.cores.primary, fontSize: TIPOGRAFIA.micro.fontSize, fontWeight: "700" },
    relogioSemCampo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    falta: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
    },
    faltaTexto: { flex: 1, gap: ESPACO.xs },
    /** ⚠️ A frase clínica é a grande; a contagem é a pequena. */
    faltaMotivo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    faltaQuantas: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    faltaSeta: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },

    divida: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.debt,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    dividaTopo: { flexDirection: "row", justifyContent: "space-between", gap: ESPACO.xs },
    dividaMarcador: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      flex: 1,
    },
    dividaGrau: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    dividaPopulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    dividaAbrir: { color: tema.cores.debt, fontSize: TIPOGRAFIA.micro.fontSize },
    dividaDetalhe: { gap: ESPACO.xs, paddingTop: ESPACO.xs },
    dividaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    dividaSlot: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    opcoes: { flexDirection: "row", gap: ESPACO.xs },
    opcao: {
      flex: 1,
      alignItems: "center",
      paddingVertical: ESPACO.sm,
      paddingHorizontal: ESPACO.xs,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
    },
    opcaoAtiva: { borderColor: tema.cores.primary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcaoTextoAtivo: { color: tema.cores.primary, fontWeight: "700" },
    agenteNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    dose: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    doseRotulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    doseValor: { ...PAPEL.dose, color: tema.cores.text },
    doseSub: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    /**
     * ⚠️ **Atenção**, ⛔ e ⛔ não crítico: ⛔ a frase pede para **⛔ não parar**,
     * ⛔ e pintá-la de vermelho a leria como impedimento.
     */
    doseNaoAtrasa: { ...PAPEL.textoSecundario, color: tema.cores.warning },
    doseVazia: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    principio: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    principioPressupoe: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },

    foraBotao: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
      padding: ESPACO.sm,
    },
    foraTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, flex: 1 },
    foraItem: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    foraPopulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    foraMotivo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
  });
