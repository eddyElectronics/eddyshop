# EddyShop - Production-Ready E-Commerce SPA

Modern e-commerce Single Page Application built with Next.js, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Single Page Application** - Fast, seamless navigation without page reloads
- **Modern Stack** - Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
- **Strong Typing** - Full TypeScript coverage with strict mode
- **Clean Architecture** - Organized codebase with separation of concerns
- **Testing** - Unit tests with Vitest and React Testing Library
- **CI/CD Ready** - GitHub Actions workflow for lint, test, build, and deploy

## 📁 Project Structure

```
eddyshop/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   └── components/        # Legacy components
├── src/                   # Source code (Clean Architecture)
│   ├── components/        # Reusable UI components
│   ├── config/            # App configuration
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and business logic services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── __tests__/         # Test files
├── lib/                   # Legacy library code
├── data/                  # JSON data files
└── public/                # Static assets
```

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:ci` | Run tests with coverage |
| `pnpm test:ui` | Run tests with UI |
| `pnpm format` | Format code with Prettier |
| `pnpm validate` | Run all checks (lint, type-check, test) |

## 🏗️ Architecture

### Types (`src/types/`)
Centralized TypeScript interfaces and types for the entire application.

### Services (`src/services/`)
- `api.ts` - HTTP client for API requests
- `cart.ts` - Shopping cart business logic

### Hooks (`src/hooks/`)
- `useProducts.ts` - Product data fetching and filtering
- `useCart.tsx` - Cart state management with Context
- `useCommon.ts` - Common utility hooks (search, localStorage, media queries)

### Components (`src/components/`)
- `ErrorBoundary.tsx` - Error handling component
- `LoadingSpinner.tsx` - Loading states
- `EmptyState.tsx` - Empty state displays

### Utils (`src/utils/`)
- `helpers.ts` - Utility functions (formatting, validation, etc.)

### Config (`src/config/`)
- `constants.ts` - App-wide constants and configuration

## 🧪 Testing

Tests are located in `src/__tests__/` and use:
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation

Run tests:
```bash
pnpm test        # Watch mode
pnpm test:ci     # CI mode with coverage
pnpm test:ui     # With Vitest UI
```

## 🚢 Deployment

The app is configured for automatic deployment to Vercel:

1. Push to `main` branch triggers CI/CD pipeline
2. Pipeline runs lint, type-check, and tests
3. On success, automatically deploys to Vercel

### Environment Variables

Create `.env.local` for local development:
```env
NEXT_PUBLIC_API_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
BLOB_READ_WRITE_TOKEN=
```

## 📦 Tech Stack

- **Framework**: Next.js 16.1.2 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint 9
- **Formatting**: Prettier 3
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel
- **Storage**: Vercel KV + Vercel Blob

## 📄 License

MIT License
