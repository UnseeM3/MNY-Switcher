import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { useNotificationStore } from "../stores/notification";
import { api } from "../api/tauri";
import type { ContextMenuItem } from "../components/ContextMenu";
import { DEFAULT_PACK_NAME, COVER_EXTENSIONS } from "../constants";
import type { Pack } from "../types";

export type ContextPosition = { x: number; y: number } | null;

export type PackActions = {
  isActive: boolean;
  isDefault: boolean;
  busy: boolean;
  error: string | null;
  menuPos: ContextPosition;
  renameOpen: boolean;
  selectPack: () => Promise<void>;
  openContextMenu: (event: React.MouseEvent) => void;
  closeMenu: () => void;
  closeRename: () => void;
  buildMenuItems: () => ContextMenuItem[];
};

export function usePackActions(pack: Pack): PackActions {
  const { gameDir, packsDir, gta5Dir } = useConfigStore();
  const { refresh, activePackName } = usePacksStore();
  const notify = useNotificationStore((state) => state.show);
  const [busy, setBusy] = useState(false);
  const [menuPos, setMenuPos] = useState<ContextPosition>(null);
  const [error, setError] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
    await api.deletePack(packsDir, pack.name);
    await refresh(gameDir, packsDir);
  }

  async function chooseCover() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Image", extensions: COVER_EXTENSIONS }],
      });
      if (typeof selected !== "string") return;
      await api.setPackCover(packsDir, pack.name, selected);
      await refresh(gameDir, packsDir);
    } catch (err) {
      notify(`Impossible de definir l'image : ${err}`, 6000);
    }
  }

  async function removeCover() {
    try {
      await api.removePackCover(packsDir, pack.name);
      await refresh(gameDir, packsDir);
    } catch (err) {
      notify(`Impossible de retirer l'image : ${err}`, 6000);
    }
  }

  function openContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    setMenuPos({ x: event.clientX, y: event.clientY });
  }

  function closeMenu() {
    setMenuPos(null);
    setConfirmingDelete(false);
  }

  function closeRename() {
    setRenameOpen(false);
  }

  function buildDeleteItem(): ContextMenuItem {
    if (confirmingDelete) {
      return {
        label: "Confirmer suppression ?",
        onClick: deletePack,
        danger: true,
        armed: true,
      };
    }
    return {
      label: "Supprimer",
      onClick: () => setConfirmingDelete(true),
      danger: true,
      keepOpen: true,
    };
  }

  function buildCoverItems(): ContextMenuItem[] {
    if (pack.coverPath) {
      return [
        { label: "Changer l'image", onClick: chooseCover },
        { label: "Retirer l'image", onClick: removeCover },
      ];
    }
    return [{ label: "Definir une image", onClick: chooseCover }];
  }

  function buildMenuItems(): ContextMenuItem[] {
    const items: ContextMenuItem[] = [
      { label: "Selectionner", onClick: selectPack },
      { label: "Ouvrir le dossier", onClick: openFolder },
      ...buildCoverItems(),
    ];
    if (canRename) {
      items.push({ label: "Renommer", onClick: () => setRenameOpen(true) });
    }
    if (canDelete) {
      items.push(buildDeleteItem());
    }
    return items;
  }

  return {
    isActive,
    isDefault,
    busy,
    error,
    menuPos,
    renameOpen,
    selectPack,
    openContextMenu,
    closeMenu,
    closeRename,
    buildMenuItems,
  };
}
