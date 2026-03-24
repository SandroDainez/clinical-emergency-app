import { Href, Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getClinicalModules } from "../clinical-modules";

export default function ModuleHub() {
  const modules = getClinicalModules();

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

        <View style={styles.moduleList}>
          {modules.map((module) => (
            <Link key={module.id} href={module.route as Href} asChild>
              <Pressable style={styles.moduleCard}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                <Text style={styles.moduleAction}>Abrir protocolo</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
