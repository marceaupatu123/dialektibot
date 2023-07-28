import { config } from "dotenv";
import * as fs from "fs";
import * as mongoose from "mongoose";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
const path = require("path");

config();

const client: any = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));

commandFiles.forEach((file: string) => {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (
    Object.prototype.hasOwnProperty.call(command, "data") &&
    Object.prototype.hasOwnProperty.call(command, "execute")
  ) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
});

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));

eventFiles.forEach((file: string) => {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  try {
    if (Object.prototype.hasOwnProperty.call(event, "once") && event.once) {
      client.once(event.name, (...args: any) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any) => event.execute(...args));
    }
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.InteractionCreate, async (interaction: any) => {
  if (
    !interaction.isChatInputCommand() &&
    !interaction.isUserContextMenuCommand()
  ) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.botToken);
(() => {
  mongoose
    .connect(process.env.dbLink!)
    .then(() => {
      // Connected successfully, do something here if needed
    })
    .catch((error) => {
      console.error(error);
    });
})();
