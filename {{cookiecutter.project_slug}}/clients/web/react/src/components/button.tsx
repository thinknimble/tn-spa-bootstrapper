import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Spinner } from './spinner'
import { cn } from 'src/utils/style'

type ButtonVariant =
  | 'primary'
  | 'ghost'
  | 'discreet'
  | 'secondary'
  | 'secondary-reversed'
  | 'unstyled'

const buttonVariantMap: Record<ButtonVariant, string> = {
  primary: 'text-white bg-primary active:bg-primary-300 ',
  secondary: 'text-white bg-accent active:bg-accent-400',
  discreet: 'text-primary hover:shadow-none',
  ghost: 'border border-primary text-primary active:bg-primary-100 active:text-dark',
  'secondary-reversed': 'text-secondary bg-white border border-secondary',
  unstyled: '',
}

type CommonButtonProps = {
  variant?: ButtonVariant
  icon?: ReactNode
}

const Button = forwardRef<
  HTMLButtonElement,
  CommonButtonProps &
    (
      | ({ link?: undefined; isLoading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>)
      | {
          link: LinkProps
          children: ReactNode
        }
    )
>(({ children, variant = 'primary', icon, ...props }, ref) => {
  if ('link' in props && props.link) {
    return (
      <Link
        {...props.link}
        className={cn([
          'flex items-center rounded-lg transition-transform hover:scale-[0.98]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none',
          buttonVariantMap[variant],
          props.link.className,
        ])}
      >
        {children}
        {icon && (
          <div className="ml-[8px] flex h-max w-[20px] items-center justify-center">{icon}</div>
        )}
      </Link>
    )
  } else {
    const { isLoading, ...rest } = props
    return (
      <button
        {...rest}
        ref={ref}
        className={cn([
          'flex items-center justify-center rounded-lg transition-transform hover:scale-[0.98] hover:shadow-lg',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none',
          buttonVariantMap[variant],
          props.className,
        ])}
        disabled={props.disabled || isLoading}
      >
        {isLoading ? <Spinner size="xs" /> : children}
        {icon && (
          <div className="ml-[8px] flex h-max w-[20px] items-center justify-center">{icon}</div>
        )}
      </button>
    )
  }
})

Button.displayName = 'Button'

export { Button }
