import * as fc from 'fast-check';
import { AssignmentAutomationService, AutomationRule } from '../../automation/assignment-automation';

describe('Automation Property Tests', () => {
  let automationService: AssignmentAutomationService;

  beforeEach(() => {
    automationService = new AssignmentAutomationService();
    jest.clearAllMocks();
  });

  /**
   * **Feature: academichain-ai-automator, Property 2: Workflow automation rule creation**
   * For any assignment workflow configuration, the app should create corresponding Jira automation rules for status transitions and notifications
   */
  test('Property 2: Workflow automation rule creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[A-Z]{2,10}$/),
        async (projectKey) => {
          // Mock successful API response
          const mockRequestJira = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              id: '12345',
              name: 'Assignment Submission Notification',
              enabled: true
            })
          });

          const mockApi = require('@forge/api');
          mockApi.api = { asApp: () => ({ requestJira: mockRequestJira }) };

          // Execute the function
          const rule = await automationService.createAssignmentSubmissionRule(projectKey);

          // Verify automation rule structure
          expect(rule).toBeDefined();
          expect(rule.name).toBe('Assignment Submission Notification');
          expect(rule.trigger.type).toBe('issue.transitioned');
          expect(rule.trigger.configuration.toStatus).toBe('Submitted');
          expect(rule.trigger.configuration.issueType).toBe('Assignment');

          // Verify conditions include project filter
          expect(rule.conditions).toContainEqual(
            expect.objectContaining({
              type: 'issue.field.equals',
              configuration: expect.objectContaining({
                field: 'project',
                value: projectKey
              })
            })
          );

          // Verify actions include notification and transition
          expect(rule.actions).toContainEqual(
            expect.objectContaining({
              type: 'send.notification',
              configuration: expect.objectContaining({
                recipients: ['reporter']
              })
            })
          );

          expect(rule.actions).toContainEqual(
            expect.objectContaining({
              type: 'transition.issue',
              configuration: expect.objectContaining({
                toStatus: 'Under Review'
              })
            })
          );

          // Verify API was called correctly
          expect(mockRequestJira).toHaveBeenCalledWith(
            '/rest/api/3/automation/rule',
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: expect.stringContaining(projectKey)
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: academichain-ai-automator, Property 6: Assignment submission workflow triggering**
   * For any student work submission, the Jira integration should transition the assignment issue to submitted status and notify the teacher
   */
  test('Property 6: Assignment submission workflow triggering', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[A-Z]{2,10}-\d+$/),
        fc.record({
          submissionNotes: fc.string({ minLength: 10, maxLength: 500 })
        }),
        async (issueKey, submissionData) => {
          // Mock successful API responses
          const mockRequestJira = jest.fn()
            .mockResolvedValueOnce({ ok: true }) // Transition response
            .mockResolvedValueOnce({ ok: true }); // Comment response

          const mockApi = require('@forge/api');
          mockApi.api = { asApp: () => ({ requestJira: mockRequestJira }) };

          // Execute the function
          const result = await automationService.executeSubmissionWorkflow(issueKey, submissionData);

          // Verify the workflow executed successfully
          expect(result).toBe(true);

          // Verify issue transition was called
          expect(mockRequestJira).toHaveBeenCalledWith(
            `/rest/api/3/issue/${issueKey}/transitions`,
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining('"id":"submit"')
            })
          );

          // Verify comment was added
          expect(mockRequestJira).toHaveBeenCalledWith(
            `/rest/api/3/issue/${issueKey}/comment`,
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining(submissionData.submissionNotes)
            })
          );

          // Verify both API calls were made
          expect(mockRequestJira).toHaveBeenCalledTimes(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: academichain-ai-automator, Property 3: Academic process execution consistency**
   * For any triggered academic process, the workflow automation should execute within Jira using native automation capabilities
   */
  test('Property 3: Academic process execution consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[A-Z]{2,10}$/),
        fc.constantFrom('assignment_submission', 'deadline_reminder', 'grading_workflow'),
        async (projectKey, processType) => {
          // Mock successful API response
          const mockRequestJira = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              id: '12345',
              enabled: true,
              state: 'ENABLED'
            })
          });

          const mockApi = require('@forge/api');
          mockApi.api = { asApp: () => ({ requestJira: mockRequestJira }) };

          let rule: AutomationRule;

          // Execute different academic processes
          switch (processType) {
            case 'assignment_submission':
              rule = await automationService.createAssignmentSubmissionRule(projectKey);
              break;
            case 'deadline_reminder':
              rule = await automationService.createDeadlineReminderRule(projectKey);
              break;
            case 'grading_workflow':
              rule = await automationService.createGradingWorkflowRule(projectKey);
              break;
            default:
              throw new Error('Unknown process type');
          }

          // Verify rule was created with consistent structure
          expect(rule).toBeDefined();
          expect(rule.name).toBeDefined();
          expect(rule.trigger).toBeDefined();
          expect(rule.trigger.type).toBeDefined();
          expect(rule.conditions).toBeDefined();
          expect(rule.actions).toBeDefined();

          // Verify all rules include project-specific conditions
          expect(rule.conditions).toContainEqual(
            expect.objectContaining({
              type: 'issue.field.equals',
              configuration: expect.objectContaining({
                field: 'project',
                value: projectKey
              })
            })
          );

          // Verify API was called with proper automation endpoint
          expect(mockRequestJira).toHaveBeenCalledWith(
            '/rest/api/3/automation/rule',
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              })
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});