import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder().setName("spawn").setDescription("Wow"),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setImage(
        "https://cdn.discordapp.com/attachments/1103004857289416754/1104812719409999923/Capture_decran_2023-05-07_184954.png"
      )
      .setColor("#6cc354");
    const embed2 = new EmbedBuilder()
      .setTitle("📋 Il est interdit de ...")
      .setDescription(
        `
      > 1・Publier quelconque Discord sur celui-ci.
      > 2・Afficher du contenu pornographique ou discriminant.
      > 3・Menacer ou harceler un utilisateur.
      > 4・Publier du contenu protégé par des droits d'auteur.
      > 5・Faire de la vente/publicité hors-contexte du serveur.
      > 6・Utiliser un pseudo "Troll", douteux ou non-notifiable.
      > 7・Partager des médias ou rumeurs de nature à choquer.
      > 8・Débattre de sujets polémiques ou politiques.
      > 9・Abuser de caractères majuscules ainsi que spam.
      > 10・Abuser du système de réponses des bots.
      > 11・Mentionner une personne inutilement ou à répétition.
      > 12・Insulter ou manquer de respect à un utilisateur.
      > 13・Publier des informations personnelles.
      > 14・Créer des comptes alternatifs/doubles.`
      )
      .setFooter({
        text: "Dominus_Marceau#8457",
        iconURL:
          "https://cdn.discordapp.com/avatars/284036155928870912/f47336d8ca45a1b69d55420dd88c6bd4.webp?size=160",
      })
      .setColor("#6cc354");
    await interaction.channel?.send({ embeds: [embed, embed2] });
  },
};
