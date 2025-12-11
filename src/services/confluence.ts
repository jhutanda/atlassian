import api, { route } from '@forge/api';
import { AcademicPageTemplate, SemesterConfiguration } from '../types/academic';

export class ConfluenceService {

  /**
   * Create semester space with academic templates
   */
  async createSemesterSpace(semesterConfig: SemesterConfiguration): Promise<any> {
    const spaceData = {
      key: semesterConfig.projectKey,
      name: `${semesterConfig.semesterName} - ${semesterConfig.projectKey}`,
      description: `Academic space for ${semesterConfig.semesterName}`,
      type: 'global'
    };

    try {
      // Create the space
      const spaceResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/space`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(spaceData)
      });

      if (!spaceResponse.ok) {
        throw new Error(`Failed to create semester space: ${await spaceResponse.text()}`);
      }

      const space = await spaceResponse.json();

      // Create academic page templates
      await this.createAcademicPageTemplates(space.key);

      // Create initial pages
      await this.createInitialPages(space.key, semesterConfig);

      return space;
    } catch (error) {
      console.error('Error creating semester space:', error);
      throw error;
    }
  }

  /**
   * Create academic page templates
   */
  async createAcademicPageTemplates(spaceKey: string): Promise<void> {
    const templates: AcademicPageTemplate[] = [
      {
        templateKey: 'syllabus-template',
        name: 'Course Syllabus',
        description: 'Template for course syllabus and curriculum',
        content: `
# Course Syllabus

## Course Information
- **Course Code**: {{courseCode}}
- **Course Title**: {{courseTitle}}
- **Credits**: {{credits}}
- **Semester**: {{semester}}
- **Academic Year**: {{academicYear}}

## Instructor Information
- **Name**: {{instructorName}}
- **Email**: {{instructorEmail}}
- **Office Hours**: {{officeHours}}

## Course Description
{{courseDescription}}

## Learning Objectives
{{learningObjectives}}

## Course Schedule
| Week | Topic | Assignments |
|------|-------|-------------|
{{#each schedule}}
| {{week}} | {{topic}} | {{assignments}} |
{{/each}}

## Grading Policy
{{gradingPolicy}}

## Resources
{{resources}}
        `,
        variables: [
          { name: 'courseCode', type: 'string', required: true },
          { name: 'courseTitle', type: 'string', required: true },
          { name: 'credits', type: 'number', required: true },
          { name: 'semester', type: 'string', required: true },
          { name: 'academicYear', type: 'string', required: true },
          { name: 'instructorName', type: 'string', required: true },
          { name: 'instructorEmail', type: 'string', required: true },
          { name: 'officeHours', type: 'string', required: false },
          { name: 'courseDescription', type: 'string', required: true },
          { name: 'learningObjectives', type: 'string', required: true },
          { name: 'gradingPolicy', type: 'string', required: true },
          { name: 'resources', type: 'string', required: false }
        ]
      },
      {
        templateKey: 'assignment-template',
        name: 'Assignment Page',
        description: 'Template for assignment descriptions and requirements',
        content: `
# Assignment: {{assignmentTitle}}

## Overview
{{assignmentOverview}}

## Objectives
{{objectives}}

## Requirements
{{requirements}}

## Submission Guidelines
- **Due Date**: {{dueDate}}
- **Submission Format**: {{submissionFormat}}
- **File Types Accepted**: {{fileTypes}}
- **Maximum File Size**: {{maxFileSize}}

## Grading Criteria
{{gradingCriteria}}

## Resources
{{resources}}

## FAQ
{{faq}}
        `,
        variables: [
          { name: 'assignmentTitle', type: 'string', required: true },
          { name: 'assignmentOverview', type: 'string', required: true },
          { name: 'objectives', type: 'string', required: true },
          { name: 'requirements', type: 'string', required: true },
          { name: 'dueDate', type: 'date', required: true },
          { name: 'submissionFormat', type: 'string', required: true },
          { name: 'fileTypes', type: 'string', required: false },
          { name: 'maxFileSize', type: 'string', required: false },
          { name: 'gradingCriteria', type: 'string', required: true },
          { name: 'resources', type: 'string', required: false },
          { name: 'faq', type: 'string', required: false }
        ]
      },
      {
        templateKey: 'lecture-template',
        name: 'Lecture Notes',
        description: 'Template for lecture notes and materials',
        content: `
# Lecture {{lectureNumber}}: {{lectureTitle}}

## Date
{{lectureDate}}

## Learning Objectives
{{learningObjectives}}

## Agenda
{{agenda}}

## Key Concepts
{{keyConcepts}}

## Examples
{{examples}}

## Assignments
{{assignments}}

## Next Lecture
{{nextLecture}}

## Additional Resources
{{additionalResources}}
        `,
        variables: [
          { name: 'lectureNumber', type: 'number', required: true },
          { name: 'lectureTitle', type: 'string', required: true },
          { name: 'lectureDate', type: 'date', required: true },
          { name: 'learningObjectives', type: 'string', required: true },
          { name: 'agenda', type: 'string', required: true },
          { name: 'keyConcepts', type: 'string', required: true },
          { name: 'examples', type: 'string', required: false },
          { name: 'assignments', type: 'string', required: false },
          { name: 'nextLecture', type: 'string', required: false },
          { name: 'additionalResources', type: 'string', required: false }
        ]
      }
    ];

    for (const template of templates) {
      try {
        const templateResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/template`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            templateType: 'page',
            body: {
              storage: {
                value: template.content,
                representation: 'storage'
              }
            },
            space: {
              key: spaceKey
            }
          })
        });

        if (!templateResponse.ok) {
          console.error(`Failed to create template ${template.name}:`, await templateResponse.text());
        }
      } catch (error) {
        console.error(`Error creating template ${template.name}:`, error);
      }
    }
  }

  /**
   * Create initial pages for semester space
   */
  async createInitialPages(spaceKey: string, semesterConfig: SemesterConfiguration): Promise<void> {
    const pages = [
      {
        title: 'Course Overview',
        content: `
<h1>Welcome to ${semesterConfig.semesterName}</h1>
<p>This space contains all course materials, assignments, and resources for the semester.</p>

<h2>Quick Links</h2>
<ul>
  <li><a href="/wiki/spaces/${spaceKey}/pages/syllabus">Course Syllabus</a></li>
  <li><a href="/wiki/spaces/${spaceKey}/pages/assignments">Assignments</a></li>
  <li><a href="/wiki/spaces/${spaceKey}/pages/lectures">Lecture Notes</a></li>
  <li><a href="/wiki/spaces/${spaceKey}/pages/resources">Resources</a></li>
</ul>

<h2>Important Dates</h2>
<p><strong>Semester Start:</strong> ${semesterConfig.startDate.toLocaleDateString()}</p>
<p><strong>Semester End:</strong> ${semesterConfig.endDate.toLocaleDateString()}</p>
        `
      },
      {
        title: 'Assignments',
        content: `
<h1>Course Assignments</h1>
<p>This page contains all assignments for the semester.</p>

<h2>Assignment List</h2>
<p>Assignments will be added here as they are created.</p>

<h2>Submission Guidelines</h2>
<ul>
  <li>All assignments must be submitted through Jira</li>
  <li>Late submissions may result in grade penalties</li>
  <li>Contact instructor for extensions</li>
</ul>
        `
      },
      {
        title: 'Lecture Notes',
        content: `
<h1>Lecture Notes</h1>
<p>This page contains lecture notes and materials for each class session.</p>

<h2>Lecture Schedule</h2>
<p>Lecture notes will be posted here after each class.</p>
        `
      },
      {
        title: 'Resources',
        content: `
<h1>Course Resources</h1>
<p>This page contains additional resources, references, and materials for the course.</p>

<h2>Textbooks</h2>
<p>Required and recommended textbooks will be listed here.</p>

<h2>Online Resources</h2>
<p>Useful websites, tutorials, and online materials.</p>

<h2>Software and Tools</h2>
<p>Required software and development tools for the course.</p>
        `
      }
    ];

    for (const page of pages) {
      try {
        const pageResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'page',
            title: page.title,
            space: {
              key: spaceKey
            },
            body: {
              storage: {
                value: page.content,
                representation: 'storage'
              }
            }
          })
        });

        if (!pageResponse.ok) {
          console.error(`Failed to create page ${page.title}:`, await pageResponse.text());
        }
      } catch (error) {
        console.error(`Error creating page ${page.title}:`, error);
      }
    }
  }

  /**
   * Create assignment feedback page
   */
  async createAssignmentFeedbackPage(spaceKey: string, assignmentId: string, studentId: string): Promise<any> {
    const pageData = {
      type: 'page',
      title: `Assignment Feedback - ${assignmentId}`,
      space: {
        key: spaceKey
      },
      body: {
        storage: {
          value: `
<h1>Assignment Feedback</h1>

<h2>Assignment Details</h2>
<p><strong>Assignment ID:</strong> ${assignmentId}</p>
<p><strong>Student:</strong> ${studentId}</p>
<p><strong>Submission Date:</strong> <time datetime="{{submissionDate}}">{{submissionDate}}</time></p>

<h2>Grade</h2>
<p><strong>Score:</strong> <span id="grade-score">Pending</span></p>
<p><strong>Total Points:</strong> <span id="total-points">{{totalPoints}}</span></p>

<h2>Feedback</h2>
<div id="feedback-content">
  <p>Feedback will be provided here once grading is complete.</p>
</div>

<h2>Rubric</h2>
<table>
  <thead>
    <tr>
      <th>Criteria</th>
      <th>Points</th>
      <th>Comments</th>
    </tr>
  </thead>
  <tbody id="rubric-content">
    <tr>
      <td colspan="3">Rubric details will be added during grading.</td>
    </tr>
  </tbody>
</table>

<h2>Submission Files</h2>
<div id="submission-files">
  <p>Submitted files will be linked here.</p>
</div>
          `,
          representation: 'storage'
        }
      }
    };

    try {
      const response = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to create feedback page: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error creating assignment feedback page:', error);
      throw error;
    }
  }

  /**
   * Update assignment feedback page with grade and comments
   */
  async updateAssignmentFeedback(pageId: string, grade: number, totalPoints: number, feedback: string): Promise<boolean> {
    try {
      // First, get the current page content
      const getResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/content/${pageId}?expand=body.storage,version`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!getResponse.ok) {
        throw new Error(`Failed to get page content: ${await getResponse.text()}`);
      }

      const page = await getResponse.json();
      let content = page.body.storage.value;

      // Update the content with grade and feedback
      content = content.replace('<span id="grade-score">Pending</span>', `<span id="grade-score">${grade}</span>`);
      content = content.replace('<span id="total-points">{{totalPoints}}</span>', `<span id="total-points">${totalPoints}</span>`);
      content = content.replace(
        '<div id="feedback-content">\n  <p>Feedback will be provided here once grading is complete.</p>\n</div>',
        `<div id="feedback-content">\n  <p>${feedback}</p>\n</div>`
      );

      // Update the page
      const updateResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/content/${pageId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: pageId,
          type: 'page',
          title: page.title,
          space: page.space,
          body: {
            storage: {
              value: content,
              representation: 'storage'
            }
          },
          version: {
            number: page.version.number + 1
          }
        })
      });

      return updateResponse.ok;
    } catch (error) {
      console.error('Error updating assignment feedback:', error);
      return false;
    }
  }

  /**
   * Create attendance tracking macro
   */
  async createAttendanceMacro(): Promise<string> {
    return `
<ac:structured-macro ac:name="attendance-tracker" ac:schema-version="1">
  <ac:parameter ac:name="courseCode">{{courseCode}}</ac:parameter>
  <ac:parameter ac:name="sessionDate">{{sessionDate}}</ac:parameter>
  <ac:parameter ac:name="sessionType">{{sessionType}}</ac:parameter>
  <ac:rich-text-body>
    <table>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Time In</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {{#each students}}
        <tr>
          <td>{{studentId}}</td>
          <td>{{name}}</td>
          <td>
            <select name="attendance-{{studentId}}">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </td>
          <td><input type="time" name="timeIn-{{studentId}}" /></td>
          <td><input type="text" name="notes-{{studentId}}" placeholder="Optional notes" /></td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    <button type="button" onclick="saveAttendance()">Save Attendance</button>
  </ac:rich-text-body>
</ac:structured-macro>
    `;
  }
}