"use client";

import { useSyncExternalStore } from "react";
import type { HoursView } from "@/data/types";
import { formatTime } from "@/lib/format";

const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const subscribe = () => () => {};

/** "Today: 7 AM - 6 PM", computed in the browser so cached pages never show the wrong day. */
export function TodayHours({ hours, timezone }: { hours: HoursView[]; timezone: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => {
      try {
        const weekday = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, weekday: "short" }).format(new Date());
        const idx = SHORT.indexOf(weekday.slice(0, 3));
        const today = hours.find((h) => h.day_of_week === idx);
        return !today || today.is_closed ? "Closed today" : `Today: ${formatTime(today.opens_at)} - ${formatTime(today.closes_at)}`;
      } catch {
        return "Hours";
      }
    },
    () => "Hours"
  );
  return <span>{label}</span>;
}
