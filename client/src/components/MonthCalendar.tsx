import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Checkin } from "../data/types";
import { daysInMonth, startWeekday, toISODate } from "../lib/dates";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { FireMark } from "./FireMark";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

type Props = {
  month: string;
  title?: string;
  checkins: Checkin[];
  variant?: "preview" | "full" | "embed";
};

export function MonthCalendar({ month, title = "Your fires", checkins, variant = "preview" }: Props) {
  const today = toISODate();
  const days = daysInMonth(month);
  const offset = startWeekday(month);
  const byDate = new Map(checkins.map((c) => [c.date, c.answer]));
  const cells: { iso: string | null; day: number | null }[] = [];
  const full = variant === "full";
  const embed = variant === "embed";
  const [bodyH, setBodyH] = useState(0);

  for (let i = 0; i < offset; i++) cells.push({ iso: null, day: null });
  for (let d = 1; d <= days; d++) {
    const iso = `${month}-${String(d).padStart(2, "0")}`;
    cells.push({ iso, day: d });
  }

  const rows = Math.ceil(cells.length / 7);
  const cellH = full ? 48 : embed ? 38 : bodyH > 0 ? Math.max(24, Math.floor(bodyH / rows)) : 28;

  return (
    <View style={[styles.wrap, full && styles.wrapFull, embed && styles.wrapEmbed]}>
      {!embed ? (
        <View style={styles.head}>
          <Text style={[styles.title, full && styles.titleFull]}>{title}</Text>
          <Text style={styles.hint}>{full ? "Fires only. No edits." : "Tap to view"}</Text>
        </View>
      ) : null}
      <View style={styles.week}>
        {WEEK.map((w, i) => (
          <Text key={`${w}-${i}`} style={[styles.weekLabel, (full || embed) && styles.weekLabelFull]}>
            {w}
          </Text>
        ))}
      </View>
      <View
        style={[styles.grid, (full || embed) && styles.gridFull]}
        onLayout={(e) => {
          if (!full && !embed) setBodyH(e.nativeEvent.layout.height);
        }}
      >
        {cells.map((cell, index) => {
          if (!cell.iso || cell.day == null) {
            return <View key={`e-${index}`} style={[styles.cell, { height: cellH }]} />;
          }
          const lit = byDate.get(cell.iso) === "yes";
          const isToday = cell.iso === today;
          const future = cell.iso > today;
          return (
            <View
              key={cell.iso}
              style={[
                styles.cell,
                { height: cellH },
                isToday && styles.today,
                future && styles.future,
              ]}
            >
              {lit ? (
                <FireMark size={full ? 22 : embed ? 16 : Math.min(16, cellH - 8)} />
              ) : (
                <Text style={[styles.num, (full || embed) && styles.numFull, future && styles.numFuture]}>
                  {cell.day}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    pointerEvents: "none",
    flex: 1,
    backgroundColor: colors.bgRaised,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
    minHeight: 0,
  },
  wrapFull: {
    flex: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 28,
  },
  wrapEmbed: {
    flex: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 0,
    minHeight: 0,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
  },
  titleFull: {
    fontSize: 18,
    fontFamily: fonts.sansBold,
  },
  hint: {
    color: colors.creamMuted,
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  week: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 10,
  },
  weekLabelFull: {
    fontSize: 12,
    marginBottom: 4,
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    minHeight: 0,
    alignContent: "space-around",
  },
  gridFull: {
    flex: 0,
  },
  cell: {
    width: "14.285%",
    alignItems: "center",
    justifyContent: "center",
  },
  today: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.ember,
  },
  future: {
    opacity: 0.35,
  },
  num: {
    color: colors.creamMuted,
    fontFamily: fonts.sansMed,
    fontSize: 11,
  },
  numFull: {
    fontSize: 14,
    color: colors.cream,
  },
  numFuture: {
    color: colors.creamMuted,
  },
});
