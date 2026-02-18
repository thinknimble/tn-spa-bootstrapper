import React, { useState, useRef, useEffect } from 'react'
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Button } from './button'

interface CollapsiblePanelProps {
  title: string | React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  icon?: React.ReactNode
  direction?: 'vertical' | 'horizontal'
  collapsedWidth?: string
  expandedWidth?: string
  collapseIcon?: React.ReactNode
  expandIcon?: React.ReactNode
  onToggle?: (isOpen: boolean) => void
  showBorder?: boolean
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  defaultOpen = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  icon,
  direction = 'vertical',
  collapsedWidth = '5rem',
  expandedWidth = '24rem',
  collapseIcon,
  expandIcon,
  onToggle,
  showBorder = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentSize, setContentSize] = useState<number | undefined>(defaultOpen ? undefined : 0)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  useEffect(() => {
    if (contentRef.current) {
      const size =
        direction === 'vertical' ? contentRef.current.scrollHeight : contentRef.current.scrollWidth
      setContentSize(isOpen ? size : 0)
    }
  }, [isOpen, direction])

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const size =
        direction === 'vertical' ? contentRef.current.scrollHeight : contentRef.current.scrollWidth
      setContentSize(size)
    }
  }, [children, isOpen, direction])

  // Determine the appropriate icon based on direction and state
  const getToggleIcon = () => {
    if (direction === 'horizontal') {
      return isOpen
        ? collapseIcon || <FaChevronLeft size={16} />
        : expandIcon || <FaChevronRight size={16} />
    }
    return (
      <div
        className={`transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
      >
        {collapseIcon || <FaChevronDown size={16} />}
      </div>
    )
  }

  const containerClasses =
    direction === 'horizontal'
      ? `flex transition-all duration-300 ease-in-out ${className}`
      : `rounded-lg ${showBorder ? 'border border-border' : ''} bg-surface ${className}`

  const headerClasses =
    direction === 'horizontal'
      ? `flex cursor-pointer items-center ${isOpen ? 'justify-between' : 'justify-center'} p-4 transition-colors duration-200 hover:bg-surface-hover ${headerClassName}`
      : `flex cursor-pointer items-center justify-between p-4 transition-colors duration-200 hover:bg-surface-hover ${headerClassName}`

  return (
    <div
      className={containerClasses}
      style={direction === 'horizontal' ? { width: isOpen ? expandedWidth : collapsedWidth } : {}}
    >
      <div className={headerClasses} onClick={handleToggle}>
        {direction === 'horizontal' && !isOpen ? (
          <Button
            variant="ghost"
            className="p-1"
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
          >
            {getToggleIcon()}
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {icon && (
                <div className="text-text-secondary transition-colors duration-200">{icon}</div>
              )}
              {typeof title === 'string' ? (
                <h3 className="text-brand-primary text-lg font-semibold">{title}</h3>
              ) : (
                title
              )}
            </div>
            <Button
              variant="ghost"
              className="p-1"
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
            >
              {getToggleIcon()}
            </Button>
          </>
        )}
      </div>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={
          direction === 'vertical'
            ? {
                height: contentSize,
                opacity: isOpen ? 1 : 0,
              }
            : {
                width: isOpen ? '100%' : 0,
                opacity: isOpen ? 1 : 0,
              }
        }
      >
        <div
          ref={contentRef}
          className={`${direction === 'vertical' && showBorder ? 'border-border border-t' : ''} p-4 ${contentClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
