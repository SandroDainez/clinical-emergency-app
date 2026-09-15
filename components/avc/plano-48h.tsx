/**
 * PLANO ATÉ 48 H — AGENDA NA TELA (T08, C08; autor, 2026-09-13, 14ª ⛔ 15ª rodadas).
 *
 * ⚠️ Esta camada só desenha `planoAte48h` (núcleo). ⛔ Nenhum prazo é calculado aqui.
 * ⚠️ "Próxima reavaliação" com horário local ⛔ e intervalo relativo em horas ⛔ minutos; atraso ⛔
 * antecipação por piora ditos em palavra.
 * ⚠️ 15ª rodada (capturas da 14ª): o relógio da agenda anda com a tela parada (AC-89, defeito);
 * o evento de origem é dito uma vez, no título do caminho; os eventos ficam no topo ⛔ o resultado
 * de cada tarefa, na própria tarefa.
 * ⛔ Notificação em segundo plano ⛔ é presumida: o bloco diz que nada avisa com a tela fechada.
 */
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  CAMPOS_DE_EVENTO_DO_PLANO,
  CAMPOS_DE_RESULTADO_DO_PLANO,
  TAREFA_DO_RESULTADO,
  TITULO_DO_CAMINHO,
} from "../../avc/conteudo/plano-48h";
import type { Campo } from "../../avc/conteudo/campo";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { caminhoHemorragico } from "../../avc/nucleo/caminho-hemorragico";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { planoAte48h, textoDoIntervalo, type EstadoDaTarefa, type QuandoDaTarefa, type TarefaDoPlano } from "../../avc/nucleo/plano-48h";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco, CampoDaSuperficie } from "./campos-clinicos";
import { Recolhido } from "./ui";

const ROTULO_DO_ESTADO: Readonly<Record<EstadoDaTarefa, string>> = {
  pendente: "pendente",
  atrasada: "atrasada",
  concluida: "concluída",
  retida: "retida",
  condicao_atendida: "condição registrada — decisão da equipe",
  antecipada: "antecipada por piora",
  conteudo_pendente: "conteúdo pendente de validação",
};

const ROTULO_DO_QUANDO: Readonly<Record<QuandoDaTarefa["tipo"], string>> = {
  prazo: "prazo",
  periodica: "próxima",
  condicao: "depende de registro",
  sem_prazo_transcrito: "sem prazo definido na fonte",
  sem_horario_de_origem: "sem horário do evento — nenhum prazo calculado",
};

/** ⚠️ AC-89 (defeito, 15ª rodada): "em 14 min" ⛔ pode ficar parado numa tela aberta. */
const PASSO_DO_RELOGIO_MS = 30_000;

export function PlanoAte48h({
  estado,
  agora,
  onEscolher,
  onHora,
  onDesfazer,
}: {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onDesfazer: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [agoraVivo, setAgoraVivo] = useState(agora);
  const [infoAberta, setInfoAberta] = useState<readonly string[]>([]);
  const alternarInfo = (id: string) => setInfoAberta((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  useEffect(() => {
    setAgoraVivo(agora);
    const id = setInterval(() => setAgoraVivo(Date.now()), PASSO_DO_RELOGIO_MS);
    return () => clearInterval(id);
  }, [agora]);
  const plano = useMemo(() => planoAte48h(estado, agoraVivo), [estado, agoraVivo]);
  /** ⚠️ AC-15 bloco D (E9): com HSA confirmada, o caminho hemorrágico do plano ⛔ se chama «HIC». */
  const nomeDoHemorragico = useMemo(() => caminhoHemorragico(estado).nome, [estado]);
  const tituloDoCaminho = (id: keyof typeof TITULO_DO_CAMINHO) =>
    id === "hemorragia" && nomeDoHemorragico === "hsa" ? "Hemorragia subaracnóidea (HSA)" : TITULO_DO_CAMINHO[id];
  const resultadoPorTarefa = useMemo(
    () => new Map<string, Campo>(CAMPOS_DE_RESULTADO_DO_PLANO.map((c) => [TAREFA_DO_RESULTADO[c.id], c])),
    []
  );

  const relativo = (instante: number) => {
    const min = Math.round((instante - agoraVivo) / 60_000);
    return min >= 0 ? `(${tr("em")} ${textoDoIntervalo(min)})` : `· ${tr("atrasada há")} ${textoDoIntervalo(-min)}`;
  };
  const hora = (instante: number) => horaDeExibicao(instante, agoraVivo);

  const campo = (c: Campo) => {
    const valor = valorAtual(estado, c.id)?.valor;
    return (
      <CampoDaSuperficie
        key={c.id}
        campo={c}
        casaAtual="destino"
        bruto={String(valor ?? "")}
        numero={typeof valor === "number" ? valor : undefined}
        agora={agoraVivo}
        detalheAberto={false}
        onAlternarDetalhe={() => undefined}
        onEscolher={onEscolher}
        onMedir={() => undefined}
        onHora={onHora}
        onDesfazer={onDesfazer}
      />
    );
  };

  const p = plano.proximaReavaliacao;
  const textoDaProxima =
    p === undefined ? undefined
      : p.tipo === "agora" ? tr("agora — antecipada por piora")
        : p.tipo === "horario" ? `${hora(p.instante)} ${relativo(p.instante)}`
          : tr("sem intervalo definido na fonte para este caminho — a equipe define");

  const linhaDaTarefa = (t: TarefaDoPlano) => {
    const campoDoResultado = resultadoPorTarefa.get(t.id);
    return (
      <View key={t.id} style={e.tarefa} testID={`avc-plano-tarefa-${t.id}`}>
        <Text style={e.tarefaTitulo}>{tr(t.rotulo)}</Text>
        <Text style={e.linha}>
          {tr(ROTULO_DO_ESTADO[t.estado])}
          {t.resultado !== undefined ? ` · ${tr("resultado")}: ${tr(t.resultado)}` : ""}
          {t.conteudo === "pendente_de_validacao" && t.estado !== "conteudo_pendente" ? ` · ${tr("conteúdo pendente de validação")}` : ""}
          {t.quando.instante !== undefined ? ` · ${tr(ROTULO_DO_QUANDO[t.quando.tipo])} ${hora(t.quando.instante)} ${relativo(t.quando.instante)}` : ""}
        </Text>
        {/** ⚠️ 16ª rodada (regressão das capturas): conclusão ⛔ fonte moram no ⓘ — ⛔ no card. */}
        <Recolhido id={`plano-${t.id}`} aberto={infoAberta.includes(t.id)} onAlternar={() => alternarInfo(t.id)}>
          <Text style={e.detalhe}>
            {tr("Conclusão")}: {tr(t.criterioDeConclusao)}
          </Text>
          <Text style={e.detalhe}>
            {tr("Fonte")}: {tr(t.fonte)}
          </Text>
        </Recolhido>
        {campoDoResultado !== undefined ? campo(campoDoResultado) : null}
      </View>
    );
  };

  return (
    <View style={e.raiz} testID="avc-plano-48h">
      <CabecalhoDeBloco titulo={tr("Plano até 48 h")} testID="avc-g-bloco-plano-48h" />

      {textoDaProxima !== undefined ? (
        <Text style={e.proxima} testID="avc-plano-proxima-reavaliacao">
          {tr("Próxima reavaliação")}: {textoDaProxima}
        </Text>
      ) : null}
      <Text style={e.detalhe} testID="avc-plano-sem-notificacao">
        {tr("Sem aviso em segundo plano: com a tela fechada, nada avisa que uma reavaliação venceu. Consulte esta agenda.")}
      </Text>

      {plano.pendencias.map((x) => (
        <Text key={x.id} style={e.pendencia} testID={`avc-plano-pendencia-${x.id}`}>
          {tr(x.rotulo)}
        </Text>
      ))}

      {/** ⚠️ Os eventos que abrem caminho, no topo — ⛔ a telas de distância das tarefas. */}
      {CAMPOS_DE_EVENTO_DO_PLANO.map(campo)}

      {plano.caminhos.length === 0 ? (
        <Text style={e.linha} testID="avc-plano-sem-evento">
          {tr("Nenhum evento registrado abre o plano: início da trombólise, fim da trombectomia, desfechos negativos de trombólise e trombectomia ou hemorragia confirmada em imagem.")}
        </Text>
      ) : (
        <View style={e.agenda} testID="avc-plano-agenda">
          <Text style={e.tarefaTitulo}>{tr("Agenda")}</Text>
          {plano.agenda.length === 0 ? (
            <Text style={e.linha}>{tr("Sem horário calculável na agenda.")}</Text>
          ) : (
            plano.agenda.map((a) => (
              <Text key={`${a.caminho}-${a.tarefaId}`} style={e.linha} testID={`avc-plano-agenda-${a.tarefaId}`}>
                {hora(a.instante)} {relativo(a.instante)} · {tr(a.rotulo)}
              </Text>
            ))
          )}
        </View>
      )}

      {plano.incertezas.map((x) => (
        <Text key={`incerto-${x.caminho}`} style={e.linha} testID={`avc-plano-incerto-${x.caminho}`}>
          {tr(tituloDoCaminho(x.caminho))} — {tr(x.motivo)}
        </Text>
      ))}
      {plano.encerrados.map((x) => (
        <Text key={x.caminho} style={e.linha} testID={`avc-plano-encerrado-${x.caminho}`}>
          {tr(tituloDoCaminho(x.caminho))} — {tr("caminho encerrado")}: {tr(x.motivo)}
        </Text>
      ))}

      {plano.caminhos.map((c) => (
        <View key={c.id} style={e.caminho} testID={`avc-plano-caminho-${c.id}`}>
          <Text style={e.caminhoTitulo}>{tr(tituloDoCaminho(c.id))}</Text>
          <Text style={e.detalhe}>
            {tr("Evento de origem")}: {tr(c.origem.evento)}
            {c.origem.instante !== undefined ? ` · ${hora(c.origem.instante)}` : ` · ${tr("horário desconhecido — nenhum prazo calculado")}`}
          </Text>
          {c.tarefas.map(linhaDaTarefa)}
        </View>
      ))}

      {plano.transversais.length > 0 ? (
        <View style={e.caminho} testID="avc-plano-transversais">
          <Text style={e.caminhoTitulo}>{tr("Tarefas transversais")}</Text>
          {plano.transversais.map(linhaDaTarefa)}
        </View>
      ) : null}
    </View>
  );
}

function criarEstilos(tema: Tema) {
  return StyleSheet.create({
    raiz: { gap: ESPACO.sm },
    proxima: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    linha: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    detalhe: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    pendencia: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    agenda: { gap: ESPACO.xs },
    caminho: { gap: ESPACO.xs, paddingTop: ESPACO.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tema.cores.border },
    caminhoTitulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    tarefa: { gap: 2, paddingTop: ESPACO.xs },
    tarefaTitulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "600" },
  });
}
