const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

module.exports = {

  async sendReviewDM(client, userId) {
    try {
      const user = await client.users.fetch(userId);

      const ratingMenu = new StringSelectMenuBuilder()
        .setCustomId('rating_select')
        .setPlaceholder('Rate your experience')
        .addOptions([
          { label: '⭐ 1 Star', value: '1' },
          { label: '⭐⭐ 2 Stars', value: '2' },
          { label: '⭐⭐⭐ 3 Stars', value: '3' },
          { label: '⭐⭐⭐⭐ 4 Stars', value: '4' },
          { label: '⭐⭐⭐⭐⭐ 5 Stars', value: '5' }
        ]);

      await user.send({
        content: "Thank you for using DoumaCraft Support! Please rate us:",
        components: [new ActionRowBuilder().addComponents(ratingMenu)]
      });

    } catch (err) {
      console.log("User DMs closed.");
    }
  },

  showFeedbackModal(interaction) {
    const rating = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`feedback_${rating}`)
      .setTitle('Feedback');

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedback_text')
      .setLabel('Write your feedback')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(feedbackInput)
    );

    return interaction.showModal(modal);
  }
};