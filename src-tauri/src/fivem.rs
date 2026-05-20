use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;

use crate::junction;

const GAME_SUBDIR: &str = "FiveM.app";

pub fn detect_game_dir(exe_path: &Path) -> PathBuf {
    let parent = exe_path
        .parent()
        .map(PathBuf::from)
        .unwrap_or_else(PathBuf::new);
    let app_dir = parent.join(GAME_SUBDIR);

    let app_exists = app_dir.exists();
    if app_exists && has_content(&app_dir) {
        return app_dir;
    }
    if has_content(&parent) {
        return parent;
    }
    if app_exists && has_junctions(&app_dir) {
        return app_dir;
    }
    if has_junctions(&parent) {
        return parent;
    }
    if app_exists {
        app_dir
    } else {
        parent
    }
}

fn has_content(dir: &Path) -> bool {
    is_nonempty_real_dir(&dir.join("mods")) || is_nonempty_real_dir(&dir.join("plugins"))
}

fn has_junctions(dir: &Path) -> bool {
    junction::is_junction(&dir.join("mods")) || junction::is_junction(&dir.join("plugins"))
}

pub fn is_nonempty_real_dir(path: &Path) -> bool {
    if !path.exists() || !path.is_dir() || junction::is_junction(path) {
        return false;
    }
    fs::read_dir(path)
        .ok()
        .and_then(|mut iter| iter.next())
        .is_some()
}

pub fn launch(exe_path: &Path) -> io::Result<()> {
    if !exe_path.exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Executable FiveM introuvable: {}", exe_path.display()),
        ));
    }
    Command::new(exe_path).spawn().map(|_| ())
}

pub fn open_folder_in_explorer(path: &Path) -> io::Result<()> {
    Command::new("explorer").arg(path).spawn().map(|_| ())
}

pub fn is_running(exe_path: &Path) -> bool {
    let exe_name = exe_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    if exe_name.is_empty() {
        return false;
    }
    let mut sys = sysinfo::System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
    sys.processes()
        .values()
        .any(|p| p.name().to_string_lossy().eq_ignore_ascii_case(&exe_name))
}
