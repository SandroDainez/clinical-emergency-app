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
        <View style={styles.heroShell}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Sala de comando clínica</Text>
            <Text style={styles.title}>Módulos assistenciais</Text>
            <Text style={styles.description}>
              Escolha um fluxo clínico com navegação direta, voz, auditoria e cronologia de caso.
            </Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaPill}>
                <Text style={styles.heroMetaText}>ACLS</Text>
              </View>
              <View style={styles.heroMetaPill}>
                <Text style={styles.heroMetaText}>Sepse</Text>
              </View>
              <View style={styles.heroMetaPill}>
                <Text style={styles.heroMetaText}>Vasoativos</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.historyCard} onPress={() => router.push("/session-history")}>
            <Text style={styles.historyEyebrow}>Sessões</Text>
            <Text style={styles.historyTitle}>Histórico clínico</Text>
            <Text style={styles.historySubtitle}>
              Rever evolução, duração, choques, medicações e debriefs salvos.
            </Text>
            <Text style={styles.historyAction}>Abrir histórico</Text>
          </Pressable>
        </View>

        <View style={styles.moduleList}>
          {modules.map((module) => (
            <Pressable
              key={module.id}
              style={styles.moduleCard}
              onPress={() => {
                void openModule(module.id, module.route as Href);
              }}>
              <View style={styles.moduleCardHeader}>
                <Text style={styles.moduleEyebrow}>Módulo</Text>
                <View style={styles.moduleArrow}>
                  <Text style={styles.moduleArrowText}>Ir</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
              <View style={styles.moduleFooter}>
                <Text style={styles.moduleAction}>Abrir fluxo</Text>
                <Text style={styles.moduleActionHint}>Entrada direta</Text>
              </View>
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
    backgroundColor: "#edf2f7",
  },
  content: {
    padding: 24,
    gap: 20,
  },
  heroShell: {
    gap: 14,
  },
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#020617",
    shadowOpacity: 0.26,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
    gap: 14,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#93c5fd",
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    color: "#f8fafc",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#cbd5e1",
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroMetaPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroMetaText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#dbeafe",
  },
  moduleList: {
    gap: 16,
  },
  moduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  moduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moduleEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  moduleArrow: {
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  moduleArrowText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  moduleDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4b5563",
  },
  moduleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  moduleAction: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  moduleActionHint: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    gap: 8,
    borderWidth: 1,
    borderColor: "#dbe4ee",
  },
  historyEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f766e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  historySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  historyAction: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f766e",
  },
});
