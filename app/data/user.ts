import type { ICardUser } from "~/data/cards";

export interface IUser {
  id: number;
  cards: ICardUser[];
  folded: boolean;
  money: number;
  currentBet: number;
}
