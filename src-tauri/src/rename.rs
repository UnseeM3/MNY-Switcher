use std::fs;
use std::io;
use std::path::Path;

use crate::pack::DEFAULT_PACK_NAME;

pub fn rename_pack(packs_dir: &Path, old_name: &str, new_name: &str) -> io::Result<()> {
    let trimmed = new_name.trim();
    validate_name(old_name, trimmed)?;
    if trimmed == old_name {
        return Ok(());
    }
    validate_paths(packs_dir, old_name, trimmed)?;
    fs::rename(packs_dir.join(old_name), packs_dir.join(trimmed))
}

fn validate_name(old_name: &str, new_name: &str) -> io::Result<()> {
    if new_name.is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "Le nouveau nom ne peut pas etre vide",
        ));
    }
    if old_name == DEFAULT_PACK_NAME || new_name == DEFAULT_PACK_NAME {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            format!("Le pack '{}' ne peut pas etre renomme", DEFAULT_PACK_NAME),
        ));
    }
    Ok(())
}

fn validate_paths(packs_dir: &Path, old_name: &str, new_name: &str) -> io::Result<()> {
    if !packs_dir.join(old_name).exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Le pack '{}' n'existe pas", old_name),
        ));
    }
    if packs_dir.join(new_name).exists() {
        return Err(io::Error::new(
            io::ErrorKind::AlreadyExists,
            format!("Un pack nomme '{}' existe deja", new_name),
        ));
    }
    Ok(())
}
