"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cardReact = [
    {
        number: 11,
        display: "A"
    },
    {
        number: 2,
        display: "2"
    },
    {
        number: 3,
        display: "3"
    },
    {
        number: 4,
        display: "4"
    },
    {
        number: 5,
        display: "5"
    },
    {
        number: 6,
        display: "6"
    },
    {
        number: 7,
        display: "7"
    },
    {
        number: 8,
        display: "8"
    },
    {
        number: 9,
        display: "9"
    },
    {
        number: 10,
        display: "10"
    },
    {
        number: 10,
        display: "J"
    },
    {
        number: 10,
        display: "Q"
    },
    {
        number: 10,
        display: "K"
    }
];
class Card {
    constructor(number, display) {
        this.number = number;
        this.display = display;
    }
    getNumber() {
        return this.number;
    }
    getDisplay() {
        return this.display;
    }
}
exports.Card = Card;
exports.cards = cardReact
    .map(m => new Card(m.number, m.display))
    .concat(cardReact
    .map(m => new Card(m.number, m.display))
    .concat(cardReact.map(m => new Card(m.number, m.display)))
    .concat(cardReact.map(m => new Card(m.number, m.display)))
    .concat(cardReact.map(m => new Card(m.number, m.display))));
//# sourceMappingURL=cards.js.map