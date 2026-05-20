use std::fs;
use std::io;
use std::path::Path;

use crate::junction;
use crate::native;
use crate::pack::{DEFAULT_PACK_NAME, PACK_SUBDIRS};

const LEGACY_DEFAULT_PACK_NAMES: [&str; 3] = ["Jeux sans modification", "default", "sans pack"];

pub fn migrate_legacy_default(packs_dir: &Path, game_dir: &Path) -> io::Result<()> {
    let new_root = packs_dir.join(DEFAULT_PACK_NAME);
    if new_root.exists() {
        return Ok(());
    }
    for legacy in LEGACY_DEFAULT_PACK_NAMES {
        let old_root = packs_dir.join(legacy);
        if old_root.exists() {
            return migrate_one(&old_root, &new_root, game_dir);
        }
    }
    Ok(())
}

fn migrate_one(old_root: &Path, new_root: &Path, game_dir: &Path) -> io::Result<()> {
    let needs_relink = PACK_SUBDIRS.iter().any(|sub| {
        junction::target(&game_dir.join(sub))
            .map(|t| t.starts_with(old_root))
            .unwrap_or(false)
    });

    if needs_relink {
        for sub in PACK_SUBDIRS {
            let link = game_dir.join(sub);
            if junction::is_junction(&link) {
                let _ = junction::remove(&link);
            }
        }
    }

    fs::rename(old_root, new_root)?;

    if needs_relink {
        for sub in PACK_SUBDIRS {
            let source = new_root.join(sub);
            fs::create_dir_all(&source)?;
            junction::create(&game_dir.join(sub), &source)?;
        }
    }
    native::install_markers(new_root)?;
    Ok(())
}
