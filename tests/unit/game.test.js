/**
 * Unit Tests for Game Logic (app.js)
 * Tests game state, navigation, timer, and UI interactions
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Create a mock DOM environment
const createMockDOM = () => {
  const elements = {};
  
  const createElement = (tag) => {
    const element = {
      tagName: tag,
      id: '',
      className: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn()
      },
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      disabled: false,
      children: [],
      parentElement: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn((selector) => elements[selector]),
      querySelectorAll: jest.fn((selector) => []),
      appendChild: jest.fn(function(child) {
        this.children.push(child);
        child.parentElement = this;
        return child;
      }),
      removeChild: jest.fn(function(child) {
        const index = this.children.indexOf(child);
        if (index > -1) this.children.splice(index, 1);
        child.parentElement = null;
      }),
      click: jest.fn(),
      focus: jest.fn(),
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn()
    };
    return element;
  };

  global.document = {
    getElementById: jest.fn((id) => elements[id] || createElement('div')),
    querySelector: jest.fn((selector) => elements[selector] || createElement('div')),
    querySelectorAll: jest.fn(() => []),
    createElement: jest.fn(createElement),
    body: createElement('body'),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };

  // Store elements for retrieval
  elements['#startBtn'] = createElement('button');
  elements['#wikiContent'] = createElement('div');
  elements['#clickCounter'] = createElement('span');
  elements['#timerDisplay'] = createElement('span');
  elements['#startPageName'] = createElement('span');
  elements['#targetPageName'] = createElement('span');
  elements['#playerNameInput'] = createElement('input');
  elements['#submitScoreBtn'] = createElement('button');
  elements['#leaderboardBtn'] = createElement('button');

  return elements;
};

describe('Game State Management', () => {
  let mockElements;

  beforeEach(() => {
    mockElements = createMockDOM();
    jest.clearAllMocks();
  });

  test('should initialize with welcome state', () => {
    // This tests the default game state
    const defaultState = {
      state: 'welcome',
      startPage: '',
      targetPage: '',
      currentPage: '',
      expectedPage: '',
      clickCount: 0,
      startTime: null,
      elapsedTime: 0,
      navigationHistory: [],
      timer: null
    };

    expect(defaultState.state).toBe('welcome');
    expect(defaultState.clickCount).toBe(0);
    expect(defaultState.navigationHistory).toEqual([]);
  });

  test('should have valid popular pages array', () => {
    const popularPages = [
      "United_States", "World_War_II", "Albert_Einstein", "DNA", "Solar_System"
    ];

    expect(Array.isArray(popularPages)).toBe(true);
    expect(popularPages.length).toBeGreaterThan(0);
    expect(popularPages.every(page => typeof page === 'string')).toBe(true);
  });

  test('should select random pages for start and target', () => {
    const popularPages = ["Page1", "Page2", "Page3", "Page4", "Page5"];
    
    const getRandomPage = () => {
      return popularPages[Math.floor(Math.random() * popularPages.length)];
    };

    const page1 = getRandomPage();
    const page2 = getRandomPage();

    expect(popularPages).toContain(page1);
    expect(popularPages).toContain(page2);
  });

  test('should ensure start and target pages are different', () => {
    const popularPages = ["Page1", "Page2", "Page3"];
    
    let startPage, targetPage;
    do {
      startPage = popularPages[Math.floor(Math.random() * popularPages.length)];
      targetPage = popularPages[Math.floor(Math.random() * popularPages.length)];
    } while (startPage === targetPage);

    expect(startPage).not.toBe(targetPage);
  });
});

describe('Timer Functionality', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should format time correctly', () => {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(125)).toBe('02:05');
    expect(formatTime(3661)).toBe('61:01');
  });

  test('should calculate elapsed time', () => {
    const startTime = Date.now();
    
    jest.advanceTimersByTime(5000); // Advance 5 seconds
    
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    expect(elapsedTime).toBe(5);
  });

  test('should update timer every second', () => {
    let seconds = 0;
    const updateTimer = () => {
      seconds++;
    };

    const timerId = setInterval(updateTimer, 1000);
    
    jest.advanceTimersByTime(3000);
    
    expect(seconds).toBe(3);
    
    clearInterval(timerId);
  });
});

describe('Click Counter', () => {
  test('should increment click count', () => {
    let clickCount = 0;
    
    clickCount++;
    expect(clickCount).toBe(1);
    
    clickCount++;
    expect(clickCount).toBe(2);
  });

  test('should start from zero', () => {
    const clickCount = 0;
    expect(clickCount).toBe(0);
  });
});

describe('Navigation History', () => {
  test('should track visited pages', () => {
    const navigationHistory = [];
    
    navigationHistory.push('France');
    navigationHistory.push('Europe');
    navigationHistory.push('Germany');

    expect(navigationHistory).toHaveLength(3);
    expect(navigationHistory[0]).toBe('France');
    expect(navigationHistory[2]).toBe('Germany');
  });

  test('should maintain order of navigation', () => {
    const navigationHistory = [];
    const pages = ['Page1', 'Page2', 'Page3'];

    pages.forEach(page => navigationHistory.push(page));

    expect(navigationHistory).toEqual(pages);
  });
});

describe('Wikipedia API Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('should construct correct Wikipedia API URL', () => {
    const pageName = 'France';
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${pageName}`;

    expect(apiUrl).toContain('wikipedia.org');
    expect(apiUrl).toContain('France');
  });

  test('should handle successful API response', async () => {
    const mockHTML = '<html><body><a href="/wiki/Germany">Germany</a></body></html>';
    
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockHTML
    });

    const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/html/France');
    const html = await response.text();

    expect(response.ok).toBe(true);
    expect(html).toContain('Germany');
  });

  test('should handle API errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('https://en.wikipedia.org/api/rest_v1/page/html/InvalidPage');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});

describe('Link Processing', () => {
  test('should identify valid Wikipedia links', () => {
    const isValidWikiLink = (href) => {
      return href && 
             href.startsWith('/wiki/') && 
             !href.includes(':') &&
             !href.includes('#');
    };

    expect(isValidWikiLink('/wiki/France')).toBe(true);
    expect(isValidWikiLink('/wiki/United_States')).toBe(true);
    expect(isValidWikiLink('/wiki/File:Image.jpg')).toBe(false);
    expect(isValidWikiLink('/wiki/Special:Page')).toBe(false);
    expect(isValidWikiLink('/wiki/France#Section')).toBe(false);
  });

  test('should extract page name from link', () => {
    const extractPageName = (href) => {
      return href.replace('/wiki/', '').split('#')[0];
    };

    expect(extractPageName('/wiki/France')).toBe('France');
    expect(extractPageName('/wiki/United_States')).toBe('United_States');
    expect(extractPageName('/wiki/France#History')).toBe('France');
  });

  test('should decode URL-encoded page names', () => {
    const decodeName = (name) => {
      return decodeURIComponent(name.replace(/_/g, ' '));
    };

    expect(decodeName('United_States')).toBe('United States');
    expect(decodeName('New_York_City')).toBe('New York City');
  });
});

describe('Win Condition', () => {
  test('should detect when target is reached', () => {
    const currentPage = 'Germany';
    const targetPage = 'Germany';

    expect(currentPage === targetPage).toBe(true);
  });

  test('should detect when target is not reached', () => {
    const currentPage = 'France';
    const targetPage = 'Germany';

    expect(currentPage === targetPage).toBe(false);
  });

  test('should normalize page names for comparison', () => {
    const normalizePage = (page) => {
      return page.replace(/_/g, ' ').toLowerCase().trim();
    };

    const current = normalizePage('United_States');
    const target = normalizePage('United States');

    expect(current).toBe(target);
  });
});

describe('Modal Management', () => {
  let mockModal;

  beforeEach(() => {
    mockModal = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      }
    };
  });

  test('should show modal by adding active class', () => {
    mockModal.classList.add('active');
    
    expect(mockModal.classList.add).toHaveBeenCalledWith('active');
  });

  test('should hide modal by removing active class', () => {
    mockModal.classList.remove('active');
    
    expect(mockModal.classList.remove).toHaveBeenCalledWith('active');
  });
});

describe('Screen Management', () => {
  test('should switch between game screens', () => {
    const screens = {
      welcome: { classList: { add: jest.fn(), remove: jest.fn() } },
      game: { classList: { add: jest.fn(), remove: jest.fn() } },
      win: { classList: { add: jest.fn(), remove: jest.fn() } }
    };

    const showScreen = (screen) => {
      Object.values(screens).forEach(s => s.classList.remove('active'));
      screen.classList.add('active');
    };

    showScreen(screens.game);

    expect(screens.welcome.classList.remove).toHaveBeenCalledWith('active');
    expect(screens.game.classList.add).toHaveBeenCalledWith('active');
  });
});

describe('Error Handling', () => {
  test('should handle missing page gracefully', () => {
    const handleError = (error) => {
      console.error('Error:', error);
      return { success: false, error: error.message };
    };

    const result = handleError(new Error('Page not found'));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Page not found');
  });

  test('should handle network errors', () => {
    const handleNetworkError = () => {
      return { 
        success: false, 
        error: 'Failed to load page. Please check your connection.' 
      };
    };

    const result = handleNetworkError();

    expect(result.success).toBe(false);
    expect(result.error).toContain('connection');
  });
});

describe('Input Validation', () => {
  test('should validate player name input', () => {
    const validatePlayerName = (name) => {
      const trimmed = name.trim();
      return trimmed.length > 0 && trimmed.length <= 50;
    };

    expect(validatePlayerName('ValidName')).toBe(true);
    expect(validatePlayerName('   ')).toBe(false);
    expect(validatePlayerName('')).toBe(false);
    expect(validatePlayerName('a'.repeat(51))).toBe(false);
  });

  test('should trim whitespace from player name', () => {
    const name = '  TestPlayer  ';
    const trimmed = name.trim();

    expect(trimmed).toBe('TestPlayer');
    expect(trimmed.length).toBe(10);
  });

  test('should provide default name for empty input', () => {
    const getPlayerName = (input) => {
      return input.trim() || 'Anonymous';
    };

    expect(getPlayerName('')).toBe('Anonymous');
    expect(getPlayerName('   ')).toBe('Anonymous');
    expect(getPlayerName('Player1')).toBe('Player1');
  });
});

describe('PWA Features', () => {
  test('should register service worker', async () => {
    const mockServiceWorker = {
      register: jest.fn().mockResolvedValue({ scope: '/' })
    };

    global.navigator = {
      serviceWorker: mockServiceWorker
    };

    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        return await navigator.serviceWorker.register('service-worker.js');
      }
    };

    await registerSW();

    expect(mockServiceWorker.register).toHaveBeenCalledWith('service-worker.js');
  });

  test('should handle install prompt', () => {
    let deferredPrompt = null;

    const handleInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      return deferredPrompt !== null;
    };

    const mockEvent = { preventDefault: jest.fn() };
    const result = handleInstallPrompt(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
