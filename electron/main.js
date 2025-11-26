const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

let db;

function initDatabase() {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "nexo.db");

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

  console.log("Base de datos lista:", dbPath);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/apple-touch-icon.png'),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  if (process.env.ELECTRON_START_URL) {
    win.loadURL(process.env.ELECTRON_START_URL);
  } else {
    win.loadFile(path.join(__dirname, "../build/index.html"));
  }
}

app.whenReady().then(() => {
  initDatabase();

  process.env.ELECTRON_START_URL = "http://localhost:3000";

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC: registro
ipcMain.handle("register-user", async (event, { username, password }) => {
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    const result = stmt.run(username, hash); // <-- obtiene el id insertado

    return { success: true, user: { id: result.lastInsertRowid, username } };
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { success: false, error: "El nombre de usuario ya existe." };
    }
    return { success: false, error: err.message };
  }
});

// IPC: login
ipcMain.handle("login-user", async (event, { username, password }) => {
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  const user = stmt.get(username);

  if (!user) return { success: false, error: "Usuario no encontrado." };

  const ok = bcrypt.compareSync(password, user.password_hash);

  if (!ok) return { success: false, error: "Contraseña incorrecta." };

  return { success: true, user: { id: user.id, username: user.username } };
});
// Obtener eventos
ipcMain.handle("get-events", async (event, userId) => {
  const stmt = db.prepare("SELECT * FROM events WHERE user_id = ? ORDER BY date, time");
  const events = stmt.all(userId);
  return events;
});

// Añadir evento
ipcMain.handle("add-event", async (event, { userId, title, date, time, description }) => {
  const stmt = db.prepare(
    "INSERT INTO events (user_id, title, date, time, description) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(userId, title, date, time, description);
  return { success: true };
});

// Eliminar evento
ipcMain.handle("delete-event", async (event, id) => {
  const stmt = db.prepare("DELETE FROM events WHERE id = ?");
  stmt.run(id);
  return { success: true };
});