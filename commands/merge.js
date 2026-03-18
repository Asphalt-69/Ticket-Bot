const Panel = require('../models/Panel');
module.exports = {
  name: 'merge',
  description: 'Merge panels into a group.',
  async execute({ message, args }) {
    if (!message.member.permissions.has('ManageGuild')) return message.reply('You need Manage Server permission.');
    const [groupName, ...panelIds] = args;
    if (!groupName || panelIds.length < 2) return message.reply('Usage: $merge <group-name> <panelId1> <panelId2> ...');
    const panels = await Panel.find({ _id: { $in: panelIds } });
    if (panels.length < 2) return message.reply('Provide at least two valid panel IDs.');
    await Panel.updateMany({ _id: { $in: panelIds } }, { mergedGroup: groupName, type: 'merged' });
    return message.reply(`Merged ${panels.length} panels into group ${groupName}.`);
  },
};
