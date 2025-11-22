const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexoAPI", {
  register: (data) => ipcRenderer.invoke("register-user", data),
  login: (data) => ipcRenderer.invoke("login-user", data),
});
