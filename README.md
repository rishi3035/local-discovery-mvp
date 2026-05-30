# Local Discovery MVP

Monorepo for the Local Discovery travel platform.

## Structure

- `apps/admin` — Next.js admin dashboard (Vercel deployment target)
- `apps/mobile` — Expo React Native app
- `packages/shared` — Shared packages
- `supabase` — Database migrations and config

## Vercel Deployment

1. Import this repo in [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `apps/admin`.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

The included `vercel.json` handles npm workspace installs from the repo root.

## Local Development

```bash
npm install
npm run dev --workspace=@local-discovery/admin
```
