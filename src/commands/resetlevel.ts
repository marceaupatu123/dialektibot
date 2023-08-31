import {
  SlashCommandBuilder,
  type BaseInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import { addPoints } from "../objects/points";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetlevel")
    .setDescription("Permet réajuster les niveaux"),
  async execute(interaction: BaseInteraction) {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    await interaction.deferReply();
    const members = await interaction.channel?.guild.members.fetch();
    if (members !== undefined) {
      const levelRank: Record<number, string> = {
        0: "1134530546362482698",
        5: "1134530842388074496",
        10: "1134531029860892752",
        15: "1134601440267079791",
        20: "1146829301229043832",
        25: "1146829403389689897",
      };
      for (const elementMember of members) {
        for (const elementRank of Object.values(levelRank)) {
          const role = elementMember[1].guild.roles.cache.get(elementRank);
          if (role !== undefined) {
            await elementMember[1].roles.remove(role);
          }
        }
        await addPoints(elementMember[1], 0);
        console.log(`niveau de ${elementMember[1].user.username} réajusté`);
      }
      await interaction.editReply("Fini !");
    }
  },
};
