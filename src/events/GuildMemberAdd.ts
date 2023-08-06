import { Events, type GuildMember, type Role } from "discord.js";
import { config } from "dotenv";
config();

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    const role = member.guild.roles.cache.get("1134530546362482698") as Role;
    if (member != null && role != null) {
      await member.roles.add(role);
    }
  },
};
