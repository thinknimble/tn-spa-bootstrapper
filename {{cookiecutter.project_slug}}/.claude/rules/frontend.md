---
paths: client/**/*.{ts,tsx}
---
# Frontend Development Guide

Frontend-specific guidance for React/TypeScript development.

## Overview

The frontend is a React + TypeScript application using Vite for tooling. It follows a service-oriented architecture with type-safe API layers built on `@thinknimble/tn-models` and form management via `@thinknimble/tn-forms`.

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tooling and dev server
- **TailwindCSS** - Styling
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zod** - Runtime type validation
- **@thinknimble/tn-models** - API layer generation
- **@thinknimble/tn-forms** - Form management
- **Zustand** - State management

## Code Conventions

**Naming**:
- `camelCase` for variables and functions
- `PascalCase` for components, classes, and types
- `SCREAMING_SNAKE_CASE` for constants

**Boolean Props/Variables**:
- Use positive names: `enableX`, `isVisible`, `showHeader` (true = yes/on)
- Never use negative names: ~~`disableX`~~, ~~`hideHeader`~~, ~~`noColors`~~ (true = no/off is confusing)
- To turn something off, set the positive name to `false`: `enableColors={false}`

**File Naming**:
- Components: `MyComponent.tsx`
- Utilities: `my-utility.ts`
- Test files: `my-component.test.tsx`

**Test Location**:
- Unit/integration tests: `client/tests/unit/**/*.test.tsx`
- E2E tests: `client/tests/e2e/specs/*.spec.ts`
- Never place tests in `client/src/`

## File Structure Pattern

For each domain/feature, organize files as:

```
src/services/my-feature/
├── models.ts       # Zod shapes, types, enums
├── api.ts          # API client with createApi
├── queries.ts      # TanStack Query definitions
├── forms.ts        # Form classes (if needed)
└── index.ts        # Public exports
```

## API Layer Patterns

### `fromApi` recursively camelCases nested record keys

`tn-models` camelCases keys inside `Record`-valued fields too, not just top-level fields. If the backend returns `{my_field: {nested_key: ...}}`, the JS object after `fromApi` is `{myField: {nestedKey: ...}}`.

### Models (Zod Shapes)

Use **pure Zod shapes** (not `z.object()`) as the base layer:

```typescript
// models.ts
import { GetInferredFromRaw } from '@thinknimble/tn-models'
import { z } from 'zod'

// Custom native enum
export const statusEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const

export type StatusValues = (typeof statusEnum)[keyof typeof statusEnum]

// Optional: Label mapping for UI
export const statusLabelMap = {
  [statusEnum.ACTIVE]: 'Active',
  [statusEnum.INACTIVE]: 'Inactive',
  [statusEnum.ARCHIVED]: 'Archived',
}

// Entity shape (GET response)
export const itemShape = {
  id: z.string().uuid(),
  name: z.string(),
  status: z.nativeEnum(statusEnum),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}

// Create shape (POST request)
export const createItemShape = {
  name: itemShape.name,
  status: itemShape.status,
}

// Filter shape (query params)
export const itemFilterShape = {
  status: z.nativeEnum(statusEnum),
  search: z.string(),
}

// Infer TypeScript types
export type Item = GetInferredFromRaw<typeof itemShape>
export type CreateItem = GetInferredFromRaw<typeof createItemShape>
export type ItemFilter = GetInferredFromRaw<typeof itemFilterShape>
```

**Key rules**:
- Use shapes (object literals), not `z.object()`
- Filters use only: `string`, `number`, `boolean`, `array`
- All filters are optional by default
- Use `z.nativeEnum()` for TypeScript enums
- Use `GetInferredFromRaw` to extract types

### API Client

Use `createApi` to generate CRUD endpoints:

```typescript
// api.ts
import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { axiosInstance } from 'src/services/axios-instance'
import { itemShape, createItemShape, itemFilterShape } from './models'
import { z } from 'zod'

// Custom action call (non-CRUD)
const archiveCall = createCustomServiceCall({
  inputShape: z.string().uuid(),
  outputShape: itemShape,
  cb: async ({ client, slashEndingBaseUri, input, utils: { fromApi } }) => {
    const response = await client.post(`${slashEndingBaseUri}${input}/archive/`)
    return fromApi(response.data)
  },
})

export const itemApi = createApi({
  client: axiosInstance,
  baseUri: '/items/', // Note: /api prefix already added by axiosInstance
  models: {
    entity: itemShape,
    create: createItemShape,
    extraFilters: itemFilterShape,
  },
  customCalls: {
    archive: archiveCall,
  },
})

// Usage:
// itemApi.list({ filters: { status: 'active' } })
// itemApi.retrieve('item-id')
// itemApi.create({ name: 'New Item', ... })
// itemApi.update({ id: 'item-id', name: 'Updated' })
// itemApi.remove('item-id')
// itemApi.csc.archive('item-id') // Custom call
```

**Key rules**:
- Axios instance at `src/services/axios-instance.ts` has `/api` prefix pre-configured
- `baseUri` should NOT include `/api` prefix
- Standard methods: `list()`, `retrieve()`, `create()`, `update()`, `remove()`
- Custom calls defined in `customCalls`, accessed via `.csc`
- Update method uses entity shape (no custom update shape)

## Form Patterns

Use `@thinknimble/tn-forms` for type-safe form handling:

```typescript
// forms.ts
import {
  Form,
  FormField,
  IFormField,
  RequiredValidator,
  EmailValidator,
} from '@thinknimble/tn-forms'

export type ItemFormInputs = {
  name: IFormField<string>
  email: IFormField<string>
}

export class ItemForm extends Form<ItemFormInputs> {
  static name = FormField.create({
    label: 'Name',
    placeholder: 'Enter name',
    type: 'text',
    validators: [new RequiredValidator({ message: 'Name is required' })],
    value: '',
  })

  static email = FormField.create({
    label: 'Email',
    placeholder: 'user@example.com',
    type: 'email',
    value: '',
    validators: [new EmailValidator({ message: 'Enter a valid email' })],
  })
}

export type TItemForm = ItemForm & ItemFormInputs
```

**Component usage**:

```typescript
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'

const FormInner = () => {
  const { createFormFieldChangeHandler, form } = useTnForm<TItemForm>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.isValid) return
    // Submit via API
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={form.name.placeholder}
        onChange={(e) => createFormFieldChangeHandler(form.name)(e.target.value)}
        value={form.name.value ?? ''}
        data-testid="name"
      />
      {form.name.error && <span>{form.name.error}</span>}
      <button type="submit" disabled={!form.isValid}>Submit</button>
    </form>
  )
}

export const ItemFormComponent = () => (
  <FormProvider<ItemFormInputs> formClass={ItemForm}>
    <FormInner />
  </FormProvider>
)
```

**Key rules**:
- Declare input types interface for dot-notation access
- Use static fields on Form class
- Wrap with `FormProvider` at component boundary
- Use `useTnForm()` hook inside provider
- `createFormFieldChangeHandler()` for change events

## Query Patterns

Use TanStack Query with `queryOptions` for type-safe queries:

```typescript
// queries.ts
import { queryOptions } from '@tanstack/react-query'
import { itemApi } from './api'
import { ItemFilter } from './models'
import { Pagination } from '@thinknimble/tn-models'

export const itemQueries = {
  all: () => ['items'],

  retrieve: (id: string) => {
    return queryOptions({
      queryKey: [...itemQueries.all(), id],
      queryFn: () => itemApi.retrieve(id),
      enabled: Boolean(id),
    })
  },

  list: ({
    filters,
    pagination,
    paginationCallback,
  }: {
    filters?: Partial<ItemFilter>
    pagination?: Pagination
    paginationCallback?: (pagination: Pagination) => void
  }) => {
    return queryOptions({
      queryKey: [...itemQueries.all(), { filters, pagination }],
      queryFn: async () => {
        const res = await itemApi.list({ filters, pagination })
        const serverPagination = new Pagination({ ...res, totalCount: res.count })
        paginationCallback?.(serverPagination)
        return res
      },
      enabled: true,
    })
  },
}
```

**Component usage**:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemQueries } from './queries'
import { itemApi } from './api'

export const ItemList = () => {
  const [filters, setFilters] = useState<Partial<ItemFilter>>({})
  const [pagination, setPagination] = useState<Pagination>()

  const { data, isLoading } = useQuery(
    itemQueries.list({
      filters,
      pagination,
      paginationCallback: setPagination,
    })
  )

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: itemApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemQueries.all() })
    },
  })
}
```

**Key rules**:
- Use `queryOptions` for better type inference
- Filters are always `Partial<FilterType>`
- Pagination callback updates state from server response
- Invalidate queries on mutations
- Use `enabled` to prevent premature fetching

## Routing & Authentication

**Route Guards** (`src/components/route-guards.tsx`):

Routes use declarative layout route guards with `<Outlet />`:

```typescript
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<RootRedirect />} />

    {/* Protected routes -- redirect to /log-in if unauthenticated */}
    <Route element={<RequireAuth />}>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* ... */}
    </Route>

    {/* Auth routes -- redirect to /dashboard if authenticated */}
    <Route element={<RedirectIfAuth />}>
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      {/* ... */}
    </Route>

    <Route path="*" element={<PageNotFound />} />
  </Route>
</Routes>
```

- `RequireAuth`: Checks `useAuth.use.token()`. If empty, redirects to `/log-in` with `state.from`.
- `RedirectIfAuth`: If token present, redirects to `/dashboard`.
- `RootRedirect`: `/dashboard` if authenticated, `/log-in` if not.

**Authentication State** (`src/stores/auth.ts`):

Zustand store with `persist` middleware:
- `hasHydrated`: Promise that resolves after localStorage rehydration. Routes block on this to prevent flash of unauthenticated state.
- `partialize`: Excludes `actions`, `hasHydrated`, and `user` from persistence.

## Error & Loading Conventions

**Query errors:**
- Don't retry 4xx (client errors), retry 5xx up to 3 times
- Handle 404/403 with specific user-facing messages

**Mutation errors:**
- Use `toast` for user feedback on mutation failures
- Map 400 validation errors to form fields when possible
- Disable submit button with `isPending`

**Loading states:**
- `isLoading` -> skeleton loader (initial load, no cached data)
- `isPending` -> inline spinner + disabled button (mutations)
- `isFetching && !isLoading` -> subtle "Updating..." indicator (background refetch)

**Optimistic updates:**
- Use `onMutate` to snapshot cache and apply optimistic update
- Use `onError` with context to rollback on failure
- Use `onSettled` to invalidate and refetch regardless of outcome

## Anti-patterns

**Avoid**:
- Using `z.object()` instead of shape objects
- Adding `/api` prefix in `baseUri` (already in axiosInstance)
- Defining custom update shapes (not supported)
- Making filter fields required
- Using class components (use functional components)
- Prop drilling (use context or query cache)
- Direct DOM manipulation (use React state)
- Inline styles (use TailwindCSS classes)

**Prefer**:
- Zod shapes with `GetInferredFromRaw`
- Native TypeScript enums
- TanStack Query for server state
- React hooks for component logic
- Composition over inheritance
- Colocation of related code

## Common Workflows

**Add new feature**:
1. Create shapes in `models.ts`
2. Create API in `api.ts`
3. Create queries in `queries.ts`
4. Create form (if needed) in `forms.ts`
5. Build components
6. Write tests

**Debug API calls**:
- Check Network tab for request/response
- Verify `baseUri` doesn't include `/api`
- Check axios interceptors in `src/services/axios-instance.ts`
- Inspect Zod validation errors
