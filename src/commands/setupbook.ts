import {
  SlashCommandBuilder,
  type BaseInteraction,
  ThreadChannel,
  ChatInputCommandInteraction,
} from "discord.js";
import { generateBook } from "../objects/books";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setupbook")
    .setDescription("Met en place un livre")
    .addAttachmentOption((option) =>
      option
        .setName("fichier")
        .setDescription("Le fichier pdf")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("maison-edition")
        .setDescription("ID de la maison d'édition")
        .setRequired(true)
    ),
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;
    if (!(channel instanceof ThreadChannel)) return;
    const op = await channel.fetchOwner();
    const fichier = interaction.options.getAttachment("fichier");
    const maisonEdition = interaction.options.getInteger("maison-edition");
    if (op === null || fichier == null || maisonEdition == null) return;
    const dsbn = await generateBook(op, fichier, channel, maisonEdition);
    return await interaction.editReply(
      `Fichier ajouté avec pour dsbn : ${dsbn}!`
    );
  },
};
