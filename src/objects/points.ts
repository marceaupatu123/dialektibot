import type { User } from "discord.js";
import niveauSchema from "../schemas/niveau";

export async function addPoints(
  member: User,
  points: number
): Promise<boolean> {
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
    return true;
  } catch (error) {
    // Handle the error here if needed
    console.error("Error updating points:", error);
    return false;
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

export function getLevelWithProgressBar(points: number): [number, string] {
  const originalPoints = points;
  let level = 0;
  let pointsNeeded = 2;

  while (originalPoints >= pointsNeeded) {
    level++;
    pointsNeeded = Math.floor(pointsNeeded * 1.3); // Progression exponentielle de 1.5
  }

  const progressBar = getProgressBar(originalPoints, pointsNeeded);

  return [level, progressBar];
}
