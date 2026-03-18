import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
  const [panels, setPanels] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [logs, setLogs] = useState([]);

  const fetchData = async () => {
    const [panelRes, ticketRes, logRes] = await Promise.all([fetch('/api/panels'), fetch('/api/tickets'), fetch('/api/logs')]);
    setPanels(await panelRes.json());
    setTickets(await ticketRes.json());
    setLogs(await logRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="dashboard-content">
      <header className="topbar"><div><h1>Premium Ticket Dashboard</h1><p>Your team control panel</p></div><div className="status-pill">Bot status: Idle</div></header>
      <section className="stats-row">
        <article className="stat-card"><h3>Panels</h3><strong>{panels.length}</strong></article>
        <article className="stat-card"><h3>Open Tickets</h3><strong>{tickets.filter(t => !t.closed).length}</strong></article>
        <article className="stat-card"><h3>Logs</h3><strong>{logs.length}</strong></article>
      </section>
    </div>
  );
}

function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch('/api/tickets').then(r => r.json()).then(data => setTickets(data.filter(t => !t.closed)));
  }, []);

  return (
    <div className="dashboard-content">
      <header className="topbar"><div><h1>Open Tickets</h1><p>Active tickets in server</p></div></header>
      <div className="card"><table style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th>Channel</th><th>User</th><th>Claimed</th><th>Created</th></tr></thead><tbody>{tickets.map(t => <tr key={t._id}><td>{t.channelName || t.channelId}</td><td>{t.username}</td><td>{t.claimerTag || 'None'}</td><td>{new Date(t.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret }) });
    if (res.ok) navigate('/');
    else alert('Login failed');
  };
  return (
    <div className="login-shell"><div className="login-card"><h2>Sign in</h2><p>Use your admin secret (OAuth-like)</p><form onSubmit={handleSubmit}><input placeholder="Secret key" value={secret} onChange={e=>setSecret(e.target.value)} required /><button type="submit">Login</button></form></div></div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand"><span className="dot"/>TicketBot</div>
          <p className="subtitle">Made by asphalt._,6</p>
          <nav className="pulse-menu"><NavLink to="/" end>Dashboard</NavLink><NavLink to="/tickets">Open Tickets</NavLink></nav>
          <div className="pill">OAuth Authenticated</div>
        </aside>
        <main className="dashboard">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
