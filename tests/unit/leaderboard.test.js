/**
 * Unit Tests for LeaderboardManager Class
 * Tests scoring calculation, difficulty estimation, and leaderboard operations
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load the leaderboard classes
const { LeaderboardManager, LocalLeaderboard } = require('../../leaderboard.js');

describe('LeaderboardManager', () => {
  let manager;
  const mockGistId = 'test-gist-id';
  const mockToken = 'test-token';

  beforeEach(() => {
    manager = new LeaderboardManager(mockGistId, mockToken);
    jest.clearAllMocks();
  });

  describe('Score Calculation', () => {
    test('should calculate score correctly with base formula', () => {
      const score = manager.calculateScore(5, 75, 'France', 'Germany');
      
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
      expect(Number.isFinite(score)).toBe(true);
    });

    test('should give higher score for fewer clicks', () => {
      const score1 = manager.calculateScore(3, 60, 'France', 'Germany');
      const score2 = manager.calculateScore(10, 60, 'France', 'Germany');
      
      expect(score1).toBeGreaterThan(score2);
    });

    test('should give higher score for faster completion', () => {
      const score1 = manager.calculateScore(5, 30, 'France', 'Germany');
      const score2 = manager.calculateScore(5, 120, 'France', 'Germany');
      
      expect(score1).toBeGreaterThan(score2);
    });

    test('should handle extreme values without breaking', () => {
      expect(() => {
        manager.calculateScore(1, 1, 'France', 'Germany');
      }).not.toThrow();

      expect(() => {
        manager.calculateScore(100, 3600, 'France', 'Germany');
      }).not.toThrow();
    });

    test('should return valid score for zero time (edge case)', () => {
      const score = manager.calculateScore(5, 0, 'France', 'Germany');
      expect(Number.isFinite(score)).toBe(true);
    });
  });

  describe('Time Bonus Calculation', () => {
    test('should give high bonus for very fast completion', () => {
      const bonus1 = manager.calculateTimeBonus(5, 30); // Very fast
      const bonus2 = manager.calculateTimeBonus(5, 150); // Slow
      
      expect(bonus1).toBeGreaterThan(bonus2);
      expect(bonus1).toBeGreaterThan(1.5);
    });

    test('should give medium bonus for expected time', () => {
      const expectedTime = 5 * 15; // 75 seconds
      const bonus = manager.calculateTimeBonus(5, expectedTime);
      
      expect(bonus).toBeGreaterThanOrEqual(1.0);
      expect(bonus).toBeLessThanOrEqual(2.0);
    });

    test('should give low bonus for slow completion', () => {
      const bonus = manager.calculateTimeBonus(5, 300); // Very slow
      
      expect(bonus).toBeLessThan(1.5);
      expect(bonus).toBeGreaterThanOrEqual(0.5);
    });

    test('should handle minimum time bonus', () => {
      const bonus = manager.calculateTimeBonus(5, 10000); // Extremely slow
      expect(bonus).toBeGreaterThanOrEqual(0.5);
    });

    test('should handle maximum time bonus', () => {
      const bonus = manager.calculateTimeBonus(5, 1); // Impossibly fast
      expect(bonus).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Difficulty Estimation - New Tier System', () => {
    test('should return difficulty between 0.7 and 3.0', () => {
      const difficulty = manager.estimateDifficulty('France', 'Germany');
      
      expect(difficulty).toBeGreaterThanOrEqual(0.7);
      expect(difficulty).toBeLessThanOrEqual(3.0);
    });

    test('should give lower difficulty for same tier pages', () => {
      const sameTierDiff = manager.estimateDifficulty('France', 'Germany');
      const distantDiff = manager.estimateDifficulty('France', 'Mars');
      
      expect(sameTierDiff).toBeLessThan(distantDiff);
    });

    test('should give very low difficulty for mega hub pages', () => {
      const difficulty = manager.estimateDifficulty('United_States', 'World_War_II');
      expect(difficulty).toBeLessThan(0.9); // Both mega hubs
    });

    test('should recognize easy tier pages (geography)', () => {
      const difficulty = manager.estimateDifficulty('France', 'Germany');
      expect(difficulty).toBeLessThan(1.2); // Both easy tier
    });

    test('should recognize easy tier pages (science)', () => {
      const difficulty = manager.estimateDifficulty('Physics', 'Chemistry');
      expect(difficulty).toBeLessThan(1.2); // Both easy tier, same category
    });

    test('should recognize medium tier pages', () => {
      const difficulty = manager.estimateDifficulty('Albert_Einstein', 'Isaac_Newton');
      expect(difficulty).toBeLessThan(1.5); // Both medium tier, same category
    });

    test('should give higher difficulty for hard tier pages', () => {
      const difficulty = manager.estimateDifficulty('Nikola_Tesla', 'Marie_Curie');
      expect(difficulty).toBeGreaterThan(1.5);
      expect(difficulty).toBeLessThan(2.5);
    });

    test('should give lower difficulty for popular pages', () => {
      const popularDiff = manager.estimateDifficulty('United_States', 'France');
      const obscureDiff = manager.estimateDifficulty('Unknown_Page_1', 'Unknown_Page_2');
      
      expect(popularDiff).toBeLessThan(obscureDiff);
    });

    test('should handle mixed tier combinations', () => {
      const megaToEasy = manager.estimateDifficulty('United_States', 'France');
      const easyToMedium = manager.estimateDifficulty('France', 'Albert_Einstein');
      const mediumToHard = manager.estimateDifficulty('Albert_Einstein', 'Nikola_Tesla');
      
      expect(megaToEasy).toBeLessThan(easyToMedium);
      expect(easyToMedium).toBeLessThan(mediumToHard);
    });
  });

  describe('Page Metadata System', () => {
    test('should return metadata for mega hub pages', () => {
      const metadata = manager.getPageMetadata('united states');
      
      expect(metadata.tier).toBe('mega');
      expect(metadata.category).toBe('core');
      expect(metadata.popularity).toBe(100);
    });

    test('should return metadata for easy tier pages', () => {
      const metadata = manager.getPageMetadata('france');
      
      expect(metadata.tier).toBe('easy');
      expect(metadata.category).toBe('geography');
      expect(metadata.popularity).toBe(85);
    });

    test('should return metadata for medium tier pages', () => {
      const metadata = manager.getPageMetadata('albert einstein');
      
      expect(metadata.tier).toBe('medium');
      expect(metadata.category).toBe('people');
      expect(metadata.popularity).toBe(60);
    });

    test('should return metadata for hard tier pages', () => {
      const metadata = manager.getPageMetadata('nikola tesla');
      
      expect(metadata.tier).toBe('hard');
      expect(metadata.category).toBe('people');
      expect(metadata.popularity).toBe(35);
    });

    test('should return default metadata for unknown pages', () => {
      const metadata = manager.getPageMetadata('unknown page xyz 12345');
      
      expect(metadata.tier).toBe('medium');
      expect(metadata.category).toBe('unknown');
      expect(metadata.popularity).toBe(50);
    });

    test('should handle case insensitivity', () => {
      const metadata1 = manager.getPageMetadata('FRANCE');
      const metadata2 = manager.getPageMetadata('france');
      
      expect(metadata1.tier).toBe(metadata2.tier);
      expect(metadata1.category).toBe(metadata2.category);
    });

    test('should handle underscores and spaces', () => {
      const metadata1 = manager.getPageMetadata('united_states');
      const metadata2 = manager.getPageMetadata('united states');
      
      expect(metadata1.tier).toBe(metadata2.tier);
      expect(metadata1.category).toBe(metadata2.category);
    });
  });

  describe('Tier Difficulty Calculation', () => {
    test('should give lowest difficulty for mega to mega', () => {
      const difficulty = manager.calculateTierDifficulty('mega', 'mega');
      expect(difficulty).toBe(0.7);
    });

    test('should give low difficulty for easy to easy', () => {
      const difficulty = manager.calculateTierDifficulty('easy', 'easy');
      expect(difficulty).toBe(0.9);
    });

    test('should give medium difficulty for medium to medium', () => {
      const difficulty = manager.calculateTierDifficulty('medium', 'medium');
      expect(difficulty).toBe(1.3);
    });

    test('should give high difficulty for hard to hard', () => {
      const difficulty = manager.calculateTierDifficulty('hard', 'hard');
      expect(difficulty).toBe(2.0);
    });

    test('should give highest difficulty for expert to expert', () => {
      const difficulty = manager.calculateTierDifficulty('expert', 'expert');
      expect(difficulty).toBe(2.8);
    });

    test('should handle mixed tier combinations', () => {
      const megaToEasy = manager.calculateTierDifficulty('mega', 'easy');
      const easyToMedium = manager.calculateTierDifficulty('easy', 'medium');
      const mediumToHard = manager.calculateTierDifficulty('medium', 'hard');
      
      expect(megaToEasy).toBeLessThan(easyToMedium);
      expect(easyToMedium).toBeLessThan(mediumToHard);
    });
  });

  describe('Category Relationships', () => {
    test('should give bonus for same category', () => {
      const modifier = manager.getCategoryRelationship('geography', 'geography');
      expect(modifier).toBe(0.85);
    });

    test('should recognize related category clusters', () => {
      const modifier = manager.getCategoryRelationship('geography', 'history');
      expect(modifier).toBe(0.95);
    });

    test('should handle core category connections', () => {
      const modifier = manager.getCategoryRelationship('core', 'geography');
      expect(modifier).toBe(0.90);
    });

    test('should penalize unknown categories', () => {
      const modifier = manager.getCategoryRelationship('unknown', 'geography');
      expect(modifier).toBe(1.10);
    });

    test('should handle unrelated categories', () => {
      const modifier = manager.getCategoryRelationship('science', 'culture');
      expect(modifier).toBeGreaterThan(1.0);
    });
  });

  describe('Popularity Modifiers', () => {
    test('should give bonus for high popularity pages', () => {
      const modifier = manager.getPopularityModifier(90, 90);
      expect(modifier).toBe(0.90);
    });

    test('should be neutral for medium popularity', () => {
      const modifier = manager.getPopularityModifier(50, 50);
      expect(modifier).toBe(0.95);
    });

    test('should penalize low popularity pages', () => {
      const modifier = manager.getPopularityModifier(20, 20);
      expect(modifier).toBe(1.15);
    });

    test('should handle mixed popularity levels', () => {
      const modifier = manager.getPopularityModifier(90, 20);
      expect(modifier).toBeGreaterThan(0.95);
      expect(modifier).toBeLessThan(1.15);
    });
  });

  describe('Old Category Detection Tests - Removed', () => {
    test('old category system has been replaced with tier system', () => {
      // The old findCategory, categoriesAreRelated, and categoriesAreVeryDistant
      // methods have been removed and replaced with:
      // - getPageMetadata()
      // - getCategoryRelationship()
      // - getPopularityModifier()
      expect(typeof manager.getPageMetadata).toBe('function');
      expect(typeof manager.getCategoryRelationship).toBe('function');
      expect(typeof manager.getPopularityModifier).toBe('function');
    });
  });

  describe('Leaderboard Submission', () => {
    test('should create entry with correct structure', async () => {
      const mockLeaderboard = { entries: [] };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: {
            'leaderboard.json': {
              content: JSON.stringify(mockLeaderboard)
            }
          }
        })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await manager.submitScore('TestPlayer', 'France', 'Germany', 5, 75);
      
      expect(result.success).toBe(true);
      expect(result.entry).toHaveProperty('playerName', 'TestPlayer');
      expect(result.entry).toHaveProperty('startPage', 'France');
      expect(result.entry).toHaveProperty('targetPage', 'Germany');
      expect(result.entry).toHaveProperty('clicks', 5);
      expect(result.entry).toHaveProperty('time', 75);
      expect(result.entry).toHaveProperty('score');
      expect(result.entry).toHaveProperty('difficulty');
      expect(result.entry).toHaveProperty('timestamp');
    });

    test('should maintain top 100 entries only', async () => {
      const mockEntries = Array(105).fill(null).map((_, i) => ({
        playerName: `Player${i}`,
        score: 100 - i,
        timestamp: Date.now() - i
      }));

      // First call: fetch current leaderboard
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: {
            'leaderboard.json': {
              content: JSON.stringify({ entries: mockEntries })
            }
          }
        })
      });

      // Second call: update the gist
      let submittedData;
      fetch.mockImplementationOnce(async (url, options) => {
        submittedData = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({})
        };
      });

      await manager.submitScore('NewPlayer', 'France', 'Germany', 3, 45);

      expect(submittedData).toBeDefined();
      expect(submittedData.files).toBeDefined();
      const updatedLeaderboard = JSON.parse(submittedData.files['leaderboard.json'].content);
      expect(updatedLeaderboard.entries.length).toBeLessThanOrEqual(100);
    });

    test('should handle fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await manager.submitScore('TestPlayer', 'France', 'Germany', 5, 75);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    test('should cache leaderboard data', async () => {
      const mockLeaderboard = { entries: [{ score: 100 }] };
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          files: {
            'leaderboard.json': {
              content: JSON.stringify(mockLeaderboard)
            }
          }
        })
      });

      await manager.fetchLeaderboard();
      await manager.fetchLeaderboard();

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('should refresh cache after duration', async () => {
      const mockLeaderboard = { entries: [] };
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          files: {
            'leaderboard.json': {
              content: JSON.stringify(mockLeaderboard)
            }
          }
        })
      });

      await manager.fetchLeaderboard();
      
      // Simulate cache expiration
      manager.cacheTime = Date.now() - 31000; // 31 seconds ago
      
      await manager.fetchLeaderboard();

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('LocalLeaderboard', () => {
  let localLeaderboard;

  beforeEach(() => {
    localLeaderboard = new LocalLeaderboard();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Local Storage Operations', () => {
    test('should initialize with empty leaderboard', async () => {
      // localStorage is empty by default
      const leaderboard = await localLeaderboard.fetchLeaderboard();
      
      expect(leaderboard.entries).toEqual([]);
    });

    test('should save and retrieve leaderboard', async () => {
      const mockData = { entries: [{ score: 100 }] };
      localStorage.setItem('wikiGameLeaderboard', JSON.stringify(mockData));

      const result = await localLeaderboard.fetchLeaderboard();
      
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].score).toBe(100);
    });

    test('should handle corrupted localStorage data', async () => {
      localStorage.setItem('wikiGameLeaderboard', 'invalid json{{{');

      const result = await localLeaderboard.fetchLeaderboard();
      
      expect(result.entries).toEqual([]);
    });
  });

  describe('Score Submission', () => {
    test('should submit score successfully', async () => {
      // localStorage starts empty
      const result = await localLeaderboard.submitScore('TestPlayer', 'France', 'Germany', 5, 75);
      
      expect(result.success).toBe(true);
      expect(result.entry.playerName).toBe('TestPlayer');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should calculate rank correctly', async () => {
      const existingEntries = [
        { score: 500, playerName: 'Player1' },
        { score: 300, playerName: 'Player2' }
      ];
      localStorage.setItem('wikiGameLeaderboard', JSON.stringify({ entries: existingEntries }));

      const result = await localLeaderboard.submitScore('NewPlayer', 'France', 'Germany', 5, 75);
      
      expect(result.rank).toBeGreaterThan(0);
      expect(result.rank).toBeLessThanOrEqual(3);
    });
  });

  describe('Top Scores Retrieval', () => {
    test('should return top scores', async () => {
      const entries = [
        { score: 500 },
        { score: 400 },
        { score: 300 }
      ];
      localStorage.setItem('wikiGameLeaderboard', JSON.stringify({ entries }));

      const topScores = await localLeaderboard.getTopScores(2);
      
      expect(topScores).toHaveLength(2);
      expect(topScores[0].score).toBe(500);
    });

    test('should handle empty leaderboard', async () => {
      // localStorage starts empty
      const topScores = await localLeaderboard.getTopScores(10);
      
      expect(topScores).toEqual([]);
    });
  });

  describe('Recent Games', () => {
    test('should return sorted scores', async () => {
      const now = Date.now();
      const entries = [
        { score: 300, timestamp: now - 1000, id: '1' },
        { score: 200, timestamp: now - 2000, id: '2' },
        { score: 100, timestamp: now - 3000, id: '3' }
      ];
      localStorage.setItem('wikiGameLeaderboard', JSON.stringify({ entries }));

      const topScores = await localLeaderboard.getTopScores(10);
      
      // Should be sorted by score (highest first)
      expect(topScores[0].score).toBe(300);
      expect(topScores[1].score).toBe(200);
      expect(topScores[2].score).toBe(100);
    });
  });

  describe('Time Formatting', () => {
    test('should format time correctly', () => {
      expect(LocalLeaderboard.formatTime(0)).toBe('00:00');
      expect(LocalLeaderboard.formatTime(59)).toBe('00:59');
      expect(LocalLeaderboard.formatTime(60)).toBe('01:00');
      expect(LocalLeaderboard.formatTime(125)).toBe('02:05');
      expect(LocalLeaderboard.formatTime(3661)).toBe('61:01');
    });
  });
});

