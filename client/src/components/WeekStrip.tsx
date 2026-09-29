import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Checkin } from "../data/types";
import { dayLetter, hourWhisper, lastSevenDays, parseISODate } from "../lib/dates";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Props = {
  today: string;
  checkins: Checkin[];
  onOpenMonth?: () => void;
};

export function WeekStrip({ today, checkins, onOpenMonth }: Props) {
  const days = lastSevenDays(today);
  const byDate = new Map(checkins.map((c) => [c.date, c.answer]));
  const todayAnswer = byDate.get(today) ?? null;
  const lit = days.filter((d) => byDate.get(d) === "yes").length;

  const run = endingRun(days, byDate);
  const title =
    todayAnswer == null
      ? "Today’s still open"
      : lit === 7
        ? "Clean seven"
        : run >= 2
          ? `${run}-day run`
          : `${lit} of 7 lit`;

  const whisper =
    todayAnswer == null
      ? hourWhisper()
      : todayAnswer === "yes"
        ? "Logged. Come back tomorrow."
        : "One slip. The week isn’t over.";

  return (
    <Pressable onPress={onOpenMonth} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.head}>
        <Text style={styles.kicker}>This week</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.row}>
        {days.map((iso, i) => {
          const answer = byDate.get(iso) ?? null;
          const isToday = iso === today;
          const next = days[i + 1];
          const linked =
            next != null && answer === "yes" && byDate.get(next) === "yes";
          const num = parseISODate(iso).getDate();

          return (
            <View key={iso} style={styles.col}>
              <Text style={[styles.letter, isToday && styles.letterToday]}>
                {isToday ? "Now" : dayLetter(iso)}
              </Text>
              <View style={styles.dotWrap}>
                {i < days.length - 1 ? (
                  <View style={[styles.bridge, linked && styles.bridgeOn]} />
                ) : null}
                <View
                  style={[
                    styles.dot,
                    answer === "yes" && styles.dotYes,
                    answer === "no" && styles.dotNo,
                    isToday && answer == null && styles.dotWait,
                    isToday && styles.dotToday,
                  ]}
                >
                  {answer === "yes" ? (
                    <Ionicons name="flame" size={13} color={colors.ink} />
                  ) : answer === "no" ? (
                    <View style={styles.miss} />
                  ) : isToday ? (
                    <View style={styles.waitDot} />
                  ) : (
                    <Text style={styles.ghostNum}>{num}</Text>
                  )}
                </View>
              </View>
              <Text style={[styles.num, isToday && styles.numToday]}>{num}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.whisper}>{whisper}</Text>
    </Pressable>
  );
}

function endingRun(days: string[], byDate: Map<string, string>): number {
  let n = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (byDate.get(days[i]) === "yes") n += 1;
    else if (days[i] && i === days.length - 1 && !byDate.has(days[i])) continue;
    else break;
  }
  return n;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    backgroundColor: colors.bgRaised,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
  },
  kicker: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  title: {
    color: colors.ember,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  letter: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 10,
    height: 14,
  },
  letterToday: {
    color: colors.ember,
    fontFamily: fonts.sansBold,
  },
  dotWrap: {
    width: "100%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bridge: {
    position: "absolute",
    left: "50%",
    right: -1,
    height: 2,
    top: 15,
    backgroundColor: colors.lineStrong,
  },
  bridgeOn: {
    backgroundColor: colors.ember,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    zIndex: 1,
  },
  dotYes: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
  },
  dotNo: {
    borderColor: "rgba(224, 122, 95, 0.55)",
    backgroundColor: "#1A1210",
  },
  dotWait: {
    borderColor: colors.ember,
  },
  dotToday: {
    transform: [{ scale: 1.08 }],
  },
  miss: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#E07A5F",
  },
  waitDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.ember,
  },
  ghostNum: {
    color: colors.tabInactive,
    fontFamily: fonts.sansMed,
    fontSize: 9,
  },
  num: {
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 10,
  },
  numToday: {
    color: colors.ember,
    fontFamily: fonts.sansBold,
  },
  whisper: {
    marginTop: 12,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
});
