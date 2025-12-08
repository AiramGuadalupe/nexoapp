import React, { useEffect, useState } from "react";
import "./Notas.css";

const TAGS = ["General", "Compra", "Tareas", "Clases", "Idea"];

const PAGE_SIZE = 8;

const Notas = ({ userId }) => {
  const [rawNotes, setRawNotes]   = useState([]);        // todas
  const [page, setPage]           = useState(0);
  const [dirty, setDirty]         = useState({});        // índices editados

  // ---------- carga ----------
  useEffect(() => {
    (async () => {
      const res = await window.nexoAPI.getNotes({ userId });
      setRawNotes(res);
    })();
  }, [userId]);

  // ---------- paginación ----------
  const totalPages = Math.ceil(rawNotes.length / PAGE_SIZE);
  const start      = page * PAGE_SIZE;
  const visible    = rawNotes.slice(start, start + PAGE_SIZE);

  // ---------- handlers ----------
  const updateLocal = (idx, field, value) => {
    const globalIdx = start + idx;
    const copy = [...rawNotes];
    copy[globalIdx] = { ...copy[globalIdx], [field]: value };
    setRawNotes(copy);
    setDirty((d) => ({ ...d, [copy[globalIdx].id]: true }));
  };

  const saveNote = async (note) => {
    await window.nexoAPI.updateNote({
      id: note.id,
      title: note.title,
      content: note.content,
      tag: note.tag,
    });
    setDirty((d) => ({ ...d, [note.id]: false }));
  };

  const deleteNote = async (id) => {
    await window.nexoAPI.deleteNote(id);
    setRawNotes((l) => l.filter((n) => n.id !== id));
  };

  const newNote = async () => {
    await window.nexoAPI.addNote({
      userId,
      title: "Nueva nota",
      content: "",
      tag: "General",
    });
    // recargar
    const res = await window.nexoAPI.getNotes({ userId });
    setRawNotes(res);
    // ir a la última página
    setPage(Math.floor((res.length - 1) / PAGE_SIZE));
  };

  // ---------- render ----------
  return (
    <div className="notas-wrapper">
      <div className="notas-header">
        <h2>Mis Notas</h2>
        <button className="btn-primary" onClick={newNote}>+ Nueva nota</button>
      </div>

      {/* paginador */}
      {totalPages > 1 && (
        <div className="notas-paginator">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹ Ant</button>
          <span>{page + 1} / {totalPages}</span>
          <button disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)}>Sig ›</button>
        </div>
      )}

      {/* grilla 4 + 4 */}
      <div className="notas-grid">
        {visible.map((note, idx) => (
          <div key={note.id} className="nota-card">
            <input
              className="nota-title"
              value={note.title}
              onChange={(e) => updateLocal(idx, "title", e.target.value)}
              placeholder="Título"
            />
            <textarea
              className="nota-body"
              value={note.content}
              onChange={(e) => updateLocal(idx, "content", e.target.value)}
              placeholder="Escribe aquí..."
            />
            <select
              className="nota-tag"
              value={note.tag}
              onChange={(e) => updateLocal(idx, "tag", e.target.value)}
            >
              {TAGS.map((t) => <option key={t}>{t}</option>)}
            </select>

            <div className="nota-actions">
              <button
                className={dirty[note.id] ? "btn-save dirty" : "btn-save"}
                onClick={() => saveNote(note)}
              >
                Guardar
              </button>
              <button className="btn-del" onClick={() => deleteNote(note.id)}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notas;