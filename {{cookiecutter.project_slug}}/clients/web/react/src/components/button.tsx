import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Spinner } from './spinner'

type ButtonVariant = 'primary' | 'ghost' | 'discreet'
const buttonVariantMap: Record<ButtonVariant, string> = {
  primary: 'text-white bg-primary px-4 py-2 active:bg-slate-400 ',
  discreet: 'text-primary hover:shadow-none',
  ghost: 'border border-primary text-primary py-2 px-4 active:bg-primary active:text-white',
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
        {props.isLoading ? <Spinner size="md" /> : children}
      </button>
    )
  }
}
