import type { ICard } from "~/data/cards";

export interface ITable {
  cards: ICard[];
  revealedCount: number;
}
