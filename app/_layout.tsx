import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/components/auth-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "index",
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { canAccessApp, isAdmin, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    const rootSegment = segments[0] as string | undefined;
    const inTabs = rootSegment === "(tabs)";
    const inAdmin = rootSegment === "admin";
    const inProtectedRoute = inTabs || inAdmin || rootSegment === "session-history";
    const inLogin = rootSegment === "login";

    console.log("[auth-route]", {
      rootSegment: rootSegment ?? "index",
      inProtectedRoute,
      inLogin,
      canAccessApp,
      isAdmin,
    });

    if (!canAccessApp && inProtectedRoute) {
      router.replace("/login" as never);
      return;
    }

    if (canAccessApp && inLogin) {
      router.replace((isAdmin ? "/admin" : "/(tabs)") as never);
      return;
    }

    if (canAccessApp && inAdmin && !isAdmin) {
      router.replace("/(tabs)/explore" as never);
    }
  }, [canAccessApp, isAdmin, isReady, router, segments]);

  if (!isReady) {
    return (
      <View style={styles.bootScreen}>
        <ActivityIndicator size="large" color="#2f5bd7" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef3fb",
  },
});
