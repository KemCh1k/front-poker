import { defineStore } from "pinia";
import { toRaw } from "vue";
import type { IUser } from "~/data/user";
import { useDeckStore } from "~/stores/deck";
import { CARD_TYPE, type ICard, type ICardUser } from "~/data/cards";

export const usePlayerStore = defineStore("players", () => {
  const players = ref<IUser[]>([]);
  const deck = useDeckStore();

  const initPlayers = () => {
    players.value = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      imgSrc: `/img/avatars/avatars-${i + 1}.png`,
      isBot: i !== 0,
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
        const cardUser = defineCardToUser(card, player.id, CARD_TYPE.PLAYER);
        player.cards.push(cardUser);
      }
    }
  };

  const defineCardToUser = (
    card: ICard,
    userId: number,
    status: CARD_TYPE,
  ): ICardUser => {
    const rawCard = toRaw(card);
    const newCard = structuredClone(rawCard);
    newCard.userId = userId;
    newCard.status = status;
    return newCard as ICardUser;
  };

  return {
    players,
    initPlayers,
    delCards,
  };
});
