use std::fs;
use std::io;
use std::path::Path;

use crate::junction;
use crate::pack::{DEFAULT_PACK_NAME, PACK_SUBDIRS};
use crate::winattr;

pub const MARKER_FILENAME: &str = ".mny-native";

pub fn install_markers(pack_root: &Path) -> io::Result<()> {
    fs::write(pack_root.join(MARKER_FILENAME), "")?;
    winattr::set_hidden(pack_root)
}

pub fn has_marker(pack_root: &Path) -> bool {
    pack_root.join(MARKER_FILENAME).exists()
}

pub fn ensure_native_pack(packs_dir: &Path, game_dir: &Path) -> io::Result<()> {
    if let Some(name) = find_misnamed_native(packs_dir)? {
        return rename_back_to_native(packs_dir, game_dir, &name);
    }
    let native_path = packs_dir.join(DEFAULT_PACK_NAME);
    if native_path.exists() && !has_marker(&native_path) {
        install_markers(&native_path)?;
    }
    Ok(())
}

fn find_misnamed_native(packs_dir: &Path) -> io::Result<Option<String>> {
    if !packs_dir.exists() {
        return Ok(None);
    }
    for entry in fs::read_dir(packs_dir)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().into_owned();
        if name != DEFAULT_PACK_NAME && has_marker(&entry.path()) {
            return Ok(Some(name));
        }
    }
    Ok(None)
}

fn rename_back_to_native(packs_dir: &Path, game_dir: &Path, old_name: &str) -> io::Result<()> {
    let old_root = packs_dir.join(old_name);
    let new_root = packs_dir.join(DEFAULT_PACK_NAME);
    if new_root.exists() {
        return Ok(());
    }
    let relink = junctions_point_to(game_dir, &old_root);
    if relink {
        remove_junctions(game_dir);
    }
    fs::rename(&old_root, &new_root)?;
    if relink {
        recreate_junctions(&new_root, game_dir)?;
    }
    install_markers(&new_root)
}

fn junctions_point_to(game_dir: &Path, target: &Path) -> bool {
    PACK_SUBDIRS.iter().any(|sub| {
        junction::target(&game_dir.join(sub))
            .map(|t| t.starts_with(target))
            .unwrap_or(false)
    })
}

fn remove_junctions(game_dir: &Path) {
    for sub in PACK_SUBDIRS {
        let link = game_dir.join(sub);
        if junction::is_junction(&link) {
            let _ = junction::remove(&link);
        }
    }
}

fn recreate_junctions(pack_root: &Path, game_dir: &Path) -> io::Result<()> {
    for sub in PACK_SUBDIRS {
        let source = pack_root.join(sub);
        fs::create_dir_all(&source)?;
        junction::create(&game_dir.join(sub), &source)?;
    }
    Ok(())
}

