"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var _this = this;
exports.__esModule = true;
// import Eris from "eris";
var discord_js_1 = require("discord.js");
var dotenv = require("dotenv");
var node_fetch_1 = require("node-fetch");
dotenv.config();
var client = new discord_js_1.Client();
var fetchJson = function (url, json, credentials) {
    if (credentials === void 0) { credentials = "omit"; }
    return __awaiter(_this, void 0, void 0, function () {
        var postData, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postData = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: credentials,
                        body: JSON.stringify(json)
                    };
                    return [4 /*yield*/, node_fetch_1["default"](url, postData)];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    console.log(response.status + " OK");
                    return [4 /*yield*/, response.text()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    console.log(response.status + " \u30A8\u30E9\u30FC");
                    return [4 /*yield*/, response.text()];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
client.on("ready", function () {
    console.log("Logged in as " + client.user.tag + "!");
});
client.on("voiceStateUpdate", function () {
    var voiceChannelUserExitsCount = 0;
    var usersArrayVoiceChannelUserExits = [];
    client.channels.forEach(function (channel) {
        var e_1, _a;
        if (channel.type === "voice" && channel instanceof discord_js_1.VoiceChannel) {
            if (channel.members.size > 0) {
                try {
                    for (var _b = __values(channel.members.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var member = _c.value;
                        usersArrayVoiceChannelUserExits.push(member.user.username + "さん");
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                var sendString = usersArrayVoiceChannelUserExits.join(",") + "\u304C\u30DC\u30A4\u30B9\u30C1\u30E3\u30F3\u30CD\u30EB<" + channel.name + ">\u306B\u3044\u308B\u3088\uFF01";
                var sendJson = {
                    visibility: "home",
                    text: sendString,
                    i: process.env.MISSKEY_TOKEN
                };
                fetchJson("https://misskey.m544.net/api/notes/create", sendJson, "include");
                voiceChannelUserExitsCount++;
            }
        }
    });
    if (voiceChannelUserExitsCount === 0) {
        var sendJson = {
            visibility: "home",
            text: "ボイスチャンネルから誰もいなくなったよ",
            i: process.env.MISSKEY_TOKEN
        };
        fetchJson("https://misskey.m544.net/api/notes/create", sendJson, "include");
    }
});
client.login(process.env.DISCORD_TOKEN);
