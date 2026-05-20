import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { useNotificationStore } from "../stores/notification";
import { api } from "../api/tauri";
import { Tooltip } from "./Tooltip";

export function ClearCacheButton() {
  const { gameDir } = useConfigStore();
  const notify = useNotificationStore((state) => state.show);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const disabled = !gameDir;

  async function confirm(): Promise<void> {
    setBusy(true);
    try {
      await api.clearFivemCache(gameDir);
      notify("Cache FiveM vide avec succes", 4000);
      setDialogOpen(false);
    } catch (err) {
      notify(`Impossible de vider le cache : ${err}`, 6000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Tooltip label="Vider le cache FiveM" side="top">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={disabled}
          aria-label="Vider le cache FiveM"
          className="group flex h-7 w-7 items-center justify-center text-fg-muted transition-colors duration-150 hover:bg-surface-elevated hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2
            className="h-3 w-3 transition-transform duration-200 group-hover:scale-110"
            strokeWidth={2}
          />
        </button>
      </Tooltip>
      {dialogOpen && (
        <ClearCacheDialog
          busy={busy}
          onConfirm={confirm}
          onCancel={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}

type ClearCacheDialogProps = {
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ClearCacheDialog({ busy, onConfirm, onCancel }: ClearCacheDialogProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={busy ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-80 flex-col gap-3 bg-surface p-4 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-fg">Vider le cache FiveM ?</h2>
        <p className="text-xs leading-relaxed text-fg-muted">
          Le dossier <span className="font-medium text-fg">crashes</span> sera
          supprime, et tout le contenu de{" "}
          <span className="font-medium text-fg">data</span> sauf{" "}
          <span className="font-medium text-fg">game-storage</span>.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-7 bg-surface-elevated px-3 text-[11px] font-medium text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex h-7 items-center gap-1.5 bg-danger px-3 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
            ) : (
              <Trash2 className="h-3 w-3" strokeWidth={2} />
            )}
            Vider
          </button>
        </div>
      </div>
    </div>
  );
}
