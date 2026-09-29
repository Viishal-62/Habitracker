import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BrandSplash } from "../src/components/BrandSplash";
import { Screen } from "../src/components/Screen";
import { hapticPick } from "../src/lib/haptics";
import {
  GOAL_PRESETS,
  HABIT_PRESETS,
  clampGoalDays,
  goalHint,
  habitIcon,
  habitMeta,
  isPresetHabit,
} from "../src/lib/habitPresets";
import { useApp } from "../src/state/AppProvider";
import { colors } from "../src/theme/colors";
import { fonts } from "../src/theme/typography";

export default function PickHabit() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const replacing = mode === "replace";
  const { setHabit, user, habit } = useApp();
  const presetStart = habit && isPresetHabit(habit.name) ? habit.name : null;
  const [step, setStep] = useState<"habit" | "goal">("habit");
  const [picked, setPicked] = useState<string | null>(() => {
    if (!replacing || !habit) return null;
    return presetStart ?? "custom";
  });
  const [custom, setCustom] = useState(() =>
    replacing && habit && !presetStart ? habit.name : "",
  );
  const [goalDays, setGoalDays] = useState<number | null>(() =>
    replacing && habit ? habit.goalDays : null,
  );
  const [customGoal, setCustomGoal] = useState("");
  const [goalIsCustom, setGoalIsCustom] = useState(false);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const name = useMemo(() => {
    if (picked === "custom") return custom.trim();
    return picked?.trim() ?? "";
  }, [custom, picked]);

  const resolvedGoal = useMemo(() => {
    if (goalIsCustom) {
      const n = Number.parseInt(customGoal, 10);
      if (!Number.isFinite(n) || n < 2) return 0;
      return clampGoalDays(n);
    }
    return goalDays ?? 0;
  }, [customGoal, goalDays, goalIsCustom]);

  const openGoal = () => {
    if (!name) return;
    void hapticPick();
    setStep("goal");
  };

  const commit = async () => {
    if (!name || !resolvedGoal) return;
    setBusy(true);
    try {
      await setHabit(
        name,
        resolvedGoal,
        Boolean(replacing && habit && habit.name !== name),
      );
      if (replacing || user) router.replace("/today");
      else {
        router.replace({
          pathname: "/login",
          params: { returnTo: "picker" },
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const pickHabit = (value: string) => {
    void hapticPick();
    setPicked(value);
    if (value !== "custom") setStep("goal");
  };

  const pickGoal = (days: number) => {
    void hapticPick();
    setGoalIsCustom(false);
    setGoalDays(days);
  };

  const pickCustomGoal = () => {
    void hapticPick();
    setGoalIsCustom(true);
    setGoalDays(null);
  };

  const habitTitle = habitMeta(name)?.title ?? name;
  const canContinueCustom = picked === "custom" && Boolean(name);
  const canStart = Boolean(name && resolvedGoal && !busy);
  const shouldReturnToToday = Boolean(user && habit && !replacing);

  useEffect(() => {
    if (shouldReturnToToday) router.replace("/today");
  }, [router, shouldReturnToToday]);

  if (shouldReturnToToday) {
    return <BrandSplash showCta={false} />;
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={12}
      >
        {step === "habit" ? (
          <>
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={[
                styles.content,
                picked === "custom" && styles.contentCustom,
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.kicker}>{replacing ? "New run" : "The one thing"}</Text>
              <Text style={styles.title}>What are you staying away from?</Text>
              <Text style={styles.body}>
                {replacing
                  ? "Ended. Pick the next one. This starts a new run. Your last one is in history."
                  : "One habit. Pick it, then we’ll set the run length."}
              </Text>

              <View style={styles.list}>
                {HABIT_PRESETS.map((item) => {
                  const on = picked === item.name;
                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => pickHabit(item.name)}
                      style={({ pressed }) => [
                        styles.habit,
                        on && styles.habitOn,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.iconBox, on && styles.iconBoxOn]}>
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={on ? colors.ink : colors.ember}
                        />
                      </View>
                      <View style={styles.habitCopy}>
                        <Text style={[styles.habitTitle, on && styles.onInk]}>{item.title}</Text>
                        <Text style={[styles.habitHint, on && styles.onInkMuted]}>{item.hint}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={on ? colors.ink : colors.tabInactive} />
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => pickHabit("custom")}
                  style={({ pressed }) => [
                    styles.habit,
                    picked === "custom" && styles.habitOn,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.iconBox, picked === "custom" && styles.iconBoxOn]}>
                    <Ionicons
                      name="pencil-outline"
                      size={20}
                      color={picked === "custom" ? colors.ink : colors.ember}
                    />
                  </View>
                  <View style={styles.habitCopy}>
                    <Text style={[styles.habitTitle, picked === "custom" && styles.onInk]}>
                      Something else
                    </Text>
                    <Text style={[styles.habitHint, picked === "custom" && styles.onInkMuted]}>
                      Name it in two words
                    </Text>
                  </View>
                  <Ionicons
                    name={picked === "custom" ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={picked === "custom" ? colors.ink : colors.tabInactive}
                  />
                </Pressable>
              </View>

              {picked === "custom" ? (
                <TextInput
                  value={custom}
                  onChangeText={setCustom}
                  placeholder="Name it in two words"
                  placeholderTextColor={colors.creamMuted}
                  autoFocus
                  style={styles.input}
                />
              ) : null}
              {picked === "custom" ? <View style={styles.inputGap} /> : null}
            </ScrollView>
            {picked === "custom" ? (
              <Pressable
                disabled={!canContinueCustom}
                onPress={openGoal}
                style={({ pressed }) => [
                  styles.cta,
                  styles.ctaSpaced,
                  !canContinueCustom && styles.ctaOff,
                  pressed && canContinueCustom && styles.ctaPressed,
                ]}
              >
                <Text style={styles.ctaText}>Continue</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={[
                styles.content,
                goalIsCustom && styles.contentCustom,
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Pressable onPress={() => setStep("habit")} hitSlop={10} style={styles.back}>
                <Ionicons name="chevron-back" size={18} color={colors.cream} />
                <Text style={styles.backText}>Habit</Text>
              </Pressable>

              <Text style={styles.kicker}>{replacing ? "New run" : "The run"}</Text>
              <Text style={styles.title}>How long is this run?</Text>
              <Text style={styles.body}>
                A finish line to aim at. You can keep going after you hit it.
              </Text>

              <Pressable onPress={() => setStep("habit")} style={styles.pickedCard}>
                <View style={styles.iconBox}>
                  <Ionicons name={habitIcon(name)} size={20} color={colors.ember} />
                </View>
                <View style={styles.habitCopy}>
                  <Text style={styles.pickedLabel}>Staying away from</Text>
                  <Text style={styles.pickedName}>{habitTitle}</Text>
                </View>
                <Text style={styles.change}>Change</Text>
              </Pressable>

              <View style={styles.runCard}>
                <View style={styles.goalGrid}>
                  {GOAL_PRESETS.map((item) => {
                    const on = !goalIsCustom && goalDays === item.days;
                    const hint = goalHint(item.days, name);
                    return (
                      <Pressable
                        key={item.days}
                        onPress={() => pickGoal(item.days)}
                        style={({ pressed }) => [
                          styles.goal,
                          on && styles.goalOn,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={on ? colors.ink : colors.ember}
                        />
                        <Text style={[styles.goalDays, on && styles.onInk]}>{item.days}</Text>
                        <Text style={[styles.goalHint, on && styles.onInkMuted]}>{hint}</Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={pickCustomGoal}
                    style={({ pressed }) => [
                      styles.goal,
                      styles.goalWide,
                      goalIsCustom && styles.goalOn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color={goalIsCustom ? colors.ink : colors.ember}
                    />
                    <Text style={[styles.goalDays, goalIsCustom && styles.onInk]}>Custom</Text>
                    <Text style={[styles.goalHint, goalIsCustom && styles.onInkMuted]}>
                      9 days, 60, whatever
                    </Text>
                  </Pressable>
                </View>

                {goalIsCustom ? (
                  <TextInput
                    value={customGoal}
                    onChangeText={setCustomGoal}
                    placeholder="Number of days"
                    placeholderTextColor={colors.creamMuted}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={3}
                    style={styles.inputInCard}
                  />
                ) : null}
              </View>
              {goalIsCustom ? <View style={styles.inputGap} /> : null}
            </ScrollView>
            <Pressable
              disabled={!canStart}
              onPress={commit}
              style={({ pressed }) => [
                styles.cta,
                goalIsCustom && styles.ctaSpaced,
                !canStart && styles.ctaOff,
                pressed && canStart && styles.ctaPressed,
              ]}
            >
              <Text style={styles.ctaText}>{replacing ? "Start this run" : "This is the one"}</Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 16, flexGrow: 1 },
  contentCustom: { paddingBottom: 28 },
  kicker: {
    marginTop: 4,
    color: colors.ember,
    fontFamily: fonts.sansSemi,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
  },
  title: {
    marginTop: 8,
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 36,
  },
  body: {
    marginTop: 8,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  list: { gap: 8 },
  habit: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.bgRaised,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  habitOn: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(198, 242, 74, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxOn: {
    backgroundColor: "rgba(7,7,7,0.12)",
  },
  habitCopy: { flex: 1 },
  habitTitle: {
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 15,
  },
  habitHint: {
    marginTop: 2,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  onInk: { color: colors.ink },
  onInkMuted: { color: "rgba(7,7,7,0.55)" },
  pressed: { opacity: 0.88 },
  input: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 18,
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 16,
    backgroundColor: colors.bgRaised,
  },
  inputGap: { height: 20 },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
    paddingVertical: 4,
  },
  backText: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 14,
  },
  pickedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.bgRaised,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  pickedLabel: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pickedName: {
    marginTop: 2,
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
  change: {
    color: colors.ember,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
  },
  runCard: {
    backgroundColor: colors.bgRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  goal: {
    width: "47.5%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    paddingVertical: 13,
    paddingHorizontal: 12,
    gap: 4,
  },
  goalWide: {
    width: "100%",
  },
  goalOn: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
  },
  goalDays: {
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 23,
    letterSpacing: -0.6,
  },
  goalHint: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 12,
  },
  inputInCard: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 16,
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 16,
    backgroundColor: colors.bg,
  },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 18,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ctaSpaced: {
    marginTop: 12,
  },
  ctaOff: { opacity: 0.35 },
  ctaPressed: { opacity: 0.9 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
});
