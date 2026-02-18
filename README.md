# IHSS Caregiver Companion

AI Caregiver Companion is a structured caregiver workflow system designed to support IHSS caregivers with daily documentation, operational guidance, and ESP submission preparation. The application captures shift activity, generates structured care documentation using AI, provides IHSS and ESP workflow guidance via a curated knowledge system, and produces export-ready summaries for manual ESP submission.

This system does not integrate directly with ESP or enforce compliance rules. It provides structured workflow support and informational guidance.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + MUI |
| Backend API | Node.js + Fastify + TypeScript |
| Worker | Node.js + TypeScript |
| Database | PostgreSQL (Railway) + pgvector |
| ORM | Prisma |
| AI | OpenAI API |
| Infrastructure | Railway |
| Source Control | GitHub monorepo |
| Monitoring | Sentry |

## Repository Structure

```
repo-root/
├── apps/
│   ├── frontend/     # React + Vite application
│   ├── api/          # Fastify API server
│   └── worker/       # Background processing service
├── packages/
│   ├── shared-types/ # Shared TypeScript interfaces and DTOs
│   └── prompts/      # Versioned AI prompt library
└── docs/             # Architecture, runbooks, guides
```

## Setup

### Prerequisites

- Node.js 18+
- Railway account
- OpenAI API key
- PostgreSQL instance (Railway managed)

### Install dependencies

```bash
npm install
```

### Environment variables

Copy `.env.example` files in each service and fill in values:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/frontend/.env.example apps/frontend/.env
cp apps/worker/.env.example apps/worker/.env
```

### Run database migrations

```bash
npm run migrate
```

### Start services locally

```bash
# In separate terminals:
npm run dev:api
npm run dev:frontend
npm run dev:worker
```

## Core Workflows

**Shift Lifecycle**: User starts a shift, logs events via quick actions or notes, ends shift, and AI generates structured care documentation.

**Weekly Export**: System aggregates shifts, generates structured summary, and the user copies formatted output or downloads PDF for ESP entry.

**Knowledge Assistant**: User asks workflow question, system retrieves relevant IHSS and ESP content, and AI generates a grounded response with verification reminder.

## Guardrails

AI responses must not provide legal determinations or medical advice. Knowledge assistant responses must reference retrieved material. If no relevant retrieval exists, the system responds with uncertainty and advises verification via official sources.

## Deployment

All services are deployed on Railway. Production deployment triggers on merge to `main` branch. See `docs/environment_variables.md` for required configuration.

## Documentation

- [Architecture](docs/architecture.md)
- [AI Guardrails](docs/ai_guardrails.md)
- [Product Specification](docs/product_spec.md)
- [Environment Variables](docs/environment_variables.md)

## Contribution Guidelines

All schema changes require migration scripts. All AI prompts must be versioned. Knowledge documents must include source reference metadata. Do not add features outside defined MVP scope without approval.
