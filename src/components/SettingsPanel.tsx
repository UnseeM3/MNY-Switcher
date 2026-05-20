import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { useUiStore } from "../stores/ui";
import { useNotificationStore } from "../stores/notification";
import { api } from "../api/tauri";
import { CleanupGtaSection } from "./CleanupGtaSection";

export function SettingsPanel() {
  const { fivemExe, gta5Exe, packsDir, gameDir, setConfig, reset } = useConfigStore();
  const { refresh } = usePacksStore();
  const closeSettings = useUiStore((state) => state.closeSettings);
  const notify = useNotificationStore((state) => state.show);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changeFivemExe(): Promise<void> {
    const picked = await pickExe();
    if (!picked) return;
    setBusy(true);
    try {
      const newGameDir = await api.detectGameDir(picked);
      if (gameDir && newGameDir !== gameDir) {
        await api.cleanupJunctions(gameDir).catch(() => undefined);
      }
      setConfig({ fivemExe: picked, gameDir: newGameDir });
      await refresh(newGameDir, packsDir);
      notify("FiveM.exe mis a jour", 3000);
    } catch (err) {
      notify(`Impossible de changer FiveM.exe : ${err}`, 6000);
    } finally {
      setBusy(false);
    }
  }

  async function changeGta5Exe(): Promise<void> {
    const picked = await pickExe();
    if (!picked) return;
    setBusy(true);
    try {
      const newGta5Dir = await dirname(picked);
      setConfig({ gta5Exe: picked, gta5Dir: newGta5Dir });
      notify("GTA5.exe mis a jour", 3000);
    } catch (err) {
      notify(`Impossible de changer GTA5.exe : ${err}`, 6000);
    } finally {
      setBusy(false);
    }
  }

  async function changePacksDir(): Promise<void> {
    const picked = await pickDir();
    if (!picked) return;
    setBusy(true);
    try {
      if (gameDir) {
        await api.cleanupJunctions(gameDir).catch(() => undefined);
      }
      setConfig({ packsDir: picked });
      await refresh(gameDir, picked);
      notify("Dossier de packs mis a jour", 3000);
    } catch (err) {
      notify(`Impossible de changer le dossier : ${err}`, 6000);
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset(): Promise<void> {
    setBusy(true);
    try {
      if (gameDir) {
        await api.cleanupJunctions(gameDir).catch(() => undefined);
      }
      reset();
      setResetDialogOpen(false);
      closeSettings();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <SettingsHeader onClose={closeSettings} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        <SettingsField
          label="FiveM.exe"
          value={fivemExe}
          busy={busy}
          onPick={changeFivemExe}
        />
        <SettingsField
          label="GTA5.exe"
          value={gta5Exe}
          busy={busy}
          onPick={changeGta5Exe}
        />
        <SettingsField
          label="Dossier des packs"
          value={packsDir}
          busy={busy}
          onPick={changePacksDir}
        />
        <CleanupGtaSection busy={busy} />
        <ResetSection busy={busy} onClick={() => setResetDialogOpen(true)} />
      </div>
      {resetDialogOpen && (
        <ResetConfirmDialog
          busy={busy}
          onConfirm={confirmReset}
          onCancel={() => setResetDialogOpen(false)}
        />
      )}
    </div>
  );
}

function SettingsHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex h-9 items-center justify-between border-b border-line bg-surface px-4">
      <h2 className="text-sm font-semibold tracking-tight">Reglages</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer les reglages"
        className="flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-elevated hover:text-fg"
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </header>
  );
}

type SettingsFieldProps = {
  label: string;
  value: string;
  busy: boolean;
  onPick: () => void;
};

function SettingsField({ label, value, busy, onPick }: SettingsFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-fg">{label}</label>
      <p className="truncate text-[11px] text-fg-muted" title={value}>
        {value || "—"}
      </p>
      <button
        type="button"
        onClick={onPick}
        disabled={busy}
        className="h-8 self-start bg-surface px-3 text-[11px] font-medium text-fg-muted transition-colors hover:bg-surface-elevated hover:text-accent disabled:opacity-40"
      >
        Changer
      </button>
    </div>
  );
}

type ResetSectionProps = {
  busy: boolean;
  onClick: () => void;
};

function ResetSection({ busy, onClick }: ResetSectionProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <p className="text-[11px] text-fg-muted">
        Reinitialise toute la configuration et refait l'installation depuis zero.
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="flex h-8 items-center justify-center gap-1.5 self-start bg-danger px-3 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
        Tout reinitialiser
      </button>
    </div>
  );
}

type ResetConfirmDialogProps = {
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ResetConfirmDialog({ busy, onConfirm, onCancel }: ResetConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={busy ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-80 flex-col gap-3 bg-surface p-4 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-fg">Refaire l'installation ?</h2>
        <p className="text-xs leading-relaxed text-fg-muted">
          Toute la configuration sera effacee et tu repasseras par le wizard. Les
          junctions FiveM actives seront nettoyees. Tes packs stockes ne sont pas
          supprimes.
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
              <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
            )}
            Reinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}

async function pickExe(): Promise<string | null> {
  const result = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Executable", extensions: ["exe"] }],
  });
  return typeof result === "string" ? result : null;
}

async function pickDir(): Promise<string | null> {
  const result = await open({ multiple: false, directory: true });
  return typeof result === "string" ? result : null;
}
