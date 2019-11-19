"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
const discord = (misskeyUtils) => {
    dotenv.config();
    const client = new discord_js_1.Client();
    const lastSendStrings = {};
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
    client.on("voiceStateUpdate", () => {
        let voiceChannelUserExitsCount = 0;
        const usersArrayVoiceChannelUserExits = [];
        client.channels.forEach(channel => {
            if (channel.type === "voice" && channel instanceof discord_js_1.VoiceChannel) {
                if (channel.members.size > 0) {
                    for (const member of channel.members.values()) {
                        usersArrayVoiceChannelUserExits.push(member.user.username + "さん");
                    }
                    const sendString = `${usersArrayVoiceChannelUserExits.join(",")}がボイスチャンネル<${channel.name}>にいるよ！`;
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
exports.default = discord;
//# sourceMappingURL=discord.js.map