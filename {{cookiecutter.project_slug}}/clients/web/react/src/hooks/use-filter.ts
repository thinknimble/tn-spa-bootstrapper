// Readme https://www.notion.so/221bbe36672980149873d74536da1d53?v=221bbe36672980ff8043000cff9eb0b5&p=221bbe3667298068a9f4f432083b441a&pm=s

import { useMemo, useState } from 'react'
import { SelectOption } from 'src/services/base-model'

// Mapped type to convert filter properties for UI state management.
export type UiFilterState<T> = {
  [K in keyof T]: T[K] extends string | undefined | null
    ? SelectOption[] // For single-select, we still use an array because react-dropdown-select does. It will have 0 or 1 items.
    : T[K] extends string[] | undefined | null
    ? SelectOption[] // For multi-select, it's an array.
    : T[K]
}

// Helper to create the initial UI state.
function createInitialUiState<T extends object>(
  initialValues: Partial<T>,
): UiFilterState<Partial<T>> {
  const uiState = {} as UiFilterState<Partial<T>>
  for (const key in initialValues) {
    // All select-like filters are initialized as empty arrays.
    uiState[key as keyof T] = [] as any
  }
  return uiState
}

export const useFilters = <T extends object>(initialValues: Partial<T>) => {
  const [uiFilters, setUiFilters] = useState<UiFilterState<Partial<T>>>(() =>
    createInitialUiState(initialValues),
  )

  // Generic setter for any filter. Used by dropdowns.
  const setFilter = <K extends keyof T>(filterName: K, value: UiFilterState<Partial<T>>[K]) => {
    setUiFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }))
  }

  // Specific toggler for multi-select checkbox-style filters.
  const toggleFilterItem = (filterName: keyof T, item: SelectOption) => {
    setUiFilters((prevFilters) => {
      const filterValue = prevFilters[filterName]
      if (!Array.isArray(filterValue)) {
        console.warn(`toggleFilterItem called on a non-array filter: ${String(filterName)}`)
        return prevFilters
      }
      const currentArray = filterValue as SelectOption[]
      const index = currentArray.findIndex((i) => i.value === item.value)
      const newArray =
        index === -1 ? [...currentArray, item] : currentArray.filter((i) => i.value !== item.value)
      return { ...prevFilters, [filterName]: newArray }
    })
  }

  // Converts UI state back to what the API expects. It inspects the initial value to guess the original type.
  const apiFilters = useMemo(() => {
    const result: Partial<T> = {}
    for (const key in initialValues) {
      // Iterate over initialValues to have a reference for the original type.
      const uiValue = uiFilters[key as keyof T]
      if (Array.isArray(uiValue)) {
        const initialValue = initialValues[key as keyof T]
        if (Array.isArray(initialValue)) {
          // Multi-select: T[K] is string[], so API needs string[]
          result[key as keyof T] = (uiValue as SelectOption[]).map((opt) => opt.value) as any
        } else {
          // Single-select: T[K] is string, so API needs a single string or undefined
          result[key as keyof T] =
            uiValue.length > 0 ? (uiValue[0] as SelectOption).value : (undefined as any)
        }
      } else {
        result[key as keyof T] = uiValue as any
      }
    }
    return result
  }, [uiFilters, initialValues])

  return {
    uiFilters,
    apiFilters,
    setFilter,
    toggleFilterItem,
  }
}
