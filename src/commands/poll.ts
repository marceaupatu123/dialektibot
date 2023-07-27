import {
  SlashCommandBuilder,
  BaseGuildTextChannel,
  type BaseInteraction,
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { footer, commandDone } from "../messages.json";
import makeGraph from "../objects/graph";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Fais un sondage")
    .addStringOption((option) =>
      option
        .setName("titre")
        .setRequired(true)
        .setDescription("Titre du sondage")
    )
    .addStringOption((option) =>
      option
        .setName("option1")
        .setRequired(true)
        .setDescription("Première Option")
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setRequired(true)
        .setDescription("Deuxième Option")
    )
    .addStringOption((option) =>
      option
        .setName("option3")
        .setRequired(false)
        .setDescription("Troisième Option")
    )
    .addStringOption((option) =>
      option
        .setName("option4")
        .setRequired(false)
        .setDescription("Quatrième Option")
    )
    .addStringOption((option) =>
      option
        .setName("option5")
        .setRequired(false)
        .setDescription("Cinquième Option")
    ),

  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    const channel = interaction.channel;
    if (!(channel instanceof BaseGuildTextChannel)) return;
    await interaction.deferReply({ ephemeral: true });
    const optionsArray = [
      interaction.options.getString("option1"),
      interaction.options.getString("option2"),
      interaction.options.getString("option3"),
      interaction.options.getString("option4"),
      interaction.options.getString("option5"),
    ];

    const filteredArray = optionsArray.filter(
      (n, index): n is string =>
        typeof n === "string" && optionsArray.indexOf(n) === index
    );

    const filteredArrayWithoutEmoji = filteredArray.map((s: string) =>
      s.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      )
    );
    const initialData = filteredArray.map(() => 0);
    const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

    const buttons = filteredArray.map((option, index) =>
      new ButtonBuilder()
        .setCustomId(`${option}`)
        .setLabel(option)
        .setEmoji(numberEmojis[index])
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const attachment = new AttachmentBuilder(
      makeGraph(filteredArrayWithoutEmoji, initialData),
      { name: "graph.png" }
    );
    const avatar =
      interaction.member.displayAvatarURL() ??
      "https://cdn5.vectorstock.com/i/1000x1000/41/14/flat-design-hand-holding-survey-test-paper-vector-7724114.jpg";
    const embed = new EmbedBuilder()
      .setImage("attachment://graph.png")
      .setColor("#0c3e89")
      .setFooter(footer)
      .setAuthor({
        name: interaction.member.displayName,
        iconURL: avatar,
      })
      .setTitle(`Sondage 📊 ${interaction.options.getString("titre")!}`);

    const message = await interaction.channel!.send({
      files: [attachment],
      embeds: [embed],
      components: [row],
    });
    await interaction.editReply({ content: commandDone });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    const voteData = new Map();
    const votes = [...initialData];

    collector.on("collect", async (interaction) => {
      await interaction.deferReply({ ephemeral: true });
      const index = filteredArray.indexOf(interaction.customId);
      if (index === -1) return;

      // Si le membre a déjà voté, retire son vote précédent
      if (voteData.has(interaction.member)) {
        const previousIndex = filteredArray.indexOf(
          voteData.get(interaction.member)
        );
        if (previousIndex !== -1) {
          votes[previousIndex]--;
        }
      }

      // Met à jour le tableau des votes et le tableau des membres qui ont voté
      votes[index]++;
      voteData.set(interaction.member, interaction.customId);

      // Met à jour le graphique et envoie une réponse à l'utilisateur
      const updatedAttachment = new AttachmentBuilder(
        makeGraph(filteredArrayWithoutEmoji, votes),
        { name: "graph.png" }
      );
      await interaction.editReply({
        content: "Vote comptabilisé 🫡",
      });

      await message.edit({
        embeds: [
          EmbedBuilder.from(embed).setDescription(
            `**Nombre de votants total:** ${voteData.size}`
          ),
        ],
        files: [updatedAttachment],
        components: [row],
      });
    });
  },
};
