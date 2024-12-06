import { computed } from 'vue'
export function useModelWrapper<
  T extends Record<string, any>,
  TName extends Extract<keyof T, string>,
>(props: T, emit: (evt: `update:${TName}`, value: string) => void, name: TName) {
  /**
   * Unwrap model value into component
   * Remember to also add emitter to emits in component definitiion
   * emits:['update:<name>']
   */
  return computed({
    get: () => props[name],
    set: (value) => emit(`update:${name}`, value),
  })
}
