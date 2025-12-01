import { defineStore } from "pinia";
import type { ITable } from "~/data/table";
import { CARD_TYPE, type ICard } from "~/data/cards";

export const useTableStore = defineStore("table", () => {
  const deckStore = useDeckStore();

  const tableCards = ref<ICard[]>([]);
  const revealedCount = ref(0);

  const initTable = () => {
    tableCards.value = [];
    revealedCount.value = 0;

    for (let i = 0; i < 5; i++) {
      const card = deckStore.cards.shift();
      if (!card) continue;
      card.status = CARD_TYPE.TABLE;
      card.userId = null;
      tableCards.value.push(card);
    }
  };

  const revealNext = () => {
    if (revealedCount.value < tableCards.value.length) {
      revealedCount.value++;
    } else return;
    console.log(revealedCount.value);
  };

  return {
    revealedCount,
    tableCards,
    initTable,
    revealNext,
  };
});
