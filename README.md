# Insurance Quote Engine - Client

Frontend of a multi-insurer vehicle quote engine. Guides users through a 14-step flow to collect vehicle and personal data, then displays quotes from multiple insurance providers.

## Stack

- React 19, Vite
- Zustand (state)
- SCSS
- React Router v6

## Quote Flow

The flow covers 14 steps: landing → vehicle type (auto / moto) → year → brand → model → version → province → personal data → contact info → quote results → plan selection → confirmation.

Supported insurers: ATM Seguros, FedPat, Mercantil Andina, Provincia Seguros, San Cristobal.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

```ini
VITE_API_URL=http://localhost:4000/api/v2
```

## Related

- API: [insurance-quote-engine-api](../insurance-quote-engine-api)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
