<script lang="ts" setup>
import { useModelWrapper } from '@/composables/VModelWrapper'
import { InputHTMLAttributes } from 'vue'

interface CustomInputProps extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'onBlur'> {
  label?: string
  id?: string
  type?: string
  placeholder?: string
  value?: string
  errors?: { message: string }[]
  autocomplete?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<CustomInputProps>(), {
  label: '',
  id: '',
  type: 'text',
  placeholder: '',
  value: '',
  autocomplete: 'off',
  disabled: false,
})
const emit = defineEmits<{
  input: [inputEvent: Event]
  focus: [focusEvent: FocusEvent]
  blur: []
  'update:value': [value: string]
}>()

const val = useModelWrapper(props, emit, 'value')
</script>

<template>
  <div class="mb-2 flex w-full flex-col items-start">
    <slot name="input-label">
      <label
        v-if="label"
        :for="id ? id : `${label} - field`"
        v-text="label"
        class="input--label block text-sm font-medium text-primary"
      />
    </slot>
    <input
      :disabled="disabled"
      :id="id ? id : `${label} - field`"
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
    <ul v-if="errors?.length">
      <li
        v-for="(error, index) in errors"
        :key="index"
        v-text="error.message"
        class="input--error"
      />
    </ul>
  </div>
</template>
<style scoped lang="css"></style>
