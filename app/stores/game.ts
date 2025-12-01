import { defineStore } from "pinia";
import { useDeckStore } from "~/stores/deck";
import { usePlayerStore } from "~/stores/players";
import { useTableStore } from "~/stores/table";
import { GAME_TYPE } from "~/data/game";

export const useGameStore = defineStore("game", () => {
  const deck = useDeckStore();
  const players = usePlayerStore();
  const table = useTableStore();

  const gameStatus = ref<GAME_TYPE>(GAME_TYPE.INIT);

  const startGame = () => {
    gameStatus.value = GAME_TYPE.DEAL;
    deck.initDeck();
    deck.shuffle();
    players.initPlayers();
    players.delCards();
    table.initTable();

    gameStatus.value = GAME_TYPE.REVEAL;
  };

  const nextStep = () => {
    if (table.revealedCount < table.tableCards.length) {
      table.revealNext();
    } else {
      determineWinner();
    }
  };

  const winnerId = ref<number | null>(null);

  const determineWinner = () => {
    let winner: number | null = null;
    let bestValue = 0;

    for (const player of players.players) {
      if (!player.cards.length) continue;
      const playerBest = Math.max(...player.cards.map((card) => card.value));

      if (playerBest > bestValue) {
        bestValue = playerBest;
        winner = player.id;
      }
    }
    winnerId.value = winner;
    console.log(winnerId.value);
    gameStatus.value = GAME_TYPE.FINISHED;
  };

  const reset = () => {
    winnerId.value = null;
    gameStatus.value = GAME_TYPE.INIT;

    players.players = [];
    deck.cards = [];
    table.tableCards = [];
    table.revealedCount = 0;
    startGame();
  };

  return {
    startGame,
    determineWinner,
    nextStep,
    winnerId,
    reset,
  };
});
