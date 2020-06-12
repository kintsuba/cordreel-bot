import { Client, VoiceChannel, TextChannel } from "discord.js";
import * as dotenv from "dotenv";
import MisskeyUtils from "./misskey-utils";

const discord = (misskeyUtils: MisskeyUtils): void => {
  dotenv.config();
  const client = new Client();

  const lastSendStrings: { [key: string]: string } = {};

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on("voiceStateUpdate", () => {
    let voiceChannelUserExitsCount = 0;
    const usersArrayVoiceChannelUserExits: string[] = [];

    client.channels.forEach(channel => {
      if (channel.type === "voice" && channel instanceof VoiceChannel) {
        if (channel.members.size > 0) {
          for (const member of channel.members.values()) {
            usersArrayVoiceChannelUserExits.push(member.user.username + "さん");
          }
          const sendString = `${usersArrayVoiceChannelUserExits.join(
            ","
          )}がボイスチャンネル<${channel.name}>にいるよ！`;

          if (sendString !== lastSendStrings[channel.name]) {
            misskeyUtils.noteHome(sendString);

            lastSendStrings[channel.name] = sendString;
          }

          usersArrayVoiceChannelUserExits.length = 0;
          voiceChannelUserExitsCount++;
        }
      }
    });

    if (voiceChannelUserExitsCount === 0) {
      misskeyUtils.noteHome("ボイスチャンネルから誰もいなくなったよ");
    }
  });

  client.on("presenceUpdate", (oldPresence, newPresence) => {
    const excludeGames = [
      "Visual Studio Code",
      "Eclipse IDE",
      "インターネット",
      "Spotify",
      "Custom Status",
      "Microsoft Visual Studio",
      "Google Chrome",
      "Wallpaper Engine",
      "iTunes",
      "foobar2000 :notes:"
    ];

    const notificationChannel = newPresence.guild.channels.find(
      ch => ch.name === "notification"
    ) as TextChannel;

    const userName = newPresence.user.username;

    if (newPresence.presence.game !== null) {
      const gameName = newPresence.presence.game.name;
      if (
        oldPresence.presence.game === null ||
        gameName !== oldPresence.presence.game.name ||
        gameName !== "有栖川夏葉"
      ) {
        if (!excludeGames.includes(gameName))
          notificationChannel.send(
            `${userName}さんが、${gameName}を始めたよ！`
          );
      }
    } else {
      if (oldPresence.presence.game !== null) {
        const gameName = oldPresence.presence.game.name;
        if (!excludeGames.includes(gameName))
          notificationChannel.send(
            `${userName}さんが、${gameName}を終了したよ`
          );
      }
    }
  });

  client.login(process.env.DISCORD_TOKEN);
};

export default discord;
