import {
  SlashCommandBuilder,
  type BaseInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import {
  addPoints,
  getLevelWithProgressBar,
  getPlayerRanks,
} from "../objects/points";

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
    const user = interaction.options.getUser("membre");
    if (user == null) return;
    const points = await addPoints(user, amount);
    const member = interaction.guild.members.cache.get(user.id)!;
    const roles = getPlayerRanks(member, getLevelWithProgressBar(points)[0]);
    if (!Array.isArray(roles)) return false;
    await member.roles.remove(roles[0]);
    await member.roles.add(roles[1]);
    await interaction.editReply({
      content: `Ajout de ${amount} points à <@${user.id}>!`,
    });
  },
};
