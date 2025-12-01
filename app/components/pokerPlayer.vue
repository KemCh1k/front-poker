<template>
  <div class="pokerPlayer" v-if="playerOwner">
    <div class="poker__playerCards">
      <div v-for="card in playerOwner.cards" :key="card.userId">
        <img class="player__cards" :src="card.imgSrc" :alt="`${card.value}`" />
      </div>
    </div>
    <div class="player__avatarAmount">
      <div class="player__avatar">{{ playerOwner.id }}</div>
      <div class="player__state">
        <div class="player__money">
          {{ playerOwner.money }}
        </div>
        <div v-if="playerOwner.currentBet !== 0" class="player__bet">
          {{ playerOwner.currentBet }}
        </div>
      </div>
    </div>
    <button @click="game.nextStep()">next</button>
    <button @click="game.reset()">reset</button>
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
  @apply text-center text-[--secondery-text] justify-start text-base font-normal;
}
</style>
