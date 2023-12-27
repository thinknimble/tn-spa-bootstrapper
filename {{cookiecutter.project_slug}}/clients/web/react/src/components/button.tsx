import { ButtonHTMLAttributes, FC } from 'react'

type ButtonVariant = 'primary' | 'accent'
const buttonVariantMap: Record<ButtonVariant, string> = {
  primary: 'btn--primary bg-primary',
  accent: '',
}
export const Button: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    extendClassName?: string
  }
> = ({ extendClassName = '', children, variant = 'primary', ...props }) => {
  return (
    <button {...props} className={`rounded-lg ${buttonVariantMap[variant]} ${extendClassName}`}>
      {children}
    </button>
  )
}
