const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

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

  // Если сервер не поднимется, мы хотя бы увидим интерфейс с ошибкой подключения, а не белый экран
  mainWindow.loadURL("http://localhost:8000").catch(() => {
    console.log("[ERROR] Failed to load localhost:8000, retrying...");
    setTimeout(() => { mainWindow.loadURL("http://localhost:8000"); }, 2000);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("[SYSTEM] Initializing Sidecar Engine...");
  
  // Корректное определение путей для собранного приложения и для среды разработки
  const isPackaged = app.isPackaged;
  const basePath = isPackaged ? process.resourcesPath : __dirname;
  
  const binaryName = process.platform === "win32" ? "server.bin.exe" : "server.bin";
  const binaryPath = path.join(basePath, "bin", binaryName);
  const workingDir = path.join(basePath, "bin");

  console.log("[DEBUG] Binary Path:", binaryPath);
  console.log("[DEBUG] Working Directory:", workingDir);

  if (fs.existsSync(binaryPath)) {
    sidecar = spawn(binaryPath, [], {
      cwd: workingDir,
      stdio: "inherit" // Выводим логи сервера в общую консоль для отладки
    });
    
    sidecar.on("error", (err) => {
      console.error("[CRITICAL] Failed to start sidecar process:", err);
    });
  } else {
    console.error("[CRITICAL] sidecar binary NOT found at:", binaryPath);
  }

  // Даем серверу ИИ 4 секунды на инициализацию заквантованных весов Qwen
  setTimeout(createWindow, 4000);
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
