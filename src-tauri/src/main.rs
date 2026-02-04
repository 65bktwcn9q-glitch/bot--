use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::net::{IpAddr, Ipv4Addr, SocketAddr, UdpSocket};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
struct LauncherSettings {
  gta_path: Option<String>,
  download_limit: Option<u64>,
  language: Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
struct Manifest {
  version: String,
  critical: bool,
  files: Vec<ManifestFile>
}

#[derive(Debug, Serialize, Deserialize)]
struct ManifestFile {
  path: String,
  size: u64,
  sha256: String
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct UpdatePayload {
  active: bool,
  title: String,
  progress: f32,
  current_file: String,
  speed: String,
  eta: String,
  required: bool,
  error: Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
struct ServerStatus {
  online: bool,
  ping: Option<u128>,
  players: u16,
  max_players: u16
}

fn settings_path() -> Result<PathBuf> {
  let config_dir = tauri::api::path::app_config_dir(&tauri::Config::default())
    .ok_or_else(|| anyhow!("Unable to resolve config directory"))?;
  fs::create_dir_all(&config_dir)?;
  Ok(config_dir.join("settings.json"))
}

fn log_path() -> Result<PathBuf> {
  let config_dir = tauri::api::path::app_config_dir(&tauri::Config::default())
    .ok_or_else(|| anyhow!("Unable to resolve config directory"))?;
  let log_dir = config_dir.join("logs");
  fs::create_dir_all(&log_dir)?;
  Ok(log_dir.join("updates.log"))
}

fn read_settings() -> Result<LauncherSettings> {
  let path = settings_path()?;
  if !path.exists() {
    return Ok(LauncherSettings::default());
  }
  let data = fs::read_to_string(path)?;
  Ok(serde_json::from_str(&data)?)
}

fn write_settings(settings: &LauncherSettings) -> Result<()> {
  let path = settings_path()?;
  let data = serde_json::to_string_pretty(settings)?;
  fs::write(path, data)?;
  Ok(())
}

fn append_log(message: &str) -> Result<()> {
  let path = log_path()?;
  let mut file = OpenOptions::new()
    .create(true)
    .append(true)
    .open(path)?;
  writeln!(file, "{}", message)?;
  Ok(())
}

#[tauri::command]
fn get_settings() -> Result<LauncherSettings, String> {
  read_settings().map_err(|err| err.to_string())
}

#[tauri::command]
fn update_settings(settings: LauncherSettings) -> Result<(), String> {
  write_settings(&settings).map_err(|err| err.to_string())
}

#[tauri::command]
fn detect_gta_path() -> Result<Option<String>, String> {
  if let Ok(settings) = read_settings() {
    if let Some(path) = settings.gta_path {
      if Path::new(&path).join("gta_sa.exe").exists() {
        return Ok(Some(path));
      }
    }
  }

  let candidates = [
    "C:\\Program Files (x86)\\Rockstar Games\\GTA San Andreas",
    "C:\\Program Files\\Rockstar Games\\GTA San Andreas",
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Grand Theft Auto San Andreas",
    "C:\\Program Files\\Steam\\steamapps\\common\\Grand Theft Auto San Andreas"
  ];

  for candidate in candidates {
    let exe_path = Path::new(candidate).join("gta_sa.exe");
    if exe_path.exists() {
      return Ok(Some(candidate.to_string()));
    }
  }

  Ok(None)
}

#[tauri::command]
fn set_gta_path(path: String) -> Result<(), String> {
  let mut settings = read_settings().map_err(|err| err.to_string())?;
  settings.gta_path = Some(path);
  write_settings(&settings).map_err(|err| err.to_string())
}

#[tauri::command]
async fn fetch_server_status(ip: String, port: u16) -> Result<ServerStatus, String> {
  let socket = UdpSocket::bind("0.0.0.0:0").map_err(|err| err.to_string())?;
  socket
    .set_read_timeout(Some(Duration::from_millis(1500)))
    .map_err(|err| err.to_string())?;

  let ip_addr: IpAddr = ip
    .parse()
    .unwrap_or(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));

  let mut packet = Vec::with_capacity(11);
  packet.extend_from_slice(b"SAMP");
  if let IpAddr::V4(ipv4) = ip_addr {
    packet.extend_from_slice(&ipv4.octets());
  }
  packet.push((port & 0xFF) as u8);
  packet.push((port >> 8) as u8);
  packet.push(b'i');

  let addr = SocketAddr::new(ip_addr, port);
  let start = Instant::now();
  socket
    .send_to(&packet, addr)
    .map_err(|err| err.to_string())?;

  let mut buffer = [0u8; 2048];
  let (size, _) = socket.recv_from(&mut buffer).map_err(|err| err.to_string())?;
  let ping = start.elapsed().as_millis();

  if size < 15 {
    return Ok(ServerStatus {
      online: false,
      ping: None,
      players: 0,
      max_players: 0
    });
  }

  let players = u16::from_le_bytes([buffer[11], buffer[12]]);
  let max_players = u16::from_le_bytes([buffer[13], buffer[14]]);

  Ok(ServerStatus {
    online: true,
    ping: Some(ping),
    players,
    max_players
  })
}

fn calculate_hash(path: &Path) -> Result<String> {
  let mut file = File::open(path)?;
  let mut hasher = Sha256::new();
  let mut buffer = [0u8; 8192];
  loop {
    let count = file.read(&mut buffer)?;
    if count == 0 {
      break;
    }
    hasher.update(&buffer[..count]);
  }
  Ok(format!("{:x}", hasher.finalize()))
}

async fn download_file(url: &str, dest: &Path, limit: Option<u64>) -> Result<()> {
  let response = reqwest::get(url).await?.error_for_status()?;
  let bytes = response.bytes().await?;

  if let Some(limit_kb) = limit {
    let limit_bytes = limit_kb * 1024;
    if bytes.len() as u64 > limit_bytes {
      tokio::time::sleep(Duration::from_millis(200)).await;
    }
  }

  if let Some(parent) = dest.parent() {
    fs::create_dir_all(parent)?;
  }
  fs::write(dest, &bytes)?;
  Ok(())
}

async fn ensure_gta_path() -> Result<PathBuf> {
  if let Some(path) = detect_gta_path().ok().flatten() {
    return Ok(PathBuf::from(path));
  }
  Err(anyhow!("GTA San Andreas not found. Please set path in settings."))
}

#[tauri::command]
async fn update_server(window: tauri::Window, server_id: String, base_url: String) -> Result<(), String> {
  let settings = read_settings().map_err(|err| err.to_string())?;
  let gta_path = ensure_gta_path().await.map_err(|err| err.to_string())?;

  let manifest_url = format!("{}/manifest.json", base_url.trim_end_matches('/'));
  let manifest: Manifest = reqwest::get(&manifest_url)
    .await
    .map_err(|err| err.to_string())?
    .json()
    .await
    .map_err(|err| err.to_string())?;

  let total_bytes: u64 = manifest.files.iter().map(|file| file.size).sum();
  let mut downloaded_bytes = 0u64;
  let start_time = Instant::now();

  append_log(&format!("Starting update for {} ({} files)", server_id, manifest.files.len()))
    .map_err(|err| err.to_string())?;

  for file in manifest.files {
    let dest_path = gta_path.join(&file.path);
    let needs_update = if dest_path.exists() {
      let hash = calculate_hash(&dest_path).unwrap_or_default();
      hash != file.sha256
    } else {
      true
    };

    if needs_update {
      let file_url = format!("{}/files/{}", base_url.trim_end_matches('/'), file.path);
      download_file(&file_url, &dest_path, settings.download_limit)
        .await
        .map_err(|err| err.to_string())?;
      append_log(&format!("Downloaded {}", file.path)).map_err(|err| err.to_string())?;
    }

    downloaded_bytes += file.size;
    let progress = (downloaded_bytes as f64 / total_bytes.max(1) as f64) * 100.0;
    let elapsed = start_time.elapsed().as_secs_f64().max(1.0);
    let speed = downloaded_bytes as f64 / elapsed;
    let remaining = total_bytes.saturating_sub(downloaded_bytes) as f64;
    let eta = if speed > 0.0 { remaining / speed } else { 0.0 };

    let payload = UpdatePayload {
      active: true,
      title: server_id.clone(),
      progress: progress as f32,
      current_file: file.path.clone(),
      speed: format!("{:.1} MB/s", speed / 1024.0 / 1024.0),
      eta: format!("ETA {:.0}s", eta),
      required: manifest.critical,
      error: None
    };

    window
      .emit("update-progress", payload)
      .map_err(|err| err.to_string())?;
  }

  append_log(&format!("Update completed for {}", server_id)).map_err(|err| err.to_string())?;

  let payload = UpdatePayload {
    active: false,
    title: server_id,
    progress: 100.0,
    current_file: "Completed".to_string(),
    speed: "".to_string(),
    eta: "".to_string(),
    required: false,
    error: None
  };
  window.emit("update-progress", payload).map_err(|err| err.to_string())?;

  Ok(())
}

#[tauri::command]
async fn verify_files(server_id: String, base_url: String) -> Result<(), String> {
  let gta_path = ensure_gta_path().await.map_err(|err| err.to_string())?;
  let manifest_url = format!("{}/manifest.json", base_url.trim_end_matches('/'));
  let manifest: Manifest = reqwest::get(&manifest_url)
    .await
    .map_err(|err| err.to_string())?
    .json()
    .await
    .map_err(|err| err.to_string())?;

  for file in manifest.files {
    let dest_path = gta_path.join(&file.path);
    if !dest_path.exists() {
      return Err(format!("Missing file: {}", file.path));
    }
    let hash = calculate_hash(&dest_path).map_err(|err| err.to_string())?;
    if hash != file.sha256 {
      return Err(format!("Hash mismatch: {}", file.path));
    }
  }

  append_log(&format!("Integrity verified for {}", server_id)).map_err(|err| err.to_string())?;
  Ok(())
}

#[tauri::command]
fn launch_game(ip: String, port: u16) -> Result<(), String> {
  let settings = read_settings().map_err(|err| err.to_string())?;
  let gta_path = settings
    .gta_path
    .map(PathBuf::from)
    .ok_or_else(|| "GTA path is not configured".to_string())?;

  let samp_exe = gta_path.join("samp.exe");
  let omp_exe = gta_path.join("omp.exe");

  let mut command = if samp_exe.exists() {
    std::process::Command::new(samp_exe)
  } else if omp_exe.exists() {
    std::process::Command::new(omp_exe)
  } else {
    return Err("Missing samp.exe or omp.exe. Install SA-MP or open.mp client.".to_string());
  };

  command.arg(ip).arg(port.to_string());
  command
    .current_dir(&gta_path)
    .spawn()
    .map_err(|err| err.to_string())?;

  Ok(())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_settings,
      update_settings,
      detect_gta_path,
      set_gta_path,
      fetch_server_status,
      update_server,
      verify_files,
      launch_game
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
