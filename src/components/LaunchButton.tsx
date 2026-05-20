import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { useNotificationStore } from "../stores/notification";
import { useFivemRunning } from "../hooks/useFivemRunning";
import { api } from "../api/tauri";
import { Tooltip } from "./Tooltip";

export function LaunchButton() {
  const { fivemExe } = useConfigStore();
  const { activePackName } = usePacksStore();
  const notify = useNotificationStore((state) => state.show);
  const running = useFivemRunning();
  const [busy, setBusy] = useState(false);

  const disabled = !activePackName || busy || !fivemExe || running;
  const tooltip = computeTooltip({ running, activePackName });

  async function launch(): Promise<void> {
    setBusy(true);
    try {
      await api.launchFivem(fivemExe);
      notify(`FiveM se lance avec "${activePackName}"... patience`, 6000);
    } catch (err) {
      notify(`Impossible de lancer FiveM : ${err}`, 6000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tooltip label={tooltip} side="top">
      <button
        type="button"
        onClick={launch}
        disabled={disabled}
        aria-label="Lancer FiveM"
        className="group flex h-7 w-8 shrink-0 items-center justify-center bg-accent text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
        ) : (
          <Play
            className="h-3 w-3 fill-current transition-transform duration-200 group-hover:scale-125 group-active:scale-95"
            strokeWidth={0}
          />
        )}
      </button>
    </Tooltip>
  );
}

function computeTooltip({
  running,
  activePackName,
}: {
  running: boolean;
  activePackName: string | null;
}): string {
  if (running) return "FiveM est deja en cours d'execution";
  if (!activePackName) return "Selectionne d'abord un pack";
  return `Lancer FiveM avec "${activePackName}"`;
}
