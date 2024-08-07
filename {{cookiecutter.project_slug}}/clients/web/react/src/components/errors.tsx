import { IFormFieldError } from '@thinknimble/tn-forms'
import { FC, Fragment, ReactNode } from 'react'

export const ErrorMessage: FC<{ children: ReactNode }> = ({ children }) => {
  return <p className="text-left text-sm text-error">{children}</p>
}

/**
 * Utility component to render multiple error messages as a list
 * Important to give errors messages with translations keys rather than explicit strings
 */
export const ErrorsList: FC<{ errors: IFormFieldError[] }> = ({ errors }) => {
  if (!errors?.length) return <></>
  return (
    <ul className="flex flex-col gap-2 pt-3">
      {errors.map((e, idx) => (
        <Fragment key={e.code + idx}>
          <ErrorMessage>{e.message}</ErrorMessage>
        </Fragment>
      ))}
    </ul>
  )
}
