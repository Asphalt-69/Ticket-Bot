const express = require('express');
const Panel = require('../models/Panel');
const Ticket = require('../models/Ticket');
const Log = require('../models/Log');

module.exports = function(io) {
  const router = express.Router();

  router.get('/panels', async (req, res) => {
    const panels = await Panel.find().lean();
    res.json(panels);
  });

  router.post('/panels', async (req, res) => {
    const panel = await Panel.create(req.body);
    io.emit('panel_created', panel);
    res.json(panel);
  });

  router.put('/panels/:id', async (req, res) => {
    const panel = await Panel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.emit('panel_updated', panel);
    res.json(panel);
  });

  router.delete('/panels/:id', async (req, res) => {
    await Panel.findByIdAndDelete(req.params.id);
    io.emit('panel_deleted', { id: req.params.id });
    res.json({ success: true });
  });

  router.get('/tickets', async (req, res) => {
    const tickets = await Ticket.find().lean();
    res.json(tickets);
  });

  router.get('/logs', async (req, res) => {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(logs);
  });

  return router;
};
