import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Config } from "../types";

type ConfigState = Config & {
  setConfig: (partial: Partial<Config>) => void;
  markSetupComplete: () => void;
  reset: () => void;
};

const INITIAL_CONFIG: Config = {
  fivemExe: "",
  gta5Exe: "",
  gta5Dir: "",
  gameDir: "",
  packsDir: "",
  setupComplete: false,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...INITIAL_CONFIG,
      setConfig: (partial) => set((state) => ({ ...state, ...partial })),
      markSetupComplete: () => set({ setupComplete: true }),
      reset: () => set(INITIAL_CONFIG),
    }),
    {
      name: "mny-switcher-config-v8",
    },
  ),
);
