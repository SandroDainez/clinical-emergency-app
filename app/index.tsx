import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/components/auth-provider";
import ModuleHub from "../components/module-hub";
import PresentationScreen from "../components/presentation-screen";

export default function Index() {
  const { canAccessApp, isAdmin, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.bootScreen}>
        <ActivityIndicator size="large" color="#2f5bd7" />
      </View>
    );
  }

  if (canAccessApp) {
    if (isAdmin) {
      return <Redirect href="/admin" />;
    }
    return <ModuleHub />;
  }

  return <PresentationScreen />;
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef3fb",
  },
});
