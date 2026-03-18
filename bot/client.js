require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createTicketForUser, closeTicket, claimTicket } = require('./ticketService');
const Panel = require('../models/Panel');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel],
});
client.commands = new Collection();
client.ready = false;

const prefix = process.env.BOT_PREFIX || '$';
const commandDir = path.join(__dirname, '..', 'commands');
const commandFiles = fs.existsSync(commandDir) ? fs.readdirSync(commandDir).filter(f => f.endsWith('.js')) : [];
for (const file of commandFiles) {
  const command = require(path.join(commandDir, file));
  client.commands.set(command.name, command);
}

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const command = client.commands.get(cmd);
  if (!command) return;
  try {
    await command.execute({ client, message, args, prefix, createTicketForUser, closeTicket, claimTicket });
  } catch (err) {
    console.error('Command error', err);
    message.reply('There was an error running that command.');
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    const [action, id] = interaction.customId.split(':');
    if (action === 'close') return closeTicket({ interaction, ticketId: id, client });
    if (action === 'claim') return claimTicket({ interaction, ticketId: id, client });
    if (action === 'createPanel') {
      const panel = await Panel.findById(id);
      if (!panel) return interaction.reply({ content: 'Panel not found', ephemeral: true });
      const ticket = await createTicketForUser({ user: interaction.user, guild: interaction.guild, panel, replyTo: interaction });
      if (!ticket) return;
      return;
    }
  }
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'help-menu') {
      const selected = interaction.values[0];
      return interaction.reply({ content: `Help selected: ${selected}`, ephemeral: true });
    }
    if (interaction.customId === 'panel-select') {
      const panelId = interaction.values[0];
      const panel = await Panel.findById(panelId);
      if (!panel) return interaction.reply({ content: 'Panel not found', ephemeral: true });
      const ticket = await createTicketForUser({ user: interaction.user, guild: interaction.guild, panel, replyTo: interaction });
      if (!ticket) return;
      return;
    }
  }
});

client.on(Events.ClientReady, () => {
  console.log(`🤖 Discord bot ready: ${client.user.tag}`);
  client.ready = true;
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Discord login failed:', err);
});

module.exports = client;
