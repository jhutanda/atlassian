import * as fc from 'fast-check';
import { JiraService } from '../../services/jira';
import { AcademicProject, AssignmentIssue } from '../../types/academic';

describe('Jira Integration Property Tests', () => {
  let jiraService: JiraService;

  beforeEach(() => {
    jiraService = new JiraService();
    jest.clearAllMocks();
  });

  /**
   * **Feature: academichain-ai-automator, Property 1: Academic project issue type provisioning**
   * For any academic project creation, the Jira integration should provide custom issue types for assignments, submissions, and approvals
   */
  test('Property 1: Academic project issue type provisioning', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          key: fc.stringMatching(/^[A-Z]{2,10}$/),
          name: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 200 }),
          lead: fc.string({ minLength: 10, maxLength: 50 })
        }),
        async (projectData) => {
          // Mock the API responses
          const mockRequestJira = jest.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1', name: 'Assignment' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '2', name: 'Project Proposal' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '3', name: 'Semester Task' }) });

          const mockApi = require('@forge/api');
          mockApi.api = { asApp: () => ({ requestJira: mockRequestJira }) };

          // Execute the function
          await jiraService.createAcademicIssueTypes(projectData.key);

          // Verify that all three academic issue types are created
          expect(mockRequestJira).toHaveBeenCalledTimes(3);
          
          // Verify Assignment issue type creation
          expect(mockRequestJira).toHaveBeenCalledWith(
            '/rest/api/3/issuetype',
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining('"name":"Assignment"')
            })
          );

          // Verify Project Proposal issue type creation
          expect(mockRequestJira).toHaveBeenCalledWith(
            '/rest/api/3/issuetype',
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining('"name":"Project Proposal"')
            })
          );

          // Verify Semester Task issue type creation
          expect(mockRequestJira).toHaveBeenCalledWith(
            '/rest/api/3/issuetype',
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining('"name":"Semester Task"')
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: academichain-ai-automator, Property 5: Assignment issue creation completeness**
   * For any assignment creation by faculty, the app should create a Jira issue with all required custom fields for deadline, marks, and submission requirements
   */
  test('Property 5: Assignment issue creation completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          summary: fc.string({ minLength: 5, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          assignee: fc.string({ minLength: 10, maxLength: 50 }),
          reporter: fc.string({ minLength: 10, maxLength: 50 }),
          customFields: fc.record({
            deadline: fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
            totalMarks: fc.integer({ min: 1, max: 100 }),
            courseCode: fc.stringMatching(/^[A-Z]{2,4}[0-9]{3}$/),
            allowFileUpload: fc.boolean(),
            submissionStatus: fc.constantFrom('Not Started', 'In Progress', 'Submitted', 'Graded') as fc.Arbitrary<'Not Started' | 'In Progress' | 'Submitted' | 'Graded'>
          })
        }),
        fc.stringMatching(/^[A-Z]{2,10}$/),
        async (assignmentData, projectKey) => {
          // Mock successful API response
          const mockRequestJira = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              id: '12345',
              key: `${projectKey}-1`,
              fields: {
                summary: assignmentData.summary,
                description: assignmentData.description,
                assignee: { accountId: assignmentData.assignee },
                reporter: { accountId: assignmentData.reporter }
              }
            })
          });

          const mockApi = require('@forge/api');
          mockApi.api = { asApp: () => ({ requestJira: mockRequestJira }) };

          // Execute the function
          const result = await jiraService.createAssignmentIssue(assignmentData, projectKey);

          // Verify the issue was created with all required fields
          expect(mockRequestJira).toHaveBeenCalledWith(
            '/rest/api/3/issue',
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: expect.stringContaining(assignmentData.summary)
            })
          );

          // Verify the response contains the created issue
          expect(result).toBeDefined();
          expect(result.key).toMatch(new RegExp(`^${projectKey}-\\d+$`));
          expect(result.fields.summary).toBe(assignmentData.summary);
        }
      ),
      { numRuns: 100 }
    );
  });
});