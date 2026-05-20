import { useEffect } from "react";

export function useBlockContextMenu(): void {
  useEffect(() => {
    function handleContextMenu(event: MouseEvent): void {
      if (event.defaultPrevented) return;
      event.preventDefault();
    }

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);
}
