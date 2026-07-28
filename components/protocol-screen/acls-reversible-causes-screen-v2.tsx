import { StyleSheet, Text, View } from "react-native";

import { Badge, Card, ScreenTemplate, Tag } from "../ui-v2";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import {
  CAUSE_GROUPS,
  type Cause,
  type CauseGroup,
} from "./acls-reversible-causes-screen";

/**
 * Causas Reversíveis (5 Hs e 5 Ts) — versão UI 2.0 (Fase 6).
 *
 * Conteúdo clínico importado de `acls-reversible-causes-screen.tsx`.
 *
 * ── Sobre a cor, terceira vez ────────────────────────────────────────────────
 *
 * Aqui a distinção Hs × Ts é estrutural do próprio mnemônico — o médico procura
 * por grupo. Então os dois grupos recebem tons distintos, como nos Ritmos de
 * Parada, e não neutro como em Farmacologia e Pós-PCR.
 *
 * A diferença é o critério: cor marca uma distinção que muda a busca clínica, e
 * não a categoria administrativa de um item.
 */

/** Hs e Ts recebem tons distintos porque o mnemônico organiza a busca por grupo. */
const tomDoGrupo = (id: CauseGroup["id"]) =>
  id === "H" ? ("primary" as const) : ("warning" as const);

function CartaoDeCausa({ cause, group }: { cause: Cause; group: CauseGroup }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const tom = tomDoGrupo(group.id);

  return (
    <Card tom={tom} style={e.cartao}>
      <View style={e.cabecalho}>
        <Badge label={cause.letter} tom={tom} solido />
        <Text style={e.nome}>{tr(cause.name)}</Text>
      </View>

      <View style={e.secao}>
        <Text style={e.rotuloSecao}>{tr("Reconhecer")}</Text>
        {cause.clues.map((clue, i) => (
          <View key={i} style={e.linhaPista}>
            <View style={[e.marcador, e.marcadorTom[tom]]} />
            <Text style={e.textoPista}>{tr(clue)}</Text>
          </View>
        ))}
      </View>

      {/* Intervenção: preenchimento com o tom do grupo e TEXTO ESCURO. Os tons
          da paleta escura são cores claras — texto branco aqui reprovaria AA. */}
      <View style={[e.blocoIntervencao, e.intervencaoTom[tom]]}>
        <Text style={e.rotuloIntervencao}>{tr("Intervenção")}</Text>
        <Text style={e.textoIntervencao}>{tr(cause.intervention)}</Text>
      </View>

      {cause.interventionDetail ? (
        <Text style={e.notaIntervencao}>{tr(cause.interventionDetail)}</Text>
      ) : null}
    </Card>
  );
}

function CabecalhoDeGrupo({ group }: { group: CauseGroup }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const tom = tomDoGrupo(group.id);

  return (
    <Card tom={tom} style={e.cabecalhoGrupo}>
      <Badge label={group.id} tom={tom} solido />
      <View style={e.textosGrupo}>
        <Text style={[e.tituloGrupo, e.rotuloTom[tom]]}>{tr(group.groupLabel)}</Text>
        <Text style={[e.subtituloGrupo, e.rotuloTom[tom]]}>{tr(group.groupSubtitle)}</Text>
      </View>
    </Card>
  );
}

const CHECKLIST_HS = [
  "Hipóxia",
  "Hipovolemia",
  "Hidrogênio (acidose)",
  "Hipo/Hipercalemia",
  "Hipotermia",
];
const CHECKLIST_TS = [
  "Tensão (PTX)",
  "Tamponamento",
  "Trombose coronária",
  "Tromboembolia pulmonar",
  "Tóxicos",
];

export default function AclsReversibleCausesScreenV2({
  onVoltar,
}: {
  onVoltar?: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <ScreenTemplate
      titulo={tr("Causas Reversíveis")}
      etapa={tr("5 Hs e 5 Ts")}
      onVoltar={onVoltar}
      testID="tela-causas-reversiveis-v2"
    >
      <Card style={e.cartaoIntro}>
        <Tag label={tr("ACLS · Referência")} />
        <Text style={e.corpoIntro}>
          {tr(
            "Durante toda PCR sem causa óbvia, pesquise e trate as causas reversíveis em paralelo com a RCP. O reconhecimento e a intervenção precoce são determinantes para o ROSC."
          )}
        </Text>
      </Card>

      {/* Checklist mental: as duas colunas do mnemônico, lado a lado. */}
      <Card style={e.cartaoChecklist}>
        <Text style={e.tituloChecklist}>{tr("Checklist mental — revisão rápida")}</Text>
        <View style={e.colunas}>
          <View style={e.coluna}>
            <Text style={[e.tituloColuna, e.rotuloTom.primary]}>{tr("5 Hs")}</Text>
            {CHECKLIST_HS.map((h) => (
              <View key={h} style={e.itemChecklist}>
                <View style={[e.marcador, e.marcadorTom.primary]} />
                <Text style={e.textoChecklist}>{tr(h)}</Text>
              </View>
            ))}
          </View>
          <View style={e.divisoria} />
          <View style={e.coluna}>
            <Text style={[e.tituloColuna, e.rotuloTom.warning]}>{tr("5 Ts")}</Text>
            {CHECKLIST_TS.map((t) => (
              <View key={t} style={e.itemChecklist}>
                <View style={[e.marcador, e.marcadorTom.warning]} />
                <Text style={e.textoChecklist}>{tr(t)}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {CAUSE_GROUPS.map((group) => (
        <View key={group.id} style={e.grupo}>
          <CabecalhoDeGrupo group={group} />
          {group.causes.map((cause) => (
            <CartaoDeCausa key={cause.name} cause={cause} group={group} />
          ))}
        </View>
      ))}

      <Card style={e.cartaoRodape}>
        <Text style={e.tituloRodape}>{tr("Quando suspeitar de causa reversível?")}</Text>
        <Text style={e.corpoRodape}>
          {tr(
            "AESP e assistolia têm sempre uma causa subjacente — pesquise sistematicamente. Mesmo em FV refratária, uma causa reversível não tratada impede o ROSC. Use US à beira leito (POCUS) sempre que disponível para tamponamento, TEP e hipovolemia."
          )}
        </Text>
        <View style={e.regua} />
        <Text style={e.fonte}>
          {tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)")}
        </Text>
      </Card>
    </ScreenTemplate>
  );
}

const criarEstilos = (t: Tema) => {
  const c = t.cores;
  return {
    ...StyleSheet.create({
      cartaoIntro: { gap: ESPACO.sm },
      corpoIntro: { ...TIPOGRAFIA.caption, color: c.textSecondary, fontWeight: "400" },

      // ── Checklist ──
      cartaoChecklist: { gap: ESPACO.sm },
      // Caixa alta como no antigo (checklistTitle).
      tituloChecklist: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 1,
      },
      colunas: { flexDirection: "row", gap: ESPACO.md },
      coluna: { flex: 1, gap: ESPACO.xs },
      divisoria: { width: 1, backgroundColor: c.border },
      tituloColuna: { ...TIPOGRAFIA.caption, fontWeight: "800" },
      itemChecklist: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      textoChecklist: { flex: 1, ...TIPOGRAFIA.micro, color: c.textSecondary },

      // ── Grupo ──
      grupo: { gap: ESPACO.sm },
      cabecalhoGrupo: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      textosGrupo: { flex: 1, gap: 2 },
      tituloGrupo: { ...TIPOGRAFIA.caption, fontWeight: "800" },
      subtituloGrupo: { ...TIPOGRAFIA.micro, fontWeight: "500" },

      // ── Causa ──
      cartao: { gap: ESPACO.md },
      cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      nome: { flex: 1, ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },

      secao: { gap: ESPACO.xs },
      // Caixa alta como no antigo (sectionLabel).
      rotuloSecao: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 1,
      },
      linhaPista: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.sm },
      marcador: { width: 6, height: 6, borderRadius: RAIO.badge },
      textoPista: { flex: 1, ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

      blocoIntervencao: { borderRadius: RAIO.botao, padding: ESPACO.md, gap: ESPACO.xs },
      // Caixa alta como no antigo (interventionLabel).
      rotuloIntervencao: {
        ...TIPOGRAFIA.micro,
        color: "rgba(11,18,32,0.75)",
        textTransform: "uppercase",
        letterSpacing: 1,
      },
      textoIntervencao: { ...TIPOGRAFIA.caption, color: "#0b1220", fontWeight: "800" },
      notaIntervencao: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

      cartaoRodape: { gap: ESPACO.sm },
      tituloRodape: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },
      corpoRodape: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
      regua: { height: 1, backgroundColor: c.border },
      fonte: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    }),

    marcadorTom: StyleSheet.create({
      primary: { backgroundColor: c.primary },
      warning: { backgroundColor: c.warning },
    }),
    rotuloTom: StyleSheet.create({
      primary: { color: c.primary },
      warning: { color: c.warning },
    }),
    intervencaoTom: StyleSheet.create({
      primary: { backgroundColor: c.primary },
      warning: { backgroundColor: c.warning },
    }),
  };
};
