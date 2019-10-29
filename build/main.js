"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("websocket"));
const moment_1 = __importDefault(require("moment"));
require("moment/locale/ja");
const misskey_utils_1 = __importDefault(require("./misskey-utils"));
const periodically_jobs_1 = __importDefault(require("./periodically-jobs"));
const weather_1 = __importDefault(require("./weather"));
const blackjack_1 = __importDefault(require("./blackjack"));
const discord_1 = __importDefault(require("./discord"));
const dotenv = __importStar(require("dotenv"));
moment_1.default.locale("ja");
dotenv.config();
const token = process.env.MISSKEY_TOKEN;
const client = new WebSocket.client();
const weather = new weather_1.default();
const blackjacks = [];
let isRunOnceFunction;
const replyUser = (data, misskeyUtils) => {
    if (/かわいい|可愛い|カワイイ/.test(data.body.body.text)) {
        misskeyUtils.message("えへへ……ありがとう！", data.body.body.id);
    }
    else if (/ありがと/.test(data.body.body.text)) {
        misskeyUtils.message("どういたしまして！", data.body.body.id);
    }
    else if (/偉い|えらい/.test(data.body.body.text)) {
        misskeyUtils.message("えへへ……", data.body.body.id);
    }
    else if (/コードリール/.test(data.body.body.text)) {
        misskeyUtils.message("はーい！", data.body.body.id);
    }
    else if (/おはよ/.test(data.body.body.text)) {
        misskeyUtils.message("おはよ！今日も1日頑張ろうね！", data.body.body.id);
    }
    else if (/こんにち(は|わ)/.test(data.body.body.text)) {
        misskeyUtils.message("こんにちは！", data.body.body.id);
    }
    else if (/こんばん(は|わ)/.test(data.body.body.text)) {
        misskeyUtils.message("こんばんは！", data.body.body.id);
    }
    else if (/おやす/.test(data.body.body.text)) {
        misskeyUtils.message("おやすみなさい！", data.body.body.id);
    }
    else if (/天気/.test(data.body.body.text)) {
        const weatherMap = weather.localeMap;
        let doNote = false;
        for (const [key, value] of weatherMap) {
            if (new RegExp(key).test(data.body.body.text)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const note = async () => {
                    return misskeyUtils.note({
                        cw: key + "の天気予報だよ",
                        text: key + "\n" + (await weather.get(value)),
                        visibility: misskey_utils_1.default.Visibility.Home,
                        replyId: data.body.body.id
                    });
                };
                note();
                doNote = true;
                break;
            }
        }
        if (!doNote) {
            misskeyUtils.message("地名を併せて教えてね！\n今対応しているのは「" +
                [...weatherMap.keys()].join("、") +
                "」だよ！", data.body.body.id);
        }
    }
    else if (/ブラックジャック|BJ|bj/.test(data.body.body.text)) {
        blackjacks.push(new blackjack_1.default(data.body.body.id, misskeyUtils));
    }
    else {
        misskeyUtils.message("なーにー？", data.body.body.id);
    }
};
const messageUser = (data, misskeyUtils) => {
    if (/かわいい|可愛い|カワイイ/.test(data.body.body.text)) {
        misskeyUtils.message("えへへ……ありがとう！", data.body.body.userId);
    }
    else if (/ありがと/.test(data.body.body.text)) {
        misskeyUtils.message("どういたしまして！", data.body.body.userId);
    }
    else if (/偉い|えらい/.test(data.body.body.text)) {
        misskeyUtils.message("えへへ……", data.body.body.userId);
    }
    else if (/コードリール/.test(data.body.body.text)) {
        misskeyUtils.message("はーい！", data.body.body.userId);
    }
    else if (/おはよ/.test(data.body.body.text)) {
        misskeyUtils.message("おはよ！今日も1日頑張ろうね！", data.body.body.userId);
    }
    else if (/こんにち(は|わ)/.test(data.body.body.text)) {
        misskeyUtils.message("こんにちは！", data.body.body.userId);
    }
    else if (/こんばん(は|わ)/.test(data.body.body.text)) {
        misskeyUtils.message("こんばんは！", data.body.body.userId);
    }
    else if (/おやす/.test(data.body.body.text)) {
        misskeyUtils.message("おやすみなさい！", data.body.body.userId);
    }
    else if (/天気/.test(data.body.body.text)) {
        const weatherMap = weather.localeMap;
        let doNote = false;
        for (const [key, value] of weatherMap) {
            if (new RegExp(key).test(data.body.body.text)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const note = async () => {
                    return misskeyUtils.note({
                        cw: key + "の天気予報だよ",
                        text: key + "\n" + (await weather.get(value)),
                        visibility: misskey_utils_1.default.Visibility.Home,
                        replyId: data.body.body.userId
                    });
                };
                note();
                doNote = true;
                break;
            }
        }
        if (!doNote) {
            misskeyUtils.message("地名を併せて教えてね！\n今対応しているのは「" +
                [...weatherMap.keys()].join("、") +
                "」だよ！", data.body.body.userId);
        }
    }
    else if (/ブラックジャック|BJ|bj/.test(data.body.body.text)) {
        // blackjacks.push(new Blackjack(data.body.body.userid, misskeyUtils));
    }
    else {
        misskeyUtils.message("なーにー？", data.body.body.userId);
    }
};
client.on("connectFailed", error => {
    console.log("Connect Error: " + error.toString());
    setTimeout(() => client.connect("wss://misskey.m544.net/streaming?i=" + token), 6000);
});
client.on("connect", connection => {
    console.log("WebSocket Client Connected");
    if (token === undefined)
        return;
    const misskeyUtils = new misskey_utils_1.default(token, connection);
    if (!isRunOnceFunction) {
        periodically_jobs_1.default(misskeyUtils);
        discord_1.default(misskeyUtils);
        isRunOnceFunction = true;
    }
    misskeyUtils.noteHome("起動したよ！");
    connection.on("error", error => {
        console.log("Connection Error: " + error.toString());
        setTimeout(() => client.connect("wss://misskey.m544.net/streaming?i=" + token), 6000);
    });
    connection.on("close", () => {
        console.log("WebSocket Client Closed");
        setTimeout(() => client.connect("wss://misskey.m544.net/streaming?i=" + token), 6000);
    });
    connection.on("message", message => {
        if (!message.utf8Data)
            return;
        const data = JSON.parse(message.utf8Data);
        if (data.body.id === "formain" && data.body.type === "followed") {
            misskeyUtils.follow(data.body.body.id);
        }
        else if (data.body.id === "formain" && data.body.type === "mention") {
            replyUser(data, misskeyUtils);
        }
        else if (data.body.id === "formain" &&
            data.body.type === "messagingMessage") {
            messageUser(data, misskeyUtils);
        }
        else if (data.type === "noteUpdated") {
            console.log("noteUpdated");
            for (let i = blackjacks.length - 1; i >= 0; i--) {
                blackjacks[i].update(data.body);
                if (blackjacks[i].isQuit) {
                    blackjacks.splice(i, 1);
                }
                else if (blackjacks[i].isContinue) {
                    blackjacks[i].isContinue = false;
                    blackjacks[i].isQuit = true;
                    blackjacks.push(new blackjack_1.default(blackjacks[i].id, misskeyUtils));
                }
            }
        }
        else if (data.body.id === "forglobaltl") {
            console.log(data.body.body.text + moment_1.default().format("LLLL"));
        }
        console.log(data);
    });
    connection.sendUTF(misskey_utils_1.default.connectMainJson);
    connection.sendUTF(misskey_utils_1.default.connectGlobalTLJson);
});
client.connect("wss://misskey.m544.net/streaming?i=" + token);
//# sourceMappingURL=main.js.map