"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const node_schedule_1 = __importDefault(require("node-schedule"));
const moment_1 = __importDefault(require("moment"));
require("moment/locale/ja");
const misskey_utils_1 = __importDefault(require("./misskey-utils"));
const weather_1 = __importDefault(require("./weather"));
const weather = new weather_1.default();
const removeNotFollowed = async (misskeyUtils) => {
    const checkFollowJson = JSON.stringify({
        username: "cordreel"
    });
    const response = misskeyUtils.fetchJson("https://misskey.m544.net/api/users/following", checkFollowJson);
    const followingData = await response;
    followingData.users.forEach(async (user) => {
        const checkFollowByIdJson = JSON.stringify({
            userId: user.id
        });
        const response = misskeyUtils.fetchJson("https://misskey.m544.net/api/users/following", checkFollowByIdJson);
        const followingUserFollowingData = await response;
        if (!followingUserFollowingData.users.some((user) => user.username === "cordreel")) {
            misskeyUtils.unfollow(user.id);
            return true;
        }
        else {
            return false;
        }
    });
    return false;
};
const periodicallyJobs = (misskeyUtils) => {
    const midnightJob = node_schedule_1.default.scheduleJob("00 00 * * *", () => {
        misskeyUtils.noteHome(`日付が変わって、**${moment_1.default().format("M月D日 dddd")}**だよ！`);
        removeNotFollowed(misskeyUtils);
    });
    const noonJob = node_schedule_1.default.scheduleJob("00 12 * * *", () => {
        misskeyUtils.noteHome("12時！お昼ご飯はなーに？");
    });
    const sixOclockJob = node_schedule_1.default.scheduleJob("00 06 * * *", () => {
        const note = async () => {
            misskeyUtils.note({
                cw: "6時！東京の天気をお知らせだよ！",
                text: "東京\n" + (await weather.get("tokyo")),
                visibility: misskey_utils_1.default.Visibility.Home
            });
        };
        note();
    });
    const fifteenOclockJob = node_schedule_1.default.scheduleJob("00 15 * * *", () => {
        const note = async () => {
            misskeyUtils.note({
                cw: "15時！東京の天気をお知らせだよ！",
                text: "東京\n" + (await weather.get("tokyo")),
                visibility: misskey_utils_1.default.Visibility.Home
            });
        };
        note();
    });
};
exports.default = periodicallyJobs;
//# sourceMappingURL=periodically-jobs.js.map