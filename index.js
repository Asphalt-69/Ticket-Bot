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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes(io));

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/dashboard', async (req, res) => {
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
