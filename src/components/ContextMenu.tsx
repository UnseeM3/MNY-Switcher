import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type ContextMenuItem = {
  label: string;
  onClick: () => void | Promise<void>;
  icon?: LucideIcon;
  danger?: boolean;
  keepOpen?: boolean;
  armed?: boolean;
};

type ContextMenuProps = {
  x: number;
  y: number;
  groups: ContextMenuItem[][];
  onClose: () => void;
};

const VIEWPORT_PADDING = 6;

export function ContextMenu({ x, y, groups, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y, ready: false });

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition(clampToViewport(x, y, rect.width, rect.height));
  }, [x, y, groups]);

  async function handleClick(item: ContextMenuItem) {
    if (!item.keepOpen) onClose();
    await item.onClick();
  }

  const visibleGroups = groups.filter((group) => group.length > 0);

  return (
    <div
      ref={ref}
      style={{
        top: position.y,
        left: position.x,
        visibility: position.ready ? "visible" : "hidden",
      }}
      className="animate-context-menu fixed z-50 min-w-[180px] overflow-hidden rounded-md border border-line bg-surface py-1 shadow-2xl"
    >
      {visibleGroups.map((group, index) => (
        <div key={index}>
          {index > 0 && <div className="my-1 h-px bg-line" />}
          {group.map((item) => (
            <MenuButton key={item.label} item={item} onSelect={handleClick} />
          ))}
        </div>
      ))}
    </div>
  );
}

type MenuButtonProps = {
  item: ContextMenuItem;
  onSelect: (item: ContextMenuItem) => void;
};

function MenuButton({ item, onSelect }: MenuButtonProps) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={buildItemClasses(item)}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />}
      <span className="flex-1 truncate text-left">{item.label}</span>
    </button>
  );
}

function buildItemClasses(item: ContextMenuItem): string {
  const base =
    "flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors";
  if (item.armed) return `${base} bg-danger/15 text-danger`;
  if (item.danger) return `${base} text-danger hover:bg-danger/10`;
  return `${base} text-fg/85 hover:bg-surface-elevated hover:text-fg`;
}

function clampToViewport(x: number, y: number, width: number, height: number) {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const maxX = winW - width - VIEWPORT_PADDING;
  const maxY = winH - height - VIEWPORT_PADDING;
  const safeX = Math.max(VIEWPORT_PADDING, Math.min(x, maxX));
  const safeY = Math.max(VIEWPORT_PADDING, Math.min(y, maxY));
  return { x: safeX, y: safeY, ready: true };
}
