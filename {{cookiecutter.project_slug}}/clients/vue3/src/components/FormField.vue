<template>
  <div class="field" :class="{ 'is-horizontal': isInline }">
    <div :class="{ 'field-label': isInline }">
      <label v-if="labelText.length" class="label">{{ labelText }}</label>
    </div>

    <div class="field-body">
      <div class="field">
        <div
          class="control"
          :class="{ 'has-icons-left': iconLeft.length, 'has-icons-right': iconRight.length }"
        >
          <slot name="field-input">
            <input
              :disabled="disabled"
              @input="$emit('input', $event)"
              @blur="$emit('blur')"
              @focus="$emit('focus', $event)"
              class="input"
              v-model="fieldValue"
              :class="{ 'is-rounded': isRounded, 'is-danger': errors.length }"
              :type="type"
              :placeholder="placeholder"
            />
            <span v-if="iconLeft.length" class="icon is-small is-left">
              <i class="fas fa-search"></i>
            </span>
            <span v-if="iconRight.length" class="icon is-small is-right">
              <i class="fas fa-search"></i>
            </span>
          </slot>
        </div>
      </div>
    </div>

    <p class="help is-primary" v-if="helpText">{{ helpText }}</p>
    <p class="help is-danger" :key="`${error.code}-${index}`" v-for="(error, index) in errors">
      {{ error.message }}
    </p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useModelWrapper } from '../composables/modelValue'
export default {
  props: {
    modelValue: {},
    errors: {
      type: Array,
      default: () => []
    },
    disabled: {
      default: false,
      type: Boolean
    },
    labelText: {
      default: '',
      type: String
    },
    iconLeft: {
      default: '',
      type: String
    },
    iconRight: {
      default: '',
      type: String
    },
    placeholder: {
      default: '',
      type: String
    },
    helpText: {
      default: null,
      type: String
    },
    type: {
      default: 'text',
      type: String
    }
  },
  emits: ['input', 'focus', 'blur', 'update:modelValue'],
  setup(props, context) {
    const isRounded = computed(() => Object.prototype.hasOwnProperty.call(context.attrs, 'rounded'))
    const isInline = computed(() => Object.prototype.hasOwnProperty.call(context.attrs, 'inline'))
    const fieldValue = useModelWrapper(props, context.emit, 'modelValue')
    return {
      isRounded,
      fieldValue,
      isInline
    }
  }
}
</script>

<style lang="scss" scoped></style>