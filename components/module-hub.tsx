import { type Href, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { logClinicalSessionEvent } from "../lib/clinical-events";
import { setCurrentClinicalSessionId } from "../lib/clinical-session-store";
import { startClinicalSession } from "../lib/clinical";
import { getClinicalModules } from "../clinical-modules";

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();

  async function openModule(moduleId: string, route: Href) {
    if (moduleId !== "pcr-adulto") {
      router.push(route);
      return;
    }

    const { data, error } = await startClinicalSession("acls_adulto");
    if (error) {
      console.error("Falha ao iniciar sessão clínica", error);
      setCurrentClinicalSessionId(null);
      router.push(route);
      return;
    }

    const sessionId = data?.id ?? data?.session_id;
    if (!sessionId) {
      console.error("ID da sessão não retornado");
      setCurrentClinicalSessionId(null);
      router.push(route);
      return;
    }

    setCurrentClinicalSessionId(sessionId);

    const { error: eventError } = await logClinicalSessionEvent(
      sessionId,
      "protocol_opened",
      "Protocolo ACLS aberto",
      {
        module_key: "acls_adulto",
      }
    );

    if (eventError) {
      console.error("Falha ao registrar evento de sessão clínica", eventError);
    }

    router.push(route);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Apoio à decisão clínica</Text>
          <Text style={styles.title}>Módulos clínicos</Text>
          <Text style={styles.description}>
            Selecione o protocolo assistencial desejado. A arquitetura está pronta para crescimento por módulo, mantendo engine, voz, log e resumo clínico.
          </Text>
        </View>
        <Pressable style={styles.historyCard} onPress={() => router.push("/session-history")}>
          <Text style={styles.historyTitle}>Histórico de sessões</Text>
          <Text style={styles.historySubtitle}>Reveja sessões passadas e acompanhe status e duração</Text>
        </Pressable>

        <View style={styles.moduleList}>
          {modules.map((module) => (
            <Pressable
              key={module.id}
              style={styles.moduleCard}
              onPress={() => {
                void openModule(module.id, module.route as Href);
              }}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
              <Text style={styles.moduleAction}>Abrir protocolo</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
  content: {
    padding: 20,
    gap: 18,
  },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#7c2d12",
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
  moduleList: {
    gap: 14,
  },
  moduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: "#1d4ed8",
    gap: 10,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  moduleDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4b5563",
  },
  moduleAction: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  historyCard: {
    backgroundColor: "#1d4ed8",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    gap: 6,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  historySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.8)",
  },
});
