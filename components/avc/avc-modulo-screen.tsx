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

import { SUPERFICIES, pendenciasVigentes, superficie } from "../../avc/conteudo/superficies";
import { pendenciasDerivadas } from "../../avc/nucleo/derivacoes";
import { pendenciasDaImagem } from "../../avc/nucleo/derivacoes-c";
import { proximaInstancia } from "../../avc/nucleo/instancia";
import { COLETA } from "../../avc/conteudo/laboratorio";
import { pendenciasDoLaboratorio } from "../../avc/nucleo/derivacoes-lab";
import { registrarComInstancia } from "../../avc/conteudo/campos";
import { CAMPO_DE_ITEM } from "../../avc/conteudo/nihss";
import { slot } from "../../avc/conteudo/fontes";
import { TODOS_OS_CAMPOS_A } from "../../avc/conteudo/superficie-a";
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
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
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
   * ⚠️⚠️ REGISTRO **NUMA COLETA ESPECÍFICA** — e ⛔ não na "aberta".
   *
   * O Laboratório desenha N coletas ao mesmo tempo, e um toque no INR da
   * terceira ⛔ não pode cair noutra. É a tela que sabe em qual o médico tocou.
   */
  function escolherNaColeta(coleta: string, campo: string, valor: string) {
    setEstado((e) => registrarComInstancia(e, { campo, valor }, relogio, coleta));
  }
  function medirNaColeta(coleta: string, campo: string, valor: number) {
    setEstado((e) => registrarComInstancia(e, { campo, valor }, relogio, coleta));
  }
  function horaNaColeta(coleta: string, campo: string, instante: number) {
    setEstado((e) =>
      registrarComInstancia(e, { campo, valor: instante, horaClinica: instante }, relogio, coleta)
    );
  }
  /** ⚠️ Desfazer também aponta para a instância: ⛔ não se desfaz o de outra coleta. */
  function desfazerNaColeta(coleta: string, campo: string) {
    setEstado((e) =>
      registrarComInstancia(
        e,
        { campo, valor: "nao_perguntado", tipo: "correcao", motivo: "Registro desfeito pelo médico" },
        relogio,
        coleta
      )
    );
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
    setEstado((e) => desfazerRegistro(e, campo, relogio));
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
    <ScrollView style={s.root} contentContainerStyle={s.conteudo}>
      {/* ⚠️ I7: a tela desenha o PRÓPRIO cabeçalho, com saída. A rota não põe. */}
      <View style={s.cabecalho}>
        <Pressable onPress={onVoltar} accessibilityRole="button" accessibilityLabel={tr("Voltar")}>
          <Text style={s.voltar}>‹ {tr("Voltar")}</Text>
        </Pressable>
        <Text style={s.titulo}>{tr("AVC isquêmico agudo")}</Text>
        <Text style={s.subtitulo}>{tr("Adulto com suspeita de AVC isquêmico agudo")}</Text>
      </View>

      {/* ── RESUMO PERSISTENTE (§7.8) ──────────────────────────────────────
          ⚠️ Compacto de propósito. O argumento mais forte para ele existir é o
          RELÓGIO: é o único valor que muda sozinho, e se só existisse dentro de
          uma superfície, o médico trabalharia em outra sem vê-lo correr. */}
      <View style={s.resumo} testID="avc-resumo">
        <Text style={s.resumoTitulo}>{tr("Estado atual")}</Text>
        <View style={s.resumoLinha}>
          <Text style={s.resumoItem}>
            {tr("Aberto há")} {abertoHaMin ?? 0} {tr("min")}
          </Text>
          <Text style={s.resumoItem}>
            {tr("Última vez bem")}:{" "}
            {decorridoEmMinutos(estado, "ultima_vez_bem", relogio) === undefined
              ? tr("não informado")
              : `${decorridoEmMinutos(estado, "ultima_vez_bem", relogio)} ${tr("min")}`}
          </Text>
          <Text style={s.resumoItem} testID="avc-resumo-a">
            {tr("Estabilização")}: {informadosEmA}/{TODOS_OS_CAMPOS_A.length}
          </Text>
        </View>
      </View>

      {/* ── NAVEGAÇÃO ENTRE SUPERFÍCIES (§7.2, E-11) ───────────────────────
          ⚠️ SEM ÁRVORE LINEAR: as sete estão sempre disponíveis, em qualquer
          ordem, a qualquer momento. ⛔ Não há "próximo passo". */}
      <View style={s.bloco}>
        <Text style={s.blocoTitulo}>{tr("Superfícies")}</Text>
        <View style={s.abas}>
          {SUPERFICIES.map((sup) => {
            const ativa = sup.id === estado.superficieVista;
            return (
              <Pressable
                key={sup.id}
                onPress={() => abrir(sup.id)}
                accessibilityRole="button"
                accessibilityLabel={tr(sup.titulo)}
                testID={`avc-aba-${sup.id}`}
                style={[s.aba, ativa && s.abaAtiva]}
              >
                {/**
                  * ⚠️ Painel ⛔ não tem letra, e o lugar dela ⛔ não fica vazio: um
                  * espaço em branco onde as outras têm "A" leria como letra que
                  * sumiu. O símbolo diz "contexto", e ⛔ não posição no fluxo.
                  */}
                <Text style={[s.abaLetra, ativa && s.abaLetraAtiva]}>
                  {sup.letra ?? "·"}
                </Text>
                <Text style={[s.abaTitulo, ativa && s.abaTituloAtivo]} numberOfLines={2}>
                  {tr(sup.titulo)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── SUPERFÍCIE ABERTA ──────────────────────────────────────────────
          ⚠️ Esqueleto declarado: a tela DIZ que não há conteúdo, em vez de
          parecer completa e vazia. Vacuidade silenciosa é o que a casa proíbe. */}
      <View style={s.superficie} testID={`avc-superficie-${atual.id}`}>
        <Text style={s.superficieTitulo}>
          {atual.letra ? `${atual.letra} · ` : ""}
          {tr(atual.titulo)}
        </Text>
        <Text style={s.superficieResumo}>{tr(atual.resumo)}</Text>

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
            onEscolherNaColeta={escolherNaColeta}
            onMedirNaColeta={medirNaColeta}
            onHoraNaColeta={horaNaColeta}
            onDesfazerNaColeta={desfazerNaColeta}
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
          {tr("De todas as superfícies. A letra indica onde resolver.")}
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
                * ⚠️ VERBO NA FRENTE: "Abrir B · Neurológico" diz o que o toque
                * FAZ. "B · Neurológico · Resolver" descrevia um lugar e deixava
                * a ação por último, na tela em que o médico está com pressa.
                */}
              <Text style={s.pendenciaDono}>
                {tr("Abrir")}{" "}
                {superficie(p.dono).letra ? `${superficie(p.dono).letra} · ` : ""}
                {tr(superficie(p.dono).titulo)}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tema.cores.bg },
    conteudo: { padding: ESPACO.md, paddingBottom: ESPACO.xl, gap: ESPACO.md },
    cabecalho: { gap: ESPACO.xs },
    voltar: { color: AREA_AVC.accent, fontSize: TIPOGRAFIA.body.fontSize, marginBottom: ESPACO.sm },
    titulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.title.fontSize, fontWeight: "700" },
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
    superficieTitulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    superficieResumo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    emConstrucao: { color: tema.cores.warning, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", marginTop: ESPACO.sm },
    emConstrucaoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fontesBotao: { minHeight: TOQUE.minimo, justifyContent: "center", marginTop: ESPACO.md },
    fontesTitulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700", letterSpacing: 1 },
    fontes: { gap: 2 },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
  });
