/**
 * SELETOR DE HORA E MINUTO — ⛔ NUNCA barra deslizante (§7.5).
 *
 * ⚠️ POR QUE ⛔ NÃO PODE SER SLIDER: a barra é um controle CONTÍNUO e sem
 * âncora — ela responde bem a "quanto", e horário não é quanto, é **qual**. Um
 * gesto de arrastar entre 04:00 e 07:00 atravessa dezenas de minutos que mudam
 * janela terapêutica, e o médico não tem como parar no minuto que ele sabe.
 *
 * ⚠️ ESTE COMPONENTE ⛔ NÃO LÊ O RELÓGIO. Ele recebe `agora` de quem o abriu, e
 * quem o abriu passou pela porta única de Q-01. ⛔ Nenhum `Date.now()` aqui.
 *
 * ⛔ NENHUMA MEDICINA NASCE AQUI: ele não sabe que marco está editando, não sabe
 * o que é janela, e ⛔ não decide nada.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  dataCurta,
  deslocarDias,
  diasAtras,
  instanteEmDiaComHora,
  horaDeExibicao,
  partesDaHora,
} from "../../avc/nucleo/formato";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

const MINUTO = 60_000;

type Props = {
  rotulo: string;
  /**
   * Onde os controles estão posicionados.
   *
   * ⚠️⚠️ POSIÇÃO ⛔ NÃO É VALOR. Enquanto `selecionado` for falso, este número é
   * só o ponto de partida ergonômico dos botões — ⛔ não é uma resposta, ⛔ não
   * aparece como valor, e ⛔ não pode ser confirmado.
   */
  instante: number;
  /**
   * O médico já interagiu com hora/minuto (ou tocou "Agora")?
   *
   * ⚠️⚠️ ESTE BOOLEANO É A REGRA CLÍNICA DESTE COMPONENTE.
   *
   * ── O DEFEITO QUE ELE FECHA (2026-08-28) ───────────────────────────────
   *
   * O seletor abria posicionado em **agora** e o botão Confirmar já valia. Um
   * toque em Confirmar registrava o horário atual — e no **última vez visto
   * bem** isso é a catástrofe que já havíamos corrigido um nível acima: um
   * paciente de 6 horas de evolução vira um paciente de zero minuto, com
   * janela de trombólise inventada por um toque.
   *
   * ⚠️ "Agora" continua existindo como AÇÃO NOMEADA — o que ⛔ não pode existir
   * é "agora" como **default silencioso**.
   */
  selecionado: boolean;
  /** "Agora", lido pelo dono através de `Relogio`. ⚠️ Também é o TETO. */
  agora: number;
  /**
   * ⚠️⚠️ `escolheuValor` DISTINGUE **mexer no dia** de **escolher o horário**.
   *
   * ── POR QUE OS DOIS ⛔ NÃO SÃO A MESMA COISA (2026-08-30) ─────────────────
   *
   * Tocar em "Ontem" muda o **dia** e deixa a **hora** onde o controle estava
   * posicionado — que é `agora`, e ⛔ não uma escolha de ninguém. Se isso
   * habilitasse Confirmar, "última vez bem" viraria *ontem, na hora em que o
   * médico abriu a tela*: o mesmo defeito de "agora como default silencioso"
   * que este componente existe para impedir, entrando por uma porta nova.
   *
   * ⚠️ Dia muda a posição; **hora, minuto e "Agora" escolhem o valor**.
   */
  onMudar: (instante: number, escolheuValor: boolean) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function SeletorDeHora({
  rotulo,
  instante,
  selecionado,
  agora,
  onMudar,
  onConfirmar,
  onCancelar,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const { hora, minuto } = partesDaHora(instante);

  /**
   * ⚠️⚠️ O TETO É `agora`, E ISSO É REGRA CLÍNICA, ⛔ não conveniência de UI.
   *
   * Os quatro marcos desta superfície — chegada, última vez bem, início
   * observado, reconhecimento — já aconteceram, todos. Um marco no futuro
   * produziria decorrido NEGATIVO, e decorrido negativo alimenta janela
   * impossível em toda superfície que contar tempo a partir dele.
   *
   * ⛔ Não há piso: um AVC de ontem à noite é comum, e cortar o passado seria
   * inventar um limite que a fonte não escreve.
   */
  function mover(minutos: number) {
    onMudar(Math.min(agora, instante + minutos * MINUTO), true);
  }

  /**
   * ⚠️ MOVE O DIA, e ⛔ não escolhe o valor. O teto continua sendo `agora`: um
   * marco no futuro ⛔ não existe, e o controle ⛔ não deixa construí-lo.
   */
  function moverDia(dias: number) {
    onMudar(Math.min(agora, deslocarDias(instante, dias)), false);
  }

  /** ⚠️ Leva o DIA para N dias atrás, preservando a hora e o minuto atuais. */
  function irParaDiasAtras(dias: number) {
    onMudar(Math.min(agora, instanteEmDiaComHora(agora, dias, hora, minuto)), false);
  }

  const distancia = diasAtras(instante, agora);
  const ehHoje = distancia === 0;
  const ehOntem = distancia === 1;
  /** ⚠️ Fora de hoje e ontem, o passo de dia fica visível: é como se chega a 3 dias. */
  const [escolhendoData, setEscolhendoData] = useState(false);
  const mostrarPassoDeDia = escolhendoData || distancia >= 2;

  /**
   * ⚠️⚠️ O TETO PRECISA SE ANUNCIAR — relato do autor, 2026-08-29: *"quando
   * chega em 51 min não aumenta quando clico no mais"*. Ele estava certo: eram
   * 04:51, o teto é `agora`, e o `+` continuava com cara de botão vivo
   * engolindo toque após toque.
   *
   * ⚠️ A REGRA ⛔ NÃO MUDOU e ⛔ não pode mudar: os quatro marcos desta superfície
   * já aconteceram, e um marco no futuro produz decorrido NEGATIVO — janela
   * impossível em toda superfície que contar tempo a partir dele. O que muda é
   * que agora ela é VISÍVEL: botão desabilitado e a razão escrita.
   */
  const noTeto = instante >= agora;

  return (
    /**
     * ⚠️ O RÓTULO SAIU DA TELA (2026-08-29): o cartão do campo, logo acima, já
     * diz de que marco se trata. Repetido dentro do seletor, ele produzia a
     * duplicação que o autor apontou — "as informações são semelhantes, meio
     * duplicadas". ⛔ Ele ⛔ não sumiu: virou nome acessível do bloco, para quem
     * navega por leitor de tela e ⛔ não vê o cartão de cima.
     */
    <View style={e.raiz} testID="avc-seletor-hora" accessibilityLabel={tr(rotulo)}>
      {/**
        * ⚠️ MESMA REGRA DA BARRA (§0.2): o controle precisa estar posicionado em
        * algum lugar, e esse lugar ⛔ não pode se ler como valor escolhido. A
        * `NumericStepper` já resolve assim — polegar posicionado, valor lido
        * como "não informado" — e horário ⛔ não pode ser menos rigoroso que
        * peso.
        */}
      <Text
        style={selecionado ? e.valor : e.valorAusente}
        testID="avc-seletor-hora-valor"
      >
        {selecionado ? horaDeExibicao(instante, agora) : tr("não informado")}
      </Text>

      {/**
        * ⚠️⚠️ A LINHA DE DATA — acrescentada em 2026-08-30 (**D-118**).
        *
        * ── O DEFEITO QUE ELA FECHA ────────────────────────────────────────
        *
        * O controle tinha hora ±1, minuto ±1 e "Agora", e ⛔ **nenhuma dimensão
        * de dia**. Uma dose de DOAC de anteontem às 20h exigiria ~40 toques em
        * "hora −", e um paciente **visto bem anteontem à noite** ⛔ simplesmente
        * ⛔ não era representável — no relógio que decide janela terapêutica.
        *
        * ⚠️ E ⛔ nenhum deles PRÉ-SELECIONA valor clínico: mexer no dia ⛔ não
        * habilita Confirmar.
        */}
      <View style={e.linhaFina} testID="avc-seletor-data">
        <Pressable
          style={[e.botaoFino, ehHoje && e.botaoFinoAtivo]}
          accessibilityRole="button"
          aria-checked={ehHoje}
          testID="avc-seletor-data-hoje"
          onPress={() => { setEscolhendoData(false); irParaDiasAtras(0); }}
        >
          <Text style={[e.botaoFinoTexto, ehHoje && e.botaoFinoTextoAtivo]}>{tr("Hoje")}</Text>
        </Pressable>
        <Pressable
          style={[e.botaoFino, ehOntem && e.botaoFinoAtivo]}
          accessibilityRole="button"
          aria-checked={ehOntem}
          testID="avc-seletor-data-ontem"
          onPress={() => { setEscolhendoData(false); irParaDiasAtras(1); }}
        >
          <Text style={[e.botaoFinoTexto, ehOntem && e.botaoFinoTextoAtivo]}>{tr("Ontem")}</Text>
        </Pressable>
        <Pressable
          style={[e.botaoFino, mostrarPassoDeDia && e.botaoFinoAtivo]}
          accessibilityRole="button"
          aria-expanded={mostrarPassoDeDia}
          testID="avc-seletor-data-escolher"
          onPress={() => setEscolhendoData((v) => !v)}
        >
          <Text style={[e.botaoFinoTexto, mostrarPassoDeDia && e.botaoFinoTextoAtivo]}>
            {tr("Escolher data")}
          </Text>
        </Pressable>
      </View>

      {mostrarPassoDeDia ? (
        <Linha
          rotulo={tr("Data")}
          numero={dataCurta(instante)}
          aoMenos={() => moverDia(-1)}
          aoMais={() => moverDia(+1)}
          maisDesabilitado={ehHoje}
          testID="avc-seletor-data-passo"
          e={e}
        />
      ) : null}

      <Linha
        rotulo={tr("Hora")}
        numero={String(hora).padStart(2, "0")}
        aoMenos={() => mover(-60)}
        aoMais={() => mover(+60)}
        maisDesabilitado={noTeto}
        testID="avc-seletor-hora-h"
        e={e}
      />
      {/**
        * ⚠️⚠️ O PASSO DO MINUTO É **UM** MINUTO — relato do autor, 2026-08-29:
        * *"o de min quando clico no mais de minuto não passa um a um, pula
        * vários minutos"*.
        *
        * Ele estava em 5, com o de 1 exilado numa segunda linha. ⛔ Um controle
        * rotulado "Minuto" com −/+ ao lado promete UM minuto: quem toca espera
        * 52 e recebe 56, e num campo que decide janela terapêutica a surpresa
        * ⛔ não é estética. O gesto grosso continua existindo, agora ROTULADO
        * como o que é (±5 min), embaixo.
        */}
      <Linha
        rotulo={tr("Minuto")}
        numero={String(minuto).padStart(2, "0")}
        aoMenos={() => mover(-1)}
        aoMais={() => mover(+1)}
        maisDesabilitado={noTeto}
        testID="avc-seletor-hora-m"
        e={e}
      />

      {/* ⚠️ O salto de 5 min é o atalho, ⛔ não o padrão — e ele diz o tamanho do
          próprio passo no rótulo. ⛔ Não é o mesmo botão com toque longo: gesto
          escondido em controle de tempo é convite a erro silencioso. */}
      <View style={e.linhaFina}>
        <Pressable style={e.botaoFino} accessibilityRole="button" testID="avc-seletor-hora-menos1" onPress={() => mover(-5)}>
          <Text style={e.botaoFinoTexto}>−5 {tr("min")}</Text>
        </Pressable>
        <Pressable
          style={[e.botaoFino, noTeto && e.botaoInerte]}
          accessibilityRole="button"
          disabled={noTeto}
          testID="avc-seletor-hora-mais1"
          onPress={() => mover(+5)}
        >
          <Text style={e.botaoFinoTexto}>+5 {tr("min")}</Text>
        </Pressable>
        <Pressable style={e.botaoFino} accessibilityRole="button" testID="avc-seletor-hora-agora" onPress={() => onMudar(agora, true)}>
          <Text style={e.botaoFinoTexto}>{tr("Agora")}</Text>
        </Pressable>
      </View>

      {/**
        * ⚠️ A RAZÃO APARECE SÓ QUANDO O TETO MORDE. Permanente, ela seria mais um
        * texto explicativo roubando a leitura de relance (§7.3); ausente, o
        * botão desabilitado vira mistério — e mistério em controle de tempo é o
        * que faz o médico tocar dez vezes achando que a tela travou.
        */}
      {noTeto ? (
        <Text style={e.teto} testID="avc-seletor-hora-teto">
          {tr("Este marco já aconteceu — não é possível registrar um horário futuro.")}
        </Text>
      ) : null}

      <View style={e.acoes}>
        <Pressable style={e.cancelar} accessibilityRole="button" testID="avc-seletor-hora-cancelar" onPress={onCancelar}>
          <Text style={e.cancelarTexto}>{tr("Cancelar")}</Text>
        </Pressable>
        {/**
          * ⚠️⚠️ DESABILITADO ATÉ HAVER INTERAÇÃO EXPLÍCITA. ⛔ Não é ergonomia:
          * é a diferença entre um marco informado e um marco carimbado por um
          * toque descuidado num campo que decide janela terapêutica.
          *
          * ⚠️ `disabled` E `aria-disabled`: o primeiro bloqueia o toque, o
          * segundo é o que a tecnologia assistiva — e a trava — conseguem ler.
          * O `Pressable` do react-native-web ⛔ não publica `accessibilityState`,
          * e confiar nele foi erro já medido neste módulo.
          */}
        <Pressable
          style={[e.confirmar, !selecionado && e.confirmarInativo]}
          accessibilityRole="button"
          aria-disabled={!selecionado}
          disabled={!selecionado}
          testID="avc-seletor-hora-confirmar"
          onPress={onConfirmar}
        >
          <Text style={e.confirmarTexto}>{tr("Confirmar")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Linha({
  rotulo,
  numero,
  aoMenos,
  aoMais,
  maisDesabilitado = false,
  testID,
  e,
}: {
  rotulo: string;
  numero: string;
  aoMenos: () => void;
  aoMais: () => void;
  /** ⚠️ No teto (`agora`), o `+` ⛔ não pode continuar com cara de botão vivo. */
  maisDesabilitado?: boolean;
  testID: string;
  e: ReturnType<typeof criarEstilos>;
}) {
  return (
    <View style={e.linha}>
      <Text style={e.linhaRotulo}>{rotulo}</Text>
      <Pressable
        style={e.passo}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo} −`}
        testID={`${testID}-menos`}
        onPress={aoMenos}
      >
        <Text style={e.passoTexto}>−</Text>
      </Pressable>
      <Text style={e.linhaNumero} testID={`${testID}-numero`}>{numero}</Text>
      <Pressable
        style={[e.passo, maisDesabilitado && e.botaoInerte]}
        accessibilityRole="button"
        aria-disabled={maisDesabilitado}
        disabled={maisDesabilitado}
        accessibilityLabel={`${rotulo} +`}
        testID={`${testID}-mais`}
        onPress={aoMais}
      >
        <Text style={e.passoTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.card, padding: ESPACO.sm,
      gap: ESPACO.sm, borderWidth: 1, borderColor: tema.cores.border,
    },
    rotulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    valor: { color: tema.cores.text, fontSize: TIPOGRAFIA.title.fontSize, fontWeight: "700", textAlign: "center" },
    // ⚠️ Em corpo de texto e cor secundária, ⛔ não em display: a ausência do
    // valor é dita em voz baixa, e ⛔ não compete com o número quando ele vier.
    valorAusente: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, textAlign: "center" },
    linha: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
    linhaRotulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, width: 64 },
    linhaNumero: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700",
      minWidth: 40, textAlign: "center",
    },
    passo: {
      width: TOQUE.minimo, height: TOQUE.minimo, alignItems: "center", justifyContent: "center",
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 1, borderColor: tema.cores.border,
    },
    passoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    linhaFina: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    botaoFino: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 1, borderColor: tema.cores.border,
    },
    botaoFinoAtivo: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    botaoFinoTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },
    botaoFinoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    /** ⚠️ Desabilitado se VÊ, ⛔ não some: botão que aparece e some muda o alvo sob o dedo. */
    botaoInerte: { opacity: 0.35 },
    teto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    acoes: { flexDirection: "row", gap: ESPACO.sm },
    cancelar: {
      flex: 1, minHeight: TOQUE.minimo, alignItems: "center", justifyContent: "center",
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
    },
    cancelarTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    confirmar: {
      flex: 1, minHeight: TOQUE.minimo, alignItems: "center", justifyContent: "center",
      backgroundColor: tema.cores.primary, borderRadius: RAIO.botao,
    },
    confirmarInativo: { opacity: 0.35 },
    confirmarTexto: { color: tema.cores.onPrimary, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
  });
