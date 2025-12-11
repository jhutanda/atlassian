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
  DatePicker,
  Select,
  Option,
  Table,
  Head,
  Row,
  Cell,
  StatusLozenge,
  SectionMessage
} from '@forge/ui';

interface SemesterData {
  projectKey: string;
  semesterName: string;
  startDate: Date;
  endDate: Date;
  courses: Course[];
  assignments: Assignment[];
  lectures: Lecture[];
}

interface Course {
  code: string;
  name: string;
  credits: number;
  instructor: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: Date;
  status: string;
  submissions: number;
  totalStudents: number;
}

interface Lecture {
  id: string;
  title: string;
  date: Date;
  topic: string;
  materials: string[];
}

export const SemesterManagement: React.FC = () => {
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'lectures' | 'attendance'>('overview');

  useEffect(() => {
    const fetchSemesterData = async () => {
      try {
        setLoading(true);
        const response = await invoke('getSemesterData');
        if (response.error) {
          setError(response.error);
        } else {
          setSemesterData(response);
        }
      } catch (err) {
        setError('Failed to load semester data');
        console.error('Semester management error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSemesterData();
  }, []);

  const handleCreateAssignment = async (formData: any) => {
    try {
      const response = await invoke('createAssignment', formData);
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh semester data
        const updatedResponse = await invoke('getSemesterData');
        setSemesterData(updatedResponse);
      }
    } catch (err) {
      setError('Failed to create assignment');
      console.error('Assignment creation error:', err);
    }
  };

  const handleCreateLecture = async (formData: any) => {
    try {
      const response = await invoke('createLecture', formData);
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh semester data
        const updatedResponse = await invoke('getSemesterData');
        setSemesterData(updatedResponse);
      }
    } catch (err) {
      setError('Failed to create lecture');
      console.error('Lecture creation error:', err);
    }
  };

  const render = (context: any) => {
    if (loading) {
      return (
        <Fragment>
          <Text>Loading semester management...</Text>
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

    if (!semesterData) {
      return (
        <Fragment>
          <Text>No semester data found. Please configure your semester first.</Text>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Text size="large">Semester Management: {semesterData.semesterName}</Text>
        
        {/* Tab Navigation */}
        <FormSection>
          <Button 
            text="Overview" 
            appearance={activeTab === 'overview' ? 'primary' : 'default'}
            onClick={() => setActiveTab('overview')}
          />
          <Button 
            text="Assignments" 
            appearance={activeTab === 'assignments' ? 'primary' : 'default'}
            onClick={() => setActiveTab('assignments')}
          />
          <Button 
            text="Lectures" 
            appearance={activeTab === 'lectures' ? 'primary' : 'default'}
            onClick={() => setActiveTab('lectures')}
          />
          <Button 
            text="Attendance" 
            appearance={activeTab === 'attendance' ? 'primary' : 'default'}
            onClick={() => setActiveTab('attendance')}
          />
        </FormSection>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Fragment>
            <FormSection>
              <FormField label="Semester Period">
                <Text>{semesterData.startDate.toLocaleDateString()} - {semesterData.endDate.toLocaleDateString()}</Text>
              </FormField>
              
              <FormField label="Total Courses">
                <Text>{semesterData.courses.length}</Text>
              </FormField>
              
              <FormField label="Active Assignments">
                <Text>{semesterData.assignments.filter(a => a.status === 'Active').length}</Text>
              </FormField>
              
              <FormField label="Upcoming Lectures">
                <Text>{semesterData.lectures.filter(l => l.date > new Date()).length}</Text>
              </FormField>
            </FormSection>

            <Text size="medium">Courses</Text>
            <Table>
              <Head>
                <Cell><Text>Course Code</Text></Cell>
                <Cell><Text>Course Name</Text></Cell>
                <Cell><Text>Credits</Text></Cell>
                <Cell><Text>Instructor</Text></Cell>
              </Head>
              {semesterData.courses.map(course => (
                <Row key={course.code}>
                  <Cell><Text>{course.code}</Text></Cell>
                  <Cell><Text>{course.name}</Text></Cell>
                  <Cell><Text>{course.credits}</Text></Cell>
                  <Cell><Text>{course.instructor}</Text></Cell>
                </Row>
              ))}
            </Table>
          </Fragment>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <Fragment>
            <Form onSubmit={handleCreateAssignment} submitButtonText="Create Assignment">
              <FormSection>
                <FormField label="Assignment Title" isRequired>
                  <TextField name="title" placeholder="Enter assignment title" />
                </FormField>
                
                <FormField label="Description" isRequired>
                  <TextField name="description" placeholder="Assignment description" />
                </FormField>
                
                <FormField label="Due Date" isRequired>
                  <DatePicker name="dueDate" />
                </FormField>
                
                <FormField label="Total Marks" isRequired>
                  <TextField name="totalMarks" type="number" placeholder="100" />
                </FormField>
                
                <FormField label="Course" isRequired>
                  <Select name="courseCode">
                    {semesterData.courses.map(course => (
                      <Option key={course.code} value={course.code} label={`${course.code} - ${course.name}`} />
                    ))}
                  </Select>
                </FormField>
              </FormSection>
            </Form>

            <Text size="medium">Current Assignments</Text>
            <Table>
              <Head>
                <Cell><Text>Title</Text></Cell>
                <Cell><Text>Due Date</Text></Cell>
                <Cell><Text>Status</Text></Cell>
                <Cell><Text>Submissions</Text></Cell>
              </Head>
              {semesterData.assignments.map(assignment => (
                <Row key={assignment.id}>
                  <Cell><Text>{assignment.title}</Text></Cell>
                  <Cell><Text>{assignment.dueDate.toLocaleDateString()}</Text></Cell>
                  <Cell>
                    <StatusLozenge 
                      appearance={assignment.status === 'Active' ? 'success' : 'default'}
                      text={assignment.status}
                    />
                  </Cell>
                  <Cell><Text>{assignment.submissions} / {assignment.totalStudents}</Text></Cell>
                </Row>
              ))}
            </Table>
          </Fragment>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <Fragment>
            <Form onSubmit={handleCreateLecture} submitButtonText="Create Lecture">
              <FormSection>
                <FormField label="Lecture Title" isRequired>
                  <TextField name="title" placeholder="Enter lecture title" />
                </FormField>
                
                <FormField label="Topic" isRequired>
                  <TextField name="topic" placeholder="Lecture topic" />
                </FormField>
                
                <FormField label="Date" isRequired>
                  <DatePicker name="date" />
                </FormField>
                
                <FormField label="Course" isRequired>
                  <Select name="courseCode">
                    {semesterData.courses.map(course => (
                      <Option key={course.code} value={course.code} label={`${course.code} - ${course.name}`} />
                    ))}
                  </Select>
                </FormField>
              </FormSection>
            </Form>

            <Text size="medium">Lecture Schedule</Text>
            <Table>
              <Head>
                <Cell><Text>Title</Text></Cell>
                <Cell><Text>Date</Text></Cell>
                <Cell><Text>Topic</Text></Cell>
                <Cell><Text>Materials</Text></Cell>
              </Head>
              {semesterData.lectures.map(lecture => (
                <Row key={lecture.id}>
                  <Cell><Text>{lecture.title}</Text></Cell>
                  <Cell><Text>{lecture.date.toLocaleDateString()}</Text></Cell>
                  <Cell><Text>{lecture.topic}</Text></Cell>
                  <Cell><Text>{lecture.materials.length} files</Text></Cell>
                </Row>
              ))}
            </Table>
          </Fragment>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <Fragment>
            <Text size="medium">Attendance Tracking</Text>
            <Text>Use the attendance tracking macro in Confluence pages to record attendance for each session.</Text>
            
            <FormSection>
              <Button text="Create Attendance Page" appearance="primary" />
              <Button text="View Attendance Reports" />
            </FormSection>
          </Fragment>
        )}
      </Fragment>
    );
  };

  return { render };
};