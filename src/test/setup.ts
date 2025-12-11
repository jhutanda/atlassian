// Test setup file for AcademiChain AI Automator
import 'jest';

// Mock Forge API modules
const mockApi = {
  asApp: jest.fn(() => ({
    requestJira: jest.fn(),
    requestConfluence: jest.fn(),
    requestJSM: jest.fn()
  })),
  asUser: jest.fn(() => ({
    requestJira: jest.fn(),
    requestConfluence: jest.fn(),
    requestJSM: jest.fn()
  }))
};

jest.mock('@forge/api', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  },
  route: jest.fn((template: TemplateStringsArray, ...values: any[]) => {
    return template.reduce((acc, part, i) => acc + part + (values[i] || ''), '');
  }),
  api: mockApi
}));

// Export mock for use in tests
(global as any).mockApi = mockApi;

jest.mock('@forge/bridge', () => ({
  invoke: jest.fn()
}));

jest.mock('@forge/resolver', () => ({
  Resolver: jest.fn().mockImplementation(() => ({
    define: jest.fn(),
    getDefinitions: jest.fn(() => ({}))
  }))
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};