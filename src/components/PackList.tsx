import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { api } from "../api/tauri";
import { PackItem } from "./PackItem";
import { NewPackDialog } from "./NewPackDialog";
import { LaunchButton } from "./LaunchButton";
import { ClearCacheButton } from "./ClearCacheButton";
import { RefreshButton } from "./RefreshButton";
import { ThemeToggle } from "./ThemeToggle";
import { Tooltip } from "./Tooltip";

export function PackList() {
  const { gameDir, packsDir } = useConfigStore();
  const { packs, loading, error, refresh } = usePacksStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!packsDir) return;
    (async () => {
      if (gameDir) {
        await api.migrateLegacyDefault(packsDir, gameDir).catch(() => undefined);
      }
      await refresh(gameDir, packsDir);
    })();
  }, [gameDir, packsDir, refresh]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto py-2">
        {loading && packs.length === 0 ? (
          <EmptyState message="Chargement..." />
        ) : packs.length === 0 ? (
          <EmptyState message="Aucun pack. Cree-en un avec le bouton +." />
        ) : (
          <ul className="flex flex-col">
            {packs.map((pack) => (
              <PackItem key={pack.name} pack={pack} />
            ))}
          </ul>
        )}
        {error && <p className="mt-2 px-3 text-xs text-danger">{error}</p>}
      </div>
      <div className="flex items-center justify-center gap-1.5 px-3 pb-2 pt-2">
        <LaunchButton />
        <ClearCacheButton />
        <Tooltip label="Creer un nouveau pack" side="top">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            aria-label="Nouveau pack"
            className="group flex h-7 items-center gap-1.5 bg-surface px-3 text-[11px] font-medium text-fg-muted transition-colors hover:bg-surface-elevated hover:text-accent"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
            Nouveau pack
          </button>
        </Tooltip>
        <RefreshButton />
        <ThemeToggle />
      </div>
      <p className="pb-2 text-center text-[10px] text-fg-muted">
        by <span className="text-accent">Unsee</span>
      </p>
      {dialogOpen && <NewPackDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-center text-xs text-fg-muted">{message}</p>
    </div>
  );
}
