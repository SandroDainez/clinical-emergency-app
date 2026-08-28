/**
 * SUPERFÍCIE A · Entrada e estabilização — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/superficie-a.ts`,
 * leituras vêm de `avc/nucleo/derivacoes.ts`, e esta camada só desenha (E-29).
 *
 * ⚠️ O que a tela precisa mostrar sem inventar:
 *   · os três estados de resposta distinguíveis (E-37);
 *   · toda leitura com os insumos e a fonte que a produziram (E-22, E-30);
 *   · ⛔ nenhum campo obrigatório (E-49) — a superfície não trava nada.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  GRUPOS_A,
  type CampoA,
} from "../../avc/conteudo/superficie-a";
import { leiturasDaSuperficieA, type Leitura } from "../../avc/nucleo/derivacoes";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  onEscolher: (campo: string, valor: string) => void;
  onAjustar: (campo: string, delta: number) => void;
  onHora: (campo: string, relogio?: string) => void;
};

/** ⚠️ O símbolo acompanha a cor — significado nunca depende só dela (E-39). */
const SIMBOLO: Record<Leitura["conclusao"], string> = {
  sim: "●",
  nao: "○",
  desconhecido: "?",
};

export default function SuperficieA({ estado, onEscolher, onAjustar, onHora }: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const leituras = leiturasDaSuperficieA(estado);

  function valorExibido(campo: CampoA): string {
    const f = valorAtual(estado, campo.id);
    if (!f) return tr("não informado");
    const v = String(f.valor);
    // ⚠️ E-37: os três vazios não podem parecer a mesma coisa na tela.
    if (v === "nao_sei") return tr("Não sei");
    if (v === "nao_perguntado") return tr("não informado");
    return campo.unidade ? `${v} ${campo.unidade}` : tr(v);
  }

  function foiInformado(campo: CampoA): boolean {
    return valorAtual(estado, campo.id) !== undefined;
  }

  return (
    <View style={e.raiz} testID="avc-superficie-a-conteudo">
      {GRUPOS_A.map((grupo) => (
        <View key={grupo.titulo} style={e.grupo}>
          <Text style={e.grupoTitulo}>{tr(grupo.titulo).toUpperCase()}</Text>

          {grupo.campos.map((campo) => (
            <View key={campo.id} style={e.campo} testID={`avc-campo-${campo.id}`}>
              <View style={e.campoTopo}>
                <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
                <Text style={[e.campoValor, !foiInformado(campo) && e.campoValorVazio]}>
                  {valorExibido(campo)}
                </Text>
              </View>

              {campo.nota ? <Text style={e.campoNota}>{tr(campo.nota)}</Text> : null}

              {/* ⚠️ Grandeza: valor visível + ajuste fino tocável. ⛔ Sem texto livre.
                  A barra deslizante entra quando a superfície ganhar interação
                  completa; o ajuste fino já existe e é o que a fonte exige para
                  precisão (§0.3). */}
              {campo.tipo === "grandeza" ? (
                <View style={e.linhaDeControle}>
                  <Pressable
                    style={e.botaoFino}
                    accessibilityRole="button"
                    accessibilityLabel={`${tr(campo.rotulo)} −`}
                    testID={`avc-menos-${campo.id}`}
                    onPress={() => onAjustar(campo.id, -1)}
                  >
                    <Text style={e.botaoFinoTexto}>−</Text>
                  </Pressable>
                  <Pressable
                    style={e.botaoFino}
                    accessibilityRole="button"
                    accessibilityLabel={`${tr(campo.rotulo)} +`}
                    testID={`avc-mais-${campo.id}`}
                    onPress={() => onAjustar(campo.id, +1)}
                  >
                    <Text style={e.botaoFinoTexto}>+</Text>
                  </Pressable>
                </View>
              ) : null}

              {/* ⚠️ Escolha tocável, com saída para quem não sabe sempre presente. */}
              {campo.tipo === "escolha" && campo.opcoes ? (
                <View style={e.opcoes}>
                  {campo.opcoes.map((op) => {
                    const bruto = op === "Não sei" ? "nao_sei" : op === "Sim" ? "sim" : op === "Não" ? "nao" : op;
                    const ativa = String(valorAtual(estado, campo.id)?.valor ?? "") === bruto;
                    return (
                      <Pressable
                        key={op}
                        style={[e.opcao, ativa && e.opcaoAtiva]}
                        accessibilityRole="button"
                        testID={`avc-opcao-${campo.id}-${bruto}`}
                        onPress={() => onEscolher(campo.id, bruto)}
                      >
                        <Text style={[e.opcaoTexto, ativa && e.opcaoTextoAtivo]}>{tr(op)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {/* ⚠️ Hora: picker, ⛔ nunca barra. E o controle NOMEIA o relógio (E-36). */}
              {campo.tipo === "hora" ? (
                <Pressable
                  style={e.botaoHora}
                  accessibilityRole="button"
                  testID={`avc-hora-${campo.id}`}
                  onPress={() => onHora(campo.id, campo.relogio)}
                >
                  <Text style={e.botaoHoraTexto}>{tr("Registrar horário")}</Text>
                </Pressable>
              ) : null}

              <Text style={e.campoFonte}>{campo.fonte}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* ── LEITURAS DO SISTEMA ────────────────────────────────────────────
          ⚠️ E-46: são APOIO ao julgamento, ⛔ nunca veredito. Cada uma mostra os
          insumos que a produziram e o slot de fonte que a sustenta. */}
      <View style={e.grupo}>
        <Text style={e.grupoTitulo}>{tr("LEITURA DO SISTEMA")}</Text>
        <Text style={e.leituraAviso}>
          {tr("Apoio ao julgamento clínico. A decisão permanece do médico.")}
        </Text>
        {leituras.map((l) => (
          <View key={l.id} style={e.leitura} testID={`avc-leitura-${l.id}`}>
            <Text style={e.leituraTexto}>
              {SIMBOLO[l.conclusao]} {tr(l.texto)}
            </Text>
            <Text style={e.leituraInsumos}>
              {tr("a partir de")}: {l.insumos.join(", ")} · {l.fonte}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.sm },
    grupoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700", letterSpacing: 1,
    },
    campo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
    },
    campoTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: ESPACO.sm },
    campoRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flexShrink: 1 },
    campoValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
    campoValorVazio: { color: tema.cores.textSecondary, fontWeight: "400", fontStyle: "italic" },
    campoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    campoFonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize, alignSelf: "flex-end" },
    linhaDeControle: { flexDirection: "row", gap: ESPACO.sm },
    botaoFino: {
      minWidth: TOQUE.minimo, minHeight: TOQUE.minimo,
      alignItems: "center", justifyContent: "center",
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
    },
    botaoFinoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    opcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    opcao: {
      paddingVertical: ESPACO.sm, paddingHorizontal: ESPACO.sm,
      minHeight: TOQUE.minimo, justifyContent: "center",
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
    },
    opcaoAtiva: { backgroundColor: tema.cores.primary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    opcaoTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },
    botaoHora: {
      minHeight: TOQUE.minimo, justifyContent: "center", alignItems: "center",
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao, paddingHorizontal: ESPACO.sm,
    },
    botaoHoraTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    leituraAviso: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize, fontStyle: "italic" },
    leitura: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao, padding: ESPACO.sm, gap: 2,
      borderLeftWidth: 3, borderLeftColor: tema.cores.border,
    },
    leituraTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    leituraInsumos: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
  });
