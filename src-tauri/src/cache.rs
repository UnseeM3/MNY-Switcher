use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const FIVEM_APP_DIR_NAME: &str = "FiveM.app";
const CRASHES_DIR: &str = "crashes";
const DATA_DIR: &str = "data";
const GAME_STORAGE: &str = "game-storage";

pub fn clear_cache(game_dir: &Path) -> io::Result<()> {
    ensure_is_fivem_app(game_dir)?;
    remove_crashes(game_dir)?;
    clean_data_except_game_storage(game_dir)?;
    Ok(())
}

fn ensure_is_fivem_app(path: &Path) -> io::Result<()> {
    if !path.exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Dossier FiveM introuvable: {}", path.display()),
        ));
    }
    let name_ok = path
        .file_name()
        .map(|n| n.eq_ignore_ascii_case(FIVEM_APP_DIR_NAME))
        .unwrap_or(false);
    if !name_ok {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("Le chemin cible n'est pas FiveM.app: {}", path.display()),
        ));
    }
    Ok(())
}

fn remove_crashes(root: &Path) -> io::Result<()> {
    let crashes = root.join(CRASHES_DIR);
    if !crashes.exists() {
        return Ok(());
    }
    fs::remove_dir_all(&crashes)
}

fn clean_data_except_game_storage(root: &Path) -> io::Result<()> {
    let data = root.join(DATA_DIR);
    if !data.exists() {
        return Ok(());
    }
    for entry in fs::read_dir(&data)? {
        let entry = entry?;
        if entry.file_name().eq_ignore_ascii_case(GAME_STORAGE) {
            continue;
        }
        remove_entry(entry.path(), entry.file_type()?)?;
    }
    Ok(())
}

fn remove_entry(path: PathBuf, file_type: fs::FileType) -> io::Result<()> {
    if file_type.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    }
}
