import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import { markProtocolSessionForResume } from "../../lib/module-session-navigation";
import { OVACE_CAUSA_JA_IDENTIFICADA, OVACE_NA_PCR } from "../../lib/ovace-na-pcr";
import ReferenceBackHeader from "./reference-back-header";

type Estado = "avaliar" | "leve" | "grave" | "expelido" | "inconsciente";
export type SinalDeGravidade = { sinal: string; detalhe: string };
export type PassoOvace = { ordem: string; titulo: string; detalhe: string; alerta?: boolean };

export const SINAIS_DE_GRAVIDADE: SinalDeGravidade[] = [
  { sinal: "Tosse fraca ou ausente", detalhe: "A tosse deixou de produzir fluxo de ar eficaz." },
  { sinal: "Incapaz de falar", detalhe: "Não consegue emitir som ou responder." },
  { sinal: "Cianose", detalhe: "Alteração de cor indica hipóxia já instalada." },
  { sinal: "Estado mental alterado", detalhe: "Confusão ou sonolência precedem a inconsciência." },
  { sinal: "Apneia", detalhe: "Ausência de esforço respiratório eficaz." },
];
export const PASSOS_OVACE: PassoOvace[] = [
  { ordem: "1", titulo: "Acione ajuda / emergência", detalhe: "Peça DEA e suporte sem abandonar a vítima." },
  { ordem: "2", titulo: "5 golpes nas costas → 5 compressões abdominais", detalhe: "Repita até expulsão ou inconsciência.", alerta: true },
  { ordem: "3", titulo: "Se ficar inconsciente", detalhe: "Inicie RCP pelas compressões e examine a boca antes das ventilações.", alerta: true },
];

function Botao({ label, onPress, critico = false }: { label: string; onPress: () => void; critico?: boolean }) {
  const s = useEstilosDoTema(estilos);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.botao, critico && s.botaoCritico, pressed && s.pressionado]}><Text style={[s.botaoTexto, critico && s.botaoTextoCritico]}>{label}</Text></Pressable>;
}

function Acao({ n, titulo, detalhe, critico = false }: { n: string; titulo: string; detalhe: string; critico?: boolean }) {
  const s = useEstilosDoTema(estilos);
  return <View style={[s.acao, critico && s.acaoCritica]}><Text style={[s.numero, critico && s.numeroCritico]}>{n}</Text><View style={s.acaoTexto}><Text style={s.acaoTitulo}>{titulo}</Text><Text style={s.corpo}>{detalhe}</Text></View></View>;
}

export default function AclsChokingScreen() {
  const tr = useTr();
  const router = useRouter();
  const s = useEstilosDoTema(estilos);
  const [estado, setEstado] = useState<Estado>("avaliar");
  const [toracica, setToracica] = useState(false);
  const voltar = <Botao label={tr("Voltar e reclassificar")} onPress={() => setEstado("avaliar")} />;

  function abrirPcr() {
    markProtocolSessionForResume("pcr_adulto", ["hipoxia"]);
    router.push("/modulos/pcr-adulto?from_module=ovace-adulto" as Href);
  }

  return <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ReferenceBackHeader label={tr("Engasgo (OVACE) · Adulto")} />
    <View style={s.hero}>
      <Text style={s.sobrancelha}>{tr("CONDUTA À BEIRA-LEITO · AHA 2025")}</Text>
      <Text style={s.titulo}>{tr("O que a vítima consegue fazer agora?")}</Text>
      <Text style={s.corpo}>{tr("Escolha o estado observado. A tela mostrará somente a ação correspondente e a próxima reavaliação.")}</Text>
    </View>
    <View style={s.reavaliar}>
      <Text style={s.reavaliarTitulo}>{tr("Mudou em 2025")}</Text>
      <Text style={s.corpo}>{tr("No adulto responsivo, os golpes nas costas vêm primeiro: alterne 5 golpes com 5 compressões.")}</Text>
    </View>

    {estado === "avaliar" && <View style={s.painel}>
      <Text style={s.painelTitulo}>{tr("Classifique pela fala, tosse e consciência")}</Text>
      <Botao label={tr("Tosse forte, fala e respira")} onPress={() => setEstado("leve")} />
      <Botao label={tr("Tosse fraca/ausente ou não consegue falar")} onPress={() => setEstado("grave")} critico />
      <Botao label={tr("Está inconsciente")} onPress={() => setEstado("inconsciente")} critico />
      <View style={s.separado}>{SINAIS_DE_GRAVIDADE.map((x) => <Text key={x.sinal} style={s.nota}>• {tr(x.sinal)} — {tr(x.detalhe)}</Text>)}</View>
    </View>}

    {estado === "leve" && <View style={s.painel}>
      <Text style={s.estadoBom}>{tr("OBSTRUÇÃO LEVE · tosse eficaz")}</Text>
      <Acao n="1" titulo={tr("INCENTIVE A TOSSE")} detalhe={tr("Não aplique golpes nem compressões enquanto a tosse permanecer forte e eficaz.")} />
      <Acao n="2" titulo={tr("Observe continuamente")} detalhe={tr("Não deixe a vítima sozinha. Reclassifique se a tosse enfraquecer, a fala desaparecer ou houver alteração de consciência.")} />
      <Botao label={tr("A tosse enfraqueceu / não consegue falar")} onPress={() => setEstado("grave")} critico />
      <Botao label={tr("Objeto expelido")} onPress={() => setEstado("expelido")} />{voltar}
    </View>}

    {estado === "grave" && <View style={s.painel}>
      <Text style={s.estadoCritico}>{tr("OBSTRUÇÃO GRAVE · vítima responsiva")}</Text>
      <Acao n="1" titulo={tr("Acione a emergência e peça um DEA")} detalhe={tr("Peça ajuda agora; não espere a perda de consciência.")} critico />
      <Acao n="2" titulo={tr("Faça 5 golpes nas costas")} detalhe={tr("Incline o tronco para frente e aplique golpes firmes entre as escápulas com a base da mão.")} critico />
      <Acao n="3" titulo={tr(toracica ? "Faça 5 compressões TORÁCICAS" : "Faça 5 compressões ABDOMINAIS")} detalhe={tr(toracica ? "Comprima na METADE INFERIOR DO ESTERNO. Use na gestação avançada ou quando o abdome for inacessível." : "Punho ACIMA DO UMBIGO e abaixo do xifoide; tracione rapidamente para dentro e para cima.")} critico />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: toracica }} onPress={() => setToracica((v) => !v)} style={s.check}><Text style={[s.caixa, toracica && s.caixaMarcada]}>{toracica ? "✓" : ""}</Text><Text style={s.checkTexto}>{tr("As compressões são TORÁCICAS na gestação avançada ou quando não for possível circundar o abdome")}</Text></Pressable>
      <View style={s.reavaliar}><Text style={s.reavaliarTitulo}>{tr("REAVALIE APÓS CADA CICLO 5 + 5")}</Text><Text style={s.corpo}>{tr("Objeto saiu? Perdeu a consciência? Se não: repita 5 golpes + 5 compressões.")}</Text></View>
      <Botao label={tr("Objeto expelido")} onPress={() => setEstado("expelido")} />
      <Botao label={tr("Perdeu a consciência")} onPress={() => setEstado("inconsciente")} critico />{voltar}
    </View>}

    {estado === "inconsciente" && <View style={s.painel}>
      <Text style={s.estadoCritico}>{tr("INCONSCIENTE · trate como parada")}</Text>
      <Acao n="1" titulo={tr("Coloque em superfície firme e inicie RCP")} detalhe={tr("Comece pelas compressões. A RCP mantém a sequência padrão 30:2.")} critico />
      <Acao n="2" titulo={tr("Após cada 30 compressões, olhe a boca")} detalhe={tr("Antes das 2 ventilações, retire o objeto SOMENTE se estiver visível. NUNCA faça varredura digital às cegas.")} critico />
      <Text style={s.notaImportante}>{tr(OVACE_NA_PCR)}</Text><Text style={s.nota}>{tr(OVACE_CAUSA_JA_IDENTIFICADA)}</Text>
      <Botao label={tr("Abrir PCR no adulto")} onPress={abrirPcr} critico />{voltar}
    </View>}

    {estado === "expelido" && <View style={s.painel}>
      <Text style={s.estadoBom}>{tr("OBJETO EXPELIDO")}</Text>
      <Acao n="1" titulo={tr("Reavalie via aérea, ventilação e consciência")} detalhe={tr("Tosse, estridor, sibilos, dispneia ou hipoxemia persistentes sugerem obstrução residual ou lesão.")} />
      <Acao n="2" titulo={tr("Encaminhe para avaliação médica")} detalhe={tr("AVALIAÇÃO MÉDICA É NECESSÁRIA MESMO EM QUEM FICOU ASSINTOMÁTICO, pelo risco de corpo estranho residual e lesões da via aérea ou das manobras.")} />
      <Botao label={tr("Piorou / voltou a obstruir")} onPress={() => setEstado("avaliar")} critico />
    </View>}
    <Text style={s.fonte}>{tr("Fonte: American Heart Association · Diretrizes de RCP e ACE 2025 · OVACE em adultos")}</Text>
  </ScrollView>;
}

const estilos = (t: Tema) => StyleSheet.create({
  scroll: { flex: 1, backgroundColor: t.cores.bg }, content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: ESPACO.md, paddingBottom: ESPACO.xl, gap: ESPACO.md },
  hero: { backgroundColor: t.cores.surface, borderColor: t.cores.border, borderWidth: 1, borderRadius: RAIO.card, padding: ESPACO.lg, gap: ESPACO.sm },
  sobrancelha: { ...TIPOGRAFIA.micro, color: t.cores.primary }, titulo: { ...TIPOGRAFIA.title, color: t.cores.text }, corpo: { ...TIPOGRAFIA.body, color: t.cores.textSecondary },
  painel: { backgroundColor: t.cores.surface, borderColor: t.cores.border, borderWidth: 1, borderRadius: RAIO.card, padding: ESPACO.md, gap: ESPACO.md }, painelTitulo: { ...TIPOGRAFIA.step, color: t.cores.text },
  botao: { minHeight: TOQUE.critico, justifyContent: "center", borderWidth: 1, borderColor: t.cores.primary, borderRadius: RAIO.botao, padding: ESPACO.md }, botaoCritico: { backgroundColor: t.cores.critical, borderColor: t.cores.critical }, botaoTexto: { ...TIPOGRAFIA.body, color: t.cores.primary, fontWeight: "700", textAlign: "center" }, botaoTextoCritico: { color: t.cores.onCritical }, pressionado: { opacity: 0.72 },
  separado: { gap: ESPACO.sm, borderTopWidth: 1, borderTopColor: t.cores.border, paddingTop: ESPACO.md }, nota: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary }, notaImportante: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "700" }, estadoBom: { ...TIPOGRAFIA.step, color: t.cores.success }, estadoCritico: { ...TIPOGRAFIA.step, color: t.cores.critical },
  acao: { flexDirection: "row", gap: ESPACO.md, padding: ESPACO.md, backgroundColor: t.cores.bg, borderRadius: RAIO.card, borderLeftWidth: 4, borderLeftColor: t.cores.primary }, acaoCritica: { borderLeftColor: t.cores.critical }, numero: { ...TIPOGRAFIA.caption, width: 32, height: 32, borderRadius: RAIO.badge, textAlign: "center", textAlignVertical: "center", backgroundColor: t.cores.primary, color: t.cores.onPrimary, fontWeight: "800" }, numeroCritico: { backgroundColor: t.cores.critical, color: t.cores.onCritical }, acaoTexto: { flex: 1, gap: ESPACO.xs }, acaoTitulo: { ...TIPOGRAFIA.body, color: t.cores.text, fontWeight: "800" },
  check: { minHeight: TOQUE.minimo, flexDirection: "row", alignItems: "center", gap: ESPACO.sm }, caixa: { width: 28, height: 28, borderWidth: 2, borderColor: t.cores.border, borderRadius: 6, color: t.cores.onPrimary, textAlign: "center", textAlignVertical: "center", fontWeight: "800" }, caixaMarcada: { backgroundColor: t.cores.primary, borderColor: t.cores.primary }, checkTexto: { ...TIPOGRAFIA.body, color: t.cores.text, flex: 1 },
  reavaliar: { borderWidth: 1, borderColor: t.cores.warning, borderRadius: RAIO.card, padding: ESPACO.md, gap: ESPACO.xs }, reavaliarTitulo: { ...TIPOGRAFIA.caption, color: t.cores.warning, fontWeight: "800" }, fonte: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, textAlign: "center" },
});
