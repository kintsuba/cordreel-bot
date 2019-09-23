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

export class Card {
  private number: number;
  private display: string;
  constructor(number: number, display: string) {
    this.number = number;
    this.display = display;
  }

  getNumber(): number {
    return this.number;
  }
  getDisplay(): string {
    return this.display;
  }
}

export const cards: Card[] = cardReact
  .map(m => new Card(m.number, m.display))
  .concat(
    cardReact
      .map(m => new Card(m.number, m.display))
      .concat(cardReact.map(m => new Card(m.number, m.display)))
      .concat(cardReact.map(m => new Card(m.number, m.display)))
      .concat(cardReact.map(m => new Card(m.number, m.display)))
  );
