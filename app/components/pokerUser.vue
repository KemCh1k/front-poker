<template>
  <div class="poker__user">
    <div v-for="player in otherPlayers" :key="player.id">
      <div class="user__avatarCards">
        <div class="user__avatar">{{ player.id }}</div>
        <div v-for="card in player.cards" :key="card.userId">
          <img class="user__cards" :src="card.imgSrc" :alt="`${card.value}`" />
        </div>
      </div>
      <div class="user__money">
        {{ player.money }}
      </div>
      <div v-if="player.currentBet !== 0" class="user__bet">
        {{ player.currentBet }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePlayerStore } from "~/stores/players";

const players = usePlayerStore();

const otherPlayers = computed(() =>
  players.players.filter((player) => player.id !== 1),
);
</script>

<style scoped>
.poker__user {
  @apply self-stretch px-10 py-8 rounded-3xl inline-flex justify-between items-center w-full;
}
.user__avatarCards {
  @apply self-stretch inline-flex justify-start items-start gap-2;
}
.user__avatar {
  @apply w-20 h-20 rounded-2xl bg-[--secondery];
}
.user__cards {
  @apply w-14;
}

.user__money {
  @apply text-center text-[--CTA] justify-start text-2xl font-normal;
}

.user__bet {
  @apply text-center text-[--secondery-text] justify-start text-base font-normal;
}
</style>
