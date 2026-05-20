use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::Path;

const MANIFEST_FILENAME: &str = ".mny-enb-manifest.json";

#[derive(Serialize, Deserialize)]
pub struct Manifest {
    pub pack: String,
    pub files: Vec<String>,
}

pub fn has_content(dir: &Path) -> bool {
    if !dir.exists() || !dir.is_dir() {
        return false;
    }
    fs::read_dir(dir)
        .ok()
        .and_then(|mut iter| iter.next())
        .is_some()
}

pub fn install(pack_enb_dir: &Path, gta5_dir: &Path, pack_name: &str) -> io::Result<()> {
    if !has_content(pack_enb_dir) {
        return Ok(());
    }
    let entries = top_level_entries(pack_enb_dir)?;
    check_no_conflict(gta5_dir, &entries)?;
    copy_all(pack_enb_dir, gta5_dir, &entries)?;
    let manifest = Manifest {
        pack: pack_name.to_string(),
        files: entries,
    };
    write_manifest(gta5_dir, &manifest)
}

pub fn uninstall(gta5_dir: &Path) -> io::Result<()> {
    let manifest = match read_manifest(gta5_dir) {
        Some(m) => m,
        None => return Ok(()),
    };
    remove_entries(gta5_dir, &manifest.files)?;
    let manifest_path = gta5_dir.join(MANIFEST_FILENAME);
    if manifest_path.exists() {
        fs::remove_file(&manifest_path)?;
    }
    Ok(())
}

fn top_level_entries(dir: &Path) -> io::Result<Vec<String>> {
    let mut names = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        names.push(entry.file_name().to_string_lossy().into_owned());
    }
    Ok(names)
}

fn check_no_conflict(gta5_dir: &Path, entries: &[String]) -> io::Result<()> {
    for name in entries {
        let path = gta5_dir.join(name);
        if path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                format!(
                    "Fichier ENB deja present: {}. Verifie que GTA5 est propre.",
                    path.display()
                ),
            ));
        }
    }
    Ok(())
}

fn copy_all(src_dir: &Path, dst_dir: &Path, entries: &[String]) -> io::Result<()> {
    for name in entries {
        let src = src_dir.join(name);
        let dst = dst_dir.join(name);
        if src.is_dir() {
            copy_dir_recursive(&src, &dst)?;
        } else {
            fs::copy(&src, &dst)?;
        }
    }
    Ok(())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}

fn remove_entries(gta5_dir: &Path, entries: &[String]) -> io::Result<()> {
    for name in entries {
        let path = gta5_dir.join(name);
        if !path.exists() {
            continue;
        }
        if path.is_dir() {
            fs::remove_dir_all(&path)?;
        } else {
            fs::remove_file(&path)?;
        }
    }
    Ok(())
}

fn read_manifest(gta5_dir: &Path) -> Option<Manifest> {
    let path = gta5_dir.join(MANIFEST_FILENAME);
    let content = fs::read_to_string(&path).ok()?;
    serde_json::from_str(&content).ok()
}

fn write_manifest(gta5_dir: &Path, manifest: &Manifest) -> io::Result<()> {
    let path = gta5_dir.join(MANIFEST_FILENAME);
    let json = serde_json::to_string_pretty(manifest)
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
    fs::write(&path, json)
}
