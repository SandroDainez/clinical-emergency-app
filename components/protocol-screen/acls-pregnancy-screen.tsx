import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import ReferenceBackHeader from "./reference-back-header";
import { executeClinicalContextNavigation, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";
import { useTr } from "../../lib/use-tr";
import { TIPOGRAFIA, RAIO, SOMBRA, TEMAS } from "../../design-system/tokens";
import { traduzirPecas } from "../../lib/i18n/traduzir-pecas";
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

// ── Componentes ────────────────────────────────────────────────────────────────

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
  const pcrNavigation = getClinicalContextNavigation("gestacao-pcr-adulto");
  const preEclampsiaNavigation = getClinicalContextNavigation("gestacao-pre-eclampsia-referencia");
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
            // A etiologia permanece aberta (ABCDEFGH); o contrato não pré-marca causa.
            executeClinicalContextNavigation(pcrNavigation, (href) => router.push(href as never));
          }}
          style={({ pressed }) => [s.rotaBotao, pressed && s.rotaBotaoPressed]}>
          <View style={{ flex: 1 }}>
            <Text style={s.rotaTitulo}>{tr("PCR no adulto")}</Text>
            <Text style={s.rotaSub}>{tr("O algoritmo que conduz esta parada — ritmos, fármacos e ciclos")}</Text>
          </View>
          <View style={s.rotaCta}>
            <Text style={s.rotaCtaTexto}>{tr("ABRIR MÓDULO")}</Text>
            <Text style={s.rotaCtaSeta}>›</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => executeClinicalContextNavigation(preEclampsiaNavigation, (href) => router.push(href as never))}
          style={({ pressed }) => [s.rotaBotao, pressed && s.rotaBotaoPressed]}>
          <View style={{ flex: 1 }}>
            <Text style={s.rotaTitulo}>{tr("Pré-eclâmpsia e eclâmpsia")}</Text>
            <Text style={s.rotaSub}>{tr("Se houver PULSO — sulfatação, crise hipertensiva, HELLP")}</Text>
          </View>
          <View style={s.rotaCta}>
            <Text style={s.rotaCtaTexto}>{tr("ABRIR MÓDULO")}</Text>
            <Text style={s.rotaCtaSeta}>›</Text>
          </View>
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
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    borderLeftWidth: 5,
    borderLeftColor: TEMAS.escuro.cores.primary,
    padding: 14,
    gap: 10,
    shadowColor: SOMBRA.shadowColor,
    shadowOpacity: SOMBRA.shadowOpacity,
    shadowRadius: SOMBRA.shadowRadius,
    shadowOffset: SOMBRA.shadowOffset,
    elevation: 3,
  },
  cardAlerta: {
    borderLeftColor: TEMAS.escuro.cores.warning,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ordemBadge: {
    width: 30,
    height: 30,
    borderRadius: RAIO.botao,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: TEMAS.escuro.cores.primary,
  },
  ordemBadgeAlerta: {
    backgroundColor: TEMAS.escuro.cores.warning,
  },
  ordemTexto: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
  },
  titulo: {
    fontSize: TIPOGRAFIA.body.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: 22,
  },
  gatilhoBloco: {
    borderRadius: RAIO.input,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#2f3542",
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 3,
  },
  gatilhoRotulo: {
    fontSize: TIPOGRAFIA.micro.fontSize,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: TEMAS.escuro.cores.textSecondary,
  },
  gatilhoTexto: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    fontWeight: "700",
    color: TEMAS.escuro.cores.text,
    lineHeight: 19,
  },
  detalhe: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 20,
    color: TEMAS.escuro.cores.textSecondary,
    fontWeight: "500",
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: TEMAS.escuro.cores.bg },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },

  introCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 20,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 8,
    shadowColor: SOMBRA.shadowColor,
    shadowOpacity: SOMBRA.shadowOpacity,
    shadowRadius: SOMBRA.shadowRadius,
    shadowOffset: SOMBRA.shadowOffset,
    elevation: 3,
  },
  introEyebrow: {
    fontSize: TIPOGRAFIA.micro.fontSize,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: TEMAS.escuro.cores.primary,
  },
  introTitle: {
    fontSize: TIPOGRAFIA.title.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introSubtitle: {
    fontSize: TIPOGRAFIA.body.fontSize,
    fontWeight: "700",
    color: TEMAS.escuro.cores.textSecondary,
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: {
    height: 1,
    backgroundColor: TEMAS.escuro.cores.border,
  },
  introBody: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 21,
    color: TEMAS.escuro.cores.textSecondary,
    fontWeight: "500",
  },

  // ── Janela dos 5 minutos ──
  janelaCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.primary,
    gap: 8,
    shadowColor: SOMBRA.shadowColor,
    shadowOpacity: SOMBRA.shadowOpacity,
    shadowRadius: SOMBRA.shadowRadius,
    shadowOffset: SOMBRA.shadowOffset,
    elevation: 3,
  },
  janelaEyebrow: {
    fontSize: TIPOGRAFIA.micro.fontSize,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: TEMAS.escuro.cores.primary,
  },
  janelaTitulo: {
    fontSize: TIPOGRAFIA.step.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  janelaCorpo: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 20,
    color: TEMAS.escuro.cores.textSecondary,
    fontWeight: "500",
  },
  janelaRule: {
    height: 1,
    backgroundColor: TEMAS.escuro.cores.border,
    marginVertical: 2,
  },
  janelaLinha: {
    gap: 10,
  },
  janelaMarco: {
    gap: 2,
  },
  janelaMarcoTempo: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.primary,
    letterSpacing: 0.3,
  },
  janelaMarcoTexto: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 19,
    color: TEMAS.escuro.cores.text,
    fontWeight: "600",
  },

  // ── Alerta ──
  alertaCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.warning,
    gap: 8,
  },
  alertaTitulo: {
    fontSize: TIPOGRAFIA.body.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.2,
  },
  alertaCorpo: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 20,
    color: TEMAS.escuro.cores.text,
    fontWeight: "600",
  },

  // ── Grupo ──
  grupo: {
    gap: 10,
  },
  grupoHeader: {
    borderRadius: RAIO.input,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.border,
    backgroundColor: TEMAS.escuro.cores.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  grupoTitulo: {
    fontSize: TIPOGRAFIA.step.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.primary,
    letterSpacing: -0.2,
  },
  grupoSubtitulo: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    fontWeight: "600",
    color: TEMAS.escuro.cores.textSecondary,
    lineHeight: 17,
  },

  // ── Causas obstétricas ──
  rotasCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 10,
  },
  rotasTitulo: { fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text, letterSpacing: -0.2 },
  rotaBotao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.input,
    borderWidth: 1.5,
    borderColor: TEMAS.escuro.cores.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
  },
  rotaBotaoPressed: { opacity: 0.85 },
  rotaTitulo: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.text },
  rotaSub: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 17, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },
  rotaCta: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: RAIO.botao,
    backgroundColor: TEMAS.escuro.cores.primary,
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  rotaCtaTexto: { fontSize: TIPOGRAFIA.micro.fontSize, fontWeight: "900", color: TEMAS.escuro.cores.onPrimary, letterSpacing: 0.4 },
  rotaCtaSeta: { fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "900", color: TEMAS.escuro.cores.onPrimary },

  causasCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 16,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 12,
    shadowColor: SOMBRA.shadowColor,
    shadowOpacity: SOMBRA.shadowOpacity,
    shadowRadius: SOMBRA.shadowRadius,
    shadowOffset: SOMBRA.shadowOffset,
    elevation: 3,
  },
  causasTitulo: {
    fontSize: TIPOGRAFIA.body.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    letterSpacing: -0.2,
  },
  causasIntro: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 19,
    color: TEMAS.escuro.cores.textSecondary,
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
    borderRadius: RAIO.botao,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: TEMAS.escuro.cores.primary,
  },
  causaLetra: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
  },
  causaTextos: {
    flex: 1,
    gap: 1,
  },
  causaRotulo: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    fontWeight: "800",
    color: TEMAS.escuro.cores.text,
    lineHeight: 20,
  },
  causaExemplos: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: 18,
    color: TEMAS.escuro.cores.textSecondary,
    fontWeight: "500",
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: TEMAS.escuro.cores.surface,
    borderRadius: RAIO.card,
    padding: 14,
    borderWidth: 1,
    borderColor: TEMAS.escuro.cores.border,
    gap: 7,
  },
  footerTitle: { fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "800", color: TEMAS.escuro.cores.textSecondary },
  footerBody: { fontSize: TIPOGRAFIA.caption.fontSize, lineHeight: 18, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },
  footerRule: { height: 1, backgroundColor: TEMAS.escuro.cores.border, marginVertical: 2 },
  footerSource: { fontSize: TIPOGRAFIA.micro.fontSize, lineHeight: 15, color: TEMAS.escuro.cores.textSecondary, fontWeight: "500" },
});
