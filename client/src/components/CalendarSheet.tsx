import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Checkin } from "../data/types";
import { addMonths, formatMonthTitle, monthKey } from "../lib/dates";
import { firesInMonth } from "../lib/stats";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { MonthCalendar } from "./MonthCalendar";

type Props = {
  visible: boolean;
  month: string;
  onMonthChange: (month: string) => void;
  checkins: Checkin[];
  onClose: () => void;
};

const SCREEN_H = Dimensions.get("window").height;

export function CalendarSheet({ visible, month, onMonthChange, checkins, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const now = monthKey();
  const fires = firesInMonth(checkins, month);
  const days = checkins.filter((c) => c.date.startsWith(month)).length;
  const canNext = month < now;
  const translateY = useSharedValue(SCREEN_H);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 180 });
    } else {
      translateY.value = SCREEN_H;
    }
  }, [translateY, visible]);

  const close = () => {
    translateY.value = withTiming(SCREEN_H, { duration: 220 }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        translateY.value = withTiming(SCREEN_H, { duration: 200 }, (done) => {
          if (done) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 180 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={close} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.handleHit}>
              <View style={styles.handle} />
            </View>
            <View style={styles.top}>
              <Text style={styles.kicker}>Month</Text>
              <Pressable onPress={close} hitSlop={12} style={styles.close}>
                <Ionicons name="close" size={22} color={colors.cream} />
              </Pressable>
            </View>

            <View style={styles.nav}>
              <Pressable
                onPress={() => onMonthChange(addMonths(month, -1))}
                hitSlop={8}
                style={styles.navBtn}
              >
                <Ionicons name="chevron-back" size={22} color={colors.cream} />
              </Pressable>
              <Text style={styles.month}>{formatMonthTitle(month)}</Text>
              <Pressable
                onPress={() => canNext && onMonthChange(addMonths(month, 1))}
                hitSlop={8}
                style={[styles.navBtn, !canNext && styles.navOff]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={canNext ? colors.cream : colors.tabInactive}
                />
              </Pressable>
            </View>

            <MonthCalendar variant="full" month={month} title="Your fires" checkins={checkins} />

            <View style={styles.recap}>
              <View style={styles.recapItem}>
                <Ionicons name="flame" size={18} color={colors.ember} />
                <Text style={styles.recapValue}>{fires}</Text>
                <Text style={styles.recapLabel}>lit</Text>
              </View>
              <View style={styles.recapLine} />
              <View style={styles.recapItem}>
                <Ionicons name="calendar-outline" size={18} color={colors.creamMuted} />
                <Text style={styles.recapValue}>{days}</Text>
                <Text style={styles.recapLabel}>tapped</Text>
              </View>
            </View>
            <Text style={styles.swipeHint}>Swipe down to close</Text>
          </Animated.View>
        </GestureDetector>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  handleHit: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lineStrong,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  kicker: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  navOff: {
    opacity: 0.4,
  },
  month: {
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 22,
  },
  recap: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgRaised,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  recapItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recapValue: {
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 20,
  },
  recapLabel: {
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  recapLine: {
    width: 1,
    height: 28,
    backgroundColor: colors.lineStrong,
    marginHorizontal: 8,
  },
  swipeHint: {
    marginTop: 12,
    textAlign: "center",
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
});
