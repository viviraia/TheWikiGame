/**
 * Leaderboard Scoring Module
 * Handles all score calculation and difficulty estimation
 */

import { PageConnectivity } from './PageConnectivity.js';

export class ScoringSystem {
    constructor() {
        this.connectivity = new PageConnectivity();
    }
    /**
     * Calculate score with dynamic difficulty-adjusted efficiency rating
     * @param {number} clicks - Number of clicks
     * @param {number} timeInSeconds - Time taken in seconds
     * @param {string} startPage - Start page name
     * @param {string} targetPage - Target page name
     * @param {boolean} useAPI - Whether to use Wikipedia API
     * @returns {Promise<number>} - Calculated score
     */
    async calculateScore(clicks, timeInSeconds, startPage = '', targetPage = '', useAPI = true) {
        const clickEfficiency = 1000 / Math.max(clicks, 1);
        const timeBonus = this.calculateTimeBonus(clicks, timeInSeconds);
        const difficulty = await this.estimateDifficulty(startPage, targetPage, useAPI);
        
        return Math.round(clickEfficiency * difficulty * timeBonus);
    }

    /**
     * Calculate dynamic time bonus
     * @param {number} clicks - Number of clicks
     * @param {number} timeInSeconds - Time in seconds
     * @returns {number} - Time bonus multiplier (1.0 to 3.0)
     */
    calculateTimeBonus(clicks, timeInSeconds) {
        const expectedTime = clicks * 15;
        const speedRatio = expectedTime / Math.max(timeInSeconds, 1);
        
        if (speedRatio >= 2.0) return 3.0;
        else if (speedRatio >= 1.5) return 2.0;
        else if (speedRatio >= 1.2) return 1.5;
        else if (speedRatio >= 1.0) return 1.2;
        else if (speedRatio >= 0.8) return 1.0;
        else return 0.8;
    }

    /**
     * Estimate route difficulty using real-time Wikipedia API data
     * Combines popularity (views) and connectivity (backlinks)
     * @param {string} startPage - Start page name
     * @param {string} targetPage - Target page name
     * @param {boolean} useAPI - Whether to use Wikipedia API (deprecated, always true)
     * @returns {Promise<number>} - Difficulty multiplier (1.0 to 4.0)
     */
    async estimateDifficulty(startPage, targetPage, useAPI = true) {
        try {
            // Use real-time connectivity and popularity data
            const result = await this.connectivity.calculateDifficulty(startPage, targetPage);
            
            console.log(`Difficulty calculation for ${startPage} → ${targetPage}:`, {
                difficulty: result.difficulty,
                targetViews: result.metrics.targetViews,
                targetBacklinks: result.metrics.targetBacklinks
            });
            
            return result.difficulty;
        } catch (error) {
            console.error('Error in API difficulty estimation:', error);
            // Return a default difficulty on error
            return 2.0;
        }
    }

    /**
     * Format time for display
     * @param {number} seconds - Seconds
     * @returns {string} - Formatted time (MM:SS)
     */
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}
