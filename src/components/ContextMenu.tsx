import { useEffect, useRef } from "react";

export type ContextMenuItem = {
  label: string;
  onClick: () => void | Promise<void>;
  danger?: boolean;
  keepOpen?: boolean;
  armed?: boolean;
};

type ContextMenuProps = {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
};

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  async function handleClick(item: ContextMenuItem) {
    if (!item.keepOpen) onClose();
    await item.onClick();
  }

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 min-w-[160px] overflow-hidden bg-surface shadow-xl"
    >
      <ul className="flex flex-col py-1">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => handleClick(item)}
              className={buildItemClasses(item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildItemClasses(item: ContextMenuItem): string {
  const base = "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors";
  if (item.armed) return `${base} bg-danger/15 font-medium text-danger`;
  if (item.danger) return `${base} text-danger hover:bg-danger/10`;
  return `${base} text-fg hover:bg-surface-elevated`;
}
