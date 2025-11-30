<template>
  <div class="poker">
    <div class="poker__user">
      <div v-for="player in otherPlayers" :key="player.id">
        <div class="user__avatarCards">
          <div class="user__avatar">{{ player.id }}</div>
          <div v-for="card in player.cards" :key="card.userId">
            <img
              class="user__cards"
              :src="card.imgSrc"
              :alt="`${card.value}`"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="poker__game">
      <div class="poker__table">
        <div v-for="table in table.tableCards">
          <div v-for="cards in table.cards">
            <img class="table__cards" :src="cards.imgSrc" :alt="cards.imgSrc" />
          </div>
        </div>
      </div>
      <div>
        <img
          class="table__cards"
          :src="`/img/cards/card-alt.png`"
          :alt="`/img/cards/card-alt.png`"
        />
      </div>
    </div>
    <div class="pokerPlayer" v-if="playerOwner">
      <div class="poker__playerCards">
        <div v-for="card in playerOwner.cards" :key="card.userId">
          <img
            class="player__cards"
            :src="card.imgSrc"
            :alt="`${card.value}`"
          />
        </div>
      </div>
      <div class="player__avatarAmount">
        <div class="player__avatar">{{ playerOwner.id }}</div>
      </div>
      <button @click="table.revealNext()">next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useDeckStore } from "~/stores/deck";
import { usePlayerStore } from "~/stores/players";
import type { ICard } from "~/data/cards";
import { useTableStore } from "~/stores/table";

const deck = useDeckStore();
const players = usePlayerStore();
const table = useTableStore();

const playerOwner = computed(() =>
  players.players.find((player) => player.id === 1),
);

const otherPlayers = computed(() =>
  players.players.filter((player) => player.id !== 1),
);
onMounted(() => {
  deck.initDeck();
  deck.shuffle();
  players.initPlayers();
  players.delCards();
  table.initTable();
  table.pushTable();
  table.revealNext();
});
</script>

<style scoped>
.poker {
  @apply w-full h-screen inline-flex flex-col  items-center gap-24 justify-between pb-8;
}

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

.poker__game {
  @apply self-stretch inline-flex justify-end items-center gap-24 pr-10;
}

.poker__table {
  @apply self-stretch inline-flex justify-end items-center gap-2;
}

.table__cards {
  @apply w-44;
}
.pokerPlayer {
  @apply inline-flex justify-start items-end gap-6;
}
.poker__playerCards {
  @apply inline-flex justify-start items-end gap-2;
}

.player__cards {
  @apply gap-2 w-44;
}

.player__avatarAmount {
  @apply inline-flex justify-center items-center gap-5;
}

.player__avatar {
  @apply w-28 h-28 rounded-2xl bg-[--secondery];
}
</style>
