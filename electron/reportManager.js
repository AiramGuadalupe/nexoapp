const reports = [
    {
        id: "task-count",
        title: "Contador de tareas",
        execute: (db, userId) => {
            const total = db.prepare("SELECT COUNT(*) as count FROM events WHERE user_id = ?").get(userId).count;
            const byMonth = db.prepare(`
        SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
        FROM events
        WHERE user_id = ?
        GROUP BY month
        ORDER BY month
      `).all(userId);
            return { total, byMonth };
        },
        columns: [
            { key: "month", label: "Mes" },
            { key: "count", label: "Cantidad" }
        ],
        viewType: "summary-table"
    },
    {
        id: "top-days",
        title: "Días más productivos",
        execute: (db, userId) => {
            return db.prepare(`
        SELECT date, COUNT(*) as taskCount
        FROM events
        WHERE user_id = ?
        GROUP BY date
        ORDER BY taskCount DESC
        LIMIT 10
      `).all(userId);
        },
        columns: [
            { key: "date", label: "Fecha" },
            { key: "taskCount", label: "Tareas Completadas" }
        ],
        viewType: "table"
    },
    {
        id: "month-evolution",
        title: "Evolución mensual",
        execute: (db, userId) => {
            return db.prepare(`
        SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
        FROM events
        WHERE user_id = ?
        GROUP BY month
        ORDER BY month
      `).all(userId);
        },
        columns: [
            { key: "month", label: "Mes" },
            { key: "count", label: "Eventos" }
        ],
        viewType: "table"
    },
    // --- NUEVO INFORME PARA AIRAM ---
    {
        id: "airam-special",
        title: "Informe Airam Guadalupe Hernandez",
        execute: (db, userId) => {
            // Seleccionamos los 4 datos solicitados de la tabla de eventos
            return db.prepare(`
                SELECT title, date, time, description 
                FROM events 
                WHERE user_id = ? 
                ORDER BY date DESC
            `).all(userId);
        },
        columns: [
            { key: "title", label: "Título" },
            { key: "date", label: "Fecha" },
            { key: "time", label: "Hora" },
            { key: "description", label: "Descripción" }
        ],
        viewType: "table"
    },
    {
        id: "airam-new",
        title: "Nuevo Informe Airam Guadalupe Hernandez",
        execute: (db, userId) => {
            return db.prepare(`
                SELECT title, date, time, description 
                FROM events 
                WHERE user_id = ? 
                ORDER BY date DESC
            `).all(userId);
        },
        columns: [
            { key: "title", label: "Título" },
            { key: "date", label: "Fecha" },
            { key: "time", label: "Hora" },
            { key: "description", label: "Descripción" }
        ],
        viewType: "table"
    }
];

module.exports = {
    getReportsList: (db, userId) => {
        const baseReports = reports.map(r => ({ id: r.id, title: r.title, viewType: r.viewType }));
        try {
            const customReports = db.prepare("SELECT id, title, 'custom' as type FROM custom_reports WHERE user_id = ?").all(userId);
            return [...baseReports, ...customReports.map(r => ({ ...r, id: `custom-${r.id}` }))];
        } catch (err) {
            console.error("Error fetching custom reports:", err);
            return baseReports;
        }
    },

    getReportData: (db, reportId, userId) => {
        // A. Reporte Estándar (incluye el de Airam)
        const report = reports.find(r => r.id === reportId);
        if (report) {
            return {
                data: report.execute(db, userId),
                columns: report.columns,
                title: report.title
            };
        }

        // B. Reporte Custom (Corregido orden y seguridad)
        if (reportId.startsWith("custom-")) {
            const realId = reportId.replace("custom-", "");
            const customDef = db.prepare("SELECT * FROM custom_reports WHERE id = ? AND user_id = ?").get(realId, userId);

            if (!customDef) throw new Error("Custom report not found");

            const columns = JSON.parse(customDef.columns);

            let entityTable = "";
            let orderBy = "";

            // Validación de entidad y orden correcto
            if (customDef.entity === "Eventos") {
                entityTable = "events";
                orderBy = "date DESC, time DESC";
            } else if (customDef.entity === "Notas") {
                entityTable = "notes";
                orderBy = "updated_at DESC";
            } else {
                throw new Error("Entidad no válida");
            }

            // Lista blanca de columnas para evitar inyecciones
            const allowedCols = ["title", "date", "time", "description", "content", "tag", "created_at"];
            const safeColumns = columns.filter(c => allowedCols.includes(c));

            if (safeColumns.length === 0) return { data: [], columns: [], title: customDef.title };

            const selectCols = safeColumns.join(", ");
            const query = `SELECT ${selectCols} FROM ${entityTable} WHERE user_id = ? ORDER BY ${orderBy}`;

            const data = db.prepare(query).all(userId);

            const uiColumns = safeColumns.map(c => ({
                key: c,
                label: c.charAt(0).toUpperCase() + c.slice(1)
            }));

            return {
                data,
                columns: uiColumns,
                title: customDef.title,
                isCustom: true,
                customId: realId
            };
        }

        throw new Error("Report not found");
    }
};