import { useState } from 'react'
import { SidebarSection } from './sidebar-section'
import { SystemPrompt } from './system-prompt'
import { X } from 'lucide-react'

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
        <div className="relative flex h-full flex-col pt-8">
          {/* Sidebar Header */}
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 lg:hidden">
            <X />
          </button>

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
