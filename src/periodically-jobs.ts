/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import schedule from "node-schedule";
import moment from "moment";
import "moment/locale/ja";
import MisskeyUtils from "./misskey-utils";
import Weather from "./weather";

const weather = new Weather();

const removeNotFollowed = async (
  misskeyUtils: MisskeyUtils
): Promise<boolean> => {
  const checkFollowJson = JSON.stringify({
    username: "cordreel"
  });
  const response = misskeyUtils.fetchJson(
    "https://misskey.m544.net/api/users/following",
    checkFollowJson
  );
  const followingData = await response;
  followingData.users.forEach(async (user: any) => {
    const checkFollowByIdJson = JSON.stringify({
      userId: user.id
    });
    const response = misskeyUtils.fetchJson(
      "https://misskey.m544.net/api/users/following",
      checkFollowByIdJson
    );
    const followingUserFollowingData = await response;
    if (
      !followingUserFollowingData.users.some(
        (user: any) => user.username === "cordreel"
      )
    ) {
      misskeyUtils.unfollow(user.id);
      return true;
    } else {
      return false;
    }
  });
  return false;
};

const periodicallyJobs = (misskeyUtils: MisskeyUtils): void => {
  const midnightJob = schedule.scheduleJob("00 00 * * *", () => {
    misskeyUtils.noteHome(
      `日付が変わって、**${moment().format("M月D日 dddd")}**だよ！`
    );
    removeNotFollowed(misskeyUtils);
  });
  const noonJob = schedule.scheduleJob("00 12 * * *", () => {
    misskeyUtils.noteHome("12時！お昼ご飯はなーに？");
  });
  const sixOclockJob = schedule.scheduleJob("00 06 * * *", () => {
    const note = async (): Promise<void> => {
      misskeyUtils.note({
        cw: "6時！東京の天気をお知らせだよ！",
        text: "東京\n" + (await weather.get("tokyo")),
        visibility: MisskeyUtils.Visibility.Home
      });
    };
    note();
  });
  const fifteenOclockJob = schedule.scheduleJob("00 15 * * *", () => {
    const note = async (): Promise<void> => {
      misskeyUtils.note({
        cw: "15時！東京の天気をお知らせだよ！",
        text: "東京\n" + (await weather.get("tokyo")),
        visibility: MisskeyUtils.Visibility.Home
      });
    };
    note();
  });
};

export default periodicallyJobs;
