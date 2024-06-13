import { FC, ReactNode } from 'react'
import { Logo } from 'src/components/logo'

export const AuthLayout: FC<{ title: string; description?: string; children: ReactNode }> = ({
  children,
  description,
  title,
}) => {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Logo />
        <header className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
          {title}
        </header>
        {description && <p className="text-md text-slate-400">{description}</p>}
      </div>
      {children}
    </div>
  )
}
