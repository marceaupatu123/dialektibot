import { Events, type TextChannel, type GuildMember } from "discord.js";
import { config } from "dotenv";
config();

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember) {
    const channel = member.guild.channels.cache.get(
      process.env.salonLeaveId!
    ) as TextChannel;
    if (member != null && channel != null) {
      await channel.send(
        `**<@${member.id}> (${
          member.nickname ?? member.displayName
        })** à quitté le serveur.`
      );
    }
  },
};
