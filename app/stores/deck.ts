import { defineStore } from "pinia";
import { CARD_TYPE, type ICard } from "~/data/cards";

export const useDeckStore = defineStore("deck", () => {
  const cards = ref<ICard[]>([]);

  const initDeck = () => {
    cards.value = Array.from({ length: 20 }, (_, i) => ({
      userId: null,
      value: i + 1,
      imgSrc: `/img/cards/card-${i + 1}.png`,
      status: CARD_TYPE.DECK,
    }));
  };

  const shuffle = () => {
    for (let i = cards.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      if (!cards.value[i] || !cards.value[j]) return;
      // @ts-ignore
      [cards.value[i], cards.value[j]] = [cards.value[j], cards.value[i]];
    }
  };

  return {
    cards,
    initDeck,
    shuffle,
  };
});
