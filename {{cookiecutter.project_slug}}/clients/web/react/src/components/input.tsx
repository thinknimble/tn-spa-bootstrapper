import { FC, InputHTMLAttributes, ReactNode } from 'react'

export const Input: FC<
  InputHTMLAttributes<HTMLInputElement> & {
    extendClassName?: string
    icon?: ReactNode
    label?: string
  }
> = ({ className, extendClassName, icon, label, ...props }) => {
  return (
    <section className="flex w-full flex-col items-start">
      {label && <span className="mb-1 block text-sm font-medium text-primary">{label}</span>}
      <div className="relative w-full">
        <input
          className={
            className ??
            `w-full rounded-md border bg-white p-2 ${
              icon ? 'pr-10' : ''
            } text-black placeholder:font-thin placeholder:text-slate-500 invalid:outline-none invalid:ring-2 invalid:ring-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300  ${
              extendClassName ?? ''
            }`
          }
          {...props}
        />
        {icon ? (
          <section className="absolute inset-y-0 right-0 flex items-center pr-3">{icon}</section>
        ) : null}
      </div>
    </section>
  )
}
