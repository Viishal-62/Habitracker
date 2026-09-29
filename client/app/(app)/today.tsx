import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandMark } from "../../src/components/BrandMark";
import { CalendarSheet } from "../../src/components/CalendarSheet";
import { Celebration } from "../../src/components/Celebration";
import { SadHit } from "../../src/components/SadHit";
import { Screen } from "../../src/components/Screen";
import { WeekStrip } from "../../src/components/WeekStrip";
import { YesNoPad } from "../../src/components/YesNoPad";
import type { Answer } from "../../src/data/types";
import { formatDayLine, formatMonthTitle, monthKey } from "../../src/lib/dates";
import { hapticNo, hapticYes } from "../../src/lib/haptics";
import { goalHint } from "../../src/lib/habitPresets";
import { playCue } from "../../src/lib/sounds";
import { currentStreak, firesInMonth } from "../../src/lib/stats";
import { useApp } from "../../src/state/AppProvider";
import { colors } from "../../src/theme/colors";
import { fonts } from "../../src/theme/typography";

export default function Today() {
  const { habit, checkins, today, todayAnswer, saveCheckin } = useApp();
  const [busy, setBusy] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<Answer | null>(null);
  const requestLocked = useRef(false);
  const [celebrate, setCelebrate] = useState<"first" | "goal" | null>(null);
  const [sad, setSad] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(monthKey());
  const month = monthKey();
  const streak = currentStreak(checkins, today);
  const fires = firesInMonth(checkins, month);
  const habitName = habit?.name ?? "it";
  const goal = habit?.goalDays ?? 0;

  const choose = async (answer: Answer) => {
    if (requestLocked.current) return;
    if (todayAnswer === answer) {
      if (answer === "yes") {
        void hapticYes(false);
      } else {
        void hapticNo();
      }
      return;
    }
    requestLocked.current = true;
    setBusy(true);
    setPendingAnswer(answer);
    try {
      const { isFirstYes, hitGoal } = await saveCheckin(answer);
      if (answer === "yes") {
        await playCue("yes");
        await hapticYes(isFirstYes || hitGoal);
        if (isFirstYes) setCelebrate("first");
        else if (hitGoal) setCelebrate("goal");
      } else {
        await playCue("no");
        await hapticNo();
        setSad(true);
      }
    } finally {
      requestLocked.current = false;
      setBusy(false);
      setPendingAnswer(null);
    }
  };

  const openCal = () => {
    setViewMonth(month);
    setCalOpen(true);
  };

  return (
    <Screen bottom={false} style={styles.screen}>
      <WeekStrip today={today} checkins={checkins} onOpenMonth={openCal} />

      <View style={styles.stage}>
        <View style={styles.top}>
          <View style={styles.brandRow}>
            <BrandMark size={26} />
            <Text style={styles.brand}>choose</Text>
          </View>
          {goal > 0 || streak > 0 ? (
            <View style={styles.pill}>
              <Ionicons
                name={goal > 0 && streak >= goal ? "trophy" : "flame"}
                size={13}
                color={colors.ink}
              />
              <Text style={styles.pillText}>
                {goal > 0 ? `${streak}/${goal}` : `${streak}d`}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.day}>{formatDayLine(today)}</Text>
        <Text style={styles.question} numberOfLines={2}>
          Stay away from <Text style={styles.habit}>{habitName.toLowerCase()}</Text>?
        </Text>

        <View style={[styles.status, todayAnswer == null ? styles.statusWait : styles.statusDone]}>
          <Ionicons
            name={todayAnswer == null ? "time-outline" : todayAnswer === "yes" ? "checkmark-circle" : "close-circle"}
            size={14}
            color={todayAnswer == null ? colors.ember : todayAnswer === "yes" ? colors.ember : "#E07A5F"}
          />
          <Text
            style={[
              styles.statusText,
              todayAnswer === "no" && styles.statusNo,
            ]}
          >
            {todayAnswer == null
              ? "New day · not logged yet"
              : todayAnswer === "yes"
                ? "Logged · stayed away"
                : "Logged · slipped"}
          </Text>
        </View>

        <View style={styles.pad}>
          <YesNoPad
            value={todayAnswer}
            onChoose={choose}
            busy={busy}
            pendingAnswer={pendingAnswer}
          />
        </View>
      </View>

      <Pressable onPress={openCal} style={({ pressed }) => [styles.openCard, pressed && styles.openPressed]}>
        <View style={styles.openIcon}>
          <Ionicons name="calendar-outline" size={20} color={colors.ink} />
        </View>
        <View style={styles.openCopy}>
          <Text style={styles.openTitle}>{formatMonthTitle(month)}</Text>
          <Text style={styles.openHint}>
            {fires} {fires === 1 ? "fire" : "fires"} · tap to open
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.creamMuted} />
      </Pressable>

      <CalendarSheet
        visible={calOpen}
        month={viewMonth}
        onMonthChange={setViewMonth}
        checkins={checkins}
        onClose={() => setCalOpen(false)}
      />
      <SadHit visible={sad} onDone={() => setSad(false)} />
      <Celebration
        visible={celebrate != null}
        kicker={celebrate === "goal" ? `${goal} days` : "Day 1"}
        title={celebrate === "goal" ? "Goal hit." : "Fire’s lit."}
        body={
          celebrate === "goal"
            ? `That’s a ${goalHint(goal, habitName).toLowerCase()} run. Keep going if you want — the calendar doesn’t stop.`
            : "That’s the whole ritual. Come back tomorrow and keep it burning."
        }
        onDone={() => setCelebrate(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 4,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 17,
    letterSpacing: -0.4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.ember,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  day: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 10,
  },
  question: {
    marginTop: 4,
    marginBottom: 10,
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  habit: {
    color: colors.ember,
  },
  status: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusWait: {
    backgroundColor: "rgba(198, 242, 74, 0.12)",
  },
  statusDone: {
    backgroundColor: colors.bgRaised,
  },
  statusText: {
    color: colors.ember,
    fontFamily: fonts.sansMed,
    fontSize: 12,
  },
  statusNo: {
    color: "#E07A5F",
  },
  pad: {
    marginBottom: 0,
  },
  stage: {
    flex: 1,
    justifyContent: "center",
  },
  openCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bgRaised,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  openPressed: {
    opacity: 0.85,
  },
  openIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
  },
  openCopy: {
    flex: 1,
  },
  openTitle: {
    color: colors.cream,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
  },
  openHint: {
    marginTop: 2,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
});
