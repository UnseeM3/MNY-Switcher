use serde::Serialize;
use std::fs;
use std::os::windows::fs::MetadataExt;
use std::path::Path;

const FILE_ATTRIBUTE_REPARSE_POINT: u32 = 0x400;
const FILE_ATTRIBUTE_DIRECTORY: u32 = 0x10;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PathInspection {
    pub path: String,
    pub exists: bool,
    pub metadata_ok: bool,
    pub symlink_metadata_ok: bool,
    pub symlink_error: Option<String>,
    pub metadata_error: Option<String>,
    pub is_file: bool,
    pub is_dir_follow: bool,
    pub is_dir_attr: bool,
    pub is_reparse_attr: bool,
    pub attributes_hex: String,
    pub target: Option<String>,
}

pub fn inspect(path: &Path) -> PathInspection {
    let display = path.display().to_string();
    let symlink_meta = fs::symlink_metadata(path);
    let meta = fs::metadata(path);

    let symlink_error = symlink_meta.as_ref().err().map(|e| e.to_string());
    let metadata_error = meta.as_ref().err().map(|e| e.to_string());

    let attrs = symlink_meta
        .as_ref()
        .map(|m| m.file_attributes())
        .unwrap_or(0);

    PathInspection {
        path: display,
        exists: path.exists(),
        metadata_ok: meta.is_ok(),
        symlink_metadata_ok: symlink_meta.is_ok(),
        symlink_error,
        metadata_error,
        is_file: path.is_file(),
        is_dir_follow: path.is_dir(),
        is_dir_attr: attrs & FILE_ATTRIBUTE_DIRECTORY != 0,
        is_reparse_attr: attrs & FILE_ATTRIBUTE_REPARSE_POINT != 0,
        attributes_hex: format!("0x{:x}", attrs),
        target: fs::read_link(path).ok().map(|p| p.display().to_string()),
    }
}
