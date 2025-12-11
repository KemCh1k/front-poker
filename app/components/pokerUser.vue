<template>
  <div class="poker__user">
    <div
      class="flex items-center flex-col"
      v-for="player in otherPlayers"
      :key="player.id"
    >
      <div class="user__avatarCards">
        <div
          class="user__avatar"
          :class="[
            player.index === game.currentPlayerIndex && !player.folded
              ? 'activePlayer'
              : '',
            player.id === game.winnerId ? `userWinner` : ``,
          ]"
        >
          {{ player.id }}
        </div>
        <div v-for="card in player.cards" :key="card.userId">
          <img class="user__cards" :src="card.imgSrc" :alt="`${card.value}`" />
        </div>
      </div>
      <div class="user__money">
        {{ player.money }}
      </div>
      <div
        :class="[player.currentBet !== 0 ? `user__bet--active` : `user__bet`]"
      >
        {{ player.currentBet }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePlayerStore } from "~/stores/players";

const players = usePlayerStore();
const game = useGameStore();

const otherPlayers = computed(() =>
  players.players
    .map((player, i) => ({ ...player, index: i }))
    .filter((player) => player.id !== 1),
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
  @apply text-center items-center text-[--main-text] text-base font-normal rounded-full  min-w-6 min-h-6 opacity-0;
  &--active {
    @apply text-center flex justify-center items-center text-[--main-text] text-base font-normal rounded-full  min-w-8 min-h-8 bg-[--secondery];
  }
}

.activePlayer {
  @apply ring-1 ring-[--CTA] rounded-2xl transition-all scale-105;
}

.userWinner {
  @apply ring-1 ring-[--CTA] rounded-2xl transition-all scale-105;
}
</style>
