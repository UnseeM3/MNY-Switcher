import { useEffect, useRef, useState } from "react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { api } from "../api/tauri";
import { validateName } from "./NewPackDialogSteps";

type RenamePackDialogProps = {
  currentName: string;
  onClose: () => void;
};

export function RenamePackDialog({ currentName, onClose }: RenamePackDialogProps) {
  const { gameDir, packsDir } = useConfigStore();
  const { refresh } = usePacksStore();
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    const validation = validateName(trimmed);
    if (validation) {
      setError(validation);
      return;
    }
    if (trimmed === currentName) {
      onClose();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.renamePack(packsDir, gameDir, currentName, trimmed);
      await refresh(gameDir, packsDir);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-80 flex-col gap-3 bg-surface p-4 shadow-xl"
      >
        <h3 className="text-sm font-semibold">Renommer le pack</h3>
        <label className="text-xs text-fg-muted">Nouveau nom</label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          className="h-9 bg-base px-3 text-sm outline-none transition-colors focus:bg-surface-elevated"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-8 px-3 text-xs text-fg-muted transition-colors hover:text-fg disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="h-8 bg-accent px-3 text-xs font-medium text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            {busy ? "..." : "Renommer"}
          </button>
        </div>
      </form>
    </div>
  );
}
