# AcademiChain AI Automator

An Atlassian Forge app designed to automate academic workflows within educational institutions using Jira, Confluence, and Jira Service Management.

## Overview

AcademiChain AI Automator integrates with Atlassian Cloud products to provide seamless academic workflow automation for colleges and universities. The app leverages Atlassian's collaboration platform capabilities to streamline student assignments, project approvals, and semester activities.

## Features

### Core Integrations

- **Jira Integration**: Custom issue types for assignments, project proposals, and semester tasks
- **Confluence Integration**: Semester spaces, assignment feedback pages, and attendance tracking macros
- **JSM Integration**: Project proposal approval workflows with faculty and HOD routing
- **Automation**: Jira automation rules for assignment submissions, deadline reminders, and grading workflows

### Academic Workflows

1. **Assignment Management**
   - Create assignments with custom fields (deadline, marks, course code)
   - Student submission tracking with status transitions
   - Automated grading workflows with feedback generation
   - Deadline reminder notifications

2. **Project Proposal System**
   - JSM-based project proposal submissions
   - Multi-stage approval workflow (Faculty → HOD → Guide Assignment)
   - Team member management and technology stack tracking
   - Automatic project workspace creation upon approval

3. **Semester Management**
   - Confluence spaces for semester organization
   - Lecture notes and materials management
   - Attendance tracking with percentage calculations
   - Academic calendar integration

4. **Analytics Dashboard**
   - Real-time statistics on assignments and submissions
   - Project approval status tracking
   - Student progress monitoring
   - Faculty workload analytics

## Architecture

### Technology Stack

- **Platform**: Atlassian Forge (Serverless Functions)
- **Frontend**: Forge UI Kit with React components
- **Backend**: Forge Functions (Node.js runtime)
- **Database**: Forge Storage API + Atlassian native storage
- **Authentication**: Atlassian Identity with role-based access
- **Testing**: Jest with property-based testing using fast-check

### Project Structure

```
src/
├── components/           # Forge UI React components
│   ├── AcademicDashboard.tsx
│   ├── AssignmentPanel.tsx
│   ├── SemesterManagement.tsx
│   └── ProjectQueue.tsx
├── services/            # Integration services
│   ├── jira.ts         # Jira API integration
│   └── confluence.ts   # Confluence API integration
├── automation/          # Workflow automation
│   └── assignment-automation.ts
├── types/              # TypeScript type definitions
│   └── academic.ts
├── test/               # Test suites
│   ├── unit/          # Unit tests
│   └── properties/    # Property-based tests
└── index.ts           # Main Forge function handlers
```

## 🚀 Quick Start - Local Development

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Test the API endpoints:**
   - Dashboard Stats: [http://localhost:3000/api/dashboard-stats](http://localhost:3000/api/dashboard-stats)
   - Semester Data: [http://localhost:3000/api/semester-data](http://localhost:3000/api/semester-data)
   - Project Proposals: [http://localhost:3000/api/project-proposals](http://localhost:3000/api/project-proposals)
   - Health Check: [http://localhost:3000/health](http://localhost:3000/health)

The local development server provides a mock environment with sample data for rapid prototyping and testing.

## Installation (Production)

### Prerequisites

- Node.js 18.x or later
- Atlassian Forge CLI
- Access to Atlassian Cloud instance

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd academichain-ai-automator
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Deploy to Forge (requires authentication):
```bash
forge deploy
forge install
```

## Testing

The project uses a dual testing approach:

### Unit Tests
```bash
npm test -- --testPathPattern=unit
```

### Property-Based Tests
```bash
npm test -- --testPathPattern=properties
```

### All Tests
```bash
npm test
```

## Configuration

### Manifest Configuration

The app is configured via `manifest.yml` with the following modules:

- **Jira Project Page**: Academic dashboard for project-level statistics
- **Jira Issue Panel**: Assignment-specific interface for submissions and grading
- **Confluence Space Page**: Semester management interface
- **Confluence Macros**: Attendance tracking and academic utilities
- **JSM Queue Page**: Project proposal management interface

### Permissions

Required scopes:
- `read:jira-work` / `write:jira-work`
- `read:confluence-content.all` / `write:confluence-content`
- `read:servicedesk-request` / `write:servicedesk-request`
- `storage:app`

## Usage

### For Faculty

1. **Create Academic Projects**: Set up course projects with custom issue types
2. **Manage Assignments**: Create assignments with deadlines and grading criteria
3. **Track Submissions**: Monitor student submissions and provide feedback
4. **Semester Planning**: Organize semester activities using Confluence spaces

### For Students

1. **Submit Assignments**: Use Jira issues to submit work and track progress
2. **Project Proposals**: Submit project proposals through JSM requests
3. **View Feedback**: Access graded assignments and instructor comments
4. **Track Progress**: Monitor academic progress through personalized dashboards

### For Administrators

1. **Analytics**: View institution-wide academic statistics
2. **Configuration**: Manage academic templates and workflows
3. **User Management**: Configure role-based access for faculty and students
4. **Reporting**: Generate academic performance reports

## Development

### Adding New Features

1. Define types in `src/types/academic.ts`
2. Implement service methods in appropriate service files
3. Create UI components in `src/components/`
4. Add Forge function handlers in `src/index.ts`
5. Write unit and property tests

### Property-Based Testing

The project uses property-based testing to ensure correctness across all valid inputs. Each property test validates a specific requirement from the design document:

```typescript
/**
 * **Feature: academichain-ai-automator, Property X: Description**
 * Property statement explaining what should hold true
 */
test('Property X: Description', async () => {
  await fc.assert(
    fc.asyncProperty(
      // Input generators
      fc.string(),
      async (input) => {
        // Test implementation
        expect(result).toSatisfyProperty();
      }
    ),
    { numRuns: 100 }
  );
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Refer to Atlassian Forge documentation

---

Built with ❤️ for educational institutions using Atlassian products.