import Resolver from '@forge/resolver';
import { ConfluenceService } from './services/confluence';

const resolver = new Resolver();

// Handler for attendance tracking macro
resolver.define('attendanceHandler', async (req: any) => {
  const confluenceService = new ConfluenceService();
  
  try {
    const macroContent = await confluenceService.createAttendanceMacro();
    
    return {
      type: 'macro',
      content: macroContent,
      parameters: req.payload.parameters || {}
    };
  } catch (error) {
    console.error('Error in attendance macro handler:', error);
    return {
      type: 'error',
      message: 'Failed to load attendance tracking macro'
    };
  }
});

// Handler for saving attendance data
resolver.define('saveAttendance', async (req: any) => {
  try {
    const { courseCode, sessionDate, attendanceData } = req.payload;
    
    // Here you would typically save the attendance data to storage
    // For now, we'll just return a success response
    
    return {
      success: true,
      message: 'Attendance saved successfully',
      data: {
        courseCode,
        sessionDate,
        recordCount: Object.keys(attendanceData).length
      }
    };
  } catch (error) {
    console.error('Error saving attendance:', error);
    return {
      success: false,
      error: 'Failed to save attendance data'
    };
  }
});

export const handler = resolver.getDefinitions();