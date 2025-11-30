<template>
  <div class="poker__game">
    <div class="poker__table">
      <div v-for="table in table.tableCards">
        <img class="table__cards" :src="table.imgSrc" :alt="table.imgSrc" />
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
</template>

<script setup lang="ts">
import { useTableStore } from "~/stores/table";

const table = useTableStore();
</script>

<style scoped>
.poker__game {
  @apply self-stretch inline-flex justify-end items-center gap-24 pr-10;
}

.poker__table {
  @apply self-stretch inline-flex justify-end items-center gap-2;
}

.table__cards {
  @apply w-44;
}
</style>
