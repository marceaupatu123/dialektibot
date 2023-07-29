import { Events, type Message } from "discord.js";
import { config } from "dotenv";
import { addPoints, getLevelWithProgressBar } from "../objects/points";
config();

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message) {
    function getPointsFromMessage(messageLength: number): number {
      return Math.random() * messageLength * 0.00005;
    }
    const pointsToAdd = getPointsFromMessage(message.content.length);
    const user = message.member;
    let pointsAmount;
    if (user !== null) {
      pointsAmount = await addPoints(user, pointsToAdd);
      if (pointsAmount !== undefined) {
        const oldLevel = getLevelWithProgressBar(pointsAmount - pointsToAdd)[0];
        const newLevel = getLevelWithProgressBar(pointsAmount)[0];
        if (oldLevel !== newLevel)
          await message.channel.send(
            `<@${user?.id}> est passé niveau ${newLevel}!`
          );
      }
    }
  },
};
