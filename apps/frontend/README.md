# Accessibility Analyzer Frontend

Nuxt.js frontend for the Accessibility Analyzer Tool. A modern web application for analyzing and improving web accessibility.

## Features

- URL accessibility analysis
- Real-time results display
- Responsive design
- Integration with backend API
- TypeScript for type safety
- Pinia for state management
- TailwindCSS for styling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
API_BASE_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Vercel.

## Project Structure

```
├── pages/           # Application pages
├── components/      # Vue components
├── composables/     # Composable functions
├── stores/          # Pinia stores
├── assets/          # Static assets
├── layouts/         # Application layouts
└── types/           # TypeScript types
```

## Tech Stack

- Nuxt.js 3 - Vue.js framework
- Vue 3 - Progressive JavaScript framework
- TypeScript - Type safety
- Pinia - State management
- TailwindCSS - Utility-first CSS
- SCSS - CSS preprocessor

## Features

- Analyze any publicly accessible URL
- View detailed accessibility issues
- Filter by severity
- Export results
- Responsive design for all devices
