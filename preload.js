"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tideDesktop", {
  platform: process.platform,
  getSettings: () => ipcRenderer.invoke("tide:get-settings"),
  setEffects: (effects) => ipcRenderer.invoke("tide:set-effects", effects),
  setStartAtLogin: (enabled) => ipcRenderer.invoke("tide:set-start-at-login", Boolean(enabled)),
  setPinned: (pinned) => ipcRenderer.invoke("tide:set-pinned", Boolean(pinned)),
  resetPosition: () => ipcRenderer.invoke("tide:reset-position"),
  minimize: () => ipcRenderer.invoke("tide:minimize"),
  close: () => ipcRenderer.invoke("tide:close")
});
