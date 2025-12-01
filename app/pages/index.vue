<template>
  <div class="poker">
    <PokerUser />
    <PokerGame />
    <PokerPlayer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useDeckStore } from "~/stores/deck";
import { usePlayerStore } from "~/stores/players";
import type { ICard } from "~/data/cards";
import { useTableStore } from "~/stores/table";
import PokerUser from "~/components/pokerUser.vue";
import { useGameStore } from "~/stores/game";

const deck = useDeckStore();
const players = usePlayerStore();
const table = useTableStore();
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
