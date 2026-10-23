const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let sidecar;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 720, title: "Singularity Walker",
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  setTimeout(() => { mainWindow.loadURL("http://localhost:8000"); }, 3500);
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  console.log("[SYSTEM] Initializing Sidecar Engine...");
  
  // АВТО-ОПРЕДЕЛЕНИЕ: если Windows - ищем .exe, иначе .bin
  const isWin = process.platform === "win32";
  const binaryName = isWin ? "server.exe" : "server.bin";
  const binaryPath = path.join(process.resourcesPath, "bin", binaryName);
  
  console.log("[DEBUG] Target binary:", binaryPath);

  sidecar = spawn(binaryPath, [], {
    cwd: path.join(process.resourcesPath, "bin"),
    stdio: "ignore"
  });

  sidecar.on("error", (err) => { console.error("[CRITICAL] Spawn error:", err); });
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (sidecar) sidecar.kill();
    app.quit();
  }
});

app.on("will-quit", () => { if (sidecar) sidecar.kill(); });
