import { JiraService } from '../../services/jira';

describe('JiraService Unit Tests', () => {
  let jiraService: JiraService;

  beforeEach(() => {
    jiraService = new JiraService();
    jest.clearAllMocks();
  });

  test('should create JiraService instance', () => {
    expect(jiraService).toBeInstanceOf(JiraService);
  });

  test('should have createAcademicIssueTypes method', () => {
    expect(typeof jiraService.createAcademicIssueTypes).toBe('function');
  });

  test('should have createAssignmentIssue method', () => {
    expect(typeof jiraService.createAssignmentIssue).toBe('function');
  });

  test('should have getDashboardStats method', () => {
    expect(typeof jiraService.getDashboardStats).toBe('function');
  });
});