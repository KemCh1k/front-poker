<template>
  <div class="poker">
    <PokerUser />
    <PokerTable />
    <PokerPlayer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useGameStore } from "~/stores/game";

const game = useGameStore();
onMounted(() => {
  game.startGame();
});
</script>

<style scoped>
.poker {
  @apply w-full h-screen inline-flex flex-col  items-center justify-between pb-8;
}
</style>
