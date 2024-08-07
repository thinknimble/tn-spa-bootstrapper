import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Spinner } from './spinner'

type ButtonVariant = 'primary' | 'accent' | 'disabled'
const buttonVariantMap: Record<ButtonVariant, string> = {
  primary:
    'flex w-full cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold shadow-sm border-primary text-white hover:bg-primaryLight bg-primary',
  accent: '',
  disabled:
    'flex w-full cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold shadow-sm cursor-not-allowed border-gray-200 bg-gray-200',
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
