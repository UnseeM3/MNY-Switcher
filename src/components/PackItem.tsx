import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { useNotificationStore } from "../stores/notification";
import { api } from "../api/tauri";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import { RenamePackDialog } from "./RenamePackDialog";
import { Tooltip } from "./Tooltip";
import { DEFAULT_PACK_NAME } from "../constants";
import type { Pack } from "../types";

type ContextPosition = { x: number; y: number } | null;

export function PackItem({ pack }: { pack: Pack }) {
  const { gameDir, packsDir, gta5Dir } = useConfigStore();
  const { refresh, activePackName } = usePacksStore();
  const notify = useNotificationStore((state) => state.show);
  const [busy, setBusy] = useState(false);
  const [menuPos, setMenuPos] = useState<ContextPosition>(null);
  const [error, setError] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);

  const isActive = activePackName === pack.name;
  const isDefault = pack.name === DEFAULT_PACK_NAME;
  const canRename = !isDefault && !isActive;
  const canDelete = !isDefault;

  async function selectPack() {
    if (isActive) return;
    setError(null);
    setBusy(true);
    try {
      await api.switchPack(gameDir, packsDir, pack.name, gta5Dir);
      await refresh(gameDir, packsDir);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function openFolder() {
    try {
      await api.openFolder(`${packsDir}\\${pack.name}`);
    } catch (err) {
      notify(`Impossible d'ouvrir le dossier : ${err}`, 6000);
    }
  }

  async function deletePack() {
    const confirmed = window.confirm(
      `Supprimer le pack "${pack.name}" ?\nTous ses fichiers seront perdus.`,
    );
    if (!confirmed) return;
    await api.deletePack(packsDir, pack.name);
    await refresh(gameDir, packsDir);
  }

  function openContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    setMenuPos({ x: event.clientX, y: event.clientY });
  }

  function buildMenuItems(): ContextMenuItem[] {
    const items: ContextMenuItem[] = [
      { label: "Selectionner", onClick: selectPack },
      { label: "Ouvrir le dossier", onClick: openFolder },
    ];
    if (canRename) {
      items.push({ label: "Renommer", onClick: () => setRenameOpen(true) });
    }
    if (canDelete) {
      items.push({ label: "Supprimer", onClick: deletePack, danger: true });
    }
    return items;
  }

  const rowClasses = [
    "flex h-10 cursor-pointer items-center px-3 text-sm transition-colors border-l-2",
    isActive ? "border-accent bg-fg/5" : "border-transparent hover:bg-surface",
    busy ? "pointer-events-none opacity-60" : "",
  ].join(" ");

  return (
    <>
      <li onClick={selectPack} onContextMenu={openContextMenu} className={rowClasses}>
        <PackLabel name={pack.name} isDefault={isDefault} />
        {busy && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" strokeWidth={2.5} />}
      </li>
      {error && <li className="px-3 text-xs text-danger">{error}</li>}
      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          items={buildMenuItems()}
        />
      )}
      {renameOpen && (
        <RenamePackDialog currentName={pack.name} onClose={() => setRenameOpen(false)} />
      )}
    </>
  );
}

function PackLabel({ name, isDefault }: { name: string; isDefault: boolean }) {
  if (!isDefault) {
    return <span className="flex-1 truncate font-medium">{name}</span>;
  }
  return (
    <div className="flex-1 truncate">
      <Tooltip label="Jeux de base" side="bottom">
        <span className="truncate font-medium">{name}</span>
      </Tooltip>
    </div>
  );
}
