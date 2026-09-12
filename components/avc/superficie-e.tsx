/**
 * SUPERFÍCIE E · Correções — a tela.
 *
 * ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER:
 *
 *   ⛔ **dizer que corrigiu.** ⛔ Não existe botão "corrigido" aqui. O bloqueio cai
 *      em D, lendo **uma nova aferição** em Entrada e estabilização.
 *
 *   ⛔ **prescrever.** ⚠️ Desde 2026-09-06 ela **mostra** fármaco ⛔ e dose (F-19,
 *      transcrito), ⛔ mas ⛔ não prescreve: ⛔ nenhuma via, ⛔ nenhum preparo,
 *      ⛔ nenhuma diluição, ⛔ nenhuma bomba. ⚠️ ⛔ E ⛔ **não escolhe agente** —
 *      ⛔ não há evidência de superioridade entre eles, ⛔ e ordenar *"use
 *      labetalol"* inventaria uma hierarquia que a literatura ⛔ não dá.
 *
 *   ⛔ **obrigar sequência.** Quem chegou aqui com o tratamento já correndo
 *      registra `Iniciada` direto — ⛔ sem passar por uma sugestão que o app
 *      ⛔ nunca fez.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ACAO_E, ACOES_DE_CORRECAO } from "../../avc/conteudo/superficie-e";
import { bloqueiosComAcoes } from "../../avc/nucleo/derivacoes-e";
import { problemasAtivos } from "../../avc/nucleo/problemas-ativos";
import { estadoDoPortaoIVT } from "../../avc/nucleo/portao-ivt";
import { ESTADOS, type EstadoClinico } from "../../design-system/estados-clinicos";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import { CabecalhoDeBloco, CampoDaSuperficie, useDetalhes } from "./campos-clinicos";
import { useFoco } from "./sistema/foco";
import { CondutaDaPressao, CondutaGlicemica } from "./conduta-da-fonte";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { useTr } from "../../lib/use-tr";
import { AvisoDeApoioClinico } from "../../design-system/aviso-de-apoio-clinico";

/**
 * ⚠️ ⛔ `PAPEL_EM_PALAVRAS` mudou de casa em 2026-09-08: ⛔ ele é do **desenho**
 * dos agentes, ⛔ e o desenho mora em `conduta-da-fonte.tsx`, ⛔ que as duas
 * telas chamam.
 */

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolherNaAcao: (acao: string, campo: string, valor: string) => void;
  onDesfazerNaAcao: (acao: string, campo: string) => void;
  onNovaAcao: (tipo: string) => void;
  /**
   * ⚠️⚠️ ⛔ LEVA ATÉ **⛔ ONDE SE REGISTRA A NOVA AFERIÇÃO** — 2026-09-09.
   *
   * ⛔ ⛔ Relato do autor: a tela dizia *"Falta: uma nova aferição de pressão
   * arterial"* ⛔ e ⛔ não dizia ⛔ onde. ⚠️ ⛔ Pendência ⛔ sem condição de
   * resolução ⛔ é muro (**E-26**) — ⛔ e ⛔ dizer o que falta ⛔ sem o caminho
   * ⛔ é a mesma coisa.
   */
  onReavaliar: (superficie: SuperficieId, campo: string) => void;
};

/**
 * ⚠️⚠️ ⛔ AS FRASES DO CICLO — ⛔ e ⛔ elas ⛔ não repetem as da Reperfusão.
 *
 * ⛔ Lá o médico pergunta *"posso decidir?"*; ⛔ aqui ⛔ ele pergunta *"o que
 * falta para eu ter resolvido?"*. ⚠️ Mesma regra, ⛔ duas perguntas.
 */
const TITULO_DO_CICLO: Readonly<Record<string, string>> = {
  bloqueado_corrigivel: "Problema detectado — ação corretiva ainda não registrada",
  aguardando_reavaliacao: "Ação registrada — aguardando a reavaliação",
  afericao_incompleta: "Nova aferição incompleta — complete para reavaliar",
  bloqueado_seguranca: "Há contraindicação de segurança, além do que se corrige aqui",
  nao_recomendada: "A diretriz não recomenda a trombólise neste caso",
  nao_sustentada: "Os critérios registrados não sustentam a trombólise",
  informacao_incompleta: "Nada mais a corrigir aqui",
  sem_criterios: "Nada mais a corrigir aqui",
  liberado: "Nada mais a corrigir aqui",
};

/** ⚠️ ⛔ Símbolo ⛔ e palavra — ⛔ cor sozinha ⛔ não é leitura (**E-15**). */
const SIMBOLO_DO_CICLO: Readonly<Record<string, EstadoClinico>> = {
  bloqueado_corrigivel: "corrigivel",
  aguardando_reavaliacao: "andamento",
  afericao_incompleta: "andamento",
  bloqueado_seguranca: "impede",
  nao_recomendada: "impede",
  nao_sustentada: "impede",
  informacao_incompleta: "favoravel",
  sem_criterios: "favoravel",
  liberado: "favoravel",
};

export default function SuperficieE({
  estado,
  agora,
  onEscolherNaAcao,
  onDesfazerNaAcao,
  onNovaAcao,
  onReavaliar,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const foco = useFoco();
  const blocos = bloqueiosComAcoes(estado);
  /**
   * ⚠️⚠️ ⛔ O QUE O CABEÇALHO CONTA — ⛔ e ⛔ é ⛔ ele que a tela ⛔ tem de
   * honrar. ⛔ Mesma função, ⛔ mesmo dono: ⛔ duas somas da mesma pergunta ⛔ é
   * como duas telas passam a discordar sobre o mesmo paciente (**I6**).
   */
  const enviadosParaCa = problemasAtivos(estado).filter((p) => p.dono === "correcoes");
  /**
   * ── ⚠️⚠️ ⛔ O CICLO FECHA **AQUI**, ⛔ e ⛔ não na Reperfusão ─────────────
   *
   * ⚠️ Decisão do autor, 2026-09-07 (**item 11**): *"O médico ⛔ não deve
   * precisar voltar manualmente à Reperfusão para descobrir se liberou. A tela
   * deve mostrar o novo estado **imediatamente** após a reavaliação."*
   *
   * ⛔ ⛔ E ⛔ ela **⛔ não recalcula**: lê o mesmo `estadoDoPortaoIVT()` que a
   * Reperfusão lê. ⛔ Duas somas da mesma regra é como as duas telas passam a
   * discordar sobre o mesmo paciente (**I6**).
   */
  const portao = estadoDoPortaoIVT(estado, agora);

  return (
    <View style={e.raiz} testID="avc-superficie-e-conteudo">
      {/**
        * ── ⚠️⚠️⚠️ ⛔ DUAS VERDADES SOBRE *"RESOLVER AQUI"* — 2026-09-09 ─────
        *
        * ⚠️ Relato do autor, ⛔ com captura: *"aqui aparece 1 a resolver mas
        * ⛔ não indica que tem que resolver, ficou ambíguo"*.
        *
        * ⛔ ⛔ ⛔ **A tela dizia três coisas, ⛔ e duas contradiziam a primeira:**
        * *"1 a resolver aqui"* ⛔ no cabeçalho, *"Nada nesta tela espera por
        * ação"* ⛔ no corpo, *"✓ Nada mais a corrigir aqui"* ⛔ no rodapé.
        *
        * ⛔ ⛔ **⛔ Por quê.** O cabeçalho conta `problemasAtivos` com dono
        * `correcoes`; ⛔ o corpo desenhava ⛔ **⛔ só** `bloqueiosCorrigiveis`.
        * ⚠️ ⛔ São **duas definições** de *"o que se resolve aqui"* — ⛔ e a
        * hiperglicemia cai ⛔ exatamente ⛔ no vão: ⛔ ela ⛔ **⛔ não bloqueia**
        * a trombólise, ⛔ e mesmo assim a fonte manda agir ⛔ e a ameaça a
        * **manda para cá** (`leva: "correcoes"`).
        *
        * ⚠️⚠️ ⛔ Quem estava incompleto era o **corpo**: ⛔ o médico foi
        * enviado ⛔ para uma tela que ⛔ então lhe dizia que ⛔ não tinha ⛔ nada
        * a fazer. ⛔ *"⛔ Nenhum bloqueio"* ⛔ continua verdade — ⛔ e ⛔ agora
        * ⛔ ela ⛔ não é dita ⛔ como se fosse *"⛔ nada a fazer"*.
        */}
      {blocos.length === 0 ? (
        <Text style={e.vazio} testID="avc-e-sem-bloqueio">
          {tr(
            enviadosParaCa.length === 0
              ? "Nenhum bloqueio corrigível registrado. Nada nesta tela espera por ação."
              : "Nenhum bloqueio da trombólise registrado. O que está abaixo pede conduta, e não trava a reperfusão."
          )}
        </Text>
      ) : null}

      {/**
        * ⚠️ ⛔ E ⛔ o que foi mandado para cá **aparece** — ⛔ com a frase da
        * **fonte**, ⛔ e ⛔ a mesma conduta que a Estabilização mostra. ⛔ A tela
        * ⛔ não redige, ⛔ e ⛔ não recalcula.
        */}
      {blocos.length > 0
        ? null
        : enviadosParaCa.map((p) => (
            <View key={p.id} style={e.enviado} testID={`avc-e-enviado-${p.id}`}>
              <Text style={e.enviadoRotulo}>{tr(p.rotulo)}</Text>
              {p.detalhe ? <Text style={e.enviadoDetalhe}>{tr(p.detalhe)}</Text> : null}
              <Text style={e.enviadoDetalhe}>{tr(p.resolvePor)}</Text>
              {p.campo === "glicemia" ? <CondutaGlicemica prefixo="avc-e-" /> : null}
              {p.campo === "pas" || p.campo === "pad" ? (
                <CondutaDaPressao prefixo="avc-e-" estado={estado} agora={agora} />
              ) : null}
              {/**
                * ⚠️⚠️ ⛔ E ⛔ AQUI TAMBÉM — ⛔ pedido do autor: *"esse mesmo
                * caminho tem que verificar se existe em hipo ⛔ e
                * hiperglicemias"*.
                *
                * ⛔ ⛔ A **hipo** ⛔ é bloqueio ⛔ e tem o ciclo acima. ⚠️ ⛔ A
                * **hiper** ⛔ não bloqueia — ⛔ ela chega ⛔ aqui ⛔ como
                * problema enviado, ⛔ e ⛔ ficava ⛔ sem caminho de volta
                * ⛔ nenhum.
                */}
              {p.campo === undefined ? null : (
                <Pressable
                  style={e.reavaliar}
                  accessibilityRole="button"
                  testID={`avc-e-reavaliar-enviado-${p.id}`}
                  onPress={() => onReavaliar("estabilizacao", p.campo as string)}
                >
                  <Text style={e.reavaliarTexto}>{tr("Registrar nova medida")}</Text>
                </Pressable>
              )}
            </View>
          ))}

      {/**
        * ⚠️⚠️ ⛔ O ESTADO DO CICLO, ⛔ E ⛔ O QUE FALTA — ⛔ e ⛔ nunca um botão
        * mudo (**item 12**).
        *
        * ⛔ *"Aguardando nova aferição"* ⛔ e *"Aguardando nova avaliação
        * neurológica"* ⛔ são coisas diferentes, ⛔ e a frase vem do **motivo**
        * que o núcleo já nomeia — ⛔ a tela ⛔ não a inventa.
        */}
      <View style={e.cicloEstado} testID={`avc-e-ciclo-${portao.estado}`}>
        <Text style={e.cicloTitulo}>
          {ESTADOS[SIMBOLO_DO_CICLO[portao.estado] ?? "ausente"].simbolo}{" "}
          {/**
            * ⚠️⚠️ ⛔ *"NADA MAIS A CORRIGIR"* É SOBRE O **PORTÃO** — 2026-09-09.
            *
            * ⛔ ⛔ Com uma hiperglicemia mandada para cá, essa frase ⛔ ao lado
            * de *"1 a resolver aqui"* ⛔ lia-se como **contradição**. ⚠️ ⛔ Ela
            * ⛔ não estava errada: ⛔ ela respondia **⛔ outra pergunta** — ⛔ a
            * da trombólise —, ⛔ e ⛔ não dizia ⛔ qual.
            */}
          {tr(
            (TITULO_DO_CICLO[portao.estado] ?? "") === "Nada mais a corrigir aqui" &&
              enviadosParaCa.length > 0
              ? "Nada mais bloqueia a trombólise"
              : TITULO_DO_CICLO[portao.estado] ?? ""
          )}
        </Text>
        {portao.motivos
          .filter((m) => m.camada === "correcao")
          .map((m) => (
            <Text key={m.id} style={e.cicloFalta} testID={`avc-e-ciclo-falta-${m.id}`}>
              {tr(m.rotulo)}
              {m.dado ? ` — ${tr(m.dado)}` : ""} · {tr(m.oQueFalta)}
            </Text>
          ))}
      </View>

      {blocos.map(({ bloqueio, acoes }) => {
        const acao = ACOES_DE_CORRECAO.find((a) => a.bloqueio === bloqueio.id);
        return (
          <View
            key={bloqueio.id}
            style={e.grupo}
            testID={`avc-e-bloqueio-${bloqueio.id}`}
            /**
             * ── ⚠️⚠️⚠️ ⛔ O DESTINO DO BOTÃO ÂMBAR — 2026-09-09 ─────────────
             *
             * ⛔ ⛔ *"Corrigir a pressão arterial"* ⛔ precisa parar **⛔ aqui**,
             * ⛔ e ⛔ não no topo da tela — ⛔ ainda mais ⛔ quando o médico
             * ⛔ já está ⛔ nas Correções ⛔ e o toque ⛔ não mudava ⛔ nada.
             *
             * ⚠️ ⛔ Registrado ⛔ no mesmo mecanismo de foco dos campos: ⛔ o
             * nome ⛔ é sintético (`correcao_<bloqueio>`) ⛔ porque ⛔ isto
             * ⛔ **⛔ não** é um campo — ⛔ é ⛔ **⛔ um lugar**.
             */
            ref={(n) => foco.registrarGrupo([`correcao_${bloqueio.id}`], n)}
          >
            <CabecalhoDeBloco
              titulo={acao?.rotulo ?? bloqueio.id}
              testID={`avc-e-bloco-${bloqueio.id}`}
            />
            {/* ⚠️ Português primeiro, verbatim abaixo — o mesmo contrato de D. */}
            <Text style={e.formulacao} testID={`avc-e-formulacao-${bloqueio.id}`}>
              {tr(bloqueio.formulacao)}
            </Text>
            <Text style={e.verbo} testID={`avc-e-verbo-${bloqueio.id}`}>“{bloqueio.verbo}”</Text>

            {/**
              * ⚠️⚠️ O QUE RESOLVE — e a frase diz **uma nova aferição**, ⛔ não esta
              * tela. Sem ela, registrar a ação pareceria fechar o bloqueio.
              */}
            <Text style={e.resolve} testID={`avc-e-resolve-${bloqueio.id}`}>
              {tr("O que faz este bloqueio cair")}: {tr(bloqueio.resolvePor)} —{" "}
              {tr("registrada em Entrada e estabilização")}
            </Text>

            {/**
              * ── ⚠️⚠️⚠️ ⛔ O GESTO ANTES DA REFERÊNCIA — 2026-09-09 ──────────
              *
              * ⚠️ Relato do autor: *"quando direciono para cá ⛔ e clico ⛔ não
              * acontece, ⛔ não abre opção para correção"*.
              *
              * ⛔ ⛔ **⛔ E ⛔ ele funcionava.** ⚠️ Medido: o botão criava a ação
              * ⛔ normalmente — ⛔ ele ⛔ só estava **⛔ 2948 px abaixo** do
              * título do problema, ⛔ **⛔ 3,6 telas** de 812. ⛔ Entre os dois
              * ⛔ havia o painel inteiro de agentes ⛔ e doses.
              *
              * ⚠️⚠️ ⛔ Um controle que ⛔ ninguém alcança ⛔ é um controle que
              * ⛔ não existe — ⛔ e o relato *"⛔ não acontece ⛔ nada"* estava
              * ⛔ **⛔ certo do ponto de vista de quem usa**.
              *
              * ⛔ ⛔ Agora o **gesto** vem logo depois do que faz o bloqueio
              * cair, ⛔ e a **referência** (agentes, doses, alvos) fica abaixo
              * — ⛔ ela é para consultar, ⛔ e ⛔ não para atravessar.
              */}
            {/**
              * ── ⚠️⚠️⚠️ ⛔ E **⛔ ONDE** SE FECHA O CICLO — 2026-09-09 ────────
              *
              * ⚠️ *"Cliquei em registrar ação ⛔ e ⛔ nem sei o que aconteceu…
              * ⛔ não me dá ⛔ onde tenho que registrar a nova aferição."*
              *
              * ⛔ ⛔ A tela dizia **⛔ o que falta** ⛔ e ⛔ parava aí. ⚠️ ⛔ O que
              * fecha o bloqueio ⛔ **⛔ não acontece ⛔ aqui** — ⛔ acontece ⛔ na
              * Estabilização, ⛔ e ⛔ o médico ⛔ tinha de descobrir ⛔ isso
              * ⛔ sozinho.
              *
              * ⚠️ ⛔ Aparece ⛔ **⛔ depois** de haver ação registrada: ⛔ antes
              * disso ⛔ o gesto seguinte ⛔ é registrar a ação, ⛔ e ⛔ dois
              * botões ⛔ competindo ⛔ diriam ⛔ que ⛔ tanto faz.
              */}
            {/**
              * ⚠️ ⛔ `altoRisco` ⛔ no bloco da **ação** — ⛔ aqui ⛔ o médico
              * ⛔ registra ⛔ o que executou ⛔ no paciente. ⚠️ ⛔ O
              * `calculoDose` ⛔ **⛔ não** entra ⛔ aqui: ⛔ ele mora ⛔ em
              * `conduta-da-fonte`, ⛔ colado ⛔ ao número — ⛔ e ⛔ empilhar
              * ⛔ os dois ⛔ é ⛔ o que o autor ⛔ proibiu.
              */}
            <AvisoDeApoioClinico
              variante="altoRisco"
              ha
              tr={tr}
              testID={`avc-e-aviso-alto-risco-${bloqueio.id}`}
            />

            {acao && acoes.length > 0 ? (
              <Pressable
                style={e.reavaliar}
                accessibilityRole="button"
                testID={`avc-e-reavaliar-${bloqueio.id}`}
                onPress={() => onReavaliar(acao.reavaliaEm, acao.campoDaReavaliacao)}
              >
                <Text style={e.reavaliarTexto}>
                  {tr("Registrar")} {tr(acao.resolvePor).toLowerCase()}
                </Text>
              </Pressable>
            ) : null}

            {acao ? (
              <Pressable
                style={e.novaAcao}
                accessibilityRole="button"
                testID={`avc-e-nova-acao-${bloqueio.id}`}
                onPress={() => onNovaAcao(acao.rotulo)}
              >
                <Text style={e.novaAcaoTexto}>
                  {acoes.length === 0 ? tr("Registrar ação") : tr("Registrar outra ação")}
                </Text>
              </Pressable>
            ) : null}

            {/**
              * ⚠️⚠️ CADA AÇÃO É UMA INSTÂNCIA: duas intervenções antes da nova
              * aferição aparecem como **duas**, e ⛔ não uma sobrescrevendo a outra.
              */}
            {acoes.map((a, i) => (
              <View key={a.instancia} style={e.acao} testID={`avc-e-acao-${a.instancia}`}>
                <Text style={e.acaoTitulo}>
                  {tr("Ação")} {i + 1}
                </Text>
                {ACAO_E.filter((c) => c.id === "acao_estado").map((campo) => (
                  <CampoDaSuperficie
                    key={`${a.instancia}-${campo.id}`}
                    campo={{ ...campo, casa: "correcoes" }}
                    casaAtual="correcoes"
                    bruto={String(valorNaInstancia(estado, a.instancia, campo.id)?.valor ?? "")}
                    /** ⚠️ ⛔ Ver `superficie-d.tsx`: literal `undefined` ⛔ é campo cego esperando o primeiro campo numérico. */
                    numero={(() => {
                      const v = valorNaInstancia(estado, a.instancia, campo.id)?.valor;
                      return typeof v === "number" ? v : undefined;
                    })()}
                    agora={agora}
                    detalheAberto={detalhes.aberto(`${a.instancia}-${campo.id}`)}
                    onAlternarDetalhe={() => detalhes.alternar(`${a.instancia}-${campo.id}`)}
                    onEscolher={(c, v) => onEscolherNaAcao(a.instancia, c, v)}
                    onMedir={() => undefined}
                    onHora={() => undefined}
                    onDesfazer={(c) => onDesfazerNaAcao(a.instancia, c)}
                  />
                ))}
              </View>
            ))}

            {/**
              * ── ⚠️⚠️ COMO CORRIGIR — F-19, ⛔ e ⛔ só para a pressão ────────────
              *
              * ⚠️ Pedido do autor em 2026-09-06: *"contraindicações corrigíveis
              * PA ⛔ e glicemia ⛔ e maneira de corrigir, o que usar ⛔ e doses"*.
              *
              * ⚠️⚠️ ⛔ CADA AGENTE CARREGA A **SUA** PROCEDÊNCIA, ⛔ e ⛔ nunca uma
              * etiqueta genérica: ⛔ **a AHA/ASA 2026 ⛔ não nomeia fármaco
              * algum** — varredura do documento inteiro deu **zero** ocorrências
              * para os oito agentes. ⚠️ O trio preferencial é da edição de
              * **2019**; esmolol ⛔ e nicardipino têm **bula**; metoprolol ⛔ e
              * nitroprussiato vêm de um **manual brasileiro de 2013**.
              *
              * ⛔ *"A AHA recomenda labetalol"* ⛔ e *"a AHA de 2019 listava
              * labetalol, ⛔ e a de 2026 ⛔ não lista fármaco algum"* ⛔ não são a
              * mesma afirmação.
              */}
            {/**
              * ── ⚠️⚠️ COMO CORRIGIR — F-19, ⛔ e ⛔ só para a pressão ────────────
              *
              * ⚠️ Pedido do autor em 2026-09-06: *"contraindicações corrigíveis
              * PA ⛔ e glicemia ⛔ e maneira de corrigir, o que usar ⛔ e doses"*.
              *
              * ⚠️⚠️ ⛔ O DESENHO MUDOU DE ARQUIVO em 2026-09-08, ⛔ e ⛔ não de
              * conteúdo: ⛔ ele ⛔ agora é `CondutaDaPressao`, ⛔ que a
              * **Estabilização** também chama. ⛔ Duas telas montando o mesmo
              * bloco com JSX próprio divergiriam no primeiro campo novo.
              *
              * ⚠️ ⛔ O `prefixo` mantém os `testID` que as travas desta tela
              * ⛔ já mediam — ⛔ mudar de arquivo ⛔ não pode custar a
              * continuidade de garantia ⛔ nenhuma.
              */}
            {bloqueio.id === "pressao_acima_da_meta" ? <CondutaDaPressao prefixo="avc-e-" estado={estado} agora={agora} /> : null}

            {/**
              * ── ⚠️⚠️ F-18 · A GLICEMIA ⛔ NÃO CONTRAINDICA ────────────────────
              *
              * ⚠️ O bloco **abre pela pergunta**, ⛔ e ⛔ não pelas faixas: o que
              * decide ⛔ não é o número, ⛔ é o **déficit persistir depois da
              * correção**. ⛔ Uma tabela de cinco faixas no topo ensinaria o
              * oposto.
              *
              * ⚠️⚠️ ⛔ E O BLOCO DOS ERROS FICA **NA TELA**: `<50` ⛔ e `>400`
              * foram, por anos, critério de exclusão. ⚠️ Quem aprendeu assim
              * ⛔ não desaprende lendo uma faixa — ⛔ precisa ler que aquilo
              * mudou, ⛔ e o que ficou no lugar.
              */}
            {/**
              * ── ⚠️⚠️ F-18 · A GLICEMIA ⛔ NÃO CONTRAINDICA ────────────────────
              *
              * ⚠️ Mesmo movimento da pressão: ⛔ o desenho vive em
              * `CondutaGlicemica`, ⛔ e a Estabilização chama o **mesmo**.
              */}
            {bloqueio.id === "glicemia_alterada" ? <CondutaGlicemica prefixo="avc-e-" /> : null}

          </View>
        );
      })}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },

    /* ── ⚠️ F-19 · como corrigir ─────────────────────────────────────────── */
    terapeutica: { gap: ESPACO.sm, paddingTop: ESPACO.sm },
    terapeuticaTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    terapeuticaNota: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },

    agente: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: 2,
    },
    agenteTopo: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: ESPACO.sm,
    },
    agenteNome: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flexShrink: 1 },
    /** ⚠️ O papel é **legenda**, ⛔ e ⛔ não selo de qualidade. */
    agentePapel: { ...PAPEL.micro, color: tema.cores.textSecondary, flexShrink: 0 },
    /** ⚠️ A dose é o que vai na veia — ⛔ ela ⛔ não divide peso com o resto. */
    agenteDose: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    agenteLinha: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    agenteCautela: { ...PAPEL.textoSecundario, color: tema.cores.warning },
    /** ⚠️ ⛔ Nunca omitida: dose ⛔ sem procedência ⛔ não é rastreável (E-30). */
    agenteFonte: { ...PAPEL.legenda, color: tema.cores.textSecondary },

    /** ⚠️ O alerta do esmolol — vermelho, porque aqui há **dano possível**. */
    alerta: {
      backgroundColor: tema.cores.criticalTint,
      borderWidth: 1,
      borderColor: tema.cores.critical,
      borderRadius: RAIO.botao,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    alertaTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.critical },
    alertaTexto: { ...PAPEL.textoSecundario, color: tema.cores.text },

    alvo: {
      backgroundColor: tema.cores.surfaceElevated,
      borderRadius: RAIO.botao,
      padding: ESPACO.sm,
      gap: 2,
    },
    alvoGrau: { ...PAPEL.micro, color: tema.cores.textSecondary },
    alvoValor: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    alvoContexto: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    /** ⚠️ ⛔ O que o corte **⛔ não** é — em `info`, porque é **contexto**. */
    alvoNaoE: { ...PAPEL.textoSecundario, color: tema.cores.info },

    /* ── ⚠️ F-18 · a pergunta que decide ─────────────────────────────────── */
    /**
     * ⚠️ Ela abre o bloco ⛔ e tem o peso da decisão: ⛔ o número ⛔ não decide,
     * ⛔ e a tela ⛔ não pode sugerir que decide.
     */
    pergunta: {
      backgroundColor: tema.cores.primaryTint,
      borderWidth: 1,
      borderColor: tema.cores.primary,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    perguntaGrau: { ...PAPEL.rotuloDeMetrica, color: tema.cores.primary },
    perguntaTexto: { ...PAPEL.tituloDaDecisao, color: tema.cores.text },
    perguntaRamo: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },

    erro: { gap: 2, paddingTop: ESPACO.xs },
    /** ⚠️ Riscado ⛔ e apagado: ⛔ ele está ali para ser **reconhecido**, ⛔ não lido como conduta. */
    erroErrado: {
      ...PAPEL.textoSecundario,
      color: tema.cores.textSecondary,
      textDecorationLine: "line-through",
    },
    erroCerto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    cicloEstado: {
      gap: 2,
      padding: ESPACO.sm,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
    },
    cicloTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text, flexShrink: 1 },
    cicloFalta: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1 },
    vazio: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary },
    /** ⚠️ ⛔ O que foi mandado para cá — ⛔ cartão, ⛔ e ⛔ não parágrafo solto. */
    enviado: {
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    enviadoRotulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    enviadoDetalhe: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    grupo: { gap: ESPACO.sm },
    formulacao: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    verbo: {
      ...PAPEL.legenda, color: tema.cores.textSecondary,
      fontStyle: "italic",
    },
    resolve: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    acao: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border, padding: ESPACO.sm, gap: ESPACO.xs,
    },
    acaoTitulo: {
      ...PAPEL.micro, color: tema.cores.textSecondary,
    },
    novaAcao: {
      alignSelf: "flex-start", paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.controlBorder,
    },
    novaAcaoTexto: {
      ...PAPEL.tituloDeSecao, color: tema.cores.text,
    },
    /** ⚠️ ⛔ O caminho de volta — ⛔ ação, ⛔ e ⛔ por isso `primary` (2026-09-09). */
    reavaliar: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primary,
    },
    /** ⚠️ ⛔ `tituloDeSecao` ⛔ traz o peso — ⛔ `fontWeight` avulso ⛔ é o que
     * a trava da tipografia proíbe, ⛔ e ⛔ com razão: peso solto ⛔ é como
     * nasce uma escala paralela. */
    reavaliarTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.primary },
  });
