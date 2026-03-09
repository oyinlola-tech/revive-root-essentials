# Namecheap / LiteSpeed deployment notes

The current production failure is not an application CORS bug alone. The live host is returning a LiteSpeed `503 Service Unavailable` page before the Node app responds.

## What the browser error means

When the browser sends a preflight `OPTIONS` request and receives a `503` HTML page without `Access-Control-Allow-Origin`, it reports a CORS failure. In this state the real issue is upstream availability or proxy routing, not only Express middleware.

## Required hosting checks

1. Ensure the Node app is actually running and listening on the port Namecheap assigned.
2. Ensure the LiteSpeed / Passenger / reverse-proxy layer forwards:
   - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
   - `OPTIONS`
3. Ensure the proxy does not intercept `OPTIONS` and return its own 503 page.
4. Set `TRUST_PROXY=true` in production so Express respects forwarded headers.
5. Set `NODE_ENV=production`, `COOKIE_SECRET`, and all DB/JWT/payment env vars before boot.

## Required verification before release

Run:

```bash
npm run check:deployment
```

Expected result:

- `/health` returns `200`
- `/api/version` returns `200`
- `OPTIONS /api/products/featured` returns `204` or `200`
- `Access-Control-Allow-Origin` is present for `https://revive-root-essentials.telente.site`

## Important behavior

- Public GET endpoints should avoid unnecessary custom headers to reduce preflights.
- Authenticated endpoints using `Authorization` will still preflight. That is normal and must be supported by the host.
- If `npm run check:deployment` fails with `503 allow-origin=missing`, fix hosting/proxy routing before debugging application code further.
