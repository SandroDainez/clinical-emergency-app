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
import { Pressable, StyleSheet, Text, View } from "react-native";

import { horaDeExibicao, partesDaHora } from "../../avc/nucleo/formato";
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
  onMudar: (instante: number) => void;
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
    onMudar(Math.min(agora, instante + minutos * MINUTO));
  }

  return (
    <View style={e.raiz} testID="avc-seletor-hora">
      <Text style={e.rotulo}>{tr(rotulo)}</Text>
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

      <Linha
        rotulo={tr("Hora")}
        numero={String(hora).padStart(2, "0")}
        aoMenos={() => mover(-60)}
        aoMais={() => mover(+60)}
        testID="avc-seletor-hora-h"
        e={e}
      />
      <Linha
        rotulo={tr("Minuto")}
        numero={String(minuto).padStart(2, "0")}
        aoMenos={() => mover(-5)}
        aoMais={() => mover(+5)}
        testID="avc-seletor-hora-m"
        e={e}
      />

      {/* ⚠️ Ajuste de 1 minuto separado do de 5: o de 5 é o gesto normal, e este
          existe porque a diferença de um minuto pode cair dos dois lados de uma
          janela. ⛔ Não é o mesmo botão com toque longo — gesto escondido em
          controle de tempo é convite a erro silencioso. */}
      <View style={e.linhaFina}>
        <Pressable style={e.botaoFino} accessibilityRole="button" testID="avc-seletor-hora-menos1" onPress={() => mover(-1)}>
          <Text style={e.botaoFinoTexto}>−1 {tr("min")}</Text>
        </Pressable>
        <Pressable style={e.botaoFino} accessibilityRole="button" testID="avc-seletor-hora-mais1" onPress={() => mover(+1)}>
          <Text style={e.botaoFinoTexto}>+1 {tr("min")}</Text>
        </Pressable>
        <Pressable style={e.botaoFino} accessibilityRole="button" testID="avc-seletor-hora-agora" onPress={() => onMudar(agora)}>
          <Text style={e.botaoFinoTexto}>{tr("Agora")}</Text>
        </Pressable>
      </View>

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
  testID,
  e,
}: {
  rotulo: string;
  numero: string;
  aoMenos: () => void;
  aoMais: () => void;
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
      <Text style={e.linhaNumero}>{numero}</Text>
      <Pressable
        style={e.passo}
        accessibilityRole="button"
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
    botaoFinoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
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
