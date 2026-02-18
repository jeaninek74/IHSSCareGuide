# Environment Variables Reference

## Frontend (`apps/frontend`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the API service (e.g., `https://api.ihss.railway.app`) |
| `VITE_APP_ENV` | Yes | Environment name: `development` or `production` |

## API (`apps/api`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Railway provides this) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for generation and embeddings |
| `OPENAI_MODEL` | Yes | Model for generation (e.g., `gpt-4o-mini`) |
| `OPENAI_EMBEDDING_MODEL` | Yes | Model for embeddings (e.g., `text-embedding-3-small`) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (min 32 chars, random) |
| `COOKIE_SECRET` | Yes | Secret for signing cookies (min 32 chars, random) |
| `APP_ENV` | Yes | `development` or `production` |
| `PORT` | No | API port (default: `4000`) |
| `HOST` | No | API host (default: `0.0.0.0`) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS (e.g., `https://ihss.railway.app`) |

## Worker (`apps/worker`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | Yes | Model for generation |
| `OPENAI_EMBEDDING_MODEL` | Yes | Model for embeddings |
| `APP_ENV` | Yes | `development` or `production` |
