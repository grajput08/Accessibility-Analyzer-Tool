# Accessibility Analyzer Tool

A comprehensive web accessibility analysis tool built with NuxtJS frontend and Express.js backend in a monorepo structure using pnpm workspaces.

## 🚀 Features

- **Frontend**: Modern NuxtJS application with Tailwind CSS and SASS
- **Backend**: Express.js API with TypeScript support
- **Monorepo**: Organized with pnpm workspaces for efficient development
- **Accessibility**: Built with accessibility best practices in mind
- **Modern UI**: Beautiful, responsive design with custom animations

## 📁 Project Structure

```
accessibility-analyzer-tool/
├── apps/
│   ├── frontend/          # NuxtJS application
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── nuxt.config.ts
│   └── backend/           # Express.js API
│       ├── src/
│       └── package.json
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace configuration
```

## 🛠️ Prerequisites

- Node.js (>= 18.0.0)
- pnpm (>= 8.0.0)

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd accessibility-analyzer-tool
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development servers**

   ```bash
   pnpm dev
   ```

   This will start both:

   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 📦 Available Scripts

### Root Level (Monorepo)

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm start` - Start all production servers
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests across all packages

### Frontend (apps/frontend)

- `pnpm dev` - Start Nuxt development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build

### Backend (apps/backend)

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server

## 🌐 API Endpoints

### Backend API (http://localhost:3001)

- `GET /` - Test endpoint returning API status
- `GET /health` - Health check endpoint

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Custom SASS**: Advanced styling with SASS variables and mixins
- **Modern UI**: Beautiful gradients, animations, and interactive elements
- **Accessibility**: Built with accessibility best practices
- **TypeScript**: Full TypeScript support for better development experience

## 🔧 Backend Features

- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe development
- **CORS**: Cross-origin resource sharing enabled
- **Security**: Helmet.js for security headers
- **Logging**: Morgan for HTTP request logging

## 🛠️ Development

### Adding New Packages

1. Create a new directory in `apps/`
2. Initialize with `package.json`
3. Add to workspace configuration if needed

### Environment Variables

Create `.env` files in respective package directories:

**Frontend (.env)**

```env
API_BASE_URL=http://localhost:3001
```

**Backend (.env)**

```env
PORT=3001
NODE_ENV=development
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please open an issue in the repository.
