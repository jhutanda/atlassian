# Project Structure & Organization

## Root Directory
```
├── manifest.yml          # Forge app configuration, modules, permissions
├── package.json          # Dependencies, scripts, project metadata
├── tsconfig.json         # TypeScript compiler configuration
├── jest.config.js        # Test framework configuration
├── .eslintrc.js         # Code linting rules
├── local-runner.js      # Local development server
├── dist/                # Compiled TypeScript output
└── src/                 # Source code
```

## Source Code Organization (`src/`)

### Core Application Files
- `index.ts`: Main Forge function handlers and resolver definitions
- `macros.ts`: Confluence macro implementations (attendance tracking)

### Component Architecture (`src/components/`)
Forge UI React components for different app modules:
- `AcademicDashboard.tsx`: Project-level statistics and overview
- `AssignmentPanel.tsx`: Issue-level assignment management interface
- `SemesterManagement.tsx`: Confluence space-level semester organization
- `ProjectQueue.tsx`: JSM queue-level project proposal management

### Service Layer (`src/services/`)
Integration services for Atlassian APIs:
- `jira.ts`: Jira REST API integration, custom fields, issue management
- `confluence.ts`: Confluence API integration, page creation, space management

### Business Logic (`src/automation/`)
Workflow automation and business rules:
- `assignment-automation.ts`: Assignment submission workflows, grading automation

### Type Definitions (`src/types/`)
- `academic.ts`: Comprehensive TypeScript interfaces for academic domain objects

### Testing Structure (`src/test/`)
```
test/
├── setup.ts              # Jest test configuration and global setup
├── unit/                 # Unit tests for individual components/services
│   ├── automation.test.ts
│   ├── confluence.test.ts
│   └── jira.test.ts
└── properties/           # Property-based tests using fast-check
    ├── automation.property.test.ts
    ├── confluence-integration.property.test.ts
    ├── jira-integration.property.test.ts
    └── simple.property.test.ts
```

## Architectural Patterns

### Module Mapping (manifest.yml)
- **Jira Project Page** → `AcademicDashboard` component
- **Jira Issue Panel** → `AssignmentPanel` component  
- **Confluence Space Page** → `SemesterManagement` component
- **JSM Queue Page** → `ProjectQueue` component
- **Confluence Macros** → `macros.ts` handlers

### Function Handlers
- `main`: Routes to appropriate UI component based on module key
- `attendance-macro`: Confluence macro for attendance tracking
- `assignment-automation`: Webhook handler for assignment workflows
- `project-approval`: Webhook handler for project approval workflows

### Service Layer Pattern
- Services encapsulate Atlassian API interactions
- Type-safe interfaces defined in `academic.ts`
- Error handling and logging at service level
- Separation of concerns between UI, business logic, and API integration

### Testing Strategy
- **Unit Tests**: Test individual functions and components in isolation
- **Property-Based Tests**: Validate business rules across all valid inputs using fast-check
- **Test Setup**: Centralized configuration in `setup.ts`
- **Coverage**: Exclude test files and type definitions from coverage reports

## Naming Conventions
- **Files**: kebab-case for configuration, PascalCase for React components
- **Functions**: camelCase with descriptive names
- **Types**: PascalCase interfaces with clear domain prefixes
- **Constants**: UPPER_SNAKE_CASE for configuration values
- **Test Files**: `*.test.ts` for unit tests, `*.property.test.ts` for property-based tests

## Import Organization
- Forge APIs imported first
- Local types and interfaces
- Service layer imports
- Component imports
- Relative imports last