/**
 * Leaderboard Manager - GitHub Gist Backend
 * Uses GitHub Gist API for global leaderboard persistence
 * Falls back to localStorage if Gist is unavailable
 */

import { ScoringSystem } from './modules/ScoringSystem.js';

export class LeaderboardManager {
    constructor(config = {}) {
        // GitHub Gist configuration
        this.gistId = config.gistId || null;
        this.githubToken = config.githubToken || null;
        
        // Fallback localStorage key
        this.storageKey = config.storageKey || 'wikiGameLeaderboard';
        
        // Cache settings
        this.cache = null;
        this.cacheExpiry = 0;
        this.cacheDuration = 30000; // 30 seconds
        
        // Rate limiting
        this.lastSubmit = 0;
        this.submitDelay = 2000; // 2 seconds between submits
        
        this.scoringSystem = new ScoringSystem();
        
        // Auto-detect config from environment or fallback
        this.useGist = !!(this.gistId && this.githubToken);
        
        if (!this.useGist) {
            console.warn('GitHub Gist not configured. Using localStorage fallback.');
        }
    }

    /**
     * Fetch leaderboard data from GitHub Gist or localStorage
     * @returns {Promise<Object>} - Leaderboard data
     */
    async fetchLeaderboard() {
        // Return cache if valid
        if (this.cache && Date.now() < this.cacheExpiry) {
            return this.cache;
        }

        // Try Gist first if configured
        if (this.useGist) {
            try {
                const apiUrl = `https://api.github.com/gists/${this.gistId}`;
                const response = await fetch(apiUrl, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                const gist = await response.json();
                const content = gist.files['leaderboard.json']?.content;
                
                if (!content) {
                    throw new Error('Leaderboard file not found in Gist');
                }

                const data = JSON.parse(content);
                
                // Update cache
                this.cache = data;
                this.cacheExpiry = Date.now() + this.cacheDuration;
                
                // Sync to localStorage as backup
                this.saveToLocalStorage(data);
                
                return data;
            } catch (error) {
                console.error('Error fetching from Gist, falling back to localStorage:', error);
                return this.fetchFromLocalStorage();
            }
        }

        // Fallback to localStorage
        return this.fetchFromLocalStorage();
    }

    /**
     * Fetch from localStorage
     * @returns {Object} - Leaderboard data
     */
    fetchFromLocalStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const parsed = data ? JSON.parse(data) : { entries: [] };
            this.cache = parsed;
            this.cacheExpiry = Date.now() + this.cacheDuration;
            return parsed;
        } catch (error) {
            console.error('Error fetching from localStorage:', error);
            return { entries: [] };
        }
    }

    /**
     * Save to localStorage
     * @param {Object} data - Leaderboard data
     */
    saveToLocalStorage(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Submit a new score to the leaderboard
     * @param {string} playerName - Player name
     * @param {string} startPage - Start page
     * @param {string} targetPage - Target page
     * @param {number} clicks - Number of clicks
     * @param {number} timeInSeconds - Time in seconds
     * @param {string} gameMode - Game mode (normal, hard, ultra)
     * @param {boolean} useAPI - Use Wikipedia API for scoring
     * @returns {Promise<Object>} - Result with success status
     */
    async submitScore(playerName, startPage, targetPage, clicks, timeInSeconds, gameMode = 'normal', useAPI = true) {
        try {
            // Rate limiting
            const now = Date.now();
            if (now - this.lastSubmit < this.submitDelay) {
                throw new Error('Please wait before submitting another score');
            }
            this.lastSubmit = now;

            // Calculate base score
            const baseScore = await this.scoringSystem.calculateScore(clicks, timeInSeconds, startPage, targetPage, useAPI);
            const difficulty = await this.scoringSystem.estimateDifficulty(startPage, targetPage, useAPI);
            
            // Apply game mode multiplier
            const modeMultipliers = {
                normal: 1.0,
                hard: 1.5,
                ultra: 2.0
            };
            const multiplier = modeMultipliers[gameMode] || 1.0;
            const score = Math.round(baseScore * multiplier);
            
            const entry = {
                playerName,
                startPage,
                targetPage,
                clicks,
                time: timeInSeconds,
                score,
                difficulty,
                gameMode,
                timestamp: Date.now()
            };
            
            // Fetch current leaderboard (bypassing cache for submit)
            this.cache = null;
            const leaderboard = await this.fetchLeaderboard();
            leaderboard.entries.push(entry);
            
            // Sort by score (descending) and limit to top 1000
            leaderboard.entries.sort((a, b) => b.score - a.score);
            leaderboard.entries = leaderboard.entries.slice(0, 1000);
            
            // Try to save to Gist
            if (this.useGist) {
                try {
                    await this.saveToGist(leaderboard);
                    console.log('Score saved to GitHub Gist');
                } catch (error) {
                    console.error('Failed to save to Gist, saved locally:', error);
                    this.saveToLocalStorage(leaderboard);
                }
            } else {
                // Save to localStorage
                this.saveToLocalStorage(leaderboard);
            }
            
            // Update cache
            this.cache = leaderboard;
            this.cacheExpiry = Date.now() + this.cacheDuration;
            
            // Find rank
            const rank = leaderboard.entries.findIndex(e => 
                e.timestamp === entry.timestamp && 
                e.playerName === entry.playerName &&
                e.score === entry.score
            ) + 1;
            
            return { success: true, entry, rank };
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save leaderboard to GitHub Gist
     * @param {Object} data - Leaderboard data
     * @returns {Promise<void>}
     */
    async saveToGist(data) {
        if (!this.useGist) {
            throw new Error('GitHub Gist not configured');
        }

        const apiUrl = `https://api.github.com/gists/${this.gistId}`;
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'leaderboard.json': {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`GitHub API error: ${response.status} - ${error.message || 'Unknown error'}`);
        }

        return await response.json();
    }

    /**
     * Get top N entries filtered by game mode
     * @param {number} limit - Maximum number of entries
     * @param {string} gameMode - Game mode filter
     * @returns {Promise<Array>} - Array of top entries
     */
    async getTopScores(limit = 10, gameMode = 'normal') {
        const leaderboard = await this.fetchLeaderboard();
        return leaderboard.entries
            .filter(entry => entry.gameMode === gameMode)
            .slice(0, limit);
    }

    /**
     * Clear cache (useful for debugging or manual refresh)
     */
    clearCache() {
        this.cache = null;
        this.cacheExpiry = 0;
    }

    /**
     * Format time for display
     * @param {number} seconds - Seconds
     * @returns {string} - Formatted time
     */
    static formatTime(seconds) {
        return ScoringSystem.formatTime(seconds);
    }
}
