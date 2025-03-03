import { ReactNode } from 'react'

type SidebarSectionProps = {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

export const SidebarSection = ({ title, isOpen, onToggle, children }: SidebarSectionProps) => {
  return (
    <div className="border-b border-gray-100 pb-4 text-left">
      <button
        onClick={onToggle}
        className="mb-2 flex w-full items-center justify-between text-sm font-medium uppercase text-gray-500 hover:text-gray-700"
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="text-left">{children}</div>}
    </div>
  )
}
