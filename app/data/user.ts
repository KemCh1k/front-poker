import type { ICardUser } from "~/data/cards";

export interface IUser {
  id: number;
  imgSrc: string;
  cards: ICardUser[];
  isBot: boolean;
  folded: boolean;
  money: number;
  currentBet: number;
}
