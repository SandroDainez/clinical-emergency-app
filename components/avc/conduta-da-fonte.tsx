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
import { StyleSheet, Text, View } from "react-native";

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
import { ESPACO, RAIO } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · PRESSÃO — F-19 dá os agentes; F-04 dá os alvos
 * ────────────────────────────────────────────────────────────────────────── */

export function CondutaDaPressao({ prefixo }: { prefixo: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
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

      {AGENTES_ANTI_HIPERTENSIVOS.map((ag) => (
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
        </View>
      ))}

      {/**
        * ⚠️⚠️ O ALERTA DO ESMOLOL fica **junto dos agentes**, ⛔ e ⛔ não numa
        * nota de rodapé: quem lê a dose do esmolol precisa ler isto ⛔ ali.
        */}
      <View style={e.alerta} testID={`${prefixo}alerta-esmolol`}>
        <Text style={e.alertaTitulo}>{tr(ALERTA_DO_ESMOLOL.titulo)}</Text>
        <Text style={e.alertaTexto}>{tr(ALERTA_DO_ESMOLOL.texto)}</Text>
      </View>

      {/**
        * ⚠️⚠️ OS ALVOS ⛔ NÃO COLAPSAM: 185/110 é **porta de entrada**;
        * 180/105 é **manutenção**; ⛔ e `<140` aparece com **dano declarado**
        * depois de recanalização.
        */}
      <Text style={e.terapeuticaTitulo}>{tr("Alvos pressóricos")}</Text>
      {ALVOS_PRESSORICOS.map((alvo) => (
        <View key={alvo.id} style={e.alvo} testID={`${prefixo}alvo-${alvo.id}`}>
          <Text style={e.alvoGrau}>
            {alvo.apoioSemGrau
              ? tr("Texto de apoio da diretriz, sem grau de recomendação")
              : `${tr("COR")} ${alvo.cor} · ${tr("LOE")} ${alvo.loe}`}
          </Text>
          <Text style={e.alvoValor}>{tr(alvo.valor)}</Text>
          <Text style={e.alvoContexto}>{tr(alvo.contexto)}</Text>
        </View>
      ))}
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

      <Text style={e.terapeuticaTitulo}>{tr("Como corrigir")}</Text>
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
