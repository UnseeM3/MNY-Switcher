import { invoke } from "@tauri-apps/api/core";
import type { Pack, SetupInfo } from "../types";

export const api = {
  listPacks: (packsDir: string) =>
    invoke<Pack[]>("list_packs", { packsDir }),
  createPack: (packsDir: string, name: string, withEnb: boolean) =>
    invoke<void>("create_pack", { packsDir, name, withEnb }),
  deletePack: (packsDir: string, name: string) =>
    invoke<void>("delete_pack", { packsDir, name }),
  renamePack: (packsDir: string, gameDir: string, oldName: string, newName: string) =>
    invoke<void>("rename_pack", { packsDir, gameDir, oldName, newName }),
  switchPack: (gameDir: string, packsDir: string, packName: string, gta5Dir: string) =>
    invoke<void>("switch_pack", { gameDir, packsDir, packName, gta5Dir }),
  activePack: (gameDir: string, packsDir: string) =>
    invoke<string | null>("active_pack", { gameDir, packsDir }),
  launchFivem: (fivemExe: string) =>
    invoke<void>("launch_fivem", { fivemExe }),
  switchAndLaunch: (
    gameDir: string,
    fivemExe: string,
    packsDir: string,
    packName: string,
    gta5Dir: string,
  ) =>
    invoke<void>("switch_and_launch", {
      gameDir,
      fivemExe,
      packsDir,
      packName,
      gta5Dir,
    }),
  detectGameDir: (fivemExe: string) =>
    invoke<string>("detect_game_dir", { fivemExe }),
  cleanupJunctions: (dir: string) =>
    invoke<void>("cleanup_junctions", { dir }),
  checkSetup: (gameDir: string) =>
    invoke<SetupInfo>("check_setup", { gameDir }),
  importCurrentSetup: (gameDir: string, packsDir: string, baseName: string) =>
    invoke<string>("import_current_setup", { gameDir, packsDir, baseName }),
  listDirEntries: (dir: string) =>
    invoke<string[]>("list_dir_entries", { dir }),
  inspectPath: (path: string) =>
    invoke<PathInspection>("inspect_path", { path }),
  migrateLegacyDefault: (packsDir: string, gameDir: string) =>
    invoke<void>("migrate_legacy_default", { packsDir, gameDir }),
  ensureNativePack: (packsDir: string, gameDir: string) =>
    invoke<void>("ensure_native_pack", { packsDir, gameDir }),
  openFolder: (path: string) =>
    invoke<void>("open_folder", { path }),
  isFivemRunning: (fivemExe: string) =>
    invoke<boolean>("is_fivem_running", { fivemExe }),
  clearFivemCache: (gameDir: string) =>
    invoke<void>("clear_fivem_cache", { gameDir }),
  scanGtaMods: (gta5Dir: string) =>
    invoke<GtaModEntry[]>("scan_gta_mods", { gta5Dir }),
  cleanGtaMods: (gta5Dir: string) =>
    invoke<number>("clean_gta_mods", { gta5Dir }),
};

export type GtaModEntry = {
  name: string;
  isDir: boolean;
};

export type PathInspection = {
  path: string;
  exists: boolean;
  metadataOk: boolean;
  symlinkMetadataOk: boolean;
  symlinkError: string | null;
  metadataError: string | null;
  isFile: boolean;
  isDirFollow: boolean;
  isDirAttr: boolean;
  isReparseAttr: boolean;
  attributesHex: string;
  target: string | null;
};
