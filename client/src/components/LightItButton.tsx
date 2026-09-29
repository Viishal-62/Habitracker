import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Props = {
  label?: string;
  onPress: () => void;
};

export function LightItButton({ label = "Choose my habit", onPress }: Props) {
  const scale = useSharedValue(1);

  const press = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={() => {
        scale.value = withTiming(0.975, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 240 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[styles.btn, press]}>
        <Text style={styles.text}>{label}</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.ink} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  text: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
  },
});
