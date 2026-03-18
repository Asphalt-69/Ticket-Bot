require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const discordBot = require('./bot/client');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes(io));

const reactDist = path.join(__dirname, 'client', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(reactDist));
}

app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.sendFile(path.join(reactDist, 'index.html'));
  res.redirect('/dashboard');
});

app.get('/dashboard', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.sendFile(path.join(reactDist, 'index.html'));
  }
  const Panel = require('./models/Panel');
  const Ticket = require('./models/Ticket');
  const Transcript = require('./models/Transcript');
  const Log = require('./models/Log');
  const panels = await Panel.find().lean();
  const tickets = await Ticket.find({ closed: false }).lean();
  const transcripts = await Transcript.find().sort({ createdAt: -1 }).limit(20).lean();
  const logs = await Log.find().sort({ createdAt: -1 }).limit(30).lean();
  res.render('dashboard', { panels, tickets, transcripts, logs, botReady: discordBot.ready });
});

app.get('/transcript/:id', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.redirect('/dashboard');
  }
  const Transcript = require('./models/Transcript');
  const t = await Transcript.findById(req.params.id).lean();
  if (!t) return res.status(404).send('Transcript not found');
  res.render('transcript', { transcript: t });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketbot').then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () => {
    console.log(`🚀 Web dashboard running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection failed', err);
  process.exit(1);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('ping', () => socket.emit('pong'));
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
