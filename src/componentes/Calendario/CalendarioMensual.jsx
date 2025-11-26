import React, { useState, useEffect } from "react";
import "./CalendarioMensual.css";

const CalendarioMensual = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", time: "", description: "" });
  const [editingEvent, setEditingEvent] = useState(null);

  const [eventPage, setEventPage] = useState(0);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    const res = await window.nexoAPI.getEvents(userId);
    setEvents(res);
  };

  const daysInMonth = () => {
    const date = new Date(currentDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) arr.push(null);
    for (let d = 1; d <= days; d++) arr.push(new Date(year, month, d));
    return arr;
  };

  const hasEvent = (date) => {
    if (!date) return false;
    const str = date.toISOString().split("T")[0];
    return events.some(ev => ev.date === str);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setForm({ title: "", time: "", description: "" });
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const dateStr = selectedDate.toISOString().split("T")[0];
    await window.nexoAPI.addEvent({ userId, title: form.title, date: dateStr, time: form.time, description: form.description });
    setShowForm(false);
    loadEvents();
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    await window.nexoAPI.deleteEvent(editingEvent.id);
    setShowForm(false);
    loadEvents();
  };

  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  };

  const monthName = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const sortedEvents = events
    .filter(ev => ev.date >= new Date().toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date) || a.time?.localeCompare(b.time));

  const paginatedEvents = sortedEvents.slice(eventPage * 5, eventPage * 5 + 5);

  const goNext = () => {
    if ((eventPage + 1) * 5 < sortedEvents.length) setEventPage(eventPage + 1);
  };

  const goPrev = () => {
    if (eventPage > 0) setEventPage(eventPage - 1);
  };

  return (
    <div className="calendario-layout">
      <div className="calendario-mensual">
        <div className="cal-header">
          <button onClick={() => changeMonth(-1)}>‹</button>
          <h3>{monthName}</h3>
          <button onClick={() => changeMonth(1)}>›</button>
        </div>

        <div className="cal-grid">
          {["L", "M", "X", "J", "V", "S", "D"].map(d => (
            <div key={d} className="cal-cell cal-day-header">{d}</div>
          ))}
          {daysInMonth().map((date, idx) => (
            <div
              key={idx}
              className={`cal-cell cal-day ${date ? (hasEvent(date) ? "has-event" : "") : "empty"}`}
              onClick={() => date && handleDayClick(date)}
            >
              {date && <div>{date.getDate()}</div>}
            </div>
          ))}
        </div>
      </div>

      <aside className="cal-event-sidebar">
        <h4>Próximos eventos</h4>
        {paginatedEvents.length === 0 && <p className="no-events">No hay eventos próximos.</p>}
        <ul className="event-list">
          {paginatedEvents.map(ev => (
            <li
              key={ev.id}
              className="event-item"
              onClick={() => {
                setSelectedDate(new Date(ev.date));
                setForm({ title: ev.title, time: ev.time || "", description: ev.description });
                setEditingEvent(ev);
                setShowForm(true);
              }}
            >
              <div className="event-date">{ev.date}</div>
              <div className="event-time">{ev.time || "Todo el día"}</div>
              <div className="event-title">{ev.title}</div>
            </li>
          ))}
        </ul>
        <div className="cal-event-pagination">
          <button onClick={goPrev} disabled={eventPage === 0}>‹ Anterior</button>
          <button onClick={goNext} disabled={(eventPage + 1) * 5 >= sortedEvents.length}>Siguiente ›</button>
        </div>
      </aside>

      {showForm && (
        <div className="cal-modal" onClick={() => setShowForm(false)}>
          <div className="cal-modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>{editingEvent ? "Editar evento" : "Nuevo evento"} para {selectedDate.toLocaleDateString("es-ES")}</h4>
            <form onSubmit={handleAdd}>
              <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="cal-modal-buttons">
                <button type="submit">{editingEvent ? "Actualizar" : "Guardar"}</button>
                {editingEvent && (
                  <button type="button" className="btn-delete" onClick={handleDelete}>Eliminar</button>
                )}
                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioMensual;