import {
  ButtonBuilder,
  type Attachment,
  type ThreadChannel,
  type ThreadMember,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import * as fs from "fs";
import * as path from "path"; // Import the 'path' module for working with file paths
import BooksSchema from "../schemas/books";

const editionHouseList = ["Auto-édition", "éditions Acutis"];

function getCategory(channel: ThreadChannel): number[] {
  const ForumId = channel.parent?.id;
  const CategoryId = channel.parent?.parent?.id;
  let categoryNumber = 0;
  let subcategoryNumber = 0;
  switch (CategoryId) {
    case "1131696492193779743": // Religion
      categoryNumber = 0;
      switch (ForumId) {
        case "1131699185624821841": // Catholicisme
          subcategoryNumber = 0;
          break;
        case "1133937338372849745": // Protestantisme
          subcategoryNumber = 1;
          break;
        case "1132458682471419914": // Orthodoxie
          subcategoryNumber = 2;
          break;
        case "1131701947020349511": // Islam
          subcategoryNumber = 3;
          break;
        case "1137067110426742885": // Judaïsme
          subcategoryNumber = 4;
          break;
      }
      break;
    case "1137741539498532945": // Philosophie
      categoryNumber = 1;
      switch (ForumId) {
        case "1137742415340519545": // Métaphysique
          subcategoryNumber = 0;
          break;
        case "1148725377494167602": // Epistémologie
          subcategoryNumber = 1;
          break;
        case "1148725403066847372": // Ethique
          subcategoryNumber = 2;
          break;
      }
      break;
  }
  return [categoryNumber, subcategoryNumber];
}

async function generateDSBN(
  folderPath: string,
  editionHouse: number,
  categories: number[]
): Promise<string> {
  const DSBN = `${editionHouse.toString().padStart(3, "0")}-${categories[0]
    .toString()
    .padStart(2, "0")}-${categories[1]
    .toString()
    .padStart(3, "0")}-${Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")}`;
  const fileName = DSBN + ".pdf";

  return fileName;
}

async function isDSBNExistInSubfolders(
  rootFolder: string,
  dsbn: string
): Promise<boolean> {
  const subfolders = fs
    .readdirSync(rootFolder, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const subfolder of subfolders) {
    const folderPath = path.join(rootFolder, subfolder);
    const filePath = path.join(folderPath + "/" + dsbn);

    if (fs.existsSync(filePath)) {
      return true; // DSBN exists in this subfolder
    }

    const dsbnExistsInSubfolders = await isDSBNExistInSubfolders(
      folderPath,
      dsbn
    );
    if (dsbnExistsInSubfolders) {
      return true; // DSBN exists in a subfolder of this subfolder
    }
  }

  return false; // DSBN does not exist in any subfolder
}

export async function generateBook(
  author: ThreadMember,
  attachment: Attachment,
  channel: ThreadChannel,
  editionHouse: number
): Promise<string> {
  if (author.user === null) throw new Error("author.user is null");
  const opId = author.user?.id;
  const categories = getCategory(channel);
  const folderPath = path.join(__dirname, "../../pdf", opId);

  // Create the user's folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  let dsbn: string;
  let dsbnExists: boolean;

  do {
    dsbn = await generateDSBN(folderPath, editionHouse, categories);
    dsbnExists = await isDSBNExistInSubfolders(
      path.join(__dirname, "../../pdf"),
      dsbn
    );
  } while (dsbnExists);

  const response = await fetch(attachment.url);
  const fileBuffer = Buffer.from(await response.arrayBuffer());
  const splitted = dsbn.split(".");
  try {
    const theSchema = new BooksSchema({
      _id: splitted[0],
      authorID: opId,
      price: 999,
      sells: 0,
      editionHouse: editionHouseList[editionHouse],
      threadID: channel.id,
    });
    await theSchema.save();
  } catch (e) {
    console.log(e);
  }
  fs.writeFileSync(folderPath + "/" + dsbn, fileBuffer);

  const buttonBuy = new ButtonBuilder()
    .setCustomId("buy")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("💸")
    .setLabel("Acheter le livre");

  const buttonPrice = new ButtonBuilder()
    .setCustomId("changeprice")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Changer le prix");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttonBuy,
    buttonPrice
  );
  await channel.send({
    content: `ℹ️ **DBSN:** ${splitted[0]}\n💰 **Prix:** 999\n**🏠 Maison d'édition:** ${editionHouseList[editionHouse]}`,
    components: [row],
  });
  return dsbn;
}

export async function getBook(dsbn: string, userID?: string): Promise<Buffer> {
  if (userID === null) {
    const book = await BooksSchema.findOne({
      _id: dsbn,
    });
    userID = book?.authorID;
  }
  return fs.readFileSync(
    path.join(__dirname, `../../pdf/${userID!}/${dsbn}.pdf`)
  );
}
