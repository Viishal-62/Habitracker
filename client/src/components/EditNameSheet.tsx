import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Props = {
  visible: boolean;
  current: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
};

export function EditNameSheet({ visible, current, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const ready = value.trim().length > 0 && value.trim() !== current && !busy;

  useEffect(() => {
    if (visible) setValue(current);
  }, [current, visible]);

  const save = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      await onSave(value.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>What should we call you?</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            placeholder="Your name"
            placeholderTextColor={colors.creamMuted}
            style={styles.input}
          />
          <Pressable
            disabled={!ready}
            onPress={save}
            style={({ pressed }) => [
              styles.cta,
              !ready && styles.ctaOff,
              pressed && ready && styles.pressed,
            ]}
          >
            <Text style={styles.ctaText}>{busy ? "Saving…" : "Save"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.serifBold,
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 18,
    color: colors.cream,
    fontFamily: fonts.sansMed,
    fontSize: 16,
    backgroundColor: colors.bgRaised,
    marginBottom: 28,
  },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 22,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaOff: { opacity: 0.35 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
  },
  pressed: { opacity: 0.88 },
});
