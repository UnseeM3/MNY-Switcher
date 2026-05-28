use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::winattr;

const COVER_BASENAME: &str = ".cover";
const ALLOWED_EXTENSIONS: [&str; 4] = ["png", "jpg", "jpeg", "webp"];

pub fn set(pack_root: &Path, source: &Path) -> io::Result<PathBuf> {
    if !pack_root.is_dir() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            "Le pack cible n'existe pas",
        ));
    }
    let extension = extract_extension(source)?;
    remove(pack_root)?;
    let destination = cover_path(pack_root, &extension);
    fs::copy(source, &destination)?;
    winattr::set_hidden(&destination)?;
    Ok(destination)
}

pub fn get(pack_root: &Path) -> Option<PathBuf> {
    ALLOWED_EXTENSIONS
        .iter()
        .map(|ext| cover_path(pack_root, ext))
        .find(|path| path.is_file())
}

pub fn remove(pack_root: &Path) -> io::Result<()> {
    for extension in ALLOWED_EXTENSIONS {
        let candidate = cover_path(pack_root, extension);
        if candidate.exists() {
            fs::remove_file(candidate)?;
        }
    }
    Ok(())
}

fn cover_path(pack_root: &Path, extension: &str) -> PathBuf {
    pack_root.join(format!("{}.{}", COVER_BASENAME, extension))
}

fn extract_extension(source: &Path) -> io::Result<String> {
    let raw = source
        .extension()
        .and_then(|ext| ext.to_str())
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "Extension manquante"))?;
    let normalized = raw.to_lowercase();
    if !ALLOWED_EXTENSIONS.contains(&normalized.as_str()) {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("Extension non supportee : {}", normalized),
        ));
    }
    Ok(normalized)
}
