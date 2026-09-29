import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EditNameSheet } from "../../src/components/EditNameSheet";
import { MonthCalendar } from "../../src/components/MonthCalendar";
import { PlusSheet } from "../../src/components/PlusSheet";
import { Screen } from "../../src/components/Screen";
import { StayOnRunSheet } from "../../src/components/StayOnRunSheet";
import { UserAvatar } from "../../src/components/UserAvatar";
import {
  addMonths,
  daysElapsedInMonth,
  formatLongDate,
  formatMonthTitle,
  monthKey,
  parseISODate,
} from "../../src/lib/dates";
import { hapticPick } from "../../src/lib/haptics";
import { pickAvatarFile } from "../../src/lib/pickAvatar";
import { currentStreak, firesInMonth, longestStreak, yesCount } from "../../src/lib/stats";
import { goalHint, habitIcon } from "../../src/lib/habitPresets";
import { useApp } from "../../src/state/AppProvider";
import { colors } from "../../src/theme/colors";
import { fonts } from "../../src/theme/typography";

export default function Profile() {
  const router = useRouter();
  const { user, habit, checkins, history, today, logout, subscription, updateProfile } = useApp();
  const nowMonth = monthKey(parseISODate(today));
  const [viewMonth, setViewMonth] = useState(nowMonth);
  const [expanded, setExpanded] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [stayOpen, setStayOpen] = useState(false);
  const plus = subscription.plan === "plus";
  const canNext = viewMonth < nowMonth;
  const fires = firesInMonth(checkins, viewMonth);
  const elapsed = daysElapsedInMonth(viewMonth, today);
  const monthFill = elapsed > 0 ? Math.min(1, fires / elapsed) : 0;
  const emptyDays = Math.max(0, elapsed - fires);
  const isCurrent = viewMonth === nowMonth;
  const streak = currentStreak(checkins, today);
  const longest = longestStreak(checkins);
  const allYes = yesCount(checkins);
  const goal = habit?.goalDays ?? 0;
  const goalFill = goal > 0 ? Math.min(1, streak / goal) : 0;
  const toGo = Math.max(0, goal - streak);
  const hitGoal = goal > 0 && streak >= goal;

  const shiftMonth = (delta: number) => {
    const next = addMonths(viewMonth, delta);
    if (delta > 0 && next > nowMonth) return;
    setViewMonth(next);
  };

  const signOut = async () => {
    await logout();
  };

  const pickPhoto = async () => {
    void hapticPick();
    const uri = await pickAvatarFile();
    if (!uri) return;
    await updateProfile({ avatarUri: uri });
  };

  const monthHint =
    fires === 0
      ? isCurrent
        ? "No fires this month yet."
        : "No fires that month."
      : emptyDays === 0
        ? isCurrent
          ? "Clean month so far."
          : "Clean month."
        : `${emptyDays} empty day${emptyDays === 1 ? "" : "s"}.`;

  return (
    <Screen bottom={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.youPlate}>
          <View style={styles.youTop}>
            <Pressable onPress={pickPhoto} style={styles.photoHit}>
              <UserAvatar
                seed={user?.email ?? user?.name ?? "you"}
                uri={user?.avatarUri}
                size={72}
              />
              <View style={styles.camBadge}>
                <Ionicons name="camera" size={12} color={colors.ink} />
              </View>
            </Pressable>
            <View style={styles.who}>
              <Pressable onPress={() => setNameOpen(true)} style={styles.nameHit}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {user?.name ?? "You"}
                  </Text>
                  <Ionicons name="pencil" size={14} color={colors.ember} />
                  {plus ? (
                    <View style={styles.plusChip}>
                      <Text style={styles.plusChipText}>Plus</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.callYou}>what we call you</Text>
              </Pressable>
            </View>
          </View>
          {user?.email ? (
            <View style={styles.mailChip}>
              <Ionicons name="mail-outline" size={13} color={colors.creamMuted} />
              <Text style={styles.mailText} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          ) : null}
          {user?.createdAt ? (
            <Text style={styles.since}>On the run since {formatLongDate(user.createdAt)}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => setStayOpen(true)}
          style={({ pressed }) => [styles.habitCard, pressed && styles.pressed]}
        >
          <View style={styles.habitIcon}>
            <Ionicons name={habitIcon(habit?.name ?? "")} size={20} color={colors.ember} />
          </View>
          <View style={styles.habitCopy}>
            <Text style={styles.habitLabel}>Staying away from</Text>
            <Text style={styles.habitName} numberOfLines={1}>
              {habit?.name ?? "—"}
            </Text>
          </View>
          <View style={styles.habitAction}>
            <Text style={styles.habitActionText}>Change</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.ink} />
          </View>
        </Pressable>

        {history.length > 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.historyKicker}>Past runs</Text>
            {history.map((run) => {
              const fires = run.yesCount;
              const goalBit = run.goalDays ? ` · ${run.goalDays} day goal` : "";
              return (
                <View key={run.id} style={styles.historyRow}>
                  <View style={styles.historyIcon}>
                    <Ionicons name={habitIcon(run.name)} size={16} color={colors.ember} />
                  </View>
                  <Text style={styles.historyText} numberOfLines={2}>
                    {run.name} · {fires} fire{fires === 1 ? "" : "s"}
                    {goalBit} · ended {formatLongDate(run.endedAt)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.runCard}>
          <Text style={styles.runKicker}>Your run</Text>
          <View style={styles.runHero}>
            <Text style={styles.runValue}>{streak}</Text>
            <View style={styles.runMeta}>
              <Text style={styles.runUnit}>
                {goal > 0 ? `of ${goal} day goal` : "day streak"}
              </Text>
              <Text style={styles.runSub}>
                {goal > 0
                  ? hitGoal
                    ? `${goalHint(goal, habit?.name ?? "")} · keep going`
                    : `${toGo} to go · ${goalHint(goal, habit?.name ?? "")}`
                  : `Best ${longest} · ${allYes} fires all time`}
              </Text>
            </View>
          </View>

          {goal > 0 ? (
            <>
              <View style={styles.meterHead}>
                <Text style={styles.meterLabel}>This run</Text>
                <Text style={styles.meterCount}>
                  {streak}/{goal}
                </Text>
              </View>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${Math.round(goalFill * 100)}%` }]} />
              </View>
              <Text style={[styles.meterHint, styles.goalHintSpace]}>
                Best {longest} · {allYes} fires all time
              </Text>
            </>
          ) : null}

          <View style={styles.monthRow}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              hitSlop={8}
              style={styles.monthBtn}
            >
              <Ionicons name="chevron-back" size={18} color={colors.cream} />
            </Pressable>
            <Text style={styles.monthTitle}>{formatMonthTitle(viewMonth)}</Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              disabled={!canNext}
              hitSlop={8}
              style={[styles.monthBtn, !canNext && styles.monthBtnOff]}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={canNext ? colors.cream : colors.tabInactive}
              />
            </Pressable>
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              hitSlop={8}
              style={[styles.expandBtn, expanded && styles.expandBtnOn]}
            >
              <Ionicons
                name={expanded ? "chevron-up" : "expand-outline"}
                size={16}
                color={expanded ? colors.ink : colors.cream}
              />
            </Pressable>
          </View>

          <View style={styles.meterHead}>
            <Text style={styles.meterLabel}>
              {fires} fire{fires === 1 ? "" : "s"} this month
            </Text>
            <Text style={styles.meterCount}>
              {elapsed} day{elapsed === 1 ? "" : "s"} in view
            </Text>
          </View>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${Math.round(monthFill * 100)}%` }]} />
          </View>
          <Text style={styles.meterHint}>{monthHint}</Text>

          {expanded ? (
            <View style={styles.calWrap}>
              <MonthCalendar variant="embed" month={viewMonth} checkins={checkins} />
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => setPlusOpen(true)}
          style={({ pressed }) => [styles.plusRow, pressed && styles.pressed]}
        >
          <View style={[styles.plusIcon, plus && styles.plusIconOn]}>
            <Ionicons name="diamond-outline" size={18} color={plus ? colors.ink : colors.ember} />
          </View>
          <View style={styles.habitCopy}>
            <Text style={styles.habitLabel}>{plus ? "Mock Plus" : "ChooseOne Plus"}</Text>
            <Text style={styles.plusName} numberOfLines={1}>
              {plus
                ? subscription.period === "yearly"
                  ? "Yearly · on"
                  : "Monthly · on"
                : "Mock store · $4.99 / $29.99"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.creamMuted} />
        </Pressable>

        <Pressable onPress={signOut} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" size={18} color={colors.creamMuted} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
      <StayOnRunSheet
        visible={stayOpen}
        habitName={habit?.name ?? ""}
        streak={streak}
        onStay={() => setStayOpen(false)}
        onEnd={() => {
          setStayOpen(false);
          router.push({ pathname: "/pick-habit", params: { mode: "replace" } });
        }}
      />
      <PlusSheet visible={plusOpen} onClose={() => setPlusOpen(false)} />
      <EditNameSheet
        visible={nameOpen}
        current={user?.name ?? ""}
        onClose={() => setNameOpen(false)}
        onSave={(name) => updateProfile({ name })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingBottom: 36,
  },
  youPlate: {
    backgroundColor: colors.bgRaised,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.ember,
    padding: 16,
    marginBottom: 16,
  },
  youTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  photoHit: {
    position: "relative",
  },
  camBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
  },
  who: { flex: 1, minWidth: 0 },
  nameHit: { alignSelf: "stretch" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flexShrink: 1,
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  plusChip: {
    backgroundColor: colors.ember,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  plusChipText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  callYou: {
    marginTop: 4,
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  mailChip: {
    marginTop: 14,
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mailText: {
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    flexShrink: 1,
  },
  since: {
    marginTop: 10,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  habitCard: {
    backgroundColor: colors.bgRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(198, 242, 74, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  habitCopy: { flex: 1 },
  habitLabel: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  habitName: {
    marginTop: 2,
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 18,
  },
  habitAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.ember,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  habitActionText: {
    color: colors.ink,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
  historyCard: {
    backgroundColor: colors.bgRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  historyKicker: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(198, 242, 74, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: {
    flex: 1,
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 13,
    lineHeight: 18,
  },
  runCard: {
    backgroundColor: colors.bgRaised,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
  },
  runKicker: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  runHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  runValue: {
    color: colors.ember,
    fontFamily: fonts.serifBold,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
  },
  runMeta: { flex: 1 },
  runUnit: {
    color: colors.cream,
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
  runSub: {
    marginTop: 4,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  monthBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  monthBtnOff: { opacity: 0.35 },
  monthTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.cream,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
  },
  expandBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  expandBtnOn: {
    backgroundColor: colors.ember,
  },
  meterHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  meterLabel: {
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 13,
  },
  meterCount: {
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lineStrong,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    backgroundColor: colors.ember,
    borderRadius: 4,
  },
  meterHint: {
    marginTop: 10,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  goalHintSpace: {
    marginTop: 10,
    marginBottom: 16,
  },
  calWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  plusRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bgRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(198, 242, 74, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  plusIconOn: {
    backgroundColor: colors.ember,
  },
  plusName: {
    marginTop: 2,
    color: colors.cream,
    fontFamily: fonts.sansSemi,
    fontSize: 14,
  },
  logout: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 14,
  },
  pressed: { opacity: 0.82 },
});
