/**
 * Leaderboard Manager - Refactored
 * Uses LocalStorage for data persistence
 */

import { ScoringSystem } from './modules/ScoringSystem.js';

export class LeaderboardManager {
    constructor(storageKey = 'wikiGameLeaderboard') {
        this.storageKey = storageKey;
        this.scoringSystem = new ScoringSystem();
    }

    /**
     * Fetch leaderboard data from localStorage
     * @returns {Promise<Object>} - Leaderboard data
     */
    async fetchLeaderboard() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { entries: [] };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return { entries: [] };
        }
    }

    /**
     * Submit a new score to the leaderboard
     * @param {string} playerName - Player name
     * @param {string} startPage - Start page
     * @param {string} targetPage - Target page
     * @param {number} clicks - Number of clicks
     * @param {number} timeInSeconds - Time in seconds
     * @param {string} gameMode - Game mode
     * @param {boolean} useAPI - Use Wikipedia API for scoring
     * @returns {Promise<Object>} - Result with success status
     */
    async submitScore(playerName, startPage, targetPage, clicks, timeInSeconds, gameMode = 'normal', useAPI = true) {
        try {
            const score = await this.scoringSystem.calculateScore(clicks, timeInSeconds, startPage, targetPage, useAPI);
            const difficulty = await this.scoringSystem.estimateDifficulty(startPage, targetPage, useAPI);
            
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
            
            const leaderboard = await this.fetchLeaderboard();
            leaderboard.entries.push(entry);
            
            // Sort by score (descending)
            leaderboard.entries.sort((a, b) => b.score - a.score);
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(leaderboard));
            
            // Find rank
            const rank = leaderboard.entries.findIndex(e => e === entry) + 1;
            
            return { success: true, entry, rank };
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
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
     * Format time for display
     * @param {number} seconds - Seconds
     * @returns {string} - Formatted time
     */
    static formatTime(seconds) {
        return ScoringSystem.formatTime(seconds);
    }
}
