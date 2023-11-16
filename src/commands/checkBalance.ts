import {
  SlashCommandBuilder,
  type BaseInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import {
  addPoints
} from "../objects/points";
import { footer } from "../messages.json";
import dialekticoin from "src/schemas/dialekticoin";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dilaekticoin")
    .setDescription("Permet de voir l'argent d'un joueur")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("L'utilisateur")
        .setRequired(false)
    ),
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    const user = interaction.options.getUser("membre") ?? interaction.user;
    let theCoinSchema = await dialekticoin.findOne({
      _id: interaction.user.id,
    });
    if (theCoinSchema == null) {
      // eslint-disable-next-line new-cap
      theCoinSchema = new dialekticoin({
        _id: interaction.user.id,
        coins: 0,
      });
      await theCoinSchema.save();
    }
    const embed = new EmbedBuilder()
      .setTitle(`Niveau de ${user.username}`)
      .setDescription(
        `<@${user.id}> a ${theCoinSchema.coins!} dialekticoins**.`
      )
      .setFooter(footer);
    await addPoints(interaction.guild.members.cache.get(user.id)!, 0);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  },
};
