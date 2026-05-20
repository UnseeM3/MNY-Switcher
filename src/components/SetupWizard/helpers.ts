import { open } from "@tauri-apps/plugin-dialog";
import { api } from "../../api/tauri";
import { DEFAULT_PACK_NAME } from "../../constants";
import type { Step } from "./types";

export type AdvanceContext = {
  step: Step;
  fivemExe: string;
  gta5Exe: string;
  packsDir: string;
  importName: string;
};

export function canAdvance({ step, fivemExe, gta5Exe, packsDir, importName }: AdvanceContext): boolean {
  if (step === 1) return !!fivemExe && !!gta5Exe;
  if (step === 2) return !!packsDir;
  return !!importName.trim();
}

export async function ensureDefaultPack(packsDir: string): Promise<void> {
  const packs = await api.listPacks(packsDir);
  if (!packs.some((p) => p.name === DEFAULT_PACK_NAME)) {
    await api.createPack(packsDir, DEFAULT_PACK_NAME, false);
  }
}

export async function pickExe(onPick: (path: string) => void): Promise<void> {
  const result = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Executable", extensions: ["exe"] }],
  });
  if (typeof result === "string") onPick(result);
}

export async function pickPacksDir(onPick: (path: string) => void): Promise<void> {
  const result = await open({ multiple: false, directory: true });
  if (typeof result === "string") onPick(result);
}
