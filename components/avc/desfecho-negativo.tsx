/**
 * DESFECHO NEGATIVO DA REPERFUSÃO — TELA (AC-85; autor, 2026-09-13, 15ª rodada).
 *
 * ⚠️ Registro da equipe: motivo ⛔ horário da trombólise ("não prosseguir") ⛔ da trombectomia.
 * O caminho sem reperfusão abre só com os dois. ⚠️ A decisão global (decisão da equipe /
 * limitação terapêutica ⛔ recusa do paciente ou família) registra os DOIS com um gesto.
 * ⛔ Com trombólise administrada, "não prosseguir" ⛔ vale ⛔ e sai da tela.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CAMPOS_DE_DESFECHO, MOTIVOS_DA_DECISAO_GLOBAL } from "../../avc/conteudo/plano-48h";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { desfechosNegativos } from "../../avc/nucleo/plano-48h";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco, CampoDaSuperficie } from "./campos-clinicos";

export function DesfechoNegativo({
  estado,
  agora,
  onEscolher,
  onHora,
  onDesfazer,
  onDecisaoGlobal,
}: {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onDesfazer: (campo: string) => void;
  onDecisaoGlobal: (motivo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const d = desfechosNegativos(estado);
  const [global, setGlobal] = useState(false);
  const [motivo, setMotivo] = useState<string | undefined>(undefined);

  return (
    <View style={e.raiz} testID="avc-f-desfechos">
      <CabecalhoDeBloco titulo={tr("Desfecho negativo da reperfusão")} testID="avc-f-bloco-desfechos" />
      <Text style={e.nota}>
        {tr("Registro da equipe: motivo e horário de cada terapia. O caminho sem reperfusão abre só com os dois registrados.")}
      </Text>

      {CAMPOS_DE_DESFECHO.map((campo) => {
        /** ⚠️ Com trombólise administrada, "não prosseguir" ⛔ vale ⛔ e sai da tela. */
        if (d.ivtExposta && campo.id.startsWith("ivt_")) return null;
        const valor = valorAtual(estado, campo.id)?.valor;
        return (
          <CampoDaSuperficie
            key={campo.id}
            campo={campo}
            casaAtual="reperfusao"
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

      {d.ivtExposta ? null : (
        <View style={e.global}>
          <Pressable style={e.botao} accessibilityRole="button" testID="avc-f-decisao-global" onPress={() => setGlobal((v) => !v)}>
            <Text style={e.botaoTexto}>{tr("Decisão global: não reperfundir")}</Text>
          </Pressable>
          {global ? (
            <View style={e.global}>
              <Text style={e.nota}>{tr("Registra o mesmo motivo e o mesmo horário nos dois desfechos.")}</Text>
              <View style={e.linha}>
                {MOTIVOS_DA_DECISAO_GLOBAL.map((m) => (
                  <Pressable
                    key={m}
                    style={[e.opcao, motivo === m && e.opcaoAtiva]}
                    accessibilityRole="radio"
                    aria-checked={motivo === m}
                    testID={`avc-f-decisao-global-motivo-${m}`}
                    onPress={() => setMotivo(m)}
                  >
                    <Text style={e.opcaoTexto}>{tr(m)}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={e.botao}
                accessibilityRole="button"
                disabled={motivo === undefined}
                aria-disabled={motivo === undefined}
                testID="avc-f-decisao-global-agora"
                onPress={() => {
                  if (motivo === undefined) return;
                  onDecisaoGlobal(motivo);
                  setGlobal(false);
                  setMotivo(undefined);
                }}
              >
                <Text style={e.botaoTexto}>{tr("Registrar agora nos dois desfechos")}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function criarEstilos(tema: Tema) {
  return StyleSheet.create({
    raiz: { gap: ESPACO.sm },
    nota: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    global: { gap: ESPACO.xs },
    linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
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
    opcao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    opcaoAtiva: { borderColor: tema.cores.primary },
    opcaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
  });
}
