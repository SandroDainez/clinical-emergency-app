import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Mantém a tela acordada (não apaga/bloqueia) enquanto o componente está montado.
 * No web usa a Screen Wake Lock API (Chrome Android, Safari iOS 16.4+).
 * Reativa automaticamente quando a aba volta a ficar visível (o lock é solto ao
 * trocar de aba/minimizar). Essencial durante uma reanimação, em que o médico
 * não fica tocando na tela e ela apagaria sozinha.
 */
export function useScreenWakeLock(active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    if (Platform.OS !== "web") return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    if (typeof document === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lock: any = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || lock) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock = await (navigator as any).wakeLock.request("screen");
        lock?.addEventListener?.("release", () => {
          lock = null;
        });
      } catch {
        // sem suporte, sem permissão ou bloqueado — silencioso
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !lock && !cancelled) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      try {
        lock?.release?.();
      } catch {
        // ignore
      }
      lock = null;
    };
  }, [active]);
}
