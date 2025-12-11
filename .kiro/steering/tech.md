# Technology Stack & Build System

## Platform
- **Atlassian Forge**: Serverless platform for Atlassian Cloud apps
- **Runtime**: Node.js 18.x
- **Architecture**: Serverless functions with Forge UI components

## Frontend Stack
- **Forge UI Kit**: Native Atlassian UI components
- **React**: JSX components for custom interfaces
- **TypeScript**: Strict typing with ES2020 target

## Backend & APIs
- **Forge Functions**: Serverless function handlers
- **Forge Storage API**: App-scoped data persistence
- **Atlassian REST APIs**: Jira, Confluence, JSM integration
- **Forge Resolver**: Function routing and request handling

## Testing Framework
- **Jest**: Unit testing with ts-jest preset
- **Fast-check**: Property-based testing for comprehensive validation
- **Test Structure**: Separate unit tests (`src/test/unit/`) and property tests (`src/test/properties/`)

## Development Tools
- **TypeScript**: Strict configuration with source maps and declarations
- **ESLint**: Code quality with TypeScript rules
- **Build Output**: Compiled to `dist/` directory

## Common Commands

### Development
```bash
npm run dev          # Start local development server (port 3000)
npm start           # Alternative to npm run dev
```

### Building & Testing
```bash
npm run build       # Compile TypeScript to dist/
npm test           # Run all tests (unit + property-based)
npm test:watch     # Run tests in watch mode
npm run lint       # Code linting (currently skipped)
```

### Local Development Endpoints
- Dashboard: `http://localhost:3000`
- API Stats: `http://localhost:3000/api/dashboard-stats`
- Health Check: `http://localhost:3000/health`

### Forge Deployment (Production)
```bash
forge deploy        # Deploy to Forge platform
forge install      # Install app in Atlassian instance
```

## Key Dependencies
- `@forge/api`: Atlassian API access
- `@forge/ui`: UI component library
- `@forge/resolver`: Function routing
- `@forge/bridge`: Frontend-backend communication
- `express`: Local development server
- `fast-check`: Property-based testing

## Configuration Files
- `manifest.yml`: Forge app configuration and permissions
- `tsconfig.json`: TypeScript compiler settings
- `jest.config.js`: Test configuration with setup file
- `package.json`: Dependencies and scripts