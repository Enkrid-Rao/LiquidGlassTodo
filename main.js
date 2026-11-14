"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");

const APP_NAME = "Tide";
const WINDOW_WIDTH = 520;
const WINDOW_HEIGHT = 740;
const TASKBAR_MARGIN = 28;
const GLASS_OPACITY_DEFAULT = 82;
const ATMO_STYLES = ["lagoon", "aurora", "dusk", "ember", "frost", "noir", "veil", "mist"];
const DEFAULT_EFFECTS = {
  atmosphere: true,
  atmoStyle: "lagoon",
  atmoStrength: 92,
  hue: 165,
  tintSat: 34,
  accentHue: 158,
  glassOpacity: GLASS_OPACITY_DEFAULT,
  halo: true,
  haloStrength: 70,
  cursorGlow: true,
  grain: true,
  ambientDrift: false,
  showDate: true,
  clock24: true
};
const DEFAULT_SETTINGS = {
  effects: DEFAULT_EFFECTS,
  startAtLogin: true,
  alwaysOnTop: true,
  window: null
};

let mainWindow = null;
let settings = null;
let positionSaveTimer = null;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    app.setName(APP_NAME);
    app.setAppUserModelId("com.tide.widget");
    Menu.setApplicationMenu(null);

    settings = loadSettings();
    registerWindowIpc();
    syncLoginItem(settings.startAtLogin);
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  saveWindowPosition();
});

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function readBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function loadSettings() {
  let parsed = {};

  try {
    parsed = JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
  } catch {
    parsed = {};
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) parsed = {};

  const windowBounds = parsed.window && Number.isFinite(parsed.window.x) && Number.isFinite(parsed.window.y)
    ? { x: Math.round(parsed.window.x), y: Math.round(parsed.window.y) }
    : null;

  return {
    effects: normalizeEffects(parsed.effects),
    startAtLogin: readBoolean(parsed.startAtLogin, DEFAULT_SETTINGS.startAtLogin),
    alwaysOnTop: readBoolean(parsed.alwaysOnTop, DEFAULT_SETTINGS.alwaysOnTop),
    window: windowBounds
  };
}

function normalizeEffects(source) {
  const effects = source && typeof source === "object" ? source : {};

  const clamp = (value, fallback, min, max) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  };

  const atmosphere = effects.atmosphere !== false;
  const atmoStyle = ATMO_STYLES.includes(effects.atmoStyle)
    ? effects.atmoStyle
    : DEFAULT_EFFECTS.atmoStyle;

  return {
    atmosphere,
    atmoStyle,
    atmoStrength: clamp(effects.atmoStrength, DEFAULT_EFFECTS.atmoStrength, 0, 100),
    hue: clamp(effects.hue, DEFAULT_EFFECTS.hue, 0, 359),
    tintSat: clamp(effects.tintSat, DEFAULT_EFFECTS.tintSat, 0, 60),
    accentHue: clamp(effects.accentHue, DEFAULT_EFFECTS.accentHue, 0, 359),
    glassOpacity: clamp(effects.glassOpacity, DEFAULT_EFFECTS.glassOpacity, 30, 100),
    halo: effects.halo !== false,
    haloStrength: clamp(effects.haloStrength, DEFAULT_EFFECTS.haloStrength, 0, 100),
    cursorGlow: effects.cursorGlow !== false,
    grain: effects.grain !== false,
    ambientDrift: effects.ambientDrift === true && atmosphere,
    showDate: effects.showDate !== false,
    clock24: effects.clock24 !== false
  };
}

function writeSettings() {
  if (!settings) return;
  try {
    fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
    fs.writeFileSync(settingsPath(), `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  } catch (error) {
    console.error("Could not save Tide settings:", error);
  }
}

function loginItemOptions(enabled) {
  const options = { openAtLogin: Boolean(enabled) };
  if (!app.isPackaged) {
    options.path = process.execPath;
    options.args = [app.getAppPath()];
  }
  return options;
}

function syncLoginItem(enabled) {
  try {
    app.setLoginItemSettings(loginItemOptions(enabled));
  } catch (error) {
    console.error("Could not update the login item:", error);
  }
}

function createWindow() {
  const { width, height } = initialWindowSize();
  const position = initialWindowPosition(width, height);

  mainWindow = new BrowserWindow({
    width,
    height,
    x: position.x,
    y: position.y,
    minWidth: 460,
    minHeight: 620,
    maxWidth: WINDOW_WIDTH,
    maxHeight: WINDOW_HEIGHT,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    hasShadow: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    roundedCorners: false,
    show: false,
    title: "Tide — open tasks, kept close",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      devTools: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAlwaysOnTop(Boolean(settings.alwaysOnTop));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("move", scheduleWindowPositionSave);

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault();
  });

  mainWindow.on("closed", () => {
    saveWindowPosition();
    mainWindow = null;
  });
}

function initialWindowSize() {
  const work = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(WINDOW_WIDTH, Math.max(460, work.width - 24));
  const height = Math.min(WINDOW_HEIGHT, Math.max(620, work.height - 24));
  return { width, height };
}

function initialWindowPosition(width, height) {
  if (settings.window) {
    const displays = screen.getAllDisplays();
    const visible = displays.some((display) => {
      const area = display.workArea;
      return (
        settings.window.x < area.x + area.width - 60 &&
        settings.window.x + width > area.x + 60 &&
        settings.window.y < area.y + area.height - 60 &&
        settings.window.y + height > area.y + 60
      );
    });

    if (visible) {
      return settings.window;
    }
  }

  const work = screen.getPrimaryDisplay().workArea;
  return {
    x: Math.round(work.x + work.width - width - TASKBAR_MARGIN),
    y: Math.round(work.y + work.height - height - TASKBAR_MARGIN)
  };
}

function scheduleWindowPositionSave() {
  clearTimeout(positionSaveTimer);
  positionSaveTimer = setTimeout(saveWindowPosition, 350);
}

function saveWindowPosition() {
  if (!mainWindow || mainWindow.isDestroyed() || !settings) return;
  const bounds = mainWindow.getBounds();
  settings.window = { x: bounds.x, y: bounds.y };
  writeSettings();
}

function registerWindowIpc() {
  const appWindow = () => (mainWindow && !mainWindow.isDestroyed() ? mainWindow : null);

  ipcMain.handle("tide:get-settings", () => {
    const win = appWindow();
    return {
      effects: { ...settings.effects },
      startAtLogin: Boolean(settings.startAtLogin),
      alwaysOnTop: Boolean(win && win.isAlwaysOnTop()),
      version: app.getVersion()
    };
  });

  ipcMain.handle("tide:set-effects", (_event, incoming) => {
    settings.effects = normalizeEffects(incoming);
    writeSettings();
    return { ...settings.effects };
  });

  ipcMain.handle("tide:set-start-at-login", (_event, enabled) => {
    const next = Boolean(enabled);
    try {
      app.setLoginItemSettings(loginItemOptions(next));
    } catch (error) {
      console.error("Could not update the login item:", error);
      return Boolean(settings.startAtLogin);
    }

    settings.startAtLogin = next;
    writeSettings();
    return next;
  });

  ipcMain.handle("tide:minimize", () => {
    const win = appWindow();
    if (win) win.minimize();
    return Boolean(win);
  });

  ipcMain.handle("tide:close", () => {
    const win = appWindow();
    if (win) win.close();
    return Boolean(win);
  });

  ipcMain.handle("tide:set-pinned", (_event, pinned) => {
    const win = appWindow();
    if (!win) return false;
    win.setAlwaysOnTop(Boolean(pinned));
    settings.alwaysOnTop = win.isAlwaysOnTop();
    writeSettings();
    return settings.alwaysOnTop;
  });

  ipcMain.handle("tide:reset-position", () => {
    const win = appWindow();
    if (!win) return false;

    const { width, height } = win.getBounds();
    settings.window = null;
    const position = initialWindowPosition(width, height);
    win.setPosition(position.x, position.y);
    saveWindowPosition();
    return true;
  });
}
