import { defineStore } from "pinia";
import type { ITable } from "~/data/table";
import { CARD_TYPE } from "~/data/cards";

export const useTableStore = defineStore("table", () => {
  const tableCards = ref<ITable[]>([]);

  const deckStore = useDeckStore();

  const initTable = () => {
    tableCards.value = Array.from({ length: 5 }, () => ({
      cards: [],
      revealedCount: 0,
    }));
  };

  const pushTable = () => {
    for (let i = 0; i < 1; i++) {
      for (const table of tableCards.value) {
        const cards = deckStore.cards.shift();
        if (!cards) continue;
        cards.status = CARD_TYPE.TABLE;
        table.cards.push(cards);
      }
    }
    console.log(tableCards.value);
  };

  const revealNext = () => {
    for (const table of tableCards.value) {
      if (table.revealedCount < tableCards.value.length) {
        table.revealedCount++;
      } else {
        return;
      }
      console.log(tableCards.value.length, table.revealedCount);
    }
  };

  return {
    tableCards,
    initTable,
    pushTable,
    revealNext,
  };
});

import type { ICard } from "~/data/cards";

export interface ITable {
  cards: ICard[];
  revealedCount: number;
}
