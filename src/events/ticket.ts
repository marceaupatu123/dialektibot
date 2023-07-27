import { type BaseInteraction, ButtonInteraction, Events } from "discord.js";
import Ticket from "../objects/ticket";
import { commandDone } from "../messages.json";

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ButtonInteraction)) return;
    const customId = interaction.customId;
    if (!(customId === "support" || customId === "report")) return;
    await Ticket.create(interaction.client, interaction.member, customId);
    return await interaction.reply({ content: commandDone, ephemeral: true });
  },
};
