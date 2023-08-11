import { Events, type GuildMember, type VoiceState } from "discord.js";
import { config } from "dotenv";
import { addPoints } from "../objects/points";
config();

const joinTimes = new Map<string, number>();

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState: VoiceState, newState: VoiceState) {
    if (
      oldState.channel !== null &&
      newState.channel === null &&
      oldState.channel.id !== "1139610035866062918"
    ) {
      const member = oldState.member as GuildMember;
      const joinTime = joinTimes.get(member.id);
      joinTimes.delete(member.id);
      if (joinTime !== undefined) {
        const timeSpent = Date.now() - joinTime;
        const minutes = timeSpent / 1000 / 60;
        const pointsToAdd = Math.random() * minutes * 0.005;
        if (member.user !== null) {
          await addPoints(member, pointsToAdd);
         // console.log(`Added ${pointsToAdd} to ${member.user.username}`);
        }
      }
    } else if (oldState.channel === null && newState.channel !== null) {
      const member = newState.member as GuildMember;
      const currentTime = Date.now();
      joinTimes.set(member.id, currentTime);
    }
  },
};
