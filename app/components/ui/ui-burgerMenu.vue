<template>
  <button class="container" @click="toggleMenu">
    <span v-if="!showMenu">
      <icons-burger class="container-icon" />
    </span>
    <span v-else>
      <icons-close class="container-icon" />
    </span>
  </button>

  <div v-if="showMenu" class="modal">
    <div class="overlay" @click="closeMenu"></div>
    <div class="modal-card">
      <div class="title">Настройки</div>

      <div class="actions">
        <button class="btn-primary" @click="gameReset">Новая игра</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsBurger from "~/components/icons/icons-burger.vue";
import IconsClose from "~/components/icons/icons-close.vue";
import { useGameStore } from "~/stores/game";
const showMenu = ref(false);
const game = useGameStore();

const props = defineProps(["showMenu"]);
const emit = defineEmits(["update:showMenu"]);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
  emit("update:showMenu", !props.showMenu);
};

const closeMenu = () => {
  showMenu.value = false;
};

const gameReset = () => {
  showMenu.value = false;
  game.reset();
};
</script>

<style scoped>
.container {
  color: var(--main-text);
  @apply flex absolute rounded-lg bg-[--secondery] aspect-square w-10 h-auto items-center justify-center top-0 right-0 mr-3 mt-3 z-[60] shadow-md;
}

.container-icon {
  @apply w-6 h-6;
}

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
  min-w-80 max-w-[90%];
}

.title {
  @apply text-2xl font-semibold text-white;
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
