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
import { ProjectProposalIssue } from '../types/academic';

export const ProjectQueue = () => {
  const [proposals, setProposals] = useState<ProjectProposalIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('student');
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposalIssue | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await invoke('getProjectProposals') as any;
        if (response?.error) {
          setError(response.error);
        } else {
          setProposals(response.proposals || []);
          setUserRole(response.userRole || 'student');
        }
      } catch (err) {
        setError('Failed to load project proposals');
        console.error('Proposals error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleSubmitProposal = async (formData: any) => {
    try {
      const response = await invoke('submitProjectProposal', formData) as any;
      if (response?.error) {
        setError(response.error);
      } else {
        setProposals(response.proposals || []);
      }
    } catch (err) {
      setError('Failed to submit proposal');
      console.error('Submit error:', err);
    }
  };

  const handleApproveProposal = async (proposalId: string) => {
    try {
      const response = await invoke('approveProjectProposal', { proposalId }) as any;
      if (response?.error) {
        setError(response.error);
      } else {
        setProposals(response.proposals || []);
      }
    } catch (err) {
      setError('Failed to approve proposal');
      console.error('Approve error:', err);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Text>Project Proposal Queue</Text>
        <Text>Loading project proposals...</Text>
      </Fragment>
    );
  }

  if (error) {
    return (
      <Fragment>
        <Text>Project Proposal Queue</Text>
        <SectionMessage appearance="error">
          <Text>{error}</Text>
        </SectionMessage>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Text>Project Proposal Queue</Text>
      
      {userRole === 'student' && (
        <Fragment>
          <Text>Submit New Project Proposal</Text>
          <Form onSubmit={handleSubmitProposal} submitButtonText="Submit Proposal">
            <TextField 
              name="title" 
              label="Project Title"
              placeholder="Enter project title" 
            />
            <TextArea 
              name="problemStatement" 
              label="Problem Statement"
              placeholder="Describe the problem your project will solve" 
            />
            <TextField 
              name="proposedTechnology" 
              label="Technology Stack"
              placeholder="e.g., React, Node.js, MongoDB (comma-separated)" 
            />
            <TextArea 
              name="teamMembers" 
              label="Team Members"
              placeholder="List team member names and roles" 
            />
          </Form>
        </Fragment>
      )}

      <Text>Current Proposals ({proposals.length})</Text>
      
      {proposals.map((proposal, index) => (
        <Fragment key={index}>
          <Text>{proposal.summary}</Text>
          <StatusLozenge 
            appearance={proposal.customFields.approvalStatus === 'Approved' ? 'success' : 'inprogress'} 
            text={proposal.customFields.approvalStatus} 
          />
          <Text>Technology: {proposal.customFields.proposedTechnology.join(', ')}</Text>
          
          {userRole === 'faculty' && proposal.customFields.approvalStatus === 'Submitted' && (
            <Button 
              text="Approve Proposal" 
              onClick={() => handleApproveProposal(index.toString())}
            />
          )}
          
          <Button 
            text="View Details" 
            onClick={() => setSelectedProposal(proposal)}
          />
        </Fragment>
      ))}

      {selectedProposal && (
        <Fragment>
          <Text>Proposal Details: {selectedProposal.summary}</Text>
          <Text>{selectedProposal.customFields.problemStatement}</Text>
          <Text>Technology: {selectedProposal.customFields.proposedTechnology.join(', ')}</Text>
          <Text>Team: {selectedProposal.customFields.teamMembers.join(', ')}</Text>
          <Button 
            text="Close Details" 
            onClick={() => setSelectedProposal(null)}
          />
        </Fragment>
      )}
    </Fragment>
  );
};