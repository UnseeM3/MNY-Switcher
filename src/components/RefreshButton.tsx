import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { Tooltip } from "./Tooltip";

export function RefreshButton() {
  const { gameDir, packsDir, setupComplete } = useConfigStore();
  const { loading, refresh } = usePacksStore();
  const [spinKey, setSpinKey] = useState(0);

  if (!setupComplete) return null;

  function handleRefresh(): void {
    setSpinKey((k) => k + 1);
    refresh(gameDir, packsDir);
  }

  const iconAnim = loading
    ? "animate-spin"
    : spinKey > 0
      ? "animate-refresh-spin"
      : "transition-transform duration-200 group-hover:-rotate-90";

  return (
    <Tooltip label="Rafraichir la liste" side="top">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        aria-label="Rafraichir la liste"
        className="group flex h-7 w-7 items-center justify-center text-fg-muted transition-colors duration-150 hover:bg-surface-elevated hover:text-accent disabled:opacity-50"
      >
        <RefreshCw key={spinKey} className={`h-3 w-3 ${iconAnim}`} strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
