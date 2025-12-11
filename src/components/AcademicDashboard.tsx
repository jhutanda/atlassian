import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { 
  DashboardItem, 
  DashboardItemHeader, 
  DashboardItemContent,
  Text,
  StatusLozenge,
  Table,
  Head,
  Row,
  Cell
} from '@forge/ui';

interface DashboardStats {
  totalAssignments: number;
  pendingSubmissions: number;
  gradedAssignments: number;
  activeProjects: number;
  pendingApprovals: number;
}

export const AcademicDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await invoke('getDashboardStats');
        if (response.error) {
          setError(response.error);
        } else {
          setStats(response);
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

  const render = (context: any) => {
    if (loading) {
      return (
        <DashboardItem>
          <DashboardItemHeader>
            <Text>AcademiChain Academic Dashboard</Text>
          </DashboardItemHeader>
          <DashboardItemContent>
            <Text>Loading academic statistics...</Text>
          </DashboardItemContent>
        </DashboardItem>
      );
    }

    if (error) {
      return (
        <DashboardItem>
          <DashboardItemHeader>
            <Text>AcademiChain Academic Dashboard</Text>
          </DashboardItemHeader>
          <DashboardItemContent>
            <StatusLozenge appearance="removed" text={error} />
          </DashboardItemContent>
        </DashboardItem>
      );
    }

    return (
      <DashboardItem>
        <DashboardItemHeader>
          <Text>AcademiChain Academic Dashboard</Text>
        </DashboardItemHeader>
        <DashboardItemContent>
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
        </DashboardItemContent>
      </DashboardItem>
    );
  };

  return { render };
};