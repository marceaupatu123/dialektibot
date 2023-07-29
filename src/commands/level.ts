import {
  SlashCommandBuilder,
  type BaseInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getLevelWithProgressBar, getPoints } from "../objects/points";
import { footer } from "../messages.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Permet de voir le niveau d'un utilisateur")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("L'utilisateur")
        .setRequired(false)
    ),
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    const user = interaction.options.getUser("membre") ?? interaction.user;
    const points = Math.floor(await getPoints(user));
    const level = getLevelWithProgressBar(points);
    const embed = new EmbedBuilder()
      .setTitle(`Niveau de ${user.username}`)
      .setDescription(
        `<@${user.id}> est **niveau ${level[0]}** et il a accumulé un total de **${points} points**.`
      )
      .addFields({ name: "Barre de progression", value: level[1] })
      .setFooter(footer);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  },
};
