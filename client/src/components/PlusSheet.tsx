import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BillingPeriod } from "../data/types";
import { formatLongDate } from "../lib/dates";
import { hapticPick } from "../lib/haptics";
import { useApp } from "../state/AppProvider";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const PLANS: { period: BillingPeriod; price: string; hint: string }[] = [
  { period: "monthly", price: "$4.99", hint: "per month" },
  { period: "yearly", price: "$29.99", hint: "per year · save 2 months" },
];

export function PlusSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { subscription, purchasePlus, restorePlus, endMockPlus } = useApp();
  const [period, setPeriod] = useState<BillingPeriod>(
    subscription.period ?? "yearly",
  );
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const plus = subscription.plan === "plus";

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      await purchasePlus(period);
      setNote("Mock purchase done. Real store billing later.");
    } catch {
      setNote("Couldn’t complete the mock purchase.");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const sub = await restorePlus();
      setNote(
        sub.plan === "plus"
          ? "Restored mock Plus."
          : "No mock purchase on this account.",
      );
    } finally {
      setBusy(false);
    }
  };

  const end = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await endMockPlus();
      setNote("Mock Plus ended.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.top}>
            <Text style={styles.kicker}>Plus</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <Ionicons name="close" size={20} color={colors.cream} />
            </Pressable>
          </View>
          <Text style={styles.title}>Keep the run going.</Text>
          <Text style={styles.body}>
            Mock store only. Later this becomes App Store / Play billing — not a card form in the app.
          </Text>

          {plus ? (
            <View style={styles.active}>
              <Ionicons name="checkmark-circle" size={20} color={colors.ink} />
              <View style={styles.activeCopy}>
                <Text style={styles.activeTitle}>Mock Plus is on</Text>
                <Text style={styles.activeHint}>
                  {subscription.period === "yearly" ? "Yearly" : "Monthly"}
                  {subscription.renewsAt
                    ? ` · renews ${formatLongDate(subscription.renewsAt)}`
                    : ""}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.plans}>
              {PLANS.map((item) => {
                const on = period === item.period;
                return (
                  <Pressable
                    key={item.period}
                    onPress={() => {
                      void hapticPick();
                      setPeriod(item.period);
                    }}
                    style={[styles.plan, on && styles.planOn]}
                  >
                    <View>
                      <Text style={[styles.planPrice, on && styles.onInk]}>{item.price}</Text>
                      <Text style={[styles.planHint, on && styles.onInkMuted]}>{item.hint}</Text>
                    </View>
                    <Ionicons
                      name={on ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={on ? colors.ink : colors.tabInactive}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}

          {note ? <Text style={styles.note}>{note}</Text> : null}

          {plus ? (
            <Pressable
              onPress={end}
              disabled={busy}
              style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
            >
              <Text style={styles.ghostText}>End mock Plus</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={buy}
                disabled={busy}
                style={({ pressed }) => [
                  styles.cta,
                  busy && styles.ctaOff,
                  pressed && !busy && styles.pressed,
                ]}
              >
                <Text style={styles.ctaText}>{busy ? "Working…" : "Mock buy"}</Text>
              </Pressable>
              <Pressable
                onPress={restore}
                disabled={busy}
                style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
              >
                <Text style={styles.ghostText}>Restore purchases</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lineStrong,
    alignSelf: "center",
    marginBottom: 12,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kicker: {
    color: colors.creamMuted,
    fontFamily: fonts.sansSemi,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 28,
    letterSpacing: -0.6,
  },
  body: {
    marginTop: 8,
    marginBottom: 18,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  plans: { gap: 10 },
  plan: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  planOn: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
  },
  planPrice: {
    color: colors.cream,
    fontFamily: fonts.sansBold,
    fontSize: 18,
  },
  planHint: {
    marginTop: 2,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  onInk: { color: colors.ink },
  onInkMuted: { color: "rgba(7,7,7,0.55)" },
  active: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.ember,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  activeCopy: { flex: 1 },
  activeTitle: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
  activeHint: {
    marginTop: 2,
    color: "rgba(7,7,7,0.55)",
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  note: {
    marginTop: 12,
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  cta: {
    marginTop: 16,
    backgroundColor: colors.ember,
    borderRadius: 22,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaOff: { opacity: 0.45 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
  ghost: {
    marginTop: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 14,
  },
  pressed: { opacity: 0.85 },
});
