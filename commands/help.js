const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  name: 'help',
  description: 'Show help embed and dropdown',
  async execute({ message }) {
    const embed = new EmbedBuilder()
      .setTitle('Premium Ticket Bot')
      .setDescription('This is The Premium Discord Ticket Bot designed by asphalt._.6')
      .setColor(0x57f287)
      .addFields(
        { name: 'Features', value: '• Panel-based ticket creation\n• Merged ticket panels\n• Claim system for staff\n• Transcript generation\n• Real-time dashboard control\n• Logging and analytics' }
      );

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder('Choose help topic')
        .addOptions([
          { label: 'Panels', value: 'panels', description: '$create, $publish' },
          { label: 'Tickets', value: 'tickets', description: '$tickets, $rename, Claim, Close' },
        ])
    );

    await message.reply({ embeds: [embed], components: [menu] });
  },
};
