# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 web application for streaming GraphAI agent outputs. Provides a real-time interface for interacting with GraphAI graphs.

## Commands

```bash
yarn serve      # Start Vite dev server
yarn build      # Build for production (vue-tsc && vite build)
yarn lint       # Run ESLint on src/
yarn format     # Format with Prettier
```

## Architecture

- Vue 3 + Vite + TypeScript
- `src/components/` - Vue components
- `src/router/` - Vue Router configuration
- `src/config/` - Application configuration
- `src/i18n/` - Internationalization
- Uses Vue Composition API
