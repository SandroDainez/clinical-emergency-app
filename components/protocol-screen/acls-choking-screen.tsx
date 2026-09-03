import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import { markProtocolSessionForResume } from "../../lib/module-session-navigation";
import { OVACE_CAUSA_JA_IDENTIFICADA, OVACE_NA_PCR } from "../../lib/ovace-na-pcr";

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
  const [pioraAberta, setPioraAberta] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const voltar = <Botao label={tr("Voltar e reclassificar")} onPress={() => setEstado("avaliar")} />;

  useEffect(() => {
    const inicio = Date.now();
    const relogio = setInterval(() => setSegundos(Math.floor((Date.now() - inicio) / 1000)), 1000);
    return () => clearInterval(relogio);
  }, []);

  const passo = estado === "avaliar" ? 1 : estado === "leve" || estado === "grave" ? 2 : 3;
  const etapa = estado === "avaliar" ? "Reconhecimento e classificação" : estado === "leve" ? "Tosse eficaz · observação" : estado === "grave" ? "Desobstrução ativa · ciclos 5 + 5" : estado === "expelido" ? "Pós-desobstrução" : "Inconsciência · RCP";
  const tempo = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

  function abrirPcr() {
    markProtocolSessionForResume("pcr_adulto", ["hipoxia"]);
    router.push("/modulos/pcr-adulto?from_module=ovace-adulto" as Href);
  }

  return <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.cabecalho}>
      <Pressable accessibilityRole="button" accessibilityLabel={tr("Voltar")} onPress={() => router.back()} style={({pressed}) => [s.voltarCabecalho, pressed && s.pressionado]}><Text style={s.voltarCabecalhoTexto}>{tr("‹ Voltar")}</Text></Pressable>
      <View style={s.identidade}><Text style={s.nomeModulo}>{tr("Engasgo (OVACE)")}</Text><View style={s.etapaLinha}><Text style={s.sobrancelha}>{tr("ETAPA ATUAL")}</Text><Text style={s.etapaValor}>{tr(`Passo ${passo}`)}</Text></View></View>
    </View>
    <View style={s.faixaEtapa}><Text style={s.faixaEtapaTexto}>{tr(etapa)}</Text><View><Text style={s.tempoRotulo}>{tr("TEMPO")}</Text><Text style={s.tempo}>{tempo}</Text></View></View>
    <View style={s.pioraWrapper}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: pioraAberta }} onPress={() => setPioraAberta((v) => !v)} style={({pressed}) => [s.pioraBotao, pressed && s.pressionado]}>
        <View style={s.pioraTexto}><Text style={s.pioraTitulo}>{tr("●  PACIENTE PIOROU?")}</Text><Text style={s.nota}>{tr("Intercorrências sem perder o fluxo atual")}</Text></View>
        <Text style={s.pioraCta}>{tr(pioraAberta ? "FECHAR ▲" : "ABRIR ▼")}</Text>
      </Pressable>
      {pioraAberta && <View style={s.pioraAcoes}><Botao label={tr("Perdeu a consciência · abrir PCR")} onPress={abrirPcr} critico /><Botao label={tr("Tosse enfraqueceu · tratar como grave")} onPress={() => { setEstado("grave"); setPioraAberta(false); }} critico /><Botao label={tr("Objeto expelido · reavaliar")} onPress={() => { setEstado("expelido"); setPioraAberta(false); }} /></View>}
    </View>
    <View style={s.orientacao}>
      <Text style={s.corpo}>{tr("Siga uma decisão por vez. O app preserva o contexto e conduz do reconhecimento à desobstrução, RCP ou avaliação pós-evento.")}</Text>
      <Pressable accessibilityRole="button" onPress={() => setDetalhesAbertos((v) => !v)} style={({pressed}) => [s.detalhesBotao, pressed && s.pressionado]}><Text style={s.detalhesTexto}>{tr(detalhesAbertos ? "OCULTAR DETALHES" : "VER DETALHES ›")}</Text></Pressable>
      {detalhesAbertos && <View style={s.detalhesInfo}><Text style={s.reavaliarTitulo}>{tr("Mudou em 2025")}</Text><Text style={s.corpo}>{tr("No adulto responsivo, os golpes nas costas vêm primeiro: alterne 5 golpes com 5 compressões. Antes, ensinava-se compressão abdominal isolada.")}</Text></View>}
    </View>

    {estado === "avaliar" && <View style={s.painel}>
      <Text style={s.sobrancelha}>{tr("DECISÃO AGORA")}</Text><Text style={s.painelTitulo}>{tr("A obstrução é leve, grave ou já houve inconsciência?")}</Text>
      <Botao label={tr("Tosse forte, fala e respira")} onPress={() => setEstado("leve")} />
      <Botao label={tr("Tosse fraca/ausente ou não consegue falar")} onPress={() => setEstado("grave")} critico />
      <Botao label={tr("Está inconsciente")} onPress={() => setEstado("inconsciente")} critico />
      <View style={s.separado}>{SINAIS_DE_GRAVIDADE.map((x) => <Text key={x.sinal} style={s.nota}>• {tr(x.sinal)} — {tr(x.detalhe)}</Text>)}</View>
    </View>}

    {estado === "leve" && <View style={s.painel}>
      <Text style={s.sobrancelha}>{tr("CONDUTA — FAZER AGORA")}</Text><Text style={s.estadoBom}>{tr("OBSTRUÇÃO LEVE · tosse eficaz")}</Text><Text style={s.execucaoRotulo}>{tr("EXECUTE AGORA")}</Text>
      <Acao n="1" titulo={tr("INCENTIVE A TOSSE")} detalhe={tr("Não aplique golpes nem compressões enquanto a tosse permanecer forte e eficaz.")} />
      <Acao n="2" titulo={tr("Observe continuamente")} detalhe={tr("Não deixe a vítima sozinha. Reclassifique se a tosse enfraquecer, a fala desaparecer ou houver alteração de consciência.")} />
      <Botao label={tr("A tosse enfraqueceu / não consegue falar")} onPress={() => setEstado("grave")} critico />
      <Botao label={tr("Objeto expelido")} onPress={() => setEstado("expelido")} /><Text style={s.conclusaoAjuda}>{tr("Depois de executar e conferir a conduta, registre a conclusão da etapa.")}</Text>{voltar}
    </View>}

    {estado === "grave" && <View style={s.painel}>
      <Text style={s.sobrancelha}>{tr("CONDUTA — FAZER AGORA")}</Text><Text style={s.estadoCritico}>{tr("OBSTRUÇÃO GRAVE · vítima responsiva")}</Text><Text style={s.execucaoRotulo}>{tr("EXECUTE AGORA")}</Text>
      <Acao n="1" titulo={tr("Acione a emergência e peça um DEA")} detalhe={tr("Peça ajuda agora; não espere a perda de consciência.")} critico />
      <Acao n="2" titulo={tr("Faça 5 golpes nas costas")} detalhe={tr("Incline o tronco para frente e aplique golpes firmes entre as escápulas com a base da mão.")} critico />
      <Acao n="3" titulo={tr(toracica ? "Faça 5 compressões TORÁCICAS" : "Faça 5 compressões ABDOMINAIS")} detalhe={tr(toracica ? "Comprima na METADE INFERIOR DO ESTERNO. Use na gestação avançada ou quando o abdome for inacessível." : "Punho ACIMA DO UMBIGO e abaixo do xifoide; tracione rapidamente para dentro e para cima.")} critico />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: toracica }} onPress={() => setToracica((v) => !v)} style={s.check}><Text style={[s.caixa, toracica && s.caixaMarcada]}>{toracica ? "✓" : ""}</Text><Text style={s.checkTexto}>{tr("As compressões são TORÁCICAS na gestação avançada ou quando não for possível circundar o abdome")}</Text></Pressable>
      <View style={s.reavaliar}><Text style={s.reavaliarTitulo}>{tr("REAVALIE APÓS CADA CICLO 5 + 5")}</Text><Text style={s.corpo}>{tr("Objeto saiu? Perdeu a consciência? Se não: repita 5 golpes + 5 compressões.")}</Text></View>
      <Botao label={tr("Objeto expelido")} onPress={() => setEstado("expelido")} />
      <Botao label={tr("Perdeu a consciência")} onPress={() => setEstado("inconsciente")} critico /><Text style={s.conclusaoAjuda}>{tr("Depois de executar e conferir a conduta, registre o resultado do ciclo.")}</Text>{voltar}
    </View>}

    {estado === "inconsciente" && <View style={s.painel}>
      <Text style={s.sobrancelha}>{tr("CONDUTA — FAZER AGORA")}</Text><Text style={s.estadoCritico}>{tr("INCONSCIENTE · trate como parada")}</Text><Text style={s.execucaoRotulo}>{tr("EXECUTE AGORA")}</Text>
      <Acao n="1" titulo={tr("Coloque em superfície firme e inicie RCP")} detalhe={tr("Comece pelas compressões. A RCP mantém a sequência padrão 30:2.")} critico />
      <Acao n="2" titulo={tr("Após cada 30 compressões, olhe a boca")} detalhe={tr("Antes das 2 ventilações, retire o objeto SOMENTE se estiver visível. NUNCA faça varredura digital às cegas.")} critico />
      <Text style={s.notaImportante}>{tr(OVACE_NA_PCR)}</Text><Text style={s.nota}>{tr(OVACE_CAUSA_JA_IDENTIFICADA)}</Text>
      <Botao label={tr("Abrir PCR no adulto")} onPress={abrirPcr} critico />{voltar}
    </View>}

    {estado === "expelido" && <View style={s.painel}>
      <Text style={s.sobrancelha}>{tr("REAVALIAÇÃO E DESTINO")}</Text><Text style={s.estadoBom}>{tr("OBJETO EXPELIDO")}</Text><Text style={s.execucaoRotulo}>{tr("EXECUTE AGORA")}</Text>
      <Acao n="1" titulo={tr("Reavalie via aérea, ventilação e consciência")} detalhe={tr("Tosse, estridor, sibilos, dispneia ou hipoxemia persistentes sugerem obstrução residual ou lesão.")} />
      <Acao n="2" titulo={tr("Encaminhe para avaliação médica")} detalhe={tr("AVALIAÇÃO MÉDICA É NECESSÁRIA MESMO EM QUEM FICOU ASSINTOMÁTICO, pelo risco de corpo estranho residual e lesões da via aérea ou das manobras.")} />
      <Botao label={tr("Piorou / voltou a obstruir")} onPress={() => setEstado("avaliar")} critico />
    </View>}
    <Text style={s.fonte}>{tr("Fonte: American Heart Association · Diretrizes de RCP e ACE 2025 · OVACE em adultos")}</Text>
  </ScrollView>;
}

const estilos = (t: Tema) => StyleSheet.create({
  scroll: { flex: 1, backgroundColor: t.cores.bg }, content: { width: "100%", alignSelf: "center", paddingBottom: ESPACO.xl, gap: ESPACO.sm },
  cabecalho: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: ESPACO.sm, padding: ESPACO.sm, borderBottomWidth: 1, borderBottomColor: t.cores.border, backgroundColor: t.cores.surface },
  voltarCabecalho: { minHeight: TOQUE.critico, justifyContent: "center", borderWidth: 2, borderColor: t.cores.primary, borderRadius: RAIO.botao, paddingHorizontal: ESPACO.md }, voltarCabecalhoTexto: { ...TIPOGRAFIA.caption, color: t.cores.primary, fontWeight: "900" },
  identidade: { flex: 1, gap: 2 }, nomeModulo: { ...TIPOGRAFIA.body, color: t.cores.text, fontWeight: "900" }, etapaLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs }, etapaValor: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "800" },
  faixaEtapa: { minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: ESPACO.md, paddingHorizontal: ESPACO.sm, paddingVertical: ESPACO.sm, borderBottomWidth: 1, borderBottomColor: t.cores.border, backgroundColor: t.cores.surface }, faixaEtapaTexto: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary, fontWeight: "800", flex: 1 }, tempoRotulo: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "900", textAlign: "right" }, tempo: { ...TIPOGRAFIA.step, color: t.cores.primary, fontWeight: "900" },
  pioraWrapper: { paddingHorizontal: ESPACO.xs, backgroundColor: t.cores.surface }, pioraBotao: { minHeight: TOQUE.critico + 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: ESPACO.sm, borderWidth: 2, borderColor: t.cores.critical, borderRadius: RAIO.botao, backgroundColor: t.cores.bg, padding: ESPACO.md }, pioraTexto: { flex: 1 }, pioraTitulo: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "900" }, pioraCta: { ...TIPOGRAFIA.micro, color: t.cores.onCritical, fontWeight: "900", backgroundColor: t.cores.critical, borderRadius: RAIO.badge, paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm }, pioraAcoes: { paddingVertical: ESPACO.sm, gap: ESPACO.sm },
  orientacao: { padding: ESPACO.sm, gap: ESPACO.sm }, detalhesBotao: { minHeight: TOQUE.minimo, alignSelf: "flex-start", justifyContent: "center", borderWidth: 2, borderColor: t.cores.primary, borderRadius: RAIO.botao, paddingHorizontal: ESPACO.md }, detalhesTexto: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "900" }, detalhesInfo: { borderWidth: 1, borderColor: t.cores.border, borderRadius: RAIO.card, backgroundColor: t.cores.surface, padding: ESPACO.md, gap: ESPACO.xs },
  hero: { backgroundColor: t.cores.surface, borderColor: t.cores.border, borderWidth: 1, borderRadius: RAIO.card, padding: ESPACO.lg, gap: ESPACO.sm },
  sobrancelha: { ...TIPOGRAFIA.micro, color: t.cores.primary }, titulo: { ...TIPOGRAFIA.title, color: t.cores.text }, corpo: { ...TIPOGRAFIA.body, color: t.cores.textSecondary },
  painel: { marginHorizontal: ESPACO.sm, backgroundColor: t.cores.surface, borderColor: t.cores.border, borderWidth: 1, borderLeftWidth: 6, borderLeftColor: t.cores.critical, borderRadius: RAIO.card, padding: ESPACO.lg, gap: ESPACO.md }, painelTitulo: { ...TIPOGRAFIA.step, color: t.cores.text }, execucaoRotulo: { ...TIPOGRAFIA.micro, color: t.cores.critical, fontWeight: "900", letterSpacing: 0.7 }, conclusaoAjuda: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, textAlign: "center" },
  botao: { minHeight: TOQUE.critico, justifyContent: "center", borderWidth: 1, borderColor: t.cores.primary, borderRadius: RAIO.botao, padding: ESPACO.md }, botaoCritico: { backgroundColor: t.cores.critical, borderColor: t.cores.critical }, botaoTexto: { ...TIPOGRAFIA.body, color: t.cores.primary, fontWeight: "700", textAlign: "center" }, botaoTextoCritico: { color: t.cores.onCritical }, pressionado: { opacity: 0.72 },
  separado: { gap: ESPACO.sm, borderTopWidth: 1, borderTopColor: t.cores.border, paddingTop: ESPACO.md }, nota: { ...TIPOGRAFIA.caption, color: t.cores.textSecondary }, notaImportante: { ...TIPOGRAFIA.caption, color: t.cores.text, fontWeight: "700" }, estadoBom: { ...TIPOGRAFIA.step, color: t.cores.success }, estadoCritico: { ...TIPOGRAFIA.step, color: t.cores.critical },
  acao: { flexDirection: "row", gap: ESPACO.md, padding: ESPACO.md, backgroundColor: t.cores.bg, borderRadius: RAIO.card, borderLeftWidth: 4, borderLeftColor: t.cores.primary }, acaoCritica: { borderLeftColor: t.cores.critical }, numero: { ...TIPOGRAFIA.caption, width: 32, height: 32, borderRadius: RAIO.badge, textAlign: "center", textAlignVertical: "center", backgroundColor: t.cores.primary, color: t.cores.onPrimary, fontWeight: "800" }, numeroCritico: { backgroundColor: t.cores.critical, color: t.cores.onCritical }, acaoTexto: { flex: 1, gap: ESPACO.xs }, acaoTitulo: { ...TIPOGRAFIA.body, color: t.cores.text, fontWeight: "800" },
  check: { minHeight: TOQUE.minimo, flexDirection: "row", alignItems: "center", gap: ESPACO.sm }, caixa: { width: 28, height: 28, borderWidth: 2, borderColor: t.cores.border, borderRadius: 6, color: t.cores.onPrimary, textAlign: "center", textAlignVertical: "center", fontWeight: "800" }, caixaMarcada: { backgroundColor: t.cores.primary, borderColor: t.cores.primary }, checkTexto: { ...TIPOGRAFIA.body, color: t.cores.text, flex: 1 },
  reavaliar: { borderWidth: 1, borderColor: t.cores.warning, borderRadius: RAIO.card, padding: ESPACO.md, gap: ESPACO.xs }, reavaliarTitulo: { ...TIPOGRAFIA.caption, color: t.cores.warning, fontWeight: "800" }, fonte: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, textAlign: "center" },
});
