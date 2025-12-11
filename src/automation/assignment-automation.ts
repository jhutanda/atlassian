import api, { route } from '@forge/api';

export interface AutomationRule {
  name: string;
  trigger: {
    type: string;
    configuration: any;
  };
  conditions: Array<{
    type: string;
    configuration: any;
  }>;
  actions: Array<{
    type: string;
    configuration: any;
  }>;
}

export class AssignmentAutomationService {
  
  /**
   * Create automation rule for assignment submission workflow
   */
  async createAssignmentSubmissionRule(projectKey: string): Promise<AutomationRule> {
    const rule: AutomationRule = {
      name: 'Assignment Submission Notification',
      trigger: {
        type: 'issue.transitioned',
        configuration: {
          toStatus: 'Submitted',
          issueType: 'Assignment'
        }
      },
      conditions: [
        {
          type: 'issue.field.equals',
          configuration: {
            field: 'project',
            value: projectKey
          }
        }
      ],
      actions: [
        {
          type: 'send.notification',
          configuration: {
            recipients: ['reporter'],
            subject: 'Assignment Submitted: {{issue.summary}}',
            body: 'Student {{issue.assignee.displayName}} has submitted assignment {{issue.summary}}. Please review and provide feedback.'
          }
        },
        {
          type: 'transition.issue',
          configuration: {
            toStatus: 'Under Review'
          }
        }
      ]
    };

    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/automation/rule`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rule)
      });

      if (response.ok) {
        return rule;
      } else {
        throw new Error(`Failed to create automation rule: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating assignment submission rule:', error);
      throw error;
    }
  }

  /**
   * Create automation rule for assignment deadline reminders
   */
  async createDeadlineReminderRule(projectKey: string): Promise<AutomationRule> {
    const rule: AutomationRule = {
      name: 'Assignment Deadline Reminder',
      trigger: {
        type: 'scheduled',
        configuration: {
          schedule: 'daily',
          time: '09:00'
        }
      },
      conditions: [
        {
          type: 'issue.field.equals',
          configuration: {
            field: 'project',
            value: projectKey
          }
        },
        {
          type: 'issue.field.equals',
          configuration: {
            field: 'issuetype',
            value: 'Assignment'
          }
        },
        {
          type: 'issue.field.not.equals',
          configuration: {
            field: 'status',
            value: 'Submitted'
          }
        },
        {
          type: 'date.comparison',
          configuration: {
            field: 'duedate',
            operator: 'within',
            value: '2d'
          }
        }
      ],
      actions: [
        {
          type: 'send.notification',
          configuration: {
            recipients: ['assignee'],
            subject: 'Assignment Deadline Approaching: {{issue.summary}}',
            body: 'Reminder: Your assignment {{issue.summary}} is due on {{issue.duedate}}. Please submit before the deadline.'
          }
        }
      ]
    };

    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/automation/rule`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rule)
      });

      if (response.ok) {
        return rule;
      } else {
        throw new Error(`Failed to create deadline reminder rule: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating deadline reminder rule:', error);
      throw error;
    }
  }

  /**
   * Create automation rule for grading workflow
   */
  async createGradingWorkflowRule(projectKey: string): Promise<AutomationRule> {
    const rule: AutomationRule = {
      name: 'Assignment Grading Notification',
      trigger: {
        type: 'issue.updated',
        configuration: {
          fields: ['customfield_grade', 'customfield_feedback']
        }
      },
      conditions: [
        {
          type: 'issue.field.equals',
          configuration: {
            field: 'project',
            value: projectKey
          }
        },
        {
          type: 'issue.field.equals',
          configuration: {
            field: 'issuetype',
            value: 'Assignment'
          }
        },
        {
          type: 'issue.field.not.empty',
          configuration: {
            field: 'customfield_grade'
          }
        }
      ],
      actions: [
        {
          type: 'transition.issue',
          configuration: {
            toStatus: 'Graded'
          }
        },
        {
          type: 'send.notification',
          configuration: {
            recipients: ['assignee'],
            subject: 'Assignment Graded: {{issue.summary}}',
            body: 'Your assignment {{issue.summary}} has been graded. Grade: {{issue.customfield_grade}}. Feedback: {{issue.customfield_feedback}}'
          }
        }
      ]
    };

    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/automation/rule`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rule)
      });

      if (response.ok) {
        return rule;
      } else {
        throw new Error(`Failed to create grading workflow rule: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating grading workflow rule:', error);
      throw error;
    }
  }

  /**
   * Execute assignment submission workflow
   */
  async executeSubmissionWorkflow(issueKey: string, submissionData: any): Promise<boolean> {
    try {
      // Update the issue status to Submitted
      const updateResponse = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/transitions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transition: {
            id: 'submit'
          },
          fields: {
            customfield_submission_notes: submissionData.submissionNotes
          }
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to transition issue:', await updateResponse.text());
        return false;
      }

      // Add comment with submission details
      const commentResponse = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: `Assignment submitted with notes: ${submissionData.submissionNotes}`
        })
      });

      return commentResponse.ok;
    } catch (error) {
      console.error('Error executing submission workflow:', error);
      return false;
    }
  }

  /**
   * Get automation rule execution logs
   */
  async getAutomationLogs(projectKey: string, ruleId: string): Promise<any[]> {
    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/automation/rule/${ruleId}/executions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const logs = await response.json();
        return logs.values || [];
      } else {
        console.error('Failed to fetch automation logs:', await response.text());
        return [];
      }
    } catch (error) {
      console.error('Error fetching automation logs:', error);
      return [];
    }
  }
}