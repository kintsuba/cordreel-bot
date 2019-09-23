import { Client, VoiceChannel } from "discord.js";
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

  client.login(process.env.DISCORD_TOKEN);
};

export default discord;
