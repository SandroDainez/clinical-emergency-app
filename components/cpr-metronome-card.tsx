import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type WebAudioContextConstructor = typeof AudioContext;

function createMetronomeClick(context: AudioContext) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.95, context.currentTime + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.24, context.currentTime + 0.045);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
}

type CprMetronomeCardProps = {
  active: boolean;
};

export default function CprMetronomeCard({ active }: CprMetronomeCardProps) {
  const [bpm, setBpm] = useState(110);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  useEffect(() => {
    setSoundEnabled(active);
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const intervalMs = Math.round(60000 / bpm);
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
  }, [active, bpm, soundEnabled]);

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

  const beatLabel = `${bpm} / min`;
  const pendulumTilt = tickCount % 2 === 0 ? "-18deg" : "18deg";

  return (
    <View style={[styles.metronomeDock, isCompact ? styles.metronomeDockCompact : null]}>
      <View style={[styles.metronomeClock, isCompact ? styles.metronomeClockCompact : null]}>
        <Text style={styles.metronomeDockEyebrow}>RCP</Text>
        <View style={[styles.metronomeClockFace, isCompact ? styles.metronomeClockFaceCompact : null]}>
          <View style={styles.metronomeClockCenter} />
          <View
            style={[
              styles.metronomePendulumArm,
              isCompact ? styles.metronomePendulumArmCompact : null,
              { transform: [{ rotate: pendulumTilt }] },
            ]}>
            <View style={styles.metronomePendulumWeight} />
          </View>
        </View>
        <Text style={[styles.metronomeDockValue, isCompact ? styles.metronomeDockValueCompact : null]}>
          {beatLabel}
        </Text>
      </View>

      {isCompact ? null : (
        <>
          <Text style={styles.metronomeDockPrompt}>
            {soundEnabled
              ? "Se quiser, desative o som do marcador de ritmo da massagem cardiaca."
              : "Se quiser, ative o som do marcador de ritmo da massagem cardiaca."}
          </Text>

          <View style={styles.metronomeDockBpmRow}>
            {[100, 110, 120].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.metronomeDockBpmButton,
                  bpm === option && styles.metronomeDockBpmButtonActive,
                ]}
                onPress={() => setBpm(option)}>
                <Text
                  style={[
                    styles.metronomeDockBpmButtonText,
                    bpm === option && styles.metronomeDockBpmButtonTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Pressable
        style={[
          styles.metronomeDockToggle,
          isCompact ? styles.metronomeDockToggleCompact : null,
          soundEnabled && styles.metronomeDockToggleActive,
        ]}
        onPress={() => setSoundEnabled((current) => !current)}>
        <Text
          style={[
            styles.metronomeDockToggleText,
            isCompact ? styles.metronomeDockToggleTextCompact : null,
            soundEnabled && styles.metronomeDockToggleTextActive,
          ]}>
          {isCompact ? (soundEnabled ? "Som on" : "Som off") : soundEnabled ? "Desativar" : "Ativar"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  metronomeDock: {
    position: "absolute",
    right: 14,
    top: 120,
    width: 176,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderRadius: 20,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#020617",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  metronomeDockCompact: {
    top: 68,
    right: 8,
    width: 88,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 14,
    gap: 6,
  },
  metronomeClock: {
    alignItems: "center",
    gap: 8,
  },
  metronomeClockCompact: {
    gap: 3,
  },
  metronomeDockEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#fca5a5",
  },
  metronomeClockFace: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    borderWidth: 6,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingTop: 14,
  },
  metronomeClockFaceCompact: {
    width: 40,
    height: 40,
    borderWidth: 3,
    paddingTop: 6,
  },
  metronomeClockCenter: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#7f1d1d",
    zIndex: 2,
  },
  metronomePendulumArm: {
    position: "absolute",
    top: 19,
    width: 3,
    height: 52,
    backgroundColor: "#7f1d1d",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  metronomePendulumArmCompact: {
    top: 8,
    height: 22,
  },
  metronomePendulumWeight: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#b91c1c",
    marginBottom: -6,
  },
  metronomeDockValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 34,
  },
  metronomeDockValueCompact: {
    fontSize: 12,
    lineHeight: 14,
  },
  metronomeDockPrompt: {
    fontSize: 12,
    lineHeight: 18,
    color: "#f8fafc",
    fontWeight: "600",
  },
  metronomeDockPromptCompact: {
    fontSize: 10,
    lineHeight: 14,
  },
  metronomeDockBpmRow: {
    flexDirection: "row",
    gap: 6,
  },
  metronomeDockBpmButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  metronomeDockBpmButtonActive: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },
  metronomeDockBpmButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f9fafb",
  },
  metronomeDockBpmButtonTextActive: {
    color: "#7f1d1d",
  },
  metronomeDockToggle: {
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
  },
  metronomeDockToggleActive: {
    backgroundColor: "#fecaca",
  },
  metronomeDockToggleCompact: {
    minHeight: 28,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  metronomeDockToggleText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  metronomeDockToggleTextCompact: {
    fontSize: 10,
  },
  metronomeDockToggleTextActive: {
    color: "#7f1d1d",
  },
});
