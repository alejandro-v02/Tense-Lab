# Tense Lab

Aplicación web para aprender los 12 tiempos verbales del inglés construyendo oraciones y textos, con mini juegos y una IA que explica errores en español.

## Stack

- **Frontend:** React + Vite + TypeScript, Tailwind v4, Motion, dnd-kit, Zustand.
- **Backend:** NestJS (arquitectura hexagonal) + PostgreSQL + TypeORM.
- **Compartido:** `@tense-lab/shared` — tipos, esquemas Zod y el algoritmo SM-2.
- **IA:** API de Claude, solo desde el backend.
- TypeScript fijado en `5.9.x`.

## Estructura

```
tense-lab/
├── apps/
│   ├── web/        # React + Vite
│   └── api/        # NestJS (hexagonal)
├── packages/
│   └── shared/     # Tipos, Zod, SM-2
├── data/           # units.json y vocabulario
└── docker-compose.yml
```

## Desarrollo

```bash
pnpm install
pnpm build:shared
cp .env.example .env
pnpm docker:up        # levanta PostgreSQL
pnpm dev:api
pnpm dev:web
```
