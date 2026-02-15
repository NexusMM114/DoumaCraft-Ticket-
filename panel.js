const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = (interaction) => {

  const colors = [0x8B0000, 0xFF0000, 0xDC143C, 0xFF4500];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const embed = new EmbedBuilder()
    .setColor(randomColor)
    .setTitle('✨ DOUMACRAFT - SUPPORT CENTER ✨')
    .setDescription('Select a category below to open a ticket.')
    .setImage('https://cdn.discordapp.com/attachments/1472320097363169335/1472320146948493498/standard.gif')
    .setTimestamp();

  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_select')
    .setPlaceholder('Select category...')
    .addOptions([
      { label: 'General Support', value: 'general' },
      { label: 'Ban Appeal', value: 'appeal' },
      { label: 'Purchase Rank', value: 'purchase' },
      { label: 'Claim Rewards', value: 'reward' }
    ]);

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)]
  };
};