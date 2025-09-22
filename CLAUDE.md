# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a blog built with Astro (v5.13.2) using the "Fuwari" theme. It's a static site generator setup with TypeScript, Svelte components, and Tailwind CSS for styling. The blog supports markdown content with rich features including math rendering (KaTeX), syntax highlighting (Expressive Code), and custom directives for enhanced content.

## Development Commands

```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Build the site (includes Pagefind search index generation)
pnpm build

# Preview production build
pnpm preview

# Linting and formatting (uses Biome)
pnpm lint
pnpm format

# Create a new blog post
pnpm new-post -- "post-title"
```

## Architecture

### Content Management
- **Posts**: Located in `src/content/posts/` as markdown files
- **Content Schema**: Defined in `src/content/config.ts` with Zod validation
- **Post Creation**: Use `scripts/new-post.js` to generate posts with proper frontmatter

### Key Configuration Files
- **Site Config**: `src/config.ts` - Main site configuration (title, theme, navigation, profile)
- **Astro Config**: `astro.config.mjs` - Build configuration, integrations, and markdown processing
- **Theme Configuration**: Uses CSS custom properties and Tailwind for styling

### Component Structure
- **Layouts**: `src/layouts/` - Page layout templates
- **Components**: `src/components/` - Reusable Astro and Svelte components
- **Utilities**: `src/utils/` - Helper functions for dates, content processing, etc.

### Markdown Processing
The blog uses extensive markdown processing with:
- **Remark plugins**: Math, reading time, excerpts, GitHub admonitions, directives
- **Rehype plugins**: KaTeX math rendering, auto-linking headings, custom components
- **Custom Components**: GitHub cards, admonitions (note, tip, important, caution, warning)

### Styling System
- **Framework**: Tailwind CSS with custom theme colors
- **Code Highlighting**: Expressive Code with custom themes and plugins
- **Typography**: Uses JetBrains Mono for code and Roboto for text

### Build Process
- **Static Generation**: Builds to `dist/` directory
- **Search**: Integrates Pagefind for client-side search functionality
- **Deployment**: Configured for Vercel deployment

## Package Manager

This project uses **pnpm** exclusively (enforced by preinstall script). Always use `pnpm` instead of `npm` or `yarn`.

## Content Guidelines

When creating or editing blog posts:
- Posts must be in `src/content/posts/` directory
- Use the `pnpm new-post` command to create new posts with proper frontmatter
- Frontmatter schema is strictly validated (see `src/content/config.ts`)
- Posts support categories, tags, draft status, and custom publication dates