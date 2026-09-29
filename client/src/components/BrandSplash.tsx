import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "../theme/typography";

type Props = {
  showCta?: boolean;
  onLight?: () => void;
  onLogin?: () => void;
};

export function BrandSplash({ showCta = true, onLight, onLogin }: Props) {
  const insets = useSafeAreaInsets();
  const btnScale = useSharedValue(1);

  useEffect(() => {
    const id = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => {});
    }, 60);
    return () => clearTimeout(id);
  }, []);

  const btnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={styles.root}>
      {/* Background Landscape Art */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={StyleSheet.absoluteFillObject}
      >
        <Image
          source={require("../../assets/images/landing.png")}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          priority="high"
          onLoad={() => {
            void SplashScreen.hideAsync().catch(() => {});
          }}
        />
        {/* Top Vignette for Typography Readability */}
        <LinearGradient
          colors={[
            "rgba(10, 40, 80, 0.48)",
            "rgba(10, 40, 80, 0.22)",
            "transparent",
          ]}
          locations={[0, 0.35, 0.6]}
          style={[StyleSheet.absoluteFillObject, { height: "50%" }]}
        />
        {/* Bottom Vignette for Button Readability */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(5, 15, 8, 0.3)",
            "rgba(5, 15, 8, 0.72)",
          ]}
          locations={[0, 0.35, 1]}
          style={[
            StyleSheet.absoluteFillObject,
            { top: "45%", height: "55%" },
          ]}
        />
      </Animated.View>

      {/* Top Content Area */}
      <View
        style={[
          styles.topContainer,
          { paddingTop: Math.max(insets.top + 14, 32) },
        ]}
      >
        {/* Top Header Row with direct Login shortcut */}
        <View style={styles.topHeaderRow}>
          <View style={{ flex: 1 }} />
          {showCta && onLogin ? (
            <Animated.View entering={FadeInDown.duration(400).delay(60)}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to login"
                onPress={onLogin}
                style={({ pressed }) => [
                  styles.topLoginBtn,
                  pressed && styles.topLoginBtnPressed,
                ]}
                hitSlop={8}
              >
                <Text style={styles.topLoginText}>Log in</Text>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </Pressable>
            </Animated.View>
          ) : null}
        </View>

        <Animated.View entering={FadeInDown.duration(450).delay(80)}>
          <Text style={styles.title}>
            Every day is 🍃{"\n"}a new beginning.
          </Text>
          <Text style={styles.subtitle}>
            Small choices today,{"\n"}stronger you tomorrow.
          </Text>
        </Animated.View>

        {/* Frosted Glass Habit Card */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(180).springify().damping(18)}
          style={styles.glassCard}
        >
          <View style={styles.sproutWrap}>
            <Ionicons name="leaf" size={20} color="#9CE658" />
          </View>
          <View style={styles.glassTextWrap}>
            <Text style={styles.glassTitle}>Build habits. Stay consistent.</Text>
            <Text style={styles.glassSubtitle}>Become your best self.</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA Area */}
      {showCta ? (
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: Math.max(insets.bottom + 10, 20) },
          ]}
        >
          <Animated.View
            entering={FadeInUp.duration(450).delay(260).springify().damping(18)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue to choose habit"
              onPressIn={() => {
                btnScale.value = withTiming(0.97, { duration: 80 });
              }}
              onPressOut={() => {
                btnScale.value = withSpring(1, { damping: 14, stiffness: 220 });
              }}
              onPress={() => onLight?.()}
            >
              <Animated.View style={[styles.continueBtn, btnAnimatedStyle]}>
                <View style={styles.btnContent}>
                  <Text style={styles.btnLeaf}>🍃</Text>
                  <Text style={styles.btnText}>Continue</Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={21}
                  color="#FFFFFF"
                  style={styles.btnArrow}
                />
              </Animated.View>
            </Pressable>
          </Animated.View>

          {/* Already have an account shortcut */}
          {onLogin ? (
            <Animated.View
              entering={FadeInUp.duration(450).delay(320).springify().damping(18)}
            >
              <Pressable
                onPress={onLogin}
                style={({ pressed }) => [
                  styles.loginLinkRow,
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={8}
              >
                <Text style={styles.loginLinkMuted}>Already have an account? </Text>
                <Text style={styles.loginLinkBold}>Log in</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {/* Footer Journey Caption */}
          <Animated.View
            entering={FadeInUp.duration(450).delay(380).springify().damping(18)}
            style={styles.footerRow}
          >
            <Text style={styles.footerText}>
              Your journey to a better you starts here.
            </Text>
            <Ionicons name="heart-outline" size={13} color="rgba(255,255,255,0.85)" />
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070707",
    justifyContent: "space-between",
  },
  topContainer: {
    paddingHorizontal: 24,
    maxWidth: 500,
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  topLoginBtnPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    opacity: 0.85,
  },
  topLoginText: {
    color: "#FFFFFF",
    fontFamily: fonts.sansSemi,
    fontSize: 13,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: fonts.sansBold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.8,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255, 255, 255, 0.92)",
    fontFamily: fonts.sansMed,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  glassCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.38)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sproutWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  glassTextWrap: {
    flex: 1,
  },
  glassTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  glassSubtitle: {
    color: "rgba(255, 255, 255, 0.86)",
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  bottomContainer: {
    paddingHorizontal: 22,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  continueBtn: {
    height: 60,
    borderRadius: 30,
    backgroundColor: "#679C38",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnLeaf: {
    fontSize: 18,
  },
  btnText: {
    color: "#FFFFFF",
    fontFamily: fonts.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  btnArrow: {
    position: "absolute",
    right: 22,
  },
  loginLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 4,
  },
  loginLinkMuted: {
    color: "rgba(255, 255, 255, 0.78)",
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#FFFFFF",
    fontFamily: fonts.sansBold,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.88)",
    fontFamily: fonts.sansMed,
    fontSize: 12.5,
    letterSpacing: -0.1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
