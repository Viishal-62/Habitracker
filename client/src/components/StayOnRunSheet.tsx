import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Props = {
  visible: boolean;
  habitName: string;
  streak: number;
  onStay: () => void;
  onEnd: () => void;
};

export function StayOnRunSheet({ visible, habitName, streak, onStay, onEnd }: Props) {
  const insets = useSafeAreaInsets();
  const habit = habitName.trim().toLowerCase() || "it";
  const dayLine =
    streak <= 0
      ? `You’re staying away from ${habit}. A new habit starts a new calendar.`
      : `You’re on day ${streak} away from ${habit}. A new habit starts a new calendar.`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onStay} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <Ionicons name="flame" size={22} color={colors.ink} />
          </View>
          <Text style={styles.title}>This is the one.</Text>
          <Text style={styles.body}>
            {dayLine} These fires stay in your history — they won’t follow you.
          </Text>
          <Pressable
            onPress={onStay}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>Stay on this run</Text>
          </Pressable>
          <Pressable
            onPress={onEnd}
            style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
          >
            <Text style={styles.ghostText}>End this run</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lineStrong,
    alignSelf: "center",
    marginBottom: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 28,
    letterSpacing: -0.6,
  },
  body: {
    marginTop: 10,
    marginBottom: 24,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 22,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
  ghost: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  ghostText: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
  },
  pressed: { opacity: 0.88 },
});
