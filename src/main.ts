import * as WebSocket from "websocket";
import moment from "moment";
import "moment/locale/ja";
import MisskeyUtils from "./misskey-utils";
import periodicallyJobs from "./periodically-jobs";
import Weather from "./weather";
import Blackjack from "./blackjack";
import discord from "./discord";
import * as dotenv from "dotenv";

moment.locale("ja");
dotenv.config();

const token = process.env.MISSKEY_TOKEN;

const client = new WebSocket.client();
const weather = new Weather();

const blackjacks: Blackjack[] = [];
let isRunOnceFunction: boolean;

const replyUser = (data: any, misskeyUtils: MisskeyUtils): void => {
  if (/かわいい|可愛い|カワイイ/.test(data.body.body.text)) {
    misskeyUtils.replyHome("えへへ……ありがとう！", data.body.body.id);
  } else if (/ありがと/.test(data.body.body.text)) {
    misskeyUtils.replyHome("どういたしまして！", data.body.body.id);
  } else if (/偉い|えらい/.test(data.body.body.text)) {
    misskeyUtils.replyHome("えへへ……", data.body.body.id);
  } else if (/コードリール/.test(data.body.body.text)) {
    misskeyUtils.replyHome("はーい！", data.body.body.id);
  } else if (/おはよ/.test(data.body.body.text)) {
    misskeyUtils.replyHome("おはよ！今日も1日頑張ろうね！", data.body.body.id);
  } else if (/こんにち(は|わ)/.test(data.body.body.text)) {
    misskeyUtils.replyHome("こんにちは！", data.body.body.id);
  } else if (/こんばん(は|わ)/.test(data.body.body.text)) {
    misskeyUtils.replyHome("こんばんは！", data.body.body.id);
  } else if (/おやす/.test(data.body.body.text)) {
    misskeyUtils.replyHome("おやすみなさい！", data.body.body.id);
  } else if (/天気/.test(data.body.body.text)) {
    const weatherMap = weather.localeMap;

    let doNote = false;
    for (const [key, value] of weatherMap) {
      if (new RegExp(key).test(data.body.body.text)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const note = async (): Promise<Record<string, any>> => {
          return misskeyUtils.note({
            cw: key + "の天気予報だよ",
            text: key + "\n" + (await weather.get(value)),
            visibility: MisskeyUtils.Visibility.Home,
            replyId: data.body.body.id
          });
        };
        note();
        doNote = true;
        break;
      }
    }

    if (!doNote) {
      misskeyUtils.replyHome(
        "地名を併せて教えてね！\n今対応しているのは「" +
          [...weatherMap.keys()].join("、") +
          "」だよ！",
        data.body.body.id
      );
    }
  } else if (/ブラックジャック|BJ|bj/.test(data.body.body.text)) {
    blackjacks.push(new Blackjack(data.body.body.id, misskeyUtils));
  } else {
    misskeyUtils.replyHome("なーにー？", data.body.body.id);
  }
};

const messageUser = (data: any, misskeyUtils: MisskeyUtils): void => {
  if (/かわいい|可愛い|カワイイ/.test(data.body.body.text)) {
    misskeyUtils.message("えへへ……ありがとう！", data.body.body.userId);
  } else if (/ありがと/.test(data.body.body.text)) {
    misskeyUtils.message("どういたしまして！", data.body.body.userId);
  } else if (/偉い|えらい/.test(data.body.body.text)) {
    misskeyUtils.message("えへへ……", data.body.body.userId);
  } else if (/コードリール/.test(data.body.body.text)) {
    misskeyUtils.message("はーい！", data.body.body.userId);
  } else if (/おはよ/.test(data.body.body.text)) {
    misskeyUtils.message(
      "おはよ！今日も1日頑張ろうね！",
      data.body.body.userId
    );
  } else if (/こんにち(は|わ)/.test(data.body.body.text)) {
    misskeyUtils.message("こんにちは！", data.body.body.userId);
  } else if (/こんばん(は|わ)/.test(data.body.body.text)) {
    misskeyUtils.message("こんばんは！", data.body.body.userId);
  } else if (/おやす/.test(data.body.body.text)) {
    misskeyUtils.message("おやすみなさい！", data.body.body.userId);
  } else if (/天気/.test(data.body.body.text)) {
    const weatherMap = weather.localeMap;

    let doNote = false;
    for (const [key, value] of weatherMap) {
      if (new RegExp(key).test(data.body.body.text)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const note = async (): Promise<Record<string, any>> => {
          return misskeyUtils.note({
            cw: key + "の天気予報だよ",
            text: key + "\n" + (await weather.get(value)),
            visibility: MisskeyUtils.Visibility.Home,
            replyId: data.body.body.userId
          });
        };
        note();
        doNote = true;
        break;
      }
    }

    if (!doNote) {
      misskeyUtils.message(
        "地名を併せて教えてね！\n今対応しているのは「" +
          [...weatherMap.keys()].join("、") +
          "」だよ！",
        data.body.body.userId
      );
    }
  } else if (/ブラックジャック|BJ|bj/.test(data.body.body.text)) {
    // blackjacks.push(new Blackjack(data.body.body.userid, misskeyUtils));
  } else {
    misskeyUtils.message("なーにー？", data.body.body.userId);
  }
};

client.on("connectFailed", error => {
  console.log("Connect Error: " + error.toString());
  setTimeout(
    () => client.connect("wss://misskey.m544.net/streaming?i=" + token),
    6000
  );
});

client.on("connect", connection => {
  console.log("WebSocket Client Connected");

  if (token === undefined) return;
  const misskeyUtils = new MisskeyUtils(token, connection);

  if (!isRunOnceFunction) {
    periodicallyJobs(misskeyUtils);
    discord(misskeyUtils);
    isRunOnceFunction = true;
  }

  misskeyUtils.noteHome("起動したよ！");

  connection.on("error", error => {
    console.log("Connection Error: " + error.toString());
    connection.close();
  });
  connection.on("close", () => {
    console.log("WebSocket Client Closed");
    setTimeout(
      () => client.connect("wss://misskey.m544.net/streaming?i=" + token),
      6000
    );
  });
  connection.on("message", message => {
    if (!message.utf8Data) return;
    const data = JSON.parse(message.utf8Data);

    if (data.body.id === "formain" && data.body.type === "followed") {
      misskeyUtils.follow(data.body.body.id);
    } else if (data.body.id === "formain" && data.body.type === "mention") {
      replyUser(data, misskeyUtils);
    } else if (
      data.body.id === "formain" &&
      data.body.type === "messagingMessage"
    ) {
      messageUser(data, misskeyUtils);
    } else if (data.type === "noteUpdated") {
      console.log("noteUpdated");
      for (let i = blackjacks.length - 1; i >= 0; i--) {
        blackjacks[i].update(data.body);
        if (blackjacks[i].isQuit) {
          blackjacks.splice(i, 1);
        } else if (blackjacks[i].isContinue) {
          blackjacks[i].isContinue = false;
          blackjacks[i].isQuit = true;
          blackjacks.push(new Blackjack(blackjacks[i].id, misskeyUtils));
        }
      }
    } else if (data.body.id === "forglobaltl") {
      console.log(data.body.body.text + moment().format("LLLL"));
    }
    console.log(data);
  });

  connection.sendUTF(MisskeyUtils.connectMainJson);
  connection.sendUTF(MisskeyUtils.connectGlobalTLJson);
});

client.connect("wss://misskey.m544.net/streaming?i=" + token);
