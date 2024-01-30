import { FC, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

export const AuthLayout: FC<{ title: string; description: string; children: ReactNode }> = ({
  children,
  description,
  title,
}) => {
  return (
    <main className="text-dark flex h-full w-full flex-col items-center gap-3 bg-white md:justify-center">
      <section className="flex w-full max-w-2xl flex-col items-center gap-4 px-4">
        <section className="flex h-full flex-col items-center gap-2">
          <header className="text-3xl font-semibold">{title}</header>
          <p className="text-md text-slate-400">{description}</p>
        </section>
        {children}
      </section>
    </main>
  )
}
