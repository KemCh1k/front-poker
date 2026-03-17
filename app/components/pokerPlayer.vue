<template>
  <div class="pokerPlayer" v-if="playerOwner">
    <div class="poker__playerCards">
      <div v-for="card in playerOwner.cards" :key="card.userId">
        <img class="player__cards" :src="card.imgSrc" :alt="`${card.value}`" />
      </div>
    </div>
    <div class="player__avatarAmount">
      <div
        class="player__avatar"
        :class="[
          ownerIndex === game.currentPlayerIndex && !playerOwner.folded
            ? 'active-player'
            : '',
        ]"
      >
        {{ playerOwner.id }}
      </div>
      <div class="player__state">
        <div class="player__money">
          {{ playerOwner.money }}
        </div>
        <div
          :class="[
            playerOwner.currentBet !== 0
              ? `player__bet--active`
              : 'player__bet',
          ]"
        >
          {{ playerOwner.currentBet }}
        </div>
      </div>
    </div>
    <div class="bet__buttons">
      <!- Пресеты ставок -->
      <button class="preset-btn" @click="game.applyBetPreset('SMALL')">
        50
      </button>
      <button class="preset-btn" @click="game.applyBetPreset('MEDIUM')">
        100
      </button>
      <button class="preset-btn" @click="game.applyBetPreset('BIG')">
        200
      </button>
      <button class="preset-btn" @click="game.applyBetPreset('HALF')">½</button>
      <button class="preset-btn" @click="game.applyBetPreset('MAX')">
        ALL-IN
      </button>
      <button class="preset-btn" @click="game.fold()">fold</button>
      <button class="preset-btn" @click="game.call()">call</button>
      <button class="preset-btn" @click="game.check()">check</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTableStore } from "~/stores/table";
import { usePlayerStore } from "~/stores/players";
import { useGameStore } from "~/stores/game";

const players = usePlayerStore();
const table = useTableStore();
const game = useGameStore();

const playerOwner = computed(() =>
  players.players.find((player) => player.id === 1),
);

const ownerIndex = computed(() =>
  players.players.findIndex((player) => player.id === 1),
);
</script>

<style scoped>
.pokerPlayer {
  @apply inline-flex justify-start items-end gap-6;
}
.poker__playerCards {
  @apply inline-flex justify-start items-end gap-2;
}

.player__cards {
  @apply gap-2 w-44;
}

.player__avatarAmount {
  @apply inline-flex justify-center items-center gap-5;
}

.player__avatar {
  @apply w-28 h-28 rounded-2xl bg-[--secondery];
}

.player__state {
  @apply inline-flex flex-col justify-center items-center gap-1;
}

.player__money {
  @apply text-center text-[--CTA] justify-start text-2xl font-normal;
}

.player__bet {
  @apply text-center text-[--secondery-text] justify-start text-base font-normal opacity-0;
  &--active {
    @apply text-center flex justify-center items-center text-[--main-text] text-base font-normal rounded-full  min-w-8 min-h-8 bg-[--secondery];
  }
}

.bet__buttons {
  @apply grid grid-cols-4 gap-2 bg-[--main-color] p-4 rounded-2xl;
}

.preset-btn {
  @apply px-4 py-2 text-lg font-bold rounded-xl bg-[--CTA] text-white;
}

.active-player {
  @apply ring-1 ring-[--CTA] rounded-2xl transition-all scale-105;
}
</style>
