import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

const TABS: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOn: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "today", label: "Today", icon: "flame-outline", iconOn: "flame" },
  { name: "profile", label: "You", icon: "person-outline", iconOn: "person" },
];

export function EmberTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.safe, { paddingBottom: bottomGap }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          if (!route) return null;
          const index = state.routes.indexOf(route);
          const focused = state.index === index;
          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              android_ripple={{ color: "transparent" }}
              style={styles.item}
            >
              <Ionicons
                name={focused ? tab.iconOn : tab.icon}
                size={22}
                color={focused ? colors.ember : colors.tabInactive}
              />
              <Text
                numberOfLines={1}
                style={[styles.label, focused && styles.labelOn]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  bar: {
    height: 62,
    flexDirection: "row",
    backgroundColor: colors.bgRaised,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: 8,
    paddingBottom: 8,
  },
  label: {
    color: colors.tabInactive,
    fontFamily: fonts.sansMed,
    fontSize: 11,
    lineHeight: 16,
    includeFontPadding: false,
  },
  labelOn: {
    color: colors.ember,
  },
});
