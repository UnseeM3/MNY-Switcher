use std::io;
use std::path::Path;
use std::process::Command;

pub fn set_hidden(path: &Path) -> io::Result<()> {
    let status = Command::new("attrib")
        .args(["+H", &path.to_string_lossy()])
        .status()?;
    if !status.success() {
        return Err(io::Error::new(io::ErrorKind::Other, "attrib +H a echoue"));
    }
    Ok(())
}
