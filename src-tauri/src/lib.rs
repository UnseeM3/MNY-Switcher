mod cache;
mod cleanup_gta;
mod commands;
mod enb;
mod fivem;
mod junction;
mod native;
mod pack;
mod rename;

use commands::{
    active_pack, check_setup, clean_gta_mods, cleanup_junctions, clear_fivem_cache, create_pack,
    delete_pack, detect_game_dir, ensure_native_pack, import_current_setup, inspect_path,
    is_fivem_running, launch_fivem, list_dir_entries, list_packs, migrate_legacy_default,
    open_folder, rename_pack, scan_gta_mods, switch_and_launch, switch_pack,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            list_packs,
            create_pack,
            delete_pack,
            rename_pack,
            switch_pack,
            active_pack,
            launch_fivem,
            switch_and_launch,
            detect_game_dir,
            cleanup_junctions,
            check_setup,
            import_current_setup,
            list_dir_entries,
            inspect_path,
            migrate_legacy_default,
            ensure_native_pack,
            open_folder,
            is_fivem_running,
            clear_fivem_cache,
            scan_gta_mods,
            clean_gta_mods,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
