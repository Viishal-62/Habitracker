import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  size?: number;
};

export function BrandMark({ size = 28 }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
        },
      ]}
    >
      <Ionicons name="flame" size={Math.round(size * 0.62)} color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.ember,
    alignItems: "center",
    justifyContent: "center",
  },
});
