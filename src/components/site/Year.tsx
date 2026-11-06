"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const BUILD_YEAR = "2026";

/** Current year rendered on the client, so prerendered pages never freeze a date. */
export function Year() {
  const year = useSyncExternalStore(subscribe, () => String(new Date().getFullYear()), () => BUILD_YEAR);
  return <>{year}</>;
}
