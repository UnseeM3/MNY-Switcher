use std::path::PathBuf;

use crate::cache;
use crate::cleanup_gta;
use crate::fivem;
use crate::native;
use crate::pack::{self, Pack, SetupInfo};
use crate::rename;

#[tauri::command]
pub fn list_packs(packs_dir: PathBuf) -> Result<Vec<Pack>, String> {
    pack::list(&packs_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_pack(packs_dir: PathBuf, name: String, with_enb: bool) -> Result<(), String> {
    pack::create(&packs_dir, &name, with_enb).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_pack(packs_dir: PathBuf, name: String) -> Result<(), String> {
    pack::delete(&packs_dir, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_pack(
    packs_dir: PathBuf,
    game_dir: PathBuf,
    old_name: String,
    new_name: String,
) -> Result<(), String> {
    if pack::active(&game_dir, &packs_dir).as_deref() == Some(old_name.as_str()) {
        return Err("Le pack actif ne peut pas etre renomme".into());
    }
    rename::rename_pack(&packs_dir, &old_name, &new_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn switch_pack(
    game_dir: PathBuf,
    packs_dir: PathBuf,
    pack_name: String,
    gta5_dir: PathBuf,
) -> Result<(), String> {
    pack::switch(&game_dir, &packs_dir, &pack_name, &gta5_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn active_pack(game_dir: PathBuf, packs_dir: PathBuf) -> Option<String> {
    pack::active(&game_dir, &packs_dir)
}

#[tauri::command]
pub fn launch_fivem(fivem_exe: PathBuf) -> Result<(), String> {
    fivem::launch(&fivem_exe).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_folder(path: PathBuf) -> Result<(), String> {
    fivem::open_folder_in_explorer(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn is_fivem_running(fivem_exe: PathBuf) -> bool {
    fivem::is_running(&fivem_exe)
}

#[tauri::command]
pub fn switch_and_launch(
    game_dir: PathBuf,
    fivem_exe: PathBuf,
    packs_dir: PathBuf,
    pack_name: String,
    gta5_dir: PathBuf,
) -> Result<(), String> {
    pack::switch(&game_dir, &packs_dir, &pack_name, &gta5_dir).map_err(|e| e.to_string())?;
    fivem::launch(&fivem_exe).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn detect_game_dir(fivem_exe: PathBuf) -> PathBuf {
    fivem::detect_game_dir(&fivem_exe)
}

#[tauri::command]
pub fn cleanup_junctions(dir: PathBuf) -> Result<(), String> {
    pack::cleanup_junctions(&dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_setup(game_dir: PathBuf) -> SetupInfo {
    pack::check_setup(&game_dir)
}

#[tauri::command]
pub fn import_current_setup(
    game_dir: PathBuf,
    packs_dir: PathBuf,
    base_name: String,
) -> Result<String, String> {
    pack::import_current(&game_dir, &packs_dir, &base_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_dir_entries(dir: PathBuf) -> Result<Vec<String>, String> {
    let read = std::fs::read_dir(&dir)
        .map_err(|e| format!("read_dir({}): {}", dir.display(), e))?;
    let entries: Vec<String> = read
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect();
    Ok(entries)
}

#[tauri::command]
pub fn inspect_path(path: PathBuf) -> PathInspection {
    pack::inspect(&path)
}

#[tauri::command]
pub fn migrate_legacy_default(packs_dir: PathBuf, game_dir: PathBuf) -> Result<(), String> {
    pack::migrate_legacy_default(&packs_dir, &game_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ensure_native_pack(packs_dir: PathBuf, game_dir: PathBuf) -> Result<(), String> {
    native::ensure_native_pack(&packs_dir, &game_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_fivem_cache(game_dir: PathBuf) -> Result<(), String> {
    cache::clear_cache(&game_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn scan_gta_mods(gta5_dir: PathBuf) -> Result<Vec<cleanup_gta::GtaModEntry>, String> {
    cleanup_gta::scan(&gta5_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clean_gta_mods(gta5_dir: PathBuf) -> Result<usize, String> {
    cleanup_gta::clean(&gta5_dir).map_err(|e| e.to_string())
}

pub use crate::pack::PathInspection;
