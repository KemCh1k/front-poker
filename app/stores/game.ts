import { defineStore } from "pinia";
import { useDeckStore } from "~/stores/deck";
import { usePlayerStore } from "~/stores/players";
import { useTableStore } from "~/stores/table";
import { BET_GAME_TYPE, GAME_TYPE } from "~/data/game";

export const useGameStore = defineStore("game", () => {
  const deck = useDeckStore();
  const players = usePlayerStore();
  const table = useTableStore();

  const gameStatus = ref<GAME_TYPE>(GAME_TYPE.INIT);

  // Старт игры
  const startGame = () => {
    gameStatus.value = GAME_TYPE.DEAL;
    deck.initDeck();
    deck.shuffle();
    players.initPlayers();
    players.delCards();
    table.initTable();

    bettingState.value = BET_GAME_TYPE.BETTING;
    currentPlayerIndex.value = 0;
    currentBetToMatch.value = 0;
    pot.value = 0;
    raisesInRound.value = 0;

    for (const player of players.players) {
      player.currentBet = 0;
      player.folded = false;
    }

    gameStatus.value = GAME_TYPE.REVEAL;
  };
  // Следуюший шаг
  const nextStep = () => {
    if (table.revealedCount < table.tableCards.length) {
      table.revealNext();
    } else {
      determineWinner();
    }
  };

  // Логика определения победителя
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

  // Обновление игры
  const reset = () => {
    winnerId.value = null;
    gameStatus.value = GAME_TYPE.INIT;

    players.players = [];
    deck.cards = [];
    table.tableCards = [];
    table.revealedCount = 0;
    startGame();
  };

  // Ставки

  const bettingState = ref<BET_GAME_TYPE>(BET_GAME_TYPE.PREVIOUS);
  const pot = ref(0);
  const currentBetToMatch = ref(0);
  const currentPlayerIndex = ref(0);
  const limitBet = ref(1000);
  const raisesInRound = ref(0);

  const bet = (amount: number) => {
    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    if (amount > player.money) {
      amount = player.money;
    }
    player.money -= amount;
    player.currentBet += amount;

    pot.value += amount;

    currentBetToMatch.value = Math.max(
      currentBetToMatch.value,
      player.currentBet,
    );

    nextPlayer();
  };

  const call = () => {
    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    const diff = currentBetToMatch.value - player.currentBet;
    if (diff <= 0) return nextPlayer();

    const amount = Math.min(diff, player.money);

    player.money -= amount;
    player.currentBet += amount;
    pot.value += amount;

    const activePlayer = players.players.filter((player) => !player.folded);
    const allMatch = activePlayer.every(
      (plyer) => plyer.currentBet === currentBetToMatch.value,
    );

    if (allMatch) {
      endBettingRound();
    } else {
      nextPlayer();
    }
  };

  const fold = () => {
    const player = players.players[currentPlayerIndex.value];
    if (!player) return;

    player.folded = true;
    nextPlayer();
  };

  const nextPlayer = () => {
    let next = currentPlayerIndex.value;
    do {
      next = (next + 1) % players.players.length;
    } while (players.players[next]?.folded);

    currentPlayerIndex.value = next;

    const activePlayers = players.players.filter((p) => !p.folded);
    const allMatched = activePlayers.every(
      (p) => p.currentBet === currentBetToMatch.value,
    );

    if (allMatched) {
      endBettingRound();
    }
  };

  const endBettingRound = () => {
    bettingState.value = BET_GAME_TYPE.ENDING;
  };

  const betPresets = {
    SMALL: 50,
    MEDIUM: 100,
    BIG: 200,
    MAX: 9999,
    HALF: 0.5,
  } as const;

  type BetPresetKey = keyof typeof betPresets;

  // Применить пресет
  const applyBetPreset = (key: BetPresetKey) => {
    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    let presetValue: number = betPresets[key];

    if (key === "MAX") {
      presetValue = player.money;
    }

    if (key === "HALF") {
      presetValue = Math.floor(player.money * betPresets.HALF);
    }

    // Проверяем лимит
    if (limitBet.value && presetValue > limitBet.value) {
      presetValue = limitBet.value;
    }

    bet(presetValue);
  };

  // Увеличить текущую ставку на пресет (raise)
  const raiseByPreset = (key: BetPresetKey) => {
    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    let raiseValue: number = betPresets[key];

    if (key === "HALF") {
      raiseValue = Math.floor(player.money * betPresets.HALF);
    }

    const newBet = currentBetToMatch.value + raiseValue;
    const diff = newBet - player.currentBet;

    if (diff <= 0) return;

    const amount = Math.min(diff, player.money);

    player.money -= amount;
    player.currentBet += amount;
    pot.value += amount;

    currentBetToMatch.value = player.currentBet;
    raisesInRound.value++;
    nextPlayer();
  };

  return {
    startGame,
    determineWinner,
    nextStep,
    winnerId,
    reset,

    bet,
    call,
    fold,
    nextPlayer,
    endBettingRound,

    betPresets,
    applyBetPreset,
    raiseByPreset,
  };
});
