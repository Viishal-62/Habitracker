import { useEffect, type ReactNode } from "react";
import { AppState } from "react-native";
import { useAppStore } from "./appStore";

export { useApp } from "./appStore";

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrateLocal = useAppStore((s) => s.hydrateLocal);
  const syncRemote = useAppStore((s) => s.syncRemote);
  const tickToday = useAppStore((s) => s.tickToday);

  useEffect(() => {
    let active = true;
    void hydrateLocal().then(() => {
      if (active) void syncRemote().catch(() => {});
    });
    return () => {
      active = false;
    };
  }, [hydrateLocal, syncRemote]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") tickToday();
    });
    const id = setInterval(tickToday, 20_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, [tickToday]);

  return <>{children}</>;
}
