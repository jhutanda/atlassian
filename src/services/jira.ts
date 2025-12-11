import api, { route } from '@forge/api';
import { AssignmentIssue, ProjectProposalIssue, AcademicProject } from '../types/academic';

export class JiraService {
  
  /**
   * Create custom issue types for academic workflows
   */
  async createAcademicIssueTypes(projectKey: string): Promise<void> {
    const issueTypes = [
      {
        name: 'Assignment',
        description: 'Student assignment tracking',
        type: 'standard'
      },
      {
        name: 'Project Proposal',
        description: 'Student project proposal submission',
        type: 'standard'
      },
      {
        name: 'Semester Task',
        description: 'General semester-related tasks',
        type: 'standard'
      }
    ];

    for (const issueType of issueTypes) {
      try {
        const response = await api.asApp().requestJira(route`/rest/api/3/issuetype`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(issueType)
        });

        if (!response.ok) {
          console.error(`Failed to create issue type ${issueType.name}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error creating issue type ${issueType.name}:`, error);
      }
    }
  }

  /**
   * Create custom fields for academic data
   */
  async createAcademicCustomFields(): Promise<void> {
    const customFields = [
      {
        name: 'Course Code',
        description: 'Academic course identifier',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:textfield',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:textsearcher'
      },
      {
        name: 'Total Marks',
        description: 'Maximum marks for assignment',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:float',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:numbersearcher'
      },
      {
        name: 'Submission Status',
        description: 'Current status of assignment submission',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:select',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher'
      },
      {
        name: 'Grade',
        description: 'Assigned grade for submission',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:float',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:numbersearcher'
      },
      {
        name: 'Problem Statement',
        description: 'Project problem statement',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:textarea',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:textsearcher'
      },
      {
        name: 'Proposed Technology',
        description: 'Technologies proposed for project',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher'
      },
      {
        name: 'Team Members',
        description: 'Project team member list',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:textarea',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:textsearcher'
      },
      {
        name: 'Approval Status',
        description: 'Project approval workflow status',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:select',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher'
      }
    ];

    for (const field of customFields) {
      try {
        const response = await api.asApp().requestJira(route`/rest/api/3/field`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(field)
        });

        if (!response.ok) {
          console.error(`Failed to create custom field ${field.name}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error creating custom field ${field.name}:`, error);
      }
    }
  }

  /**
   * Create an assignment issue
   */
  async createAssignmentIssue(assignmentData: Partial<AssignmentIssue>, projectKey: string): Promise<any> {
    const issueData = {
      fields: {
        project: { key: projectKey },
        issuetype: { name: 'Assignment' },
        summary: assignmentData.summary,
        description: assignmentData.description,
        assignee: { accountId: assignmentData.assignee },
        reporter: { accountId: assignmentData.reporter },
        // Custom fields would be added here with their actual field IDs
        // These would need to be mapped from the created custom fields
      }
    };

    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to create assignment issue: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating assignment issue:', error);
      throw error;
    }
  }

  /**
   * Create a project proposal issue
   */
  async createProjectProposalIssue(proposalData: Partial<ProjectProposalIssue>, projectKey: string): Promise<any> {
    const issueData = {
      fields: {
        project: { key: projectKey },
        issuetype: { name: 'Project Proposal' },
        summary: proposalData.summary,
        description: proposalData.description,
        // Custom fields would be added here with their actual field IDs
      }
    };

    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to create project proposal issue: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating project proposal issue:', error);
      throw error;
    }
  }

  /**
   * Get assignment data from Jira issue
   */
  async getAssignmentData(issueKey: string): Promise<AssignmentIssue | null> {
    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const issue = await response.json();
        
        // Map Jira issue to AssignmentIssue type
        // This would need to be updated with actual custom field IDs
        return {
          issueType: 'Assignment',
          summary: issue.fields.summary,
          description: issue.fields.description,
          assignee: issue.fields.assignee?.accountId,
          reporter: issue.fields.reporter?.accountId,
          customFields: {
            deadline: new Date(issue.fields.duedate || Date.now()),
            totalMarks: issue.fields.customfield_10001 || 0,
            courseCode: issue.fields.customfield_10002 || '',
            allowFileUpload: true,
            submissionStatus: issue.fields.customfield_10003 || 'Not Started',
            grade: issue.fields.customfield_10004,
            feedback: issue.fields.customfield_10005
          }
        };
      } else {
        console.error('Failed to fetch assignment data:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      return null;
    }
  }

  /**
   * Update assignment submission status
   */
  async updateAssignmentSubmission(issueKey: string, submissionData: any): Promise<boolean> {
    try {
      const updateData = {
        fields: {
          // Update custom field for submission status
          customfield_10003: 'Submitted'
        }
      };

      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating assignment submission:', error);
      return false;
    }
  }

  /**
   * Grade an assignment
   */
  async gradeAssignment(issueKey: string, grade: number, feedback: string): Promise<boolean> {
    try {
      const updateData = {
        fields: {
          // Update custom fields for grade and feedback
          customfield_10003: 'Graded',
          customfield_10004: grade,
          customfield_10005: feedback
        }
      };

      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error grading assignment:', error);
      return false;
    }
  }

  /**
   * Create academic project with proper configuration
   */
  async createAcademicProject(projectData: AcademicProject): Promise<any> {
    const project = {
      key: projectData.key,
      name: projectData.name,
      projectTypeKey: 'software',
      projectTemplateKey: 'com.pyxis.greenhopper.jira:gh-simplified-agility-kanban',
      description: projectData.description,
      lead: projectData.lead,
      assigneeType: 'PROJECT_LEAD'
    };

    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/project`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      });

      if (response.ok) {
        const createdProject = await response.json();
        
        // After project creation, set up academic issue types and custom fields
        await this.createAcademicIssueTypes(projectData.key);
        
        return createdProject;
      } else {
        throw new Error(`Failed to create academic project: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating academic project:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(projectKeys: string[]): Promise<any> {
    try {
      const stats = {
        totalAssignments: 0,
        pendingSubmissions: 0,
        gradedAssignments: 0,
        activeProjects: projectKeys.length,
        pendingApprovals: 0
      };

      // Query for assignment statistics across projects
      for (const projectKey of projectKeys) {
        const jql = `project = ${projectKey} AND issuetype = "Assignment"`;
        const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${encodeURIComponent(jql)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const searchResult = await response.json();
          stats.totalAssignments += searchResult.total;
          
          // Count submissions by status
          for (const issue of searchResult.issues) {
            const submissionStatus = issue.fields.customfield_10003;
            if (submissionStatus === 'Submitted') {
              stats.pendingSubmissions++;
            } else if (submissionStatus === 'Graded') {
              stats.gradedAssignments++;
            }
          }
        }
      }

      // Query for project proposal approvals
      const approvalJql = `issuetype = "Project Proposal" AND "Approval Status" IN ("Submitted", "Faculty Review", "HOD Approval")`;
      const approvalResponse = await api.asApp().requestJira(route`/rest/api/3/search?jql=${encodeURIComponent(approvalJql)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (approvalResponse.ok) {
        const approvalResult = await approvalResponse.json();
        stats.pendingApprovals = approvalResult.total;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalAssignments: 0,
        pendingSubmissions: 0,
        gradedAssignments: 0,
        activeProjects: 0,
        pendingApprovals: 0
      };
    }
  }
}