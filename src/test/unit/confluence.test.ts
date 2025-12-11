import { ConfluenceService } from '../../services/confluence';

describe('ConfluenceService Unit Tests', () => {
  let confluenceService: ConfluenceService;

  beforeEach(() => {
    confluenceService = new ConfluenceService();
    jest.clearAllMocks();
  });

  test('should create ConfluenceService instance', () => {
    expect(confluenceService).toBeInstanceOf(ConfluenceService);
  });

  test('should have createSemesterSpace method', () => {
    expect(typeof confluenceService.createSemesterSpace).toBe('function');
  });

  test('should have createAssignmentFeedbackPage method', () => {
    expect(typeof confluenceService.createAssignmentFeedbackPage).toBe('function');
  });

  test('should have createAttendanceMacro method', () => {
    expect(typeof confluenceService.createAttendanceMacro).toBe('function');
  });

  test('createAttendanceMacro should return macro content', async () => {
    const macroContent = await confluenceService.createAttendanceMacro();
    
    expect(typeof macroContent).toBe('string');
    expect(macroContent).toContain('attendance-tracker');
    expect(macroContent).toContain('courseCode');
    expect(macroContent).toContain('sessionDate');
    expect(macroContent).toContain('Student ID');
    expect(macroContent).toContain('Present');
    expect(macroContent).toContain('Absent');
  });
});