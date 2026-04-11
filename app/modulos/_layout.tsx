import { Stack } from "expo-router";

/** Sem cabeçalho nativo — evita o título literal `modulos/[id]` na web. O cromado fica em `[id].tsx`. */
export default function ModulosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
