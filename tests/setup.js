// tests/setup.js
// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Create a proper localStorage mock class
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Setup localStorage with spies
const localStorageMock = new LocalStorageMock();
const setItemSpy = jest.spyOn(localStorageMock, 'setItem');
const getItemSpy = jest.spyOn(localStorageMock, 'getItem');

global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  localStorage.clear();
  setItemSpy.mockClear();
  getItemSpy.mockClear();
  fetch.mockClear();
  jest.clearAllMocks();
});
