import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/state/AppProvider";
import { useAppStore } from "../src/state/appStore";
import { colors } from "../src/theme/colors";
import { fonts } from "../src/theme/typography";

export default function Login() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const can = email.includes("@") && password.length > 0;
  const goBack = useCallback(() => {
    if (busy) return;
    router.replace(returnTo === "picker" ? "/pick-habit" : "/landing");
  }, [busy, returnTo, router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        goBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [goBack]);

  const submit = async () => {
    if (!can) return;
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      const { habit } = useAppStore.getState();
      router.replace(habit ? "/today" : "/pick-habit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t sign in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={12}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          disabled={busy}
          onPress={goBack}
          hitSlop={10}
          style={({ pressed }) => [
            styles.back,
            pressed && !busy && styles.backPressed,
            busy && styles.backDisabled,
          ]}
        >
          <Ionicons name="chevron-back" size={19} color={colors.cream} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.kicker}>Hey soul welcome</Text>
        <Text style={styles.title}>Leave an email so this stays yours.</Text>
        <Text style={styles.body}>
          Same email next time. Pick a password you will remember.
        </Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@email.com"
          placeholderTextColor={colors.creamMuted}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (error) setError("");
          }}
          style={styles.input}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="password"
            placeholderTextColor={colors.creamMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) setError("");
            }}
            style={styles.passwordInput}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeBtn}
            hitSlop={12}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.creamMuted}
            />
          </Pressable>
        </View>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.emberSoft} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          disabled={!can || busy}
          onPress={submit}
          style={({ pressed }) => [
            styles.cta,
            (!can || busy) && styles.ctaOff,
            pressed && can && styles.ctaPressed,
          ]}
        >
          <Text style={styles.ctaText}>{busy ? "Entering..." : "Enter"}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: {
    minHeight: 40,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 10,
  },
  backPressed: { opacity: 0.65 },
  backDisabled: { opacity: 0.35 },
  backText: {
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 14,
  },
  kicker: {
    marginTop: 12,
    color: colors.ember,
    fontFamily: fonts.sansSemi,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    marginTop: 12,
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 40,
  },
  body: {
    marginTop: 12,
    marginBottom: 28,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 18,
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: colors.bgRaised,
  },
  passwordContainer: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bgRaised,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 16,
    height: "100%",
  },
  eyeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    color: colors.emberSoft,
    fontFamily: fonts.sans,
    fontSize: 14,
    flex: 1,
  },
  cta: {
    marginTop: "auto",
    backgroundColor: colors.ember,
    borderRadius: 22,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ctaOff: { opacity: 0.35 },
  ctaPressed: { opacity: 0.9 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
});
