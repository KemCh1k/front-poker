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
    console.log(gameStatus.value);
  };

  const startNewRound = async () => {
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

    for (const player of players.players) {
      player.currentBet = 0;
      player.folded = false;
      player.cards = [];
    }

    gameStatus.value = GAME_TYPE.REVEAL;
    console.log(gameStatus.value);

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

    // Если остался только один активный игрок (все остальные сфолдили), раунд ставок немедленно заканчивается.
    if (activePlayers.length <= 1) {
      endRound();
      return true;
    }

    // Проверяем, все ли активные игроки либо уравняли ставку, либо находятся в олл-ине (денег 0 при меньшей ставке).
    const allMatched = activePlayers.every(
      (player) =>
        player.currentBet === currentBetToMatch.value || player.money === 0,
    );

    // Также проверяем, что текущий игрок, которому передали ход, не является тем, кто сделал последнюю ставку.
    const lastBetterIndex = players.players.findIndex(
      (p) => p.currentBet === currentBetToMatch.value && p.money > 0,
    );
    const isBackToLastBetter = lastBetterIndex === currentPlayerIndex.value;

    // Если все уравняли И мы вернулись к игроку, который сделал последнюю ставку (или всем, кто чекал), завершаем раунд.
    if (allMatched && isBackToLastBetter) {
      endBettingRound();
      return true;
    }

    if (allMatched || activePlayers.every((p) => p.money === 0)) {
      endBettingRound();
    }
    if (allMatched) {
      endRound();
    }

    if (allMatched && activePlayers.every((p) => p.money === 0)) {
      endRound();
    }

    if (activePlayers.every((p) => p.money === 0)) {
      gameStatus.value = GAME_TYPE.FINISHED;
      table.revealedCount = 5;
      determineWinner();
      endGame();
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
  const nextStep = () => {
    if (table.revealedCount < table.tableCards.length) {
      table.revealNext();
      currentPlayerIndex.value = activeFirstPlayerIndex.value;
      currentBetToMatch.value = 0;
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
  const limitBet = ref(1000);
  const raisesInRound = ref(0);
  const activeFirstPlayerIndex = ref(0);

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
    // const player = players.players[currentPlayerIndex.value];
    // if (!player || player.folded) return;
    //
    // if (amount > player.money) {
    //   amount = player.money;
    // }
    // player.money -= amount;
    // player.currentBet += amount;
    //
    // pot.value += amount;
    //
    // currentBetToMatch.value = Math.max(
    //   currentBetToMatch.value,
    //   player.currentBet,
    // );
    //
    // if (player.currentBet < currentBetToMatch.value && player.money === 0) {
    //   nextPlayer();
    // }
    //
    // nextPlayer();

    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    // Amount должен быть минимум текущей ставкой + мин. рейз (тут просто берем amount)
    if (amount <= 0 || amount < currentBetToMatch.value) {
      return;
    }

    const actualAmount = Math.min(amount, player.money);
    const betDifference = actualAmount - player.currentBet;

    if (betDifference <= 0) return; // Нельзя ставить меньше, чем уже поставлено

    player.money -= betDifference;
    player.currentBet += betDifference;
    pot.value += betDifference;

    // Если это повышение ставки, обновляем currentBetToMatch и счетчик рейзов
    if (player.currentBet > currentBetToMatch.value) {
      currentBetToMatch.value = player.currentBet;
      raisesInRound.value++;
      // При рейзе круг ставок начинается заново для других игроков
    }

    nextPlayer();
  };

  /**
   * Check (пропуск хода), если ставку уравняли и не равна нулю.
   *
   * @function
   */
  const check = () => {
    const player = players.players[currentPlayerIndex.value];
    if (
      currentBetToMatch.value === player?.currentBet &&
      currentBetToMatch.value !== 0
    ) {
      nextPlayer();
    }

    // const player = players.players[currentPlayerIndex.value];
    // // Чек возможен только если игроку не нужно ничего доставлять
    // if (currentBetToMatch.value === player?.currentBet) {
    //   nextPlayer();
    // }
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
    // const player = players.players[currentPlayerIndex.value];
    // if (!player || player.folded) return;
    //
    // if (currentBetToMatch.value === 0) {
    //   return;
    // }
    //
    // const diff = currentBetToMatch.value - player.currentBet;
    // if (diff <= 0) return nextPlayer();
    //
    // const amount = Math.min(diff, player.money);
    //
    // player.money -= amount;
    // player.currentBet += amount;
    // pot.value += amount;
    // nextPlayer();
    // console.log(player);

    const player = players.players[currentPlayerIndex.value];
    if (!player || player.folded) return;

    const diff = currentBetToMatch.value - player.currentBet;

    if (diff <= 0) return; // Игрок уже уравнял или поставил больше (что невозможно при колл)

    const amountToCall = Math.min(diff, player.money);

    player.money -= amountToCall;
    player.currentBet += amountToCall;
    pot.value += amountToCall;

    // При колле мы просто передаем ход дальше, не обновляя currentBetToMatch
    nextPlayer();
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
    nextPlayer();

    // const player = players.players[currentPlayerIndex.value];
    // if (!player) return;
    //
    // player.folded = true;

    // // При фолде сразу проверяем, не остался ли единственный победитель
    // const activePlayers = players.players.filter((p) => !p.folded);
    // if (activePlayers.length <= 1) {
    //   // Если только один игрок остался, завершаем раунд и переходим к раздаче банка
    //   endRound(); // Сбрасывает ставки
    //   // Определяем победителя немедленно, так как остался 1 игрок
    //   determineWinner();
    // } else {
    //   nextPlayer();
    // }
  };

  /**
   * Переключает ход на следующего активного игрока, учитывая:
   * - пропуск сбросивших (folded)
   * - сравнение текущей ставки
   * - завершение раунда ставок при олл-ине или одном игроке
   *
   * @function
   */
  const nextPlayer = async () => {
    // let next = currentPlayerIndex.value;
    //
    // const player = players.players[currentPlayerIndex.value];
    //
    // if (players.players.filter((player) => !player.folded).length === 1) {
    //   endBettingRound();
    //   endRound();
    //   return;
    // }
    //
    // if (currentBetToMatch.value !== player?.currentBet && !player?.folded) {
    //   return;
    // }
    //
    // do {
    //   next = (next + 1) % players.players.length;
    // } while (players.players[next]?.folded);
    //
    // currentPlayerIndex.value = next;
    //
    // const firstActive = players.players.findIndex((p) => !p.folded);
    //
    // activeFirstPlayerIndex.value = firstActive;
    //
    // const activePlayers = players.players.filter((p) => !p.folded);
    // const allMatched = activePlayers.every(
    //   (p) => p.currentBet === currentBetToMatch.value,
    // );
    //
    // if (allMatched || activePlayers.every((p) => p.money === 0)) {
    //   endBettingRound();
    // }
    //
    // if (allMatched && activePlayers.every((p) => p.money === 0)) {
    //   endRound();
    // }
    //
    // if (
    //   players.players[next]?.currentBet === currentBetToMatch.value &&
    //   !allMatched
    // ) {
    //   endRound();
    // }

    const totalPlayers = players.players.length;
    let nextIndex = currentPlayerIndex.value;
    let attempts = 0;

    // Ищем следующего игрока, который не сфолдил
    do {
      nextIndex = (nextIndex + 1) % totalPlayers;
      attempts++;
      // Защита от бесконечного цикла, если все игроки, кроме одного, сфолдили (хотя это должно обрабатываться в checkForEndOfBettingRound)
      if (attempts > totalPlayers) break;
    } while (players.players[nextIndex]?.folded);

    currentPlayerIndex.value = nextIndex;

    // После смены игрока сразу проверяем, не пора ли закончить раунд ставок.
    checkForEndOfBettingRound();
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

    if (
      gameStatus.value === GAME_TYPE.REVEAL &&
      currentBetToMatch.value === 0
    ) {
      return;
    } else {
      nextStep();
    }

    // console.log("Раунд ставок окончен. Переход к следующему шагу.");
    // bettingState.value = BET_GAME_TYPE.ENDING;
    //
    // // Все деньги из currentBet переводятся в pot в момент ставки, тут мы просто обнуляем их для следующего раунда ставок
    // players.players.forEach((player) => {
    //   player.currentBet = 0;
    // });
    //
    // currentBetToMatch.value = 0;
    // raisesInRound.value = 0;
    //
    // nextStep();
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
    } else if ((table.revealedCount = 5)) {
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

    currentBetToMatch.value = newBet;
    raisesInRound.value++;
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
  };
});
