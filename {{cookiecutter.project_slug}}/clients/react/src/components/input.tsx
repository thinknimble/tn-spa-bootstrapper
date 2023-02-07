import { FC, InputHTMLAttributes } from 'react'

export const Input: FC<InputHTMLAttributes<HTMLInputElement> & { extendClassName?: string }> = ({
  className,
  extendClassName,
  ...props
}) => {
  return (
    <input
      className={
        className ??
        `placeholder:text-slate-700 rounded-md p-2 bg-slate-400 text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 invalid:outline-none invalid:ring-2 invalid:ring-red-400  ${
          extendClassName ?? ''
        }`
      }
      {...props}
    />
  )
}
