import React, { useEffect, useState } from "react";

export default function EventsList({ date }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!date) return;
    window.nexoAPI.events.getByDate(date).then(setEvents);
  }, [date]);

  return (
    <div className="events-widget">
      <h3>Eventos del {date || "---"}</h3>

      {events.length === 0 && <p>No hay eventos.</p>}

      {events.map((ev) => (
        <div key={ev.id} className="event-item">
          <strong>{ev.time}</strong> — {ev.title}
          <p>{ev.description}</p>
        </div>
      ))}
    </div>
  );
}
