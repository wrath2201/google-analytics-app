# Contributing to SwytchAnalytics

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/google-analytics-app.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in your values
5. Start the dev server: `npm run dev`

## Branch Naming

- `feature/<name>` — new features
- `fix/<name>` — bug fixes
- `docs/<name>` — documentation changes

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes and test thoroughly
3. Ensure `npm run build` passes without errors
4. Open a pull request with a clear description
5. Wait for review

## Code Style

- Use TypeScript for all new files
- Follow the existing component patterns in `src/components/`
- Use the design system colors and tokens defined in `globals.css`
- Keep components focused and reusable

## Reporting Issues

Use the [GitHub issue templates](.github/ISSUE_TEMPLATE/) to report bugs or request features.
