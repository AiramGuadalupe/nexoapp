const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexoAPI", {
  register: (data) => ipcRenderer.invoke("register-user", data),
  login: (data) => ipcRenderer.invoke("login-user", data),

  // Eventos
  getEvents: (userId) => ipcRenderer.invoke("get-events", userId),
  addEvent: (data) => ipcRenderer.invoke("add-event", data),
  deleteEvent: (id) => ipcRenderer.invoke("delete-event", id),
});