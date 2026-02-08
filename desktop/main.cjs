const path = require("node:path");
const http = require("node:http");
const { app, BrowserWindow, dialog } = require("electron");
const next = require("next");

const APP_HOST = "127.0.0.1";
const START_PORT = 3210;
const END_PORT = 3299;

let webServer;
let serverPort;
let mainWindow;

function resolveAppDir() {
  return path.join(__dirname, "..");
}

function resolveDatabasePath() {
  return path.join(app.getPath("userData"), "world-property.sqlite");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    autoHideMenuBar: true,
    title: "World Property",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://${APP_HOST}:${serverPort}`);
}

async function startNextServer() {
  const appDir = resolveAppDir();
  process.env.NODE_ENV = "production";
  process.env.WP_DB_PATH = process.env.WP_DB_PATH || resolveDatabasePath();

  const nextApp = next({
    dev: false,
    dir: appDir,
    hostname: APP_HOST
  });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  for (let port = START_PORT; port <= END_PORT; port += 1) {
    try {
      await new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => handle(req, res));
        server.once("error", reject);
        server.listen(port, APP_HOST, () => {
          webServer = server;
          serverPort = port;
          resolve();
        });
      });
      return;
    } catch (error) {
      if (port === END_PORT) throw error;
    }
  }
}

async function stopNextServer() {
  if (!webServer) return;

  await new Promise((resolve) => {
    webServer.close(() => resolve());
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (webServer) {
    webServer.close();
  }
});

app.whenReady().then(async () => {
  try {
    await startNextServer();
    createWindow();
  } catch (error) {
    console.error(error);
    dialog.showErrorBox(
      "Startup Error",
      "World Property could not start its internal server. Check the logs and try again."
    );
    app.quit();
  }
});

process.on("exit", () => {
  void stopNextServer();
});
