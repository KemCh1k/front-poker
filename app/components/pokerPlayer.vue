<template>
  <div class="pokerPlayer" v-if="playerOwner">
    <div class="poker__playerCards">
      <div v-for="card in playerOwner.cards" :key="card.userId">
        <img class="player__cards" :src="card.imgSrc" :alt="`${card.value}`" />
      </div>
    </div>
    <div class="player__avatarAmount">
      <div class="player__avatar">{{ playerOwner.id }}</div>
    </div>
    <button @click="table.revealNext()">next</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTableStore } from "~/stores/table";
import { usePlayerStore } from "~/stores/players";

const players = usePlayerStore();
const table = useTableStore();

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
</style>
