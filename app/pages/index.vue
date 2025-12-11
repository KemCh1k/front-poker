<template>
  <div class="poker">
    <!--    <div-->
    <!--      v-if="game.gameStatus === GAME_TYPE.FINISHED"-->
    <!--      class="absolute w-full h-screen bg-[#00000094] z-10 backdrop-blur-lg items-center"-->
    <!--    >-->
    <!--      <div-->
    <!--        class="relative flex flex-col text-center justify-between top-1/4 p-4 left-1/4 bg-[&#45;&#45;secondery] z-10 rounded-2xl w-2/4 h-28"-->
    <!--      >-->
    <!--        Победитель: {{ game.winnerId }}-->
    <!--        <button @click="game.startNewRound()">Новый раунд</button>-->
    <!--      </div>-->
    <!--    </div>-->
    <div
      v-if="game.gameStatus === GAME_TYPE.FINISHEDROUND"
      class="absolute w-full h-screen bg-[#00000094] z-10 backdrop-blur-lg items-center"
    >
      <div
        class="relative flex flex-col text-center justify-between top-1/4 p-4 left-1/4 bg-[--secondery] z-10 rounded-2xl w-2/4 h-28"
      >
        Игра завершена
        <button @click="game.startGame()">Новая игра</button>
      </div>
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
