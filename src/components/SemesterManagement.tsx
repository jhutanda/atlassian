import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import {
  Text,
  Button,
  Form,
  TextField,
  TextArea,
  DatePicker,
  Select,
  Option,
  StatusLozenge,
  Fragment,
  SectionMessage
} from '@forge/ui';
// Simple interfaces for semester management
interface Course {
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
}

interface Assignment {
  id: string;
  title: string;
  courseCode: string;
  dueDate: Date;
  status: string;
}

interface LectureSchedule {
  id: string;
  title: string;
  topic: string;
  date: Date;
  courseCode: string;
}

interface SemesterData {
  semesterName: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  courses: Course[];
  assignments: Assignment[];
  lectureSchedule: LectureSchedule[];
}

export const SemesterManagement = () => {
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSemesterData = async () => {
      try {
        setLoading(true);
        const response = await invoke('getSemesterData') as any;
        if (response?.error) {
          setError(response.error);
        } else {
          setSemesterData(response as SemesterData);
        }
      } catch (err) {
        setError('Failed to load semester data');
        console.error('Semester error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSemesterData();
  }, []);

  const handleCreateAssignment = async (formData: any) => {
    try {
      const response = await invoke('createAssignment', formData) as any;
      if (response?.error) {
        setError(response.error);
      } else {
        setSemesterData(response as SemesterData);
      }
    } catch (err) {
      setError('Failed to create assignment');
      console.error('Assignment error:', err);
    }
  };

  const handleScheduleLecture = async (formData: any) => {
    try {
      const response = await invoke('scheduleLecture', formData) as any;
      if (response?.error) {
        setError(response.error);
      } else {
        setSemesterData(response as SemesterData);
      }
    } catch (err) {
      setError('Failed to schedule lecture');
      console.error('Lecture error:', err);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Text>Semester Management</Text>
        <Text>Loading semester data...</Text>
      </Fragment>
    );
  }

  if (error) {
    return (
      <Fragment>
        <Text>Semester Management</Text>
        <SectionMessage appearance="error">
          <Text>{error}</Text>
        </SectionMessage>
      </Fragment>
    );
  }

  if (!semesterData) {
    return (
      <Fragment>
        <Text>Semester Management</Text>
        <Text>No semester data available</Text>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Text>Semester Management: {semesterData.semesterName}</Text>
      <Text>Academic Year: {semesterData.academicYear}</Text>
      <Text>Start Date: {new Date(semesterData.startDate).toLocaleDateString()}</Text>
      <Text>End Date: {new Date(semesterData.endDate).toLocaleDateString()}</Text>

      <Text>Courses</Text>
      {semesterData.courses.map((course) => (
        <Fragment key={course.courseCode}>
          <Text>{course.courseCode}: {course.courseName}</Text>
          <Text>Credits: {course.credits}</Text>
          <Text>Instructor: {course.instructor}</Text>
        </Fragment>
      ))}

      <Text>Create New Assignment</Text>
      <Form onSubmit={handleCreateAssignment} submitButtonText="Create Assignment">
        <TextField 
          name="title" 
          label="Assignment Title"
          placeholder="Enter assignment title" 
        />
        <TextField 
          name="description" 
          label="Description"
          placeholder="Assignment description" 
        />
        <DatePicker 
          name="dueDate" 
          label="Due Date"
        />
        <TextField 
          name="totalMarks" 
          label="Total Marks"
          type="number" 
          placeholder="100" 
        />
        <Select name="courseCode" label="Course">
          {semesterData.courses.map((course) => (
            <Option key={course.courseCode} label={course.courseName} value={course.courseCode} />
          ))}
        </Select>
      </Form>

      <Text>Current Assignments</Text>
      {semesterData.assignments.map((assignment) => (
        <Fragment key={assignment.id}>
          <Text>{assignment.title}</Text>
          <Text>Course: {assignment.courseCode}</Text>
          <Text>Due: {new Date(assignment.dueDate).toLocaleDateString()}</Text>
          <StatusLozenge 
            appearance={assignment.status === 'published' ? 'success' : 'inprogress'} 
            text={assignment.status} 
          />
        </Fragment>
      ))}

      <Text>Schedule New Lecture</Text>
      <Form onSubmit={handleScheduleLecture} submitButtonText="Schedule Lecture">
        <TextField 
          name="title" 
          label="Lecture Title"
          placeholder="Enter lecture title" 
        />
        <TextField 
          name="topic" 
          label="Topic"
          placeholder="Lecture topic" 
        />
        <DatePicker 
          name="date" 
          label="Date"
        />
        <Select name="courseCode" label="Course">
          {semesterData.courses.map((course) => (
            <Option key={course.courseCode} label={course.courseName} value={course.courseCode} />
          ))}
        </Select>
      </Form>

      <Text>Lecture Schedule</Text>
      {semesterData.lectureSchedule.map((lecture) => (
        <Fragment key={lecture.id}>
          <Text>{lecture.title}</Text>
          <Text>Topic: {lecture.topic}</Text>
          <Text>Date: {new Date(lecture.date).toLocaleDateString()}</Text>
          <Text>Course: {lecture.courseCode}</Text>
        </Fragment>
      ))}

      <Text>Attendance Tracking</Text>
      <Button text="Create Attendance Page" onClick={() => {}} />
      <Button text="View Attendance Reports" onClick={() => {}} />
    </Fragment>
  );
};