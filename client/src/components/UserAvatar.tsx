import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  seed: string;
  uri?: string | null;
  size?: number;
};

export function UserAvatar({ seed, uri, size = 72 }: Props) {
  const [failed, setFailed] = useState(false);
  const dice = useMemo(() => {
    const q = encodeURIComponent(seed || "chooseone");
    return `https://api.dicebear.com/9.x/adventurer/png?seed=${q}&backgroundColor=c6f24a&size=160`;
  }, [seed]);

  useEffect(() => {
    setFailed(false);
  }, [uri, seed]);

  const inner = size - 6;
  const radius = inner * 0.3;
  const source = uri && !failed ? uri : dice;

  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size * 0.32 },
      ]}
    >
      {failed && !uri ? (
        <View style={[styles.fallback, { width: inner, height: inner, borderRadius: radius }]}>
          <Ionicons name="person" size={inner * 0.44} color={colors.ink} />
        </View>
      ) : (
        <Image
          source={{ uri: source }}
          style={{
            width: inner,
            height: inner,
            borderRadius: radius,
            backgroundColor: colors.ember,
          }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  fallback: {
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
  },
});
