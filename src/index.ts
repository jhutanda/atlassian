import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import { AcademicDashboard } from './components/AcademicDashboard';
import { AssignmentPanel } from './components/AssignmentPanel';
import { SemesterManagement } from './components/SemesterManagement';
import { ProjectQueue } from './components/ProjectQueue';
import { JiraService } from './services/jira';
import { ConfluenceService } from './services/confluence';
import { AssignmentAutomationService } from './automation/assignment-automation';

const resolver = new Resolver();

// Main handler for Forge UI components
resolver.define('main', async (req: any) => {
  const context = req.context;
  
  // Route to appropriate component based on module key
  switch (context.moduleKey) {
    case 'academichain-project-page':
      return AcademicDashboard();
    case 'academichain-issue-panel':
      return AssignmentPanel();
    case 'academichain-space-page':
      return SemesterManagement();
    case 'academichain-queue-page':
      return ProjectQueue();
    default:
      return { error: 'Unknown module key' };
  }
});

// Handler for academic configuration
resolver.define('getAcademicConfig', async () => {
  try {
    const config = await storage.get('academicConfig');
    return config || {
      institutionName: '',
      departments: [],
      semesterSchedule: {},
      gradeScale: {}
    };
  } catch (error) {
    console.error('Error fetching academic config:', error);
    return { error: 'Failed to fetch configuration' };
  }
});

resolver.define('setAcademicConfig', async (req: any) => {
  try {
    const { config } = req.payload;
    await storage.set('academicConfig', config);
    return { success: true };
  } catch (error) {
    console.error('Error saving academic config:', error);
    return { error: 'Failed to save configuration' };
  }
});

export const handler = resolver.getDefinitions();

// Service instances
const jiraService = new JiraService();
const confluenceService = new ConfluenceService();
const automationService = new AssignmentAutomationService();

// Dashboard statistics handler
resolver.define('getDashboardStats', async (req: any) => {
  try {
    const config = await storage.get('academicConfig');
    const projectKeys = config?.departments?.map((dept: any) => dept.projectKeys || []).flat() || [];
    
    const stats = await jiraService.getDashboardStats(projectKeys);
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { error: 'Failed to fetch dashboard statistics' };
  }
});

// Assignment data handler
resolver.define('getAssignmentData', async (req: any) => {
  try {
    const { issueKey } = req.payload;
    const assignmentData = await jiraService.getAssignmentData(issueKey);
    return assignmentData;
  } catch (error) {
    console.error('Error fetching assignment data:', error);
    return { error: 'Failed to fetch assignment data' };
  }
});

// Assignment submission handler
resolver.define('submitAssignment', async (req: any) => {
  try {
    const { issueKey, submissionData } = req.payload;
    const success = await jiraService.updateAssignmentSubmission(issueKey, submissionData);
    
    if (success) {
      // Execute submission workflow
      await automationService.executeSubmissionWorkflow(issueKey, submissionData);
      return { success: true };
    } else {
      return { error: 'Failed to submit assignment' };
    }
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return { error: 'Failed to submit assignment' };
  }
});

// Assignment grading handler
resolver.define('gradeAssignment', async (req: any) => {
  try {
    const { issueKey, grade, feedback } = req.payload;
    const success = await jiraService.gradeAssignment(issueKey, grade, feedback);
    
    if (success) {
      return { success: true };
    } else {
      return { error: 'Failed to grade assignment' };
    }
  } catch (error) {
    console.error('Error grading assignment:', error);
    return { error: 'Failed to grade assignment' };
  }
});

// Semester data handler
resolver.define('getSemesterData', async (req: any) => {
  try {
    const config = await storage.get('academicConfig');
    // Mock semester data for now
    return {
      projectKey: 'CS101',
      semesterName: 'Fall 2024',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-12-15'),
      courses: [
        { code: 'CS101', name: 'Introduction to Programming', credits: 3, instructor: 'Dr. Smith' },
        { code: 'CS102', name: 'Data Structures', credits: 4, instructor: 'Dr. Johnson' }
      ],
      assignments: [
        { id: 'CS101-1', title: 'Hello World Program', dueDate: new Date('2024-09-01'), status: 'Active', submissions: 25, totalStudents: 30 },
        { id: 'CS101-2', title: 'Calculator App', dueDate: new Date('2024-09-15'), status: 'Active', submissions: 18, totalStudents: 30 }
      ],
      lectures: [
        { id: 'L1', title: 'Introduction to Programming', date: new Date('2024-08-20'), topic: 'Variables and Data Types', materials: ['slides.pdf', 'examples.zip'] },
        { id: 'L2', title: 'Control Structures', date: new Date('2024-08-22'), topic: 'If-else and Loops', materials: ['slides.pdf'] }
      ]
    };
  } catch (error) {
    console.error('Error fetching semester data:', error);
    return { error: 'Failed to fetch semester data' };
  }
});

// Create assignment handler
resolver.define('createAssignment', async (req: any) => {
  try {
    const assignmentData = req.payload;
    const projectKey = assignmentData.courseCode;
    
    const result = await jiraService.createAssignmentIssue(assignmentData, projectKey);
    
    if (result) {
      // Create corresponding Confluence feedback page
      await confluenceService.createAssignmentFeedbackPage(projectKey, result.key, assignmentData.assignee);
      return { success: true, issueKey: result.key };
    } else {
      return { error: 'Failed to create assignment' };
    }
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { error: 'Failed to create assignment' };
  }
});

// Create lecture handler
resolver.define('createLecture', async (req: any) => {
  try {
    const lectureData = req.payload;
    // This would typically create a Confluence page for the lecture
    return { success: true, message: 'Lecture created successfully' };
  } catch (error) {
    console.error('Error creating lecture:', error);
    return { error: 'Failed to create lecture' };
  }
});

// Project proposals handler
resolver.define('getProjectProposals', async (req: any) => {
  try {
    // Mock project proposals data
    return {
      userRole: 'faculty', // This would be determined from user context
      proposals: [
        {
          id: 'PROJ-1',
          title: 'E-Learning Platform',
          problemStatement: 'Create an online learning platform for remote education',
          proposedTechnology: ['React', 'Node.js', 'MongoDB'],
          teamMembers: [
            { accountId: 'user1', name: 'John Doe', role: 'Team Lead' },
            { accountId: 'user2', name: 'Jane Smith', role: 'Developer' }
          ],
          submissionDate: new Date('2024-08-01'),
          approvalStatus: 'Faculty Review' as const,
          comments: 'Good project idea, needs more technical details'
        },
        {
          id: 'PROJ-2',
          title: 'Mobile Banking App',
          problemStatement: 'Develop a secure mobile banking application',
          proposedTechnology: ['React Native', 'Firebase', 'Node.js'],
          teamMembers: [
            { accountId: 'user3', name: 'Bob Johnson', role: 'Team Lead' },
            { accountId: 'user4', name: 'Alice Brown', role: 'UI/UX Designer' }
          ],
          submissionDate: new Date('2024-07-28'),
          approvalStatus: 'Approved' as const,
          assignedGuide: 'Dr. Wilson'
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching project proposals:', error);
    return { error: 'Failed to fetch project proposals' };
  }
});

// Submit project proposal handler
resolver.define('submitProjectProposal', async (req: any) => {
  try {
    const proposalData = req.payload;
    // This would create a JSM request for the project proposal
    return { success: true, message: 'Project proposal submitted successfully' };
  } catch (error) {
    console.error('Error submitting project proposal:', error);
    return { error: 'Failed to submit project proposal' };
  }
});

// Process proposal approval handler
resolver.define('processProposalApproval', async (req: any) => {
  try {
    const { proposalId, action, comments } = req.payload;
    // This would update the JSM request status and route to next approver
    return { success: true, message: `Proposal ${action}ed successfully` };
  } catch (error) {
    console.error('Error processing proposal approval:', error);
    return { error: 'Failed to process approval' };
  }
});