import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "list" | "grid";

type ViewState = {
  viewMode: ViewMode;
  toggleViewMode: () => void;
};

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: "list",
      toggleViewMode: () =>
        set((state) => ({ viewMode: state.viewMode === "list" ? "grid" : "list" })),
    }),
    { name: "mny-switcher-view-v1" },
  ),
);
