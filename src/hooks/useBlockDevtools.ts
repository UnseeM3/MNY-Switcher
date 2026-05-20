import { useEffect } from "react";

const BLOCKED_KEYS = new Set(["F12"]);
const BLOCKED_CTRL_SHIFT_KEYS = new Set(["I", "J", "C"]);

export function useBlockDevtools(): void {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (isBlocked(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);
}

function isBlocked(event: KeyboardEvent): boolean {
  if (BLOCKED_KEYS.has(event.key)) return true;
  if (event.ctrlKey && event.shiftKey && BLOCKED_CTRL_SHIFT_KEYS.has(event.key.toUpperCase())) {
    return true;
  }
  return false;
}
