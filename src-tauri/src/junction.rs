use std::fs;
use std::io;
use std::os::windows::fs::MetadataExt;
use std::path::{Path, PathBuf};

const FILE_ATTRIBUTE_REPARSE_POINT: u32 = 0x400;

const FILE_ATTRIBUTE_DIRECTORY: u32 = 0x10;

pub fn is_junction(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .map(|meta| meta.file_attributes() & FILE_ATTRIBUTE_REPARSE_POINT != 0)
        .unwrap_or(false)
}

pub fn target(path: &Path) -> Option<PathBuf> {
    fs::read_link(path).ok()
}

pub fn remove(link: &Path) -> io::Result<()> {
    fs::remove_dir(link).or_else(|_| junction::delete(link))
}

pub fn create(link: &Path, target: &Path) -> io::Result<()> {
    if is_junction(link) {
        remove(link)?;
    } else if is_empty_real_dir(link) {
        fs::remove_dir(link)?;
    } else if link.exists() {
        return Err(io::Error::new(
            io::ErrorKind::AlreadyExists,
            format!(
                "{} existe et contient des fichiers. Operation annulee pour proteger vos donnees.",
                link.display()
            ),
        ));
    }
    junction::create(target, link)
}

fn is_real_dir(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .map(|meta| {
            let attrs = meta.file_attributes();
            let is_dir = attrs & FILE_ATTRIBUTE_DIRECTORY != 0;
            let is_reparse = attrs & FILE_ATTRIBUTE_REPARSE_POINT != 0;
            is_dir && !is_reparse
        })
        .unwrap_or(false)
}

fn is_empty_real_dir(path: &Path) -> bool {
    if !is_real_dir(path) {
        return false;
    }
    fs::read_dir(path)
        .map(|mut it| it.next().is_none())
        .unwrap_or(false)
}
