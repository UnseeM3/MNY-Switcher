import { Loader2 } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ContextMenu } from "./ContextMenu";
import { RenamePackDialog } from "./RenamePackDialog";
import { Tooltip } from "./Tooltip";
import { usePackActions } from "../hooks/usePackActions";
import type { Pack } from "../types";

export function PackCard({ pack }: { pack: Pack }) {
  const actions = usePackActions(pack);
  const { isActive, isDefault, busy, error, menuPos, renameOpen } = actions;
  const coverSrc = pack.coverPath ? convertFileSrc(pack.coverPath) : null;

  return (
    <>
      <button
        type="button"
        onClick={actions.selectPack}
        onContextMenu={actions.openContextMenu}
        disabled={busy}
        className={buildCardClasses(isActive, busy)}
      >
        <CardCover coverSrc={coverSrc} packName={pack.name} busy={busy} />
        <CardLabel name={pack.name} isDefault={isDefault} />
      </button>
      {error && <p className="col-span-full px-1 text-[10px] text-danger">{error}</p>}
      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={actions.closeMenu}
          groups={actions.buildMenuGroups()}
        />
      )}
      {renameOpen && (
        <RenamePackDialog currentName={pack.name} onClose={actions.closeRename} />
      )}
    </>
  );
}

function buildCardClasses(isActive: boolean, busy: boolean): string {
  const base =
    "group relative flex flex-col overflow-hidden text-left transition-colors focus:outline-none border-t-2";
  const state = isActive
    ? "border-accent bg-accent/[0.08]"
    : "border-transparent bg-surface hover:bg-surface-elevated";
  const disabled = busy ? "pointer-events-none opacity-60" : "";
  return `${base} ${state} ${disabled}`;
}

type CoverProps = { coverSrc: string | null; packName: string; busy: boolean };

function CardCover({ coverSrc, packName, busy }: CoverProps) {
  return (
    <div className="relative aspect-video w-full bg-base">
      {coverSrc ? (
        <img
          src={coverSrc}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <CoverPlaceholder packName={packName} />
      )}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-base/70">
          <Loader2 className="h-5 w-5 animate-spin text-accent" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

function CoverPlaceholder({ packName }: { packName: string }) {
  const initial = packName.charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-fg-muted">
      {initial}
    </div>
  );
}

function CardLabel({ name, isDefault }: { name: string; isDefault: boolean }) {
  const text = (
    <span className="block truncate px-2 py-1.5 text-center text-xs font-medium">
      {name}
    </span>
  );
  if (!isDefault) return text;
  return (
    <Tooltip label="Jeux de base" side="top">
      {text}
    </Tooltip>
  );
}
