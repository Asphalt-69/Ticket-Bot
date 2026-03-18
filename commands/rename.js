const Ticket = require('../models/Ticket');
module.exports = {
  name: 'rename',
  description: 'Rename ticket channel',
  async execute({ message, args }) {
    const [channelMention, ...nameParts] = args;
    const newName = nameParts.join('-');
    if (!channelMention || !newName) return message.reply('Usage: $rename <#channel> <new-name>');
    const channelId = channelMention.replace(/[^0-9]/g, '');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) return message.reply('Channel not found.');
    await channel.setName(newName.substring(0, 100));
    await Ticket.findOneAndUpdate({ channelId }, { channelName: channel.name });
    await message.reply(`Ticket renamed to ${newName}`);
  },
};
