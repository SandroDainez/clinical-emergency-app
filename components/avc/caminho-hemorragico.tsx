/**
 * CAMINHO HEMORRÁGICO — TELA (A07; autor, 2026-09-13, 15ª rodada).
 *
 * ⚠️ Esta camada só desenha `caminhoHemorragico` (núcleo). ⚠️ Estado apenas: bloqueio da
 * reperfusão isquêmica com motivo, infusão (pede o registro da interrupção), tipo, anticoagulante
 * do Paciente ⛔ marcos da neurocirurgia. ⛔ Toda conduta: "conteúdo pendente de validação" com a
 * fonte candidata — ⛔ nenhum número.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CAMPOS_DO_CAMINHO_HEMORRAGICO, CONDUTAS_DO_CAMINHO_HEMORRAGICO } from "../../avc/conteudo/caminho-hemorragico";
import { caminhoHemorragico } from "../../avc/nucleo/caminho-hemorragico";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco, CampoDaSuperficie } from "./campos-clinicos";
import { MarcosDaTransferencia } from "./marcos-da-transferencia";

export function CaminhoHemorragico({
  estado,
  agora,
  onEscolher,
  onDesfazer,
  onAbrirSuperficie,
  onInterromperInfusao,
  onRegistrarMarco,
  onCorrigirHoraDoMarco,
  onMarcoPorEngano,
}: {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onDesfazer: (campo: string) => void;
  onAbrirSuperficie: (id: SuperficieId) => void;
  onInterromperInfusao: () => void;
  onRegistrarMarco: (tipo: string, observado: number, parecer?: { texto: string; autor: string }) => void;
  onCorrigirHoraDoMarco: (fatoId: string, observado: number) => void;
  onMarcoPorEngano: (fatoId: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const c = caminhoHemorragico(estado);
  if (!c.ativo) return null;
  const hora = (ms: number) => horaDeExibicao(ms, agora);

  return (
    <View style={e.raiz} testID="avc-hem-caminho">
      <CabecalhoDeBloco titulo={tr("Caminho hemorrágico")} testID="avc-g-bloco-hem-caminho" />

      <Text style={e.bloqueio} testID="avc-hem-bloqueio">
        {tr("Trombólise e trombectomia isquêmicas bloqueadas")}: {tr("hemorragia intracraniana identificada na imagem")}
        {c.desde !== undefined ? ` · ${hora(c.desde)}` : ""}
      </Text>

      {c.infusao === "em_curso" ? (
        <View style={e.bloco} testID="avc-hem-infusao">
          <Text style={e.linha}>{tr("Infusão em curso: registre a interrupção feita pela equipe.")}</Text>
          <Pressable style={e.botao} accessibilityRole="button" testID="avc-hem-registrar-interrupcao" onPress={onInterromperInfusao}>
            <Text style={e.botaoTexto}>{tr("Registrar interrupção da infusão agora")}</Text>
          </Pressable>
        </View>
      ) : c.infusao === "interrompida" ? (
        <Text style={e.linha} testID="avc-hem-infusao">
          {tr("Infusão interrompida às")} {c.interrompidaEm !== undefined ? hora(c.interrompidaEm) : tr("horário não registrado")}
        </Text>
      ) : null}

      {c.pendencias.filter((p) => p.id !== "registrar_interrupcao_da_infusao").map((p) => (
        <Text key={p.id} style={e.pendencia} testID={`avc-hem-pendencia-${p.id}`}>
          {tr(p.rotulo)}
        </Text>
      ))}

      <View style={e.bloco} testID="avc-hem-anticoagulante">
        <Text style={e.linha}>
          {tr("Anticoagulante em uso")}: {c.anticoagulante === undefined ? tr("não registrado") : c.anticoagulante.itens.map((i) => tr(i)).join(" · ")}
        </Text>
        <Pressable style={e.botao} accessibilityRole="button" testID="avc-hem-abrir-paciente" onPress={() => onAbrirSuperficie("paciente")}>
          <Text style={e.botaoTexto}>{tr("Registrar no Paciente")}</Text>
        </Pressable>
      </View>

      {/**
        * ⚠️ Os campos do caminho: o tipo é pergunta; os três da neurocirurgia são desenhados pelos
        * marcos (o parecer, texto ⛔ autor, mora no marco «Parecer registrado»).
        */}
      {CAMPOS_DO_CAMINHO_HEMORRAGICO.map((campo) => {
        if (campo.id === "neuro_marco") {
          return (
            <MarcosDaTransferencia
              key={campo.id}
              ator="neurocirurgia"
              estado={estado}
              agora={agora}
              onRegistrar={onRegistrarMarco}
              onCorrigirHora={onCorrigirHoraDoMarco}
              onEngano={onMarcoPorEngano}
            />
          );
        }
        if (campo.id === "neuro_parecer" || campo.id === "neuro_parecer_autor") return null;
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
            onHora={() => undefined}
            onDesfazer={onDesfazer}
          />
        );
      })}

      <View style={e.bloco} testID="avc-hem-condutas">
        {CONDUTAS_DO_CAMINHO_HEMORRAGICO.map((x) => (
          <View key={x.id} style={e.conduta} testID={`avc-hem-conduta-${x.id}`}>
            <Text style={e.condutaTitulo}>{tr(x.rotulo)}</Text>
            <Text style={e.pendencia}>{tr("conteúdo pendente de validação")}</Text>
            <Text style={e.detalhe}>
              {tr("Fonte candidata")}: {x.fontesCandidatas.map((f) => tr(f)).join(" · ")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function criarEstilos(tema: Tema) {
  return StyleSheet.create({
    raiz: { gap: ESPACO.sm },
    bloqueio: { ...PAPEL.textoPrincipal, color: tema.cores.critical, fontWeight: "700" },
    bloco: { gap: ESPACO.xs },
    linha: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    detalhe: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    pendencia: { ...PAPEL.legenda, color: tema.cores.text, fontWeight: "700" },
    conduta: { gap: 2, paddingTop: ESPACO.xs },
    condutaTitulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    botao: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    botaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.primary, fontWeight: "700" },
  });
}
