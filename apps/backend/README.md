# Accessibility Analyzer Backend

Express.js API for the Accessibility Analyzer Tool. This backend provides endpoints for analyzing web accessibility using Pa11y.

## Features

- URL accessibility analysis using Pa11y
- RESTful API endpoints
- CORS configuration for frontend integration
- TypeScript for type safety
- Health check endpoints

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
PORT=3001
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_key_here
```

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Building

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /
GET /api/v1/health
```

### Analyze URL

```
POST /api/v1/analyse
Content-Type: application/json

{
  "url": "https://example.com",
  "standard": "WCAG2AA"
}
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Vercel.

## Tech Stack

- Express.js - Web framework
- TypeScript - Type safety
- Pa11y - Accessibility testing
- Helmet - Security headers
- CORS - Cross-origin resource sharing
- Morgan - HTTP request logger
