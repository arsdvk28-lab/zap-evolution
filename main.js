const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let sidecar;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1280, height: 720, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  setTimeout(() => { mainWindow.loadURL("http://localhost:8000"); }, 3500);
}

app.whenReady().then(() => {
  const binaryPath = path.join(process.resourcesPath, "bin", "server_win.exe");
  sidecar = spawn(binaryPath, [], { cwd: path.join(process.resourcesPath, "bin"), stdio: "ignore" });
  createWindow();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") { if (sidecar) sidecar.kill(); app.quit(); } });
