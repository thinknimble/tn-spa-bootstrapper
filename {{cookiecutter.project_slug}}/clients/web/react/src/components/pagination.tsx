import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Pagination } from '@thinknimble/tn-models'
import { cn } from 'src/utils/style'

interface PaginationProps {
  pagination: Pagination
  isLoading?: boolean
  onNextPage: () => void
  onPrevPage: () => void
  onGoToPage?: (page: number) => void
  showPageNumbers?: boolean
  variant?: 'full' | 'minimal'
  className?: string
}

export const PaginationComponent: React.FC<PaginationProps> = ({
  pagination,
  isLoading = false,
  onNextPage,
  onPrevPage,
  onGoToPage,
  showPageNumbers = true,
  variant = 'full',
  className = '',
}) => {
  const { page: currentPage, hasNextPage, hasPrevPage } = pagination
  const totalPages = pagination.calcTotalPages(pagination)
  const isMinimal = variant === 'minimal'

  const handleNextPage = () => {
    if (hasNextPage && !isLoading) {
      onNextPage()
    }
  }

  const handlePrevPage = () => {
    if (hasPrevPage && !isLoading) {
      onPrevPage()
    }
  }

  const handleGoToPage = (page: number) => {
    if (onGoToPage && page !== currentPage && page >= 1 && page <= totalPages) {
      onGoToPage(page)
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const navBtnClass =
    'inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Previous */}
      <button
        type="button"
        className={navBtnClass}
        disabled={!hasPrevPage || isLoading}
        onClick={handlePrevPage}
        data-testid="pagination-prev"
      >
        <ChevronLeft className="h-4 w-4" />
        {!isMinimal && <span className="pr-1 text-xs">Prev</span>}
      </button>

      {/* Page numbers */}
      {!isMinimal && showPageNumbers && onGoToPage && (
        <div className="flex items-center">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-1 text-xs text-muted-foreground">…</span>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleGoToPage(page as number)}
                  className={cn(
                    'inline-flex h-6 min-w-[24px] items-center justify-center rounded-md text-xs transition-colors',
                    currentPage === page
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                  )}
                  data-testid={`pagination-page-${page}`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Minimal page info (no page number buttons) */}
      {(isMinimal || !onGoToPage) && (
        <span className="px-1 text-xs text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
      )}

      {/* Next */}
      <button
        type="button"
        className={navBtnClass}
        disabled={!hasNextPage || isLoading}
        onClick={handleNextPage}
        data-testid="pagination-next"
      >
        {!isMinimal && <span className="pl-1 text-xs">Next</span>}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
