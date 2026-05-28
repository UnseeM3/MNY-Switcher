export type Pack = {
  name: string;
  coverPath: string | null;
};

export type Config = {
  fivemExe: string;
  gta5Exe: string;
  gta5Dir: string;
  gameDir: string;
  packsDir: string;
  setupComplete: boolean;
};

export type SetupInfo = {
  hasRealMods: boolean;
  hasRealPlugins: boolean;
  modsIsJunction: boolean;
  pluginsIsJunction: boolean;
  modsTarget: string | null;
  pluginsTarget: string | null;
};
