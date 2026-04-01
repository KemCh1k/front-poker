<template>
  <button :disabled="disabled" class="preset-btn">
    {{ value }}
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
  value?: string;
}
withDefaults(defineProps<Props>(), {
  value: "preset",
  variant: "primary",
});
</script>
<style scoped>
.preset-btn {
  @apply px-4 py-2 text-lg font-bold rounded-xl bg-[--CTA] text-white;
}

.preset-btn:disabled {
  @apply bg-[--secondery] text-[--secondery-text];
  cursor: default;
}
</style>
