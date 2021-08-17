<template>
  <div :class="['mb-6', classes]">
    <label v-if="showLabel" class="block text-md font-medium text-gray-700" :for="name">{{ label }}</label>
    <div class="mt-1 relative rounded-md shadow-sm">
      <input :class="[errorMessage ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-400 focus:border-red-400' : '', meta.valid ? 'success' : '', inputClasses]" :name="name" :aria-invalid="errorMessage" :id="name" :type="type" :value="inputValue" :placeholder="placeholder" @input="handleChange" @blur="handleBlur" />
      <div v-show="errorMessage" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <!-- Heroicon name: solid/exclamation-circle -->
        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <p class="absolute leading-tight text-xsm text-red-400" :class="[errorMessage || meta.valid ? 'visible' : 'invisible']">
        {{ errorMessage || successMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import { useField } from 'vee-validate'

export default {
  props: {
    type: {
      type: String,
      default: ''
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    inputClasses: {
      type: String,
      default: 'text'
    },
    classes: {
      type: String,
      default: 'text'
    },
    value: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    successMessage: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    // we don't provide any rules here because we are using form-level validation
    // https://vee-validate.logaretm.com/v4/guide/validation#form-level-validation
    const {
      value: inputValue,
      errorMessage,
      handleBlur,
      handleChange,
      meta
    } = useField(props.name, undefined, {
      initialValue: props.value
    })

    return {
      handleChange,
      handleBlur,
      errorMessage,
      inputValue,
      meta
    }
  }
}
</script>
