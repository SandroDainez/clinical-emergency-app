import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTr } from "../lib/use-tr";

const UPDATED = "19 de junho de 2026";
const CONTACT = "sandrodainez1@gmail.com";

type Section = { h: string; body: string[] };

const SECTIONS: Section[] = [
  { h: "1. Responsável pelos dados", body: [
    `O tratamento dos dados é realizado por Sandro Dainez (desenvolvedor responsável). Para dúvidas, solicitações ou exercício de direitos, contate: ${CONTACT}.`,
  ]},
  { h: "2. Dados que coletamos", body: [
    "• Conta: e-mail, senha (armazenada de forma segura/criptografada pelo provedor de autenticação) e, opcionalmente, nome.",
    "• Uso do App: registros de quando você inicia um caso/guia (qual módulo, data e hora) e seu último acesso, usados para acompanhamento e melhoria do App pelo administrador.",
    "• Avaliações: se você optar por avaliar o App, guardamos a nota (1–5) e o comentário enviado, associados à sua conta.",
    "• Microfone / comandos de voz: quando você ativa os comandos de voz, o áudio é processado para reconhecimento de fala. No aplicativo nativo, esse reconhecimento é feito pelo serviço do sistema operacional (Apple ou Google). O App não armazena gravações de áudio.",
  ]},
  { h: "3. Dados que NÃO coletamos", body: [
    "O App não solicita nem armazena dados que identifiquem pacientes. Os registros clínicos referem-se a cenários de treino/decisão e não são vinculados à identidade de nenhum paciente real.",
  ]},
  { h: "4. Finalidades e base legal", body: [
    "Usamos os dados para: autenticar e controlar o acesso, viabilizar o funcionamento do App, acompanhar o uso de forma agregada, responder a suporte e melhorar o produto. O tratamento baseia-se na execução do serviço solicitado por você e no legítimo interesse de operar e aprimorar o App, conforme a LGPD (Lei nº 13.709/2018) e legislações aplicáveis.",
  ]},
  { h: "5. Armazenamento e processadores", body: [
    "Os dados são armazenados em infraestrutura do provedor Supabase, que atua como operador, em servidores que podem estar localizados fora do Brasil. O reconhecimento de voz, quando usado, é processado pelos serviços de fala da Apple ou do Google, conforme a plataforma.",
  ]},
  { h: "6. Compartilhamento", body: [
    "Não vendemos seus dados. Compartilhamos dados apenas com os processadores estritamente necessários ao funcionamento, ou quando exigido por lei.",
  ]},
  { h: "7. Seus direitos", body: [
    `Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, bem como a revogação do consentimento, escrevendo para ${CONTACT}. A exclusão da conta remove seus dados de perfil; registros de uso agregados podem ser mantidos de forma anonimizada.`,
  ]},
  { h: "8. Retenção", body: [
    "Mantemos os dados pelo tempo necessário às finalidades acima ou enquanto sua conta estiver ativa. Você pode pedir a exclusão a qualquer momento.",
  ]},
  { h: "9. Crianças", body: [
    "O App destina-se a profissionais de saúde e não se dirige a menores de idade. Não coletamos intencionalmente dados de crianças.",
  ]},
  { h: "10. Segurança", body: [
    "Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados (autenticação, controle de acesso e criptografia em trânsito). Nenhum método é 100% seguro, mas trabalhamos para reduzir riscos.",
  ]},
  { h: "11. Aviso médico", body: [
    "O App é uma ferramenta de apoio educacional e à decisão clínica, baseada em diretrizes (ex.: AHA ACLS, SBEM). Não substitui o julgamento clínico nem a avaliação individual do paciente. A conduta e a responsabilidade pelo atendimento são sempre do profissional de saúde assistente.",
  ]},
  { h: "12. Alterações desta política", body: [
    "Podemos atualizar esta política periodicamente. A data da última atualização é indicada no topo. Mudanças relevantes serão comunicadas no App ou por e-mail.",
  ]},
  { h: "13. Contato", body: [`Dúvidas ou solicitações: ${CONTACT}.`] },
];

export default function PrivacidadeScreen() {
  const tr = useTr();
  const router = useRouter();

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={s.backRow}>
          <Text style={s.backText}>{tr("‹ Voltar")}</Text>
        </Pressable>

        <Text style={s.title}>{tr("Política de Privacidade")}</Text>
        <Text style={s.sub}>Clinical Emergency Suite · Última atualização: {UPDATED}</Text>
        <Text style={s.p}>
          {tr("Esta Política de Privacidade descreve como o aplicativo \"Clinical Emergency Suite\" (o \"App\") trata os dados de seus usuários. O App é uma ferramenta de apoio educacional e à decisão clínica, destinada a profissionais de saúde. Ao usar o App, você concorda com esta política.")}
        </Text>

        {SECTIONS.map((sec) => (
          <View key={sec.h}>
            <Text style={s.h}>{sec.h}</Text>
            {sec.body.map((line, i) => (
              <Text key={i} style={s.p}>{line}</Text>
            ))}
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0f1d" },
  content: { padding: 20, maxWidth: 720, width: "100%", alignSelf: "center" },
  backRow: { marginBottom: 10 },
  backText: { color: "#7eb0ff", fontSize: 15, fontWeight: "800" },
  title: { color: "#f5f7fb", fontSize: 26, fontWeight: "900", marginTop: 4 },
  sub: { color: "#aab6c6", fontSize: 13, fontWeight: "600", marginTop: 4, marginBottom: 12 },
  h: { color: "#cfe0ff", fontSize: 16, fontWeight: "800", marginTop: 18, marginBottom: 4 },
  p: { color: "#c8d2e1", fontSize: 14, lineHeight: 21, marginTop: 4 },
});
