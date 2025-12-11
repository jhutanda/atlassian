# Design Document

## Overview

AcademiChain AI Automator is an Atlassian Forge app designed to automate academic workflows within educational institutions using Jira, Confluence, and Jira Service Management. The app leverages Atlassian's cloud platform capabilities to provide seamless integration with existing business tools, enabling colleges and universities to manage assignments, project approvals, and semester activities without leaving their familiar Atlassian environment. Built specifically for business teams in educational settings, the app removes friction from academic operations while maintaining enterprise-grade security and scalability.

## Architecture

### Forge App Architecture

The AcademiChain AI Automator follows Atlassian Forge's serverless architecture pattern, integrating deeply with Atlassian Cloud products:

```
┌─────────────────────────────────────────────────────────────┐
│                 Atlassian Cloud Products                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │    Jira     │ │ Confluence  │ │   Jira Service Mgmt     │ │
│  │  Projects   │ │   Spaces    │ │     Requests            │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Forge App Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Custom    │ │  Confluence │ │    Jira Automation      │ │
│  │ UI Modules  │ │   Macros    │ │       Rules             │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Forge     │ │   Webhook   │ │    Background Jobs      │ │
│  │ Functions   │ │  Handlers   │ │     & Schedulers        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Forge Platform Services                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Storage   │ │   Events    │ │      External APIs      │ │
│  │     API     │ │     API     │ │      (AI Services)      │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Platform**: Atlassian Forge (Serverless Functions)
- **Frontend**: Forge UI Kit with React components
- **Backend**: Forge Functions (Node.js runtime)
- **Database**: Forge Storage API (encrypted key-value store)
- **Authentication**: Atlassian Identity with Forge context
- **Integrations**: Atlassian REST APIs (Jira, Confluence, JSM)
- **Automation**: Jira Automation Rules and Confluence Blueprints
- **AI Services**: External AI APIs via Forge's fetch API
- **Deployment**: Forge CLI with automated CI/CD

## Components and Interfaces

### Forge App Components

#### 1. Jira Integration Components
```typescript
// Custom Issue Types for Academic Workflows
interface AcademicIssueType {
  name: 'Assignment' | 'Project Proposal' | 'Semester Task';
  fields: CustomField[];
  workflow: WorkflowScheme;
  screens: ScreenScheme[];
}

interface AssignmentIssue {
  issueType: 'Assignment';
  summary: string;
  description: string;
  customFields: {
    deadline: Date;
    totalMarks: number;
    courseCode: string;
    allowFileUpload: boolean;
    submissionStatus: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';
    grade?: number;
    feedback?: string;
  };
  assignee: string; // Student
  reporter: string; // Faculty
}

interface ProjectProposalIssue {
  issueType: 'Project Proposal';
  summary: string;
  description: string;
  customFields: {
    problemStatement: string;
    proposedTechnology: string[];
    teamMembers: string[];
    synopsisAttachment: string;
    approvalStatus: 'Submitted' | 'Faculty Review' | 'HOD Approval' | 'Approved' | 'Rejected';
    assignedGuide?: string;
  };
}
```

#### 2. Confluence Integration Components
```typescript
// Academic Page Templates and Macros
interface AcademicPageTemplate {
  templateKey: string;
  name: string;
  description: string;
  content: string;
  variables: TemplateVariable[];
}

interface SemesterSpaceBlueprint {
  spaceKey: string;
  spaceName: string;
  description: string;
  pages: {
    syllabus: PageTemplate;
    assignments: PageTemplate;
    lectures: PageTemplate;
    resources: PageTemplate;
  };
}

interface AssignmentFeedbackMacro {
  macroName: 'assignment-feedback';
  parameters: {
    assignmentId: string;
    studentId: string;
    grade: number;
    feedback: string;
    submissionDate: Date;
  };
}
```

#### 3. Jira Service Management Integration
```typescript
interface ProjectProposalRequest {
  requestType: 'Project Proposal Submission';
  summary: string;
  description: string;
  customFields: {
    projectTitle: string;
    problemStatement: string;
    proposedTechnology: string[];
    teamMembers: TeamMember[];
    synopsisFile: Attachment;
  };
  approvalProcess: ApprovalWorkflow;
}

interface ApprovalWorkflow {
  stages: [
    { name: 'Faculty Review'; approvers: string[]; },
    { name: 'HOD Approval'; approvers: string[]; },
    { name: 'Guide Assignment'; automated: true; }
  ];
}
```

### Forge Function Interfaces

#### Academic Workflow Functions
```typescript
// Forge Function for Assignment Creation
export async function createAssignment(req: ForgeRequest): Promise<ForgeResponse> {
  const { title, description, deadline, totalMarks, courseCode } = req.body;
  
  // Create Jira issue using Atlassian API
  const issueData = {
    fields: {
      project: { key: courseCode },
      issuetype: { name: 'Assignment' },
      summary: title,
      description: description,
      customfield_deadline: deadline,
      customfield_totalmarks: totalMarks
    }
  };
  
  return await jiraApi.createIssue(issueData);
}

// Forge Function for Project Workspace Creation
export async function createProjectWorkspace(req: ForgeRequest): Promise<ForgeResponse> {
  const { proposalId, projectTitle, teamMembers } = req.body;
  
  // Create Confluence space for project
  const spaceData = {
    key: `PROJ-${proposalId}`,
    name: projectTitle,
    description: `Project workspace for ${projectTitle}`,
    type: 'global'
  };
  
  return await confluenceApi.createSpace(spaceData);
}
```

#### Automation Rule Interfaces
```typescript
interface JiraAutomationRule {
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

interface AssignmentSubmissionRule extends JiraAutomationRule {
  trigger: {
    type: 'issue_transitioned';
    toStatus: 'Submitted';
  };
  actions: [
    {
      type: 'send_notification';
      recipients: ['reporter']; // Faculty member
    },
    {
      type: 'create_confluence_page';
      template: 'assignment-feedback-template';
    }
  ];
}
```

## Data Models

### Atlassian Integration Models

#### User Management (Leveraging Atlassian Identity)
```typescript
interface AtlassianUser {
  accountId: string; // Atlassian Account ID
  emailAddress: string;
  displayName: string;
  active: boolean;
  groups: string[]; // Atlassian groups for role management
}

interface AcademicUserProfile {
  accountId: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  studentId?: string;
  employeeId?: string;
  courses: string[]; // Jira project keys
}
```

#### Academic Project Models (Jira Projects)
```typescript
interface AcademicProject {
  key: string; // Jira project key (e.g., CS101, MATH201)
  name: string;
  projectTypeKey: 'academic_course';
  lead: string; // Faculty account ID
  description: string;
  customFields: {
    courseCode: string;
    semester: string;
    academicYear: string;
    department: string;
  };
}

interface SemesterConfiguration {
  projectKey: string;
  semesterName: string;
  startDate: Date;
  endDate: Date;
  issueTypes: ['Assignment', 'Lab Task', 'Exam', 'Project'];
  workflows: WorkflowScheme[];
}
```

#### Forge Storage Models
```typescript
interface ForgeStorageData {
  // Academic configuration stored in Forge Storage
  academicConfig: {
    institutionName: string;
    departments: Department[];
    semesterSchedule: SemesterSchedule;
    gradeScale: GradeScale;
  };
  
  // AI suggestions and templates
  workflowTemplates: WorkflowTemplate[];
  aiSuggestions: AISuggestion[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'assignment' | 'project' | 'semester';
  jiraAutomationRules: AutomationRuleConfig[];
  confluenceTemplates: PageTemplateConfig[];
  jsmRequestTypes: RequestTypeConfig[];
}
```

#### Integration Data Models
```typescript
interface AtlassianIntegrationData {
  // Jira-specific data
  jiraProjects: {
    [projectKey: string]: {
      issueTypes: IssueTypeConfig[];
      customFields: CustomFieldConfig[];
      workflows: WorkflowConfig[];
      permissions: PermissionScheme;
    };
  };
  
  // Confluence-specific data
  confluenceSpaces: {
    [spaceKey: string]: {
      templates: PageTemplate[];
      macros: MacroConfig[];
      permissions: SpacePermissions;
    };
  };
  
  // JSM-specific data
  jsmProjects: {
    [projectKey: string]: {
      requestTypes: RequestType[];
      approvalWorkflows: ApprovalWorkflow[];
      slaConfigurations: SLAConfig[];
    };
  };
}
```

#### Academic Workflow Execution Models
```typescript
interface AcademicWorkflowExecution {
  id: string;
  workflowType: 'assignment_submission' | 'project_approval' | 'semester_management';
  atlassianContext: {
    issueKey?: string;
    pageId?: string;
    requestKey?: string;
    projectKey: string;
  };
  executionSteps: AtlassianExecutionStep[];
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
}

interface AtlassianExecutionStep {
  stepType: 'jira_transition' | 'confluence_create' | 'jsm_approval' | 'notification_send';
  atlassianApiCall: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    payload?: any;
  };
  result?: any;
  error?: string;
  executedAt?: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties related to data persistence (assignments, workflows, semester plans) can be combined into comprehensive storage properties
- UI display properties for different user roles can be consolidated into role-based access properties  
- Notification and activity logging properties can be combined into comprehensive event handling properties
- Import/export and backup properties can be unified into data serialization round-trip properties

### Core Properties

**Property 1: Drag-and-drop workflow construction**
*For any* trigger block and canvas position, dragging the block to the canvas should allow placement and enable configuration of trigger conditions
**Validates: Requirements 1.2**

**Property 2: Workflow connection validation**
*For any* valid action block and trigger block combination, connecting them should validate the workflow logic and display appropriate connection indicators
**Validates: Requirements 1.3**

**Property 3: Workflow persistence round-trip**
*For any* valid workflow configuration, saving and then loading the workflow should preserve all workflow elements, connections, and configurations
**Validates: Requirements 1.4, 8.1, 8.2**

**Property 4: Workflow simulation consistency**
*For any* executable workflow, testing the workflow should produce simulation results that match the expected outcomes based on the workflow configuration
**Validates: Requirements 1.5**

**Property 5: Assignment data completeness**
*For any* assignment creation request, the system should store all required fields (title, deadline, marks, file upload requirements) and make them retrievable
**Validates: Requirements 2.1**

**Property 6: Assignment submission triggers**
*For any* assignment submission, the system should automatically notify the assigned teacher and create a corresponding review task
**Validates: Requirements 2.2**

**Property 7: Assignment feedback generation**
*For any* submitted assignment, the system should generate an assignment feedback page and update the submission database with the submission details
**Validates: Requirements 2.3**

**Property 8: Deadline notification scheduling**
*For any* assignment with an approaching deadline, the system should send reminder notifications to students with pending submissions
**Validates: Requirements 2.4**

**Property 9: Review workflow completion**
*For any* teacher review action, the system should enable grading and feedback entry while automatically notifying the student of the review
**Validates: Requirements 2.5**

**Property 10: Semester plan data persistence**
*For any* semester plan creation, the system should store all components (weekly schedules, materials, assignments, lab tasks) and make them accessible
**Validates: Requirements 3.1**

**Property 11: Semester activity synchronization**
*For any* semester activity update, the changes should be reflected in both the calendar interface and progress indicators
**Validates: Requirements 3.2**

**Property 12: Attendance calculation accuracy**
*For any* attendance record entry, the system should update student attendance records and calculate attendance percentages correctly
**Validates: Requirements 3.3**

**Property 13: Calendar integration consistency**
*For any* internal exam date setting, the system should integrate with the calendar system and send notifications to all relevant students
**Validates: Requirements 3.4**

**Property 14: Progress visualization accuracy**
*For any* semester progress state, the system should display completion status using accurate visual progress indicators and timeline bars
**Validates: Requirements 3.5**

**Property 15: Project proposal data capture**
*For any* project proposal submission, the system should capture all required fields (title, problem statement, technology, team members, synopsis)
**Validates: Requirements 4.1**

**Property 16: Project approval workflow initiation**
*For any* project proposal submission, the system should automatically initiate the faculty review and HOD approval workflow
**Validates: Requirements 4.2**

**Property 17: Project approval completion actions**
*For any* completed project approval, the system should allocate a guide and create a project workspace page
**Validates: Requirements 4.3**

**Property 18: Project milestone generation**
*For any* approved project, the system should create timeline-based deliverables and tracking mechanisms
**Validates: Requirements 4.4**

**Property 19: Project status propagation**
*For any* project status change, the system should update all stakeholders and reflect changes in the dashboard
**Validates: Requirements 4.5**

**Property 20: Dashboard statistics generation**
*For any* dashboard data request, the system should generate real-time statistics using charts and graphs for visual representation
**Validates: Requirements 5.2**

**Property 21: Workflow analytics display**
*For any* workflow usage analysis request, the dashboard should show active workflows, execution frequency, and performance metrics
**Validates: Requirements 5.3**

**Property 22: Student progress compilation**
*For any* student progress report generation, the dashboard should compile both individual and aggregate academic performance data
**Validates: Requirements 5.4**

**Property 23: System alert display**
*For any* system alert occurrence, the dashboard should display notifications for critical events requiring administrative attention
**Validates: Requirements 5.5**

**Property 24: AI context analysis**
*For any* AI assistance request, the AI assistant should analyze the current context and suggest relevant workflow components
**Validates: Requirements 6.1**

**Property 25: AI workflow recommendations**
*For any* workflow suggestion generation, the AI assistant should provide step-by-step automation recommendations based on academic best practices
**Validates: Requirements 6.2**

**Property 26: AI suggestion interaction**
*For any* AI suggestion interaction, the system should allow selection and automatic insertion of suggested workflow elements
**Validates: Requirements 6.3**

**Property 27: AI optimization detection**
*For any* complex workflow being built, the AI assistant should identify potential optimization opportunities and suggest improvements
**Validates: Requirements 6.4**

**Property 28: AI template provision**
*For any* workflow template request, the AI assistant should provide pre-configured workflows for common academic scenarios
**Validates: Requirements 6.5**

**Property 29: Authentication and role-based redirection**
*For any* user login attempt, the system should authenticate credentials and redirect to the appropriate role-based interface
**Validates: Requirements 7.1**

**Property 30: Role-based access control**
*For any* user role and feature combination, the system should restrict access to features and data based on user role authorization
**Validates: Requirements 7.5**

**Property 31: Workflow template modification**
*For any* imported workflow template, the system should allow users to modify the workflow before saving
**Validates: Requirements 8.3**

**Property 32: Bulk workflow export**
*For any* workflow collection, the system should provide bulk export functionality for multiple workflows
**Validates: Requirements 8.4**

**Property 33: Import validation and error handling**
*For any* imported workflow containing errors, the system should display validation messages and suggest corrections
**Validates: Requirements 8.5**

**Property 34: Event notification generation**
*For any* system event occurrence, the system should generate notifications and display them in the global notifications panel
**Validates: Requirements 9.1**

**Property 35: Activity logging completeness**
*For any* user activity performed, the system should log actions in the comprehensive activity tracking system
**Validates: Requirements 9.2**

**Property 36: Notification state management**
*For any* notification viewing action, the system should mark notifications as read and maintain notification history
**Validates: Requirements 9.3**

**Property 37: Activity log chronological display**
*For any* activity log access, the system should display chronological user actions with timestamps and details
**Validates: Requirements 9.4**

**Property 38: Notification preference enforcement**
*For any* notification preference configuration, the system should respect user settings for notification delivery methods
**Validates: Requirements 9.5**

**Property 39: Comprehensive data persistence**
*For any* data storage operation, the system should persist workflows, assignments, submissions, semester schedules, and user information in the database
**Validates: Requirements 10.1**

**Property 40: Database consistency and concurrency**
*For any* database operation, the system should maintain data consistency and handle concurrent access safely
**Validates: Requirements 10.2**

**Property 41: Backup and restore round-trip**
*For any* system data, backup export and restoration should preserve all data integrity and relationships
**Validates: Requirements 10.3**

**Property 42: Data validation enforcement**
*For any* data entry attempt, the system should enforce data integrity constraints and prevent invalid data entry
**Validates: Requirements 10.4**

## Error Handling

### Error Categories and Strategies

#### 1. User Input Validation Errors
- **Client-side validation**: Real-time form validation with immediate feedback
- **Server-side validation**: Comprehensive data validation with detailed error messages
- **File upload errors**: Size limits, type restrictions, and malware scanning
- **Workflow configuration errors**: Block connection validation and logic verification

#### 2. Authentication and Authorization Errors
- **Invalid credentials**: Clear error messages without revealing system details
- **Session expiration**: Automatic redirect to login with session restoration
- **Insufficient permissions**: Role-based error messages with suggested actions
- **Account lockout**: Progressive delays and administrative notification

#### 3. Database and Storage Errors
- **Connection failures**: Automatic retry with exponential backoff
- **Data consistency errors**: Transaction rollback with user notification
- **Storage quota exceeded**: Graceful degradation with cleanup suggestions
- **Concurrent modification**: Optimistic locking with conflict resolution

#### 4. Workflow Execution Errors
- **Block execution failures**: Error logging with workflow pause and notification
- **Dependency resolution errors**: Clear dependency chain visualization
- **Timeout errors**: Configurable timeouts with partial execution recovery
- **Resource unavailability**: Queue management with retry scheduling

#### 5. Integration and External Service Errors
- **Email service failures**: Fallback notification methods
- **File system errors**: Alternative storage with user notification
- **AI service unavailability**: Graceful degradation to manual workflows
- **Calendar integration failures**: Local calendar fallback

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
    suggestions?: string[];
  };
}
```

### Logging and Monitoring
- **Structured logging**: JSON format with correlation IDs
- **Error aggregation**: Centralized error tracking and alerting
- **Performance monitoring**: Response time and resource usage tracking
- **User activity audit**: Comprehensive action logging for compliance

## Testing Strategy

### Dual Testing Approach

The AcademiChain AI Automator employs both unit testing and property-based testing to ensure comprehensive coverage and correctness validation.

#### Unit Testing Requirements
- **Framework**: Jest with React Testing Library for frontend, Jest with Supertest for backend
- **Coverage targets**: Minimum 80% code coverage for critical paths
- **Test categories**:
  - Component rendering and user interaction tests
  - API endpoint functionality and error handling
  - Database operation validation
  - Authentication and authorization flows
  - File upload and processing workflows

#### Property-Based Testing Requirements
- **Framework**: fast-check for JavaScript/TypeScript property-based testing
- **Configuration**: Minimum 100 iterations per property test to ensure statistical confidence
- **Property test tagging**: Each property-based test MUST include a comment with the format: `**Feature: academichain-ai-automator, Property {number}: {property_text}**`
- **Correctness property mapping**: Each correctness property from the design document MUST be implemented by exactly one property-based test

#### Testing Implementation Guidelines
- **Unit tests focus on**: Specific examples, edge cases, integration points between components
- **Property tests focus on**: Universal properties that should hold across all valid inputs
- **Test data generation**: Smart generators that constrain to realistic input spaces
- **Mock usage**: Minimal mocking to test real functionality, mocks only for external services
- **Test isolation**: Each test should be independent and not rely on shared state

#### Specific Testing Areas

**Workflow Engine Testing**:
- Unit tests for individual block types and their configurations
- Property tests for workflow validation, execution, and state management
- Integration tests for complete workflow scenarios

**Academic Module Testing**:
- Unit tests for assignment creation, submission, and grading workflows
- Property tests for semester management and progress tracking
- Integration tests for project approval processes

**User Interface Testing**:
- Unit tests for component rendering and user interactions
- Property tests for role-based access control and data display
- End-to-end tests for complete user journeys

**Data Layer Testing**:
- Unit tests for database operations and data validation
- Property tests for data persistence, backup, and restoration
- Performance tests for concurrent access and large datasets

### Test Environment Setup
- **Development**: Local MongoDB instance with test data seeding
- **CI/CD**: Containerized test environment with isolated databases
- **Staging**: Production-like environment for integration testing
- **Performance**: Load testing environment for scalability validation