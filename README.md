# AI Agent Central Prototype

## Purpose

Local click-dummy / workshop prototype for an enterprise **AI Agent Repository / Marketplace**.

Product working name: **AI Agent Central**  
Subtitle: *Discover, assess and reuse enterprise AI capabilities*

It demonstrates how employees could discover, assess and reuse AI agents, agent products, MCP servers, skills, rules, guides, hooks and use cases across platforms — with governance metadata visible alongside business and technical views.

This is **not** a production application, **not** an OpenMetadata integration, and **not** a live AI runtime.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL 16
- Lucide React

## Setup

```bash
npm install
npm run db:up          # start PostgreSQL via Docker Compose
npm run db:setup       # prisma generate + db push + seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database scripts

| Script | Purpose |
|--------|---------|
| `npm run db:up` | Start PostgreSQL (`postgres:16-alpine`) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to PostgreSQL |
| `npm run db:seed` | Seed demo data |
| `npm run db:setup` | generate + push + seed |
| `npm run db:reset` | Force-reset schema and re-seed |

### Environment

Copy `.env.example` to `.env` (already set for local demo):

```
DATABASE_URL="postgresql://agentcentral:agentcentral@localhost:5433/agentcentral?schema=public"
```

Docker Compose maps PostgreSQL to host port **5433** (to avoid conflicts with a local Postgres on 5432). Inside the Compose network the app uses host `db` on port 5432.

### Docker (full stack)

```bash
docker compose up --build
```

Starts PostgreSQL and the application (app on port **3002** → container 3000).

## Navigation

Single catalog hierarchy (Data Central extended for AI):

- **Discover** — Home, Browse, Requests, Saved  
- **Manage** — Data Assets, Glossary, Data Products, Data Domains → **AI Agents** (Agent Products, MCP, Skills, Guides) → Use Cases, Platforms → **CAB Workspace** (Rules, Hooks, Reviews, Activity)  
- **Administrate** — Settings  

There is no separate “AI & Agentic” or “Govern” section.

## Demo credentials

No authentication required. The prototype runs as demo user **CH** (Christina H.).

## Recommended demo path

1. Open **Home** — “One place to discover and reuse AI capabilities.”
2. Open **Browse** — Data Central–style filters + Business/Technical view
3. Search **invoice**
4. Open **Invoice Triage Agent** (AGT-00123) — purpose, owner, risk, access, value
5. **Overview** / **Technical** — Minimum Requirements metadata (LangGraph, GPT-4o / Azure, etc.)
6. **Tools & MCP** — SAP Finance MCP, Jira MCP
7. **Data & Knowledge** — SAP / vendor / finance policies
8. **Governance** — risk, cyber, RAI, human oversight, emergency shutdown
9. **Dependencies** — lineage-style upstream / agent / downstream
10. Related **Finance Operations Assistant** + **Use Case** UC-FIN-023
11. **Register Agent** → type **Invoice Assistant** → reuse suggestions
12. **Platforms & Coverage** — workshop coverage gaps
13. **CAB Workspace** — change governance
14. **Request access** → **Requests**
15. Optional: **Data Assets** / **Glossary** / **Data Domains** (original Manage nav, AI-focused)

## Data disclaimer

All individual agents, owners, costs, usage metrics and operational values are **fictional demo data**.

Platform coverage descriptions may reflect the supplied workshop material but **do not represent live integrations**. Look for labels:

- *Prototype — demo data*
- *Workshop source coverage snapshot — prototype only*

## Architecture

```
src/app          pages + API routes
src/components   UI shell, cards, modals, agent detail, registration
src/lib          db, labels, metadata completeness
prisma           schema + seed
```

- **Next.js** serves pages and API routes  
- **Prisma + PostgreSQL** persist catalog entities, relationships, access requests, saved items, reviews and activity  
- **Seed script** populates a realistic demo dataset  

No Redis, Kafka, microservices, real MCP execution, or enterprise authentication.
