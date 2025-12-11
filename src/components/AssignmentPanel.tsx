import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import {
  Text,
  Button,
  Form,
  TextField,
  TextArea,
  StatusLozenge,
  Fragment,
  SectionMessage
} from '@forge/ui';
import { AssignmentIssue } from '../types/academic';

interface AssignmentPanelProps {
  issueKey: string;
  issueType: string;
}

export const AssignmentPanel = ({ issueKey, issueType }: AssignmentPanelProps) => {
  const [assignment, setAssignment] = useState<AssignmentIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        const response = await invoke('getAssignmentData', { issueKey, issueType }) as any;
        if (response?.error) {
          setError(response.error);
        } else {
          setAssignment(response as AssignmentIssue);
        }
      } catch (err) {
        setError('Failed to load assignment data');
        console.error('Assignment error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [issueKey, issueType]);

  const handleSubmission = async (formData: any) => {
    try {
      setSubmitting(true);
      const response = await invoke('submitAssignment', {
        issueKey,
        submissionData: formData
      }) as any;
      
      if (response?.error) {
        setError(response.error);
      } else {
        setAssignment(response as AssignmentIssue);
      }
    } catch (err) {
      setError('Failed to submit assignment');
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrading = async (formData: any) => {
    try {
      setSubmitting(true);
      const response = await invoke('gradeAssignment', {
        issueKey,
        gradeData: formData
      }) as any;
      
      if (response?.error) {
        setError(response.error);
      } else {
        setAssignment(response as AssignmentIssue);
      }
    } catch (err) {
      setError('Failed to grade assignment');
      console.error('Grading error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Text>Assignment Panel</Text>
        <Text>Loading assignment data...</Text>
      </Fragment>
    );
  }

  if (error) {
    return (
      <Fragment>
        <Text>Assignment Panel</Text>
        <SectionMessage appearance="error">
          <Text>{error}</Text>
        </SectionMessage>
      </Fragment>
    );
  }

  if (!assignment) {
    return (
      <Fragment>
        <Text>Assignment Panel</Text>
        <Text>No assignment data available</Text>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Text>Assignment: {assignment.summary}</Text>
      <StatusLozenge 
        appearance={assignment.customFields.submissionStatus === 'Graded' ? 'success' : 'inprogress'} 
        text={assignment.customFields.submissionStatus} 
      />
      
      {assignment.description ? (
        <Text>{assignment.description}</Text>
      ) : null}

      {assignment.customFields.deadline ? (
        <Text>Due: {new Date(assignment.customFields.deadline).toLocaleDateString()}</Text>
      ) : null}

      {assignment.customFields.submissionStatus !== 'Graded' ? (
        <Form onSubmit={handleSubmission} submitButtonText="Submit Assignment">
          <TextArea 
            name="submissionNotes" 
            label="Submission Notes"
            placeholder="Add any notes about your submission..." 
          />
        </Form>
      ) : null}

      {assignment.customFields.submissionStatus === 'Submitted' ? (
        <Form onSubmit={handleGrading} submitButtonText="Submit Grade">
          <TextField
            name="grade"
            label="Grade"
            type="number"
            placeholder="Enter grade (0-100)"
          />
          <TextArea 
            name="feedback" 
            label="Feedback"
            placeholder="Provide feedback to the student..." 
          />
        </Form>
      ) : null}
    </Fragment>
  );
};