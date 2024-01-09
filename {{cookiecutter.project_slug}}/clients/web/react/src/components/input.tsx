import { FC, InputHTMLAttributes } from 'react'

export const Input: FC<
  InputHTMLAttributes<HTMLInputElement> & { extendClassName?: string; label?: string }
> = ({ className, extendClassName, label, ...props }) => {
  return (
    <div className="mb-1 flex w-full flex-col items-start">
      {label && (
        <span className="input--label block text-sm font-medium text-primary">{label}</span>
      )}
      <input className={className ?? `input ${extendClassName ?? ''}`} {...props} />
    </div>
  )
}
