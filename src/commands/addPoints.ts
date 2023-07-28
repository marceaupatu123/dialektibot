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
    const amount = interaction.options.getInteger("montant")!;
    const user = interaction.options.getUser("membre");
    if (user == null) return;
    await addPoints(user, amount);
    await user.send(
      `<@${user.id}> vous a donné ${amount} points en raison de votre investissement sur le serveur ! Faites \`/level\` pour consulter votre niveau.`
    );
    await interaction.reply({
      content: `Ajout de ${amount} points à <@${user.id}>!`,
      ephemeral: true,
    });
  },
};
