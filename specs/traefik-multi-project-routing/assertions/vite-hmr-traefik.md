---
id: vite-hmr-traefik
parent: traefik-multi-project-routing
created: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# Vite HMR Behind Traefik

## What Must Be True

The React client's `vite.config.ts` configures HMR to connect through the Traefik proxy when `VITE_HMR_HOST` is set, using `clientPort: 80` so the browser connects on the proxy's port rather than Vite's internal port.

## Implementation

```typescript
hmr: env.VITE_HMR_HOST
  ? { host: env.VITE_HMR_HOST, clientPort: 80, protocol: 'ws' }
  : undefined,
```

## Why `clientPort` Not `port`

- `port: 80` would tell Vite to start its WebSocket server on port 80 inside the container (privileged, wrong)
- `clientPort: 80` tells only the browser to connect on port 80 — Vite still listens on 8080 where Traefik routes traffic

## Environment Variable

`VITE_HMR_HOST` is set in `compose/docker-compose.traefik.yml`:
```yaml
client:
  environment:
    - VITE_HMR_HOST=${PROJECT}.localhost
```

It is absent in standalone mode, so the `hmr` config is `undefined` and Vite uses its default behavior.

## Success Criteria

- ✅ `vite.config.ts` reads `VITE_HMR_HOST` from env
- ✅ When set, HMR uses `clientPort: 80` and `protocol: 'ws'`
- ✅ When unset, HMR config is `undefined` (standalone mode unaffected)
- ✅ No WebSocket errors in browser console when running behind Traefik
- ✅ File changes trigger hot reload in both standalone and Traefik modes
