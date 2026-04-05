import { useGameStore } from "~/stores/game";
import type { IUser } from "~/data/user";

export const useBotLogicStore = defineStore("bot", () => {
  const game = useGameStore();

  const runBotAction = (player: IUser) => {
    if (!player.isBot) return;
    const strength = Math.max(...player.cards.map((c) => c.value));
    const toCall = game.currentBetToMatch - player.currentBet;
    const potOdds = toCall / (game.pot + toCall);

    const random = Math.random();

    if (toCall === 0) {
      if (strength > 11 && random > 0.3) {
        game.bet(50);
      } else {
        game.check();
      }
      return;
    }

    if (strength >= 13) {
      if (random > 0.5) {
        game.bet(100);
      } else {
        game.call();
      }
      return;
    }

    if (potOdds < 0.4) {
      game.call();
      return;
    }

    if (random > 0.7) {
      game.call();
    } else {
      game.fold();
    }

    if (game.currentBetToMatch >= player.money) {
      game.call();
      return;
    }
  };
  return {
    runBotAction,
  };
});
