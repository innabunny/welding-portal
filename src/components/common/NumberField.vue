<template>
  <q-input
    :model-value="modelValue"
    type="number"
    dense
    filled
    hide-bottom-space
    v-bind="$attrs"
    class="nf"
    @update:model-value="onInput"
  >
    <template #append>
      <div class="nf-spin">
        <button class="nf-btn" tabindex="-1" @click="bump(step)">
          <q-icon name="keyboard_arrow_up" size="16px" />
        </button>
        <button class="nf-btn" tabindex="-1" @click="bump(-step)">
          <q-icon name="keyboard_arrow_down" size="16px" />
        </button>
      </div>
    </template>
  </q-input>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    step?: number;
    min?: number;
    max?: number;
  }>(),
  { step: 1, },
);

const emit = defineEmits<{ 'update:modelValue': [v: number] }>();

function clamp(v: number): number {
  if (props.min !== undefined && v < props.min) return props.min;
  if (props.max !== undefined && v > props.max) return props.max;
  return v;
}

function onInput(v: string | number | null) {
  emit('update:modelValue', clamp(Number(v ?? 0)));
}

function bump(delta: number) {
  emit('update:modelValue', clamp(Number((props.modelValue + delta).toFixed(2))));
}
</script>

<style scoped lang="scss">
.nf-spin {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.nf-btn {
  border: none;
  background: transparent;
  padding: 0;
  line-height: 0;
  cursor: pointer;
  color: var(--app-ink-soft);
  border-radius: 4px;

  &:hover {
    color: var(--app-accent);
    background: var(--app-bg);
  }
}
</style>
