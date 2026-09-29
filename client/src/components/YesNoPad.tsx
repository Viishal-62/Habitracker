import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Answer } from "../data/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Props = {
  value: Answer | null;
  onChoose: (answer: Answer) => void;
  busy?: boolean;
  pendingAnswer?: Answer | null;
};

export function YesNoPad({ value, onChoose, busy, pendingAnswer }: Props) {
  const waiting = value == null;
  return (
    <View style={styles.row}>
      <ChoiceCard
        kind="yes"
        selected={value === "yes"}
        waiting={waiting}
        busy={busy}
        pending={pendingAnswer === "yes"}
        kicker={waiting ? "Tap for today" : "Stayed away"}
        title="Yes"
        icon="flame"
        onPress={() => onChoose("yes")}
      />
      <ChoiceCard
        kind="no"
        selected={value === "no"}
        waiting={waiting}
        busy={busy}
        pending={pendingAnswer === "no"}
        kicker={waiting ? "Tap for today" : "Slipped"}
        title="No"
        icon="sad-outline"
        onPress={() => onChoose("no")}
      />
    </View>
  );
}

function ChoiceCard({
  kind,
  selected,
  waiting,
  busy,
  pending,
  kicker,
  title,
  icon,
  onPress,
}: {
  kind: Answer;
  selected: boolean;
  waiting: boolean;
  busy?: boolean;
  pending: boolean;
  kicker: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const wasSelected = useRef(selected);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const active = useSharedValue(selected ? 1 : 0);
  const glow = useSharedValue(selected ? 1 : 0);
  const borderPulse = useSharedValue(0);

  useEffect(() => {
    borderPulse.value = pending
      ? withRepeat(withTiming(1, { duration: 650 }), -1, true)
      : withTiming(0, { duration: 120 });
  }, [borderPulse, pending]);

  useEffect(() => {
    const justOn = selected && !wasSelected.current;
    wasSelected.current = selected;
    active.value = withTiming(selected ? 1 : 0, { duration: 220 });
    if (!selected) glow.value = withTiming(0, { duration: 180 });

    if (!justOn) return;

    if (kind === "yes") {
      glow.value = withSequence(
        withTiming(1, { duration: 160 }),
        withTiming(0.35, { duration: 420 }),
      );
      scale.value = withSequence(
        withSpring(1.06, { damping: 11, stiffness: 240 }),
        withSpring(1, { damping: 14, stiffness: 180 }),
      );
      return;
    }

    glow.value = withTiming(1, { duration: 180 });
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 70 }),
    );
    scale.value = withSequence(
      withTiming(0.96, { duration: 80 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, [active, glow, kind, scale, selected, shake]);

  const cardStyle = useAnimatedStyle(() => {
    const on = kind === "yes" ? "#C6F24A" : "#2C1A16";
    const off = "#141414";
    const borderOn = kind === "yes" ? "#C6F24A" : "#E07A5F";
    const borderOff = "rgba(255,255,255,0.12)";
    return {
      transform: [{ scale: scale.value }, { translateX: shake.value }],
      backgroundColor: interpolateColor(active.value, [0, 1], [off, on]),
      borderColor: interpolateColor(active.value, [0, 1], [borderOff, borderOn]),
    };
  });

  const halo = useAnimatedStyle(() => ({
    opacity: kind === "yes" ? glow.value * 0.45 : glow.value * 0.28,
    transform: [{ scale: 1 + glow.value * 0.04 }],
  }));

  const pendingBorder = useAnimatedStyle(() => ({
    opacity: 0.38 + borderPulse.value * 0.62,
    transform: [{ scale: 1 + borderPulse.value * 0.018 }],
  }));

  const onInk = selected && kind === "yes";

  return (
    <View style={styles.slot}>
      <Animated.View style={[styles.halo, halo, kind === "no" && styles.haloNo]} />
      {pending ? (
        <Animated.View
          style={[
            styles.pendingBorder,
            kind === "no" && styles.pendingBorderNo,
            pendingBorder,
          ]}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={kind === "yes" ? "Yes, I stayed away" : "No, I slipped"}
        disabled={busy}
        android_ripple={{ color: "transparent" }}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
        onPress={onPress}
      >
        <Animated.View style={[styles.btn, waiting && styles.btnWait, cardStyle]}>
          <Ionicons name={icon} size={22} color={onInk ? colors.ink : kind === "no" && selected ? "#E07A5F" : colors.creamMuted} />
          <View>
            <Text style={[styles.kicker, onInk && styles.kickerOn]}>{kicker}</Text>
            <Text style={[styles.label, onInk && styles.labelOn, kind === "no" && selected && styles.labelNo]}>
              {title}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
  },
  slot: {
    flex: 1,
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: colors.ember,
    pointerEvents: "none",
  },
  haloNo: {
    backgroundColor: "#E07A5F",
  },
  pendingBorder: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.ember,
    pointerEvents: "none",
  },
  pendingBorderNo: {
    borderColor: "#E07A5F",
  },
  btn: {
    minHeight: 92,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  btnWait: {
    borderStyle: "dashed",
  },
  kicker: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  kickerOn: {
    color: "rgba(7, 7, 7, 0.62)",
  },
  label: {
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 26,
    lineHeight: 30,
  },
  labelOn: {
    color: colors.ink,
  },
  labelNo: {
    color: "#F2C6B8",
  },
});
