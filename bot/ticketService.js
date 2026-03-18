const Ticket = require('../models/Ticket');
const Log = require('../models/Log');
const Transcript = require('../models/Transcript');

const cooldownMap = new Map();
const COOLDOWN_MS = 30 * 1000;

async function createTicketForUser({ user, guild, panel, replyTo }) {
  const now = Date.now();
  const last = cooldownMap.get(user.id) || 0;
  if (now - last < COOLDOWN_MS) {
    if (replyTo?.reply) await replyTo.reply({ content: `Cooldown active. Please wait ${(COOLDOWN_MS - (now - last)) / 1000}s.`, ephemeral: true });
    return null;
  }
  cooldownMap.set(user.id, now);

  const existing = await Ticket.findOne({ userId: user.id, closed: false });
  if (existing) {
    if (replyTo?.reply) await replyTo.reply({ content: 'You already have an open ticket.', ephemeral: true });
    return existing;
  }

  const category = guild.channels.cache.get(panel.categoryId);
  const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const channel = await guild.channels.create({
    name: channelName,
    type: 0,
    parent: category ?? null,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
      { id: user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      ...(panel.roles || []).map(rid => ({ id: rid, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] })),
    ],
  });

  const ticket = await Ticket.create({ guildId: guild.id, channelId: channel.id, channelName, panelId: panel._id, userId: user.id, username: user.tag, createdAt: new Date(), closed: false });

  await channel.send({
    content: `${user} Ticket managers, please check this ticket.`,
    embeds: [{ title: 'Ticket Opened', description: 'A staff member will assist you shortly.', color: 0x00FF00 }],
    components: [{ type: 1, components: [{ type: 2, label: 'Claim', style: 3, custom_id: `claim:${ticket._id}` }, { type: 2, label: 'Close', style: 4, custom_id: `close:${ticket._id}` }] }],
  });

  await Log.create({ action: 'ticket_created', details: `${user.tag} created ticket ${channel.name}` });
  if (replyTo?.reply) await replyTo.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
  return ticket;
}

async function claimTicket({ interaction, ticketId, client }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket || ticket.closed) return interaction.reply({ content: 'Ticket not found or already closed.', ephemeral: true });
  ticket.claimId = interaction.user.id;
  ticket.claimerTag = interaction.user.tag;
  await ticket.save();
  await Log.create({ action: 'ticket_claimed', details: `${interaction.user.tag} claimed ticket ${ticket.channelId}` });
  const channel = await client.channels.fetch(ticket.channelId).catch(() => null);
  if (channel) await channel.send(`${interaction.user.tag} claimed this ticket.`);
  return interaction.reply({ content: `✅ Ticket claimed by ${interaction.user.tag}`, ephemeral: true });
}

async function closeTicket({ interaction, ticketId, client }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket || ticket.closed) return interaction.reply({ content: 'Ticket not found or already closed.', ephemeral: true });
  ticket.closed = true;
  ticket.closedBy = interaction.user.id;
  ticket.closedByTag = interaction.user.tag;
  ticket.closedAt = new Date();
  await ticket.save();
  await Log.create({ action: 'ticket_closed', details: `${interaction.user.tag} closed ticket ${ticket.channelId}` });

  const channel = await client.channels.fetch(ticket.channelId).catch(() => null);
  if (channel) {
    const messages = await channel.messages.fetch({ limit: 100 }).catch(() => new Map());
    const transcriptLines = Array.from(messages.values()).reverse().map(m => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content || ''}`);
    const transcriptHtml = `<html><body><h1>Ticket Transcript</h1><pre>${transcriptLines.join('\n')}</pre></body></html>`;
    const transcript = await Transcript.create({ ticketId: ticket._id, channelId: ticket.channelId, userId: ticket.userId, content: transcriptHtml, createdBy: interaction.user.id });
    await channel.send('Ticket closed. Transcript generated.');
    const logsChannelId = process.env.TICKET_LOG_CHANNEL_ID;
    if (logsChannelId) {
      const logsChannel = await client.channels.fetch(logsChannelId).catch(() => null);
      if (logsChannel) await logsChannel.send(`Ticket <#${ticket.channelId}> closed by ${interaction.user.tag}. Transcript ID: ${transcript._id}`);
    }
    await channel.delete('Ticket closed');
    return interaction.reply({ content: `✅ Ticket closed. Transcript ID: ${transcript._id}`, ephemeral: true });
  }

  return interaction.reply({ content: 'Ticket closed (channel not available)', ephemeral: true });
}

module.exports = { createTicketForUser, claimTicket, closeTicket };
