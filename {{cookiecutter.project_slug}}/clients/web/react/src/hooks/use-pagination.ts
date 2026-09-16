import { useState, useCallback } from 'react'
import { Pagination } from '@thinknimble/tn-models'

interface UsePaginationOptions {
  initialPagination?: Pagination
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const [pagination, setPagination] = useState<Pagination>(
    options.initialPagination || new Pagination(),
  )

  // Callback for API responses to merge server metadata with client page state
  const paginationCallback = useCallback((serverPagination: Pagination) => {
    setPagination((currentPagination) => {
      // Create new pagination with server metadata
      const updatedPagination = new Pagination(serverPagination)

      // But keep the current page and size that the user configured
      updatedPagination.page = currentPagination.page
      updatedPagination.size = currentPagination.size

      return updatedPagination
    })
  }, [])

  // Navigate to next page
  const goToNextPage = useCallback(() => {
    setPagination((currentPagination) => {
      if (!currentPagination.hasNextPage) return currentPagination

      const newPagination = new Pagination(currentPagination)
      newPagination.setNextPage()
      return newPagination
    })
  }, [])

  // Navigate to previous page
  const goToPrevPage = useCallback(() => {
    setPagination((currentPagination) => {
      if (!currentPagination.hasPrevPage) return currentPagination

      const newPagination = new Pagination(currentPagination)
      newPagination.setPrevPage()
      return newPagination
    })
  }, [])

  // Navigate to specific page
  const goToPage = useCallback((page: number) => {
    setPagination((currentPagination) => {
      const newPagination = new Pagination(currentPagination)
      newPagination.page = page
      return newPagination
    })
  }, [])

  // Reset to first page
  const resetPagination = useCallback(() => {
    setPagination((currentPagination) => {
      const newPagination = new Pagination(currentPagination)
      newPagination.page = 1
      return newPagination
    })
  }, [])

  return {
    pagination,
    paginationCallback,
    goToNextPage,
    goToPrevPage,
    goToPage,
    resetPagination,
    // Convenience properties
    currentPage: pagination.page,
    hasNextPage: pagination.hasNextPage,
    hasPrevPage: pagination.hasPrevPage,
    totalPages: pagination.calcTotalPages(pagination),
    totalCount: pagination.totalCount,
  }
}
