import HelloWorld from '@/components/HelloWorld.vue'
import { render } from '@testing-library/vue'
import { describe, it } from 'vitest'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const { getByText } = render(HelloWorld, {
      props: { msg },
    })
    getByText(msg)
  })
})
