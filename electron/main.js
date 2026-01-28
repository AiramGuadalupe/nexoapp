const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const reportManager = require("./reportManager");
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
  db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tag TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      entity TEXT NOT NULL,
      columns TEXT NOT NULL,
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
// NOTES
ipcMain.handle("get-notes", async (event, { userId, tag }) => {
  const stmt = tag
    ? db.prepare("SELECT * FROM notes WHERE user_id = ? AND tag = ? ORDER BY updated_at DESC")
    : db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC");
  return tag ? stmt.all(userId, tag) : stmt.all(userId);
});

ipcMain.handle("add-note", async (event, { userId, title, content, tag }) => {
  const stmt = db.prepare(
    "INSERT INTO notes (user_id, title, content, tag) VALUES (?, ?, ?, ?)"
  );
  stmt.run(userId, title, content, tag);
  return { success: true };
});

ipcMain.handle("update-note", async (event, { id, title, content, tag }) => {
  const stmt = db.prepare(
    "UPDATE notes SET title = ?, content = ?, tag = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  );
  stmt.run(title, content, tag, id);
  return { success: true };
});

ipcMain.handle("delete-note", async (event, id) => {
  db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  return { success: true };
});
ipcMain.handle("get-reports-list", async (event, userId) => {
  return reportManager.getReportsList(db, userId);
});

ipcMain.handle("save-custom-report", async (event, { userId, title, entity, columns }) => {
  const stmt = db.prepare("INSERT INTO custom_reports (user_id, title, entity, columns) VALUES (?, ?, ?, ?)");
  stmt.run(userId, title, entity, JSON.stringify(columns));
  return { success: true };
});

ipcMain.handle("delete-custom-report", async (event, id) => {
  db.prepare("DELETE FROM custom_reports WHERE id = ?").run(id);
  return { success: true };
});

ipcMain.handle("get-report-data", async (event, { userId, reportId }) => {
  try {
    return reportManager.getReportData(db, reportId, userId);
  } catch (error) {
    console.error("Error getting report data:", error);
    return null;
  }
});
// ... (Aquí arriba está todo tu código de base de datos, login, eventos, etc.)

// ===== JSREPORT – GENERAR PDF =====
// Copia desde aquí hasta el final del archivo
const jsreport = require("jsreport-core")();
jsreport.use(require("jsreport-pdf-utils")());
jsreport.use(require("jsreport-handlebars")());
jsreport.use(require("jsreport-chrome-pdf")());
jsreport.init();

ipcMain.handle("generate-report", async (event, { userId, reportId }) => {
  // 1. Obtener datos
  const { data, columns, title } = reportManager.getReportData(db, reportId, userId);

  // 2. Normalizar filas
  let rows = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (data && data.byMonth) {
    rows = data.byMonth;
  }
  if (!rows) rows = [];

  // 3. Cargar LOGO desde la carpeta public
  const logoPath = path.join(__dirname, "../public/logo.png");
  let logoHtml = "";

  try {
    if (fs.existsSync(logoPath)) {
      const bitmap = fs.readFileSync(logoPath);
      const base64Logo = bitmap.toString("base64");
      // Ajusta el height (50px) según el tamaño que desees
      logoHtml = `<img src="data:image/png;base64,${base64Logo}" style="height: 50px; object-fit: contain;" />`;
    }
  } catch (err) {
    console.error("No se pudo cargar el logo para el PDF:", err);
  }

  // 4. Estilos Condicionales (Línea roja de Airam)
  const isAiramReport = title.includes("Airam Guadalupe Hernandez");
  const cellStyle = isAiramReport
    ? "border: none; border-bottom: 2px solid red;"
    : "border: 1px solid #ccc;";

  // Generar filas y cabeceras HTML
  const headersHtml = columns.map(c => `<th>${c.label}</th>`).join("");
  const rowsHtml = rows.map(row => {
    const cells = columns.map(c => {
      let val = row[c.key];
      if (val === null || val === undefined) val = "-";
      return `<td style="padding:8px; text-align:left; ${cellStyle}">${val}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  // 5. Construir HTML Principal
  const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial; margin: 0; background: #fff; color: #333; }
        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #0B3549;
            padding-bottom: 10px;
        }
        h1 { color: #0B3549; margin: 0; font-size: 24px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f5f5f5; border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
        td { font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header-container">
        <h1>${title}</h1>
        <div class="logo-box">
            ${logoHtml}
        </div>
      </div>

      <table>
        <tr>${headersHtml}</tr>
        ${rowsHtml}
      </table>
      
      <p style="font-size:10px; color:#666; margin-top:20px;">
        Generado el ${new Date().toLocaleString("es-ES")}
      </p>
    </body>
    </html>
  `;

  // 6. Renderizar con JSReport y opciones de Pie de Página
  const res = await jsreport.render({
    template: {
      content: html,
      engine: "handlebars",
      recipe: "chrome-pdf",
      chrome: {
        displayHeaderFooter: true,
        footerTemplate: `
                <div style="font-size: 10px; width: 100%; text-align: center; color: #555; padding-bottom: 10px;">
                    Página <span class="pageNumber"></span> de <span class="totalPages"></span>
                </div>
            `,
        headerTemplate: "<span></span>",
        marginTop: "20px",
        marginBottom: "40px",
        marginLeft: "20px",
        marginRight: "20px"
      }
    },
  });

  return res.content;
});