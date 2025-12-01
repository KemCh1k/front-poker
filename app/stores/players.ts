import { defineStore } from "pinia";
import type { IUser } from "~/data/user";
import { useDeckStore } from "~/stores/deck";
import { CARD_TYPE } from "~/data/cards";

export const usePlayerStore = defineStore("players", () => {
  const players = ref<IUser[]>([]);
  const deck = useDeckStore();

  const initPlayers = () => {
    players.value = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      cards: [],
      folded: false,
      money: 1000,
      currentBet: 0,
    }));
  };

  const delCards = () => {
    for (let i = 0; i < 2; i++) {
      for (const player of players.value) {
        const card = deck.cards.shift();
        if (!card) continue;
        card.userId = player.id;
        card.status = CARD_TYPE.PLAYER;
        player.cards.push(card);
      }
    }
  };

  return {
    players,
    initPlayers,
    delCards,
  };
});
