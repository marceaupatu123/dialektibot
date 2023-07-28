import { type Client } from "discord.js";
import { Events, ActivityType } from "discord.js";
// import {
//   getLevelWithProgressBar,
//   getPlayerRanks,
//   getPoints,
// } from "../objects/points";

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    if (client.user === null) return;
    client.user.setStatus("idle");
    client.user.setActivity("Démarrage du Bot", {
      type: ActivityType.Streaming,
    });
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setStatus("online");
    client.user.setActivity("les débats sur le serveur", {
      type: ActivityType.Watching,
    });
    //   const guild = client.guilds.cache.get("1086341017575366737")!;
    //   for (const [_, member] of await guild.members.fetch()!) {
    //     const roles = getPlayerRanks(
    //       member,
    //       getLevelWithProgressBar(await getPoints(member.user))[0]
    //     );
    //     if (Array.isArray(roles)) {
    //       await member.roles.remove(roles[0]);
    //       await member.roles.add(roles[1]);
    //     }
    //     console.log(`${member.user.username}`);
    //   }
    //   console.log("Fini !");
  },
};
