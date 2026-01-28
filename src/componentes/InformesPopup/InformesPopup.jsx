import { useState, useEffect, useMemo } from "react";
import { X, Download, Plus, Trash2 } from "lucide-react";
import "./InformesPopup.css";

const ENTITIES = {
  Eventos: ["title", "date", "time", "description"],
  Notas: ["title", "content", "tag", "created_at"]
};

const InformesPopup = ({ userId, onClose }) => {
  const [reportsList, setReportsList] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [reportData, setReportData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Builder State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("Eventos");
  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const list = await window.nexoAPI.getReportsList();
      if (list && list.length > 0) {
        setReportsList(list);
        if (!selectedReportId) setSelectedReportId(list[0].id);
      }
    } catch (err) {
      console.error("Error cargando reportes:", err);
    }
  };

  useEffect(() => {
    if (!selectedReportId || !userId || isBuilderOpen) return;

    (async () => {
      setLoading(true);
      try {
        const result = await window.nexoAPI.getReportData({ userId, reportId: selectedReportId });
        setReportData(result);

        const buffer = await window.nexoAPI.generateReport({ userId, reportId: selectedReportId });
        const blob = new Blob([buffer], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error("Error cargando datos del reporte:", err);
        setReportData(null);
        setPdfUrl(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedReportId, userId, isBuilderOpen]);

  const downloadPdf = () => {
    if (!pdfUrl || !reportData) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `informe_${reportData.title.replace(/\s+/g, "_")}_user${userId}.pdf`;
    a.click();
  };

  const handleCreateReport = async () => {
    if (!newReportTitle || selectedColumns.length === 0) return alert("Completa el título y selecciona al menos una columna.");

    try {
      await window.nexoAPI.saveCustomReport({
        userId,
        title: newReportTitle,
        entity: selectedEntity,
        columns: selectedColumns
      });
      setIsBuilderOpen(false);
      setNewReportTitle("");
      setSelectedColumns([]);
      loadReports();
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Error al guardar el informe.");
    }
  };

  const handleDeleteReport = async () => {
    const report = reportsList.find(r => r.id === selectedReportId);
    if (!report || !report.id.toString().startsWith("custom-")) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar el informe "${report.title}"?`)) return;

    try {
      const realId = report.id.replace("custom-", "");
      await window.nexoAPI.deleteCustomReport(realId);
      setSelectedReportId(reportsList[0]?.id || "");
      loadReports();
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    }
  };

  const handleColumnToggle = (col) => {
    setSelectedColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const tableData = useMemo(() => {
    if (!reportData || !reportData.data) return [];
    if (!Array.isArray(reportData.data) && reportData.data.byMonth) {
      return reportData.data.byMonth;
    }
    return Array.isArray(reportData.data) ? reportData.data : [];
  }, [reportData]);

  const Summary = useMemo(() => {
    if (!reportData || !reportData.data || Array.isArray(reportData.data)) return null;
    return (
      <div className="report-summary-header">
        {reportData.data.total !== undefined && <p><strong>Total:</strong> {reportData.data.total}</p>}
      </div>
    );
  }, [reportData]);

  const renderBuilder = () => (
    <div className="builder-container">
      <h4>Crear Nuevo Informe</h4>
      <div className="builder-field">
        <label>Título del Informe:</label>
        <input
          type="text"
          value={newReportTitle}
          onChange={(e) => setNewReportTitle(e.target.value)}
          placeholder="Ej: Mis Notas de Trabajo"
        />
      </div>
      <div className="builder-field">
        <label>Tipo de Datos:</label>
        <select value={selectedEntity} onChange={(e) => {
          setSelectedEntity(e.target.value);
          setSelectedColumns([]);
        }}>
          {Object.keys(ENTITIES).map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div className="builder-field">
        <label>Columnas a Incluir:</label>
        <div className="columns-grid">
          {ENTITIES[selectedEntity].map(col => (
            <label key={col} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => handleColumnToggle(col)}
              />
              {col}
            </label>
          ))}
        </div>
      </div>
      <div className="builder-actions">
        <button onClick={() => setIsBuilderOpen(false)} className="btn-cancel">Cancelar</button>
        <button onClick={handleCreateReport} className="btn-save">Guardar Informe</button>
      </div>
    </div>
  );

  if (!reportsList.length && !isBuilderOpen && !loading) return null;

  // Lógica para detectar si es el reporte especial de Airam
  const isAiramReport = reportData && reportData.title && reportData.title.includes("Airam Guadalupe Hernandez");

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Informes</h3>
          <button className="popup-close" onClick={onClose}><X /></button>
        </div>

        <div className="popup-body">
          {!isBuilderOpen && (
            <div className="reports-controls">
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="report-select"
              >
                {reportsList.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>

              <button
                className="btn-icon"
                onClick={() => setIsBuilderOpen(true)}
                title="Crear nuevo informe"
              >
                <Plus size={20} />
              </button>

              {selectedReportId.toString().startsWith("custom-") && (
                <button
                  className="btn-icon btn-danger"
                  onClick={handleDeleteReport}
                  title="Eliminar informe"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          )}

          {isBuilderOpen ? renderBuilder() : (
            loading ? (
              <p>Cargando datos...</p>
            ) : (
              reportData && (
                <div className={`report-preview ${isAiramReport ? 'style-airam' : ''}`}>
                  {/* --- CABECERA VISUAL DEL REPORTE CON LOGO --- */}
                  <div className="preview-header-container">
                    <h3>{reportData.title}</h3>
                    {/* Referencia directa a public/logo.png */}
                    <img
                      src="/logo.png"
                      alt="Logo Empresa"
                      className="preview-logo"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  {/* ----------------------------------- */}

                  {Summary}

                  {reportData.columns && tableData.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          {reportData.columns.map(col => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, idx) => (
                          <tr key={idx}>
                            {reportData.columns.map(col => (
                              <td key={col.key}>{row[col.key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No hay datos para mostrar.</p>
                  )}

                  {pdfUrl && <iframe src={pdfUrl} width="100%" height="400px" title="Preview PDF" />}
                </div>
              )
            )
          )}
        </div>

        {!isBuilderOpen && (
          <div className="popup-footer">
            <button className="btn-download" onClick={downloadPdf} disabled={!pdfUrl}>
              <Download size={16} /> Descargar PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformesPopup;