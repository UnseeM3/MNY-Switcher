use serde::Serialize;
use std::fs;
use std::io;
use std::path::Path;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GtaModEntry {
    pub name: String,
    pub is_dir: bool,
}

const GTA5_EXE: &str = "GTA5.exe";

const WHITELIST_FILES: [&str; 48] = [
    "bink2w64.dll",
    "common.rpf",
    "d3dcompiler_46.dll",
    "d3dcsx_46.dll",
    "fvad.dll",
    "GFSDK_ShadowLib.win64.dll",
    "GFSDK_TXAA.win64.dll",
    "GFSDK_TXAA_AlphaResolve.win64.dll",
    "GPUPerfAPIDX11-x64.dll",
    "GTA5.exe",
    "GTA5_BE.exe",
    "GTAVLanguageSelect.exe",
    "GTAVLauncher.exe",
    "index.bin",
    "libcurl.dll",
    "libtox.dll",
    "NvPmApi.Core.win64.dll",
    "opus.dll",
    "opusenc.dll",
    "PlayGTAV.exe",
    "title.rgl",
    "version.txt",
    "versioninfo.txt",
    "x64a.rpf",
    "x64b.rpf",
    "x64c.rpf",
    "x64d.rpf",
    "x64e.rpf",
    "x64f.rpf",
    "x64g.rpf",
    "x64h.rpf",
    "x64i.rpf",
    "x64j.rpf",
    "x64k.rpf",
    "x64l.rpf",
    "x64m.rpf",
    "x64n.rpf",
    "x64o.rpf",
    "x64p.rpf",
    "x64q.rpf",
    "x64r.rpf",
    "x64s.rpf",
    "x64t.rpf",
    "x64u.rpf",
    "x64v.rpf",
    "x64w.rpf",
    "XCurl.dll",
    "zlib1.dll",
];

const WHITELIST_DIRS: [&str; 4] = ["BattlEye", "Redistributables", "update", "x64"];

pub fn scan(gta5_dir: &Path) -> io::Result<Vec<GtaModEntry>> {
    ensure_is_gta5_dir(gta5_dir)?;
    let mut extras = Vec::new();
    for entry in fs::read_dir(gta5_dir)? {
        let entry = entry?;
        if is_whitelisted(&entry)? {
            continue;
        }
        extras.push(GtaModEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            is_dir: entry.file_type()?.is_dir(),
        });
    }
    extras.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(extras)
}

pub fn clean(gta5_dir: &Path) -> io::Result<usize> {
    let extras = scan(gta5_dir)?;
    let count = extras.len();
    for entry in extras {
        remove_path(&gta5_dir.join(&entry.name))?;
    }
    Ok(count)
}

fn remove_path(path: &Path) -> io::Result<()> {
    if path.is_dir() {
        fs::remove_dir_all(path)
    } else {
        fs::remove_file(path)
    }
}

fn is_whitelisted(entry: &fs::DirEntry) -> io::Result<bool> {
    let name = entry.file_name();
    let name_str = name.to_string_lossy();
    if entry.file_type()?.is_dir() {
        return Ok(WHITELIST_DIRS
            .iter()
            .any(|d| name_str.eq_ignore_ascii_case(d)));
    }
    Ok(WHITELIST_FILES
        .iter()
        .any(|f| name_str.eq_ignore_ascii_case(f)))
}

fn ensure_is_gta5_dir(path: &Path) -> io::Result<()> {
    if !path.exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Dossier GTA V introuvable: {}", path.display()),
        ));
    }
    if !path.join(GTA5_EXE).exists() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("GTA5.exe absent dans: {}", path.display()),
        ));
    }
    Ok(())
}
