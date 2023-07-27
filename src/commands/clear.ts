import {
  SlashCommandBuilder,
  BaseGuildTextChannel,
  type BaseInteraction,
  ChatInputCommandInteraction,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprime un nombre spécifique de messages")
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Le nombre de messages")
        .setRequired(true)
    ),
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    const amount = interaction.options.getInteger("montant");
    // Delete the specified number of messages
    const channel = interaction.channel;
    if (!(channel instanceof BaseGuildTextChannel)) return;
    const messages = await channel.bulkDelete(amount!);
    await interaction.reply({
      content: `Supression de ${messages.size} messages!`,
      ephemeral: true,
    });
  },
};
