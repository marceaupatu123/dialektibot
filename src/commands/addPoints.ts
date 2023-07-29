import {
  SlashCommandBuilder,
  type BaseInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import { addPoints } from "../objects/points";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addpoints")
    .setDescription("Ajoute des points à un utilisateur")
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Le nombre de points")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le nombre de messages")
        .setRequired(true)
    ),
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    await interaction.deferReply({ ephemeral: true });
    const amount = interaction.options.getInteger("montant")!;
    const user = interaction.options.getMember("membre");
    if (user == null) return;
    await addPoints(user, amount);
    await interaction.editReply({
      content: `Ajout de ${amount} points à <@${user.id}>!`,
    });
  },
};
