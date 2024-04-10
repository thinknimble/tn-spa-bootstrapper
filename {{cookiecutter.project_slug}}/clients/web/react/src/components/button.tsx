import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Spinner } from './spinner'

type ButtonVariant = 'primary' | 'accent' | 'disabled'
const buttonVariantMap: Record<ButtonVariant, string> = {
  primary: 'btn--primary bg-primary',
  accent: '',
  disabled: 'btn--disabled bg-gray-200',
}

type CommonButtonProps = {
  variant?: ButtonVariant
  extendClassName?: string
}
export const Button: FC<
  CommonButtonProps &
    (
      | ({ link?: undefined; isLoading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>)
      | {
          link: LinkProps
          children: ReactNode
        }
    )
> = ({ extendClassName = '', children, variant = 'primary', ...props }) => {
  if ('link' in props && props.link) {
    return (
      <Link
        className={` rounded-lg transition-transform hover:scale-[1.05] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none ${buttonVariantMap[variant]} ${extendClassName}`}
        {...props.link}
      >
        {children}
      </Link>
    )
  } else {
    const { isLoading, ...rest } = props
    return (
      <button
        {...rest}
        className={` rounded-lg transition-transform hover:scale-[1.05] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none ${buttonVariantMap[variant]} ${extendClassName}`}
        disabled={props.disabled || isLoading}
      >
        {props.isLoading ? <Spinner size="sm" /> : children}
      </button>
    )
  }
}
