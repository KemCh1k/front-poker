<template>
  <div class="modal">
    <div class="overlay"></div>
    <div class="modal-card">
      <div class="title">Игра завершена</div>
      <div class="subtitle">Спасибо за игру</div>

      <div class="actions">
        <button class="btn-primary" @click="game.startGame()">
          Новая игра
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/game";

const game = useGameStore();
</script>

<style scoped>
.modal {
  @apply fixed inset-0 flex items-center justify-center z-50;
}

.overlay {
  @apply absolute inset-0 bg-black/60 backdrop-blur-sm;
}

.modal-card {
  @apply relative z-10 flex flex-col items-center justify-center gap-2
  px-8 py-6 rounded-2xl
  bg-[--secondery]
  w-1/2 max-w-[90%];
}

.title {
  @apply text-2xl font-semibold text-white;
}

.subtitle {
  @apply text-base text-[--secondery-text];
}

.actions {
  @apply mt-2 w-full;
}

.btn-primary {
  @apply w-full py-2 rounded-xl
  bg-[--CTA]
  text-white font-medium
  hover:opacity-90 active:scale-95;
}
</style>
