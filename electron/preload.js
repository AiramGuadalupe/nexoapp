const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexoAPI", {
  register: (data) => ipcRenderer.invoke("register-user", data),
  login: (data) => ipcRenderer.invoke("login-user", data),
  reportTaskCount: (data) => ipcRenderer.invoke("report-task-count", data),
  reportTopDays: (data) => ipcRenderer.invoke("report-top-days", data),
  reportMonthEvolution: (data) => ipcRenderer.invoke("report-month-evolution", data),
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