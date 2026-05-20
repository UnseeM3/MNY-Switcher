import { useEffect, useState } from "react";
import { useConfigStore } from "../stores/config";
import { api } from "../api/tauri";

const POLL_INTERVAL_MS = 2000;

export function useFivemRunning(): boolean {
  const fivemExe = useConfigStore((state) => state.fivemExe);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!fivemExe) {
      setRunning(false);
      return;
    }
    let cancelled = false;

    async function check(): Promise<void> {
      try {
        const result = await api.isFivemRunning(fivemExe);
        if (!cancelled) setRunning(result);
      } catch {
        if (!cancelled) setRunning(false);
      }
    }

    check();
    const intervalId = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [fivemExe]);

  return running;
}
