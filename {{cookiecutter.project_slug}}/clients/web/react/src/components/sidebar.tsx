import { useState } from 'react'
import { SystemPrompt } from './system-prompt'
import { SidebarSection } from './sidebar-section'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    systemPrompt: false,
  })

  const toggleSection = (section: string) => {
    setVisibleSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-[4rem] left-0 z-40 w-80 transform overflow-hidden border-r border-gray-200 bg-white transition-transform duration-300 lg:relative lg:inset-y-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-gray-200 p-4">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 lg:hidden">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <SidebarSection
                title="System Prompt"
                isOpen={visibleSections.systemPrompt}
                onToggle={() => toggleSection('systemPrompt')}
              >
                <SystemPrompt />
              </SidebarSection>
              {/* Add more sections here */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
