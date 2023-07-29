import { Events, type Message } from "discord.js";
import { config } from "dotenv";
import { addPoints } from "../objects/points";
config();

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message) {
    function getPointsFromMessage(messageLength: number): number {
      return Math.random() * messageLength * 0.00005;
    }
    const pointsToAdd = getPointsFromMessage(message.content.length);
    const user = message.member?.user;
    if (user !== undefined) {
      await addPoints(user, pointsToAdd);
    }
    console.log(`${user?.username!} à reçu ${pointsToAdd} points.`);
  },
};
