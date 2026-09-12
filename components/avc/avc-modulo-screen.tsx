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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SEQUENCIA_OFICIAL, SUPERFICIES, superficie } from "../../avc/conteudo/superficies";
import { proximaInstancia } from "../../avc/nucleo/instancia";
import { COLETA } from "../../avc/conteudo/laboratorio";
import { ESTUDO, PRIORIDADE_DA_IMAGEM } from "../../avc/conteudo/superficie-c";
import { PRIORIDADE_A } from "../../avc/conteudo/superficie-a";
import {
  ameacasImediatas,
  eixosNaoAvaliados,
  estadoClinicoDoEixo,
  haAmeacaAberta,
} from "../../avc/nucleo/ameacas-imediatas";
import SuperficieD from "./superficie-d";
import SuperficieE from "./superficie-e";
import SuperficieF from "./superficie-f";
import SuperficieG from "./superficie-g";
import SuperficieHemorragica from "./superficie-hemorragica";
import { ACAO_DE_TROMBOLISE, TROMBOLISE_IV } from "../../avc/conteudo/superficie-f";
import { nihssCalculado, nihssInformado } from "../../avc/nucleo/derivacoes-b";
import { correcoesEhRelevante, pendenciasDoCaso, problemasAtivos } from "../../avc/nucleo/problemas-ativos";
import { SETA } from "../../design-system/afordancia";
import { ESTADOS, corDoEstado } from "../../design-system/estados-clinicos";
import {
  destinoDaImagem,
  situacaoDaTcSemContraste,
  situacaoDoPedidoDeTc,
} from "../../avc/nucleo/derivacoes-c";
import { bloqueiosCorrigiveis } from "../../avc/nucleo/derivacoes-d";
import { Icone, Secao, type NomeDeIcone } from "./ui";
import {
  ClinicalHeader,
  ClinicalShell,
  InfoToggle,
  PhaseNavigation,
  PrimaryAction,
  ScreenHeader,
  WarningCard,
} from "./sistema";
import { ProvedorDeFoco, type NoMensuravel } from "./sistema/foco";
import {
  CardHeader,
  CardNota,
  LinkAction,
  VitalGrid,
  type SinalVital,
} from "./sistema/blocos";

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
/**
 * ⚠️⚠️ O CABEÇALHO SEGUE A SÍNDROME — ⛔ e ⛔ não é um rótulo fixo (PD-36).
 *
 * ⛔ O módulo dizia *"AVC isquêmico agudo"* em TODA superfície. Nos destinos
 * hemorrágicos isso vira **contradição na tela**: título isquêmico por cima de
 * recomendações de hemorragia, cujas condutas são **opostas** (reperfundir ×
 * reverter anticoagulação).
 *
 * ⚠️ Ausente aqui = a síndrome do fluxo principal. ⛔ Só os destinos divergem.
 */
const TITULO_DA_SINDROME: Readonly<Record<string, string>> = {
  hic: "AVC hemorrágico (HIC)",
  hsa: "Hemorragia subaracnóidea (HSA)",
};

const ESCOPO_DA_SINDROME: Readonly<Record<string, string>> = {
  hic: "Adulto com hemorragia intracerebral espontânea",
  hsa: "Adulto com hemorragia subaracnóidea aneurismática",
};

/**
 * ⚠️ A cor de cada atalho — ⛔ identidade do assunto, ⛔ e ⛔ não estado clínico.
 * ⚠️ O nome escrito ao lado diz o mesmo (**E-15**).
 */
/**
 * ⚠️⚠️ A COR DE CADA EIXO — ⛔ identidade do assunto, ⛔ e ⛔ NÃO estado clínico.
 *
 * ⛔ Relato do autor: *"quatro coisas da mesma cor misturando o visual"*.
 * ⚠️ Os quatro tiles eram cinza idênticos, ⛔ e o olho ⛔ não achava *"glicemia"*
 * ⛔ sem ler os quatro nomes.
 *
 * ⚠️⚠️ ⛔ E ⛔ ISSO ⛔ NÃO COLIDE COM O ESTADO: a cor identifica **de que eixo se
 * trata** ⛔ e ⛔ não muda com a resposta; quem muda é o **símbolo** (○ ✓ !) ⛔ e a
 * borda do tile. ⛔ Apague todas as cores ⛔ e o tile continua dizendo o mesmo
 * (**E-15**).
 */
const COR_DO_EIXO: Readonly<Record<string, "info" | "primary" | "critical" | "debt">> = {
  via_aerea: "info",
  respiracao: "primary",
  pressao: "critical",
  glicemia: "debt",
};


const CURTO: Readonly<Record<string, { nome: string; icone: NomeDeIcone }>> = {
  estabilizacao: { nome: "Estabilizar", icone: "estabilizar" },
  neurologico: { nome: "Neuro", icone: "neuro" },
  /**
   * ── ⚠️⚠️ *"Investigação"*, ⛔ E ⛔ NÃO *"Imagem"* — Fase 5, 2026-09-07 ──────
   *
   * ⛔ O nome curto virou **mentira** quando a fase passou a carregar imagem
   * ⛔ **e** laboratório: a aba prometia um assunto ⛔ e entregava dois.
   *
   * ⚠️⚠️ ⛔ E a revisão visual mostrou o sintoma: o cabeçalho da fase dizia
   * *"Imagem"* ⛔ e ⛔ logo abaixo vinha o bloco *"Imagem"* — ⛔ **a mesma
   * palavra duas vezes**, ⛔ uma como fase ⛔ e outra como bloco.
   *
   * ⛔ O slug segue `imagem`: ⛔ ele é a **casa** de dezesseis campos, ⛔ e
   * renomeá-lo moveria fato clínico ⛔ sem necessidade ⛔ nenhuma.
   */
  imagem: { nome: "Investigação", icone: "imagem" },
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
import { corrigirNaInstancia, registrarComInstancia, campoDoModulo } from "../../avc/conteudo/campos";
import { CAMPO_DE_ITEM } from "../../avc/conteudo/nihss";
import { slot } from "../../avc/conteudo/fontes";
import { GRUPOS_A, TODOS_OS_CAMPOS_A } from "../../avc/conteudo/superficie-a";
import {
  CAMPO_DA_ORIGEM_DO_GLASGOW,
  CAMPO_DE_ITEM_GLASGOW,
  ORIGEM_DO_GLASGOW,
} from "../../avc/conteudo/glasgow";
import { camposDoGrupo } from "../../avc/conteudo/campo";
import { TODOS_OS_CAMPOS_B } from "../../avc/conteudo/superficie-b";
import { TODOS_OS_CAMPOS_C } from "../../avc/conteudo/superficie-c";
import { TODOS_OS_CAMPOS_P } from "../../avc/conteudo/paciente";
import { TODOS_OS_CAMPOS_L } from "../../avc/conteudo/laboratorio";
import {
  abrirAtendimento,
  decorridoEmMinutos,
  definirRelogioClinico,
  concluirEixo,
  reabrirEixo,
  registrarFato,
  valorAtual as valorAtualDoEstado,
  verSuperficie,
} from "../../avc/nucleo/estado";
import SuperficieA from "./superficie-a";
import SuperficieB from "./superficie-b";
import SuperficieC from "./superficie-c";
import SuperficiePaciente from "./superficie-paciente";
import SuperficieLaboratorio from "./superficie-laboratorio";
import { relogioDoSistema } from "../../avc/nucleo/relogio";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import { getPalette } from "../../design-system/paleta-de-area";
import { EIXOS_DA_ESTABILIZACAO, grupoDoEixo } from "./ui";
import { useEstilosDoTema, useTheme, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, LARGURA, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { AcessoAoUsoClinico } from "../../design-system/aviso-de-apoio-clinico";

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
  /**
   * ⚠️⚠️ PA ⛔ E GLICEMIA SAÍRAM DAQUI — 2026-09-06, ⛔ e ⛔ não foram perdidas.
   *
   * ⛔ **A duplicação que isto desfaz:** as duas apareciam em **dois blocos** da
   * mesma rolagem — como *"A avaliar"* nos eixos ⛔ e como *"—"* aqui. ⚠️ Num
   * atendimento vazio eram **quatro células dizendo ⛔ nada**; com PA 198/112, o
   * **número** ficava aqui ⛔ e o **julgamento** ficava lá, separados pelo card
   * da tomografia.
   *
   * ⚠️ Agora o valor mora **dentro do eixo** que o julga (C ⛔ e D). ⛔ Este card
   * fica com o que ⛔ **não tem eixo**: NIHSS ⛔ e imagem.
   */
  /**
   * ⚠️⚠️ PA ⛔ E GLICEMIA SAÍRAM DAQUI — 2026-09-06, ⛔ e ⛔ não se perderam.
   *
   * ⛔ **A duplicação que isto desfaz:** as duas apareciam em **dois blocos** da
   * mesma rolagem — como *"A avaliar"* nos eixos ⛔ e como *"—"* aqui. ⚠️ Num
   * atendimento vazio eram **quatro células dizendo ⛔ nada**; com PA 198/112, o
   * **número** ficava aqui ⛔ e o **julgamento** ficava lá, separados pelo card
   * da tomografia — ⛔ dois blocos para ler um fato só.
   *
   * ⚠️ Agora o valor mora **dentro do eixo que o julga** (C ⛔ e D). ⛔ Este card
   * fica com o que ⛔ **não tem eixo**: o NIHSS ⛔ e a imagem.
   */
  /** ⚠️ Lida pelo núcleo (I6) — ⛔ a tela ⛔ não interpreta fato por conta própria. */
  /**
   * ── ⚠️⚠️ ⛔ UM ESTADO DERIVADO, ⛔ E ⛔ NÃO O TERNÁRIO REPETIDO ────────────
   *
   * ⛔ A escolha da ação estava escrita **duas vezes** neste arquivo, com a
   * mesma cadeia `resultado_pendente ? … : jaSolicitada ? … : …`. ⚠️ Duas
   * cópias de uma regra ⛔ é como nasce a terceira tela oferecendo *"solicitar"*
   * ⛔ para um exame já registrado.
   *
   * ⚠️ `situacaoDoPedidoDeTc()` é do **núcleo** (**I6**), ⛔ e ⛔ ela ⛔ não cria
   * fato ⛔ nenhum: ⛔ sai de `hora_solicitacao_imagem` ⛔ e das instâncias de
   * `estudo` (decisão do autor, Fase 5 · **item 3**).
   */
  const situacaoDoPedido = situacaoDoPedidoDeTc(estado);
  /** ⚠️ O rótulo que a situação pede — ⛔ e ⛔ nenhuma tela decide sozinha. */
  const ACAO_DA_SITUACAO = {
    sugerido: PRIORIDADE_DA_IMAGEM.acaoSolicitar,
    em_andamento: PRIORIDADE_DA_IMAGEM.acaoRegistrar,
    realizado_sem_resultado: PRIORIDADE_DA_IMAGEM.acaoResultado,
    /**
     * ⚠️⚠️ ⛔ E ⛔ AQUI ⛔ ELA **⛔ NÃO COBRA** — 2026-09-09. ⛔ As duas linhas
     * eram ⛔ a mesma frase, ⛔ e a de baixo mandava *"registrar o
     * resultado"* ⛔ **⛔ depois** de ⛔ ele ter sido registrado.
     */
    resultado_disponivel: PRIORIDADE_DA_IMAGEM.acaoVerResultado,
  } as const;


  const VITAIS = useMemo(() => {
    const nihss = nihssCalculado(estado) ?? nihssInformado(estado);
    /**
     * ⚠️⚠️ ⛔ A PERGUNTA DA PEÇA É *"EXISTE EXAME?"* — 2026-09-09.
     *
     * ⛔ ⛔ Ela lia `destinoDaImagem()`, ⛔ que responde *"para que rota este
     * caso vai?"*. ⚠️ ⛔ São perguntas diferentes, ⛔ e ⛔ por isso a peça
     * ficava ⛔ em branco ⛔ com a TC ⛔ já registrada.
     */
    const tc = situacaoDaTcSemContraste(estado);
    return [
      {
        id: "nihss",
        rotulo: "NIHSS",
        unidade: "0–42",
        campo: "nihss_informado",
        icone: "neuro" as const,
        acento: "success" as const,
        valor: typeof nihss === "number" ? String(nihss) : undefined,
        unidadeDinamica: undefined as string | undefined,
      },
      {
        /** ⚠️ Estado da imagem — ⛔ e ⛔ não um veredito sobre reperfusão. */
        id: "imagem",
        rotulo: "Imagem",
        unidade: "exame",
        campo: "estudo_modalidade",
        icone: "imagem" as const,
        acento: "info" as const,
        /** ⚠️ ⛔ O valor curto ⛔ é a **modalidade**; o estado vai ⛔ na unidade. */
        valor:
          tc === "nenhuma_registrada" ? undefined : tr(PRIORIDADE_DA_IMAGEM.tileModalidade),
        unidadeDinamica:
          tc === "realizada_resultado_registrado"
            ? tr(PRIORIDADE_DA_IMAGEM.tileComResultado)
            : tc === "realizada_resultado_pendente"
              ? tr(PRIORIDADE_DA_IMAGEM.tileSemResultado)
              : undefined,
      },
    ];
  }, [estado, tr]);

  // ⚠️ Pendências derivadas: dono numa superfície, ALCANCE GLOBAL (E-07).
  // Elas aparecem aqui independentemente de qual superfície está aberta.
  /**
   * ⚠️⚠️ A LISTA VEM DO **NÚCLEO** — ⛔ e ⛔ não é mais montada aqui.
   *
   * ⛔ Havia um `useMemo` de trinta linhas concatenando **seis** produtores de
   * pendência, com a ordem clínica escrita em comentário. ⚠️ Regra que mora no
   * JSX ⛔ não pode ser executada por trava ⛔ nenhuma — ⛔ e foi assim que a
   * leitura das ameaças se perdeu ⛔ uma vez neste módulo.
   *
   * ⚠️ `problemasAtivos` junta ameaças, bloqueios ⛔ e pendências numa lista só,
   * ordenada por urgência ⛔ e origem, ⛔ e uma prova executa essa ordem.
   */
  const problemas = useMemo(() => problemasAtivos(estado), [estado]);

  /**
   * ⚠️⚠️⚠️ NA PRIMEIRA TELA, ⛔ SÓ AS PENDÊNCIAS **DELA** — 2026-09-07.
   *
   * ⛔ ⛔ Relato do autor: *"as pendências do atendimento só devem aparecer do
   * que tem nessa tela, porque como ela é a primeira seria impossível aparecer
   * outras pendências"*.
   *
   * ⚠️⚠️ ⛔ E ⛔ A REGRA GERAL ⛔ NÃO MUDOU: nas outras seis superfícies o
   * alcance segue **global** (**§5.5**, **E-07**) — ⛔ o médico ⛔ não perde de
   * vista o que falta enquanto trabalha noutra frente.
   *
   * ⛔ ⛔ O que muda é ⛔ só a **abertura**: uma lista de tarefas de seis fases
   * adiante, ⛔ antes de o atendimento ter começado, ⛔ não orienta — ⛔ ela
   * confunde.
   */
  /**
   * ── ⚠️⚠️⚠️ POR **PROGRESSÃO**, ⛔ e ⛔ não por tela — 2026-09-08 ───────────
   *
   * ⚠️ Decisão do autor: *"na fase atual, mostrar ⛔ apenas pendências de fases
   * anteriores + fase atual"*. ⛔ A regra antiga era um caso particular disto —
   * ⛔ Paciente é a primeira fase, ⛔ então *"⛔ só as dela"* ⛔ e *"até ⛔ ela"*
   * davam a mesma lista.
   *
   * ⛔ ⛔ O DEFEITO QUE ISTO FECHA: a Estabilização abria com **TC**, **última
   * vez visto bem** ⛔ e **déficit neurológico** na lista — ⛔ três fases
   * adiante, ⛔ enquanto o médico ⛔ ainda decide se o paciente respira.
   *
   * ── ⚠️⚠️ CORREÇÕES ⛔ NÃO ESTÁ NA SEQUÊNCIA, ⛔ E ENTRA MESMO ASSIM ────────
   *
   * ⛔ Ela é **condicional** (**C3**): ⛔ existe ⛔ só quando há o que corrigir.
   * ⚠️ ⛔ E é ⛔ exatamente por isso que ⛔ ela ⛔ não precisa de porteiro
   * ⛔ aqui: uma pendência com `dono === "correcoes"` **⛔ só nasce** de
   * bloqueio corrigível ativo, de correção iniciada ⛔ ou de acompanhamento
   * ⛔ já derivado. ⛔ A existência dela **é** a condição.
   *
   * ── ⚠️ E O QUE ⛔ NÃO ESTÁ NA SEQUÊNCIA ⛔ NEM É CORREÇÕES ─────────────────
   *
   * ⚠️ Passa. ⛔ Falhar **aberto** é a escolha: ⛔ esconder uma pendência cujo
   * dono este filtro ⛔ não reconhece seria apagá-la do atendimento, ⛔ e o
   * preço do erro contrário é ⛔ só ruído.
   */
  const pendenciasVisiveis = useMemo(() => {
    const ordem = SEQUENCIA_OFICIAL.map((sup) => sup.id);
    const atual = ordem.indexOf(estado.superficieVista);
    if (atual === -1) return problemas;
    return problemas.filter((p) => {
      if (p.dono === "correcoes") return true;
      const i = ordem.indexOf(p.dono);
      return i === -1 || i <= atual;
    });
  }, [problemas, estado.superficieVista]);

  /**
   * ⚠️⚠️ ⛔ A NOTA SEGUE A LISTA, ⛔ e ⛔ nunca a contradiz: ⛔ dizer *"de todas
   * as superfícies"* sobre uma lista filtrada faria o médico concluir que
   * ⛔ não há mais ⛔ nada pendente no atendimento.
   */
  const pendenciasSaoParciais =
    SEQUENCIA_OFICIAL.map((sup) => sup.id).indexOf(estado.superficieVista) !== -1
    && pendenciasVisiveis.length < problemas.length;

  /**
   * ⚠️ ⛔ `informadosEmA` foi removido em 2026-09-06: contava campos preenchidos
   * da Superfície A ⛔ e ⛔ nunca era lido. ⚠️ O que ele prometia — *"ver o que
   * falta"* — hoje é dito pelo cabeçalho da fase (*"N a resolver aqui"*) ⛔ e
   * pelo estado de cada eixo.
   */

  /**
   * ── ⚠️⚠️ A PILHA DE ONDE SE VEIO ────────────────────────────────────────
   *
   * ⛔ Relato do autor, 2026-09-06:
   *
   * > *"quando clico nos botões de estabilização ⛔ e depois tento voltar,
   * >  volta para a página onde tem os módulos ⛔ e ⛔ não de volta à página que
   * >  eu estava, de estabilização"*
   *
   * ⛔ **O defeito:** o módulo inteiro é **⛔ uma** rota. ⚠️ Trocar de superfície
   * ⛔ não passava por navegador ⛔ nenhum, ⛔ então *"‹ Voltar"* ⛔ só sabia fazer
   * uma coisa: **sair**. ⛔ Quem tocou num eixo, foi levado à Imagem ⛔ e quis
   * desfazer o passo era jogado para fora do atendimento.
   *
   * ⚠️⚠️ ⛔ E ⛔ ISSO ⛔ NÃO CRIA ORDEM (**E-11**): a pilha guarda **por onde se
   * passou**, ⛔ e ⛔ não por onde se **deve** passar. ⛔ Ela ⛔ não bloqueia, ⛔ não
   * exige ⛔ e ⛔ não altera ⛔ nenhum fato — ⛔ é memória de navegação, ⛔ e ⛔ nada
   * mais.
   *
   * ⚠️ ⛔ Ela vive num `ref` de propósito: se fosse estado, cada troca de
   * superfície causaria um render a mais ⛔ e a rolagem já paga esse preço.
   */
  const trilhaDeSuperficies = useRef<SuperficieId[]>([]);

  function abrir(id: SuperficieId) {
    // ⚠️ E-20: mudar de superfície ⛔ NÃO produz ação clínica nem registra nada.
    /**
     * ⚠️⚠️ O EMPILHAR ACONTECE **FORA** DO `setEstado` — ⛔ e ⛔ isso ⛔ não é
     * estilo. ⛔ O atualizador de estado do React pode ser executado **duas
     * vezes** (StrictMode), ⛔ e um `push` lá dentro empilharia a mesma
     * superfície em dobro: dois toques em *"Voltar"* para desfazer **um**
     * passo.
     *
     * ⚠️ Abrir a superfície **em que já se está** ⛔ não empilha.
     */
    if (estado.superficieVista !== id) trilhaDeSuperficies.current.push(estado.superficieVista);
    setEstado((e) => verSuperficie(e, id));
  }

  /**
   * ⚠️⚠️ *"Voltar"* VOLTA **UM PASSO**, ⛔ e ⛔ só sai do módulo quando ⛔ não há
   * passo para desfazer.
   *
   * ⚠️ ⛔ E o `onVoltar` de fora continua existindo inteiro — ⛔ ele é o fim da
   * pilha, ⛔ e ⛔ não foi substituído.
   */
  function voltarUmPasso() {
    const anterior = trilhaDeSuperficies.current.pop();
    if (anterior === undefined) {
      onVoltar();
      return;
    }
    setEstado((e) => verSuperficie(e, anterior));
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
      /**
       * ⚠️⚠️ OS CAMPOS DO LABORATÓRIO LEVAM A **INVESTIGAÇÃO** — ⛔ e ⛔ não a
       * uma fase própria, que ⛔ não existe mais (**C3**).
       *
       * ⛔ Sem esta linha, tocar *"Registrar o resultado dos exames de
       * coagulação"* ⛔ não levaria a lugar ⛔ nenhum: gesto que ⛔ não faz nada,
       * ⛔ e ⛔ sem erro visível — o mesmo defeito que a linha acima já
       * documenta para a trombólise.
       */
      ["imagem", TODOS_OS_CAMPOS_L],
    ];
    const achado = donos.find(([, campos]) => campos.some((c) => c.id === campo));
    if (!achado) return;
    /**
     * ⚠️⚠️ TROCAR DE FASE ⛔ E **LEVAR ATÉ O CAMPO** — ⛔ e ⛔ não ⛔ só a
     * primeira metade.
     *
     * ⛔ Antes isto fazia ⛔ só `verSuperficie()`. ⚠️ Quando o campo já estava na
     * fase aberta — PA ⛔ e glicemia em Estabilizar —, ⛔ o toque ⛔ não produzia
     * efeito ⛔ nenhum, ⛔ e o autor relatou *"clico ⛔ e ⛔ não abre ⛔ nada"* três
     * vezes.
     *
     * ⚠️ `rolarAte` guarda o pedido quando a superfície ⛔ ainda ⛔ não montou,
     * ⛔ e o atende no primeiro layout — ⛔ por isso a troca de fase ⛔ e o foco
     * podem ser pedidos juntos.
     */
    /** ⚠️ Por `abrir`, ⛔ e ⛔ não por fora: ir a um campo ⛔ também deixa rastro. */
    if (estado.superficieVista !== achado[0]) abrir(achado[0]);
    rolarAte(campo);
  }

  /**
   * ── ⚠️⚠️⚠️ ⛔ IR ATÉ ONDE SE RESOLVE — **⛔ uma regra só** — 2026-09-09 ────
   *
   * ⚠️ Relato do autor: *"tem um botão em azul «corrigir pressão arterial»
   * mas quando clica nele ⛔ nada acontece, ⛔ está ⛔ sem função"*.
   *
   * ⛔ ⛔ ⛔ **O mesmo defeito das pendências, ⛔ noutro botão.** `abrir(id)` é
   * **⛔ inerte** quando ⛔ já se está ⛔ na tela: ⛔ o card âmbar oferecia
   * *"Corrigir a pressão arterial"* ⛔ com o médico **⛔ dentro** das
   * Correções, ⛔ e ⛔ não saía do lugar.
   *
   * ⚠️⚠️ ⛔ E ⛔ eu ⛔ tinha corrigido ⛔ isso **⛔ na pendência**, ⛔ inline —
   * ⛔ ou seja, ⛔ **⛔ escrevi a regra duas vezes ⛔ e consertei ⛔ só uma
   * cópia**. ⛔ Este arquivo ⛔ já avisa, ⛔ vinte linhas acima: *"duas cópias
   * de uma regra é como nasce a terceira tela"*. ⛔ Nasceu.
   *
   * ⛔ ⛔ Agora ⛔ ela é **⛔ uma**, ⛔ e ⛔ quem chama ⛔ diz ⛔ só ⛔ onde ⛔ e
   * ⛔ até que ponto.
   */
  /**
   * ⚠️⚠️⚠️ « REGISTRAR UMA NOVA AFERIÇÃO » ⛔ TEM DE **⛔ ABRIR** A AFERIÇÃO.
   *
   * ── ⛔ O DEFEITO, MEDIDO EM 2026-09-10 ────────────────────────────────────
   *
   * ⛔ ⛔ O botão levava ⛔ à Estabilização ⛔ e ⛔ parava ali: ⛔ o médico chegava
   * ⛔ num campo ⛔ mostrando ⛔ **⛔ 183** — ⛔ o valor ⛔ **⛔ velho** — ⛔ com
   * ⛔ « Nova medida » ⛔ e ⛔ « Corrigir » ⛔ lado a lado, ⛔ e ⛔ tinha de
   * ⛔ descobrir sozinho ⛔ qual dos dois ⛔ era o certo.
   *
   * ⚠️⚠️ ⛔ E ⛔ escolher errado ⛔ **⛔ corrompe a trilha**: ⛔ « Corrigir »
   * ⛔ reescreve ⛔ a aferição ⛔ original ⛔ — ⛔ passa a dizer ⛔ que a PA
   * ⛔ **⛔ sempre foi** 170 — ⛔ apagando ⛔ o 183 ⛔ que ⛔ motivou ⛔ a conduta.
   * ⛔ O portão ⛔ até destravaria, ⛔ e ⛔ destravaria ⛔ sobre ⛔ uma história
   * ⛔ que ⛔ não aconteceu.
   *
   * ⚠️ Decisão do autor, 2026-09-10: *"`onReavaliar` deve abrir diretamente uma
   * nova aferição, ⛔ preservando a medida anterior ⛔ como fato histórico.
   * ⛔ «Corrigir» ⛔ continua existindo ⛔ apenas ⛔ para erro de
   * digitação/registro, ⛔ não como caminho de reavaliação ⛔ após tratamento."*
   *
   * ⛔ ⛔ Quem sabe ⛔ se um campo ⛔ tem instância ⛔ é ⛔ **⛔ o conteúdo**
   * (`instanciaDe`), ⛔ e ⛔ não um mapa ⛔ escrito aqui. ⛔ Campo ⛔ sem
   * instância ⛔ (glicemia) ⛔ **⛔ não** ganha ⛔ uma inventada: ⛔ ele ⛔ navega
   * ⛔ como antes, ⛔ e ⛔ a assimetria ⛔ fica ⛔ registrada ⛔ em ⛔ **D-133**.
   */
  function irAteOndeResolve(dono: SuperficieId, alvo: string | undefined) {
    const grupo = alvo ? campoDoModulo(alvo)?.instanciaDe : undefined;
    if (grupo) novaMedida(grupo);
    if (estado.superficieVista !== dono) abrir(dono);
    /** ⛔ Já estando ⛔ lá, ⛔ o que resta ⛔ é ⛔ levar até o ponto. */
    if (alvo) rolarAte(alvo);
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
  /**
   * ── ⚠️⚠️⚠️ O GLASGOW PELA CALCULADORA — 2026-09-08 ──────────────────────
   *
   * ⚠️ Pedido do autor: *"a calculadora coloca no APP o resultado"*. ⛔ Um
   * gesto só, ⛔ como o NIHSS: ⛔ um fato por componente, ⛔ o total, ⛔ e a
   * **origem**.
   *
   * ⚠️⚠️ ⛔ A ORIGEM É GRAVADA JUNTO, ⛔ e ⛔ não deduzida depois: *"⛔ não
   * misturar origens silenciosamente"*. ⛔ Deduzir *"calculado"* de
   * `E+V+M === total` mentiria quando o médico calcula 11 ⛔ e depois digita 11.
   *
   * ⛔ ⛔ E ⛔ nada é apagado: a trilha é append-only, ⛔ então o total que veio
   * antes continua ⛔ lá, ⛔ com a origem que ⛔ ele tinha.
   */
  function registrarGlasgow(pontos: Record<string, number>, total: number) {
    setEstado((e) => {
      let proximo = e;
      for (const [item, ponto] of Object.entries(pontos)) {
        proximo = registrarFato(
          proximo,
          { campo: CAMPO_DE_ITEM_GLASGOW(item), valor: ponto },
          relogio
        );
      }
      proximo = registrarFato(proximo, { campo: "glasgow", valor: total }, relogio);
      return registrarFato(
        proximo,
        { campo: CAMPO_DA_ORIGEM_DO_GLASGOW, valor: ORIGEM_DO_GLASGOW.calculado },
        relogio
      );
    });
  }

  /**
   * ⚠️⚠️ O TOTAL **DIGITADO** — ⛔ e ⛔ ele registra a **sua** origem.
   *
   * ⛔ ⛔ Sem isto, digitar por cima de um Glasgow calculado deixaria a trilha
   * dizendo *"calculado"* sobre um número que ⛔ ninguém calculou.
   *
   * ⚠️ ⛔ E ⛔ os componentes **⛔ não são apagados**: *"registrar a nova origem
   * ⛔ sem apagar silenciosamente a trilha anterior"*. ⛔ Divergência entre
   * total ⛔ e componentes fica **visível**, ⛔ e ⛔ não corrigida sozinha.
   */
  function medirGlasgow(campo: string, valor: number) {
    setEstado((e) => {
      const comTotal = registrarFato(e, { campo, valor }, relogio);
      return registrarFato(
        comTotal,
        { campo: CAMPO_DA_ORIGEM_DO_GLASGOW, valor: ORIGEM_DO_GLASGOW.informado },
        relogio
      );
    });
  }

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
      /**
       * ⚠️⚠️ ⛔ SEM ESCRITA DUPLA (R5, commit 10 · 2026-09-12 · AVC-12).
       *
       * ⛔ Esta rotina gravava o horário **no fato ⛔ e no mapa de relógios**;
       * *"⛔ sem essa informação"* gravava ⛔ só o fato — ⛔ e o mapa seguia
       * dizendo *"há 2 h"* na síntese ⛔ e no cabeçalho. ⚠️ O marco clínico
       * **é** o fato (`CAMPO_DO_RELOGIO_CLINICO`); ⛔ só o relógio
       * operacional (chegada) vive no mapa, ⛔ porque ⛔ não é fato informado.
       */
      return qualRelogio === "t0_operacional"
        ? definirRelogioClinico(comFato, "t0_operacional", instante)
        : comFato;
    });
  }

  /**
   * ⚠️⚠️ A ROLAGEM VOLTA AO TOPO AO TROCAR DE SUPERFÍCIE — 2026-09-06.
   *
   * ⛔ **O defeito que isto corrige, ⛔ e ⛔ ele ⛔ não era de estilo.** O autor
   * relatou *"clica ⛔ e ⛔ nada acontece"* em dois controles diferentes. ⚠️ Medido
   * na tela: `scrollTop` **1500 antes ⛔ e 1500 depois** da troca.
   *
   * ⚠️ A superfície trocava ⛔ **de verdade** — ⛔ mas o médico continuava parado
   * a 1500 px dentro de **outra** tela, olhando um pedaço qualquer do meio dela.
   * ⛔ Do ponto de vista de quem usa, o botão ⛔ não fez ⛔ nada.
   *
   * ⚠️⚠️ ⛔ E ⛔ ISSO ⛔ NÃO É NAVEGAÇÃO NOVA: a fase já abria: o que faltava era
   * **levar o olho junto**. ⛔ Trocar de assunto ⛔ sem mover a viewport é o
   * equivalente a virar a página ⛔ e ⛔ não olhar.
   */
  const rolagem = useRef<ScrollView | null>(null);
  /**
   * ⚠️⚠️ OS NÓS DOS GRUPOS — ⛔ e ⛔ isso ⛔ não é estado clínico: é geometria.
   *
   * ⛔ `useRef` ⛔ e ⛔ não `useState`: guardar nó em estado provocaria
   * re-render a cada montagem de grupo.
   */
  const nosDosCampos = useRef<Record<string, NoMensuravel>>({});
  /**
   * ⚠️⚠️ O NÓ DO **CONTEÚDO**, ⛔ e ⛔ não o da área rolável.
   *
   * ⛔ A versão anterior media contra a área ⛔ e somava o deslocamento atual,
   * rastreado por `onScroll`. ⚠️ Medido: depois de rolar até a pressão (2169),
   * a glicemia levava a **170** — ⛔ o deslocamento rastreado estava
   * desatualizado, ⛔ e a conta somava zero.
   *
   * ⚠️ O conteúdo **anda junto com a rolagem**. ⛔ A distância entre o topo dele
   * ⛔ e o topo do grupo é a posição absoluta — ⛔ e ⛔ ela ⛔ não depende de saber
   * onde a rolagem está.
   */
  const noDoConteudo = useRef<View | null>(null);
  /** ⚠️ O campo pedido enquanto a superfície ⛔ ainda ⛔ não montou. */
  const focoPendente = useRef<string | undefined>(undefined);

  /**
   * ⚠️⚠️ MEDE **NO MOMENTO DO TOQUE** — ⛔ e ⛔ não guarda posição de layout.
   *
   * ⛔ A primeira versão usava `onLayout`; medido no navegador, ⛔ ele ⛔ nunca
   * disparou nessas Views. ⚠️ `measureInWindow` existe nas duas plataformas ⛔ e
   * lê a geometria **real**, ⛔ sem depender de evento anterior.
   */
  const rolarAte = useCallback((campo: string) => {
    const no = nosDosCampos.current[campo];
    const conteudo = noDoConteudo.current;
    if (!no || !conteudo) {
      /** ⚠️ A superfície pode ⛔ ainda ⛔ não ter montado — o pedido espera. */
      focoPendente.current = campo;
      return;
    }
    focoPendente.current = undefined;
    conteudo.measureInWindow((_cx, cy) => {
      no.measureInWindow((_gx, gy) => {
        /** ⚠️ ⛔ Um respiro acima: encostado no topo, o bloco parece cortado. */
        const alvo = Math.max(0, gy - cy - 12);
        rolagem.current?.scrollTo({ y: alvo, animated: false });
      });
    });
  }, []);

  /**
   * ⚠️⚠️ AO TROCAR DE FASE, A ROLAGEM VOLTA AO TOPO.
   *
   * ⛔ **O efeito foi apagado por engano numa reescrita de bloco em
   * 2026-09-06**, ⛔ e ⛔ só o comentário sobreviveu. ⚠️ Quem pegou foi o teste
   * que eu mesmo tinha escrito para ele — ⛔ e é exatamente por isso que ele
   * existe: comentário ⛔ não executa.
   *
   * ⚠️ ⛔ Se há foco pedido, ⛔ ele manda: quem tocou *"Pressão arterial"* quer
   * chegar **na pressão**, ⛔ e ⛔ não no topo da fase.
   */
  useEffect(() => {
    if (focoPendente.current !== undefined) return;
    rolagem.current?.scrollTo({ y: 0, animated: false });
  }, [estado.superficieVista]);

  const foco = useMemo(
    () => ({
      registrarGrupo: (campos: readonly string[], no: NoMensuravel) => {
        for (const c of campos) nosDosCampos.current[c] = no;
        const pedido = focoPendente.current;
        if (pedido !== undefined && campos.includes(pedido)) {
          /**
           * ⚠️ O nó acabou de existir, ⛔ mas a árvore ⛔ ainda ⛔ pode estar
           * assentando. ⛔ Medir no mesmo tique daria a posição de antes.
           */
          requestAnimationFrame(() => rolarAte(pedido));
        }
      },
      pedirFoco: rolarAte,
    }),
    [rolarAte]
  );

  /**
   * ⚠️⚠️ O CONTEXTO PERSISTENTE — reescrito em 2026-09-06 como **GRADE**.
   *
   * ⛔ Ele era uma faixa de texto de uma linha: `LKW — · PA — · Glicemia —`.
   * ⚠️ Nas referências que o autor mandou, este é o bloco mais característico
   * da tela: uma **grade de tiles**, cada um com ícone colorido, número grande
   * ⛔ e unidade embaixo. ⛔ A faixa dizia a mesma coisa ⛔ e ⛔ não parecia um
   * painel de medidas — ⛔ parecia uma frase.
   *
   * ⚠️ O que ⛔ **não** mudou: quem ⛔ ainda ⛔ não foi medido mostra travessão
   * **neutro** ⛔ e tocável, levando a onde se registra (**E-37**).
   *
   * ⚠️⚠️ ⛔ E O RELÓGIO ⛔ NÃO ESTÁ AQUI: ele subiu para o **cabeçalho fixo**.
   * ⛔ É o único valor que muda sozinho, ⛔ e ⛔ ele ⛔ não pode rolar para fora
   * da tela enquanto o médico decide (§7.8).
   */
  /**
   * ⚠️ As ameaças imediatas — derivadas, ⛔ e ⛔ nunca gravadas. ⛔ Elas mudam
   * quando o estado muda, ⛔ e ⛔ é isso que as mantém verdadeiras.
   */
  const ameacas = useMemo(() => ameacasImediatas(estado), [estado]);
  /**
   * ⚠️⚠️ O PRÓXIMO EIXO **⛔ NÃO AVALIADO**, na ordem do ABCDE.
   *
   * ⛔ ⛔ Ele ⛔ não é o próximo *"alterado"* ⛔ nem o próximo *"pendente"*: é o
   * próximo que **⛔ ninguém marcou como avaliado**. ⚠️ Progresso ⛔ e estado
   * clínico são eixos diferentes (**item 1**), ⛔ e este segue o progresso.
   */
  /**
   * ── ⚠️⚠️⚠️ O ACORDEÃO DOS EIXOS — 2026-09-08 ─────────────────────────────
   *
   * ⛔ ⛔ Relato do autor: *"os botões de cima A B C D E ⛔ não estão tendo
   * sentido, ⛔ já que todos direcionam para o mesmo lugar"*. ⚠️ ⛔ Eles
   * rolavam até uma seção de uma lista **⛔ já inteira na tela**.
   *
   * ⚠️⚠️ ⛔ AGORA ⛔ ELES ABREM ⛔ E FECHAM — ⛔ e o estado mora **aqui** porque
   * ⛔ ele é comandado dos **dois lados**: pelo tile, ⛔ neste cromado, ⛔ e pelo
   * cabeçalho do bloco, ⛔ dentro da Superfície A. ⛔ Duas cópias dariam tile
   * aberto com bloco fechado.
   *
   * ⚠️ ⛔ Estado de **UI**: ⛔ abrir ⛔ e fechar ⛔ não grava ⛔ nem apaga fato.
   */
  const primeiroNaoConcluido = EIXOS_DA_ESTABILIZACAO
    .find((x) => !estado.eixosConcluidos.includes(x.eixo))?.grupo;
  /**
   * ⚠️ ⛔ Nasce com **⛔ um** aberto — ⛔ o primeiro ⛔ não concluído —, ⛔ e ⛔ o
   * médico abre quantos quiser depois. ⛔ Forçar um por vez esconderia coisa
   * que ⛔ ele quer comparar.
   */
  const [eixosAbertos, setEixosAbertos] = useState<readonly string[]>(
    primeiroNaoConcluido === undefined ? [] : [primeiroNaoConcluido]
  );

  /**
   * ⚠️⚠️ ⛔ ONDE O TRATAMENTO DAQUELE EIXO ESTÁ ESCRITO — 2026-09-12.
   *
   * ⛔ Relato do autor: *"quando clico em via aérea me leva à tela de
   * avaliação … o APP ⛔ não me orienta nada"*. ⚠️ ⛔ O toque abria o eixo
   * ⛔ e parava no começo dele — ⛔ com a conduta mais abaixo, ⛔ atrás de um
   * botão.
   */
  /**
   * ── ⚠️⚠️ ⛔ AMEAÇA ATIVA ⇒ O TOQUE VAI AO **TRATAMENTO** — 2026-09-12 ────
   *
   * ⚠️ Decisão do autor: *"o card resume; a tela do eixo trata"*. ⛔ O
   * registro continua ⛔ na mesma tela, ⛔ logo acima do bloco.
   *
   * ⚠️⚠️ ⛔ E o bloco *"Corrigir agora"* **⛔ só existe com bloqueio ativo** —
   * ⛔ isso ⛔ é conteúdo, ⛔ não acaso: ⛔ oferecer anti-hipertensivo a quem
   * ⛔ não tem pressão alta ⛔ seria a tela ensinando a tratar ⛔ o que ⛔ não
   * existe. ⛔ Por isso a hiperglicemia (⛔ que ⛔ **⛔ não bloqueia**, **F-06**)
   * ⛔ não tem bloco ⛔ para ⛔ onde rolar — ⛔ e ⛔ ela ⛔ continua tendo
   * destino: ⛔ o que a **própria ameaça declara** (`leva`).
   *
   * ⚠️ ⛔ Nem todo eixo tem tratamento registrável: ⛔ `A` ⛔ e `B` ⛔ não têm,
   * ⛔ e ⛔ **F-23** ⛔ é a razão — *"airway support and ventilatory assistance
   * are recommended as needed"* ⛔ e *"supplemental oxygen … to maintain
   * SpO₂ >94%"* ⛔ **⛔ é tudo o que a fonte tem**. ⛔ Inventar agente ⛔ ou
   * dose ⛔ ali seria a tela escrevendo medicina (**E-31**).
   */
  const BLOQUEIO_DO_EIXO: Readonly<Record<string, string>> = {
    pressao: "pressao_acima_da_meta",
    glicemia: "glicemia_alterada",
  };

  function alternarEixo(grupo: string) {
    setEixosAbertos((a) => (a.includes(grupo) ? a.filter((g) => g !== grupo) : [...a, grupo]));
  }

  /**
   * ⚠️⚠️ CONCLUIR: ⛔ fecha o atual ⛔ e abre o **próximo ⛔ não concluído** —
   * decisão do autor. ⚠️ **Reabrir** ⛔ não move ⛔ ninguém: ⛔ quem reabre quer
   * olhar ⛔ aquele eixo, ⛔ e ⛔ não ser levado a outro.
   */
  function concluirOuReabrirEixo(eixo: string) {
    const jaConcluido = estado.eixosConcluidos.includes(eixo);
    setEstado((e) => (jaConcluido ? reabrirEixo(e, eixo) : concluirEixo(e, eixo)));
    if (jaConcluido) return;
    const grupo = grupoDoEixo(eixo);
    /**
     * ── ⚠️⚠️⚠️ *"PRÓXIMO"* É **O SEGUINTE NA ORDEM** — corrigido 2026-09-08 ──
     *
     * ⛔ ⛔ A primeira versão pegava *"o primeiro ⛔ não concluído da lista"* —
     * ⛔ e ⛔ isso mandava para **trás**: concluir **B** com **A** em aberto
     * abria **A**. ⚠️ ⛔ O médico concluía um eixo ⛔ e era devolvido ao
     * anterior, ⛔ ou ⛔ não via movimento ⛔ nenhum.
     *
     * ⚠️ ⛔ Achado na inspeção clínica do autor, ⛔ em produção.
     *
     * ⚠️⚠️ ⛔ E ⛔ se ⛔ não houver seguinte ⛔ não concluído, **⛔ nada abre**:
     * ⛔ voltar ao começo ⛔ seria a mesma ida para trás, ⛔ com outro nome.
     */
    const daqui = EIXOS_DA_ESTABILIZACAO.findIndex((x) => x.eixo === eixo);
    const proximo = EIXOS_DA_ESTABILIZACAO
      .slice(daqui + 1)
      .find((x) => !estado.eixosConcluidos.includes(x.eixo))?.grupo;
    setEixosAbertos((a) => {
      const semOAtual = a.filter((g) => g !== grupo);
      return proximo === undefined || semOAtual.includes(proximo)
        ? semOAtual
        : [...semOAtual, proximo];
    });
  }

  /** ⚠️ ⛔ Há algum fato registrado neste eixo? — ⛔ progresso, ⛔ e ⛔ não juízo. */
  function eixoTemDado(eixo: string): boolean {
    const grupo = GRUPOS_A.find((g) => g.id === grupoDoEixo(eixo));
    if (grupo === undefined) return false;
    return camposDoGrupo(grupo).some(
      (c) => valorAtualDoEstado(estado, c.id)?.valor !== undefined
    );
  }

  const sinaisVitais: readonly SinalVital[] = VITAIS.map((v) => ({
    id: v.id,
    rotulo: v.rotulo,
    valor: v.valor,
    /** ⚠️ ⛔ A unidade da imagem ⛔ carrega o **estado** do exame (2026-09-09). */
    unidade: v.unidadeDinamica ?? v.unidade,
    icone: v.icone,
    acento: v.acento,
    onTocar: () => irParaCampo(v.campo),
  }));

  return (
    <ClinicalShell
      header={
        /**
         * ⚠️⚠️ O CABEÇALHO SEGUE A SÍNDROME ABERTA — ⛔ e ⛔ não é fixo (PD-36).
         *
         * ⛔ Ele dizia *"AVC isquêmico agudo"* SEMPRE. Com os destinos
         * hemorrágicos, isso passou a mentir na tela: o médico lia
         * *"AVC isquêmico agudo"* no topo ⛔ e recomendações de **hemorragia**
         * logo abaixo — a contradição mais cara possível num módulo de AVC,
         * porque as duas condutas são **opostas**.
         *
         * ⚠️ Medido na tela em 2026-09-05, ⛔ e ⛔ não deduzido: a captura do
         * catálogo de HIC mostrava o cabeçalho isquêmico truncado por cima.
         */
        <ClinicalHeader
          titulo={TITULO_DA_SINDROME[atual.id] ?? "AVC isquêmico agudo"}
          /**
           * ⚠️⚠️ O ESCOPO SAIU DO CABEÇALHO — 2026-09-06.
           *
           * ⛔ Ele dizia *"Adulto com suspeita de AVC isquêmico agudo"* logo
           * abaixo de *"AVC isquêmico agudo"*: ⛔ a segunda linha **repetia a
           * primeira** ⛔ e acrescentava duas palavras. ⚠️ Nas referências esse
           * lugar carrega **contexto novo** (o box, o setor) — ⛔ e ⛔ não o eco
           * do título.
           *
           * ⛔ Ele ⛔ não sumiu: continua atrás do ⓘ da fase, onde já estava
           * antes de eu trazê-lo para cá.
           */
          /**
           * ⚠️⚠️ *"Atendimento aberto"* ⛔ e ⛔ não *"Atendimento ativo"*: o app
           * ⛔ não sabe se alguém está de fato atendendo — ⛔ ele sabe que **este
           * caso está aberto** nele. ⚠️ Afirmar o que ⛔ não se observa é o erro
           * que **E-23** existe para impedir.
           */
          marcador={`${tr("Atendimento aberto há")} ${abertoHaMin ?? 0} ${tr("min")}`}
          /**
           * ⚠️⚠️⚠️ ⛔ O RELÓGIO ⛔ NÃO ABRE O ATENDIMENTO — 2026-09-07.
           *
           * ⚠️ Decisão do autor, na inspeção clínica: *"isso aqui sai daqui
           * também"*.
           *
           * ⛔ ⛔ *"Definir · Última vez bem"* era a coisa **mais chamativa** da
           * primeira tela — botão azul, ⛔ acima do título —, ⛔ e a cronologia
           * mora na **Avaliação AVC** desde a Fase 4. ⚠️ ⛔ A abertura pergunta
           * *quem é o paciente*; ⛔ o marco temporal vem depois.
           *
           * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO SOME DO ATENDIMENTO: ⛔ o relógio segue no
           * cabeçalho das **seis** superfícies seguintes, ⛔ com a mesma
           * contagem ⛔ e o mesmo toque — ⛔ perder o tempo de vista é o defeito
           * que **§7.8** proíbe, ⛔ e ⛔ ele ⛔ não foi reintroduzido.
           */
          /**
           * ⚠️⚠️ ⛔ E A ESTABILIZAÇÃO ENTROU NA MESMA REGRA — 2026-09-08.
           *
           * ⛔ ⛔ *"Última vez visto bem"* é **cronologia**, ⛔ e a cronologia
           * mora na Avaliação AVC desde a Fase 4. ⚠️ ⛔ Na tela do ABCDE ⛔ ele
           * era o botão mais chamativo — ⛔ azul, ⛔ no cabeçalho — ⛔ acima de
           * via aérea ⛔ e oxigenação.
           *
           * ⚠️ ⛔ O relógio segue nas **cinco** superfícies seguintes, ⛔ com a
           * mesma contagem ⛔ e o mesmo toque (**§7.8**).
           */
          /**
           * ── ⚠️⚠️⚠️ ⛔ E A AVALIAÇÃO AVC ENTROU NA MESMA REGRA — 2026-09-09 ──
           *
           * ⚠️ Decisão do autor: *"na aba neuro podemos tirar isso da barra
           * ⛔ já que tem ⛔ ao longo da aba para preenchimento"*.
           *
           * ⛔ ⛔ ⛔ E ⛔ é a conclusão do próprio raciocínio que trouxe o campo
           * para cá: ⛔ *"a cronologia mora na Avaliação AVC desde a Fase 4"*.
           * ⚠️ ⛔ Se ⛔ ele mora **⛔ aqui**, ⛔ o botão azul no cabeçalho ⛔ é o
           * atalho para ⛔ **⛔ a própria tela** — ⛔ um controle que promete
           * levar ⛔ aonde ⛔ já se está.
           *
           * ⚠️⚠️ ⛔ E **§7.8 ⛔ continua respeitado**: ⛔ perder o tempo de
           * vista ⛔ é o defeito que ⛔ ele proíbe, ⛔ e ⛔ aqui o campo do marco
           * ⛔ está **⛔ na tela**, ⛔ com a contagem ⛔ ao lado. ⛔ O relógio
           * segue no cabeçalho das **quatro** superfícies em que a cronologia
           * ⛔ **⛔ não** mora.
           */
          relogio={
            estado.superficieVista === "paciente" ||
            estado.superficieVista === "estabilizacao" ||
            estado.superficieVista === "neurologico"
              ? undefined
              : {
                  rotulo: "Última vez bem",
                  valor:
                    lkwMin === undefined
                      ? undefined
                      : `${Math.floor(lkwMin / 60)}h${String(lkwMin % 60).padStart(2, "0")}`,
                  onTocar: () => irParaCampo("hora_ultima_vez_bem"),
                }
          }
          onSair={voltarUmPasso}
          /**
           * ⚠️ O rótulo diz **para onde** volta — ⛔ quem lê *"Voltar"* num app
           * de uma rota só ⛔ não sabe se vai perder o atendimento.
           */
          rotuloDeSaida={
            CURTO[trilhaDeSuperficies.current[trilhaDeSuperficies.current.length - 1] ?? ""]?.nome
          }
        />
      }
      navegacao={
        <PhaseNavigation
          /**
           * ⚠️⚠️ A BARRA É A **SEQUÊNCIA OFICIAL** — ⛔ e ⛔ ela vem do conteúdo,
           * ⛔ e ⛔ não de um filtro escrito aqui (**I6**). ⛔ O filtro inline era
           * uma segunda verdade sobre *"qual é o caminho"*.
           *
           * ⚠️ **Correções entra ⛔ só quando é relevante** — decisão **C3**: há
           * bloqueio a corrigir, ⛔ ou já houve ação registrada que precisa
           * continuar visível.
           */
          /**
           * ── ⚠️⚠️⚠️ A BARRA ⛔ NUNCA NEGA ONDE VOCÊ ESTÁ — 2026-09-09 ──────
           *
           * ⚠️ Relato do autor, ⛔ com captura de sete abas ⛔ e **⛔ nenhuma
           * marcada**: *"de acordo com a página que eu estiver aberta essa
           * barra deve marcar para eu saber onde estou"*.
           *
           * ⛔ ⛔ **O caminho que produz isso.** ⛔ Ele tocou *"Abrir
           * Correções"* numa pendência de **hiperglicemia**. ⚠️ Mas
           * hiperglicemia ⛔ **⛔ não é bloqueio** — ⛔ a própria transcrição diz
           * *"não bloqueia a trombólise isoladamente"* —, ⛔ então
           * `bloqueiosCorrigiveis` está vazio, ⛔ e ⛔ sem ação registrada
           * `correcoesEhRelevante` é **falso**. ⛔ A aba ⛔ não entrava na
           * lista, ⛔ e a barra passou a marcar **⛔ nada** ⛔ com ⛔ ele parado
           * ⛔ em cima da tela.
           *
           * ⚠️⚠️ ⛔ E a regra ⛔ não é *"consertar Correções"*: ⛔ **⛔ qualquer**
           * superfície fora da lista faz o mesmo — `laboratorio` faz ⛔ sempre.
           * ⛔ Uma barra que ⛔ não marca ⛔ não é uma barra incompleta: ⛔ ela
           * **⛔ mente** sobre a tela aberta.
           *
           * ⛔ ⛔ Por isso a atual entra por último ⛔ quando ⛔ não estiver lá —
           * ⛔ e ⛔ isso ⛔ não afrouxa a decisão **C3**: ⛔ o critério de
           * *relevância* segue mandando em ⛔ quem **aparece ⛔ sem você estar
           * nela**.
           */
          fases={(() => {
            const listadas = [
              ...SEQUENCIA_OFICIAL,
              ...(correcoesEhRelevante(estado) ? [superficie("correcoes")] : []),
            ];
            return listadas.some((s) => s.id === estado.superficieVista)
              ? listadas
              : [...listadas, superficie(estado.superficieVista)];
          })()
            .map((sup) => ({
              id: sup.id,
              nome: CURTO[sup.id]?.nome ?? sup.titulo,
              icone: (
                <Icone
                  nome={CURTO[sup.id]?.icone ?? "adiante"}
                  tamanho={19}
                  cor={sup.id === estado.superficieVista ? tema.cores.primary : tema.cores.textSecondary}
                />
              ),
            }))}
          atual={estado.superficieVista}
          onAbrir={(id) => abrir(id as SuperficieId)}
          paddingInferior={insets.bottom}
        />
      }
    >
    <ProvedorDeFoco valor={foco}>
    <ScrollView
      ref={rolagem}
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
        * ⚠️⚠️ ESTE `View` EXISTE ⛔ SÓ PARA SER MEDIDO — ⛔ e ⛔ ele ⛔ não desenha
        * ⛔ nada. ⚠️ `contentContainerStyle` ⛔ não dá um nó que se possa medir,
        * ⛔ e é contra o **topo do conteúdo** que a posição de um grupo é
        * calculada.
        */}
      <View ref={noDoConteudo} style={s.medidor} />
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
      {/**
        * ⚠️⚠️ A FAIXA COMPACTA SAIU DAQUI EM 2026-09-05 (PD-37) — ⛔ e ⛔ isso ⛔ não
        * é remoção de informação: ela virou `PatientContext`, **fixo no topo**,
        * fora do ScrollView.
        *
        * ⛔ O defeito que isso corrige: o contexto rolava junto com o conteúdo ⛔ e
        * sumia exatamente quando o médico descia para decidir. ⚠️ Um contexto que
        * some na hora da decisão ⛔ não é contexto — é enfeite do topo.
        *
        * ⚠️ O que ficou aqui é o que ⛔ NÃO cabe numa faixa de uma linha: o
        * bloqueio corrigível (com a frase de D) ⛔ e os auxiliares.
        */}
      {/**
        * ── ⚠️⚠️ ESTABILIZAÇÃO PRIMEIRO — ⛔ E ⛔ ISSO É ORDEM CLÍNICA ────────
        *
        * > *"O princípio de atendimento emergencial é estabilização — ⛔ não
        * > adianta seguir um fluxo bonito ⛔ e bem feito com a deterioração
        * > ⛔ sem intervenção."* — autor, 2026-09-06
        *
        * ⚠️⚠️ ⛔ ELE ESTAVA CORRIGINDO UM ERRO MEU: eu havia posto o card da
        * tomografia como **primeiro bloco do módulo**, ⛔ e com isso a imagem
        * passou a valer mais que a via aérea. ⛔ A regra mestra do app já dizia
        * o contrário desde 2026-08-30 — ⛔ mas era uma faixa cinza **abaixo** do
        * card que a contradizia.
        *
        * ⚠️ Agora ela é o **primeiro bloco**, ⛔ e é uma checagem de verdade:
        * quatro eixos, cada um com o seu estado, ⛔ e cada um tocável.
        *
        * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO TRAVA ⛔ NADA (**E-11**): ordena a **atenção**, ⛔ e
        * ⛔ não o acesso. ⛔ Um portão aqui impediria o médico de registrar a
        * tomografia que já está pronta.
        */}
      {/**
        * ⚠️⚠️ A GRADE CHEIA VIVE EM **ESTABILIZAR** — medido em 2026-09-06.
        *
        * ⛔ Com ela em toda superfície, o conteúdo da fase aberta começava a
        * **1108 px** na Destino — ⛔ 300 px abaixo da dobra de 812. ⚠️ O médico
        * rolava três blocos de contexto antes de chegar ao trabalho da fase que
        * ⛔ ele mesmo escolheu abrir.
        *
        * ⚠️⚠️ ⛔ FORA DE ESTABILIZAR, ⛔ ELA ⛔ NÃO SOME — ⛔ ela **encolhe**, ⛔ e
        * ⛔ só quando há ameaça registrada. ⚠️ *"4 a avaliar"* na tela do NIHSS é
        * ruído; *"PA acima da meta"* ⛔ nunca é.
        */}
      {estado.superficieVista === "estabilizacao" ? (
      <View style={s.cartao} testID="avc-ameacas-imediatas">
        <CardHeader
          titulo={PRIORIDADE_A.titulo}
          aoLado={
            haAmeacaAberta(ameacas) ? (
              <Text style={s.ameacaAviso}>{tr("Ameaça registrada")}</Text>
            ) : (
              <CardNota>
                {eixosNaoAvaliados(ameacas) === 0
                  ? tr("Os quatro eixos avaliados")
                  : `${eixosNaoAvaliados(ameacas)} ${tr("a avaliar")}`}
              </CardNota>
            )
          }
        />
        <Text style={s.ameacaFrase}>{tr(PRIORIDADE_A.frase)}</Text>
        <View style={s.ameacas}>
          {ameacas.map((a) => (
            <Pressable
              key={a.id}
              /**
               * ── ⚠️⚠️⚠️ O TILE **ABRE O EIXO** — 2026-09-08 ────────────────
               *
               * ⛔ ⛔ Ele rolava até o primeiro campo do eixo, ⛔ numa lista que
               * ⛔ já estava inteira na tela: ⛔ *"todos direcionam para o mesmo
               * lugar"*. ⚠️ ⛔ Agora ⛔ ele faz o que a rolagem ⛔ não faz.
               *
               * ⚠️⚠️ ⛔ E ⛔ TOCAR ⛔ AQUI ⛔ **⛔ NUNCA** CONCLUI: ⛔ abrir é UI,
               * ⛔ concluir é progresso, ⛔ e o botão de concluir mora **dentro**
               * do eixo. ⛔ Misturar os dois faria o app afirmar que o médico
               * avaliou o que ⛔ ele ⛔ só abriu.
               *
               * ⚠️ ⛔ Eixo ⛔ sem grupo (⛔ nenhum hoje) cairia na rolagem
               * antiga — ⛔ e ⛔ não num gesto morto.
               */
              onPress={() => {
                const grupo = grupoDoEixo(a.id);
                /** ⚠️ Ver `BLOQUEIO_DO_EIXO`: o porquê mora lá, fora do JSX. */
                const bloqueio = BLOQUEIO_DO_EIXO[a.id];
                const temTratamentoNaTela =
                  bloqueio !== undefined && bloqueios.some((b) => b.id === bloqueio);
                if (a.estado === "ameaca" && temTratamentoNaTela) {
                  if (grupo !== undefined && !eixosAbertos.includes(grupo)) alternarEixo(grupo);
                  rolarAte(`tratamento_${bloqueio}`);
                  return;
                }
                if (a.estado === "ameaca" && a.leva !== undefined) {
                  abrir(a.leva as SuperficieId);
                  return;
                }
                if (grupo === undefined) irParaCampo(a.campo);
                else alternarEixo(grupo);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${tr(a.nome)}: ${tr(
                ESTADOS[estadoClinicoDoEixo(a.estado)].rotulo
              )}`}
              testID={`avc-ameaca-${a.id}`}
              style={[
                s.ameaca,
                a.estado === "ameaca" && s.ameacaAtiva,
              ]}
            >
              <View style={s.ameacaTopo}>
                {/**
                  * ⚠️⚠️ **FORMA**, ⛔ e ⛔ não ⛔ só cor (**E-15**): ✓ avaliado ·
                  * ! ameaça · ○ ⛔ ainda ⛔ não avaliado. ⛔ Quem ⛔ não distingue
                  * as cores lê o mesmo.
                  */}
                <Text
                  style={[
                    s.ameacaMarca,
                    a.estado === "ameaca" && s.ameacaMarcaAtiva,
                    a.estado === "sem_ameaca" && s.ameacaMarcaOk,
                  ]}
                >
                  {/**
                    * ⚠️⚠️ O SÍMBOLO VEM DO **ALFABETO ÚNICO** — 2026-09-06,
                    * decisão **C2**.
                    *
                    * ⛔ Ele estava escrito à mão aqui ⛔ e na faixa compacta, ⛔ e
                    * ⛔ nada garantia que os dois concordassem. ⚠️ Agora quem
                    * traduz é o núcleo, ⛔ e quem desenha é `ESTADOS`.
                    */}
                  {ESTADOS[estadoClinicoDoEixo(a.estado)].simbolo}
                </Text>
                <Text style={[s.ameacaLetra, { color: tema.cores[COR_DO_EIXO[a.id] ?? "primary"] }]}>
                  {a.letra}
                </Text>
              </View>
              <Text style={s.ameacaNome} numberOfLines={2}>{tr(a.nome)}</Text>
              {/**
                * ⚠️⚠️ O NÚMERO AO LADO DO JULGAMENTO — ⛔ e ⛔ não num card à
                * parte. ⚠️ Com PA 198/112, o médico lia o **valor** num bloco ⛔ e
                * *"acima da meta pré-trombólise"* noutro, separados pelo card da
                * tomografia: ⛔ dois blocos para um fato só.
                */}
              {a.valor === undefined ? null : (
                <View style={s.ameacaMedida}>
                  <Text style={s.ameacaValor}>{a.valor}</Text>
                  {a.unidade ? <Text style={s.ameacaUnidade}>{tr(a.unidade)}</Text> : null}
                </View>
              )}
              {/**
                * ⚠️ ⛔ Ausência é **neutra** ⛔ e escrita — ⛔ nunca âmbar, ⛔ nunca
                * vazia (**E-37**).
                */}
              {/**
                * ── ⚠️⚠️⚠️ ⛔ SEM CORTE — 2026-09-08, revisão em 375 px ────────
                *
                * ⛔ ⛔ Havia `numberOfLines={2}`, ⛔ e a frase de C precisava de
                * **três**: *"a fonte diz para baixar a pressão antes de
                * iniciar a trombólise, para…"* — ⛔ o corte comia
                * ⛔ **«reduzir complicações hemorrágicas»**, ⛔ que é o
                * **porquê** da conduta.
                *
                * ⚠️⚠️ ⛔ Medido, ⛔ e ⛔ não olhado: `scrollHeight` 102 contra
                * `clientHeight` 34.
                *
                * ⚠️ ⛔ Frase de fonte ⛔ não se trunca — ⛔ é a mesma regra do
                * *"nome clínico ⛔ nunca trunca"*: ⛔ quem cede espaço é a
                * moldura, ⛔ e ⛔ não o que a fonte diz. ⛔ O tile cresce, ⛔ e a
                * grade acompanha.
                */}
              <Text style={s.ameacaEstado}>
                {/**
                  * ── ⚠️⚠️ CONCLUÍDO ⛔ E ⛔ SEM DADO — ajuste do autor, 2026-09-07
                  *
                  * ⛔ O card dizia **"⛔ Não avaliado"** ⛔ e **"Avaliação
                  * concluída"** ⛔ uma linha abaixo da outra. ⚠️ ⛔ As duas são
                  * verdadeiras — ⛔ eixos diferentes —, ⛔ mas juntas ⛔ se leem
                  * como contradição.
                  *
                  * ⚠️⚠️ ⛔ E A FRASE ESCOLHIDA FALA DO **REGISTRO**, ⛔ e ⛔ NUNCA
                  * DO PACIENTE. ⛔ *"Sem alterações"* ⛔ ou *"avaliado ⛔ sem
                  * achados"* seriam **afirmação** — ⛔ exatamente o defeito da
                  * PA 80/46 desenhada com ✓, ⛔ que o autor apontou em 09-06.
                  * ⛔ *"⛔ Sem dados clínicos registrados"* diz ⛔ só o que houve:
                  * ⛔ ninguém registrou ⛔ nada.
                  *
                  * ⚠️ ⛔ E ⛔ isto é **⛔ só apresentação**: o estado clínico
                  * continua `ausente` no motor, ⛔ o símbolo continua `—`, ⛔ e
                  * ⛔ nenhuma derivação percebe diferença.
                  */}
                {a.achado !== undefined
                  ? tr(a.achado)
                  : a.estado === "nao_avaliado" && estado.eixosConcluidos.includes(a.id)
                    ? tr("Sem dados clínicos registrados")
                    : tr(ESTADOS[estadoClinicoDoEixo(a.estado)].rotulo)}
              </Text>
              {/**
                * ── ⚠️⚠️ O PROGRESSO, ⛔ E ⛔ ELE ⛔ NÃO DISPUTA COM O ESTADO ───
                *
                * ⚠️ Decisão do autor (**item 7**): *"O card deve mostrar
                * prioritariamente o estado clínico mais relevante. O progresso
                * pode aparecer em detalhe secundário."*
                *
                * ⚠️⚠️ ⛔ E ⛔ ELES ⛔ NÃO SE MISTURAM: *"avaliado"* ⛔ não quer
                * dizer *"normal"*. ⛔ Um B **concluído** com hipoxemia ativa
                * continua mostrando `!` — ⛔ a marca em cima é o **estado
                * clínico**, ⛔ e ⛔ esta linha é ⛔ só o progresso.
                */}
              {/**
                * ⚠️⚠️ ⛔ **⛔ SÓ QUANDO CONCLUÍDO** — ⛔ e ⛔ isso nasceu de olhar a
                * tela renderizada.
                *
                * ⛔ A primeira versão mostrava *"Avaliado"* ⛔ ou *"A avaliar"*
                * sempre, ⛔ e o resultado foi um card dizendo **"⛔ Não
                * avaliado"** (estado clínico) ⛔ e **"Avaliado"** (progresso)
                * ⛔ uma linha abaixo da outra. ⚠️ ⛔ Lidas juntas, ⛔ as duas
                * parecem contradição — ⛔ e o médico ⛔ não tem por que saber
                * que ⛔ elas falam de eixos diferentes.
                *
                * ⚠️ ⛔ Quando ⛔ ainda ⛔ não foi concluído, ⛔ o botão logo abaixo
                * já diz *"Concluir"* — ⛔ e ⛔ repetir isso em prosa é ruído.
                */}
              {/**
                * ── ⚠️⚠️⚠️ PROGRESSO ⛔ EM LINHA PRÓPRIA — 2026-09-08 ─────────
                *
                * ⚠️ Exigência do autor: *"⛔ não usar «concluído» como sinônimo
                * de normal/favorável (…) ⛔ se o eixo tiver risco, o símbolo/
                * estado clínico continua vindo do motor"*.
                *
                * ⛔ ⛔ Por isso ⛔ ele ⛔ nunca substitui a linha de cima: ⛔ a
                * clínica é do motor, ⛔ e ⛔ esta ⛔ aqui diz ⛔ apenas em que pé
                * está o **trabalho**.
                *
                * ⛔ ⛔ *"Em andamento"* ⛔ não é juízo: é *há fato registrado
                * ⛔ neste eixo ⛔ e ⛔ ele ⛔ não foi dado por concluído*.
                */}
              {/**
                * ── ⚠️⚠️⚠️ A CONDUTA, ⛔ NO PRÓPRIO CARD — 2026-09-12 ─────────
                *
                * ⛔ Relato do autor: *"tenho 2 áreas que falam praticamente a
                * mesma coisa"* — ⛔ o card dizia o **achado** ⛔ e um bloco
                * abaixo (*"O que fazer agora"*) dizia a **conduta**: ⛔ as
                * duas metades da **mesma** leitura, ⛔ em dois lugares.
                *
                * ⚠️ ⛔ Agora o card resume ⛔ inteiro — achado ⛔ e conduta —,
                * ⛔ e o bloco de baixo saiu. ⛔ A frase é da fonte (**E-31**):
                * ⛔ a tela ⛔ não redige conduta.
                */}
              {a.estado === "ameaca" && a.conduta !== undefined ? (
                <Text style={s.ameacaConduta} testID={`avc-ameaca-conduta-${a.id}`}>
                  {tr(a.conduta)}
                </Text>
              ) : null}
              {estado.eixosConcluidos.includes(a.id) ? (
                <Text style={s.ameacaProgresso} testID={`avc-ameaca-progresso-${a.id}`}>
                  {tr("Avaliação concluída")}
                </Text>
              ) : eixoTemDado(a.id) ? (
                <Text style={s.ameacaProgresso} testID={`avc-ameaca-progresso-${a.id}`}>
                  {tr("Em andamento")}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>

        {/**
          * ── ⚠️⚠️ ⛔ CONCLUIR ⛔ E REABRIR — workflow, ⛔ e ⛔ NUNCA fato ──────
          *
          * ⚠️ Decisão do autor (**item 6**): *"'Concluir eixo' é estado de
          * workflow/UI. ⛔ Não deve virar diagnóstico, ausência de alteração,
          * fato clínico ⛔ ou derivação terapêutica."*
          *
          * ⛔ ⛔ Por isso ⛔ ele ⛔ **não** escreve na trilha: `concluirEixo`
          * mexe ⛔ só em `eixosConcluidos`, ⛔ e há prova comparando `fatos`
          * antes ⛔ e depois.
          *
          * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO BLOQUEIA ⛔ NADA (**item 3**): ⛔ qualquer eixo
          * abre a qualquer momento. ⛔ O destaque do próximo é **orientação**,
          * ⛔ e ⛔ não portão — *"se chegar um paciente com choque evidente,
          * deve poder acessar C imediatamente"*.
          */}
        {/**
          * ── ⚠️⚠️⚠️ A FILEIRA DE *"CONCLUIR"* SAIU DAQUI — 2026-09-08 ────────
          *
          * ⚠️ Decisão do autor: *"o botão `Concluir` fica dentro do próprio
          * eixo, no final do bloco"*.
          *
          * ⛔ ⛔ Cinco botões no topo, longe do que concluíam, eram a mesma
          * doença dos tiles: **outro caminho para a mesma coisa**, ⛔ e um
          * caminho que dava para tocar ⛔ sem ter olhado o eixo.
          *
          * ⚠️ ⛔ O `testID` mudou de `avc-concluir-<eixo>` para
          * `avc-eixo-concluir-<grupo>`: ⛔ o botão ⛔ agora é **do bloco**, ⛔ e
          * a identidade acompanha o dono.
          */}

        {/**
          * ⚠️⚠️ O PRÓXIMO EIXO — ⛔ **destacado, ⛔ e ⛔ não aberto sozinho**.
          *
          * ⚠️ *"⛔ não abrir automaticamente ⛔ sem ação do usuário; ⛔ não
          * impedir retorno ao eixo anterior"* (**item 4**).
          */}
        {/**
          * ── ⚠️⚠️⚠️ ⛔ *"PRÓXIMO:"* SAIU — 2026-09-08 ─────────────────────────
          *
          * ⚠️ Decisão do autor: *"remover o botão/linha `Próximo`, porque vira
          * redundante"*.
          *
          * ⛔ ⛔ Com o acordeão, **quem diz qual é o próximo é o eixo que está
          * aberto** — ⛔ e concluir um já abre o seguinte. ⛔ Uma terceira voz
          * dizendo a mesma coisa era ⛔ mais um caminho para o mesmo lugar,
          * ⛔ que é ⛔ exatamente o defeito que esta mudança fecha.
          */}

        {/**
          * ── ⚠️⚠️⚠️ ⛔ *"O QUE FAZER AGORA"* SAIU — 2026-09-12 ──────────────
          *
          * ⛔ Relato do autor: *"tenho 2 áreas que falam praticamente a mesma
          * coisa … podemos deixar só a parte superior clicável e funcional"*.
          * ⚠️ ⛔ E ⛔ era isso mesmo: ⛔ o card acima mostrava `achado`, ⛔ este
          * bloco mostrava `conduta` — ⛔ as duas metades da **mesma** leitura,
          * ⛔ repetindo nome ⛔ e letra do eixo.
          *
          * ⚠️ ⛔ A conduta ⛔ não se perdeu: ⛔ ela subiu para o card
          * (`avc-ameaca-conduta-*`), ⛔ e o toque leva ⛔ ao tratamento.
          */}
      </View>
      ) : estado.superficieVista === "paciente" ? (
        /**
         * ⚠️⚠️⚠️ ⛔ NA PRIMEIRA TELA, ⛔ NEM A FAIXA COMPACTA — 2026-09-07.
         *
         * ⚠️ Decisão do autor, na inspeção clínica: *"isso aqui também deve
         * estar na página de estabilização"*.
         *
         * ⛔ ⛔ Os cinco eixos A/B/C/D/E são o trabalho da **Estabilização**.
         * ⚠️ Na abertura ⛔ eles ⛔ **⛔ não têm o que resumir** — ⛔ nada foi
         * avaliado ⛔ ainda —, ⛔ e cinco cards de *"— não avaliado"* ocupavam
         * o topo antes da primeira pergunta sobre **quem é o paciente**.
         *
         * ⚠️⚠️ ⛔ E O CONTEXTO PERSISTENTE ⛔ NÃO SE PERDE: ⛔ ele reaparece nas
         * **seis** superfícies seguintes, ⛔ como já reaparecia — ⛔ PA ⛔ e
         * glicemia ⛔ não somem do atendimento.
         */
        null
      ) : (
        /**
         * ⚠️⚠️ A FORMA COMPACTA CARREGA **OS QUATRO EIXOS**, ⛔ e ⛔ não ⛔ só as
         * ameaças — mudado em 2026-09-06.
         *
         * ⛔ Mostrando ⛔ só as ameaças, PA ⛔ e glicemia **sumiam** das outras
         * fases assim que saíram do card de vitais. ⚠️ Este bloco é o contexto
         * persistente do A/B/C/D: ⛔ ele encolhe, ⛔ e ⛔ não desaparece.
         *
         * ⚠️ Cada chip carrega **símbolo + letra + valor** — ⛔ e a cor ⛔ nunca
         * decide sozinha (**E-15**).
         */
        <View style={s.eixosCompactos} testID="avc-ameacas-imediatas">
          {ameacas.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => irParaCampo(a.campo)}
              accessibilityRole="button"
              accessibilityLabel={`${tr(a.nome)}: ${
                a.valor ?? tr(ESTADOS[estadoClinicoDoEixo(a.estado)].rotulo)
              }`}
              testID={`avc-ameaca-${a.id}`}
              style={[s.eixoChip, a.estado === "ameaca" && s.ameacaAtiva]}
            >
              <Text
                style={[
                  s.ameacaMarca,
                  a.estado === "ameaca" && s.ameacaMarcaAtiva,
                  a.estado === "sem_ameaca" && s.ameacaMarcaOk,
                ]}
              >
                {ESTADOS[estadoClinicoDoEixo(a.estado)].simbolo}
              </Text>
              {/** ⚠️ Mesma cor de identidade da grade cheia — ⛔ e ⛔ não cinza. */}
              <Text style={[s.ameacaLetra, { color: tema.cores[COR_DO_EIXO[a.id] ?? "primary"] }]}>
                {a.letra}
              </Text>
              <Text style={s.eixoChipValor} numberOfLines={1}>
                {a.valor ?? tr(a.nome)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/**
        * ── ⚠️⚠️ A IMAGEM VEM **DEPOIS** DA ESTABILIZAÇÃO ────────────────────
        *
        * ⚠️ Pedido do autor, 2026-09-06: *"TEM QUE TER DESTAQUE TC DE CRÂNEO
        * SEM CONTRASTE O MAIS RÁPIDO POSSÍVEL"*. ⛔ Na captura, *"Tomografia de
        * crânio"* era **uma de três pendências visualmente idênticas** — mesmo
        * peso que *"Registrar o exame neurológico"*, ⛔ que ⛔ não decide se o
        * paciente pode receber trombolítico.
        *
        * ⚠️ O destaque tem fonte: **F-16, rec. 1 · COR 1 · LOE A** — *"emergent
        * brain imaging… on initial evaluation… before initiating reperfusion
        * interventions"*. ⛔ Ele ⛔ não é ênfase inventada pela tela.
        *
        * ⚠️⚠️ ⛔ E ELE SOME SOZINHO: registrada a imagem, `destinoDaImagem`
        * passa a existir ⛔ e o bloco sai. ⛔ Um aviso que ⛔ não sabe desaparecer
        * vira paisagem, ⛔ e ⛔ deixa de ser lido.
        *
        * ⛔ ⛔ SEM CRONÔMETRO ⛔ E ⛔ SEM META: a fonte diz *"as rapidly as possible
        * (eg, within 25 minutes)"* sobre **protocolo institucional**, ⛔ e ⛔ não
        * sobre este paciente (**E-45**, **E-31**).
        */}
      {/**
        * ⚠️⚠️ MESMA REGRA DA ESTABILIZAÇÃO: o card **cheio** vive onde ele é o
        * trabalho — Estabilizar ⛔ e Imagem. ⚠️ Nas outras fases ele vira **uma
        * linha**, ⛔ e ⛔ não some: a prioridade continua declarada, ⛔ e continua
        * a um toque.
        *
        * ⛔ Um card de 200 px repetido em oito superfícies ⛔ não é ênfase — ⛔ é
        * o que faz o médico aprender a rolar por cima dele.
        */}
      {destinoDaImagem(estado) !== undefined ? null
        /**
         * ⚠️⚠️ ⛔ NA PRÓPRIA SUPERFÍCIE IMAGEM ⛔ ELE ⛔ NÃO APARECE — corrigido em
         * 2026-09-06.
         *
         * ⛔ Relato do autor: *"clico em abrir imagem ⛔ e aparece o mesmo card na
         * parte superior ⛔ e também ⛔ não abre ⛔ nada"*. ⚠️ Ele tocou o botão,
         * chegou onde o botão prometia — ⛔ e encontrou **o mesmo card
         * idêntico** no topo, mandando ir para onde ele já estava.
         *
         * ⛔ Um aviso que sobrevive à própria resolução ⛔ não é ênfase: é o que
         * faz o médico concluir que o toque ⛔ não funcionou.
         */
        : estado.superficieVista === "imagem" ? null
        /**
         * ⚠️⚠️ ⛔ E EM **PACIENTE** TAMBÉM ⛔ NÃO — 2026-09-07.
         *
         * ⛔ ⛔ A primeira tela do atendimento abria com *"Solicitar a
         * tomografia"* por cima dos dados basais. ⚠️ ⛔ A prioridade da imagem
         * é real, ⛔ e ⛔ ela ⛔ não é a pergunta desta tela: ⛔ aqui se responde
         * **quem é o paciente**.
         *
         * ⚠️ ⛔ Ela ⛔ não some do atendimento — ⛔ aparece nas seis superfícies
         * seguintes, ⛔ como já aparecia.
         */
        /**
         * ── ⚠️⚠️⚠️ ⛔ E SAIU DA **ESTABILIZAÇÃO** TAMBÉM — 2026-09-08 ────────
         *
         * ⚠️ Decisão do autor, na inspeção clínica: *"Estabilização deve
         * conter ⛔ apenas dados ⛔ e condutas de estabilização imediata"*.
         *
         * ⛔ ⛔ O card grande **⛔ era exclusivo desta tela** — ⛔ com
         * *"Solicitar a tomografia"* ⛔ e *"Já foi feita"* por cima do ABCDE.
         * ⚠️ ⛔ Os dois botões ⛔ nunca fizeram ⛔ nada **aqui**: ⛔ um leva ao
         * campo do pedido ⛔ e o outro à Investigação — ⛔ que é onde a imagem
         * mora, ⛔ e onde ⛔ eles continuam inteiros.
         *
         * ⚠️ ⛔ A prioridade ⛔ não some do atendimento: ⛔ a linha compacta
         * segue nas outras cinco superfícies.
         */
        : estado.superficieVista === "paciente" ? null
        : estado.superficieVista === "estabilizacao" ? null
        : (
        <Pressable
          onPress={() => abrir("imagem")}
          accessibilityRole="button"
          accessibilityLabel={tr(PRIORIDADE_DA_IMAGEM.chamada)}
          testID="avc-prioridade-imagem"
          style={[
            s.imagemLinha,
            situacaoDoPedido === "resultado_disponivel" ? s.imagemLinhaResolvida : null,
          ]}
        >
          {/**
            * ⚠️ ⛔ Vermelho ⛔ é cobrança. ⛔ Com o resultado ⛔ já registrado
            * ⛔ nada está pendente — ⛔ e a cor ⛔ tem de dizer ⛔ o mesmo que a
            * palavra (**E-15**).
            */}
          <Icone
            nome="imagem"
            tamanho={18}
            cor={
              situacaoDoPedido === "resultado_disponivel"
                ? tema.cores.textSecondary
                : tema.cores.critical
            }
          />
          <Text style={s.imagemLinhaTexto} numberOfLines={2}>
            {tr(PRIORIDADE_DA_IMAGEM.titulo)}
          </Text>
          {/**
            * ── ⚠️⚠️⚠️ ⛔ O `testID` DA AÇÃO ATRAVESSOU — 2026-09-08 ──────────
            *
            * ⛔ ⛔ Ele vivia no **card grande**, ⛔ que era exclusivo da
            * Estabilização ⛔ e ⛔ saiu de lá. ⚠️ ⛔ A **frase** que ele carrega —
            * *"Solicitar"* × *"Registrar o exame"* — ⛔ é a mesma, ⛔ vem da
            * mesma `ACAO_DA_SITUACAO`, ⛔ e ⛔ é ela que as travas medem.
            *
            * ⚠️ ⛔ Mudar o `testID` junto com o lugar apagaria a continuidade da
            * garantia: ⛔ pareceria trava nova, ⛔ e é a **mesma**.
            */}
          <Text
            style={[
              s.imagemLinhaAcao,
              situacaoDoPedido === "resultado_disponivel" ? s.imagemLinhaAcaoResolvida : null,
            ]}
            testID="avc-prioridade-imagem-acao"
          >
            {tr(ACAO_DA_SITUACAO[situacaoDoPedido])}
          </Text>
        </Pressable>
      )}

      {/**
        * ── ⚠️⚠️ SINAIS VITAIS — ⛔ DEPOIS da estabilização ⛔ e da imagem ─────
        *
        * ⛔ **Ele era o primeiro bloco, ⛔ e ⛔ isso estava errado.** Ao abrir o
        * atendimento ⛔ nenhum vital foi medido: a grade mostrava **quatro
        * travessões** ocupando o topo da tela — ⛔ um terço da primeira dobra
        * para dizer ⛔ nada.
        *
        * ⚠️ Ela é **leitura**, ⛔ e ⛔ não ação: ganha valor quando há valor.
        * ⛔ O que precisa estar em cima é o que se **faz** — ameaças imediatas,
        * ⛔ e depois a imagem.
        *
        * ⚠️⚠️ ⛔ E O RELÓGIO ⛔ NÃO DEPENDE DELA: ele vive no **cabeçalho fixo**,
        * fora do ScrollView. ⛔ Descer a grade ⛔ não esconde o tempo (§7.8).
        */}
      {/**
        * ⚠️⚠️ ⛔ O RESUMO ⛔ NÃO ABRE O ATENDIMENTO — 2026-09-07.
        *
        * ⛔ ⛔ *"Escala e imagem"* mostrava NIHSS ⛔ e imagem **na primeira
        * tela**, ⛔ antes de existir escala ⛔ ou imagem. ⚠️ ⛔ Um resumo de
        * ⛔ nada, ocupando a abertura.
        */}
      {/**
        * ⚠️⚠️ ⛔ E DA **ESTABILIZAÇÃO** TAMBÉM — 2026-09-08. ⛔ NIHSS ⛔ e imagem
        * são resumo de **duas fases adiante**; ⛔ na tela do ABCDE ⛔ eles
        * competem com o que mata em minutos.
        */}
      {/**
        * ── ⚠️⚠️⚠️ ⛔ E AGORA A REGRA É **⛔ TER CONTEÚDO** — 2026-09-09 ───────
        *
        * ⚠️ Relato do autor, ⛔ em produção: *"⛔ não estou achando adequado
        * porque ⛔ nessa tela ⛔ ainda ⛔ **⛔ não se calculou NIHSS** ⛔ e
        * ⛔ também ⛔ **⛔ não tem resultado de imagem**. ⛔ A imagem ⛔ aqui
        * ⛔ está sendo **solicitada**"*.
        *
        * ⛔ ⛔ ⛔ **⛔ As duas remoções anteriores ⛔ trataram o sintoma.**
        * ⛔ Em 2026-09-07 ⛔ ele saiu ⛔ da abertura; ⛔ em 2026-09-08, ⛔ da
        * Estabilização. ⚠️ ⛔ As duas vezes ⛔ o motivo escrito ⛔ foi ⛔ o
        * **⛔ mesmo** — *"um resumo ⛔ de ⛔ nada"* —, ⛔ e ⛔ as duas vezes
        * ⛔ a regra ⛔ foi presa ⛔ a ⛔ **⛔ qual tela**, ⛔ e ⛔ não ⛔ a
        * ⛔ **⛔ ter o que resumir**. ⛔ Por isso ⛔ ele reapareceu ⛔ na
        * terceira.
        *
        * ⚠️⚠️ ⛔ É ⛔ a mesma regra ⛔ que o autor fixou ⛔ para o
        * `AvisoDeApoioClinico` ⛔ na véspera: ⛔ **⛔ não mostrar saída
        * ⛔ onde ⛔ não há saída**. ⛔ Um resumo ⛔ com dois travessões
        * ⛔ ocupa ⛔ o lugar ⛔ da tomografia ⛔ que ⛔ está sendo pedida.
        *
        * ⛔ ⛔ ⛔ **⛔ E ⛔ nada fica inalcançável:** ⛔ NIHSS mora ⛔ na
        * Avaliação AVC ⛔ e a imagem ⛔ na Investigação, ⛔ ambas ⛔ na barra
        * de fases. ⛔ O resumo ⛔ é ⛔ **⛔ atalho**, ⛔ e ⛔ não ⛔ porta.
        */}
      {estado.superficieVista === "paciente" ||
      estado.superficieVista === "estabilizacao" ||
      /** ⛔ Nada medido ⛔ ainda: ⛔ o resumo ⛔ não tem ⛔ o que resumir. */
      sinaisVitais.every((v) => v.valor === undefined) ? null : (
      <View style={s.cartao} testID="avc-resumo">
        <CardHeader
          /**
           * ⚠️ O título mudou junto com o conteúdo: com PA ⛔ e glicemia nos
           * eixos, *"sinais vitais"* deixaria de descrever o que o card mostra.
           */
          titulo="Escala e imagem"
          aoLado={
            /**
             * ⚠️⚠️ SAÍDA DECLARADA (**E-09**), ⛔ e ⛔ não um interruptor.
             *
             * ⛔ Com a expansão removida, um botão que alterna ⛔ nada seria um
             * controle mentiroso. ⚠️ Aqui ele **nomeia para onde leva** — o
             * painel do paciente, onde moram identificação, peso ⛔ e alergias.
             *
             * ⚠️ O `testID` é o antigo de propósito: um cenário clínico o usa
             * para provar que o estado sobrevive a sete trocas de superfície, ⛔ e
             * ⛔ isso ⛔ continua sendo exatamente o que o toque faz.
             */
            <LinkAction
              rotulo="Ver paciente"
              onPress={() => abrir("paciente")}
              testID="avc-cockpit-faixa"
            />
          }
        />
        <VitalGrid vitais={sinaisVitais} />
      </View>
      )}

      <View style={s.cockpit} testID="avc-cockpit-detalhe">
        {/**
          * ⚠️⚠️ O BLOQUEIO CORRIGÍVEL VEM DE **D**, com a frase DELA.
          *
          * ⛔ A Superfície A registra a medida ⛔ e ⛔ não a interpreta: o
          * significado pré-IVT é de D. ⚠️ Aqui o cockpit **cita** D — ⛔ e ⛔ não
          * repete o limiar por conta própria.
          */}
        {/**
          * ⚠️⚠️ O BLOQUEIO CORRIGÍVEL É O **CARD ÂMBAR** DAS REFERÊNCIAS — ⛔ e
          * ⛔ não mais uma linha de texto com um link no fim (2026-09-06).
          *
          * ⚠️ É exatamente o bloco *"Antes da trombólise: PA deve estar <
          * 185/110"* + botão *"Controle pressórico"* que o autor mandou. ⛔ A
          * lógica já existia ⛔ e já dizia a frase certa; ⛔ o que faltava era a
          * forma que faz o médico **ver** que há algo a corrigir antes de
          * seguir.
          *
          * ⚠️ `atencao`, ⛔ e ⛔ não `risco`: ⛔ há conserto, ⛔ e o conserto está no
          * botão. ⛔ Vermelho aqui gastaria o alarme que a tela precisa guardar
          * para o que ⛔ não tem saída.
          */}
        {bloqueios.map((b) => (
          <WarningCard
            key={b.id}
            nivel="atencao"
            titulo={b.formulacao}
            testID={`avc-cockpit-bloqueio-${b.id}`}
            acao={
              <PrimaryAction
                rotulo={b.id === "pressao_acima_da_meta" ? "Corrigir a pressão arterial" : "Corrigir a glicemia"}
                onPress={() => irAteOndeResolve("correcoes", `correcao_${b.id}`)}
                testID={`avc-cockpit-bloqueio-acao-${b.id}`}
              />
            }
          />
        ))}

        {/**
          * ⚠️⚠️ AUXILIARES A **UM** TOQUE — ⛔ e ⛔ não dentro de um "Mais".
          *
          * ⛔ Peso, alergia, anticoagulante ⛔ e exames são acesso frequente
          * demais para virarem navegação de segundo nível (autor, 2026-09-01).
          * ⚠️ Correções entra aqui como acesso discreto; quando há bloqueio
          * corrigível, ela também aparece **contextual**, acima.
          */}
        {/**
          * ── ⚠️⚠️ O *"ACESSO RÁPIDO"* FOI REMOVIDO — 2026-09-06, decisão **C3**
          *
          * ⛔ Ele era um **segundo caminho**: três cartões (Paciente,
          * Laboratório, Correções) ao lado da barra de fases, competindo com
          * ela. ⚠️ A §61 do briefing é explícita: *"se houver qualquer outro
          * caminho concorrente visível, a refatoração ⛔ ainda ⛔ não está
          * concluída"*.
          *
          * ⚠️⚠️ ⛔ E ⛔ NADA FICOU INALCANÇÁVEL — ⛔ que é a única razão pela qual
          * remover é seguro:
          *
          *   ⛔ **Paciente** virou a **primeira fase** da barra;
          *   ⛔ **Laboratório** passou a viver dentro de **Investigação**, junto
          *     com a imagem, ⛔ como o **§16** pede;
          *   ⛔ **Correções** é alcançada **pelo problema que a exige** — que é
          *     o fluxo condicional descrito em **C3**, ⛔ e ⛔ não uma fase fixa
          *     que ficaria vazia na maioria dos atendimentos.
          */}

        {/**
          * ⚠️⚠️ A EXPANSÃO DO COCKPIT FOI **REMOVIDA** em 2026-09-06 — ⛔ e
          * ⛔ nada se perdeu.
          *
          * ⛔ Ela mostrava três coisas: a última vez visto bem, o tempo de
          * atendimento ⛔ e a lista de vitais. ⚠️ As duas primeiras subiram para
          * o **cabeçalho fixo**; a terceira virou a **grade de tiles** acima.
          * ⛔ Mantê-la seria exibir os mesmos quatro números duas vezes na
          * mesma tela — a duplicação de contexto que o próprio template proíbe.
          */}
      </View>

      {/* ── SUPERFÍCIE ABERTA ──────────────────────────────────────────────
          ⚠️ Esqueleto declarado: a tela DIZ que não há conteúdo, em vez de
          parecer completa e vazia. Vacuidade silenciosa é o que a casa proíbe. */}
      {/**
        * ⚠️⚠️ O CARD EXTERNO SAIU EM 2026-09-05 (PD-37) — ⛔ e ⛔ ele era a origem
        * do *card dentro de card dentro de card*.
        *
        * ⛔ Toda superfície vinha embrulhada num `surface` com borda ⛔ e padding;
        * dentro dele, cada grupo era outro card; dentro do grupo, cada campo era
        * mais um. ⚠️ Três molduras para dizer uma coisa só.
        *
        * ⚠️ Agora o conteúdo vive **direto sobre a tela**, ⛔ e o agrupamento vem
        * de espaço, título ⛔ e alinhamento. Card ⛔ só onde há unidade clínica
        * independente — decisão do autor: *"o objetivo é reduzir o número de
        * caixas, ⛔ não trocar caixas com borda por caixas com fundo"*.
        */}
      <View style={s.superficie} testID={`avc-superficie-${atual.id}`}>
        <View style={s.superficieLinha}>
          <View style={s.superficieTituloBloco}>
            {/**
              * ⚠️ O nome CURTO, o mesmo da barra. ⛔ "Entrada e estabilização"
              * aqui ⛔ e "Estabilizar" ali eram dois nomes para a mesma coisa.
              */}
            {/**
              * ⚠️ *"O que falta AQUI"* — ⛔ e ⛔ não o total do atendimento, que
              * já vive no bloco de pendências no fim da tela.
              */}
            <ScreenHeader
              nome={CURTO[atual.id]?.nome ?? atual.titulo}
              /**
               * ⚠️ O escopo entra ⛔ só onde **acrescenta**: em HIC ⛔ e HSA a
               * população é outra (*"hemorragia intracerebral espontânea"*),
               * ⛔ e ⛔ isso ⛔ não está no título. ⛔ No fluxo isquêmico ele
               * repetiria o nome do módulo, ⛔ e por isso ⛔ não aparece.
               */
              objetivo={
                resumoAberto
                  ? [ESCOPO_DA_SINDROME[atual.id], atual.resumo].filter(Boolean).join(" · ")
                  : undefined
              }
              pendentes={problemas.filter((p) => p.dono === atual.id).length}
            />
          </View>
          {/** ⚠️ O ⓘ vive NA LINHA do título que explica — ⛔ nunca órfão. */}
          <InfoToggle
            aberto={resumoAberto}
            onAlternar={() => setResumoAberto((v) => !v)}
            rotuloAcessivel="Ver o objetivo desta fase"
            testID={`avc-info-superficie-${atual.id}`}
          />
        </View>

        {atual.id === "paciente" ? (
          <>
            <SuperficiePaciente
              estado={estado}
              agora={agora}
              onEscolher={escolher}
              onMedir={medir}
              onHora={registrarHora}
              onDesfazer={desfazer}
            />
            {/**
              * ⚠️⚠️⚠️ O PRÓXIMO PASSO — ⛔ e ⛔ ele é **sugestão**, ⛔ não porta.
              *
              * ⚠️ Decisão do autor, 2026-09-07: *"⛔ não bloquear o médico de
              * navegar manualmente, ⛔ mas a progressão normal deve respeitar
              * essa ordem"*.
              *
              * ⛔ ⛔ Por isso ⛔ ele ⛔ **⛔ não** condiciona a ⛔ nada estar
              * preenchido: ⛔ *"Paciente concluído"* ⛔ não significa paciente
              * normal — ⛔ significa que os dados basais foram revistos. ⛔ E a
              * barra inferior continua levando a ⛔ qualquer fase (**E-11**).
              */}
            <Pressable
              style={({ pressed }) => [s.proximoEixo, pressed ? s.pressionado : null]}
              accessibilityRole="button"
              accessibilityLabel={tr("Próximo: Estabilização")}
              testID="avc-paciente-proximo"
              onPress={() => abrir("estabilizacao")}
            >
              <Text style={s.proximoEixoTexto}>{tr("Próximo: Estabilização")}</Text>
              <Text style={s.proximoEixoSeta}>›</Text>
            </Pressable>
          </>
        ) : atual.id === "estabilizacao" ? (
          <SuperficieA
            estado={estado}
            agora={agora}
            /**
             * ⚠️ ⛔ A Superfície A ⛔ não navega — ⛔ quem navega é o dono da
             * navegação. ⛔ Ela ⛔ só pede a saída de *"Corrigir agora"*.
             */
            onAbrirCorrecoes={() => abrir("correcoes")}
            eixosAbertos={eixosAbertos}
            onAlternarEixo={alternarEixo}
            onConcluirEixo={concluirOuReabrirEixo}
            pontosDoGlasgow={Object.fromEntries(
              ["e", "v", "m"]
                .map((id) => [id, valorAtualDoEstado(estado, CAMPO_DE_ITEM_GLASGOW(id))?.valor])
                .filter(([, p]) => typeof p === "number") as [string, number][]
            )}
            onRegistrarGlasgow={registrarGlasgow}
            onMedirGlasgow={medirGlasgow}
            /**
             * ⚠️ ⛔ A origem sai da **trilha**, ⛔ e ⛔ não de uma dedução: o
             * fato mais recente de `glasgow_origem` diz por qual caminho o
             * número entrou.
             */
            origemDoGlasgow={
              typeof valorAtualDoEstado(estado, CAMPO_DA_ORIGEM_DO_GLASGOW)?.valor === "string"
                ? String(valorAtualDoEstado(estado, CAMPO_DA_ORIGEM_DO_GLASGOW)?.valor)
                : undefined
            }
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
        ) : atual.id === "imagem" ? (
          /**
           * ── ⚠️⚠️ INVESTIGAÇÃO = IMAGEM **+** LABORATÓRIO ─────────────────
           *
           * ⚠️ **§16** do briefing: a investigação tem **dois grandes blocos**,
           * ⛔ e ⛔ eles ⛔ não são duas fases. ⛔ O laboratório era uma tela
           * separada alcançada por um painel concorrente que ⛔ não existe mais.
           *
           * ⚠️⚠️ ⛔ E A ORDEM É CLÍNICA: a **imagem primeiro**, porque é ela que
           * governa a classe inteira de reperfusão (**F-16 · COR 1 · LOE A**) —
           * ⛔ e o laboratório ⛔ não pode atrasar a trombólise quando ⛔ não há
           * razão para suspeitar de alteração (**rec. 10 · COR 2a**).
           */
          <>
            {/**
              * ── ⚠️⚠️ ⛔ UMA FASE, ⛔ DUAS CASAS — Fase 5, 2026-09-07 ──────────
              *
              * ⛔ Imagem ⛔ e Laboratório ⛔ já eram desenhados juntos desde a
              * Fase 3, ⛔ mas ⛔ **empilhados sem costura**: duas telas coladas,
              * ⛔ e ⛔ nenhuma dizia onde uma acabava ⛔ e a outra começava.
              *
              * ⚠️ ⛔ Os dois cabeçalhos são **composição**, ⛔ e ⛔ não casa: os
              * fatos da imagem seguem em `imagem`, ⛔ os do laboratório em
              * `laboratorio` (**item 1** do autor). ⛔ Compor atravessa casa;
              * ⛔ mover fonte de verdade ⛔ é outra coisa.
              *
              * ⚠️ ⛔ E ⛔ é `Secao` — ⛔ o mesmo componente que titula bloco na
              * Avaliação AVC. ⛔ Padrão novo de card ⛔ nesta fase seria a
              * Investigação parecendo outro app (**item 18**).
              */}
            <Secao titulo="Imagem" testID="avc-investigacao-imagem" />
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
              onAbrirSuperficie={abrir}
            />
            <Secao titulo="Laboratório" testID="avc-investigacao-laboratorio" />
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
          </>
        ) : atual.id === "seguranca" ? (
          <SuperficieD
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onHora={registrarHora}
            onMedir={medir}
            onDesfazer={desfazer}
            onAbrirPaciente={() => abrir("paciente")}
          />
        ) : atual.id === "reperfusao" ? (
          <SuperficieF
            estado={estado}
            agora={agora}
            onEscolher={escolher}
            onIrParaCampo={irParaCampo}
            onAbrirSuperficie={abrir}
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
            onAbrirSuperficie={abrir}
            /**
             * ⚠️⚠️ ⛔ G RECEBE **PENDÊNCIAS**, ⛔ e ⛔ não a lista unificada — ⛔ e a
             * distinção ⛔ não é acadêmica: a síntese do caso fala de *"o que
             * falta responder"*, ⛔ e ⛔ não de *"o que está aberto"*. ⚠️ Uma
             * ameaça de via aérea ⛔ não é pendência de síntese.
             *
             * ⚠️ As duas saem da **mesma** apuração (`familiasDePendencia`) —
             * ⛔ e é isso que impede a segunda contagem que **I6** proíbe.
             */
            pendencias={pendenciasDoCaso(estado)}
            relogio={relogio}
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
            /** ⚠️ ⛔ A mesma regra dos outros dois botões — ⛔ uma só. */
            onReavaliar={(sup, campo) => irAteOndeResolve(sup, campo)}
          />
        ) : atual.id === "hic" ? (
          <SuperficieHemorragica variante="hic" />
        ) : atual.id === "hsa" ? (
          <SuperficieHemorragica variante="hsa" />
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
        {/**
          * ⚠️⚠️ ⛔ A NOTA ⛔ NÃO PODE MENTIR: ⛔ em Paciente a lista é ⛔ só
          * desta tela, ⛔ e dizer *"de todas as superfícies"* ⛔ ali faria o
          * médico concluir que ⛔ não há mais ⛔ nada pendente no atendimento.
          */}
        <Text style={s.blocoNota} testID="avc-pendencias-nota">
          {estado.superficieVista === "paciente"
            ? tr("Desta tela. As demais superfícies mostram as suas.")
            : pendenciasSaoParciais
            ? tr("Até esta fase. As seguintes mostram as suas.")
            : tr("De todas as superfícies. O nome indica onde resolver.")}
        </Text>
        {pendenciasVisiveis.length === 0 ? (
          <Text style={s.vazio}>{tr("Nenhuma pendência aberta")}</Text>
        ) : (
          pendenciasVisiveis.map((p) => (
            <Pressable
              key={p.id}
              style={s.pendencia}
              accessibilityRole="button"
              testID={`avc-pendencia-${p.id}`}
              /**
               * ── ⚠️⚠️⚠️ *"CLICO EM ABRIR ⛔ E ⛔ NÃO ABRE ⛔ NADA"* — 2026-09-09 ──
               *
               * ⛔ ⛔ `abrir(p.dono)` sozinho ⛔ é **inerte quando o dono é a
               * tela onde ⛔ ele já está** — ⛔ e a própria `abrir` diz ⛔ isso:
               * *"abrir a superfície em que já se está ⛔ não empilha"*.
               * ⚠️ ⛔ Na captura do autor, **três** pendências ofereciam
               * *"Abrir Avaliação AVC"* ⛔ com ⛔ ele **⛔ dentro** da Avaliação
               * AVC: ⛔ o botão prometia uma viagem ⛔ e ⛔ não saía do lugar.
               *
               * ⚠️⚠️ ⛔ E ⛔ isto ⛔ **⛔ já tinha sido corrigido** — ⛔ para os
               * cards de prioridade, em 2026-09-06, ⛔ e o cabeçalho de
               * `sistema/foco.tsx` guarda o relato: *"clico nos cards ⛔ e ⛔ não
               * abre ⛔ nada"*. ⛔ O painel de pendências ⛔ ficou para trás,
               * ⛔ chamando ⛔ a metade antiga.
               *
               * ⛔ ⛔ `ProblemaAtivo` ⛔ já carregava o campo — *"o campo a focar
               * ao chegar lá"*. ⚠️ ⛔ Ele existia, ⛔ e ⛔ ninguém o lia.
               *
               * ⚠️⚠️ ⛔ E O DESTINO CONTINUA SENDO O **`dono`**, ⛔ e ⛔ não a
               * casa do campo. ⛔ A primeira tentativa chamou `irParaCampo`
               * ⛔ direto ⛔ e a trava ⛔ pegou: a pendência da hiperglicemia
               * ⛔ diz *"Abrir **Correções**"* ⛔ e ⛔ tem `campo: "glicemia"`,
               * ⛔ que é declarado ⛔ **⛔ na Estabilização** — ⛔ o botão passou
               * a levar ⛔ para o lugar errado, ⛔ contra o que ⛔ ele mesmo
               * escreve. ⚠️ **⛔ O rótulo é a promessa**; ⛔ o campo é ⛔ só
               * ⛔ onde parar depois de chegar.
               */
              onPress={() => irAteOndeResolve(p.dono, p.campo)}
            >
              {/**
                * ⚠️⚠️ O SÍMBOLO DIZ **QUE TIPO** DE PROBLEMA É — ⛔ e ⛔ era um
                * `⚑` fixo para todos.
                *
                * ⛔ Uma ameaça de via aérea ⛔ e um campo por responder recebiam
                * a mesma bandeirinha. ⚠️ Agora `!` corrigível, `?` verificar,
                * `⛔` impede — ⛔ e o rótulo escrito ao lado diz o mesmo, porque
                * símbolo sozinho ⛔ não é leitura (**E-15**).
                */}
              <Text style={s.pendenciaRotulo}>
                <Text style={{ color: corDoEstado(tema, p.estado) }}>
                  {ESTADOS[p.estado].simbolo}
                </Text>
                {"  "}
                {tr(p.rotulo)}
              </Text>
              {p.detalhe === undefined ? null : (
                <Text style={s.pendenciaResolve}>{tr(p.detalhe)}</Text>
              )}
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
              {/**
                * ⚠️⚠️ A AÇÃO É UM **BOTÃO DENTRO DO CARTÃO** — 2026-09-06.
                *
                * ⛔ Ela era uma terceira linha de texto azul, ⛔ e o autor a
                * apontou entre as coisas que *"parecem texto ⛔ e ⛔ não
                * botões"*. ⚠️ ⛔ O cartão inteiro continua tocável (o alvo ⛔ não
                * encolheu); ⛔ o que mudou é que agora **se vê** onde tocar.
                */}
              <View style={s.pendenciaAcao}>
                <Text style={s.pendenciaDono}>
                  {tr("Abrir")} {tr(superficie(p.dono).titulo)}
                </Text>
                <Text style={s.pendenciaSeta}>{SETA}</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/**
        * ── ⚠️⚠️⚠️ ⛔ `ⓘ USO CLÍNICO E LIMITAÇÕES` — 2026-09-09 ──────────────
        *
        * ⚠️ Exigência do autor: *"permanentemente acessível… ⛔ **⛔ sem
        * obrigar o médico a fechar modal repetitivo ⛔ durante uma
        * emergência**"*.
        *
        * ⛔ ⛔ ⛔ **⛔ No fim da tela, ⛔ e ⛔ recolhido.** ⛔ Um modal ⛔ que
        * reabre ⛔ é ⛔ obstáculo ⛔ entre ⛔ o médico ⛔ e ⛔ o paciente;
        * ⛔ **⛔ aqui** ⛔ ele está ⛔ sempre disponível ⛔ e ⛔ **⛔ nunca ⛔ no
        * caminho**. ⚠️ ⛔ E ⛔ o texto ⛔ é ⛔ o **⛔ mesmo** do aceite.
        */}
      <AcessoAoUsoClinico tr={tr} testID="avc-uso-clinico" />
    </ScrollView>
    </ProvedorDeFoco>
    </ClinicalShell>
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

    root: { flex: 1, backgroundColor: tema.cores.bg },
    /**
     * ⚠️⚠️ A COLUNA DE LEITURA TEM TETO (2026-09-06) — ⛔ e ⛔ isso ⛔ não muda o
     * layout aprovado em 375 px.
     *
     * ⛔ Sem `maxWidth`, no desktop a linha do relógio esticava até ~2000 px: o
     * rótulo na extrema esquerda ⛔ e "Informar horário" na extrema direita.
     * ⚠️ O par **rótulo → ação** deixava de ser lido como par.
     *
     * ⚠️ `alignSelf: center` centraliza a coluna; ⛔ o fundo continua atravessando
     * a tela (quem pinta o fundo é o `ClinicalShell`).
     */
    /** ⚠️ As duas saídas da imagem — ⛔ empilhadas, ⛔ e ⛔ não lado a lado. */
    acoesDaImagem: { gap: ESPACO.sm },
    /** ⚠️ A forma compacta da prioridade — ⛔ uma linha, ⛔ e tocável inteira. */
    imagemLinha: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
      backgroundColor: tema.cores.criticalTint,
      borderWidth: 1,
      borderColor: tema.cores.critical,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
    },
    /** ⚠️ ⛔ Resolvida: ⛔ atalho, ⛔ e ⛔ não cobrança — 2026-09-09. */
    imagemLinhaResolvida: {
      backgroundColor: tema.cores.controlSurface,
      borderColor: tema.cores.controlBorder,
    },
    imagemLinhaAcaoResolvida: { color: tema.cores.textSecondary },
    imagemLinhaTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text, flex: 1 },
    imagemLinhaAcao: { ...PAPEL.rotuloDeMetrica, color: tema.cores.critical, flexShrink: 0 },
    /** ⚠️ Solicitar ⛔ e registrar são **dois** gestos — ⛔ empilhados, ⛔ e ⛔ sem disputa. */
    imagemAcoes: { gap: ESPACO.sm },

    /**
     * ⚠️ O bloco de conduta — ⛔ ele se separa da grade por espaço ⛔ e por um
     * filete, ⛔ e ⛔ não por outro cartão dentro do cartão.
     */
    /** ⚠️ O progresso é **secundário** — ⛔ ele ⛔ não compete com o estado clínico. */
    /**
     * ── ⚠️⚠️⚠️ ⛔ PROGRESSO ⛔ NÃO PODE PARECER CLÍNICA — 2026-09-08 ──────────
     *
     * ⛔ ⛔ Na revisão em 375 px, *"Não avaliado"* (clínica) ⛔ e *"Em
     * andamento"* (progresso) ficavam com o **mesmo peso ⛔ e a mesma cor**,
     * ⛔ uma embaixo da outra — ⛔ e ⛔ o médico ⛔ não tinha como saber que ⛔ são
     * coisas de naturezas diferentes.
     *
     * ⚠️ `PAPEL.micro` ⛔ já diz de si mesmo: *"o menor degrau — selo, aba,
     * marcador. ⛔ **⛔ Nunca para conteúdo clínico**"*. ⚠️ A caixa alta ⛔ e o
     * espaçamento **fecham a diferença** — ⛔ é o mesmo idioma que o app usa
     * para etiqueta ⛔ que ⛔ não é achado.
     */
    /**
     * ⚠️⚠️ A CONDUTA ⛔ NO CARD — 2026-09-12. ⛔ Ela ⛔ não compete com o achado
     * (⛔ que é o estado clínico), ⛔ e ⛔ não vira parágrafo: ⛔ o autor pediu
     * card **compacto** — *"para ⛔ não virar uma tela muito alta"*.
     */
    ameacaConduta: { ...PAPEL.legenda, color: tema.cores.primary },
    ameacaProgresso: {
      ...PAPEL.micro,
      color: tema.cores.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },

    /** ⚠️ A fileira de concluir — ⛔ uma por letra, ⛔ e ⛔ sem ordem imposta. */
    cockpitAcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs, marginTop: ESPACO.sm },
    concluirEixo: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      minHeight: TOQUE.minimo,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    /**
     * ⚠️⚠️ ⛔ **CONCLUÍDO ⛔ NÃO É VERDE.** ⛔ Verde diria *"está bom"*, ⛔ e
     * concluir ⛔ não afirma ⛔ nada sobre o paciente (**item 6**). ⛔ Ele é ⛔ só
     * um botão em outro estado.
     */
    concluirEixoFeito: {
      backgroundColor: tema.cores.surfaceElevated,
      borderColor: tema.cores.border,
    },
    concluirEixoLetra: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    concluirEixoTexto: { ...PAPEL.legenda, color: tema.cores.textSecondary },

    proximoEixo: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
      marginTop: ESPACO.xs,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1.5,
      borderColor: tema.cores.primary,
    },
    proximoEixoTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.primary, flex: 1 },
    proximoEixoSeta: { ...PAPEL.tituloDeSecao, color: tema.cores.primary },

    /**
     * ⚠️ ⛔ Os estilos do bloco *"O que fazer agora"* saíram com ele em
     * 2026-09-12: ⛔ a conduta subiu para o card do eixo (`ameacaConduta`).
     */
    /** ⚠️ O mesmo retorno de toque do kit — ⛔ nunca reinventado por tela. */
    pressionado: { opacity: 0.65 },

    /* ── ⚠️ ESTABILIZAÇÃO PRIMEIRO ──────────────────────────────────────── */
    ameacaFrase: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    /** ⚠️ Grade de quatro — ⛔ dois por linha em 375 px, ⛔ e ⛔ sem truncar nome. */
    ameacas: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    ameaca: {
      width: "48%",
      flexGrow: 1,
      gap: 2,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      padding: ESPACO.sm,
      minHeight: 84,
    },
    /**
     * ⚠️⚠️ ⛔ SÓ A AMEAÇA GANHA COR — ⛔ e ⛔ nunca a ausência de avaliação.
     *
     * ⛔ Pintar de âmbar o que ⛔ ainda ⛔ não foi avaliado faria a tela abrir com
     * os quatro eixos em alerta, ⛔ e alerta em tudo ⛔ não é alerta em ⛔ nada
     * (**E-37**).
     */
    ameacaAtiva: {
      borderColor: tema.cores.warning,
      backgroundColor: tema.cores.warningTint,
    },
    ameacaTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    /** ⚠️ O valor medido, dentro do eixo — ⛔ tabular, ⛔ e com a unidade colada. */
    ameacaMedida: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.xs },
    ameacaValor: { ...PAPEL.metrica, color: tema.cores.text } as const,
    ameacaUnidade: { ...PAPEL.micro, color: tema.cores.textSecondary } as const,
    /** ⚠️ A fileira compacta dos quatro eixos, fora de Estabilizar. */
    eixosCompactos: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    eixoChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      flexGrow: 1,
      minHeight: TOQUE.minimo,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.sm,
    },
    eixoChipValor: { ...PAPEL.legenda, color: tema.cores.text, flexShrink: 1 } as const,
    /** ⚠️ A forma compacta: uma linha, ⛔ e ⛔ não um tile de 84 px. */
    ameacaLinha: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
    },
    ameacaMarca: { ...PAPEL.tituloDeSecao, color: tema.cores.textSecondary },
    ameacaMarcaAtiva: { color: tema.cores.warning },
    /** ⚠️ Avaliado é **verde de evento**: alguém olhou ⛔ e respondeu. */
    ameacaMarcaOk: { color: tema.cores.success },
    ameacaLetra: { ...PAPEL.rotuloDeMetrica, color: tema.cores.textSecondary },
    ameacaNome: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    ameacaEstado: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    ameacaAviso: { ...PAPEL.rotuloDeMetrica, color: tema.cores.warning },

    /** ⚠️ ⛔ Altura zero: ⛔ ele existe para ser medido, ⛔ e ⛔ não para ocupar. */
    medidor: { height: 0 } as const,

    /** ⚠️ O card padrão do conteúdo — mesma caixa de `ClinicalCard`. */
    cartao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    } as const,
    conteudo: {
      padding: ESPACO.md,
      paddingBottom: ESPACO.xl,
      gap: ESPACO.md,
      width: "100%",
      maxWidth: LARGURA.leitura,
      alignSelf: "center",
    },
    /** ⚠️ Uma linha: voltar · nome · ⓘ do escopo. Eram 120 px; agora ~44. */
    cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm, minHeight: 44 },
    voltarBotao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingRight: ESPACO.sm,
    },
    voltarBotaoPressionado: { opacity: 0.6 },
    voltarTexto: {
      color: AREA_AVC.accent,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
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
    /**
     * ⚠️⚠️ A PENDÊNCIA É UM **CARD TOCÁVEL INTEIRO** — ⛔ e precisava parecer.
     *
     * ⛔ Relato do autor, 2026-09-06: *"isso tudo se parece com textos ⛔ e ⛔ não
     * botões funcionais"*. ⚠️ O card usava `surface` — o mesmo fundo do card
     * que o contém — ⛔ e o rótulo da ação (*"Abrir Imagem"*) era texto branco
     * em negrito, indistinguível de um título.
     */
    pendencia: {
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      borderRadius: RAIO.botao,
      padding: ESPACO.md,
      gap: 2,
      borderLeftWidth: 3,
      borderLeftColor: AREA_AVC.accent,
      minHeight: TOQUE.minimo,
    },
    pendenciaAcao: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      marginTop: ESPACO.xs,
      minHeight: TOQUE.minimo,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1.5,
      borderColor: tema.cores.primary,
    },
    pendenciaSeta: { ...PAPEL.tituloDeSecao, color: tema.cores.primary },
    pendenciaRotulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    pendenciaResolve: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    /**
     * ⚠️ TEXTO NÃO USA O ACCENT DA ÁREA — medido, não suposto.
     *
     * A primeira versão pintava "C · Resolver" com o roxo da área sobre a
     * superfície: `contraste-renderizado` mediu **4.06:1**, abaixo do mínimo AA
     * de 4.5:1. O accent continua identificando a área na BARRA LATERAL, que é
     * forma e não texto; o texto passa a usar a cor de texto do tema (§7.18).
     */
    /**
     * ⚠️ O rótulo da ação usa a **cor de ação** ⛔ e ⛔ não branco: é ele que
     * diz para onde o toque leva, ⛔ e branco em negrito lê como título.
     */
    pendenciaDono: {
      ...PAPEL.rotuloDeMetrica,
      color: tema.cores.primary,
    },
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
    /** ⚠️ ⛔ SEM fundo, ⛔ SEM borda, ⛔ SEM padding: ⛔ não é mais um card. */
    superficie: { gap: ESPACO.md },
    superficieLinha: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    superficieTituloBloco: { flex: 1 },
    superficieNome: {
      flex: 1,
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    superficieTitulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    superficieResumo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    emConstrucao: { color: tema.cores.warning, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", marginTop: ESPACO.sm },
    emConstrucaoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fontesBotao: {
      minHeight: TOQUE.minimo,
      alignSelf: "flex-start",
      justifyContent: "center",
      marginTop: ESPACO.md,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    fontesTitulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700", letterSpacing: 1 },
    fontes: { gap: 2 },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
  });
