# Architecture Document

## System Architecture Overview

AI Caregiver Companion is a multi-service web application composed of a frontend interface, backend API, background worker, PostgreSQL database, and AI processing layer.

## Architecture Goals

- Maintain clear separation between UI, business logic, and AI orchestration.
- Ensure AI processing is deterministic and grounded in stored data.
- Prevent AI from becoming a single source of truth for compliance decisions.
- Provide scalable infrastructure deployable via Railway.

## System Components

### Frontend Service
- **Technology**: React with Vite, TypeScript, MUI
- **Location**: `apps/frontend`
- **Responsibilities**: User authentication flows, dashboard interface, shift workflow UI, incident reporting UI, knowledge assistant interface, export generation UI
- **Communication**: HTTP requests to API service via axios

### Backend API Service
- **Technology**: Node.js, Fastify framework, TypeScript
- **Location**: `apps/api`
- **Responsibilities**: Authentication, authorization, data persistence, AI orchestration, knowledge retrieval, export generation, guardrail enforcement

### Worker Service
- **Technology**: Node.js background worker, TypeScript
- **Location**: `apps/worker`
- **Responsibilities**: Asynchronous AI processing, embedding generation, knowledge ingestion, scheduled tasks

### Database
- **Technology**: PostgreSQL (Railway managed)
- **Extensions**: pgvector for embedding storage
- **ORM**: Prisma
- **Core Tables**: users, user_profiles, shifts, shift_events, structured_notes, incidents, weekly_exports, knowledge_documents, knowledge_chunks

### AI Layer
- **Technology**: OpenAI API
- **Functions**: Structured care documentation generation, incident narrative structuring, knowledge assistant response generation, embedding creation

## Knowledge Retrieval Architecture

1. Curated IHSS and ESP documents are ingested via admin pipeline.
2. Documents are chunked into smaller segments.
3. Embeddings are generated and stored in PostgreSQL using pgvector.
4. When a user asks a question, the system performs a similarity search.
5. Top relevant chunks are retrieved with confidence scores.
6. AI response is generated **only** using retrieved content.

## Deployment Architecture

Railway hosts:
- Frontend service
- API service
- Worker service
- PostgreSQL database

GitHub triggers automated deployment on merge to `main`.

## Monorepo Structure

```
repo-root/
├── apps/
│   ├── frontend/     # React + Vite + TypeScript + MUI
│   ├── api/          # Node.js + Fastify + TypeScript + Prisma
│   └── worker/       # Node.js background worker + TypeScript
├── packages/
│   ├── shared-types/ # Single source of truth for all DTOs
│   └── prompts/      # Versioned AI prompt library
└── docs/             # Architecture, runbooks, guides
```
