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
        `rounded-md bg-slate-400 p-2 text-black placeholder:text-slate-700 invalid:outline-none invalid:ring-2 invalid:ring-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300  ${
          extendClassName ?? ''
        }`
      }
      {...props}
    />
  )
}
