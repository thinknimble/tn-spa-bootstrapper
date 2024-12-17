import { inject } from 'vue'

export function useAlert() {
  // casting because idk where this type comes from
  const $alert = inject('$alert') as {
    alert: (args: { type: string; message: string; timeout: number }) => void
  }

  const successAlert = (message: string) => {
    $alert.alert({
      type: 'success',
      message: `
        <h2>Success!</h2>
        <p>${message}</p>
      `,
      timeout: 3000,
    })
  }
  const errorAlert = (message: string) => {
    $alert.alert({
      type: 'error',
      message: `
            <h2>An Error has occured!</h2>
            <p>${message}</p>
        `,
      timeout: 3000,
    })
  }
  const infoAlert = (message: string) => {
    $alert.alert({
      type: 'info',
      message: `
            <h2>Info</h2>
            <p>${message}</p>
        `,
      timeout: 3000,
    })
  }
  const warningAlert = (message: string) => {
    $alert.alert({
      type: 'warning',
      message: `
            <h2>Warning</h2>
            <p>${message}</p>
        `,
      timeout: 3000,
    })
  }

  return {
    successAlert,
    errorAlert,
    infoAlert,
    warningAlert,
  }
}
