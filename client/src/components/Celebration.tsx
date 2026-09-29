import { useEffect, useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { FireMark } from "./FireMark";

type Props = {
  visible: boolean;
  onDone: () => void;
  kicker?: string;
  title?: string;
  body?: string;
};

const SPARKS = Array.from({ length: 14 }, (_, i) => i);

export function Celebration({
  visible,
  onDone,
  kicker = "Day 1",
  title = "Fire’s lit.",
  body = "That’s the whole ritual. Come back tomorrow and keep it burning.",
}: Props) {
  const panel = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      panel.value = 0;
      return;
    }
    panel.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [panel, visible]);

  const card = useAnimatedStyle(() => ({
    opacity: panel.value,
    transform: [{ scale: 0.92 + panel.value * 0.08 }, { translateY: (1 - panel.value) * 18 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <Pressable style={styles.backdrop} onPress={onDone}>
        {SPARKS.map((i) => (
          <Spark key={i} index={i} active={visible} />
        ))}
        <Animated.View style={[styles.card, card]}>
          <FireMark size={42} />
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Text style={styles.tap}>tap anywhere</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Spark({ index, active }: { index: number; active: boolean }) {
  const t = useSharedValue(0);
  const seed = useMemo(() => {
    const angle = (index / SPARKS.length) * Math.PI * 2;
    return {
      x: Math.cos(angle) * (70 + (index % 4) * 18),
      y: Math.sin(angle) * (90 + (index % 3) * 16) - 40,
      size: 5 + (index % 3) * 2,
    };
  }, [index]);

  useEffect(() => {
    if (!active) {
      t.value = 0;
      return;
    }
    t.value = withDelay(
      index * 28,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }),
    );
  }, [active, index, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value * (1 - t.value) * 4,
    transform: [
      { translateX: seed.x * t.value },
      { translateY: seed.y * t.value },
      { scale: 0.4 + t.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.spark,
        style,
        { width: seed.size, height: seed.size, borderRadius: seed.size },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  card: {
    width: "100%",
    backgroundColor: colors.bgRaised,
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  kicker: {
    marginTop: 16,
    color: colors.emberSoft,
    fontFamily: fonts.sansSemi,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    marginTop: 8,
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 40,
  },
  body: {
    marginTop: 10,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  tap: {
    marginTop: 22,
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  spark: {
    position: "absolute",
    backgroundColor: colors.emberSoft,
    top: "46%",
    left: "50%",
    pointerEvents: "none",
  },
});
