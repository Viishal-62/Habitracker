import { useRouter, type Href } from "expo-router";
import { BrandSplash } from "../src/components/BrandSplash";
import { hapticPick } from "../src/lib/haptics";

export default function Landing() {
  const router = useRouter();
  return (
    <BrandSplash
      showCta
      onLight={() => {
        void hapticPick();
        router.replace("/onboarding" as Href);
      }}
      onLogin={() => {
        void hapticPick();
        router.replace({
          pathname: "/login",
          params: { returnTo: "landing" },
        });
      }}
    />
  );
}
