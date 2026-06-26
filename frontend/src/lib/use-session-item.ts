"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function useSessionItem(key: string): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => sessionStorage.getItem(key) ?? "",
    () => "",
  );
}
