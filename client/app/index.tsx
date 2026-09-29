import { useRouter, type Href } from "expo-router";
import { useEffect, useRef } from "react";
import { BrandSplash } from "../src/components/BrandSplash";
import { hapticPick } from "../src/lib/haptics";
import { useApp } from "../src/state/AppProvider";

export default function Gate() {
  const router = useRouter();
  const routedTo = useRef<string | null>(null);
  const {
    ready,
    remoteSettled,
    hasSessionToken,
    onboardingComplete,
    user,
    habit,
    pendingHabitName,
    hasAccount,
  } = useApp();

  useEffect(() => {
    if (!ready || !onboardingComplete) return;
    if (hasSessionToken && !user && !remoteSettled) return;

    const target: Href = !user
      ? hasAccount || pendingHabitName
        ? "/login"
        : "/pick-habit"
      : habit
        ? "/today"
        : "/pick-habit";

    if (routedTo.current === target) return;
    routedTo.current = String(target);
    router.replace(target);
  }, [
    habit,
    hasAccount,
    hasSessionToken,
    onboardingComplete,
    pendingHabitName,
    ready,
    remoteSettled,
    router,
    user,
  ]);

  const goOnboarding = () => {
    void hapticPick();
    router.replace("/onboarding" as Href);
  };

  const goLogin = () => {
    void hapticPick();
    router.replace({
      pathname: "/login",
      params: { returnTo: "landing" },
    });
  };

  if (!ready) {
    return <BrandSplash showCta={false} />;
  }

  if (!onboardingComplete) {
    return <BrandSplash showCta onLight={goOnboarding} onLogin={goLogin} />;
  }

  return <BrandSplash showCta={false} />;
}

