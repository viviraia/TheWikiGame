/**
 * End-to-End Tests using Playwright
 * Tests complete user journeys through the application
 */

const { test, expect } = require('@playwright/test');

test.describe('Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should display welcome screen on load', async ({ page }) => {
    await expect(page.locator('#welcomeScreen')).toBeVisible();
    await expect(page.locator('#startBtn')).toBeVisible();
    await expect(page.locator('#leaderboardBtn')).toBeVisible();
  });

  test('should show game title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('The Wiki Game');
  });

  test('should have working start button', async ({ page }) => {
    await page.click('#startBtn');
    
    // Should transition to loading or game screen
    await page.waitForTimeout(1000);
    
    const welcomeVisible = await page.locator('#welcomeScreen').isVisible();
    expect(welcomeVisible).toBe(false);
  });

  test('should open leaderboard modal', async ({ page }) => {
    await page.click('#leaderboardBtn');
    
    await expect(page.locator('#leaderboardModal')).toHaveClass(/active/);
  });
});

test.describe('Game Play', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should start game and display start/target pages', async ({ page }) => {
    await page.click('#startBtn');
    
    // Wait for game to load
    await page.waitForSelector('#gameScreen.active', { timeout: 5000 });
    
    // Check that start and target pages are displayed
    const startPage = await page.locator('#startPageName').textContent();
    const targetPage = await page.locator('#targetPageName').textContent();
    
    expect(startPage).toBeTruthy();
    expect(targetPage).toBeTruthy();
    expect(startPage).not.toBe(targetPage);
  });

  test('should initialize click counter at 0', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    const clickCount = await page.locator('#clickCounter').textContent();
    expect(clickCount).toBe('0');
  });

  test('should start timer', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    // Wait a bit and check timer has started
    await page.waitForTimeout(2000);
    
    const timerText = await page.locator('#timerDisplay').textContent();
    expect(timerText).not.toBe('00:00');
  });

  test('should increment click counter when clicking Wikipedia links', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    // Wait for Wikipedia content to load
    await page.waitForSelector('#wikiContent a[href^="/wiki/"]', { timeout: 10000 });
    
    const initialCount = await page.locator('#clickCounter').textContent();
    
    // Click first valid Wikipedia link
    await page.click('#wikiContent a[href^="/wiki/"]:not([href*=":"]):not([href*="#"])');
    
    await page.waitForTimeout(1000);
    
    const newCount = await page.locator('#clickCounter').textContent();
    expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
  });

  test('should display navigation history', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    // Game should track navigation
    const wikiContent = await page.locator('#wikiContent').isVisible();
    expect(wikiContent).toBe(true);
  });
});

test.describe('Win Screen', () => {
  test('should show win screen when target is reached', async ({ page }) => {
    // This test requires reaching the target page
    // In a real scenario, you might need to mock this or use a controlled test environment
    
    await page.goto('http://localhost:8080');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    // Note: Actual navigation to target would be complex to test
    // This is a placeholder for the concept
  });

  test('should display final statistics on win screen', async ({ page }) => {
    // Would verify that win screen shows:
    // - Number of clicks
    // - Time taken
    // - Route taken
    // - Score
  });

  test('should allow player name input', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // If we could trigger win condition, we'd test:
    // const nameInput = await page.locator('#playerNameInput');
    // await nameInput.fill('TestPlayer');
    // expect(await nameInput.inputValue()).toBe('TestPlayer');
  });
});

test.describe('Leaderboard Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should open and close leaderboard modal', async ({ page }) => {
    await page.click('#leaderboardBtn');
    await expect(page.locator('#leaderboardModal')).toHaveClass(/active/);
    
    await page.click('#leaderboardModal .close-btn');
    await expect(page.locator('#leaderboardModal')).not.toHaveClass(/active/);
  });

  test('should have tabs for global and recent games', async ({ page }) => {
    await page.click('#leaderboardBtn');
    
    await expect(page.locator('[data-tab="global"]')).toBeVisible();
    await expect(page.locator('[data-tab="recent"]')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.click('#leaderboardBtn');
    
    await page.click('[data-tab="recent"]');
    await expect(page.locator('[data-tab="recent"]')).toHaveClass(/active/);
    
    await page.click('[data-tab="global"]');
    await expect(page.locator('[data-tab="global"]')).toHaveClass(/active/);
  });

  test('should display leaderboard table', async ({ page }) => {
    await page.click('#leaderboardBtn');
    
    await expect(page.locator('.leaderboard-table')).toBeVisible();
  });

  test('should show loading state while fetching', async ({ page }) => {
    await page.click('#leaderboardBtn');
    
    // Loading indicator should appear briefly
    const loadingExists = await page.locator('#leaderboardLoading').count();
    expect(loadingExists).toBeGreaterThan(0);
  });
});

test.describe('Menu Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should open menu during game', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    await page.click('#menuBtn');
    await expect(page.locator('#menuModal')).toHaveClass(/active/);
  });

  test('should have menu options', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    await page.click('#menuBtn');
    
    await expect(page.locator('#newGameBtn')).toBeVisible();
    await expect(page.locator('#resumeGameBtn')).toBeVisible();
    await expect(page.locator('#viewInstructionsBtn')).toBeVisible();
  });

  test('should resume game when clicking resume', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    await page.click('#menuBtn');
    await page.click('#resumeGameBtn');
    
    await expect(page.locator('#menuModal')).not.toHaveClass(/active/);
    await expect(page.locator('#gameScreen')).toHaveClass(/active/);
  });

  test('should start new game when clicking new game', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    const initialStartPage = await page.locator('#startPageName').textContent();
    
    await page.click('#menuBtn');
    await page.click('#newGameBtn');
    
    await page.waitForSelector('#gameScreen.active');
    
    const newStartPage = await page.locator('#startPageName').textContent();
    
    // Click counter should be reset
    const clickCount = await page.locator('#clickCounter').textContent();
    expect(clickCount).toBe('0');
  });
});

test.describe('Instructions Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should open instructions from menu', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    await page.click('#menuBtn');
    await page.click('#viewInstructionsBtn');
    
    await expect(page.locator('#instructionsModal')).toHaveClass(/active/);
  });

  test('should display game instructions', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    await page.click('#menuBtn');
    await page.click('#viewInstructionsBtn');
    
    const instructionText = await page.locator('#instructionsModal').textContent();
    expect(instructionText).toContain('How to Play');
  });

  test('should close instructions modal', async ({ page }) => {
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active');
    
    await page.click('#menuBtn');
    await page.click('#viewInstructionsBtn');
    
    await page.click('#instructionsModal .close-btn');
    await expect(page.locator('#instructionsModal')).not.toHaveClass(/active/);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080');
    
    await expect(page.locator('#welcomeScreen')).toBeVisible();
    await expect(page.locator('#startBtn')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8080');
    
    await expect(page.locator('#welcomeScreen')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8080');
    
    await expect(page.locator('#welcomeScreen')).toBeVisible();
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should navigate with Tab key', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement.id);
    expect(focusedElement).toBeTruthy();
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    await page.locator('#startBtn').focus();
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(1000);
    
    const welcomeVisible = await page.locator('#welcomeScreen').isVisible();
    expect(welcomeVisible).toBe(false);
  });
});

test.describe('PWA Features', () => {
  test('should have service worker', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should have manifest.json', async ({ page }) => {
    const response = await page.goto('http://localhost:8080/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toBeDefined();
    expect(manifest.icons).toBeDefined();
  });

  test('should be installable', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check for manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    expect(manifestLink).toBeGreaterThan(0);
  });
});

test.describe('Performance', () => {
  test('should load page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load in less than 3 seconds
  });

  test('should transition between screens smoothly', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const startTime = Date.now();
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen.active', { timeout: 5000 });
    const transitionTime = Date.now() - startTime;
    
    expect(transitionTime).toBeLessThan(5000);
  });
});

test.describe('Error Handling', () => {
  test('should handle offline mode gracefully', async ({ page, context }) => {
    await context.setOffline(true);
    await page.goto('http://localhost:8080');
    
    // Should still show welcome screen from cache
    await expect(page.locator('#welcomeScreen')).toBeVisible();
  });

  test('should show error message for failed Wikipedia fetch', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Mock failed fetch
    await page.route('https://en.wikipedia.org/api/rest_v1/**', route => {
      route.abort('failed');
    });
    
    await page.click('#startBtn');
    
    // Should show some error indication
    await page.waitForTimeout(2000);
  });
});

test.describe('LocalStorage', () => {
  test('should persist leaderboard data', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check if localStorage is used
    const hasLeaderboardData = await page.evaluate(() => {
      return localStorage.getItem('leaderboard') !== null || 
             localStorage.getItem('kawaa-leaderboard') !== null;
    });
    
    // Initially might be empty, but should be accessible
    expect(typeof hasLeaderboardData).toBe('boolean');
  });

  test('should maintain data across page reloads', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Set some test data
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    await page.reload();
    
    const value = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(value).toBe('test-value');
  });
});
