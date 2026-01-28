const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexoAPI", {
  register: (data) => ipcRenderer.invoke("register-user", data),
  login: (data) => ipcRenderer.invoke("login-user", data),
  getReportsList: () => ipcRenderer.invoke("get-reports-list"),
  getReportData: (data) => ipcRenderer.invoke("get-report-data", data),
  saveCustomReport: (data) => ipcRenderer.invoke("save-custom-report", data),
  deleteCustomReport: (id) => ipcRenderer.invoke("delete-custom-report", id),
  // Eventos
  getEvents: (userId) => ipcRenderer.invoke("get-events", userId),
  addEvent: (data) => ipcRenderer.invoke("add-event", data),
  deleteEvent: (id) => ipcRenderer.invoke("delete-event", id),
  // Notas
  getNotes: (query) => ipcRenderer.invoke("get-notes", query),
  addNote: (data) => ipcRenderer.invoke("add-note", data),
  updateNote: (data) => ipcRenderer.invoke("update-note", data),
  deleteNote: (id) => ipcRenderer.invoke("delete-note", id),

  generateReport: (query) => ipcRenderer.invoke("generate-report", query),

});