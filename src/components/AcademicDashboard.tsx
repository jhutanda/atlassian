import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { 
  Text,
  StatusLozenge,
  Table,
  Head,
  Row,
  Cell,
  Fragment
} from '@forge/ui';

interface DashboardStats {
  totalAssignments: number;
  pendingSubmissions: number;
  gradedAssignments: number;
  activeProjects: number;
  pendingApprovals: number;
}

export const AcademicDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await invoke('getDashboardStats') as any;
        if (response?.error) {
          setError(response.error);
        } else {
          setStats(response as DashboardStats);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Fragment>
        <Text>AcademiChain Academic Dashboard</Text>
        <Text>Loading academic statistics...</Text>
      </Fragment>
    );
  }

  if (error) {
    return (
      <Fragment>
        <Text>AcademiChain Academic Dashboard</Text>
        <StatusLozenge appearance="removed" text={error} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Text>AcademiChain Academic Dashboard</Text>
      <Table>
        <Head>
          <Cell>
            <Text>Metric</Text>
          </Cell>
          <Cell>
            <Text>Count</Text>
          </Cell>
          <Cell>
            <Text>Status</Text>
          </Cell>
        </Head>
        <Row>
          <Cell>
            <Text>Total Assignments</Text>
          </Cell>
          <Cell>
            <Text>{stats?.totalAssignments || 0}</Text>
          </Cell>
          <Cell>
            <StatusLozenge appearance="success" text="Active" />
          </Cell>
        </Row>
        <Row>
          <Cell>
            <Text>Pending Submissions</Text>
          </Cell>
          <Cell>
            <Text>{stats?.pendingSubmissions || 0}</Text>
          </Cell>
          <Cell>
            <StatusLozenge 
              appearance={stats?.pendingSubmissions ? "inprogress" : "success"} 
              text={stats?.pendingSubmissions ? "Pending" : "Complete"} 
            />
          </Cell>
        </Row>
        <Row>
          <Cell>
            <Text>Graded Assignments</Text>
          </Cell>
          <Cell>
            <Text>{stats?.gradedAssignments || 0}</Text>
          </Cell>
          <Cell>
            <StatusLozenge appearance="success" text="Complete" />
          </Cell>
        </Row>
        <Row>
          <Cell>
            <Text>Active Projects</Text>
          </Cell>
          <Cell>
            <Text>{stats?.activeProjects || 0}</Text>
          </Cell>
          <Cell>
            <StatusLozenge appearance="inprogress" text="In Progress" />
          </Cell>
        </Row>
        <Row>
          <Cell>
            <Text>Pending Approvals</Text>
          </Cell>
          <Cell>
            <Text>{stats?.pendingApprovals || 0}</Text>
          </Cell>
          <Cell>
            <StatusLozenge 
              appearance={stats?.pendingApprovals ? "new" : "success"} 
              text={stats?.pendingApprovals ? "Review Required" : "Up to Date"} 
            />
          </Cell>
        </Row>
      </Table>
    </Fragment>
  );
};