import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { 
  Fragment,
  Text,
  Button,
  Form,
  FormSection,
  FormField,
  TextField,
  TextArea,
  DatePicker,
  Select,
  Option,
  StatusLozenge,
  SectionMessage
} from '@forge/ui';
import { AssignmentIssue } from '../types/academic';

interface AssignmentPanelProps {
  issueKey: string;
  issueType: string;
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({ issueKey, issueType }) => {
  const [assignment, setAssignment] = useState<AssignmentIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        const response = await invoke('getAssignmentData', { issueKey });
        if (response.error) {
          setError(response.error);
        } else {
          setAssignment(response);
        }
      } catch (err) {
        setError('Failed to load assignment data');
        console.error('Assignment panel error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (issueKey && issueType === 'Assignment') {
      fetchAssignmentData();
    }
  }, [issueKey, issueType]);

  const handleSubmission = async (formData: any) => {
    try {
      setSubmitting(true);
      const response = await invoke('submitAssignment', {
        issueKey,
        submissionData: formData
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh assignment data
        const updatedResponse = await invoke('getAssignmentData', { issueKey });
        setAssignment(updatedResponse);
      }
    } catch (err) {
      setError('Failed to submit assignment');
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrading = async (grade: number, feedback: string) => {
    try {
      setSubmitting(true);
      const response = await invoke('gradeAssignment', {
        issueKey,
        grade,
        feedback
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh assignment data
        const updatedResponse = await invoke('getAssignmentData', { issueKey });
        setAssignment(updatedResponse);
      }
    } catch (err) {
      setError('Failed to grade assignment');
      console.error('Grading error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const render = (context: any) => {
    if (issueType !== 'Assignment') {
      return (
        <Fragment>
          <Text>This panel is only available for Assignment issues.</Text>
        </Fragment>
      );
    }

    if (loading) {
      return (
        <Fragment>
          <Text>Loading assignment details...</Text>
        </Fragment>
      );
    }

    if (error) {
      return (
        <Fragment>
          <SectionMessage appearance="error">
            <Text>{error}</Text>
          </SectionMessage>
        </Fragment>
      );
    }

    if (!assignment) {
      return (
        <Fragment>
          <Text>No assignment data found.</Text>
        </Fragment>
      );
    }

    const isStudent = context.accountId === assignment.assignee;
    const isFaculty = context.accountId === assignment.reporter;
    const canSubmit = isStudent && assignment.customFields.submissionStatus !== 'Submitted' && assignment.customFields.submissionStatus !== 'Graded';
    const canGrade = isFaculty && assignment.customFields.submissionStatus === 'Submitted';

    return (
      <Fragment>
        <Text size="large">Assignment: {assignment.summary}</Text>
        
        <FormSection>
          <FormField label="Course Code">
            <Text>{assignment.customFields.courseCode}</Text>
          </FormField>
          
          <FormField label="Total Marks">
            <Text>{assignment.customFields.totalMarks}</Text>
          </FormField>
          
          <FormField label="Deadline">
            <Text>{new Date(assignment.customFields.deadline).toLocaleDateString()}</Text>
          </FormField>
          
          <FormField label="Status">
            <StatusLozenge 
              appearance={
                assignment.customFields.submissionStatus === 'Graded' ? 'success' :
                assignment.customFields.submissionStatus === 'Submitted' ? 'inprogress' :
                assignment.customFields.submissionStatus === 'In Progress' ? 'new' : 'removed'
              }
              text={assignment.customFields.submissionStatus}
            />
          </FormField>
          
          {assignment.customFields.grade && (
            <FormField label="Grade">
              <Text>{assignment.customFields.grade} / {assignment.customFields.totalMarks}</Text>
            </FormField>
          )}
          
          {assignment.customFields.feedback && (
            <FormField label="Feedback">
              <Text>{assignment.customFields.feedback}</Text>
            </FormField>
          )}
        </FormSection>

        {canSubmit && (
          <Form onSubmit={handleSubmission} submitButtonText="Submit Assignment" isDisabled={submitting}>
            <FormSection>
              <FormField label="Submission Notes" isRequired>
                <TextArea name="submissionNotes" placeholder="Add any notes about your submission..." />
              </FormField>
              
              {assignment.customFields.allowFileUpload && (
                <FormField label="File Upload">
                  <Text>Please attach your files to this Jira issue.</Text>
                </FormField>
              )}
            </FormSection>
          </Form>
        )}

        {canGrade && (
          <Form onSubmit={(formData) => handleGrading(formData.grade, formData.feedback)} 
                submitButtonText="Submit Grade" isDisabled={submitting}>
            <FormSection>
              <FormField label="Grade" isRequired>
                <TextField 
                  name="grade" 
                  type="number" 
                  placeholder={`Enter grade (0-${assignment.customFields.totalMarks})`}
                />
              </FormField>
              
              <FormField label="Feedback">
                <TextArea name="feedback" placeholder="Provide feedback to the student..." />
              </FormField>
            </FormSection>
          </Form>
        )}
      </Fragment>
    );
  };

  return { render };
};