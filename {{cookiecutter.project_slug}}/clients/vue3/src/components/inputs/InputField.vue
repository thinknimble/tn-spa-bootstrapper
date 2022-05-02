<template>
  <div class="field">
    <label v-if="label" class="label" :for="`${label}-field`" v-text="label" />
    <div class="control">
      <input
        class="input"
        :class="{
          'is-danger': errors.length,
        }"
        :id="`${label}-field`"
        :type="type"
        :placeholder="placeholder"
        spellcheck="false"
        v-model="val"
        @input="$emit('input', $event)"
        @blur="$emit('blur')"
        @focus="$emit('focus', $event)"
      />
    </div>
    <p
      class="help is-danger"
      v-if="errors.length"
      v-text="errors.map((err) => err.message).join(', ')"
    />
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'InputField',
  props: {
    label: {
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
  },
  emits: ['blur', 'focus', 'input', 'update:value'],
  setup(props, context) {
    const val = computed({
      get: () => props.value,
      set: (value) => context.emit('update:value', value),
    })

    return { val }
  },
}
</script>

<style scoped lang="scss"></style>
