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
        <div v-if="!isMobile" v-for="card in player.cards" :key="card.userId">
          <img
            class="user__cards"
            :class="{ 'card-hidden': !isCardVisible(player) }"
            :src="isCardVisible(player) ? card.imgSrc : bgImgSrc"
            :alt="`${card.value}`"
          />
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
const bgImgSrc = "/img/cards/card-alt.png";
const isMobile = ref(false);

const players = usePlayerStore();
const game = useGameStore();

const otherPlayers = computed(() =>
  players.players
    .map((player, i) => ({ ...player, index: i }))
    .filter((player) => player.id !== 1),
);

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
});

const isCardVisible = (player: any) => {
  return player.id === game.winnerId;
};
</script>

<style scoped>
.poker__user {
  @apply self-stretch rounded-3xl inline-flex justify-around items-center h-fit w-full;
}
.user__avatarCards {
  @apply self-stretch inline-flex justify-start items-start gap-2;
}
.user__avatar {
  @apply md:w-20 md:h-20 w-16 h-16 md:rounded-2xl rounded-xl bg-[--secondery] aspect-square;
}
.user__cards {
  @apply w-10 md:w-14;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-hidden {
  transform: rotateY(180deg);
}

.user__money {
  @apply text-center text-[--CTA] justify-start md:text-2xl text-lg font-normal;
}

.user__bet {
  @apply text-center items-center text-[--main-text] md:text-base text-xs font-normal rounded-full md:min-w-8 md:min-h-8 min-w-5 min-h-5 h-full opacity-0;
  &--active {
    @apply text-center flex justify-center items-center text-[--main-text] md:text-base text-xs font-normal rounded-full md:min-w-8 md:min-h-8 min-w-5 min-h-5 bg-[--secondery];
  }
}

.activePlayer {
  @apply ring-1 ring-[--CTA] rounded-2xl transition-all scale-105;
}

.userWinner {
  @apply ring-1 ring-[--CTA] rounded-2xl transition-all scale-105;
}
</style>
