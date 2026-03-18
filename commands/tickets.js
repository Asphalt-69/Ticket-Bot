const Ticket = require('../models/Ticket');
const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'tickets',
  description: 'List open tickets',
  async execute({ message }) {
    const tickets = await Ticket.find({ closed: false }).lean();
    if (!tickets.length) return message.reply('No open tickets.');
    const embed = new EmbedBuilder().setTitle('Open Tickets').setColor(0x0099ff);
    for (const t of tickets.slice(0, 10)) {
      const channelName = t.channelName || t.channelId;
      const link = `https://discord.com/channels/${t.guildId}/${t.channelId}`;
      embed.addFields({ name: `${channelName}`, value: `• [Open](${link})\n• Created by: <@${t.userId}>\n• Claimed by: ${t.claimerTag || 'None'}\n• Created at: ${t.createdAt ? new Date(t.createdAt).toUTCString() : 'N/A'}` });
    }
    await message.reply({ embeds: [embed] });
  },
};
