<template>
  <div class="poker">
    <div v-if="game.gameStatus === GAME_TYPE.FINISHEDROUND" class="poker--bg">
      <modal-poker />
    </div>
    <PokerUser />
    <PokerTable />
    <PokerPlayer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useGameStore } from "~/stores/game";
import { GAME_TYPE } from "~/data/game";
import ModalPoker from "~/components/modal/modal-poker.vue";

const game = useGameStore();
onMounted(() => {
  game.loadGame();
});
</script>

<style scoped>
.poker {
  @apply w-full h-screen inline-flex flex-col items-center justify-between md:p-8 p-4;
}

.poker--bg {
  @apply absolute w-full h-dvh top-0 bg-[--backgound] z-10 backdrop-blur-lg items-center;
}
</style>
