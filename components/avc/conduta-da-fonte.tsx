import { alvosPressoricosAplicaveis } from "../../avc/nucleo/alvo-pressorico";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { useState } from "react";
/**
 * A CONDUTA COMO A FONTE ESCREVE — ⚠️ **um desenho só**, ⛔ duas telas.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE ESTE ARQUIVO EXISTE — pedido do autor, 2026-09-08 ─────
 *
 * ⛔ ⛔ *"Quero a conduta expandida na tela de Estabilização (…) **⛔ não
 * duplicar conteúdo clínico**. A Estabilização deve ler ⛔ exatamente os mesmos
 * objetos/estruturas já usados em Correções (…) ⛔ se Correções mudar no
 * futuro, Estabilização deve refletir a mesma fonte automaticamente."*
 *
 * ⚠️⚠️ ⛔ E *"ler os mesmos objetos"* ⛔ não bastava: ⛔ duas telas montando o
 * **mesmo conteúdo com JSX próprio** divergiriam no primeiro dia em que
 * ⛔ alguém acrescentasse um campo ao agente ⛔ e ⛔ só uma delas o desenhasse.
 * ⚠️ ⛔ Aqui o **desenho** também é único: ⛔ Correções ⛔ e Estabilização
 * chamam os **mesmos componentes**.
 *
 * ── ⚠️ O `prefixo` ────────────────────────────────────────────────────────
 *
 * ⚠️ Cada tela dá o seu, ⛔ e ⛔ é ⛔ ele que compõe os `testID`. ⛔ Correções
 * passa `avc-e-`, ⛔ que é o que as travas dela ⛔ já mediam — ⛔ mudar de
 * arquivo ⛔ não pode custar a continuidade de ⛔ nenhuma garantia.
 *
 * ── ⚠️⚠️ ⛔ O QUE ESTE ARQUIVO ⛔ NÃO FAZ ───────────────────────────────────
 *
 * ⛔ ⛔ Não decide **se** a conduta aparece — ⛔ isso é da tela, ⛔ que sabe se
 * há bloqueio ativo. ⛔ Não registra ⛔ nada: ⛔ ⛔ **⛔ nenhum toque daqui grava
 * que a conduta foi feita** (autor: *"⛔ não registrar automaticamente que a
 * conduta foi feita"*). ⛔ E ⛔ não escreve conduta ⛔ nenhuma: ⛔ todo texto vem
 * de `antihipertensivos.ts` ⛔ e `correcao-glicemica.ts` (**E-31**).
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AGENTES_ANTI_HIPERTENSIVOS,
  ALERTA_DO_ESMOLOL,
  ALVOS_PRESSORICOS,
  type PapelDoAgente,
} from "../../avc/conteudo/antihipertensivos";
import {
  ALVOS_GLICEMICOS,
  CORTES_GLICEMICOS,
  ERROS_A_EVITAR,
  PERGUNTA_QUE_DECIDE,
  TRATAMENTOS_GLICEMICOS,
} from "../../avc/conteudo/correcao-glicemica";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { AvisoDeApoioClinico } from "../../design-system/aviso-de-apoio-clinico";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · PRESSÃO — F-19 dá os agentes; F-04 dá os alvos
 * ────────────────────────────────────────────────────────────────────────── */

export function CondutaDaPressao({
  prefixo,
  estado,
  agora,
  agentesSempreAbertos = false,
}: {
  prefixo: string;
  /**
   * ⚠️⚠️⚠️ ⛔ O PAINEL PASSOU A DEPENDER DO ESTADO — 2026-09-10.
   *
   * ⛔ ⛔ Antes ⛔ ele era ⛔ **⛔ puro**: sempre o mesmo alvo « principal ».
   * ⚠️ ⛔ E ⛔ era ⛔ **⛔ esse** ⛔ o defeito — ⛔ o alvo ⛔ depende ⛔ da fase, ⛔ e
   * ⛔ quem trombolisou ⛔ via ⛔ o número ⛔ de antes.
   */
  estado: EstadoAvc;
  agora: number;
  /**
   * ⚠️⚠️⚠️ ⛔ DUAS DECISÕES DO AUTOR, ⛔ E ⛔ ELAS ⛔ NÃO SE CONTRADIZEM.
   *
   * ⛔ **2026-09-09**: *"⛔ não poderia ser expansível ⛔ ao invés de ficar tudo
   * aberto na tela?"* — ⛔ e o botão nasceu. ⚠️ ⛔ Ali o contexto é o
   * **catálogo** (Correções): ⛔ o médico navega, ⛔ e a gaveta poupa tela.
   *
   * ⛔ **2026-09-12**: *"quando clico em algo que está alterado ⛔ tem que me
   * dizer o que fazer … agentes ⛔ e doses ⛔ já aparecem abertos, ⛔ sem botão"*
   * — ⚠️ ⛔ e aqui o contexto é **⛔ outro**: o card do eixo **⛔ em ameaça
   * ativa** levou o médico ⛔ até este bloco ⛔ para ⛔ ele **tratar agora**.
   * ⛔ Pedir mais um toque ⛔ nesse ponto ⛔ é ⛔ a queixa que originou a mudança.
   *
   * ⚠️ Por isso a abertura é **⛔ do chamador**, ⛔ e o padrão preserva o
   * pedido de 09-09.
   */
  agentesSempreAbertos?: boolean;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /** ⚠️ ⛔ Estado de **⛔ tela**: ⛔ ver mais alvos ⛔ não registra ⛔ nada (**E-20**). */
  const [todosOsAlvos, setTodosOsAlvos] = useState(false);
  /** ⚠️ Os que valem AGORA — ⛔ lista, ⛔ e ⛔ não vencedor (⛔ sem precedência inventada). */
  const aplicaveis = alvosPressoricosAplicaveis(estado, agora);
  /**
   * ── ⚠️⚠️⚠️ ⛔ OS AGENTES NASCEM **⛔ FECHADOS** — 2026-09-09 ──────────────
   *
   * ⚠️ Pergunta do autor: *"isso ⛔ não poderia ser expansível ⛔ ao invés de
   * ficar tudo aberto na tela?"*.
   *
   * ⛔ ⛔ São **⛔ oito** agentes, ⛔ cada um com dose, titulação, teto, quando,
   * cautela ⛔ e procedência. ⚠️ ⛔ É a **bula** do painel — ⛔ e ⛔ era ⛔ ela
   * que empurrava *"Registrar ação"* ⛔ para **⛔ 2948 px** abaixo do
   * problema, ⛔ no relato da mesma tarde.
   *
   * ⚠️⚠️ ⛔ **⛔ Fechados ⛔ não é escondidos**, ⛔ e a distinção ⛔ é o número
   * ⛔ na etiqueta: ⛔ o médico ⛔ vê ⛔ que ⛔ há oito ⛔ antes de decidir abrir.
   *
   * ⛔ ⛔ E a ressalva que **⛔ não pode** ficar atrás de toque ⛔ nenhum —
   * *"a diretriz vigente dá alvos ⛔ e ⛔ não nomeia fármaco"* — ⛔ segue
   * ⛔ **⛔ fora**, ⛔ acima do botão: ⛔ ela ⛔ não é detalhe ⛔ dos agentes,
   * ⛔ ela ⛔ é o **estatuto** ⛔ deles.
   */
  const [abertoPeloToque, setAbertoPeloToque] = useState(false);
  const agentesAbertos = agentesSempreAbertos || abertoPeloToque;
  return (
    <View style={e.terapeutica} testID={`${prefixo}terapeutica-pressao`}>
      <Text style={e.terapeuticaTitulo}>{tr("Agentes intravenosos")}</Text>
      {/**
        * ⚠️⚠️ ⛔ CADA AGENTE CARREGA A **SUA** PROCEDÊNCIA, ⛔ e ⛔ nunca uma
        * etiqueta genérica: ⛔ **a AHA/ASA 2026 ⛔ não nomeia fármaco algum**.
        * ⚠️ O trio preferencial é da edição de **2019**; esmolol ⛔ e
        * nicardipino têm **bula**; metoprolol ⛔ e nitroprussiato vêm de um
        * **manual brasileiro de 2013**.
        */}
      <Text style={e.terapeuticaNota}>
        {tr("A diretriz vigente dá alvos e não nomeia fármaco. Cada agente abaixo traz a sua própria procedência, e a escolha é do médico.")}
      </Text>

      {/**
        * ── ⚠️⚠️⚠️ ⛔ O `altoRisco` **⛔ ENCABEÇA** A CONDUTA — 2026-09-09 ────
        *
        * ⛔ ⛔ ⛔ **⛔ Corrigido ⛔ pela captura, ⛔ e ⛔ não pela medida.** ⛔ Ele
        * estava ⛔ **⛔ depois** dos agentes, ⛔ colado ⛔ em *"Alvos
        * pressóricos"* — ⛔ e ⛔ lia ⛔ como ⛔ se ⛔ falasse ⛔ **⛔ dos alvos**.
        * ⚠️ ⛔ A trava de overflow ⛔ passou; ⛔ a ⛔ de sentido ⛔ é ⛔ o olho.
        *
        * ⚠️ ⛔ *"Confirme… ⛔ **⛔ antes de executar** a conduta"* ⛔ tem de vir
        * ⛔ **⛔ antes** ⛔ da conduta. ⛔ Depois ⛔ dela ⛔ é ⛔ conselho ⛔ que
        * ⛔ chega tarde.
        */}
      <AvisoDeApoioClinico
        variante="altoRisco"
        ha
        tr={tr}
        testID={`${prefixo}aviso-alto-risco`}
      />

      {agentesSempreAbertos ? null : (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: agentesAbertos }}
        testID={`${prefixo}agentes-abrir`}
        onPress={() => setAbertoPeloToque((v) => !v)}
        style={({ pressed }) => [e.maisAlvos, pressed ? { opacity: 0.7 } : null]}
      >
        <Text style={e.maisAlvosTexto}>
          {agentesAbertos
            ? tr("Ocultar os agentes")
            : `${tr("Ver os agentes e as doses")} · ${AGENTES_ANTI_HIPERTENSIVOS.length}`}
        </Text>
      </Pressable>
      )}

      {/**
        * ⚠️⚠️ ⛔ `calculoDose` ⛔ **⛔ junto do número**, ⛔ e ⛔ só quando ⛔ ele
        * está ⛔ na tela: ⛔ com a gaveta fechada ⛔ **⛔ não há dose exibida**,
        * ⛔ e ⛔ um aviso sobre conferir dose ⛔ ali ⛔ qualificaria ⛔ o vazio.
        */}
      <AvisoDeApoioClinico
        variante="calculoDose"
        ha={agentesAbertos}
        tr={tr}
        testID={`${prefixo}aviso-calculo-dose`}
      />

      {!agentesAbertos ? null : AGENTES_ANTI_HIPERTENSIVOS.map((ag) => (
        <View key={ag.id} style={e.agente} testID={`${prefixo}agente-${ag.id}`}>
          <View style={e.agenteTopo}>
            <Text style={e.agenteNome}>{tr(ag.nome)}</Text>
            <Text style={e.agentePapel}>{tr(PAPEL_EM_PALAVRAS[ag.papel])}</Text>
          </View>
          {/** ⚠️ ⛔ Sem dose, ⛔ nenhuma é inventada — ⛔ a procedência diz por quê. */}
          {ag.dose ? <Text style={e.agenteDose}>{tr(ag.dose)}</Text> : null}
          {ag.titulacao ? <Text style={e.agenteLinha}>{tr(ag.titulacao)}</Text> : null}
          {ag.maximo ? <Text style={e.agenteLinha}>{tr("Máximo")}: {tr(ag.maximo)}</Text> : null}
          {ag.quando ? <Text style={e.agenteLinha}>{tr("Quando")}: {tr(ag.quando)}</Text> : null}
          {ag.cautela ? (
            <Text style={e.agenteCautela}>{tr("Cautela")}: {tr(ag.cautela)}</Text>
          ) : null}
          <Text style={e.agenteFonte}>{tr(ag.procedencia)}</Text>
          {/**
            * ── ⚠️⚠️⚠️ O ALERTA MORA ⛔ NO CARTÃO DELE — 2026-09-09 ──────────
            *
            * ⚠️ Relato do autor: *"por que tem esse aviso aqui? ⛔ não
            * entendi"*.
            *
            * ⛔ ⛔ ⛔ Ele estava **⛔ solto**, depois de ⛔ todos os agentes: a
            * tela mostrava o esmolol com a dose **⛔ certa** ⛔ e ⛔ então, três
            * cartões abaixo, avisava para ⛔ não usar ⛔ um número que ⛔ ela
            * ⛔ **⛔ nunca ofereceu**. ⚠️ ⛔ Ler um alerta sobre uma dose que
            * ⛔ não está ⛔ na tela ⛔ é ler um ⛔ não-sequitur — ⛔ e ⛔ o autor
            * ⛔ leu ⛔ exatamente ⛔ isso.
            *
            * ⚠️⚠️ ⛔ E ⛔ ele **⛔ não some**: o número perigoso existe ⛔ no
            * mundo, ⛔ num manual que ⛔ este módulo **⛔ cita** — ⛔ apagar o
            * aviso ⛔ deixaria o número circulando ⛔ e o médico ⛔ sem defesa.
            */}
          {ALERTA_DO_ESMOLOL.agente !== ag.id ? null : (
            <View style={e.alerta} testID={`${prefixo}alerta-esmolol`}>
              <Text style={e.alertaTitulo}>{tr(ALERTA_DO_ESMOLOL.titulo)}</Text>
              <Text style={e.alertaTexto}>{tr(ALERTA_DO_ESMOLOL.texto)}</Text>
            </View>
          )}
        </View>
      ))}

      {/**
        * ⚠️⚠️ OS ALVOS ⛔ NÃO COLAPSAM: 185/110 é **porta de entrada**;
        * 180/105 é **manutenção**; ⛔ e `<140` aparece com **dano declarado**
        * depois de recanalização.
        */}
      {/**
        * ── ⚠️⚠️⚠️ ⛔ UM ALVO ⛔ NA FRENTE, ⛔ SEIS A UM TOQUE — 2026-09-09 ────
        *
        * ⚠️ Decisão do autor: *"⛔ não tem necessidade desse monte de alvos,
        * vamos colocar o alvo mais bem aceito ⛔ e pronto, pode deixar o
        * restante… como expansível para consulta"*.
        *
        * ⛔ ⛔ **⛔ Nada some.** ⚠️ Sete alvos ⛔ empilhados ⛔ faziam o médico
        * atravessar **⛔ seis** ⛔ para achar ⛔ o que vale ⛔ agora — ⛔ e o que
        * vale agora ⛔ é ⛔ o da pergunta que ⛔ o trouxe aqui: **⛔ antes da
        * trombólise**.
        *
        * ⚠️⚠️ ⛔ E ⛔ **⛔ não colapsa ⛔ nada**: ⛔ 185/110 ⛔ é porta de
        * entrada, 180/105 ⛔ é manutenção, `<140` ⛔ tem **dano declarado** —
        * ⛔ continuam ⛔ sete, ⛔ com COR ⛔ e LOE. ⛔ Esconder ⛔ atrás de um
        * toque ⛔ não é dizer ⛔ que ⛔ são o mesmo.
        */}
      {/**
        * ── ⚠️⚠️⚠️ ⛔ O AVISO MORA **⛔ AQUI**, ⛔ e ⛔ não nas telas ────────────
        *
        * ⚠️ Decisão do autor, 2026-09-09: *"o aviso acompanha ⛔ o produtor da
        * saída clínica, ⛔ não a tela hospedeira"*.
        *
        * ⛔ ⛔ ⛔ Este desenho ⛔ é ⛔ **⛔ o mesmo** ⛔ na Estabilização ⛔ e ⛔ nas
        * Correções. ⛔ Colado ⛔ nas telas, ⛔ o aviso apareceria ⛔ **⛔ duas
        * vezes ⛔ ou ⛔ nenhuma** — ⛔ e ⛔ foi ⛔ este arquivo ⛔ que decidiu ⛔ a
        * regra ⛔ para os outros dez pontos.
        */}
      <Text style={e.terapeuticaTitulo}>{tr("Alvos pressóricos")}</Text>
      {(todosOsAlvos
        ? ALVOS_PRESSORICOS
        : ALVOS_PRESSORICOS.filter((a) => aplicaveis.includes(a.id))
      ).map(
        (alvo) => (
          <View key={alvo.id} style={e.alvo} testID={`${prefixo}alvo-${alvo.id}`}>
            <Text style={e.alvoGrau}>
              {alvo.apoioSemGrau
                ? tr("Texto de apoio da diretriz, sem grau de recomendação")
                : `${tr("COR")} ${alvo.cor} · ${tr("LOE")} ${alvo.loe}`}
            </Text>
            <Text style={e.alvoValor}>{tr(alvo.valor)}</Text>
            <Text style={e.alvoContexto}>{tr(alvo.contexto)}</Text>
          </View>
        )
      )}
      {/**
        * ⚠️⚠️ ⛔ FASE SEM ALVO PUBLICADO ⛔ É ⛔ **⛔ RESPOSTA**, ⛔ e ⛔ não vazio.
        *
        * ⛔ ⛔ Passadas as 24 h da trombólise, ⛔ a fonte ⛔ **⛔ não publica**
        * ⛔ alvo de fase. ⛔ Uma lista vazia ⛔ sem explicação ⛔ pareceria ⛔ tela
        * quebrada; ⛔ inventar um número ⛔ seria ⛔ **⛔ E-31**.
        */}
      {todosOsAlvos || aplicaveis.length > 0 ? null : (
        <Text style={e.alvoContexto} testID={`${prefixo}sem-alvo-de-fase`}>
          {tr(
            "A fonte não publica alvo pressórico para esta fase. Os alvos das fases anteriores seguem abaixo, para consulta."
          )}
        </Text>
      )}
      {/** ⚠️ ⛔ O número ⛔ na etiqueta: ⛔ o médico sabe **⛔ quanto** há atrás. */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: todosOsAlvos }}
        testID={`${prefixo}alvos-todos`}
        onPress={() => setTodosOsAlvos((v) => !v)}
        style={({ pressed }) => [e.maisAlvos, pressed ? { opacity: 0.7 } : null]}
      >
        <Text style={e.maisAlvosTexto}>
          {todosOsAlvos
            ? tr("Ocultar os outros alvos")
            : `${tr("Ver os outros alvos e as fontes")} · ${
                ALVOS_PRESSORICOS.filter((a) => !aplicaveis.includes(a.id)).length
              }`}
        </Text>
      </Pressable>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · GLICEMIA — F-06 e F-18
 * ────────────────────────────────────────────────────────────────────────── */

export function CondutaGlicemica({ prefixo }: { prefixo: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.terapeutica} testID={`${prefixo}terapeutica-glicemia`}>
      {/**
        * ⚠️⚠️ O bloco **abre pela pergunta**, ⛔ e ⛔ não pelas faixas: o que
        * decide ⛔ não é o número, ⛔ é o **déficit persistir depois da
        * correção**. ⛔ Uma tabela de cinco faixas no topo ensinaria o oposto.
        */}
      <View style={e.pergunta} testID={`${prefixo}pergunta-glicemia`}>
        <Text style={e.perguntaGrau}>{tr("COR")} {PERGUNTA_QUE_DECIDE.cor}</Text>
        <Text style={e.perguntaTexto}>{tr(PERGUNTA_QUE_DECIDE.pergunta)}</Text>
        <Text style={e.perguntaRamo}>
          {tr("Se persiste")}: {tr(PERGUNTA_QUE_DECIDE.sePersiste)}
        </Text>
        <Text style={e.perguntaRamo}>
          {tr("Se desaparece")}: {tr(PERGUNTA_QUE_DECIDE.seDesaparece)}
        </Text>
      </View>

      {/**
        * ⚠️ ⛔ `altoRisco` ⛔ no bloco da **conduta** — ⛔ aqui começa ⛔ o que
        * ⛔ se executa ⛔ no paciente.
        */}
      <AvisoDeApoioClinico
        variante="altoRisco"
        ha
        tr={tr}
        testID={`${prefixo}aviso-alto-risco-glicemia`}
      />

      <Text style={e.terapeuticaTitulo}>{tr("Como corrigir")}</Text>
      {/**
        * ⚠️⚠️ ⛔ `calculoDose` ⛔ **⛔ só se houver dose ⛔ exibida**.
        *
        * ⛔ ⛔ ⛔ E ⛔ aqui ⛔ isso ⛔ **⛔ não é sempre**: a insulina ⛔ entra
        * ⛔ **⛔ sem dose** ⛔ de propósito — *"⛔ não existe dose fixa
        * recomendada para o AVC"* —, ⛔ e ⛔ um caso em que ⛔ **⛔ nenhum**
        * tratamento trouxesse número ⛔ deixaria o aviso ⛔ qualificando ⛔ o
        * vazio.
        */}
      <AvisoDeApoioClinico
        variante="calculoDose"
        ha={TRATAMENTOS_GLICEMICOS.some((t) => t.dose !== undefined)}
        tr={tr}
        testID={`${prefixo}aviso-calculo-dose-glicemia`}
      />
      {TRATAMENTOS_GLICEMICOS.map((t) => (
        <View key={t.id} style={e.agente} testID={`${prefixo}glicemia-${t.id}`}>
          <Text style={e.agenteNome}>{tr(t.nome)}</Text>
          {/** ⚠️ ⛔ No caso da insulina, **a ausência de dose é a informação**. */}
          {t.dose ? <Text style={e.agenteDose}>{tr(t.dose)}</Text> : null}
          <Text style={e.agenteLinha}>{tr(t.quando)}</Text>
          {t.cautela ? <Text style={e.agenteCautela}>{tr(t.cautela)}</Text> : null}
          <Text style={e.agenteFonte}>{tr(t.procedencia)}</Text>
        </View>
      ))}

      <Text style={e.terapeuticaTitulo}>{tr("O que cada faixa significa")}</Text>
      {CORTES_GLICEMICOS.map((c) => (
        <View key={c.id} style={e.alvo} testID={`${prefixo}corte-${c.id}`}>
          <Text style={e.alvoValor}>{tr(c.faixa)}</Text>
          <Text style={e.alvoContexto}>{tr(c.natureza)} — {tr(c.conduta)}</Text>
          {/** ⚠️ ⛔ O que ⛔ **não** é fica escrito, ⛔ e ⛔ não implícito. */}
          <Text style={e.alvoNaoE}>{tr(c.naoE)}</Text>
        </View>
      ))}

      <Text style={e.terapeuticaTitulo}>{tr("Alvos glicêmicos")}</Text>
      {ALVOS_GLICEMICOS.map((a) => (
        <View key={a.id} style={e.alvo} testID={`${prefixo}alvo-glicemia-${a.id}`}>
          <Text style={e.alvoGrau}>
            {a.cor === "—" ? tr("Manejo hospitalar") : `${tr("COR")} ${a.cor}`}
          </Text>
          <Text style={e.alvoValor}>{tr(a.valor)}</Text>
          <Text style={e.alvoContexto}>{tr(a.contexto)}</Text>
        </View>
      ))}

      {/**
        * ⚠️⚠️ ⛔ O BLOCO DOS ERROS FICA **NA TELA**: `<50` ⛔ e `>400` foram,
        * por anos, critério de exclusão. ⚠️ Quem aprendeu assim ⛔ não
        * desaprende lendo uma faixa — ⛔ precisa ler que aquilo mudou, ⛔ e o
        * que ficou no lugar.
        */}
      <View style={e.alerta} testID={`${prefixo}erros-glicemia`}>
        <Text style={e.alertaTitulo}>{tr("Leituras antigas que hoje estão erradas")}</Text>
        {ERROS_A_EVITAR.map((x) => (
          <View key={x.errado} style={e.erro}>
            <Text style={e.erroErrado}>{tr(x.errado)}</Text>
            <Text style={e.erroCerto}>{tr(x.correto)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * ⚠️ O papel em palavras — ⛔ e ⛔ ele ⛔ não é ranking. ⚠️ *"Preferencial"* aqui
 * significa **estava na tabela de 2019**, ⛔ e ⛔ não *"funciona melhor"*.
 */
const PAPEL_EM_PALAVRAS: Readonly<Record<PapelDoAgente, string>> = {
  preferencial_2019: "Na tabela da AHA/ASA de 2019",
  alternativa: "Alternativa",
  historico_br: "Prática histórica brasileira",
  reserva: "Reserva para caso grave ou refratário",
};

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
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
    agentePapel: { ...PAPEL.micro, color: tema.cores.textSecondary, flexShrink: 0 },
    agenteDose: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    agenteLinha: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    agenteCautela: { ...PAPEL.textoSecundario, color: tema.cores.warning },
    agenteFonte: { ...PAPEL.legenda, color: tema.cores.textSecondary },
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
    /** ⚠️ ⛔ O acesso ao resto — ⛔ discreto, ⛔ e ⛔ visivelmente tocável. */
    maisAlvos: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    maisAlvosTexto: { ...PAPEL.textoSecundario, color: tema.cores.primary, fontWeight: "700" },
    alvoNaoE: { ...PAPEL.textoSecundario, color: tema.cores.info },
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
    erroErrado: {
      ...PAPEL.textoSecundario,
      color: tema.cores.textSecondary,
      textDecorationLine: "line-through",
    },
    erroCerto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
  });
