/**
 * MÓDULO AVC — esqueleto navegável.
 *
 * ⛔ NÃO usa `ClinicalApp`, `ClinicalEngine`, `core/decision-tree` nem qualquer
 * parte do LEGACY_ACLS_RUNTIME (D-107). O AVC nasce na arquitetura nova.
 *
 * ⚠️ O QUE ESTA TELA É: uma **janela sobre o estado clínico vivo** (§7.2). ⛔ Não
 * é etapa, não é passo, e não há ordem obrigatória entre as superfícies.
 *
 * ⚠️ O QUE ELA NÃO CONTÉM: nenhuma regra clínica. Zero cortes, zero doses, zero
 * elegibilidade. A medicina entra depois, cada afirmação com o seu slot de fonte.
 *
 * ⚠️ E-29: nenhum texto clínico nasce aqui — tudo vem de `avc/conteudo/`.
 */
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SUPERFICIES, pendenciasVigentes, superficie } from "../../avc/conteudo/superficies";
import { pendenciasDerivadas } from "../../avc/nucleo/derivacoes";
import { pendenciasDaImagem } from "../../avc/nucleo/derivacoes-c";
import { pendenciasDaSeguranca } from "../../avc/nucleo/derivacoes-d";
import { proximaInstancia } from "../../avc/nucleo/instancia";
import { COLETA } from "../../avc/conteudo/laboratorio";
import { ESTUDO } from "../../avc/conteudo/superficie-c";
import SuperficieD from "./superficie-d";
import SuperficieE from "./superficie-e";
import SuperficieF from "./superficie-f";
import SuperficieG from "./superficie-g";
import { ACAO_DE_TROMBOLISE, TROMBOLISE_IV } from "../../avc/conteudo/superficie-f";
import { nihssCalculado, nihssInformado } from "../../avc/nucleo/derivacoes-b";
import { destinoDaImagem } from "../../avc/nucleo/derivacoes-c";
import { bloqueiosCorrigiveis } from "../../avc/nucleo/derivacoes-d";
import { Icone, Recolhido, type NomeDeIcone } from "./ui";

/**
 * ⚠️ A ALTURA DA BARRA É UMA CONSTANTE PORQUE **DUAS COISAS** dependem dela:
 * a própria barra ⛔ e o `paddingBottom` do conteúdo. ⛔ Escrita duas vezes,
 * elas divergem ⛔ e a barra passa a cobrir o último campo.
 */
const ALTURA_DA_BARRA = 62;

/**
 * ⚠️⚠️ NOME CURTO ⛔ NÃO É ABREVIAÇÃO — é o nome que cabe numa linha.
 *
 * ⛔ *"Segurança para trombólise"* truncava como *"Segurança para …"*, ⛔ e nome
 * truncado ⛔ não identifica a superfície que ele existe para nomear. ⚠️ O nome
 * completo continua no cabeçalho da superfície aberta: ⛔ nada se perde.
 */
const CURTO: Readonly<Record<string, { nome: string; icone: NomeDeIcone }>> = {
  estabilizacao: { nome: "Estabilizar", icone: "estabilizar" },
  neurologico: { nome: "Neuro", icone: "neuro" },
  imagem: { nome: "Imagem", icone: "imagem" },
  seguranca: { nome: "Segurança", icone: "seguranca" },
  /**
   * ⚠️⚠️ CORREÇÕES ⛔ NÃO ESTAVA NA LISTA DE SEIS DO AUTOR — ⛔ e ⛔ não foi
   * removida por isso. ⛔ Tirá-la da navegação a tornaria **inalcançável**, que
   * é a classe de defeito que a varredura existe para impedir. ⚠️ Fica na
   * jornada clínica, ⛔ e a divergência está reportada.
   */
  correcoes: { nome: "Correções", icone: "crise" },
  reperfusao: { nome: "Reperfusão", icone: "reperfusao" },
  destino: { nome: "Destino", icone: "destino" },
  paciente: { nome: "Paciente", icone: "paciente" },
  laboratorio: { nome: "Laboratório", icone: "laboratorio" },
};
import { ACAO } from "../../avc/conteudo/superficie-e";
import { pendenciasOriginadasEmE } from "../../avc/nucleo/derivacoes-e";
import { pendenciasDoLaboratorio } from "../../avc/nucleo/derivacoes-lab";
import { corrigirNaInstancia, registrarComInstancia } from "../../avc/conteudo/campos";
import { CAMPO_DE_ITEM } from "../../avc/conteudo/nihss";
import { slot } from "../../avc/conteudo/fontes";
import { TODOS_OS_CAMPOS_A } from "../../avc/conteudo/superficie-a";
import { TODOS_OS_CAMPOS_B } from "../../avc/conteudo/superficie-b";
import { TODOS_OS_CAMPOS_C } from "../../avc/conteudo/superficie-c";
import { TODOS_OS_CAMPOS_P } from "../../avc/conteudo/paciente";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import {
  abrirAtendimento,
  decorridoEmMinutos,
  definirRelogioClinico,
  desfazerRegistro,
  pendenciasAbertas,
  registrarFato,
  valorAtual,
  verSuperficie,
} from "../../avc/nucleo/estado";
import type { RelogioClinicoId } from "../../avc/nucleo/tipos";
import SuperficieA from "./superficie-a";
import SuperficieB from "./superficie-b";
import SuperficieC from "./superficie-c";
import SuperficiePaciente from "./superficie-paciente";
import SuperficieLaboratorio from "./superficie-laboratorio";
import { relogioDoSistema } from "../../avc/nucleo/relogio";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import { getPalette } from "../../design-system/paleta-de-area";
import { useEstilosDoTema, useTheme, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

/**
 * ⚠️ A cor da área vem da paleta do design system — a mesma que pinta o card do
 * hub. ⛔ Nenhum hexadecimal é escrito nesta tela: se a cor não existe na paleta,
 * ela é decisão de tema e entra em `design-system/`, onde a trava de contraste
 * a enxerga.
 */
const AREA_AVC = getPalette("AVC");

export default function AvcModuloScreen({ onVoltar }: { onVoltar: () => void }) {
  const tr = useTr();
  const s = useEstilosDoTema(criarEstilos);
  /** ⚠️ Cor do ícone vem do TEMA — ⛔ nenhum hex no componente. */
  const tema = useTheme();
  /** ⚠️ O home indicator do iPhone come a barra se ⛔ ninguém o medir. */
  const insets = useSafeAreaInsets();
  // ⚠️ O relógio entra por UMA porta (Q-01). ⛔ Nenhum `Date.now()` nesta árvore.
  const relogio = relogioDoSistema;
  const [estado, setEstado] = useState(() => abrirAtendimento(relogio));
  const [fontesAbertas, setFontesAbertas] = useState(false);

  const atual = superficie(estado.superficieVista);

  /**
   * ⚠️ "AGORA" É LIDO UMA VEZ POR RENDER, e desce como valor.
   *
   * ⛔ Nenhum componente filho chama o relógio: se cada um chamasse o seu, o
   * seletor de hora e a linha que o exibe poderiam discordar em um minuto — e
   * um minuto é a diferença entre estar dentro e fora de uma janela.
   */
  const agora = relogio.agora();

  // ⚠️ DERIVADO A CADA RENDER, nunca guardado (§4.3). O tempo desde a abertura
  // muda sem que nenhum dado mude — é o caso que a Parte 4 nomeia.
  const abertoHaMin = decorridoEmMinutos(estado, "t0_operacional", relogio);
  const lkwMin = decorridoEmMinutos(estado, "ultima_vez_bem", relogio);

  /**
   * ⚠️⚠️ O COCKPIT TEM DOIS MODOS — decisão do autor, 2026-09-01.
   *
   * ⛔ Completo, ele consumia quase um viewport antes do conteúdo clínico em
   * **toda** superfície. ⚠️ Compacto por padrão; o completo abre ao toque.
   * ⛔ ⛔ Nada some: é a mesma informação, noutra densidade.
   */
  const [cockpitAberto, setCockpitAberto] = useState(false);
  const [escopoAberto, setEscopoAberto] = useState(false);
  const [resumoAberto, setResumoAberto] = useState(false);

  /**
   * ⚠️⚠️ O SIGNIFICADO PRÉ-IVT VEM DE **D**, ⛔ e ⛔ NUNCA de um `if` local.
   *
   * ⛔ `PAS > 185` escrito aqui seria a tela inventando limiar clínico. ⚠️ Quem
   * sabe que 185/110 é limite antes da trombólise é `bloqueiosCorrigiveis` —
   * com fonte, verbatim ⛔ e o que resolve.
   */
  const bloqueios = useMemo(() => bloqueiosCorrigiveis(estado), [estado]);

  /**
   * ⚠️⚠️ O COCKPIT **LÊ**, ⛔ e ⛔ NÃO DERIVA. Cada número vem de quem já sabe
   * calculá-lo — ⛔ nenhuma regra clínica nasce aqui.
   *
   * ⚠️ `campo` é para onde o toque leva: ausente **tocável** é o que transforma
   * o cockpit de painel em atalho.
   */
  const VITAIS = useMemo(() => {
    const pas = valorAtual(estado, "pas")?.valor;
    const pad = valorAtual(estado, "pad")?.valor;
    const glic = valorAtual(estado, "glicemia")?.valor;
    const nihss = nihssCalculado(estado) ?? nihssInformado(estado);
    const img = destinoDaImagem(estado);
    return [
      {
        id: "pa",
        rotulo: "PA",
        unidade: "mmHg",
        campo: "pas",
        valor:
          typeof pas === "number" && typeof pad === "number" ? `${pas}/${pad}` : undefined,
      },
      {
        id: "glicemia",
        rotulo: "Glicemia",
        unidade: "mg/dL",
        campo: "glicemia",
        valor: typeof glic === "number" ? String(glic) : undefined,
      },
      {
        id: "nihss",
        rotulo: "NIHSS",
        unidade: "0–42",
        campo: "nihss_informado",
        valor: typeof nihss === "number" ? String(nihss) : undefined,
      },
      {
        /** ⚠️ Estado da imagem — ⛔ e ⛔ não um veredito sobre reperfusão. */
        id: "imagem",
        rotulo: "Imagem",
        unidade: "exame",
        campo: "estudo_modalidade",
        valor: img === undefined ? undefined : tr("saída"),
      },
    ];
  }, [estado, tr]);

  // ⚠️ Pendências derivadas: dono numa superfície, ALCANCE GLOBAL (E-07).
  // Elas aparecem aqui independentemente de qual superfície está aberta.
  const pendencias = useMemo(
    () => [
      /**
       * ⚠️⚠️ AS DERIVADAS VÊM PRIMEIRO, e ⛔ não é ordem alfabética: elas nascem
       * de algo que ACONTECEU com o paciente — uma glicemia corrigida sem exame
       * depois —, enquanto as outras nascem de algo que ⛔ nunca foi informado.
       * O que aconteceu pesa mais na varredura de quem está com pressa.
       *
       * ⚠️ E elas ⛔ NÃO passam por `pendenciasAbertas()`: aquilo mede campo
       * vazio, e aqui o campo pode estar cheio — com o exame de ANTES da
       * correção. Quem fecha esta é a ORDEM dos fatos, e ela já vem fechada
       * (ausente da lista) quando o registro posterior existe.
       */
      ...pendenciasDerivadas(estado),
      /**
       * ⚠️ As pendências da imagem são **derivadas** e ⛔ não passam por
       * `pendenciasAbertas()`: aquela mede campo vazio, e aqui o campo pode
       * estar cheio — com *"realizada, resultado ainda ⛔ não disponível"*, que é
       * resposta válida (**PD-22**) e ⛔ **não** fecha a tarefa.
       */
      ...pendenciasDaImagem(estado),
      /** ⚠️ D ⛔ não possui fatos, e possui as próprias pendências (E-07). */
      ...pendenciasDaSeguranca(estado),
      /** ⚠️ E ORIGINA, mas a dona é B — ver `pendenciasOriginadasEmE`. */
      ...pendenciasOriginadasEmE(estado),
      ...pendenciasDoLaboratorio(estado),
      // ⚠️ `pendenciasVigentes()` filtra as que ⛔ não têm porta: pendência cujo
      // campo ainda não existe é muro, ⛔ não tarefa (E-26, I-7).
      ...pendenciasAbertas(estado, pendenciasVigentes()),
    ],
    [estado]
  );

  // ⚠️ Quantos campos da Superfície A já foram informados — ⛔ NÃO é barra de
  // progresso nem meta: nenhum deles é obrigatório (E-49). Serve só para o
  // médico ver o que falta, sem que a falta trave coisa alguma.
  const informadosEmA = useMemo(
    () => TODOS_OS_CAMPOS_A.filter((c) => valorAtual(estado, c.id) !== undefined).length,
    [estado]
  );

  function abrir(id: SuperficieId) {
    // ⚠️ E-20: mudar de superfície ⛔ NÃO produz ação clínica nem registra nada.
    setEstado((e) => verSuperficie(e, id));
  }

  // ── Entrada de fatos da Superfície A ──────────────────────────────────────
  //
  // ⚠️ Tudo passa por `registrarFato`, que ACRESCENTA à trilha. ⛔ Nada aqui
  // sobrescreve: uma nova medida convive com a anterior (§3.1).

  /**
   * ⚠️⚠️ LEVAR ATÉ ONDE O DADO SE RESPONDE — ⛔ e ⛔ não abrir um campo qualquer.
   *
   * ⚠️ A Superfície F aponta faltas que se respondem em **outras** superfícies.
   * O dono é procurado nas listas de campos das próprias superfícies; ⛔ ⛔ não há
   * segunda tabela para envelhecer em silêncio (D-15).
   *
   * ⛔ Campo sem dono ⛔ não navega ⛔ e ⛔ não falha calado — fica onde está, e a
   * trava `prova-avc-apresentacao-f` garante que todo insumo tem dono.
   */
  function irParaCampo(campo: string) {
    const donos: readonly [SuperficieId, readonly { id: string }[]][] = [
      ["estabilizacao", TODOS_OS_CAMPOS_A],
      ["neurologico", TODOS_OS_CAMPOS_B],
      ["imagem", TODOS_OS_CAMPOS_C],
      ["paciente", TODOS_OS_CAMPOS_P],
      /**
       * ⚠️ A ação de trombólise mora em **Reperfusão**. ⛔ Sem ela aqui, tocar a
       * pendência do horário de início em Destino ⛔ não levaria a lugar ⛔ nenhum
       * — gesto que ⛔ não faz nada, ⛔ e ⛔ sem erro visível.
       */
      ["reperfusao", ACAO_DE_TROMBOLISE],
    ];
    const achado = donos.find(([, campos]) => campos.some((c) => c.id === campo));
    if (achado) setEstado((e) => verSuperficie(e, achado[0]));
  }

  function escolher(campo: string, valor: string) {
    setEstado((e) => registrarFato(e, { campo, valor }, relogio));
  }

  /**
   * Uma MEDIDA de grandeza — o valor final do gesto, ⛔ não o caminho dele.
   *
   * ⚠️ A tela manda o número inteiro, ⛔ não um delta. A versão anterior somava
   * `delta` ao valor atual e tratava campo vazio como `0`, o que fazia um toque
   * em "+" registrar `1` — um número que ninguém mediu, que ⛔ não é ausência e
   * ⛔ não é medida. Quem decide quando o campo deixa de ser "não informado" é o
   * fim do gesto na barra (§0.2), e isso mora na tela.
   */
  /**
   * ⚠️⚠️ PASSA POR `registrarComInstancia` (D-120): campos que declaram
   * `instanciaDe` são **metades de uma mesma medida**, e informar a diastólica
   * **completa** a aferição já aberta em vez de criar outra.
   *
   * ⚠️ A regra mora no conteúdo, e ⛔ não aqui — escrita na tela, as travas
   * construíam PAs sem instância e a derivação as lia como "⛔ não informada".
   */
  function medir(campo: string, valor: number) {
    setEstado((e) => registrarComInstancia(e, { campo, valor }, relogio));
  }

  /**
   * ⚠️⚠️ REGISTRO **NUMA INSTÂNCIA ESPECÍFICA** — e ⛔ não na "aberta".
   *
   * O Laboratório desenha N coletas ao mesmo tempo, e a Imagem N exames: um
   * toque no INR da terceira coleta ⛔ não pode cair noutra, ⛔ nem o ASPECTS do
   * segundo exame no primeiro. É a tela que sabe em qual o médico tocou.
   *
   * ⚠️ **Servem as duas superfícies** — a regra mora num lugar só (I6).
   */
  function escolherNaInstancia(coleta: string, campo: string, valor: string) {
    setEstado((e) => registrarComInstancia(e, { campo, valor }, relogio, coleta));
  }
  function medirNaInstancia(coleta: string, campo: string, valor: number) {
    setEstado((e) => registrarComInstancia(e, { campo, valor }, relogio, coleta));
  }
  function horaNaInstancia(coleta: string, campo: string, instante: number) {
    setEstado((e) =>
      registrarComInstancia(e, { campo, valor: instante, horaClinica: instante }, relogio, coleta)
    );
  }
  /**
   * ⚠️ Desfazer também aponta para a instância: ⛔ não se desfaz o de outra coleta.
   *
   * ⚠️⚠️ E vai por `corrigirNaInstancia`, ⛔ não por registro cru com
   * `tipo: "correcao"` na mão: só assim ele **aponta qual declaração** está
   * desfazendo, e passa pelas travas de integridade de `corrigeFatoId`.
   *
   * ⛔ O `motivo` fabricado saiu junto — *"Registro desfeito pelo médico"* é o
   * **tipo** da operação, e ⛔ não um motivo. ⛔ Ninguém perguntou por quê.
   */
  function desfazerNaInstancia(coleta: string, campo: string) {
    setEstado((e) => corrigirNaInstancia(e, { campo, valor: "nao_perguntado" }, relogio, coleta));
  }

  /**
   * ⚠️⚠️ CORRIGIR UM RESULTADO — o gesto explícito, e a razão de ele existir.
   *
   * > *"redigitar um analito já informado na mesma coleta ⛔ não pode ter
   * > semântica implícita."* — autor, 2026-08-30
   *
   * ⚠️ Ele ⛔ **não** abre coleta: a coleta é a mesma amostra. Quem mede de novo
   * usa **Nova coleta**, que é a outra metade do par que a tela oferece.
   */
  function corrigirNaInstanciaDaTela(coleta: string, campo: string, valor: string | number) {
    setEstado((e) => corrigirNaInstancia(e, { campo, valor }, relogio, coleta));
  }

  /**
   * ⚠️ NOVA AFERIÇÃO — ⛔ **não** é correção. Os dois valores valem, cada um no
   * seu instante, e a trilha guarda os dois (§3.4).
   */
  function novaMedida(tipo: string) {
    setEstado((e) => registrarFato(e, {
      campo: `${tipo}_nova_medida`,
      valor: proximaInstancia(e, tipo),
      instancia: proximaInstancia(e, tipo),
      motivo: "Nova aferição aberta pelo médico",
    }, relogio));
  }

  /**
   * A ESCALA INTEIRA, NUM GESTO — ⚠️ um fato por item, mais o total.
   *
   * ⚠️⚠️ O TOTAL É GRAVADO, e ⛔ não recalculado a cada leitura, por um motivo de
   * trilha: ele É o valor que o médico confirmou naquele instante. Se um item
   * for refeito depois, a escala é reconfirmada e o novo total entra como novo
   * fato — os dois convivem, e a evolução fica legível (§3.1).
   */
  function registrarEscala(pontos: Record<string, number>, total: number) {
    setEstado((e) => {
      let proximo = e;
      for (const [item, ponto] of Object.entries(pontos)) {
        proximo = registrarFato(proximo, { campo: CAMPO_DE_ITEM(item), valor: ponto }, relogio);
      }
      return registrarFato(proximo, { campo: "nihss_calculado", valor: total }, relogio);
    });
  }

  /**
   * DESFAZER um registro — ⚠️ a operação que faltava (§7.16).
   *
   * ⚠️⚠️ ⛔ NÃO APAGA. Acrescenta uma **correção** à trilha, com motivo, e o valor
   * atual do campo volta a ser "ninguém respondeu". O registro anterior fica lá,
   * marcado — porque ele existiu, e esconder que existiu é o que §3.1 proíbe.
   */
  function desfazer(campo: string) {
    /**
     * ⚠️ Passa por `corrigirNaInstancia` para que campos com `instanciaDe`
     * desfaçam DENTRO da aferição aberta — a mesma regra, num lugar só (I6).
     */
    setEstado((e) => corrigirNaInstancia(e, { campo, valor: "nao_perguntado" }, relogio));
  }

  /**
   * Registro de horário — ⚠️ o instante vem do SELETOR, ⛔ não do relógio.
   *
   * ⚠️⚠️ ESTA É A CORREÇÃO CLÍNICA MAIS IMPORTANTE DESTA ROTINA. Antes ela
   * gravava `relogio.agora()`: tocar em "registrar horário" na última vez visto
   * bem carimbava **agora**, e um paciente de 6 horas de evolução virava um
   * paciente de zero minuto — janela de trombólise inventada por um toque.
   * Agora o médico informa o marco, e a rotina só o grava.
   *
   * ⚠️ O controle NOMEIA o relógio que alimenta (E-36), e cada marco vai para o
   * seu próprio campo — ⛔ nunca para um genérico.
   */
  function registrarHora(campo: string, instante: number, qualRelogio?: string) {
    setEstado((e) => {
      const comFato = registrarFato(e, { campo, valor: instante, horaClinica: instante }, relogio);
      return qualRelogio
        ? definirRelogioClinico(comFato, qualRelogio as RelogioClinicoId, instante)
        : comFato;
    });
  }

  return (
    <View style={s.moldura}>
    <ScrollView
      style={s.root}
      /**
       * ⚠️⚠️ O PADDING INFERIOR É A BARRA + A SAFE AREA.
       *
       * ⛔ Sem ele o último campo, o último alerta ⛔ e a última ação ficam
       * **debaixo da barra** — ⛔ e conteúdo clínico coberto ⛔ não é detalhe de
       * layout. ⚠️ Medido, ⛔ e ⛔ não chutado: altura da barra + `insets.bottom`.
       */
      contentContainerStyle={[s.conteudo, { paddingBottom: ALTURA_DA_BARRA + insets.bottom + ESPACO.lg }]}
    >
      {/**
        * ⚠️ I7: a tela desenha o PRÓPRIO cabeçalho, com saída. A rota ⛔ não põe.
        *
        * ⚠️⚠️ UMA LINHA. ⛔ O subtítulo de escopo — *"adulto com suspeita de AVC
        * isquêmico agudo"* — descreve **o módulo**, ⛔ e ⛔ não o paciente: ⛔ ele
        * ⛔ não muda durante o atendimento ⛔ e custava 120 px em toda superfície.
        */}
      <View style={s.cabecalho}>
        <Pressable onPress={onVoltar} accessibilityRole="button" accessibilityLabel={tr("Voltar")}>
          <Text style={s.voltar}>‹</Text>
        </Pressable>
        <Text style={s.titulo} numberOfLines={1}>{tr("AVC isquêmico agudo")}</Text>
        <Recolhido
          id="escopo-do-modulo"
          texto="Adulto com suspeita de AVC isquêmico agudo"
          aberto={escopoAberto}
          onAlternar={() => setEscopoAberto((v) => !v)}
        />
      </View>

      {/**
        * ── ⚠️⚠️ COCKPIT (§7.8) ────────────────────────────────────────────
        *
        * ⚠️ O argumento mais forte para ele existir continua sendo o RELÓGIO: é
        * o único valor que muda sozinho, ⛔ e se só existisse dentro de uma
        * superfície o médico trabalharia em outra sem vê-lo correr.
        *
        * ⚠️⚠️ ⛔ MAS O TEMPO DE ATENDIMENTO ⛔ NÃO ENCABEÇA A TELA. Decisão do
        * autor: contador grande correndo vira ruído ansiogênico numa sala já
        * tensa. ⛔ Quem manda visualmente é o **relógio clínico** — a última vez
        * visto bem —, ⛔ e o tempo desde a abertura fica discreto ao lado.
        *
        * ⚠️⚠️ E AUSÊNCIA É **NEUTRA**, ⛔ nunca âmbar: campo vazio ⛔ não é achado.
        * ⛔ Tocar num ausente leva a onde ele se registra.
        */}
      <View style={s.cockpit} testID="avc-resumo">
        {/**
          * ⚠️⚠️ A FAIXA COMPACTA — quatro dados numa linha, sempre.
          *
          * ⛔ É ela que fica em toda superfície. ⚠️ Tocar abre o cockpit
          * completo; ⛔ e ⛔ nada some no compacto — só muda a densidade.
          */}
        <Pressable
          style={s.faixa}
          accessibilityRole="button"
          accessibilityState={{ expanded: cockpitAberto }}
          testID="avc-cockpit-faixa"
          onPress={() => setCockpitAberto((v) => !v)}
        >
          {[
            { k: "LKW", v: lkwMin === undefined ? undefined
                : `${Math.floor(lkwMin / 60)}h${String(lkwMin % 60).padStart(2, "0")}` },
            ...VITAIS.slice(0, 3).map((x) => ({ k: tr(x.rotulo), v: x.valor })),
          ].map((x, n) => (
            <View key={x.k} style={s.faixaItem}>
              {n > 0 ? <Text style={s.faixaSep}>·</Text> : null}
              <Text style={s.faixaChave}>{x.k}</Text>
              <Text style={[s.faixaValor, x.v === undefined && s.faixaAusente]}>{x.v ?? "—"}</Text>
            </View>
          ))}
          <Icone nome={cockpitAberto ? "informacao" : "adiante"} tamanho={13} />
        </Pressable>

        {/**
          * ⚠️⚠️ O BLOQUEIO CORRIGÍVEL VEM DE **D**, com a frase DELA.
          *
          * ⛔ A Superfície A registra a medida ⛔ e ⛔ não a interpreta: o
          * significado pré-IVT é de D. ⚠️ Aqui o cockpit **cita** D — ⛔ e ⛔ não
          * repete o limiar por conta própria.
          */}
        {bloqueios.map((b) => (
          <Pressable
            key={b.id}
            style={s.bloqueio}
            accessibilityRole="button"
            testID={`avc-cockpit-bloqueio-${b.id}`}
            onPress={() => abrir("correcoes")}
          >
            <Icone nome="seguranca" tamanho={15} cor={tema.cores.warning} />
            <Text style={s.bloqueioTexto} numberOfLines={2}>{tr(b.formulacao)}</Text>
            <Text style={s.bloqueioAcao}>
              {b.id === "pressao_acima_da_meta" ? tr("Corrigir PA") : tr("Corrigir glicemia")}
            </Text>
          </Pressable>
        ))}

        {/**
          * ⚠️⚠️ AUXILIARES A **UM** TOQUE — ⛔ e ⛔ não dentro de um "Mais".
          *
          * ⛔ Peso, alergia, anticoagulante ⛔ e exames são acesso frequente
          * demais para virarem navegação de segundo nível (autor, 2026-09-01).
          * ⚠️ Correções entra aqui como acesso discreto; quando há bloqueio
          * corrigível, ela também aparece **contextual**, acima.
          */}
        <View style={s.auxiliares}>
          {SUPERFICIES.filter((sup) => sup.painel || sup.id === "correcoes").map((sup) => {
            const c = CURTO[sup.id];
            const ativa = sup.id === estado.superficieVista;
            return (
              <Pressable
                key={sup.id}
                onPress={() => abrir(sup.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                accessibilityLabel={tr(sup.titulo)}
                testID={`avc-aba-${sup.id}`}
                style={[s.auxItem, ativa && s.auxItemAtivo]}
              >
                <Icone
                  nome={c?.icone ?? "adiante"}
                  tamanho={13}
                  cor={ativa ? tema.cores.primary : tema.cores.textSecondary}
                />
                <Text
                  style={[s.auxNome, ativa && s.barraNomeAtivo]}
                  numberOfLines={1}
                  testID={`avc-rotulo-aba-${sup.id}`}
                >
                  {tr(c?.nome ?? sup.titulo)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {cockpitAberto ? (
          <View style={s.cockpitCompleto} testID="avc-cockpit-completo">
            <View style={s.cockpitTopo}>
              <Pressable
                style={s.relogioClinico}
                accessibilityRole="button"
                testID="avc-cockpit-lkw"
                onPress={() => irParaCampo("hora_ultima_vez_bem")}
              >
                <Text style={s.cockpitRotulo}>{tr("Última vez bem")}</Text>
                {lkwMin === undefined ? (
                  <Text style={s.cockpitAusente}>{tr("não informado")}</Text>
                ) : (
                  <Text style={s.cockpitRelogio}>
                    {Math.floor(lkwMin / 60)}h{String(lkwMin % 60).padStart(2, "0")}
                  </Text>
                )}
              </Pressable>
              <Text style={s.cockpitAtendimento} testID="avc-cockpit-atendimento">
                {tr("Atendimento há")} {abertoHaMin ?? 0} {tr("min")}
              </Text>
            </View>
            <View style={s.vitais}>
              {VITAIS.map((v) => (
                <Pressable
                  key={v.id}
                  style={s.vital}
                  accessibilityRole="button"
                  accessibilityLabel={tr(v.rotulo)}
                  testID={`avc-cockpit-${v.id}`}
                  onPress={() => irParaCampo(v.campo)}
                >
                  <Text style={s.vitalChave}>{tr(v.rotulo)}</Text>
                  <Text style={[s.vitalValor, v.valor === undefined && s.vitalAusente]}>
                    {v.valor ?? "—"}
                  </Text>
                  <Text style={s.vitalUnidade}>{tr(v.unidade)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* ── SUPERFÍCIE ABERTA ──────────────────────────────────────────────
          ⚠️ Esqueleto declarado: a tela DIZ que não há conteúdo, em vez de
          parecer completa e vazia. Vacuidade silenciosa é o que a casa proíbe. */}
      <View style={s.superficie} testID={`avc-superficie-${atual.id}`}>
        {/**
          * ⚠️⚠️ TÍTULO GRANDE + RESUMO SAÍRAM — 70 px por superfície.
          *
          * ⛔ O nome da superfície já está na faixa do cockpit ⛔ e aceso na
          * barra inferior: dizê-lo uma terceira vez, em corpo grande, era
          * repetição. ⚠️ O resumo descreve **o que vem logo abaixo**, ⛔ e o
          * médico está vendo — ⛔ ele vai para o ⓘ, ⛔ e ⛔ não some.
          */}
        <View style={s.superficieLinha}>
          {/**
            * ⚠️ O nome CURTO, o mesmo da barra inferior. ⛔ "Entrada e
            * estabilização" aqui ⛔ e "Estabilizar" ali eram dois nomes para a
            * mesma coisa, a 60 px de distância.
            */}
          <Text style={s.superficieNome} numberOfLines={1}>
            {tr(CURTO[atual.id]?.nome ?? atual.titulo)}
          </Text>
          <Recolhido
            id={`resumo-${atual.id}`}
            texto={atual.resumo}
            aberto={resumoAberto}
            onAlternar={() => setResumoAberto((v) => !v)}
          />
        </View>

        {atual.id === "paciente" ? (
          <SuperficiePaciente
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onMedir={medir}
            onHora={registrarHora}
            onDesfazer={desfazer}
          />
        ) : atual.id === "estabilizacao" ? (
          <SuperficieA
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onMedir={medir}
            onHora={registrarHora}
            onDesfazer={desfazer}
            onNovaMedida={novaMedida}
          />
        ) : atual.id === "neurologico" ? (
          /**
           * ⚠️ A Superfície B recebe `agora` **só** porque o NIHSS trazido de
           * fora tem horário próprio. ⛔ Nenhum campo dela declara relógio
           * clínico, e por isso ⛔ nenhum define marco de janela (E-21).
           */
          <SuperficieB
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onHora={registrarHora}
            onMedir={medir}
            onDesfazer={desfazer}
            onEscala={registrarEscala}
          />
        ) : atual.id === "laboratorio" ? (
          <SuperficieLaboratorio
            estado={estado}
            agora={agora}
            onEscolherNaColeta={escolherNaInstancia}
            onCorrigirNaColeta={corrigirNaInstanciaDaTela}
            onMedirNaColeta={medirNaInstancia}
            onHoraNaColeta={horaNaInstancia}
            onDesfazerNaColeta={desfazerNaInstancia}
            onNovaColeta={() => novaMedida(COLETA)}
          />
        ) : atual.id === "imagem" ? (
          <SuperficieC
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onHora={registrarHora}
            onMedir={medir}
            onDesfazer={desfazer}
            onEscolherNoEstudo={escolherNaInstancia}
            onMedirNoEstudo={medirNaInstancia}
            onHoraNoEstudo={horaNaInstancia}
            onCorrigirNoEstudo={corrigirNaInstanciaDaTela}
            onDesfazerNoEstudo={desfazerNaInstancia}
            onNovoEstudo={() => novaMedida(ESTUDO)}
          />
        ) : atual.id === "seguranca" ? (
          <SuperficieD
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onHora={registrarHora}
            onMedir={medir}
            onDesfazer={desfazer}
          />
        ) : atual.id === "reperfusao" ? (
          <SuperficieF
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onIrParaCampo={irParaCampo}
            onNovaTrombolise={() => novaMedida(TROMBOLISE_IV)}
            onEscolherNaInstancia={escolherNaInstancia}
            onHoraNaInstancia={medirNaInstancia}
            onDesfazerNaInstancia={desfazerNaInstancia}
          />
        ) : atual.id === "destino" ? (
          <SuperficieG
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onIrParaCampo={irParaCampo}
          />
        ) : atual.id === "correcoes" ? (
          <SuperficieE
            estado={estado}
            agora={agora}
            onEscolherNaAcao={escolherNaInstancia}
            onDesfazerNaAcao={desfazerNaInstancia}
            onNovaAcao={(tipo) => {
              /**
               * ⚠️⚠️ ABRE A INSTÂNCIA **E** JÁ GRAVA O TIPO — ⛔ senão a ação nasceria
               * sem saber o que é, e a leitura ⛔ não a ligaria a bloqueio nenhum.
               */
              const inst = proximaInstancia(estado, ACAO);
              setEstado((e) => registrarComInstancia(e, { campo: "acao_tipo", valor: tipo }, relogio, inst));
            }}
          />
        ) : (
          <>
            <Text style={s.emConstrucao}>{tr("Superfície em construção")}</Text>
            <Text style={s.emConstrucaoNota}>
              {tr("O conteúdo clínico desta superfície ainda não foi implementado.")}
            </Text>
          </>
        )}

        {/* ⚠️ E-30: a fonte é propriedade da afirmação. Ainda não há afirmação,
            mas o endereço já está ligado — a tela nunca será dona da medicina. */}
        {/* ⚠️ E-30: a fonte é propriedade da afirmação, e ⛔ isso não mudou.
            Mudou o LUGAR: a lista de slots é rastreabilidade, e rastreabilidade
            ⛔ não disputa espaço com conduta — fica a um toque, fechada. */}
        <Pressable
          style={s.fontesBotao}
          accessibilityRole="button"
          testID="avc-fontes-abrir"
          onPress={() => setFontesAbertas((v) => !v)}
        >
          <Text style={s.fontesTitulo}>
            ⓘ {tr("Fontes que governam esta superfície")}
          </Text>
        </Pressable>
        {fontesAbertas ? (
          <View style={s.fontes} testID="avc-fontes-lista">
            {atual.fontes.map((id) => {
              const f = slot(id);
              return (
                <Text key={id} style={s.fonte}>
                  {id}{f ? ` · ${f.assunto}` : ""}
                </Text>
              );
            })}
          </View>
        ) : null}
      </View>

      {/* ── PENDÊNCIAS ACIONÁVEIS (§7.9) ───────────────────────────────────
          ⚠️ DESCERAM PARA O FIM DA TELA nos testes visuais de 2026-08-28. Elas
          estavam ANTES das superfícies, e o médico batia o olho numa lista de
          tarefas antes de ver o relógio e a via aérea. Prioridade visual é
          prioridade clínica (§7.3): pendência ⛔ não trava nada (E-49), então
          ⛔ não pode ocupar o lugar do que trata.

          ⚠️ O ALCANCE CONTINUA GLOBAL (E-07): elas aparecem qualquer que seja a
          superfície aberta, e o toque leva à dona. Mudou a posição, ⛔ não a
          regra. */}
      <View style={s.bloco} testID="avc-pendencias">
        <Text style={s.blocoTitulo}>{tr("Pendências do atendimento")}</Text>
        {/**
          * ⚠️⚠️ A LINHA EXISTE PORQUE O BLOCO ERA LIDO COMO PARTE DA SUPERFÍCIE
          * ABERTA — relato do autor, 2026-08-29: *"aqui nessa tela não tem exame
          * neurológico"*. Ele estava certo sobre o que via: o bloco fica colado
          * embaixo do conteúdo da superfície, sem nada dizendo que muda de
          * assunto.
          *
          * ⚠️ A REGRA ⛔ NÃO MUDOU: pendência tem dono numa superfície e **alcance
          * global** (§5.5, E-07), para o médico ⛔ não perder de vista o que falta
          * enquanto trabalha noutra frente. O que faltava era DIZER isso.
          */}
        <Text style={s.blocoNota}>
          {tr("De todas as superfícies. O nome indica onde resolver.")}
        </Text>
        {pendencias.length === 0 ? (
          <Text style={s.vazio}>{tr("Nenhuma pendência aberta")}</Text>
        ) : (
          pendencias.map((p) => (
            <Pressable
              key={p.id}
              style={s.pendencia}
              accessibilityRole="button"
              testID={`avc-pendencia-${p.id}`}
              onPress={() => abrir(p.dono)}
            >
              <Text style={s.pendenciaRotulo}>⚑ {tr(p.rotulo)}</Text>
              {/* ⚠️ E-26: pendência sem condição de resolução é muro, não tarefa. */}
              <Text style={s.pendenciaResolve}>{tr(p.resolvePor)}</Text>
              {/**
                * ⚠️⚠️ A LETRA E O TÍTULO, ⛔ NUNCA O SLUG.
                *
                * ── A REGRESSÃO QUE ISTO CORRIGE (2026-08-28) ────────────────
                *
                * Aqui estava `{p.dono}`. Enquanto o id era a letra, isso
                * imprimia "A · Resolver" e passava despercebido; ao virar slug
                * estável, a mesma linha passou a imprimir
                * "estabilizacao · Resolver" — identificador interno vazando
                * para a tela clínica, que é o que a correção 6 tirou de lá.
                *
                * ⚠️ A LIÇÃO: quando identidade e rótulo eram a mesma string, a
                * tela podia imprimir a identidade e parecer certa. Separá-los
                * revelou todos os lugares que dependiam da coincidência — este
                * era um deles, e só apareceu porque a varredura de texto da
                * trava visual despejou a tela inteira.
                */}
              {/**
                * ⚠️ VERBO NA FRENTE: "Abrir Neurológico" diz o que o toque FAZ.
                * "Neurológico · Resolver" descrevia um lugar e deixava a ação
                * por último, na tela em que o médico está com pressa.
                */}
              <Text style={s.pendenciaDono}>
                {tr("Abrir")} {tr(superficie(p.dono).titulo)}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>

    {/**
      * ── ⚠️⚠️ BARRA INFERIOR FIXA ──────────────────────────────────────────
      *
      * ⚠️ A navegação custava **204 px em toda superfície** para repetir os
      * mesmos seis destinos. ⛔ Fora do fluxo, ela custa zero de altura — ⛔ e
      * fica onde o polegar já está.
      *
      * ⚠️⚠️ ⛔ ELA ⛔ NÃO É UMA ÁRVORE. Qualquer uma das seis abre a partir de
      * qualquer outra, em um toque, em qualquer ordem (§7.2, E-11).
      *
      * ⛔ ⛔ E ⛔ NÃO É PAINEL DE ALERTA: ⛔ nenhum badge com número. Um ponto
      * discreto no destino que tem bloqueio corrigível, ⛔ e nada além.
      */}
    <View style={[s.barra, { paddingBottom: insets.bottom }]} testID="avc-barra">
      {SUPERFICIES.filter((sup) => !sup.painel && sup.id !== "correcoes").map((sup) => {
        const ativa = sup.id === estado.superficieVista;
        const c = CURTO[sup.id];
        return (
          <Pressable
            key={sup.id}
            onPress={() => abrir(sup.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={tr(sup.titulo)}
            testID={`avc-aba-${sup.id}`}
            style={s.barraItem}
          >
            <Icone
              nome={c?.icone ?? "adiante"}
              tamanho={19}
              cor={ativa ? tema.cores.primary : tema.cores.textSecondary}
            />
            <Text
              style={[s.barraNome, ativa && s.barraNomeAtivo]}
              numberOfLines={1}
              testID={`avc-rotulo-aba-${sup.id}`}
            >
              {tr(c?.nome ?? sup.titulo)}
            </Text>
          </Pressable>
        );
      })}
    </View>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    /* ── cockpit ─────────────────────────────────────────────────────── */
    /**
     * ⚠️⚠️ FAIXA, ⛔ e ⛔ NÃO CARD.
     *
     * ⛔ Com borda de 2 px ⛔ e padding de card, o cockpit lia como um bloco
     * *dentro* do shell — ⛔ e competia com o conteúdo clínico logo abaixo.
     * ⚠️ Uma toolbar ⛔ não precisa de moldura: o filete inferior já a separa.
     */
    cockpit: {
      borderBottomWidth: 1,
      borderBottomColor: tema.cores.border,
      paddingBottom: ESPACO.xs,
      gap: ESPACO.xs,
    },
    /** ⚠️ A moldura existe para a barra ficar FORA do fluxo rolável. */
    moldura: { flex: 1, backgroundColor: tema.cores.bg },

    /* ── barra inferior fixa ──────────────────────────────────────────── */
    barra: {
      flexDirection: "row",
      backgroundColor: tema.cores.surface,
      borderTopWidth: 1,
      borderTopColor: tema.cores.border,
    },
    barraItem: {
      flex: 1,
      /** ⚠️ ⛔ Sem `minWidth: 0`, um nome longo empurra os vizinhos ⛔ e trunca. */
      minWidth: 0,
      paddingHorizontal: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      /** ⚠️ Alvo confortável: a barra inteira tem 62 px de altura útil. */
      height: ALTURA_DA_BARRA,
    },
    barraNome: {
      color: tema.cores.textSecondary,
      /** ⚠️ 10 px: "Reperfusão" ⛔ não cabia em 6 colunas de 412 pt ⛔ e truncava. */
      /** ⚠️ 10 px é o PISO — ⛔ abaixo disso ⛔ não se lê num plantão. */
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: -0.3,
    },
    /** ⚠️ O ativo se distingue por COR **e** peso — ⛔ cor sozinha é frágil. */
    barraNomeAtivo: { color: tema.cores.primary, fontWeight: "800" },

    /* ── faixa compacta: o que fica em TODA superfície ────────────────── */
    faixa: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      minHeight: 38,
    },
    faixaItem: { flexDirection: "row", alignItems: "baseline", gap: 3 },
    faixaSep: { color: tema.cores.border, fontSize: TIPOGRAFIA.caption.fontSize },
    faixaChave: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
    },
    faixaValor: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700",
    },
    /** ⚠️⚠️ AUSÊNCIA NEUTRA — ⛔ campo vazio ⛔ não é achado. */
    faixaAusente: { color: tema.cores.textSecondary, fontWeight: "400" },
    cockpitCompleto: { gap: ESPACO.sm, paddingTop: ESPACO.xs },

    /* ── bloqueio corrigível, citando D ──────────────────────────────── */
    bloqueio: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.warning,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      minHeight: TOQUE.minimo,
    },
    bloqueioTexto: {
      flex: 1,
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.micro.fontSize,
    },
    bloqueioAcao: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700",
    },

    cockpitTopo: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: ESPACO.sm },
    relogioClinico: { flex: 1, gap: 2 },
    cockpitRotulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    /** ⚠️ O relógio CLÍNICO é o número grande — ⛔ e ⛔ não o tempo de abertura. */
    cockpitRelogio: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.title.fontSize,
      fontWeight: "800",
    },
    /** ⚠️⚠️ AUSÊNCIA É NEUTRA — ⛔ cinza, ⛔ nunca âmbar. */
    cockpitAusente: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },
    /** ⚠️ Discreto de propósito: contador grande correndo vira ruído. */
    cockpitAtendimento: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
    },
    vitais: { flexDirection: "row", gap: ESPACO.xs },
    vital: {
      flex: 1,
      alignItems: "center",
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      paddingVertical: ESPACO.xs,
      minHeight: TOQUE.minimo,
      justifyContent: "center",
    },
    vitalChave: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
    },
    vitalValor: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    vitalAusente: { color: tema.cores.textSecondary, fontWeight: "400" },
    vitalUnidade: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    /* ── navegação clínica ───────────────────────────────────────────── */
    navBloco: { gap: ESPACO.xs },
    nav: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    navItem: {
      width: "31.5%",
      alignItems: "center",
      gap: 2,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      paddingVertical: ESPACO.sm,
      minHeight: TOQUE.minimo,
      justifyContent: "center",
    },
    navItemAtivo: { borderColor: tema.cores.primary },
    navNome: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "600",
    },
    navNomeAtivo: { color: tema.cores.primary },
    aux: { flexDirection: "row", gap: ESPACO.xs },
    auxItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ESPACO.xs,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      paddingVertical: 1,
      paddingHorizontal: ESPACO.xs,
      minHeight: 30,
    },
    auxItemAtivo: { borderColor: tema.cores.primary },
    auxNome: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    root: { flex: 1, backgroundColor: tema.cores.bg },
    conteudo: { padding: ESPACO.md, paddingBottom: ESPACO.xl, gap: ESPACO.md },
    /** ⚠️ Uma linha: voltar · nome · ⓘ do escopo. Eram 120 px; agora ~44. */
    cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm, minHeight: 44 },
    voltar: { color: AREA_AVC.accent, fontSize: TIPOGRAFIA.title.fontSize },
    titulo: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    subtitulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    resumo: { backgroundColor: AREA_AVC.badgeBg, borderRadius: RAIO.card, padding: ESPACO.sm, gap: ESPACO.xs },
    resumoTitulo: { color: AREA_AVC.badgeText, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700", letterSpacing: 1 },
    resumoLinha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.md },
    resumoItem: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    bloco: { gap: ESPACO.sm },
    blocoTitulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700", letterSpacing: 1 },
    blocoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize, marginTop: -ESPACO.xs },
    vazio: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, fontStyle: "italic" },
    pendencia: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao, padding: ESPACO.sm,
      gap: 2, borderLeftWidth: 3, borderLeftColor: AREA_AVC.accent,
    },
    pendenciaRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    pendenciaResolve: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    /**
     * ⚠️ TEXTO NÃO USA O ACCENT DA ÁREA — medido, não suposto.
     *
     * A primeira versão pintava "C · Resolver" com o roxo da área sobre a
     * superfície: `contraste-renderizado` mediu **4.06:1**, abaixo do mínimo AA
     * de 4.5:1. O accent continua identificando a área na BARRA LATERAL, que é
     * forma e não texto; o texto passa a usar a cor de texto do tema (§7.18).
     */
    pendenciaDono: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700", marginTop: ESPACO.xs },
    abas: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    aba: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      paddingVertical: ESPACO.sm, paddingHorizontal: ESPACO.sm,
      minWidth: 96, flexGrow: 1, flexBasis: 96, gap: 2,
      // ⚠️ TOQUE.minimo garante alvo confortável (§7.18) sem número mágico.
      minHeight: TOQUE.minimo,
    },
    abaAtiva: { backgroundColor: AREA_AVC.badgeBg, borderWidth: 1, borderColor: AREA_AVC.accent },
    abaLetra: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "800" },
    abaLetraAtiva: { color: AREA_AVC.badgeText },
    abaTitulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    abaTituloAtivo: { color: tema.cores.text },
    superficie: { backgroundColor: tema.cores.surface, borderRadius: RAIO.card, padding: ESPACO.md, gap: ESPACO.sm },
    superficieLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
    superficieNome: {
      flex: 1,
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    /** ⚠️ Linha auxiliar MUITO compacta — ⛔ e ainda a um toque. */
    auxiliares: { flexDirection: "row", gap: ESPACO.xs },
    superficieTitulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    superficieResumo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    emConstrucao: { color: tema.cores.warning, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", marginTop: ESPACO.sm },
    emConstrucaoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fontesBotao: { minHeight: TOQUE.minimo, justifyContent: "center", marginTop: ESPACO.md },
    fontesTitulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700", letterSpacing: 1 },
    fontes: { gap: 2 },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
  });
