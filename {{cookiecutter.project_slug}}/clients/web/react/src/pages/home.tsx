import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <>
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center px-6 py-20 sm:py-48 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to {{ cookiecutter.project_name }}!
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Here&apos;s some information about {{ cookiecutter.project_name }}. Please update and expand on this text. This text is
          the first thing that users will see on the home page.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/dashboard" className="btn--accent">
            Get started
          </Link>
        </div>
      </div>
    </>
  )
}
