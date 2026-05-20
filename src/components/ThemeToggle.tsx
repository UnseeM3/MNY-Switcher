import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../stores/theme";
import { Tooltip } from "./Tooltip";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";
  const tooltipLabel = isDark ? "Mode clair" : "Mode sombre";

  return (
    <Tooltip label={tooltipLabel} side="top">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tooltipLabel}
        className="group flex h-7 w-7 items-center justify-center text-fg-muted transition-colors duration-150 hover:bg-surface-elevated hover:text-accent"
      >
        <span className="transition-transform duration-200 group-hover:scale-125 group-active:scale-90">
          {isDark ? (
            <Sun className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <Moon className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </span>
      </button>
    </Tooltip>
  );
}
