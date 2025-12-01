import type { ICard } from "~/data/cards";

export interface IUser {
  id: number;
  cards: ICard[];
  folded: boolean;
  money: number;
  currentBet: number;
}
