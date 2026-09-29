import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { BrandSplash } from "../../src/components/BrandSplash";
import { EmberTabBar } from "../../src/components/EmberTabBar";
import { useApp } from "../../src/state/AppProvider";
import { colors } from "../../src/theme/colors";

export default function AppTabs() {
  const router = useRouter();
  const { ready, user, habit } = useApp();

  useEffect(() => {
    if (!ready || (user && habit)) return;
    if (!user) {
      router.replace({
        pathname: "/login",
        params: { returnTo: "landing" },
      });
      return;
    }
    router.replace("/pick-habit");
  }, [habit, ready, router, user]);

  if (!ready || !user || !habit) {
    return <BrandSplash showCta={false} />;
  }

  return (
    <Tabs
      initialRouteName="today"
      tabBar={(props) => <EmberTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="today" options={{ title: "Today", tabBarLabel: "Today" }} />
      <Tabs.Screen name="profile" options={{ title: "You", tabBarLabel: "You" }} />
    </Tabs>
  );
}
