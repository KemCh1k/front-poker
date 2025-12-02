export enum CARD_TYPE {
  TABLE = "table",
  DECK = "deck",
  PLAYER = "player",
}

export interface ICard {
  userId: number | null;
  value: number;
  imgSrc: string;
  status: CARD_TYPE;
}

export interface ICardUser extends ICard {
  userId: number;
}
