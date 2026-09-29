import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandMark } from "../src/components/BrandMark";
import { FireMark } from "../src/components/FireMark";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/state/AppProvider";
import { colors } from "../src/theme/colors";
import { fonts } from "../src/theme/typography";

const BEATS = [
  {
    kicker: "01",
    title: "One question.\nEvery day.",
    body: "Did you stay away? That’s the app. No feed. No coach. No lecture.",
  },
  {
    kicker: "02",
    title: "Yes lights a fire.",
    body: "A clean day gets a flame on the month. Slip, or skip, and the day stays empty. The calendar is a poster — you don’t tap it.",
  },
  {
    kicker: "03",
    title: "Morning. 2am.\nWhenever.",
    body: "There is no window. Open it when you’re honest. Yesterday is already locked.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const beat = BEATS[step];
  const last = step === BEATS.length - 1;

  const next = async () => {
    if (!last) {
      setStep((s) => s + 1);
      return;
    }
    await completeOnboarding();
    router.replace("/pick-habit");
  };

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <BrandMark size={26} />
          <Text style={styles.brand}>choose</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log in"
          onPress={() =>
            router.replace({
              pathname: "/login",
              params: { returnTo: "landing" },
            })
          }
          style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Text style={styles.loginText}>Log in</Text>
        </Pressable>
      </View>
      {step === 0 ? (
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your one-tap sidekick.</Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Ionicons name="flash" size={12} color={colors.ink} />
              <Text style={styles.tagText}>Daily</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="eye-off" size={12} color={colors.ink} />
              <Text style={styles.tagText}>Private</Text>
            </View>
          </View>
        </View>
      ) : null}
      <View style={styles.mid}>
        {step === 1 ? (
          <View style={styles.demo}>
            <View style={styles.demoCell}>
              <FireMark size={26} />
            </View>
            <View style={styles.demoCellEmpty}>
              <Ionicons name="remove" size={16} color={colors.creamMuted} />
            </View>
            <View style={styles.demoCellEmpty} />
          </View>
        ) : null}
        <Text style={styles.kicker}>{beat.kicker}</Text>
        <Text style={styles.title}>{beat.title}</Text>
        <Text style={styles.body}>{beat.body}</Text>
      </View>
      <View style={styles.dots}>
        {BEATS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
        ))}
      </View>
      <Pressable onPress={next} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
        <Text style={styles.ctaText}>{last ? "Set up your run" : "Next"}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.ink} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 18,
  },
  loginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.line,
  },
  loginText: {
    color: colors.cream,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
  },
  hero: {
    marginTop: 18,
    backgroundColor: colors.ember,
    borderRadius: 32,
    padding: 22,
  },
  heroTitle: {
    color: colors.ink,
    fontFamily: fonts.serifBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(7,7,7,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    color: colors.ink,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
  mid: {
    flex: 1,
    justifyContent: "center",
  },
  demo: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  demoCell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  demoCellEmpty: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    color: colors.ember,
    fontFamily: fonts.sansSemi,
    letterSpacing: 3,
    fontSize: 12,
  },
  title: {
    marginTop: 14,
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  body: {
    marginTop: 16,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 340,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.lineStrong,
  },
  dotOn: {
    backgroundColor: colors.ember,
    width: 18,
  },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 22,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
});
