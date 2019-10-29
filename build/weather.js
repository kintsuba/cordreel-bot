"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const node_fetch_1 = __importDefault(require("node-fetch"));
const moment_1 = __importDefault(require("moment"));
require("moment/locale/ja");
class Weather {
    constructor() {
        this.localeMap = new Map([
            ["東京", "tokyo"],
            ["大阪", "osaka"],
            ["名古屋", "nagoya-shi"],
            ["札幌", "sapporo-shi"],
            ["福岡", "fukuoka-shi"],
            ["沖縄", "okinawa"],
            ["那覇", "naha-shi"],
            ["埼玉", "saitama"],
            ["千葉", "chiba-shi"],
            ["横浜", "yokohama-shi"],
            ["函館", "hakodate"],
            ["小樽", "otaru"],
            ["釧路", "kushiro"],
            ["青森", "aomori-shi"],
            ["山形", "yamagata-shi"],
            ["仙台", "sendai-shi"],
            ["新潟", "niigata-shi"],
            ["京都", "kyoto-shi"],
            ["津", "tsu-shi"],
            ["鳥取", "tottori"],
            ["広島", "hiroshima-shi"],
            ["山口", "yamaguchi-shi"],
            ["高知", "Kochi-shi"],
            ["鹿児島", "kagoshima-shi"]
        ]);
        this.mainToEmoji = new Map([
            ["Thunderstorm", "⛈️"],
            ["Drizzle", "🌧️"],
            ["Rain", "🌧️"],
            ["Snow", "🌨️"],
            ["Mist", "🌫️"],
            ["Smoke", "🌫️"],
            ["Haze", "🌫️"],
            ["Dust", "🌫️"],
            ["Fog", "🌫️"],
            ["Sand", "🌫️"],
            ["Ash", "🌫️"],
            ["Squall", "☔️"],
            ["Tornado", "🌪️"],
            ["Clear", "☀️"],
            ["Clouds", "☁️"]
        ]);
        this.get = async (locale) => {
            const res = await node_fetch_1.default("http://api.openweathermap.org/data/2.5/forecast?q=" +
                locale +
                ",jp&units=metric&lang=ja&appid=7ae581a3d016b72aee4be6903a5bf73a");
            const json = await res.json();
            const string = json.list
                .map((j) => moment_1.default(j.dt_txt)
                .add(9, "hour")
                .format("MM/DD HH:mm") +
                " " +
                this.mainToEmoji.get(j.weather[0].main) +
                " " +
                j.weather[0].description +
                " " +
                j.main.temp +
                "℃")
                .join("\n");
            return string;
        };
    }
}
exports.default = Weather;
//# sourceMappingURL=weather.js.map