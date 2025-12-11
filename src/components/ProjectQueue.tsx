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
  Select,
  Option,
  Table,
  Head,
  Row,
  Cell,
  StatusLozenge,
  SectionMessage,
  Tag
} from '@forge/ui';

interface ProjectProposal {
  id: string;
  title: string;
  problemStatement: string;
  proposedTechnology: string[];
  teamMembers: TeamMember[];
  submissionDate: Date;
  approvalStatus: 'Submitted' | 'Faculty Review' | 'HOD Approval' | 'Approved' | 'Rejected';
  assignedGuide?: string;
  comments?: string;
}

interface TeamMember {
  accountId: string;
  name: string;
  role: string;
}

export const ProjectQueue: React.FC = () => {
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposal | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await invoke('getProjectProposals');
        if (response.error) {
          setError(response.error);
        } else {
          setProposals(response.proposals);
          setUserRole(response.userRole);
        }
      } catch (err) {
        setError('Failed to load project proposals');
        console.error('Project queue error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleSubmitProposal = async (formData: any) => {
    try {
      const response = await invoke('submitProjectProposal', formData);
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh proposals
        const updatedResponse = await invoke('getProjectProposals');
        setProposals(updatedResponse.proposals);
      }
    } catch (err) {
      setError('Failed to submit project proposal');
      console.error('Proposal submission error:', err);
    }
  };

  const handleApprovalAction = async (proposalId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      const response = await invoke('processProposalApproval', {
        proposalId,
        action,
        comments
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh proposals
        const updatedResponse = await invoke('getProjectProposals');
        setProposals(updatedResponse.proposals);
        setSelectedProposal(null);
      }
    } catch (err) {
      setError('Failed to process approval');
      console.error('Approval processing error:', err);
    }
  };

  const getStatusAppearance = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'removed';
      case 'Faculty Review': return 'inprogress';
      case 'HOD Approval': return 'new';
      case 'Submitted': return 'default';
      default: return 'default';
    }
  };

  const render = (context: any) => {
    if (loading) {
      return (
        <Fragment>
          <Text>Loading project proposals...</Text>
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

    return (
      <Fragment>
        <Text size="large">Project Proposal Queue</Text>
        
        {/* Student Submission Form */}
        {userRole === 'student' && (
          <Fragment>
            <Text size="medium">Submit New Project Proposal</Text>
            <Form onSubmit={handleSubmitProposal} submitButtonText="Submit Proposal">
              <FormSection>
                <FormField label="Project Title" isRequired>
                  <TextField name="title" placeholder="Enter project title" />
                </FormField>
                
                <FormField label="Problem Statement" isRequired>
                  <TextArea name="problemStatement" placeholder="Describe the problem your project will solve" />
                </FormField>
                
                <FormField label="Proposed Technology" isRequired>
                  <TextField name="proposedTechnology" placeholder="e.g., React, Node.js, MongoDB (comma-separated)" />
                </FormField>
                
                <FormField label="Team Members" isRequired>
                  <TextArea name="teamMembers" placeholder="List team member names and roles" />
                </FormField>
                
                <FormField label="Synopsis File">
                  <Text>Please attach your project synopsis to this JSM request.</Text>
                </FormField>
              </FormSection>
            </Form>
          </Fragment>
        )}

        {/* Proposals Table */}
        <Text size="medium">
          {userRole === 'student' ? 'My Proposals' : 'All Proposals'}
        </Text>
        
        <Table>
          <Head>
            <Cell><Text>Title</Text></Cell>
            <Cell><Text>Team</Text></Cell>
            <Cell><Text>Technology</Text></Cell>
            <Cell><Text>Status</Text></Cell>
            <Cell><Text>Submitted</Text></Cell>
            {(userRole === 'faculty' || userRole === 'admin') && <Cell><Text>Actions</Text></Cell>}
          </Head>
          {proposals.map(proposal => (
            <Row key={proposal.id}>
              <Cell>
                <Button 
                  text={proposal.title} 
                  appearance="link"
                  onClick={() => setSelectedProposal(proposal)}
                />
              </Cell>
              <Cell>
                <Text>{proposal.teamMembers.length} members</Text>
              </Cell>
              <Cell>
                <Fragment>
                  {proposal.proposedTechnology.slice(0, 2).map(tech => (
                    <Tag key={tech} text={tech} />
                  ))}
                  {proposal.proposedTechnology.length > 2 && (
                    <Text>+{proposal.proposedTechnology.length - 2} more</Text>
                  )}
                </Fragment>
              </Cell>
              <Cell>
                <StatusLozenge 
                  appearance={getStatusAppearance(proposal.approvalStatus)}
                  text={proposal.approvalStatus}
                />
              </Cell>
              <Cell>
                <Text>{proposal.submissionDate.toLocaleDateString()}</Text>
              </Cell>
              {(userRole === 'faculty' || userRole === 'admin') && (
                <Cell>
                  {proposal.approvalStatus === 'Faculty Review' && userRole === 'faculty' && (
                    <Fragment>
                      <Button 
                        text="Approve" 
                        appearance="primary"
                        onClick={() => handleApprovalAction(proposal.id, 'approve')}
                      />
                      <Button 
                        text="Reject" 
                        appearance="warning"
                        onClick={() => handleApprovalAction(proposal.id, 'reject')}
                      />
                    </Fragment>
                  )}
                  {proposal.approvalStatus === 'HOD Approval' && userRole === 'admin' && (
                    <Fragment>
                      <Button 
                        text="Final Approve" 
                        appearance="primary"
                        onClick={() => handleApprovalAction(proposal.id, 'approve')}
                      />
                      <Button 
                        text="Reject" 
                        appearance="warning"
                        onClick={() => handleApprovalAction(proposal.id, 'reject')}
                      />
                    </Fragment>
                  )}
                </Cell>
              )}
            </Row>
          ))}
        </Table>

        {/* Proposal Details Modal */}
        {selectedProposal && (
          <Fragment>
            <Text size="large">Proposal Details: {selectedProposal.title}</Text>
            
            <FormSection>
              <FormField label="Problem Statement">
                <Text>{selectedProposal.problemStatement}</Text>
              </FormField>
              
              <FormField label="Proposed Technology">
                <Fragment>
                  {selectedProposal.proposedTechnology.map(tech => (
                    <Tag key={tech} text={tech} />
                  ))}
                </Fragment>
              </FormField>
              
              <FormField label="Team Members">
                <Table>
                  <Head>
                    <Cell><Text>Name</Text></Cell>
                    <Cell><Text>Role</Text></Cell>
                  </Head>
                  {selectedProposal.teamMembers.map(member => (
                    <Row key={member.accountId}>
                      <Cell><Text>{member.name}</Text></Cell>
                      <Cell><Text>{member.role}</Text></Cell>
                    </Row>
                  ))}
                </Table>
              </FormField>
              
              <FormField label="Current Status">
                <StatusLozenge 
                  appearance={getStatusAppearance(selectedProposal.approvalStatus)}
                  text={selectedProposal.approvalStatus}
                />
              </FormField>
              
              {selectedProposal.assignedGuide && (
                <FormField label="Assigned Guide">
                  <Text>{selectedProposal.assignedGuide}</Text>
                </FormField>
              )}
              
              {selectedProposal.comments && (
                <FormField label="Comments">
                  <Text>{selectedProposal.comments}</Text>
                </FormField>
              )}
            </FormSection>

            <Button 
              text="Close" 
              onClick={() => setSelectedProposal(null)}
            />
          </Fragment>
        )}
      </Fragment>
    );
  };

  return { render };
};