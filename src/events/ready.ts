import { type Client } from "discord.js";
import { Events, ActivityType } from "discord.js";

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
  },
};
