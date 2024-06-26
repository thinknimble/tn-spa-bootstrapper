<template>
  <div class="mb-2 flex w-full flex-col items-start">
    <slot name="input-label">
      <label
        v-if="label"
        :for="`${id ? id : label - 'field'}`"
        v-text="label"
        class="input--label block text-sm font-medium text-primary"
      />
    </slot>
    <input
      :disabled="disabled"
      :id="`${id ? id : label - 'field'}`"
      :type="type"
      :placeholder="placeholder"
      spellcheck="false"
      v-model="val"
      @input="$emit('input', $event)"
      @blur="$emit('blur')"
      @focus="$emit('focus', $event)"
      class="input"
      :autocomplete="autocomplete"
    />
    <ul v-if="errors.length">
      <li
        v-for="(error, index) in errors"
        :key="index"
        v-text="error.message"
        class="input--error"
      />
    </ul>
  </div>
</template>

<script>
import { useModelWrapper } from '@/composables/VModelWrapper'

export default {
  name: 'InputField',
  props: {
    label: {
      type: String,
    },
    id: {
      type: String,
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: 'Placeholder...',
    },
    value: {
      type: String,
      required: true,
    },
    errors: {
      type: Array,
      required: true,
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['blur', 'focus', 'input', 'update:value'],
  setup(props, { emit }) {
    const val = useModelWrapper(props, emit, 'value')
    return { val }
  },
}
</script>

<style scoped lang="css"></style>
