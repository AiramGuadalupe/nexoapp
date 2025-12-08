import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import NotasModal from "./NotasModal";
import "./NotasGrid.css";

const PAGE_SIZE = 8;

const NotasGrid = ({ userId }) => {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState({ open: false, note: null });

  const fetch = async () => {
    const res = await window.nexoAPI.getNotes({ userId });
    setNotes(res);
  };

  useEffect(() => { fetch(); }, [userId]);

  const totalPages = Math.ceil(notes.length / PAGE_SIZE);
  const visible = notes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const addNote = () => setModal({ open: true, note: null });
  const editNote = (note) => setModal({ open: true, note });

  const onSave = async (note) => {
    if (note.id) await window.nexoAPI.updateNote(note);
    else await window.nexoAPI.addNote({ userId, ...note });
    await fetch();
    setModal({ open: false, note: null });
  };

  const onDelete = async (id) => {
    await window.nexoAPI.deleteNote(id);
    await fetch();
    setModal({ open: false, note: null });
  };

  return (
    <>
      <div className="notas-main-container">
        <div className="notas-panel">
          <div className="notas-top-bar">
            <h3>Mis Notas</h3>
            <button className="notas-btn-primary" onClick={addNote}>
              <Plus size={18} /> Nueva nota
            </button>
          </div>

          {totalPages > 1 && (
            <div className="notas-paginacion">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ Ant</button>
              <span>{page + 1} / {totalPages}</span>
              <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Sig ›</button>
            </div>
          )}

          <div className="notas-cartas-grid">
            {visible.map(n => (
              <div key={n.id} className="nota-carta" onClick={() => editNote(n)}>
                <div className="nota-carta-titulo">{n.title}</div>
                <div className="nota-carta-body">{n.content || "Sin contenido"}</div>
                <span className="nota-carta-tag">{n.tag}</span>
              </div>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="notas-vacio">
              <p>No hay notas todavía. ¡Crea la primera!</p>
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <NotasModal
          note={modal.note}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => setModal({ open: false, note: null })}
        />
      )}
    </>
  );
};

export default NotasGrid;