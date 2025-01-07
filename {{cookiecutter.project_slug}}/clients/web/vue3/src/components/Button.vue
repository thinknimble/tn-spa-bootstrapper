<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ButtonHTMLAttributes } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'unstyled'

interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: ButtonVariant
  extendClass?: string
  isLoading?: boolean
}

const buttonVariantClassMap: Record<
  ButtonVariant,
  {
    buttonClass: string
    spinnerColor?: string
  }
> = {
  primary: { buttonClass: 'bg-primary text-white', spinnerColor: 'white' },
  secondary: { buttonClass: 'bg-secondary text-black hover:bg-primary hover:text-white' },
  unstyled: {
    buttonClass: '',
  },
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
})
</script>

<template>
  <button
    :class="`py-2 px-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center hover:ease-in hover:transition-transform hover:scale-[0.95] ${
      buttonVariantClassMap[props.variant].buttonClass
    } ${props.extendClass}`"
    :disabled="props.isLoading"
  >
    <LoadingSpinner
      v-if="props.isLoading"
      class="w-4"
      :color="buttonVariantClassMap[props.variant].spinnerColor"
    />
    <slot v-else />
  </button>
</template>
