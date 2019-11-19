"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cards_1 = require("./cards");
var State;
(function (State) {
    State[State["WaitingHitOrStand"] = 0] = "WaitingHitOrStand";
    State[State["WaitingContinueOrQuit"] = 1] = "WaitingContinueOrQuit";
})(State || (State = {}));
class Blackjack {
    constructor(id, misskeyUtils) {
        this.deck = cards_1.cards;
        this.waitId = "";
        this.userHand = [];
        this.dealerHand = [];
        this.state = State.WaitingContinueOrQuit;
        this._isContinue = false;
        this._isQuit = false;
        this.post = async () => {
            const res = await this.misskeyUtils.replySpecifiedWithPoll(`ブラックジャックを始めるよ！\nディーラーの手札：**${this.dealerHand[0].getDisplay()} ？**\nあなたの手札：**${this.userHand
                .map(h => h.getDisplay())
                .join(" ")}** （合計：${this.getUserSum()}）`, this.id, [this.id], {
                choices: ["ヒット", "スタンド"],
                expiredAfter: 180000
            });
            this.misskeyUtils.capture(await res.createdNote.id);
            this.waitId = await res.createdNote.id;
            this.state = State.WaitingHitOrStand;
        };
        this.update = async (body) => {
            console.log("update");
            if (body.id === this.waitId && body.type === "pollVoted") {
                switch (this.state) {
                    case State.WaitingHitOrStand: {
                        switch (body.body.choice) {
                            case 0: {
                                // Hit
                                this.dealUserHand();
                                if (this.getUserSum() > 21) {
                                    // User Bust
                                    const res = await this.misskeyUtils.replySpecifiedWithPoll(`ディーラーの手札：**${this.dealerHand
                                        .map(h => h.getDisplay())
                                        .join(" ")}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                                        .map(h => h.getDisplay())
                                        .join(" ")}** （合計：${this.getUserSum()} バスト）\n\n残念、負けだよ 😢`, this.waitId, [body.body.userId], {
                                        choices: ["もう1回遊ぶ", "やめる"],
                                        expiredAfter: 180000
                                    });
                                    this.misskeyUtils.capture(await res.createdNote.id);
                                    this.misskeyUtils.unCapture(this.waitId);
                                    this.waitId = await res.createdNote.id;
                                    this.state = State.WaitingContinueOrQuit;
                                }
                                else {
                                    const res = await this.misskeyUtils.replySpecifiedWithPoll(`ディーラーの手札：**${this.dealerHand[0].getDisplay()} ？**\nあなたの手札：**${this.userHand
                                        .map(h => h.getDisplay())
                                        .join(" ")}** （合計：${this.getUserSum()}）`, this.waitId, [body.body.userId], {
                                        choices: ["ヒット", "スタンド"],
                                        expiredAfter: 180000
                                    });
                                    this.misskeyUtils.capture(await res.createdNote.id);
                                    this.misskeyUtils.unCapture(this.waitId);
                                    this.waitId = await res.createdNote.id;
                                    this.state = State.WaitingHitOrStand;
                                }
                                break;
                            }
                            case 1: {
                                // Stand
                                while (this.getDealerSum() < 17) {
                                    this.dealDealerHand();
                                }
                                let resultText;
                                if (this.getDealerSum() > 21) {
                                    resultText = `ディーラーの手札：**${this.dealerHand
                                        // Dealer Bust
                                        .map(h => h.getDisplay())
                                        .join(" ")}** （合計：${this.getDealerSum()} バスト）\nあなたの手札：**${this.userHand
                                        .map(h => h.getDisplay())
                                        .join(" ")}** （合計：${this.getUserSum()}）\n\n🎉 <jump>あなたの勝ち！おめでとう！</jump> 🎉`;
                                }
                                else {
                                    if (this.getUserSum() > this.getDealerSum()) {
                                        // Win
                                        resultText = `ディーラーの手札：**${this.dealerHand
                                            .map(h => h.getDisplay())
                                            .join(" ")}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                                            .map(h => h.getDisplay())
                                            .join(" ")}** （合計：${this.getUserSum()}）\n\n🎉 <jump>あなたの勝ち！おめでとう！</jump> 🎉`;
                                    }
                                    else if (this.getUserSum() < this.getDealerSum()) {
                                        // Lose
                                        resultText = `ディーラーの手札：**${this.dealerHand
                                            .map(h => h.getDisplay())
                                            .join(" ")}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                                            .map(h => h.getDisplay())
                                            .join(" ")}** （合計：${this.getUserSum()}）\n\n残念、負けだよ 😢`;
                                    }
                                    else {
                                        // Draw
                                        resultText = `ディーラーの手札：**${this.dealerHand
                                            .map(h => h.getDisplay())
                                            .join(" ")}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                                            .map(h => h.getDisplay())
                                            .join(" ")}** （合計：${this.getUserSum()}）\n\n引き分けだよ`;
                                    }
                                }
                                const res = await this.misskeyUtils.replySpecifiedWithPoll(resultText, this.waitId, [body.body.userId], {
                                    choices: ["もう1回遊ぶ", "やめる"],
                                    expiredAfter: 180000
                                });
                                this.misskeyUtils.capture(await res.createdNote.id);
                                this.misskeyUtils.unCapture(this.waitId);
                                this.waitId = await res.createdNote.id;
                                this.state = State.WaitingContinueOrQuit;
                                break;
                            }
                        }
                        break;
                    }
                    case State.WaitingContinueOrQuit:
                        {
                            switch (body.body.choice) {
                                case 0: {
                                    // Continue
                                    this.misskeyUtils.unCapture(this.waitId);
                                    this._isContinue = true;
                                    break;
                                }
                                case 1: {
                                    // Quit
                                    this.misskeyUtils.replySpecified("遊んでくれてありがとう！またね！", this.waitId, [body.body.userId]);
                                    this.misskeyUtils.unCapture(this.waitId);
                                    this._isQuit = true;
                                    break;
                                }
                            }
                        }
                        break;
                }
            }
        };
        this.shuffle = () => {
            const array = this.deck;
            for (let i = array.length - 1; i >= 0; i--) {
                const rand = Math.floor(Math.random() * (i + 1));
                [array[i], array[rand]] = [array[rand], array[i]];
            }
            this.deck = array;
        };
        this.dealUserHand = () => {
            const pop = this.deck.pop();
            if (pop)
                this.userHand.push(pop);
        };
        this.dealDealerHand = () => {
            const pop = this.deck.pop();
            if (pop)
                this.dealerHand.push(pop);
        };
        this.getUserSum = () => {
            let sum = this.userHand
                .map(h => h.getNumber())
                .reduce((a, x) => (a += x), 0);
            const aceCount = this.userHand.filter(h => h.getDisplay() === "A").length;
            if (aceCount) {
                for (let i = 0; i < aceCount; i++) {
                    if (sum > 21)
                        sum -= 10;
                }
            }
            return sum;
        };
        this.getDealerSum = () => {
            let sum = this.dealerHand
                .map(h => h.getNumber())
                .reduce((a, x) => (a += x), 0);
            const aceCount = this.dealerHand.filter(h => h.getDisplay() === "A").length;
            if (aceCount) {
                for (let i = 0; i < aceCount; i++) {
                    if (sum > 21)
                        sum -= 10;
                }
            }
            return sum;
        };
        this._id = id;
        this.misskeyUtils = misskeyUtils;
        this.shuffle();
        this.dealUserHand();
        this.dealUserHand();
        this.dealDealerHand();
        this.dealDealerHand();
        this.post();
    }
    get id() {
        return this._id;
    }
    get isContinue() {
        return this._isContinue;
    }
    set isContinue(isContinue) {
        this._isContinue = isContinue;
    }
    get isQuit() {
        return this._isQuit;
    }
    set isQuit(isQuit) {
        this._isQuit = isQuit;
    }
}
exports.default = Blackjack;
//# sourceMappingURL=blackjack.js.map