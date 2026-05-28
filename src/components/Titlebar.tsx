import { getCurrentWindow } from "@tauri-apps/api/window";
import { LayoutGrid, List, Minus, Settings, X } from "lucide-react";
import logoUrl from "/logo.png";
import { useConfigStore } from "../stores/config";
import { useUiStore } from "../stores/ui";
import { useViewStore } from "../stores/view";

const appWindow = getCurrentWindow();

async function minimizeWindow(): Promise<void> {
  await appWindow.minimize();
}

async function closeWindow(): Promise<void> {
  await appWindow.close();
}

export function Titlebar() {
  const setupComplete = useConfigStore((state) => state.setupComplete);
  const openSettings = useUiStore((state) => state.openSettings);
  const viewMode = useViewStore((state) => state.viewMode);
  const toggleViewMode = useViewStore((state) => state.toggleViewMode);

  const showsListIcon = viewMode === "grid";
  const toggleLabel = showsListIcon ? "Vue liste" : "Vue grille";

  return (
    <header
      data-tauri-drag-region
      className="flex h-9 w-full shrink-0 select-none items-center justify-between bg-surface px-2"
    >
      <div
        data-tauri-drag-region
        className="pointer-events-none flex items-center gap-2 pl-1"
      >
        <img
          src={logoUrl}
          alt="MNY Switcher"
          className="h-5 w-5 shrink-0 object-contain"
          draggable={false}
        />
      </div>
      <div className="flex items-center gap-1">
        {setupComplete && (
          <>
            <WindowButton onClick={toggleViewMode} label={toggleLabel} variant="neutral">
              {showsListIcon ? (
                <List className="h-2.5 w-2.5" strokeWidth={2.5} />
              ) : (
                <LayoutGrid className="h-2.5 w-2.5" strokeWidth={2.5} />
              )}
            </WindowButton>
            <WindowButton onClick={openSettings} label="Reglages" variant="neutral">
              <Settings className="h-2.5 w-2.5" strokeWidth={2.5} />
            </WindowButton>
          </>
        )}
        <WindowButton onClick={minimizeWindow} label="Minimiser" variant="neutral">
          <Minus className="h-2.5 w-2.5" strokeWidth={2.5} />
        </WindowButton>
        <WindowButton onClick={closeWindow} label="Fermer" variant="danger">
          <X className="h-2.5 w-2.5" strokeWidth={2.5} />
        </WindowButton>
      </div>
    </header>
  );
}

type WindowButtonProps = {
  onClick: () => void | Promise<void>;
  label: string;
  variant: "neutral" | "danger";
  children: React.ReactNode;
};

function WindowButton({ onClick, label, variant, children }: WindowButtonProps) {
  const hoverClasses =
    variant === "danger"
      ? "hover:bg-danger hover:text-white"
      : "hover:bg-surface-elevated hover:text-fg";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors duration-150 ${hoverClasses}`}
    >
      {children}
    </button>
  );
}
