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
    const result = stmt.run(username, hash);
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

// IPC: eventos
ipcMain.handle("get-events", async (event, userId) => {
  const stmt = db.prepare("SELECT * FROM events WHERE user_id = ? ORDER BY date, time");
  return stmt.all(userId);
});

ipcMain.handle("add-event", async (event, { userId, title, date, time, description }) => {
  const stmt = db.prepare("INSERT INTO events (user_id, title, date, time, description) VALUES (?, ?, ?, ?, ?)");
  stmt.run(userId, title, date, time, description);
  return { success: true };
});

ipcMain.handle("delete-event", async (event, id) => {
  const stmt = db.prepare("DELETE FROM events WHERE id = ?");
  stmt.run(id);
  return { success: true };
});

// ===== INFORMES SOLO CON TABLAS EXISTENTES =====

// 1. Total de tareas/eventos del usuario
ipcMain.handle("report-task-count", async (event, { userId }) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM events WHERE user_id = ?").get(userId).count;
  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
    FROM events
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month
  `).all(userId);
  return { total, byMonth };
});

// 2. Días más productivos (más tareas)
ipcMain.handle("report-top-days", async (event, { userId }) => {
  return db.prepare(`
    SELECT date, COUNT(*) as taskCount
    FROM events
    WHERE user_id = ?
    GROUP BY date
    ORDER BY taskCount DESC
    LIMIT 10
  `).all(userId);
});

// 3. Evolución mensual (gráfico simple)
ipcMain.handle("report-month-evolution", async (event, { userId }) => {
  return db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
    FROM events
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month
  `).all(userId);
});

// ===== JSREPORT – GENERAR PDF =====
const jsreport = require("jsreport-core")();
jsreport.use(require("jsreport-pdf-utils")());
jsreport.use(require("jsreport-handlebars")());
jsreport.use(require("jsreport-chrome-pdf")());
jsreport.init();

ipcMain.handle("generate-report", async (event, { userId, type = "General" }) => {
  const events = db.prepare("SELECT * FROM events WHERE user_id = ? ORDER BY date").all(userId);

  const html = `
    <html>
    <head>
      <style>
        body{font-family:Arial;margin:40px;background:#fff;color:#333}
        h1{color:#0B3549;text-align:center}
        h2{margin-top:30px;color:#1D9BF0}
        table{width:100%;border-collapse:collapse;margin-bottom:20px}
        th,td{border:1px solid #ccc;padding:8px;text-align:left}
        th{background:#f5f5f5}
      </style>
    </head>
    <body>
      <h1>Informe ${type}</h1>
      <h2>Eventos</h2>
      <table><tr><th>Fecha</th><th>Título</th><th>Hora</th></tr>
        ${events.map(e => `<tr><td>${e.date}</td><td>${e.title}</td><td>${e.time || "-"}</td></tr>`).join("")}
      </table>
      <p>Generado el ${new Date().toLocaleString("es-ES")}</p>
    </body>
    </html>
  `;

  const res = await jsreport.render({
    template: { content: html, engine: "handlebars", recipe: "chrome-pdf" },
  });
  return res.content; // ← Buffer PDF
});