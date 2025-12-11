#!/usr/bin/env node

/**
 * Local runner for AcademiChain AI Automator
 * This script simulates the Forge environment locally for development and testing
 */

const express = require('express');
const path = require('path');

// Mock Forge API for local development
global.api = {
  asApp: () => ({
    requestJira: async (route, options) => {
      console.log(`Mock Jira API call: ${route}`, options);
      return { success: true, data: 'Mock response' };
    },
    requestConfluence: async (route, options) => {
      console.log(`Mock Confluence API call: ${route}`, options);
      return { success: true, data: 'Mock response' };
    }
  }),
  asUser: () => ({
    requestJira: async (route, options) => {
      console.log(`Mock Jira API call (as user): ${route}`, options);
      return { success: true, data: 'Mock response' };
    },
    requestConfluence: async (route, options) => {
      console.log(`Mock Confluence API call (as user): ${route}`, options);
      return { success: true, data: 'Mock response' };
    }
  })
};

// Mock storage
global.storage = {
  get: async (key) => {
    console.log(`Storage get: ${key}`);
    return null;
  },
  set: async (key, value) => {
    console.log(`Storage set: ${key}`, value);
    return true;
  },
  delete: async (key) => {
    console.log(`Storage delete: ${key}`);
    return true;
  }
};

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Serve a simple HTML page for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>AcademiChain AI Automator - Local Development</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            button { padding: 10px 20px; margin: 5px; background: #0052cc; color: white; border: none; border-radius: 3px; cursor: pointer; }
            button:hover { background: #0065ff; }
            .output { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 3px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 AcademiChain AI Automator</h1>
            <p>Local development server running on port ${port}</p>
            
            <div class="section">
                <h2>📊 Dashboard Stats</h2>
                <button onclick="testDashboard()">Load Dashboard</button>
                <div id="dashboard-output" class="output"></div>
            </div>
            
            <div class="section">
                <h2>📝 Assignment Management</h2>
                <button onclick="testAssignment()">Test Assignment</button>
                <div id="assignment-output" class="output"></div>
            </div>
            
            <div class="section">
                <h2>🗓️ Semester Management</h2>
                <button onclick="testSemester()">Load Semester Data</button>
                <div id="semester-output" class="output"></div>
            </div>
            
            <div class="section">
                <h2>📋 Project Queue</h2>
                <button onclick="testProjects()">Load Project Proposals</button>
                <div id="projects-output" class="output"></div>
            </div>
        </div>
        
        <script>
            async function testDashboard() {
                const output = document.getElementById('dashboard-output');
                output.textContent = 'Loading...';
                try {
                    const response = await fetch('/api/dashboard-stats');
                    const data = await response.json();
                    output.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    output.textContent = 'Error: ' + error.message;
                }
            }
            
            async function testAssignment() {
                const output = document.getElementById('assignment-output');
                output.textContent = 'Loading...';
                try {
                    const response = await fetch('/api/assignment-data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ issueKey: 'TEST-123' })
                    });
                    const data = await response.json();
                    output.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    output.textContent = 'Error: ' + error.message;
                }
            }
            
            async function testSemester() {
                const output = document.getElementById('semester-output');
                output.textContent = 'Loading...';
                try {
                    const response = await fetch('/api/semester-data');
                    const data = await response.json();
                    output.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    output.textContent = 'Error: ' + error.message;
                }
            }
            
            async function testProjects() {
                const output = document.getElementById('projects-output');
                output.textContent = 'Loading...';
                try {
                    const response = await fetch('/api/project-proposals');
                    const data = await response.json();
                    output.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    output.textContent = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Load the compiled resolver functions
let resolver;
try {
  // Try to load from dist if built
  resolver = require('./dist/index.js');
} catch (error) {
  console.log('Compiled version not found, using TypeScript directly...');
  // For now, we'll create mock endpoints
}

// API endpoints that simulate the Forge resolver functions
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const mockStats = {
      totalAssignments: 12,
      pendingSubmissions: 8,
      gradedAssignments: 4,
      averageGrade: 85.5,
      upcomingDeadlines: [
        { title: 'Database Design Assignment', dueDate: '2025-12-15', course: 'CS301' },
        { title: 'React Project', dueDate: '2025-12-18', course: 'CS401' }
      ],
      recentActivity: [
        { type: 'submission', student: 'John Doe', assignment: 'Web Development Lab', timestamp: new Date() },
        { type: 'grade', student: 'Jane Smith', assignment: 'Algorithm Analysis', grade: 92, timestamp: new Date() }
      ]
    };
    res.json(mockStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assignment-data', async (req, res) => {
  try {
    const { issueKey } = req.body;
    const mockAssignment = {
      issueKey: issueKey || 'TEST-123',
      summary: 'Database Design Assignment',
      description: 'Design and implement a relational database for a library management system',
      status: 'In Progress',
      assignee: 'student@university.edu',
      reporter: 'professor@university.edu',
      customFields: {
        deadline: new Date('2025-12-15'),
        totalMarks: 100,
        courseCode: 'CS301',
        allowFileUpload: true,
        submissionStatus: 'Not Started'
      },
      submissions: [],
      grade: null,
      feedback: null
    };
    res.json(mockAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/semester-data', async (req, res) => {
  try {
    const mockSemesterData = {
      projectKey: 'ACAD',
      semesterName: 'Fall 2025',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-20'),
      courses: [
        { code: 'CS301', name: 'Database Systems', credits: 3, instructor: 'Dr. Smith' },
        { code: 'CS401', name: 'Web Development', credits: 4, instructor: 'Prof. Johnson' },
        { code: 'CS501', name: 'Software Engineering', credits: 3, instructor: 'Dr. Brown' }
      ],
      assignments: [
        {
          id: 'ACAD-101',
          title: 'Database Design',
          description: 'Design a relational database',
          dueDate: new Date('2025-12-15'),
          totalMarks: 100,
          courseCode: 'CS301',
          status: 'Active',
          submissions: 15,
          totalStudents: 25
        },
        {
          id: 'ACAD-102',
          title: 'React Application',
          description: 'Build a full-stack React app',
          dueDate: new Date('2025-12-18'),
          totalMarks: 150,
          courseCode: 'CS401',
          status: 'Active',
          submissions: 8,
          totalStudents: 25
        }
      ],
      lectures: [
        {
          id: 'LEC-001',
          title: 'Introduction to Databases',
          topic: 'Relational Model Fundamentals',
          date: new Date('2025-12-12'),
          courseCode: 'CS301',
          materials: ['slides.pdf', 'examples.sql']
        },
        {
          id: 'LEC-002',
          title: 'React Hooks Deep Dive',
          topic: 'useState, useEffect, and Custom Hooks',
          date: new Date('2025-12-13'),
          courseCode: 'CS401',
          materials: ['hooks-guide.pdf', 'demo-code.zip']
        }
      ]
    };
    res.json(mockSemesterData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/project-proposals', async (req, res) => {
  try {
    const mockProposals = {
      proposals: [
        {
          id: 'PROP-001',
          title: 'AI-Powered Study Assistant',
          problemStatement: 'Students need personalized study recommendations based on their learning patterns',
          proposedTechnology: 'Python, TensorFlow, React, Node.js',
          teamMembers: 'Alice Johnson (Lead), Bob Smith (Backend), Carol Davis (Frontend)',
          submissionDate: new Date('2025-12-01'),
          status: 'Under Review',
          priority: 'High',
          assignedGuide: 'Dr. Wilson',
          comments: 'Interesting concept, needs more technical details'
        },
        {
          id: 'PROP-002',
          title: 'Campus Event Management System',
          problemStatement: 'Current event management is manual and inefficient',
          proposedTechnology: 'React, Node.js, MongoDB, Express',
          teamMembers: 'David Lee (Full-stack), Emma Wilson (UI/UX)',
          submissionDate: new Date('2025-12-03'),
          status: 'Approved',
          priority: 'Medium',
          assignedGuide: 'Prof. Anderson',
          comments: 'Well-structured proposal, approved for development'
        },
        {
          id: 'PROP-003',
          title: 'Blockchain-based Certificate Verification',
          problemStatement: 'Academic certificates are difficult to verify and prone to fraud',
          proposedTechnology: 'Ethereum, Solidity, Web3.js, React',
          teamMembers: 'Frank Miller (Blockchain), Grace Chen (Frontend), Henry Taylor (Backend)',
          submissionDate: new Date('2025-12-05'),
          status: 'Needs Revision',
          priority: 'High',
          assignedGuide: 'Dr. Kumar',
          comments: 'Ambitious project, needs clearer implementation timeline'
        }
      ],
      userRole: 'instructor'
    };
    res.json(mockProposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AcademiChain AI Automator',
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`🎓 AcademiChain AI Automator running locally at http://localhost:${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}`);
  console.log(`🔍 Health Check: http://localhost:${port}/health`);
  console.log(`\n🚀 Ready for development and testing!`);
});