import { onMounted, onUnmounted, Ref, ref, watchEffect } from 'vue'

export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  const update = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }
  onMounted(() => {
    window.addEventListener('resize', update)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })
  return { width, height }
}

export const useIsMobile = () => {
  const { width } = useWindowSize()
  const isMobile = ref(width.value < 768)
  watchEffect(() => {
    isMobile.value = width.value < 768
  })

  return { isMobile, width }
}

export const useElementSize = (element: Ref<HTMLElement | null>) => {
    /**
     * Usage 
     *  ```html
     *     <div ref="assetContainer" class="asset-container">
     *   ```
     *  const assetContainer = ref<HTMLElement | null>(null)
     *  const { width, height, disconnect } = useElementSize(assetContainer)
     *  const assetContainer = ref<HTMLElement | null>(null)
     *  
     * 
     *  onBeforeUnmount(() => {
     *  disconnect()
     * })
     * 
     */
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | null = null

  const updateSize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    width.value = entry.contentRect.width
    height.value = entry.contentRect.height
  }

  watchEffect(() => {
    if (element.value) {
      const entry = { contentRect: element.value.getBoundingClientRect() }
      updateSize([entry as ResizeObserverEntry])
    }
  })

  onMounted(async () => {
    if (element.value) {
      observer = new ResizeObserver(updateSize)
      observer.observe(element.value)
    }
  })

  onUnmounted(() => {
    if (observer && element.value) {
      observer.disconnect()
   
    }
  })
  function disconnect() {
    console.log(observer, element.value)
    if (observer && element.value) {
      observer.disconnect()
    }
  }

  return { width, height, observer, disconnect }
}
