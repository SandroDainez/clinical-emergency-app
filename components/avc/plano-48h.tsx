/**
 * PLANO ATÉ 48 H — AGENDA NA TELA (T08, C08; autor, 2026-09-13, 14ª rodada).
 *
 * ⚠️ Esta camada só desenha `planoAte48h` (núcleo). ⛔ Nenhum prazo é calculado aqui.
 * ⚠️ "Próxima reavaliação" com horário local ⛔ e intervalo relativo; atraso ⛔ e antecipação
 * por piora ditos em palavra.
 * ⛔ Notificação em segundo plano ⛔ é presumida: o bloco diz que nada avisa com a tela fechada.
 */
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CAMPOS_DO_PLANO_48H, TITULO_DO_CAMINHO } from "../../avc/conteudo/plano-48h";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { planoAte48h, type EstadoDaTarefa, type QuandoDaTarefa, type TarefaDoPlano } from "../../avc/nucleo/plano-48h";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco, CampoDaSuperficie } from "./campos-clinicos";

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
  condicao: "condição",
  sem_prazo_transcrito: "sem prazo transcrito",
  sem_horario_de_origem: "sem horário do evento — nenhum prazo calculado",
};

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
  const plano = useMemo(() => planoAte48h(estado, agora), [estado, agora]);

  const relativo = (instante: number) => {
    const min = Math.round((instante - agora) / 60_000);
    return min >= 0 ? `(${tr("em")} ${min} min)` : `· ${tr("atrasada há")} ${-min} min`;
  };
  const hora = (instante: number) => horaDeExibicao(instante, agora);

  const p = plano.proximaReavaliacao;
  const textoDaProxima =
    p === undefined ? undefined
      : p.tipo === "agora" ? tr("agora — antecipada por piora")
        : p.tipo === "horario" ? `${hora(p.instante)} ${relativo(p.instante)}`
          : tr("sem intervalo transcrito para este caminho — a equipe define");

  const linhaDaTarefa = (t: TarefaDoPlano) => (
    <View key={t.id} style={e.tarefa} testID={`avc-plano-tarefa-${t.id}`}>
      <Text style={e.tarefaTitulo}>{tr(t.rotulo)}</Text>
      <Text style={e.linha}>
        {tr(ROTULO_DO_ESTADO[t.estado])}
        {t.conteudo === "pendente_de_validacao" && t.estado !== "conteudo_pendente" ? ` · ${tr("conteúdo pendente de validação")}` : ""}
        {" · "}
        {tr(ROTULO_DO_QUANDO[t.quando.tipo])}
        {t.quando.instante !== undefined ? ` ${hora(t.quando.instante)} ${relativo(t.quando.instante)}` : ""}
      </Text>
      <Text style={e.detalhe}>
        {tr("Evento de origem")}: {tr(t.eventoDeOrigem)} · {tr("Conclusão")}: {tr(t.criterioDeConclusao)}
      </Text>
      <Text style={e.detalhe}>
        {tr("Fonte")}: {tr(t.fonte)}
      </Text>
    </View>
  );

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

      {plano.caminhos.length === 0 ? (
        <Text style={e.linha} testID="avc-plano-sem-evento">
          {tr("Nenhum evento registrado abre o plano: início da trombólise, fim da trombectomia, decisão de não reperfundir ou hemorragia confirmada em imagem.")}
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

      {plano.encerrados.map((x) => (
        <Text key={x.caminho} style={e.linha} testID={`avc-plano-encerrado-${x.caminho}`}>
          {tr(TITULO_DO_CAMINHO[x.caminho])} — {tr("caminho encerrado")}: {tr(x.motivo)}
        </Text>
      ))}

      {plano.caminhos.map((c) => (
        <View key={c.id} style={e.caminho} testID={`avc-plano-caminho-${c.id}`}>
          <Text style={e.caminhoTitulo}>{tr(TITULO_DO_CAMINHO[c.id])}</Text>
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

      {/** ⚠️ Os eventos ⛔ os registros que concluem tarefas — registro da equipe. */}
      {CAMPOS_DO_PLANO_48H.map((campo) => {
        const valor = valorAtual(estado, campo.id)?.valor;
        return (
          <CampoDaSuperficie
            key={campo.id}
            campo={campo}
            casaAtual="destino"
            bruto={String(valor ?? "")}
            numero={typeof valor === "number" ? valor : undefined}
            agora={agora}
            detalheAberto={false}
            onAlternarDetalhe={() => undefined}
            onEscolher={onEscolher}
            onMedir={() => undefined}
            onHora={onHora}
            onDesfazer={onDesfazer}
          />
        );
      })}
    </View>
  );
}

function criarEstilos(tema: Tema) {
  return StyleSheet.create({
    raiz: { gap: ESPACO.sm },
    proxima: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    linha: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    detalhe: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    agenda: { gap: ESPACO.xs },
    caminho: { gap: ESPACO.xs, paddingTop: ESPACO.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tema.cores.border },
    caminhoTitulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    tarefa: { gap: 2 },
    tarefaTitulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "600" },
  });
}
