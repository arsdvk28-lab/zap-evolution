const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let sidecar;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Singularity Walker",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setTimeout(() => {
    mainWindow.loadURL("http://localhost:8000");
  }, 3500);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("[SYSTEM] Initializing Sidecar Engine...");
  // process.resourcesPath указывает на папку resources внутри приложения
  const binaryPath = path.join(process.resourcesPath, "bin", "server.bin");
  
  sidecar = spawn(binaryPath, [], {
    cwd: path.join(process.resourcesPath, "bin"),
    stdio: "ignore"
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (sidecar) sidecar.kill();
    app.quit();
  }
});

app.on("will-quit", () => {
  if (sidecar) sidecar.kill();
});
