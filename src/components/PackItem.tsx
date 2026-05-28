import { Loader2 } from "lucide-react";
import { ContextMenu } from "./ContextMenu";
import { RenamePackDialog } from "./RenamePackDialog";
import { Tooltip } from "./Tooltip";
import { usePackActions } from "../hooks/usePackActions";
import type { Pack } from "../types";

export function PackItem({ pack }: { pack: Pack }) {
  const actions = usePackActions(pack);
  const { isActive, isDefault, busy, error, menuPos, renameOpen } = actions;

  const rowClasses = [
    "flex h-10 cursor-pointer items-center px-3 text-sm transition-colors border-l-2",
    isActive ? "border-accent bg-fg/5" : "border-transparent hover:bg-surface",
    busy ? "pointer-events-none opacity-60" : "",
  ].join(" ");

  return (
    <>
      <li
        onClick={actions.selectPack}
        onContextMenu={actions.openContextMenu}
        className={rowClasses}
      >
        <PackLabel name={pack.name} isDefault={isDefault} />
        {busy && (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" strokeWidth={2.5} />
        )}
      </li>
      {error && <li className="px-3 text-xs text-danger">{error}</li>}
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
