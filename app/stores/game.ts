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
  const lastAggressorIndex = ref<number | null>(null);
  const actedPlayers = ref<Set<number>>(new Set());
  // Старт игры
  const startGame = () => {
    gameStatus.value = GAME_TYPE.DEAL;

    winnerId.value = null;

    deck.cards = [];
    table.tableCards = [];
    table.revealedCount = 0;

    bettingState.value = BET_GAME_TYPE.BETTING;
    currentPlayerIndex.value = 0;
    currentBetToMatch.value = 0;
    pot.value = 0;
    raisesInRound.value = 0;
    lastAggressorIndex.value = null;
    actedPlayers.value = new Set();

    for (const player of players.players) {
      player.currentBet = 0;
      player.folded = false;
    }

    deck.initDeck();
    deck.shuffle();
    players.initPlayers();
    players.delCards();
    table.initTable();

    gameStatus.value = GAME_TYPE.REVEAL;
    console.log(gameStatus.value);
  };

  const startNewRound = async () => {
    gameStatus.value = GAME_TYPE.DEAL;
    winnerId.value = null;

    deck.cards = [];
    table.tableCards = [];
    table.revealedCount = 0;

    for (const player of players.players) {
      player.currentBet = 0;
      player.folded = false;
      player.cards = [];

      if (player.money === 0) {
        player.folded = true;
      }
    }

    bettingState.value = BET_GAME_TYPE.BETTING;
    currentPlayerIndex.value = getNextActivePlayerIndex();
    currentBetToMatch.value = 0;
    pot.value = 0;
    raisesInRound.value = 0;
    lastAggressorIndex.value = null;
    actedPlayers.value = new Set();

    gameStatus.value = GAME_TYPE.REVEAL;

    deck.initDeck();
    deck.shuffle();
    players.delCards();
    table.initTable();
  };

  /**
   * Вспомогательная функция для проверки завершения раунда ставок.
   * Раунд завершается, когда все активные игроки уравняли текущую ставку (currentBetToMatch).
   */
  const checkForEndOfBettingRound = () => {
    const activePlayers = players.players.filter((p) => !p.folded);

    const allMatched = activePlayers.every(
      (player) =>
        player.currentBet === currentBetToMatch.value || player.money === 0,
    );

    // Если остался только один активный игрок (все остальные сфолдили), раунд ставок немедленно заканчивается.
    if (activePlayers.length <= 1 && allMatched) {
      endRound();
      return true;
    }

    // Проверяем, все ли активные игроки либо уравняли ставку, либо находятся в олл-ине (денег 0 при меньшей ставке).

    const allActed = activePlayers.every(
      (p) => actedPlayers.value.has(p.id) || p.money === 0,
    );

    if (activePlayers.every((p) => p.money === 0)) {
      endRound();
      return true;
    }

    // если был рейз — ждем возврата к агрессору
    if (currentBetToMatch.value > 0 && allMatched) {
      endBettingRound();
      return true;
    }

    // если рейзов не было — нужен полный круг (все походили)
    if (lastAggressorIndex.value === null && allActed) {
      endBettingRound();
      return true;
    }

    return false;
  };

  /**
   * Переходит к следующему шагу игры:
   * - открывает следующую карту на столе, если ещё остались закрытые
   * - иначе запускает определение победителя
   *
   * @function
   */

  const getNextActivePlayerIndex = (startIndex = 0) => {
    const totalPlayers = players.players.length;

    for (let i = 0; i < totalPlayers; i++) {
      const index = (startIndex + i) % totalPlayers;
      const p = players.players[index];

      if (!p) continue;

      if (!p.folded && p.money > 0) {
        return index;
      }
    }

    return 0;
  };

  const nextStep = () => {
    if (table.revealedCount < table.tableCards.length) {
      table.revealNext();
      currentPlayerIndex.value = getNextActivePlayerIndex();
      currentBetToMatch.value = 0;
      lastAggressorIndex.value = null;
      actedPlayers.value = new Set();
    } else {
      endRound();
    }
  };

  // Логика определения победителя
  const winnerId = ref<number | null>(null);

  /**
   * @description Определяет победителя по наибольшему значению карты в руке,
   * игнорируя игроков без карт и тех, кто сбросил (fold).
   * Обновляет `winnerId` и переводит `gameStatus` в FINISHED.
   *
   * @function
   */
  const determineWinner = async () => {
    let winner = null;
    let bestValue = 0;

    for (const player of players.players) {
      if (!player.cards.length) continue;
      const playerBest = Math.max(...player.cards.map((card) => card.value));

      if (playerBest > bestValue && !player.folded) {
        bestValue = playerBest;
        winner = player;
      }
    }

    if (winner !== null) {
      winnerId.value = winner.id;
      winner.money += pot.value;
      pot.value = 0;
    }

    console.log(winnerId.value, "Winner");
    gameStatus.value = GAME_TYPE.FINISHED;

    const activePlayers = players.players.filter((p) => p.money !== 0);
    console.log(activePlayers);

    if (activePlayers.length <= 1) {
      return endGame();
    }

    await sleep(4000);
    await startNewRound();
  };

  /**
   * Полностью сбрасывает состояние store:
   * - очищает победителя
   * - обнуляет колоду, список игроков и карты стола
   * - перезапускает игру
   *
   * @function
   */
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
  const limitBet = ref(0);
  const raisesInRound = ref(0);

  const proceed = () => {
    if (!checkForEndOfBettingRound()) {
      nextPlayer();
    }
  };

  /**
   * Игрок делает ставку:
   * - сумма автоматически корректируется, если превышает доступные деньги
   * - пополняет банк и ставку игрока
   * - обновляет ставку, которую нужно сравнять
   * - передает ход дальше
   *
   * @function
   * @param {number} amount — сумма ставки
   */

  const bet = (amount: number) => {
    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    const toCall = currentBetToMatch.value - player.currentBet;

    // Amount должен быть минимум текущей ставкой + мин. рейз (тут просто берем amount)
    if (amount < toCall) {
      return;
    }

    const actualAmount = Math.min(amount, player.money);
    const betDifference = actualAmount - player.currentBet;

    if (betDifference <= 0) return; // Нельзя ставить меньше, чем уже поставлено
    player.money -= betDifference;
    player.currentBet += betDifference;
    pot.value += betDifference;

    const isRaise = player.currentBet > currentBetToMatch.value;
    if (isRaise) {
      lastAggressorIndex.value = currentPlayerIndex.value;
      currentBetToMatch.value = Math.max(
        currentBetToMatch.value,
        player.currentBet,
      );
      actedPlayers.value = new Set([player.id]);
    } else {
      actedPlayers.value.add(player.id);
    }
    proceed();
  };

  /**
   * Check (пропуск хода), если ставку уравняли и не равна нулю.
   *
   * @function
   */
  const check = () => {
    const player = players.players[currentPlayerIndex.value];
    if (!player) return;

    if (currentBetToMatch.value === player.currentBet) {
      actedPlayers.value.add(player.id);
      proceed();
    }
  };

  /**
   * Call (сравнять ставку):
   * - вычисляет разницу до необходимой ставки
   * - списывает минимальную нужную сумму
   * - добавляет в банк
   * - передает ход дальше
   *
   * @function
   */
  const call = () => {
    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    const diff = currentBetToMatch.value - player.currentBet;

    if (diff <= 0) return; // Игрок уже уравнял или поставил больше (что невозможно при колл)

    const amountToCall = Math.min(diff, player.money);

    player.money -= amountToCall;
    player.currentBet += amountToCall;
    pot.value += amountToCall;

    // При колле мы просто передаем ход дальше, не обновляя currentBetToMatch
    actedPlayers.value.add(player.id);
    proceed();
  };

  /**
   * Fold (сбросить карты) — игрок выходит из раунда.
   *
   * @function
   */
  const fold = () => {
    const player = players.players[currentPlayerIndex.value];
    if (!player) return;

    player.folded = true;
    actedPlayers.value.add(player.id);
    proceed();
  };

  /**
   * Переключает ход на следующего активного игрока, учитывая:
   * - пропуск сбросивших (folded)
   * - сравнение текущей ставки
   * - завершение раунда ставок при олл-ине или одном игроке
   *
   * @function
   */
  const nextPlayer = () => {
    const totalPlayers = players.players.length;
    let nextIndex = currentPlayerIndex.value;

    for (let i = 0; i < totalPlayers; i++) {
      nextIndex = (nextIndex + 1) % totalPlayers;
      console.log(nextIndex);

      const p = players.players[nextIndex];
      if (!p) continue;

      const needsAction = p.currentBet !== currentBetToMatch.value;
      const isCheckRound = currentBetToMatch.value === 0;

      const alreadyActed = actedPlayers.value.has(p.id);

      if (
        !p.folded &&
        p.money > 0 &&
        (needsAction || isCheckRound) &&
        !alreadyActed
      ) {
        currentPlayerIndex.value = nextIndex;
        return;
      }
    }
    console.log("nextPlayer", nextIndex);

    endBettingRound();
  };

  /**
   * Завершает этап ставок:
   * - обнуляет ставки игроков
   * - переходит к следующему шагу, если нужно
   *
   * @function
   */
  const endBettingRound = () => {
    bettingState.value = BET_GAME_TYPE.ENDING;

    players.players.forEach((player) => {
      player.currentBet = 0;
    });

    lastAggressorIndex.value = null;
    actedPlayers.value = new Set();

    nextStep();
  };

  /**
   * Завершает игровой раунд и запускает определение победителя.
   *
   * @function
   */
  const endRound = async () => {
    const activePlayers = players.players.filter((p) => !p.folded);
    console.log(activePlayers);
    if (activePlayers.every((p) => p.money === 0)) {
      gameStatus.value = GAME_TYPE.FINISHED;
      table.revealedCount = 5;
      determineWinner();
    } else if (table.revealedCount === 5) {
      determineWinner();
    } else {
      gameStatus.value = GAME_TYPE.FINISHED;
      table.revealedCount = 5;
      determineWinner();
    }
    console.log(gameStatus.value);
  };

  function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  const endGame = async () => {
    await sleep(5000);
    gameStatus.value = GAME_TYPE.FINISHEDROUND;
  };

  /**
   * Набор готовых пресетов для быстрого выбора ставки.
   * HALF — множитель, остальные — значения в фишках.
   *
   * @constant
   */
  const betPresets = {
    SMALL: 50,
    MEDIUM: 100,
    BIG: 200,
    MAX: 9999,
    HALF: 0.5,
  } as const;

  type BetPresetKey = keyof typeof betPresets;

  /**
   * Применяет пресет ставки для текущего игрока,
   * учитывая лимиты и доступные деньги.
   *
   * @function
   */
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

  /**
   * Повышает текущую ставку (raise), используя пресет.
   * Обновляет ставку для сравнения и счетчик повышений.
   *
   * @function
   */
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

    currentBetToMatch.value = Math.max(
      currentBetToMatch.value,
      player.currentBet,
    );
    raisesInRound.value++;

    lastAggressorIndex.value = currentPlayerIndex.value;
    actedPlayers.value = new Set([player.id]);
    proceed();
  };

  const STORAGE_KEY = "poker-game";

  watch(
    () => ({
      players: players.players,
      tableCards: table.tableCards,
      revealedCount: table.revealedCount,
      deck: deck.cards,
      winnerId: winnerId.value,
      gameStatus: gameStatus.value,
      pot: pot.value,
      currentPlayerIndex: currentPlayerIndex.value,
      currentBetToMatch: currentBetToMatch.value,
      lastAggressorIndex: lastAggressorIndex.value,
    }),
    (state) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    { deep: true },
  );

  const loadGame = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const state = JSON.parse(saved);

    players.players = state.players;
    table.tableCards = state.tableCards;
    table.revealedCount = state.revealedCount;
    deck.cards = state.deck;

    winnerId.value = state.winnerId;
    gameStatus.value = state.gameStatus;
    pot.value = state.pot;
    currentPlayerIndex.value = state.currentPlayerIndex;
    currentBetToMatch.value = state.currentBetToMatch;
    lastAggressorIndex.value = state.lastAggressorIndex;

    actedPlayers.value = new Set();
  };

  return {
    startGame,
    determineWinner,
    nextStep,
    winnerId,
    reset,
    pot,

    bet,
    call,
    fold,
    check,
    nextPlayer,
    endBettingRound,

    betPresets,
    applyBetPreset,
    raiseByPreset,
    currentPlayerIndex,
    gameStatus,
    startNewRound,

    loadGame,
  };
});
