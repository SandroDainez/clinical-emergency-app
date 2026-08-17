import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import ReferenceBackHeader from "./reference-back-header";
import { useTr } from "../../lib/use-tr";
import { traduzirPecas } from "../../lib/i18n/traduzir-pecas";
import { markProtocolSessionForResume } from "../../lib/module-session-navigation";
import { CALCIO_NA_PARADA, CALCIO_PARADA_VS_COM_PULSO } from "../../lib/calcio-na-parada";
import {
  DESLOCAMENTO_UTERINO_COMO,
  DESLOCAMENTO_UTERINO_POR_QUE_NAO_INCLINAR,
  DESLOCAMENTO_UTERINO_QUEM,
} from "../../lib/deslocamento-uterino";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type AcaoImediata = {
  ordem: string;
  titulo: string;
  /**
   * ⚠️ `string[]` PERMITIDO, e NUNCA junte antes de traduzir.
   *
   * Dois destes campos eram `[...].join(" ")` na definição: o `tr()` recebia a
   * frase colada (1.122 e 831 caracteres), que não é chave de nada, e a tela saía
   * em PORTUGUÊS com o app em espanhol. Cada peça já tinha tradução.
   * O render traduz peça por peça e junta depois.
   */
  detalhe: string | string[];
  gatilho?: string;
  alerta?: boolean;
};

export type CausaObstetrica = {
  letra: string;
  rotulo: string;
  exemplos: string;
};

// ── Dados clínicos ────────────────────────────────────────────────────────────

/**
 * PCR na gestação — conteúdo clínico.
 *
 * Origem: MedCampus · Guia Rápido de ACLS em Adultos v1.0 (revisado pelo autor),
 * alinhado às Diretrizes AHA de RCP e ACE 2025.
 *
 * Por que este módulo existe: até esta versão, uma PCR em gestante com o app
 * aberto recebia o algoritmo de ACLS padrão — sem deslocamento uterino, sem a
 * janela de 5 minutos do parto ressuscitativo e sem o cuidado com o acesso
 * venoso acima do diafragma. São exatamente as três coisas que mudam o desfecho
 * e que não estão em nenhum outro módulo.
 *
 * Exportado para reúso por uma eventual versão v2 da tela — importado, nunca
 * copiado, como nas demais telas de referência do ACLS.
 */
export const ACOES_IMEDIATAS: AcaoImediata[] = [
  {
    ordem: "1",
    titulo: "RCP de alta qualidade — sem nenhuma redução",
    detalhe:
      "Compressões, desfibrilação, doses de fármacos e energias seguem EXATAMENTE o ACLS do adulto. Não há redução de dose nem de carga por causa da gestação. Posicionar as mãos na posição habitual do esterno.",
  },
  {
    ordem: "2",
    titulo: "Deslocamento uterino manual para a esquerda",
    detalhe: [
      "Manter de forma contínua durante toda a ressuscitação. O útero comprime a veia cava inferior e a aorta, reduzindo o retorno venoso e a eficácia das compressões.",
      DESLOCAMENTO_UTERINO_COMO,
      DESLOCAMENTO_UTERINO_QUEM,
      DESLOCAMENTO_UTERINO_POR_QUE_NAO_INCLINAR,
    ],
    gatilho: "Quando o fundo uterino estiver na altura da cicatriz umbilical ou acima dela",
  },
  {
    ordem: "3",
    titulo: "Acesso venoso ACIMA do diafragma",
    detalhe:
      "Puncionar em membro superior ou pescoço. Abaixo do diafragma, a compressão uterina da veia cava pode impedir que o fármaco chegue à circulação central.",
    alerta: true,
  },
  {
    ordem: "4",
    titulo: "Em uso de sulfato de magnésio IV: PARAR e dar cálcio",
    // ⚠️ R-54 — O PAR DOS SAIS SE MOVE JUNTO. Esta linha tinha o cloreto FIXO
    // em 10 mL e o gluconato na FAIXA 15–30, quando o par da fonte é
    // 5–10 ↔ 15–30. Nenhum número estava errado; a CORRESPONDÊNCIA é que
    // quebrou — e quem só tinha acesso periférico escolhia 15 mL achando ser o
    // equivalente do 1 g de cloreto, dando metade. A dose vive em
    // lib/calcio-na-parada, com os dois em PONTO e pareados.
    detalhe: [
      "Interromper imediatamente a infusão de magnésio.",
      CALCIO_NA_PARADA,
      CALCIO_PARADA_VS_COM_PULSO,
      "A intoxicação por magnésio é causa reversível e frequente de PCR na gestante em tratamento de pré-eclâmpsia ou de trabalho de parto prematuro.",
    ],
    gatilho: "Gestante recebendo sulfato de magnésio no momento da parada",
    alerta: true,
  },
  {
    ordem: "5",
    titulo: "Desconectar monitores fetais que interfiram",
    detalhe:
      "Retirar monitorização fetal que atrapalhe as compressões ou a desfibrilação. A prioridade da ressuscitação é a mãe — o melhor cuidado ao feto é a ressuscitação materna eficaz.",
  },
];

export const CAUSAS_OBSTETRICAS: CausaObstetrica[] = [
  { letra: "A", rotulo: "Anestésicas", exemplos: "Bloqueio alto, toxicidade por anestésico local, via aérea difícil" },
  { letra: "B", rotulo: "Bleeding (sangramento)", exemplos: "Atonia uterina, descolamento, placenta prévia/acreta, rotura, coagulopatia" },
  { letra: "C", rotulo: "Cardiovasculares", exemplos: "IAM, dissecção de aorta, cardiomiopatia periparto, valvopatia" },
  { letra: "D", rotulo: "Drogas", exemplos: "Magnésio, opioides, ocitocina, anafilaxia, erro de medicação" },
  { letra: "E", rotulo: "Embólicas", exemplos: "TEP, embolia por líquido amniótico, embolia aérea" },
  { letra: "F", rotulo: "Febre / infecção", exemplos: "Sepse, corioamnionite" },
  { letra: "G", rotulo: "Gerais (Hs e Ts)", exemplos: "As mesmas causas reversíveis do ACLS do adulto" },
  { letra: "H", rotulo: "Hipertensão", exemplos: "Pré-eclâmpsia, eclâmpsia, HELLP, AVC hemorrágico" },
];

// ── Componentes ───────────────────────────────────────────────────────────────

function CardAcao({ acao }: { acao: AcaoImediata }) {
  const tr = useTr();
  return (
    <View style={[ca.card, acao.alerta ? ca.cardAlerta : null]}>
      <View style={ca.header}>
        <View style={[ca.ordemBadge, acao.alerta ? ca.ordemBadgeAlerta : null]}>
          <Text style={ca.ordemTexto}>{acao.ordem}</Text>
        </View>
        <Text style={ca.titulo}>{tr(acao.titulo)}</Text>
      </View>

      {acao.gatilho ? (
        <View style={ca.gatilhoBloco}>
          <Text style={ca.gatilhoRotulo}>{tr("Quando")}</Text>
          <Text style={ca.gatilhoTexto}>{tr(acao.gatilho)}</Text>
        </View>
      ) : null}

      <Text style={ca.detalhe}>{traduzirPecas(tr, acao.detalhe)}</Text>
    </View>
  );
}

// ── Tela ──────────────────────────────────────────────────────────────────────

export default function AclsPregnancyScreen() {
  const tr = useTr();
  const router = useRouter();
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      <ReferenceBackHeader label={tr("ACLS · PCR na Gestação")} />

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · Referência")}</Text>
        <Text style={s.introTitle}>{tr("PCR na Gestação")}</Text>
        <Text style={s.introSubtitle}>{tr("O que muda em relação ao ACLS do adulto")}</Text>
        <View style={s.introRule} />
        <Text style={s.introBody}>
          {tr(
            "A ressuscitação segue o ACLS do adulto, sem redução de doses nem de energias. O que muda são cinco ações paralelas — e a decisão do parto ressuscitativo, que precisa ser preparada desde o reconhecimento da parada.",
          )}
        </Text>
      </View>

      {/* Janela dos 5 minutos */}
      <View style={s.janelaCard}>
        <Text style={s.janelaEyebrow}>{tr("Decisão que não pode esperar")}</Text>
        <Text style={s.janelaTitulo}>{tr("Parto ressuscitativo em até 5 minutos")}</Text>
        <Text style={s.janelaCorpo}>
          {tr(
            "Se não houver ROSC com a ressuscitação inicial, o parto ressuscitativo deve ser CONCLUÍDO no local em até 5 minutos do início da parada. Isso só é possível se a equipe começar a se preparar já no reconhecimento — não ao esgotar o quinto minuto. INDICAÇÃO: útero clinicamente grande o bastante para comprimir a cava — na prática, fundo uterino na altura da cicatriz umbilical ou acima.",
          )}
        </Text>
        <View style={s.janelaRule} />
        <View style={s.janelaLinha}>
          <View style={s.janelaMarco}>
            <Text style={s.janelaMarcoTempo}>{tr("0 min")}</Text>
            <Text style={s.janelaMarcoTexto}>
              {tr("Reconhecer a PCR, iniciar RCP e JÁ acionar a equipe obstétrica e neonatal — preparar o material do parto")}
            </Text>
          </View>
          <View style={s.janelaMarco}>
            <Text style={s.janelaMarcoTempo}>{tr("~4 min")}</Text>
            <Text style={s.janelaMarcoTexto}>
              {tr("Sem ROSC: iniciar o parto ressuscitativo no próprio local da ressuscitação")}
            </Text>
          </View>
          <View style={s.janelaMarco}>
            <Text style={s.janelaMarcoTempo}>{tr("5 min")}</Text>
            <Text style={s.janelaMarcoTexto}>
              {tr("Parto concluído — RCP contínua DURANTE e DEPOIS do procedimento: extrair o feto não encerra a ressuscitação, e é aí que se para de comprimir por achar que acabou")}
            </Text>
          </View>
        </View>
      </View>

      {/* Alerta */}
      <View style={s.alertaCard}>
        <Text style={s.alertaTitulo}>{tr("⚠️ O parto ressuscitativo é pela MÃE")}</Text>
        <Text style={s.alertaCorpo}>
          {tr(
            "O objetivo é melhorar a ressuscitação materna: esvaziar o útero alivia a compressão aortocava e aumenta a eficácia das compressões. A sobrevida fetal é consequência, não o critério da decisão.",
          )}
        </Text>
        <Text style={s.alertaCorpo}>
          {tr(
            "NÃO transportar a paciente para o centro cirúrgico se isso atrasar o parto ressuscitativo. O procedimento é feito onde a ressuscitação está acontecendo.",
          )}
        </Text>
        {/* A formulação que remove a ESPERA. Sem ela, alguém adia por entender
            que a decisão é obstétrica — e o relógio corre igual. */}
        <Text style={s.alertaCorpo}>
          {tr(
            "QUEM DECIDE: a decisão é de quem conduz a ressuscitação e NÃO depende da chegada do obstetra. A equipe obstétrica é acionada no minuto ZERO, não consultada aos quatro.",
          )}
        </Text>
      </View>

      {/* Ações imediatas */}
      <View style={s.grupo}>
        <View style={s.grupoHeader}>
          <Text style={s.grupoTitulo}>{tr("Cinco ações em paralelo à RCP")}</Text>
          <Text style={s.grupoSubtitulo}>{tr("Simultâneas — não sequenciais")}</Text>
        </View>
        {ACOES_IMEDIATAS.map((acao) => (
          <CardAcao key={acao.ordem} acao={acao} />
        ))}
      </View>

      {/* PONTEIROS (R-33). O rodapé MENCIONAVA a Pré-eclâmpsia em texto e não
          oferecia caminho; e o módulo inteiro é sobre uma parada sem apontar
          para o algoritmo que a conduz. Mesmo achado do OVACE. */}
      <View style={s.rotasCard}>
        <Text style={s.rotasTitulo}>{tr("Para onde ir daqui")}</Text>
        <Pressable
          onPress={() => {
            // A causa NÃO é pré-marcada aqui, ao contrário do engasgo: na
            // gestante a etiologia é aberta (ABCDEFGH), e marcar uma causa
            // sem saber qual é o oposto do que o módulo ensina.
            markProtocolSessionForResume("pcr_adulto");
            router.push("/modulos/pcr-adulto?from_module=pcr-gestacao-acls" as Href);
          }}
          style={({ pressed }) => [s.rotaBotao, pressed && s.rotaBotaoPressed]}>
          <View style={{ flex: 1 }}>
            <Text style={s.rotaTitulo}>{tr("PCR no adulto")}</Text>
            <Text style={s.rotaSub}>{tr("O algoritmo que conduz esta parada — ritmos, fármacos e ciclos")}</Text>
          </View>
          <Text style={s.rotaChevron}>›</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/modulos/pre-eclampsia?from_module=pcr-gestacao-acls" as Href)}
          style={({ pressed }) => [s.rotaBotao, pressed && s.rotaBotaoPressed]}>
          <View style={{ flex: 1 }}>
            <Text style={s.rotaTitulo}>{tr("Pré-eclâmpsia e eclâmpsia")}</Text>
            <Text style={s.rotaSub}>{tr("Se houver PULSO — sulfatação, crise hipertensiva, HELLP")}</Text>
          </View>
          <Text style={s.rotaChevron}>›</Text>
        </Pressable>
      </View>

      {/* Causas obstétricas */}
      <View style={s.causasCard}>
        <Text style={s.causasTitulo}>{tr("ABCDEFGH — causas de PCR na gestante")}</Text>
        <Text style={s.causasIntro}>
          {tr(
            "Pesquisar em paralelo à RCP, junto com as Hs e Ts habituais. Na gestante, a causa costuma ser obstétrica.",
          )}
        </Text>
        {CAUSAS_OBSTETRICAS.map((causa) => (
          <View key={causa.letra} style={s.causaLinha}>
            <View style={s.causaBadge}>
              <Text style={s.causaLetra}>{causa.letra}</Text>
            </View>
            <View style={s.causaTextos}>
              <Text style={s.causaRotulo}>{tr(causa.rotulo)}</Text>
              <Text style={s.causaExemplos}>{tr(causa.exemplos)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>{tr("Não confundir com a eclâmpsia sem parada")}</Text>
        <Text style={s.footerBody}>
          {tr(
            "Gestante com crise convulsiva, hipertensão grave ou HELLP, mas COM pulso, é o módulo de Pré-eclâmpsia e Eclâmpsia — inclusive o sulfato de magnésio. Este módulo é exclusivo da parada cardiorrespiratória.",
          )}
        </Text>
        <View style={s.footerRule} />
        <View style={s.footerRule} />
        <Text style={s.footerTitle}>{tr("Engasgo na gestante")}</Text>
        <Text style={s.footerBody}>
          {tr(
            "Obstrução de via aérea por corpo estranho: o algoritmo do adulto é 5 golpes nas costas seguidos de 5 compressões ABDOMINAIS. Na gestação em fase final — ou quando o socorrista não consegue circundar o abdome — as 5 compressões são TORÁCICAS, não abdominais.",
          )}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>
          {tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025) e MedCampus · Guia Rápido de ACLS em Adultos v1.0")}
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos do CardAcao ───────────────────────────────────────────────────────

const ca = StyleSheet.create({
  card: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#565e6c",
    borderLeftWidth: 5,
    borderLeftColor: "#1d4ed8",
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAlerta: {
    borderLeftColor: "#c2410c",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ordemBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#1d4ed8",
  },
  ordemBadgeAlerta: {
    backgroundColor: "#c2410c",
  },
  ordemTexto: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: 22,
  },
  gatilhoBloco: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#2f3542",
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 3,
  },
  gatilhoRotulo: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#aab6c6",
  },
  gatilhoTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f1f5f9",
    lineHeight: 19,
  },
  detalhe: {
    fontSize: 13,
    lineHeight: 20,
    color: "#aab6c6",
    fontWeight: "500",
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#292e38",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#383e4a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#7fb3ff",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#aab6c6",
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: {
    height: 1,
    backgroundColor: "#565e6c",
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#aab6c6",
    fontWeight: "500",
  },

  // ── Janela dos 5 minutos ──
  janelaCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#7fb3ff",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  janelaEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#7fb3ff",
  },
  janelaTitulo: {
    fontSize: 19,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  janelaCorpo: {
    fontSize: 13,
    lineHeight: 20,
    color: "#aab6c6",
    fontWeight: "500",
  },
  janelaRule: {
    height: 1,
    backgroundColor: "#565e6c",
    marginVertical: 2,
  },
  janelaLinha: {
    gap: 10,
  },
  janelaMarco: {
    gap: 2,
  },
  janelaMarcoTempo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7fb3ff",
    letterSpacing: 0.3,
  },
  janelaMarcoTexto: {
    fontSize: 13,
    lineHeight: 19,
    color: "#f1f5f9",
    fontWeight: "600",
  },

  // ── Alerta ──
  alertaCard: {
    backgroundColor: "#3a2f2a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#c2410c",
    gap: 8,
  },
  alertaTitulo: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },
  alertaCorpo: {
    fontSize: 13,
    lineHeight: 20,
    color: "#e7d9d2",
    fontWeight: "600",
  },

  // ── Grupo ──
  grupo: {
    gap: 10,
  },
  grupoHeader: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7fb3ff",
    letterSpacing: -0.2,
  },
  grupoSubtitulo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#aab6c6",
    lineHeight: 17,
  },

  // ── Causas obstétricas ──
  rotasCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 10,
  },
  rotasTitulo: { fontSize: 15, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.2 },
  rotaBotao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2f3540",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#565e6c",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
  },
  rotaBotaoPressed: { opacity: 0.85 },
  rotaTitulo: { fontSize: 14, fontWeight: "800", color: "#f1f5f9" },
  rotaSub: { fontSize: 12, lineHeight: 17, color: "#aab6c6", fontWeight: "500" },
  rotaChevron: { fontSize: 18, fontWeight: "800", color: "#7fb3ff" },

  causasCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  causasTitulo: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
  },
  causasIntro: {
    fontSize: 13,
    lineHeight: 19,
    color: "#aab6c6",
    fontWeight: "500",
  },
  causaLinha: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  causaBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#1d4ed8",
  },
  causaLetra: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  causaTextos: {
    flex: 1,
    gap: 1,
  },
  causaRotulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 20,
  },
  causaExemplos: {
    fontSize: 12,
    lineHeight: 18,
    color: "#aab6c6",
    fontWeight: "500",
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 10,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7fb3ff",
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#aab6c6",
    fontWeight: "500",
  },
  footerRule: {
    height: 1,
    backgroundColor: "#565e6c",
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: "#aab6c6",
    letterSpacing: 0.2,
  },
});
