import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  onDone: () => void;
};

export function SadHit({ visible, onDone }: Props) {
  const t = useSharedValue(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      t.value = 0;
      x.value = 0;
      return;
    }
    x.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-7, { duration: 50 }),
      withTiming(0, { duration: 60 }),
    );
    t.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 240, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [onDone, t, visible, x]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateX: x.value }, { scale: 0.9 + t.value * 0.1 }],
  }));

  const dim = useAnimatedStyle(() => ({
    opacity: t.value * 0.45,
  }));

  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.dim, dim]} />
      <Animated.View style={style}>
        <Ionicons name="sad" size={76} color="#E07A5F" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
  },
});
