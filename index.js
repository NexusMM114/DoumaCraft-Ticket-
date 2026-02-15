require('dotenv').config();
const fs = require('fs');
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const panelUI = require('./panel');
const reviewSystem = require('./review');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function loadData() {
  if (!fs.existsSync('./data.json')) {
    fs.writeFileSync('./data.json', JSON.stringify({
      ticketCount: 0,
      claimedBy: {}
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync('./data.json'));
}

function saveData(data) {
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Open Support Panel')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );
  console.log("Commands registered.");
})();

client.once('clientReady', () => {
  console.log(`Bot Online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  const data = loadData();

  if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
    return interaction.reply(panelUI(interaction));
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {

    data.ticketCount++;
    saveData(data);

    const ticketNumber = String(data.ticketCount).padStart(3, '0');

    const channel = await interaction.guild.channels.create({
      name: `dc-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: process.env.CATEGORY_ID,
      topic: interaction.user.id,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: process.env.STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    const claimBtn = new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('Claim')
      .setStyle(ButtonStyle.Primary);

    const closeBtn = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger);

    await channel.send({
      content: `<@&${process.env.STAFF_ROLE_ID}>`,
      components: [new ActionRowBuilder().addComponents(claimBtn, closeBtn)]
    });

    return interaction.reply({
      content: `Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId === 'claim_ticket') {

    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID))
      return interaction.reply({ content: "Staff only.", ephemeral: true });

    data.claimedBy[interaction.channel.id] = interaction.user.id;
    saveData(data);

    return interaction.reply(`Claimed by ${interaction.user}`);
  }

  if (interaction.isButton() && interaction.customId === 'close_ticket') {

    const claimer = data.claimedBy[interaction.channel.id];

    if (!claimer || claimer !== interaction.user.id)
      return interaction.reply({
        content: "Only the claimer can close this ticket.",
        ephemeral: true
      });

    await interaction.deferReply({ ephemeral: true });

    await reviewSystem.sendReviewDM(client, interaction.channel.topic);

    await interaction.editReply("Ticket closed.");
    setTimeout(() => interaction.channel.delete(), 2000);
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'rating_select') {
    return reviewSystem.showFeedbackModal(interaction);
  }

});

client.login(process.env.TOKEN);