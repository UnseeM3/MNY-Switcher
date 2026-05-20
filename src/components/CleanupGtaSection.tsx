import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { useNotificationStore } from "../stores/notification";
import { api } from "../api/tauri";
import { CleanupGtaDialog } from "./CleanupGtaDialog";

type CleanupGtaSectionProps = {
  busy: boolean;
};

export function CleanupGtaSection({ busy }: CleanupGtaSectionProps) {
  const { fivemExe, gta5Exe, gta5Dir } = useConfigStore();
  const notify = useNotificationStore((state) => state.show);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  async function tryOpen(): Promise<void> {
    if (!gta5Dir || !gta5Exe) {
      notify("GTA5.exe n'est pas configure", 4000);
      return;
    }
    setChecking(true);
    try {
      const blocker = await detectBlocker(fivemExe, gta5Exe);
      if (blocker) {
        notify(`${blocker} est en cours d'execution, ferme-le avant de nettoyer`, 5000);
        return;
      }
      setDialogOpen(true);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
      <p className="text-[11px] text-fg-muted">
        Supprime tous les fichiers non vanilla de ton install GTA V (mods, asi, dll, ENB,
        scripts, dlcpacks custom...).
      </p>
      <button
        type="button"
        onClick={tryOpen}
        disabled={busy || checking}
        className="flex h-8 items-center justify-center gap-1.5 self-start bg-surface px-3 text-[11px] font-medium text-fg-muted transition-colors hover:bg-surface-elevated hover:text-accent disabled:opacity-40"
      >
        <Trash2 className="h-3 w-3" strokeWidth={2.5} />
        Nettoyer GTA V
      </button>
      {dialogOpen && <CleanupGtaDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}

async function detectBlocker(fivemExe: string, gta5Exe: string): Promise<string | null> {
  if (fivemExe && (await api.isFivemRunning(fivemExe))) return "FiveM";
  if (gta5Exe && (await api.isFivemRunning(gta5Exe))) return "GTA V";
  return null;
}
