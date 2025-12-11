// Core academic data types for AcademiChain AI Automator

export interface AtlassianUser {
  accountId: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  groups: string[];
}

export interface AcademicUserProfile {
  accountId: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  studentId?: string;
  employeeId?: string;
  courses: string[];
}

export interface AssignmentIssue {
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
  assignee: string;
  reporter: string;
}

export interface ProjectProposalIssue {
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

export interface AcademicProject {
  key: string;
  name: string;
  projectTypeKey: 'academic_course';
  lead: string;
  description: string;
  customFields: {
    courseCode: string;
    semester: string;
    academicYear: string;
    department: string;
  };
}

export interface SemesterConfiguration {
  projectKey: string;
  semesterName: string;
  startDate: Date;
  endDate: Date;
  issueTypes: ['Assignment', 'Lab Task', 'Exam', 'Project'];
  workflows: WorkflowScheme[];
}

export interface WorkflowScheme {
  id: string;
  name: string;
  description: string;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
}

export interface WorkflowStatus {
  id: string;
  name: string;
  category: 'new' | 'indeterminate' | 'done';
}

export interface WorkflowTransition {
  id: string;
  name: string;
  from: string;
  to: string;
  conditions?: string[];
  actions?: string[];
}

export interface AcademicPageTemplate {
  templateKey: string;
  name: string;
  description: string;
  content: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: any;
}

export interface ProjectProposalRequest {
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

export interface TeamMember {
  accountId: string;
  name: string;
  role: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ApprovalWorkflow {
  stages: ApprovalStage[];
}

export interface ApprovalStage {
  name: string;
  approvers?: string[];
  automated?: boolean;
}

export interface ForgeStorageData {
  academicConfig: {
    institutionName: string;
    departments: Department[];
    semesterSchedule: SemesterSchedule;
    gradeScale: GradeScale;
  };
  workflowTemplates: WorkflowTemplate[];
  aiSuggestions: AISuggestion[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
}

export interface SemesterSchedule {
  currentSemester: string;
  semesters: SemesterInfo[];
}

export interface SemesterInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  courses: string[];
}

export interface GradeScale {
  scale: 'percentage' | 'gpa' | 'letter';
  ranges: GradeRange[];
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
  points?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'assignment' | 'project' | 'semester';
  jiraAutomationRules: AutomationRuleConfig[];
  confluenceTemplates: PageTemplateConfig[];
  jsmRequestTypes: RequestTypeConfig[];
}

export interface AutomationRuleConfig {
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
}

export interface PageTemplateConfig {
  name: string;
  content: string;
  labels: string[];
}

export interface RequestTypeConfig {
  name: string;
  description: string;
  fields: RequestField[];
}

export interface RequestField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'workflow' | 'template' | 'automation';
  title: string;
  description: string;
  confidence: number;
  context: any;
}