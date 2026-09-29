import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  size?: number;
  color?: string;
};

export function FireMark({ size = 18, color = colors.ember }: Props) {
  return <Ionicons name="flame" size={size} color={color} />;
}
