/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";
import moment from "moment";
import "moment/locale/ja";

export default class Weather {
  localeMap = new Map([
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

  mainToEmoji = new Map([
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

  get = async (locale: string): Promise<string> => {
    const res = await fetch(
      "http://api.openweathermap.org/data/2.5/forecast?q=" +
        locale +
        ",jp&units=metric&lang=ja&appid=7ae581a3d016b72aee4be6903a5bf73a"
    );
    const json = await res.json();

    const string = json.list
      .map(
        (j: any) =>
          moment(j.dt_txt)
            .add(9, "hour")
            .format("MM/DD HH:mm") +
          " " +
          this.mainToEmoji.get(j.weather[0].main) +
          " " +
          j.weather[0].description +
          " " +
          j.main.temp +
          "℃"
      )
      .join("\n");
    return string;
  };
}
