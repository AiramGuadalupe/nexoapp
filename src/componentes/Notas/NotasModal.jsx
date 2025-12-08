import { useState, useEffect } from "react";
import "./NotasModal.css";

const TAGS = ["General", "Compra", "Tareas", "Clases", "Idea"];

const NotasModal = ({ note, onSave, onDelete, onClose }) => {
  const [form, setForm] = useState({ title: "", content: "", tag: "General" });

  useEffect(() => {
    setForm(note ? { title: note.title, content: note.content, tag: note.tag }
                : { title: "", content: "", tag: "General" });
  }, [note]);

  const handleSave = () => onSave({ ...(note || {}), ...form });

  return (
    <div className="notas-modal-overlay" onClick={onClose}>
      <div className="notas-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{note ? "Editar nota" : "Nueva nota"}</h3>

        <input
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Contenido"
          rows={6}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <select
          value={form.tag}
          onChange={(e) => setForm({ ...form, tag: e.target.value })}
        >
          {TAGS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <div className="notas-modal-footer">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          {note && (
            <button type="button" className="notas-btn-delete" onClick={() => onDelete(note.id)}>
              Borrar
            </button>
          )}
          <button type="submit" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotasModal;