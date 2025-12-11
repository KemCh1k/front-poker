<template>
  <div class="poker__game">
    <div class="poker__table">
      <div class="poker__tablePot">
        {{ game.pot }}
      </div>
      <div v-for="(_, i) in 5" :key="i" class="card-wrapper">
        <div class="card-inner" :class="{ revealed: i < table.revealedCount }">
          <img
            class="table__cards card-front"
            :src="table.tableCards[i]?.imgSrc"
            :alt="table.tableCards[i]?.imgSrc || 'card'"
          />

          <img class="table__cards" :src="bgImgSrc" alt="card back" />
        </div>
      </div>
    </div>
    <div>
      <img class="table__cards" :src="bgImgSrc" alt="card back" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTableStore } from "~/stores/table";

const table = useTableStore();
const game = useGameStore();
const bgImgSrc = "/img/cards/card-alt.png";
</script>

<style scoped>
.poker__game {
  @apply self-stretch inline-flex justify-end items-center gap-24 pr-10;
}

.poker__table {
  @apply self-stretch inline-flex items-center gap-2 justify-between;
}

.poker__tablePot {
  @apply bg-[--main-color] text-[--secondery] text-2xl font-bold p-4 rounded-2xl;
}

.table__cards {
  @apply w-44 rounded-2xl shadow-lg;
}

.card-wrapper {
  @apply w-44 h-[238px];
  perspective: 900px;
}

.card-inner {
  @apply relative w-full h-full;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.card-inner.revealed {
  transform: rotateY(180deg);
}

.card-front {
  @apply absolute w-full h-full;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}
</style>
