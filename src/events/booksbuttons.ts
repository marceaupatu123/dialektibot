import {
  type BaseInteraction,
  ButtonInteraction,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ThreadChannel,
  type ModalSubmitInteraction,
} from "discord.js";
import booksSchema from "../schemas/books";
import { commandDone, notAllowed } from "../messages.json";
import dialekticoin from "../schemas/dialekticoin";
import { getBook } from "../objects/books";

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ButtonInteraction)) return;
    const customId = interaction.customId;
    const channel = interaction.channel;
    if (!(channel instanceof ThreadChannel)) return;
    const owner = await channel.fetchOwner();
    if (customId === "changeprice") {
      if (interaction.user.id !== owner?.id)
        return await interaction.reply({
          content: notAllowed,
          ephemeral: true,
        });
      const pricerowmodal =
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("pricerowmodal")
            .setLabel("Nouveau Prix")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        );

      const modal = new ModalBuilder()
        .setTitle("Prix")
        .setCustomId("pricemodal")
        .setComponents(pricerowmodal);
      await interaction.showModal(modal);
      let repliedModal: ModalSubmitInteraction;
      try {
        repliedModal = await interaction.awaitModalSubmit({
          filter: (i) =>
            i.customId === "pricemodal" && i.user.id === interaction.user.id,
          time: 60000,
        });
      } catch {
        return;
      }
      const oldMessage = interaction.message;
      const newprice = parseInt(
        repliedModal.fields.getTextInputValue("pricerowmodal")
      );
      try {
        const theSchema = await booksSchema.findOneAndUpdate(
          { threadID: interaction.channel?.id },
          { $set: { price: newprice } }
        );
        await theSchema!.save();
        if (theSchema?._id === null || theSchema?.editionHouse === undefined)
          return;
        await oldMessage.edit(
          `ℹ️ **DBSN:** ${theSchema?._id}\n**💰 Prix:** ${newprice}\n**🏠 Maison d'édition:** ${theSchema?.editionHouse}`
        );
      } catch (e) {
        console.log(e);
      }
      return await repliedModal.reply({
        content: commandDone,
        ephemeral: true,
      });
    }
    if (customId === "buy") {
      await interaction.deferReply({ ephemeral: true });
      try {
        const theBookSchema = await booksSchema.findOneAndUpdate({
          threadID: interaction.channel?.id,
        });
        if (theBookSchema === null)
          return await interaction.editReply("Livre introuvable ❌");
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
        const bookPrice = theBookSchema?.price;
        const wallet = theCoinSchema.coins;
        const newMoney = wallet! - bookPrice!;
        if (newMoney < 0)
          return await interaction.editReply({
            content: "Tu n'as pas assez d'argents pour acheter ce livre! ❌",
          });

        theCoinSchema.coins = newMoney;
        await theCoinSchema.save();
        let theAuthorCoinSchema = await dialekticoin.findOneAndUpdate({
          _id: owner?.id,
          $inc: { coins: theBookSchema?.price },
        });
        if (theAuthorCoinSchema == null) {
          // eslint-disable-next-line new-cap
          theAuthorCoinSchema = new dialekticoin({
            _id: owner?.id,
            coins: theBookSchema?.price,
          });
        }
        await theAuthorCoinSchema.save();
        theBookSchema.sells! += 1;
        await theBookSchema.save();
        const pdfFile = await getBook(theBookSchema._id, owner?.id);
        await interaction.user.send({
          content: "",
          files: [
            {
              attachment: pdfFile,
              contentType: "application/pdf",
              name: channel.name + ".pdf",
            },
          ],
        });
        await owner!.user!.send(
          `<@${interaction.user.id}> à acheté votre livre <#${channel.id}>`
        );
      } catch (e) {
        console.log(e);
      }
      return await interaction.editReply("Livre envoyé en message privé ! ✉️");
    }
  },
};
