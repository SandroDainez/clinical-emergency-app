import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type WebAudioContextConstructor = typeof AudioContext;

const CPR_GUIDE_BPM = 110;
const CPR_TARGET_RANGE_LABEL = "100-120/min";

function createMetronomeClick(context: AudioContext) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.8, context.currentTime + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.11);
}

type CprMetronomeCardProps = {
  active: boolean;
};

export default function CprMetronomeCard({ active }: CprMetronomeCardProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  useEffect(() => {
    if (!active) {
      if (audioContextRef.current && audioContextRef.current.state === "running") {
        void audioContextRef.current.suspend();
      }
      return;
    }

    const intervalMs = Math.round(60000 / CPR_GUIDE_BPM);
    const interval = setInterval(() => {
      setTickCount((current) => current + 1);

      if (typeof window === "undefined" || !soundEnabled) {
        return;
      }

      const AudioContextCtor = (window.AudioContext ||
        // @ts-expect-error webkit fallback for Safari
        window.webkitAudioContext) as WebAudioContextConstructor | undefined;

      if (!AudioContextCtor) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      if (audioContextRef.current.state === "suspended") {
        void audioContextRef.current.resume();
      }

      createMetronomeClick(audioContextRef.current);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [active, soundEnabled]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  if (!active) {
    return null;
  }

  const flashActive = tickCount % 2 === 0;

  return (
    <View style={[styles.container, isCompact ? styles.containerCompact : null]}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.beatDot, flashActive ? styles.beatDotActive : null]} />
          <Text style={styles.eyebrow}>RCP</Text>
        </View>

        <Text style={styles.rangeLabel}>{CPR_TARGET_RANGE_LABEL}</Text>

        <Pressable
          style={[styles.toggle, soundEnabled ? styles.toggleActive : null]}
          onPress={() => setSoundEnabled((current) => !current)}>
          <Text style={[styles.toggleText, soundEnabled ? styles.toggleTextActive : null]}>
            {soundEnabled ? "Som on" : "Som off"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 12,
    bottom: 16,
    zIndex: 40,
    pointerEvents: "box-none",
  },
  containerCompact: {
    right: 8,
    bottom: 10,
  },
  card: {
    minWidth: 90,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(248, 250, 252, 0.12)",
    shadowColor: "#020617",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  beatDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(248, 113, 113, 0.35)",
  },
  beatDotActive: {
    backgroundColor: "#f87171",
    transform: [{ scale: 1.18 }],
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#fca5a5",
    textTransform: "uppercase",
  },
  rangeLabel: {
    fontSize: 13,
    lineHeight: 15,
    fontWeight: "800",
    color: "#f8fafc",
  },
  toggle: {
    minHeight: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(248, 250, 252, 0.1)",
  },
  toggleActive: {
    backgroundColor: "rgba(248, 113, 113, 0.16)",
  },
  toggleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#cbd5e1",
  },
  toggleTextActive: {
    color: "#fecaca",
  },
});
