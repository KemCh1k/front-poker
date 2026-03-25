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
const isMobile = ref(false);

const table = useTableStore();
const game = useGameStore();
const bgImgSrc = "/img/cards/card-alt.png";

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
});
</script>

<style scoped>
.poker__game {
  @apply self-stretch flex items-center h-full pr-4;
  @apply flex-row justify-end gap-24;
  @apply md:flex-row;
  @apply max-md:justify-evenly max-md:gap-2 max-md:px-2 max-md:overflow-x-auto;
}

.poker__table {
  @apply flex items-center;
  @apply gap-2 justify-between;
  @apply max-md:flex-nowrap max-md:gap-1;
}

.poker__tablePot {
  @apply bg-[--main-color] text-[--secondery] font-bold rounded-2xl;
  @apply text-2xl p-4;
  @apply max-md:text-sm max-md:px-2 max-md:py-1 max-md:rounded-xl whitespace-nowrap;
}

.table__cards {
  @apply rounded-2xl shadow-lg;
  @apply w-44;
  @apply max-md:w-16 max-md:rounded-xl max-md:shadow-md;
}

.card-wrapper {
  @apply w-44 h-[238px];
  @apply max-md:w-16 max-md:h-[90px];
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
