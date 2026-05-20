import { create } from "zustand";
import { api } from "../api/tauri";
import type { Pack } from "../types";

type PacksState = {
  packs: Pack[];
  activePackName: string | null;
  loading: boolean;
  error: string | null;
  refresh: (gameDir: string, packsDir: string) => Promise<void>;
};

export const usePacksStore = create<PacksState>((set) => ({
  packs: [],
  activePackName: null,
  loading: false,
  error: null,
  refresh: async (gameDir, packsDir) => {
    set({ loading: true, error: null });
    try {
      if (gameDir) {
        await api.ensureNativePack(packsDir, gameDir).catch(() => undefined);
      }
      const [packs, active] = await Promise.all([
        api.listPacks(packsDir),
        gameDir ? api.activePack(gameDir, packsDir) : Promise.resolve(null),
      ]);
      set({ packs, activePackName: active, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },
}));
