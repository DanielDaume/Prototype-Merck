# AI Agent Central Prototype

## Purpose

Local click-dummy / workshop prototype for an enterprise **AI Agent Repository / Marketplace** concept.

It demonstrates how Merck employees could discover, assess and reuse AI agents and related assets (MCP servers, skills, rules, guides, hooks) across platforms — with governance metadata visible alongside business and technical views.

This is **not** a production application, **not** an OpenMetadata integration, and **not** a live AI runtime.

## Tech stack

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Prisma ORM
- SQLite
- Lucide React

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

No authentication required. The prototype runs as demo user **CH** (Christina H.).

## Demo flow

1. Open **Home** — repository overview and featured agents  
2. Search **invoice** in global search  
3. Open **Invoice Triage Agent**  
4. Review **Tools & MCP**, **Governance**, **Dependencies**  
5. Open **SAP Finance MCP** from related assets  
6. Return and click **Request access**  
7. Open **Requests** to see the new request  
8. Open **Reviews** / **Activity** for governance & audit narrative  

## Data

All records and metrics in this prototype are fictional demo data unless explicitly stated otherwise.

Platform names (UPTIMIZE, myGPT, HIVE, etc.) are used as conceptual sources only. Individual agents, owners, ratings and usage numbers are invented for workshop demonstration.

## Architecture

- **Next.js** serves pages and API routes  
- **Prisma + SQLite** persist catalog entities, relationships, access requests, saved items, reviews and activity  
- **Seed script** populates a realistic demo dataset  

```
src/app          pages + API routes
src/components   UI shell, cards, modals, agent detail
prisma           schema + seed
```

## Reset

```bash
npm run db:setup
```

This regenerates the Prisma client, resets the SQLite database and re-seeds demo data.
