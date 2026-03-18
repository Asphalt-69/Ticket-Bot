import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [panels, setPanels] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [transcripts, setTranscripts] = useState([]);

  const fetchData = async () => {
    try {
      const [panelRes, ticketRes, logRes] = await Promise.all([fetch('/api/panels'), fetch('/api/tickets'), fetch('/api/logs')]);
      const [panelData, ticketData, logData] = await Promise.all([panelRes.json(), ticketRes.json(), logRes.json()]);
      setPanels(panelData);
      setTickets(ticketData);
      setLogs(logData);
      setTranscripts([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="dot" />TicketBot</div>
        <p className="subtitle">Powerful ticket automation by asphalt._,6</p>
        <div className="pill">Discord Ticket System</div>
      </aside>
      <main className="dashboard">
        <header className="topbar"><div><h1>Premium Ticket Dashboard</h1><p>Manage panels, tickets, transcripts, and logs in one place.</p></div><div className="status-pill">Bot Idle</div></header>
        <section className="stats-row">
          <article className="stat-card"><h3>Panels</h3><strong>{panels.length}</strong></article>
          <article className="stat-card"><h3>Open Tickets</h3><strong>{tickets.filter(t => !t.closed).length}</strong></article>
          <article className="stat-card"><h3>Logs</h3><strong>{logs.length}</strong></article>
          <article className="stat-card"><h3>Transcripts</h3><strong>{transcripts.length}</strong></article>
        </section>
        <section className="grid">
          <article className="card"><h3>Panels</h3><ul>{panels.map(p => <li key={p._id}>{p.name} <span>{p.type}/{p.uiType}</span></li>)}</ul></article>
          <article className="card"><h3>Open Tickets</h3><ul>{tickets.filter(t => !t.closed).map(t => <li key={t._id}>{t.channelName || t.channelId} <span>{t.username}</span></li>)}</ul></article>
          <article className="card"><h3>Recent Logs</h3><ul>{logs.slice(0, 8).map(l => <li key={l._id}>{new Date(l.createdAt).toLocaleTimeString()} <span>{l.action}</span></li>)}</ul></article>
          <article className="card"><h3>Transcripts</h3><ul>{transcripts.slice(0, 8).map((t, i) => <li key={i}>{t.channelId}</li>)}</ul></article>
        </section>
      </main>
    </div>
  );
}

export default App;
