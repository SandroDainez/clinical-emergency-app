import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, Tag } from "../ui-v2";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import ReferenceBackHeader from "./reference-back-header";
import {
  RHYTHM_GROUPS,
  type Rhythm,
  type RhythmGroup,
} from "./acls-rhythms-screen";

/**
 * Ritmos de Parada — versão UI 2.0 (piloto da Fase 3).
 *
 * Substituição mecânica de apresentação, e só isso:
 *
 * - O conteúdo clínico é importado de `acls-rhythms-screen.tsx`, não copiado.
 *   Duplicar o array deixaria as duas telas livres para divergir em dose e
 *   conduta sem aviso.
 * - `ReferenceBackHeader` continua o mesmo: ele faz `router.back()`, e navegação
 *   é lógica — está fora do que esta fase pode tocar.
 * - Os textos são idênticos, passando pelo mesmo `tr()`. Só a hierarquia visual
 *   muda. Há um teste que compara o texto das duas versões palavra por palavra.
 *
 * O que muda de fato: cor vem dos tokens em vez de hex solto; espaçamento vem da
 * grade de 4/8/16/24/32; `Card`, `Badge` e `Tag` substituem as `View` com estilo
 * próprio; e o accent de cada grupo passa a ser semântico — `critical` para
 * chocáveis, `primary` para não chocáveis — em vez de hex escolhido à mão.
 *
 * Escolhida como piloto por ser a tela de menor risco clínico do app: sem
 * cronômetro, sem voz, sem máquina de estados, sem persistência e sem decisão
 * (ver MAPA-APP.md §6).
 */

/** Tom semântico do grupo — substitui os quatro hex que cada grupo carregava. */
const tomDoGrupo = (id: RhythmGroup["id"]) =>
  id === "shockable" ? ("critical" as const) : ("primary" as const);

function CartaoDeRitmo({ rhythm, group }: { rhythm: Rhythm; group: RhythmGroup }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const tom = tomDoGrupo(group.id);

  return (
    <Card tom={tom} style={e.cartao}>
      {/* Cabeçalho: sigla + nome */}
      <View style={e.cabecalho}>
        <Badge label={tr(rhythm.abbr)} tom={tom} />
        <Text style={e.nome}>{tr(rhythm.name)}</Text>
      </View>

      {/* Padrão no monitor */}
      <View style={[e.blocoEcg, e.blocoEcgTom[tom]]}>
        <Text style={[e.rotuloSecao, e.rotuloTom[tom]]}>{tr("Padrão no monitor")}</Text>
        <Text style={e.textoEcg}>{tr(rhythm.ecgPattern)}</Text>

        <View style={e.metaLinha}>
          <View style={e.metaItem}>
            <Text style={e.metaRotulo}>{tr("FC")}</Text>
            <Text style={e.metaValor}>{tr(rhythm.rate)}</Text>
          </View>
          <View style={e.metaDivisoria} />
          <View style={e.metaItem}>
            <Text style={e.metaRotulo}>{tr("Regularidade")}</Text>
            <Text style={e.metaValor}>{tr(rhythm.regularity)}</Text>
          </View>
        </View>
      </View>

      {/* Reconhecimento rápido */}
      <View style={e.blocoPontos}>
        <Text style={e.rotuloSecao}>{tr("Reconhecimento rápido")}</Text>
        {rhythm.bullets.map((b) => (
          <View key={b.label} style={e.linhaPonto}>
            <View style={[e.marcador, e.marcadorTom[tom]]} />
            <Text style={e.pontoRotulo}>{tr(b.label)}:</Text>
            <Text style={e.pontoValor}>{tr(b.value)}</Text>
          </View>
        ))}
      </View>

      {/* Conduta — preenchimento com o accent e TEXTO ESCURO por cima. O accent é
          uma cor clara: texto branco aqui dava 2,54:1, abaixo de AA. */}
      <View style={[e.blocoConduta, e.condutaTom[tom]]}>
        <Text style={e.condutaRotulo}>{tr("Conduta")}</Text>
        <Text style={e.condutaTexto}>{tr(rhythm.management)}</Text>
      </View>

      {rhythm.managementNote ? (
        <Text style={e.notaConduta}>{tr(rhythm.managementNote)}</Text>
      ) : null}
    </Card>
  );
}

function CabecalhoDeGrupo({ group }: { group: RhythmGroup }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const tom = tomDoGrupo(group.id);

  return (
    <Card tom={tom} style={e.cabecalhoGrupo}>
      <View style={e.cabecalhoGrupoLinha}>
        <View style={[e.marcador, e.marcadorTom[tom]]} />
        <Text style={[e.tituloGrupo, e.rotuloTom[tom]]}>{tr(group.label)}</Text>
      </View>
      <Text style={[e.subtituloGrupo, e.rotuloTom[tom]]}>{tr(group.sublabel)}</Text>
    </Card>
  );
}

export default function AclsRhythmsScreenV2() {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <ScrollView
      style={e.scroll}
      contentContainerStyle={e.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <ReferenceBackHeader label={tr("ACLS · Ritmos de Parada")} />

      <Card style={e.cartaoIntro}>
        <Tag label={tr("ACLS · Referência")} />
        <Text style={e.tituloIntro}>{tr("Ritmos de Parada")}</Text>
        <Text style={e.corpoIntro}>
          {tr(
            "O reconhecimento correto do ritmo é o passo decisivo após confirmar a ausência de pulso. A análise deve ser rápida (< 10 s) e pausar minimamente as compressões."
          )}
        </Text>
        <View style={e.regua} />
        <Text style={e.dicaIntro}>
          {tr("Dois grupos:")}{" "}
          <Text style={e.destaqueChocavel}>{tr("chocáveis")}</Text>{" "}
          {tr("(FV e TV sp) e")}{" "}
          <Text style={e.destaqueNaoChocavel}>{tr("não chocáveis")}</Text>{" "}
          {tr(
            "(AESP e assistolia). A conduta inicial difere — desfibrilação imediata vs. RCP contínua."
          )}
        </Text>
      </Card>

      {RHYTHM_GROUPS.map((group) => (
        <View key={group.id} style={e.grupo}>
          <CabecalhoDeGrupo group={group} />
          {group.rhythms.map((rhythm) => (
            <CartaoDeRitmo key={rhythm.id} rhythm={rhythm} group={group} />
          ))}
        </View>
      ))}

      <Card style={e.cartaoRodape}>
        <Text style={e.tituloRodape}>{tr("Regra das 5H e 5T")}</Text>
        <Text style={e.corpoRodape}>
          {tr(
            "Para AESP e assistolia, sempre investigar causas reversíveis: Hipóxia · Hipovolemia · Hipotermia · Hipo/Hipercalemia · Acidose (H⁺) · Tensão (pneumotórax) · Tamponamento · TEP · Tóxicos · Trombose coronária."
          )}
        </Text>
        <View style={e.regua} />
        <Text style={e.fonteRodape}>
          {tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)")}
        </Text>
      </Card>
    </ScrollView>
  );
}

const criarEstilos = (t: Tema) => {
  const c = t.cores;
  /** Fundo suave do accent, para bloco de apoio sem competir com o texto. */
  const suave = (cor: string) => ({ backgroundColor: `${cor}1F`, borderColor: `${cor}44` });

  return {
    ...StyleSheet.create({
      scroll: { flex: 1, backgroundColor: c.bg },
      conteudo: {
        paddingHorizontal: ESPACO.md,
        paddingTop: ESPACO.sm,
        paddingBottom: ESPACO.xl,
        maxWidth: 560,
        width: "100%",
        alignSelf: "center",
        gap: ESPACO.md,
      },

      // ── Introdução ──
      cartaoIntro: { gap: ESPACO.sm },
      tituloIntro: { ...TIPOGRAFIA.title, color: c.text },
      corpoIntro: { ...TIPOGRAFIA.caption, color: c.textSecondary, fontWeight: "400" },
      dicaIntro: { ...TIPOGRAFIA.caption, color: c.textSecondary, fontWeight: "400" },
      destaqueChocavel: { fontWeight: "800", color: c.critical },
      destaqueNaoChocavel: { fontWeight: "800", color: c.primary },
      regua: { height: 1, backgroundColor: c.border },

      // ── Grupo ──
      grupo: { gap: ESPACO.sm },
      cabecalhoGrupo: { gap: ESPACO.xs },
      cabecalhoGrupoLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      tituloGrupo: { ...TIPOGRAFIA.caption, fontWeight: "800" },
      subtituloGrupo: { ...TIPOGRAFIA.micro, fontWeight: "500" },

      // ── Cartão do ritmo ──
      cartao: { gap: ESPACO.md },
      cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm },
      nome: { flex: 1, ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },

      blocoEcg: {
        borderRadius: RAIO.botao,
        borderWidth: 1,
        padding: ESPACO.md,
        gap: ESPACO.sm,
      },
      textoEcg: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "400" },
      metaLinha: { flexDirection: "row", alignItems: "stretch", gap: ESPACO.md },
      metaItem: { flex: 1, gap: 2 },
      metaDivisoria: { width: 1, backgroundColor: c.border },
      // Maiúscula e espaçamento vêm da versão antiga: o teste de paridade de
      // conteúdo compara o texto RENDERIZADO, e textTransform muda o que se lê.
      metaRotulo: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },
      metaValor: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "700" },

      rotuloSecao: {
        ...TIPOGRAFIA.micro,
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 1,
      },

      blocoPontos: { gap: ESPACO.xs },
      linhaPonto: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.sm },
      marcador: { width: 6, height: 6, borderRadius: RAIO.badge },
      pontoRotulo: { ...TIPOGRAFIA.micro, color: c.text, fontWeight: "700" },
      pontoValor: { flex: 1, ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

      blocoConduta: { borderRadius: RAIO.botao, padding: ESPACO.md, gap: ESPACO.xs },
      condutaRotulo: {
        ...TIPOGRAFIA.micro,
        color: "rgba(11,18,32,0.75)",
        textTransform: "uppercase",
        letterSpacing: 1,
      },
      condutaTexto: { ...TIPOGRAFIA.caption, color: "#0b1220", fontWeight: "800" },
      notaConduta: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

      // ── Rodapé ──
      cartaoRodape: { gap: ESPACO.sm },
      tituloRodape: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },
      corpoRodape: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
      fonteRodape: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    }),

    blocoEcgTom: StyleSheet.create({
      critical: suave(c.critical),
      primary: suave(c.primary),
    }),
    marcadorTom: StyleSheet.create({
      critical: { backgroundColor: c.critical },
      primary: { backgroundColor: c.primary },
    }),
    rotuloTom: StyleSheet.create({
      critical: { color: c.critical },
      primary: { color: c.primary },
    }),
    condutaTom: StyleSheet.create({
      critical: { backgroundColor: c.critical },
      primary: { backgroundColor: c.primary },
    }),
  };
};
