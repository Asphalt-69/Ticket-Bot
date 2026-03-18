const Panel = require('../models/Panel');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  name: 'publish',
  description: 'Publish panel to channel',
  async execute({ message, args }) {
    if (!message.member.permissions.has('ManageGuild')) return message.reply('You need Manage Server permission.');
    const [panelId, kind = 'individual', uiType = 'button', title = 'Open Ticket', ...rest] = args;
    const description = rest.slice(0, 1).join(' ') || 'Click to create a ticket';
    const color = rest.slice(1).join(' ') || '#00FF00';
    if (!panelId) return message.reply('Usage: $publish <panelId> [individual|merged] [button|dropdown] [title] [description] [color]');

    const panel = await Panel.findById(panelId);
    if (!panel) return message.reply('Panel not found');

    panel.type = kind === 'merged' ? 'merged' : 'individual';
    panel.uiType = uiType === 'dropdown' ? 'dropdown' : 'button';
    panel.embedTitle = title;
    panel.embedDescription = description;
    panel.embedColor = color;
    await panel.save();

    const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
    if (panel.uiType === 'dropdown') {
      const allPanels = await Panel.find({ mergedGroup: panel.mergedGroup || '' });
      const options = allPanels.slice(0, 25).map(p => ({ label: p.name, value: p._id.toString(), description: p.embedDescription || 'Open ticket' }));
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('panel-select').setPlaceholder('Select ticket panel').addOptions(options.length ? options : [{ label: panel.name, value: panel._id.toString(), description: 'Open ticket' }])
      );
      await message.channel.send({ embeds: [embed], components: [menu] });
    } else {
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`createPanel:${panel._id}`).setLabel('Create Ticket').setStyle(ButtonStyle.Primary)
      );
      await message.channel.send({ embeds: [embed], components: [button] });
    }

    await message.reply('✅ Panel published successfully.');
  },
};
