import type { GuildMember, Role, User } from "discord.js";
import niveauSchema from "../schemas/niveau";

function getPlayerRanks(member: GuildMember, niveau: number): Role[] | boolean {
  const levelRank: Record<number, string> = {
    0: "1134530546362482698",
    5: "1134530842388074496",
    10: "1134531029860892752",
    15: "1134601440267079791",
    20: "1146829301229043832",
    25: "1146829403389689897",
    30: "1169973226319917056",
    35: "1169973518679679076",
    40: "1169974790656884736",
    45: "1169974937918914560",
    50: "1169974937918914560",
  };
  const nereastLevel = Math.floor(niveau / 5) * 5;
  const justBeforeLevel = nereastLevel - 5 > 0 ? nereastLevel - 5 : 0;
  const rankToGive = member.guild.roles.cache.get(levelRank[nereastLevel]);
  const rankToRemove = member.guild.roles.cache.get(levelRank[justBeforeLevel]);
  if (rankToGive === undefined || rankToRemove === undefined) return false;
  return [rankToRemove, rankToGive];
}

export function getLevelWithProgressBar(points: number): [number, string] {
  let level = 0;
  let pointsNeeded = 5;

  while (points >= pointsNeeded) {
    points -= pointsNeeded;
    level++;
    pointsNeeded = Math.floor(2.5 * Math.sqrt(level) + 0.35 * level);
  }

  const progressBar = getProgressBar(points, pointsNeeded);

  return [level, progressBar];
}

export async function addPoints(
  member: GuildMember,
  points: number
): Promise<number> {
  try {
    let theSchema = await niveauSchema.findOneAndUpdate(
      { _id: member.id },
      { $inc: { points } }
    );
    if (theSchema == null) {
      // eslint-disable-next-line new-cap
      theSchema = new niveauSchema({
        _id: member.id,
        points,
      });
    }
    await theSchema.save();
    const roles = getPlayerRanks(
      member,
      getLevelWithProgressBar(theSchema.points ?? 0)[0]
    );
    if (!Array.isArray(roles) || roles[1] === roles[0])
      return theSchema.points ?? 0;
    await member.roles.remove(roles[0]);
    await member.roles.add(roles[1]);
    return theSchema.points ?? 0;
  } catch (error) {
    // Handle the error here if needed
    console.error("Error updating points:", error);
    return 0;
  }
}

export async function getPoints(member: User): Promise<number> {
  try {
    const theSchema = await niveauSchema.findOne({ _id: member.id });
    if (theSchema == null) return 0;
    return theSchema.points ?? 0;
  } catch (error) {
    // Handle the error here if needed
    console.error("Error updating points:", error);
    return 0;
  }
}

function getProgressBar(progress: number, maxProgress: number): string {
  const emoji = "🟩";
  const emptyEmoji = "⬜";

  const progressBarLength = 15; // Longueur maximale de la barre de progression (10 émojis)

  const progressPercentage = (progress / maxProgress) * 100;
  const progressLength = Math.min(
    progressBarLength,
    Math.floor(progressPercentage / (100 / progressBarLength))
  );

  const progressBar =
    emoji.repeat(progressLength) +
    emptyEmoji.repeat(progressBarLength - progressLength);

  const progressBarWithInfo = `${progress} ${progressBar} ${maxProgress}`;

  return progressBarWithInfo;
}
