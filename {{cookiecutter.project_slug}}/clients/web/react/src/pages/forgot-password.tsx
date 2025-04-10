import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { ForgotPasswordForm, TForgotPasswordForm, userApi } from 'src/services/user'

const useTimeoutCooldown = (initial?: number) => {
  const [cooldownSeconds, setCooldown] = useState(initial ?? 0)
  const [cooldownIntervalId, setCooldownIntervalId] = useState<NodeJS.Timeout>()

  // Tick the timer down on every second as long as the cooldown has a positive value.
  useEffect(() => {
    let scopedIntervalId: NodeJS.Timeout
    if (cooldownSeconds && !cooldownIntervalId) {
      scopedIntervalId = setInterval(() => {
        setCooldown((cd) => cd - 1)
      }, 1000)

      setCooldownIntervalId(scopedIntervalId)
    }
    if (!cooldownSeconds && cooldownIntervalId) {
      clearInterval(cooldownIntervalId)
      setCooldownIntervalId(undefined)
    }
  }, [cooldownSeconds, cooldownIntervalId])

  return useMemo(
    () => ({
      cooldownSeconds,
      /**
       * Set the cooldown to a certain amount of seconds
       */
      cooldownFor: setCooldown,
    }),
    [cooldownSeconds],
  )
}

export const ForgotPasswordInner = () => {
  const { form, createFormFieldChangeHandler } = useTnForm<TForgotPasswordForm>()
  const { cooldownFor, cooldownSeconds } = useTimeoutCooldown()

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    createFormFieldChangeHandler(form.email)(e.target.value)
  }
  const { mutate: requestPasswordReset, isPending: isRequestingPasswordReset } = useMutation({
    mutationFn: userApi.csc.requestPasswordReset,
    onSuccess: () => {
      cooldownFor(60)
    },
  })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.isValid || !form.email.value) return
    requestPasswordReset({
      email: form.email.value,
    })
  }

  return (
    <AuthLayout
      title="Forgot password"
      description="We'll send an email to this address to allow you to reset your password."
    >
      <form className="flex w-full flex-col gap-3" onSubmit={onSubmit}>
        <section className="flex flex-col">
          <Input
            value={form.email.value}
            onChange={onEmailChange}
            className="w-full"
            placeholder="Email"
          />
          <ErrorsList errors={form.email.errors} />
        </section>
        <Button
          type="submit"
          disabled={!form.isValid || Boolean(cooldownSeconds) || isRequestingPasswordReset}
        >
          Send reset password email{cooldownSeconds ? ` (Resend in ${cooldownSeconds}s)` : ''}
        </Button>
      </form>
    </AuthLayout>
  )
}

export const ForgotPassword = () => {
  return (
    <FormProvider formClass={ForgotPasswordForm}>
      <ForgotPasswordInner />
    </FormProvider>
  )
}
