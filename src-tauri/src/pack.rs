use serde::Serialize;
use std::fs;
use std::io;
use std::path::Path;

use crate::enb;
use crate::fivem;
use crate::junction;
use crate::native;

pub mod inspect;
pub mod migrate;

pub use inspect::{inspect, PathInspection};
pub use migrate::migrate_legacy_default;

pub const PACK_SUBDIRS: [&str; 2] = ["mods", "plugins"];
const PACK_ENB_DIR: &str = "enb";

pub const DEFAULT_PACK_NAME: &str = "Natif";

#[derive(Serialize)]
pub struct Pack {
    pub name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetupInfo {
    pub has_real_mods: bool,
    pub has_real_plugins: bool,
    pub mods_is_junction: bool,
    pub plugins_is_junction: bool,
    pub mods_target: Option<String>,
    pub plugins_target: Option<String>,
}

pub fn list(packs_dir: &Path) -> io::Result<Vec<Pack>> {
    if !packs_dir.exists() {
        return Ok(Vec::new());
    }
    let mut packs: Vec<Pack> = fs::read_dir(packs_dir)?
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().map(|t| t.is_dir()).unwrap_or(false))
        .map(|entry| Pack {
            name: entry.file_name().to_string_lossy().into_owned(),
        })
        .collect();
    sort_with_default_first(&mut packs);
    Ok(packs)
}

fn sort_with_default_first(packs: &mut [Pack]) {
    packs.sort_by(|a, b| {
        let a_default = a.name == DEFAULT_PACK_NAME;
        let b_default = b.name == DEFAULT_PACK_NAME;
        match (a_default, b_default) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });
}

pub fn create(packs_dir: &Path, name: &str, with_enb: bool) -> io::Result<()> {
    let pack_root = packs_dir.join(name);
    if pack_root.exists() {
        return Err(io::Error::new(
            io::ErrorKind::AlreadyExists,
            format!("Le pack '{}' existe deja", name),
        ));
    }
    for sub in PACK_SUBDIRS {
        fs::create_dir_all(pack_root.join(sub))?;
    }
    if with_enb {
        fs::create_dir_all(pack_root.join(PACK_ENB_DIR))?;
    }
    if name == DEFAULT_PACK_NAME {
        native::install_markers(&pack_root)?;
    }
    Ok(())
}

pub fn delete(packs_dir: &Path, name: &str) -> io::Result<()> {
    let pack_root = packs_dir.join(name);
    if !pack_root.exists() {
        return Ok(());
    }
    fs::remove_dir_all(pack_root)
}

pub fn switch(
    game_dir: &Path,
    packs_dir: &Path,
    pack_name: &str,
    gta5_dir: &Path,
) -> io::Result<()> {
    let pack_root = packs_dir.join(pack_name);
    if !pack_root.exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Le pack '{}' n'existe pas", pack_name),
        ));
    }
    enb::uninstall(gta5_dir)?;
    for sub in PACK_SUBDIRS {
        let source = pack_root.join(sub);
        fs::create_dir_all(&source)?;
        let link = game_dir.join(sub);
        junction::create(&link, &source)?;
    }
    enb::install(&pack_root.join(PACK_ENB_DIR), gta5_dir, pack_name)?;
    Ok(())
}

pub fn active(game_dir: &Path, packs_dir: &Path) -> Option<String> {
    let link = game_dir.join(PACK_SUBDIRS[0]);
    let target = junction::target(&link)?;
    let packs_canonical = packs_dir.canonicalize().ok()?;
    let target_canonical = target.canonicalize().ok()?;
    let relative = target_canonical.strip_prefix(&packs_canonical).ok()?;
    relative
        .components()
        .next()
        .map(|c| c.as_os_str().to_string_lossy().into_owned())
}

pub fn cleanup_junctions(dir: &Path) -> io::Result<()> {
    for sub in PACK_SUBDIRS {
        let link = dir.join(sub);
        if link.exists() && junction::is_junction(&link) {
            junction::remove(&link)?;
        }
    }
    Ok(())
}

pub fn check_setup(game_dir: &Path) -> SetupInfo {
    let mods = game_dir.join(PACK_SUBDIRS[0]);
    let plugins = game_dir.join(PACK_SUBDIRS[1]);
    SetupInfo {
        has_real_mods: fivem::is_nonempty_real_dir(&mods),
        has_real_plugins: fivem::is_nonempty_real_dir(&plugins),
        mods_is_junction: junction::is_junction(&mods),
        plugins_is_junction: junction::is_junction(&plugins),
        mods_target: junction::target(&mods).map(|p| p.display().to_string()),
        plugins_target: junction::target(&plugins).map(|p| p.display().to_string()),
    }
}

fn is_real_dir(path: &Path) -> bool {
    path.exists() && path.is_dir() && !junction::is_junction(path)
}

pub fn import_current(
    game_dir: &Path,
    packs_dir: &Path,
    base_name: &str,
) -> io::Result<String> {
    let name = find_unique_pack_name(packs_dir, base_name);
    let pack_root = packs_dir.join(&name);
    fs::create_dir_all(&pack_root)?;

    for sub in PACK_SUBDIRS {
        let link = game_dir.join(sub);
        let dst = pack_root.join(sub);
        import_one_subdir(&link, &dst)?;
        junction::create(&link, &dst)?;
    }
    Ok(name)
}

fn import_one_subdir(link: &Path, dst: &Path) -> io::Result<()> {
    if is_real_dir(link) {
        fs::rename(link, dst)?;
        return Ok(());
    }
    if junction::is_junction(link) {
        if let Some(target) = junction::target(link) {
            if target.exists() && target.is_dir() {
                junction::remove(link)?;
                fs::rename(&target, dst)?;
                return Ok(());
            }
        }
        junction::remove(link)?;
    }
    fs::create_dir_all(dst)
}

fn find_unique_pack_name(packs_dir: &Path, base: &str) -> String {
    if !packs_dir.join(base).exists() {
        return base.to_string();
    }
    let mut i = 1;
    loop {
        let candidate = format!("{}-{}", base, i);
        if !packs_dir.join(&candidate).exists() {
            return candidate;
        }
        i += 1;
    }
}
