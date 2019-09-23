import MisskeyUtils from "./misskey-utils";
import { Card, cards } from "./cards";

enum State {
  WaitingHitOrStand,
  WaitingContinueOrQuit
}

type pollVoted = {
  id: string;
  type: string;
  body: {
    choice: number;
    userId: string;
  };
};

export default class Blackjack {
  misskeyUtils: MisskeyUtils;
  deck = cards;
  private _id: string;
  public get id(): string {
    return this._id;
  }
  private waitId = "";
  private userHand: Card[] = [];
  private dealerHand: Card[] = [];
  private state = State.WaitingContinueOrQuit;
  private _isContinue = false;
  public get isContinue(): boolean {
    return this._isContinue;
  }
  public set isContinue(isContinue: boolean) {
    this._isContinue = isContinue;
  }
  private _isQuit = false;
  public get isQuit(): boolean {
    return this._isQuit;
  }
  public set isQuit(isQuit: boolean) {
    this._isQuit = isQuit;
  }

  constructor(id: string, misskeyUtils: MisskeyUtils) {
    this._id = id;
    this.misskeyUtils = misskeyUtils;
    this.shuffle();
    this.dealUserHand();
    this.dealUserHand();
    this.dealDealerHand();
    this.dealDealerHand();
    this.post();
  }

  post = async (): Promise<void> => {
    const res = await this.misskeyUtils.replySpecifiedWithPoll(
      `ブラックジャックを始めるよ！\nディーラーの手札：**${this.dealerHand[0].getDisplay()} ？**\nあなたの手札：**${this.userHand
        .map(h => h.getDisplay())
        .join(" ")}** （合計：${this.getUserSum()}）`,
      this.id,
      [this.id],
      {
        choices: ["ヒット", "スタンド"],
        expiredAfter: 180000
      }
    );
    this.misskeyUtils.capture(await res.createdNote.id);
    this.waitId = await res.createdNote.id;
    this.state = State.WaitingHitOrStand;
  };

  update = async (body: pollVoted): Promise<void> => {
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
                const res = await this.misskeyUtils.replySpecifiedWithPoll(
                  `ディーラーの手札：**${this.dealerHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getUserSum()} バスト）\n\n残念、負けだよ 😢`,
                  this.waitId,
                  [body.body.userId],
                  {
                    choices: ["もう1回遊ぶ", "やめる"],
                    expiredAfter: 180000
                  }
                );
                this.misskeyUtils.capture(await res.createdNote.id);
                this.misskeyUtils.unCapture(this.waitId);
                this.waitId = await res.createdNote.id;
                this.state = State.WaitingContinueOrQuit;
              } else {
                const res = await this.misskeyUtils.replySpecifiedWithPoll(
                  `ディーラーの手札：**${this.dealerHand[0].getDisplay()} ？**\nあなたの手札：**${this.userHand
                    .map(h => h.getDisplay())
                    .join(" ")}** （合計：${this.getUserSum()}）`,
                  this.waitId,
                  [body.body.userId],
                  {
                    choices: ["ヒット", "スタンド"],
                    expiredAfter: 180000
                  }
                );
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

              let resultText: string;

              if (this.getDealerSum() > 21) {
                resultText = `ディーラーの手札：**${this.dealerHand
                  // Dealer Bust
                  .map(h => h.getDisplay())
                  .join(
                    " "
                  )}** （合計：${this.getDealerSum()} バスト）\nあなたの手札：**${this.userHand
                  .map(h => h.getDisplay())
                  .join(
                    " "
                  )}** （合計：${this.getUserSum()}）\n\n🎉 <jump>あなたの勝ち！おめでとう！</jump> 🎉`;
              } else {
                if (this.getUserSum() > this.getDealerSum()) {
                  // Win
                  resultText = `ディーラーの手札：**${this.dealerHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getUserSum()}）\n\n🎉 <jump>あなたの勝ち！おめでとう！</jump> 🎉`;
                } else if (this.getUserSum() < this.getDealerSum()) {
                  // Lose
                  resultText = `ディーラーの手札：**${this.dealerHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getUserSum()}）\n\n残念、負けだよ 😢`;
                } else {
                  // Draw
                  resultText = `ディーラーの手札：**${this.dealerHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getDealerSum()}）\nあなたの手札：**${this.userHand
                    .map(h => h.getDisplay())
                    .join(
                      " "
                    )}** （合計：${this.getUserSum()}）\n\n引き分けだよ`;
                }
              }

              const res = await this.misskeyUtils.replySpecifiedWithPoll(
                resultText,
                this.waitId,
                [body.body.userId],
                {
                  choices: ["もう1回遊ぶ", "やめる"],
                  expiredAfter: 180000
                }
              );
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
                this.misskeyUtils.replySpecified(
                  "遊んでくれてありがとう！またね！",
                  this.waitId,
                  [body.body.userId]
                );

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
  private shuffle = (): void => {
    const array = this.deck;

    for (let i = array.length - 1; i >= 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));

      [array[i], array[rand]] = [array[rand], array[i]];
    }

    this.deck = array;
  };
  private dealUserHand = (): void => {
    const pop = this.deck.pop();
    if (pop) this.userHand.push(pop);
  };
  private dealDealerHand = (): void => {
    const pop = this.deck.pop();
    if (pop) this.dealerHand.push(pop);
  };

  private getUserSum = (): number => {
    let sum = this.userHand
      .map(h => h.getNumber())
      .reduce((a, x) => (a += x), 0);

    const aceCount = this.userHand.filter(h => h.getDisplay() === "A").length;
    if (aceCount) {
      for (let i = 0; i < aceCount; i++) {
        if (sum > 21) sum -= 10;
      }
    }
    return sum;
  };
  private getDealerSum = (): number => {
    let sum = this.dealerHand
      .map(h => h.getNumber())
      .reduce((a, x) => (a += x), 0);

    const aceCount = this.dealerHand.filter(h => h.getDisplay() === "A").length;
    if (aceCount) {
      for (let i = 0; i < aceCount; i++) {
        if (sum > 21) sum -= 10;
      }
    }
    return sum;
  };
}
