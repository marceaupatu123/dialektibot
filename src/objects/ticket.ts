import { config } from "dotenv";
import {
  type Client,
  type GuildMember,
  type Guild,
  type TextChannel,
  ChannelType,
  ThreadAutoArchiveDuration,
  type ThreadChannel,
  EmbedBuilder,
  ForumChannel,
} from "discord.js";
import { footer } from "../messages.json";
config();

export default class Ticket {
  member: GuildMember;
  type: string;
  thread: ThreadChannel;
  id: string;
  private static guild: Guild; // Add static keyword here
  private static ticketChannel: TextChannel; // Add static keyword here

  private constructor(
    member: GuildMember,
    type: string,
    thread: ThreadChannel,
    id: string
  ) {
    this.member = member;
    this.type = type;
    this.thread = thread;
    this.id = id;
  }

  static async create(
    client: Client,
    member: GuildMember,
    type: string
  ): Promise<Ticket> {
    this.guild = client.guilds.cache.get(process.env.localGuildId!) as Guild;
    const ticketChannelId: string =
      type === "report"
        ? process.env.salonPlainteId!
        : process.env.salonSupportId!;
    this.ticketChannel = this.guild.channels.cache.get(
      ticketChannelId
    ) as TextChannel;
    const id = Math.random().toString(36).substr(2, 5);
    const thread = await this.ticketChannel.threads.create({
      name: `ticket-${id}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      type: ChannelType.PrivateThread,
      invitable: false,
      reason: `Ticket ouvert par ${member.toString()}`,
    });
    await thread.members.add(member, "Créateur du ticket");
    const salonQuestion = this.guild.channels.cache.get(
      process.env.salonQuestionId!
    );
    if (!(salonQuestion instanceof ForumChannel))
      throw new Error("salonQuestion not found!");
    let embedBonus;
    if (type === "report") {
      embedBonus = new EmbedBuilder()
        .setImage(
          "https://media.discordapp.net/attachments/1103004857289416754/1104812702339170337/Capture_decran_2023-05-07_185043.png?width=1440&height=350"
        )
        .setColor("#6cc354");
    } else {
      embedBonus = new EmbedBuilder()
        .setImage(
          "https://media.discordapp.net/attachments/1103004857289416754/1104812711684091974/Capture_decran_2023-05-07_185019.png?width=1440&height=347"
        )
        .setColor("#6cc354");
    }
    const embed = new EmbedBuilder()
      .setThumbnail(
        "https://media.discordapp.net/attachments/1102989329879531624/1104382930362585179/2Q-removebg-preview.png?width=105&height=86"
      )
      .setColor("#6cc354")
      .setDescription(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        `Bienvenu dans ton ticket ${member.toString()}!\n Merci de nous faire confiance pour régler ton problème, un membre de nos équipes va venir t'aider à résoudre ton problème.\nSi tu as simplement des questions nous t'invitons à favoriser le salon ${salonQuestion.toString()} et fermer ce ticket.`
      )
      .addFields({
        name: "<:Candidature:1104411389361147985> Instructions",
        value:
          "➡️ Décris ta situation clairement à la suite de ce message, plus tu sera détaillé dans ta description et plus le processus sera rapide et efficace.\n➡️ Soit respectueux dans ta demande ! Prend ton mal en patience et ne te montre pas agressif.\n➡️ Répond dans les dernière 24h suivant une réponse du staff, auquel cas ton ticket sera automatiquement fermé.",
      })
      .setFooter(footer);
    await thread.send({ embeds: [embedBonus, embed] });
    return new Ticket(member, type, thread, id);
  }
}
