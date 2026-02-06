import * as React from 'react'
import { FaGripVertical } from 'react-icons/fa'
import { Group, Panel, Separator } from 'react-resizable-panels'

import { cn } from '../utils/style'

function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full [&[aria-orientation=vertical]]:flex-col', className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        'focus-visible:ring-ring focus-visible:outline-hidden bg-border relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 [&[aria-orientation=vertical]>div]:rotate-90 [&[aria-orientation=vertical]]:h-px [&[aria-orientation=vertical]]:w-full [&[aria-orientation=vertical]]:after:left-0 [&[aria-orientation=vertical]]:after:h-1 [&[aria-orientation=vertical]]:after:w-full [&[aria-orientation=vertical]]:after:-translate-y-1/2 [&[aria-orientation=vertical]]:after:translate-x-0',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="rounded-xs bg-border z-10 flex h-4 w-3 items-center justify-center border">
          <FaGripVertical className="size-2.5" />
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

