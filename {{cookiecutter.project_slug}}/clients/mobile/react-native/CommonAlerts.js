import { inject } from 'vue'

export function useAlert() {
  const $alert = inject('$alert')

  const successAlert = (message) => {
    $alert.alert({
      type: 'success',
      message: `
        <h2>Success!</h2>
        <p>${message}</p>
      `,
      timeout: 3000,
    })
  }
  const errorAlert = (message) => {
    $alert.alert({
      type: 'error',
      message: `
            <h2>An Error has occured!</h2>
            <p>${message}</p>
        `,
      timeout: 3000,
    })
  }
  const infoAlert = (message) => {
    $alert.alert({
      type: 'info',
      message: `
            <h2>Info</h2>
            <p>${message}</p>
        `,
      timeout: 3000,
    })
  }
  const warningAlert = (message) => {
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
