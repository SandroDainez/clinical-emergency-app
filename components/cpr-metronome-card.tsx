import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

type FeedbackMode = "off" | "haptic" | "sound";

type WebAudioCtorType = typeof AudioContext;

function playMetronomeClick(context: AudioContext) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.95, context.currentTime + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.24, context.currentTime + 0.045);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 0.12);
}

type CprMetronomeCardProps = {
  active: boolean;
};

const BPM_OPTIONS = [100, 110, 120] as const;

export default function CprMetronomeCard({ active }: CprMetronomeCardProps) {
  const [bpm, setBpm] = useState(110);
  const [feedback, setFeedback] = useState<FeedbackMode>("off");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pendulumAnim = useRef(new Animated.Value(-1)).current;
  const beatPulse = useRef(new Animated.Value(1)).current;
  const visAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 600;

  // Fade/slide in-out when active changes
  useEffect(() => {
    Animated.timing(visAnim, {
      toValue: active ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [active, visAnim]);

  // Pendulum: one full swing = one beat (left→right or right→left per compression)
  useEffect(() => {
    loopRef.current?.stop();
    loopRef.current = null;

    if (!active) return;

    const beatMs = Math.round(60000 / bpm);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pendulumAnim, { toValue: 1, duration: beatMs, useNativeDriver: true }),
        Animated.timing(pendulumAnim, { toValue: -1, duration: beatMs, useNativeDriver: true }),
      ])
    );
    loopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      loopRef.current = null;
    };
  }, [active, bpm, pendulumAnim]);

  // Beat feedback: haptic on native, AudioContext on web
  useEffect(() => {
    if (!active || feedback === "off") return;

    const beatMs = Math.round(60000 / bpm);

    const interval = setInterval(() => {
      // Subtle BPM number pulse on each beat
      Animated.sequence([
        Animated.timing(beatPulse, { toValue: 1.12, duration: 55, useNativeDriver: true }),
        Animated.timing(beatPulse, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]).start();

      if (feedback === "haptic" && Platform.OS !== "web") {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }

      if (feedback === "sound" && typeof window !== "undefined") {
        const AudioContextCtor = (
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: WebAudioCtorType }).webkitAudioContext
        ) as WebAudioCtorType | undefined;
        if (!AudioContextCtor) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContextCtor();
        if (audioCtxRef.current.state === "suspended") void audioCtxRef.current.resume();
        playMetronomeClick(audioCtxRef.current);
      }
    }, beatMs);

    return () => clearInterval(interval);
  }, [active, bpm, feedback, beatPulse]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const rotate = pendulumAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-18deg", "18deg"],
  });

  function cycleFeedback() {
    setFeedback((cur) => {
      if (cur === "off") return Platform.OS !== "web" ? "haptic" : "sound";
      if (cur === "haptic") return "sound";
      return "off";
    });
  }

  const feedbackLabel =
    feedback === "off" ? "Off" : feedback === "haptic" ? "Tato" : "Som";
  const feedbackActive = feedback !== "off";

  // ── Mobile: full-width bottom bar ──────────────────────────────────────────
  if (isMobile) {
    const bottomOffset = Math.max(insets.bottom + 8, 16);
    return (
      <Animated.View
        pointerEvents={active ? "auto" : "none"}
        style={[
          styles.bar,
          { bottom: bottomOffset },
          {
            opacity: visAnim,
            transform: [
              {
                translateY: visAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [64, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Pendulum */}
        <View style={styles.barPendulumWrap}>
          <Text style={styles.barLabel}>RCP</Text>
          <View style={styles.barClockFace}>
            <View style={styles.barClockCenter} />
            <Animated.View style={[styles.barPendulumArm, { transform: [{ rotate }] }]}>
              <View style={styles.barPendulumWeight} />
            </Animated.View>
          </View>
        </View>

        {/* BPM value */}
        <Animated.View style={[styles.barBpmBlock, { transform: [{ scale: beatPulse }] }]}>
          <Text style={styles.barBpmNumber}>{bpm}</Text>
          <Text style={styles.barBpmUnit}>/min</Text>
        </Animated.View>

        {/* BPM selector */}
        <View style={styles.barBpmRow}>
          {BPM_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.barBpmBtn, bpm === opt && styles.barBpmBtnActive]}
              onPress={() => setBpm(opt)}
              hitSlop={8}
            >
              <Text style={[styles.barBpmBtnText, bpm === opt && styles.barBpmBtnTextActive]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Feedback toggle */}
        <Pressable
          style={[styles.barFeedbackBtn, feedbackActive && styles.barFeedbackBtnActive]}
          onPress={cycleFeedback}
          hitSlop={8}
        >
          <Text style={[styles.barFeedbackText, feedbackActive && styles.barFeedbackTextActive]}>
            {feedbackLabel}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  // ── Tablet / desktop: compact floating card (top-right) ────────────────────
  return (
    <Animated.View
      pointerEvents={active ? "auto" : "none"}
      style={[
        styles.card,
        width >= 1320 ? styles.cardWide : styles.cardNarrow,
        {
          opacity: visAnim,
          transform: [
            {
              scale: visAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.88, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.cardEyebrow}>RCP</Text>

      {/* Clock */}
      <View style={[styles.cardClock, width < 1320 && styles.cardClockNarrow]}>
        <View style={styles.cardClockCenter} />
        <Animated.View
          style={[
            styles.cardPendulumArm,
            width < 1320 && styles.cardPendulumArmNarrow,
            { transform: [{ rotate }] },
          ]}
        >
          <View style={styles.cardPendulumWeight} />
        </Animated.View>
      </View>

      {/* BPM value */}
      <Animated.Text
        style={[
          styles.cardBpmValue,
          width < 1320 && styles.cardBpmValueNarrow,
          { transform: [{ scale: beatPulse }] },
        ]}
      >
        {bpm}
        <Text style={styles.cardBpmUnit}>/min</Text>
      </Animated.Text>

      {/* BPM selector — desktop only */}
      {width >= 1320 && (
        <View style={styles.cardBpmRow}>
          {BPM_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.cardBpmBtn, bpm === opt && styles.cardBpmBtnActive]}
              onPress={() => setBpm(opt)}
            >
              <Text style={[styles.cardBpmBtnText, bpm === opt && styles.cardBpmBtnTextActive]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Feedback toggle */}
      <Pressable
        style={[styles.cardFeedbackBtn, feedbackActive && styles.cardFeedbackBtnActive]}
        onPress={cycleFeedback}
      >
        <Text style={[styles.cardFeedbackText, feedbackActive && styles.cardFeedbackTextActive]}>
          {feedbackActive ? `${feedbackLabel} on` : "Som off"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Tokens ─────────────────────────────────────────────────────────────────────
const BG = "rgba(13, 20, 35, 0.97)";
const BORDER = "#1f2937";
const RED_LIGHT = "#fca5a5";
const RED = "#b91c1c";
const RED_DARK = "#7f1d1d";
const WHITE = "#f8fafc";
const MUTED = "#94a3b8";

const styles = StyleSheet.create({
  // ── Mobile bar ──────────────────────────────────────────────────────────────
  bar: {
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    zIndex: 50,
  },
  barPendulumWrap: {
    alignItems: "center",
    gap: 2,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: RED_LIGHT,
  },
  barClockFace: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingTop: 5,
  },
  barClockCenter: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: RED_DARK,
    zIndex: 2,
  },
  barPendulumArm: {
    position: "absolute",
    top: 6,
    width: 2,
    height: 18,
    backgroundColor: RED_DARK,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barPendulumWeight: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: RED,
    marginBottom: -2,
  },
  barBpmBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1,
  },
  barBpmNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: WHITE,
    lineHeight: 30,
  },
  barBpmUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: MUTED,
  },
  barBpmRow: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  barBpmBtn: {
    flex: 1,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  barBpmBtnActive: {
    backgroundColor: "#3b0a0a",
    borderColor: RED_LIGHT,
  },
  barBpmBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f9fafb",
  },
  barBpmBtnTextActive: {
    color: RED_LIGHT,
  },
  barFeedbackBtn: {
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  barFeedbackBtnActive: {
    backgroundColor: "#3b0a0a",
    borderColor: RED_LIGHT,
  },
  barFeedbackText: {
    fontSize: 11,
    fontWeight: "800",
    color: WHITE,
  },
  barFeedbackTextActive: {
    color: RED_LIGHT,
  },

  // ── Tablet / desktop card ────────────────────────────────────────────────────
  card: {
    position: "absolute",
    right: 14,
    top: 108,
    backgroundColor: BG,
    borderRadius: 20,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#020617",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    zIndex: 40,
    alignItems: "center",
  },
  cardWide: {
    width: 172,
  },
  cardNarrow: {
    width: 112,
    padding: 10,
    borderRadius: 16,
    gap: 7,
    top: 112,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: RED_LIGHT,
  },
  cardClock: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: WHITE,
    borderWidth: 6,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingTop: 13,
  },
  cardClockNarrow: {
    width: 56,
    height: 56,
    borderWidth: 4,
    paddingTop: 8,
  },
  cardClockCenter: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: RED_DARK,
    zIndex: 2,
  },
  cardPendulumArm: {
    position: "absolute",
    top: 18,
    width: 3,
    height: 50,
    backgroundColor: RED_DARK,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cardPendulumArmNarrow: {
    top: 10,
    height: 30,
  },
  cardPendulumWeight: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: RED,
    marginBottom: -4,
  },
  cardBpmValue: {
    fontSize: 28,
    fontWeight: "800",
    color: WHITE,
    lineHeight: 32,
  },
  cardBpmValueNarrow: {
    fontSize: 20,
    lineHeight: 24,
  },
  cardBpmUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: MUTED,
  },
  cardBpmRow: {
    flexDirection: "row",
    gap: 5,
    alignSelf: "stretch",
  },
  cardBpmBtn: {
    flex: 1,
    minHeight: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardBpmBtnActive: {
    backgroundColor: "#3b0a0a",
    borderColor: RED_LIGHT,
  },
  cardBpmBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f9fafb",
  },
  cardBpmBtnTextActive: {
    color: RED_LIGHT,
  },
  cardFeedbackBtn: {
    alignSelf: "stretch",
    minHeight: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 8,
  },
  cardFeedbackBtnActive: {
    backgroundColor: "#3b0a0a",
    borderColor: RED_LIGHT,
  },
  cardFeedbackText: {
    fontSize: 12,
    fontWeight: "800",
    color: WHITE,
  },
  cardFeedbackTextActive: {
    color: RED_LIGHT,
  },
});
