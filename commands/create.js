const Panel = require('../models/Panel');
module.exports = {
  name: 'create',
  description: 'Create a ticket panel',
  async execute({ message, args }) {
    if (!message.member.permissions.has('ManageGuild')) return message.reply('You need Manage Server permission.');
    const [name, categoryId, rolesCsv, uiType = 'button'] = args;
    if (!name || !categoryId || !rolesCsv) return message.reply('Usage: $create <panel-name> <categoryId> <role1,role2,...> [button|dropdown]');
    const roles = rolesCsv.split(',').map(r => r.trim()).filter(Boolean);
    const panel = await Panel.create({ name, roles, categoryId, type: 'individual', uiType: uiType === 'dropdown' ? 'dropdown' : 'button', createdBy: message.author.id });
    await message.reply(`✅ Panel created: ${panel.name} (ID: ${panel._id}) with roles ${roles.join(', ')}`);
  },
};
