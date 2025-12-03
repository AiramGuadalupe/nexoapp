import { useState, useEffect, useMemo } from "react";
import { X, Download } from "lucide-react";
import "./InformesPopup.css";

const REPORTS = {
  "Contador de tareas": "reportTaskCount",
  "Días más productivos": "reportTopDays",
  "Evolución mensual": "reportMonthEvolution",
};

const InformesPopup = ({ userId, onClose }) => {
  const [selected, setSelected] = useState("Contador de tareas");
  const [data, setData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    (async () => {
      const api = REPORTS[selected];
      const raw = await window.nexoAPI[api]({ userId });
      setData(raw);

      // Generamos PDF con JSReport
      const buffer = await window.nexoAPI.generateReport({ userId, type: selected });
      const blob = new Blob([buffer], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    })();
  }, [selected, userId]);

  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `informe_${selected.replace(/\s+/g, "_")}_user${userId}.pdf`;
    a.click();
  };

  // ✅ Protección: siempre array o []
  const safeData = useMemo(() => {
    if (!data) return [];
    if (selected === "Contador de tareas") return data.byMonth || [];
    return Array.isArray(data) ? data : [];
  }, [data, selected]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Informes</h3>
          <button className="popup-close" onClick={onClose}><X /></button>
        </div>

        <div className="popup-body">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="report-select">
            {Object.keys(REPORTS).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          {data && (
            <div className="report-preview">
              {selected === "Contador de tareas" && (
                <>
                  <p><strong>Total de tareas:</strong> {data.total}</p>
                  <table>
                    <thead><tr><th>Mes</th><th>Cantidad</th></tr></thead>
                    <tbody>
                      {safeData.map((m) => (
                        <tr key={m.month}><td>{m.month}</td><td>{m.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {selected !== "Contador de tareas" && (
                <table>
                  <thead><tr><th>Fecha</th><th>Tareas</th></tr></thead>
                  <tbody>
                    {safeData.map((d) => (
                      <tr key={d.date || d.month}>
                        <td>{d.date || d.month}</td>
                        <td>{d.taskCount || d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {pdfUrl && <iframe src={pdfUrl} width="100%" height="400px" />}
        </div>

        <div className="popup-footer">
          <button className="btn-download" onClick={downloadPdf}>
            <Download size={16} /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InformesPopup;