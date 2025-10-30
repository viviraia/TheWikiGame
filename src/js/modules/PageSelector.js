/**
 * Page Selector Module
 * Handles page selection logic based on game mode
 */

import { popularPages, obscurePages, ultraObscurePages } from '../data/pages.js';

export class PageSelector {
    constructor() {
        this.pages = {
            popular: popularPages,
            obscure: obscurePages,
            ultra: ultraObscurePages
        };
    }

    /**
     * Get page pool based on game mode
     * @param {string} mode - Game mode (normal, hard, ultra)
     * @returns {Array} - Array of page names
     */
    getPagePool(mode) {
        switch (mode) {
            case 'ultra':
                // Ultra mode: Only ultra-obscure pages
                return this.pages.ultra;
            case 'hard':
                // Hard mode: Only obscure pages
                return this.pages.obscure;
            default:
                // Normal mode: Only popular pages
                return this.pages.popular;
        }
    }

    /**
     * Create weighted page selection based on difficulty mode
     * @param {string} mode - Game mode
     * @returns {Array} - Weighted page pool
     */
    createWeightedPool(mode) {
        // Return only pages from the selected difficulty level
        return this.getPagePool(mode);
    }

    /**
     * Select two different random pages for a game
     * @param {string} mode - Game mode
     * @returns {Object} - {startPage, targetPage}
     */
    selectGamePages(mode) {
        const weightedPool = this.createWeightedPool(mode);
        const shuffled = [...weightedPool].sort(() => Math.random() - 0.5);
        
        let startPage = shuffled[0];
        let targetPage = shuffled[1];
        
        // Ensure different pages
        let attempts = 0;
        while (startPage === targetPage && attempts < 10) {
            targetPage = shuffled[Math.floor(Math.random() * shuffled.length)];
            attempts++;
        }
        
        return { startPage, targetPage };
    }

    /**
     * Get page tier (mega/easy/hard/expert)
     * @param {string} pageName - Page name
     * @returns {string} - Tier name
     */
    getPageTier(pageName) {
        if (this.pages.ultra.includes(pageName)) return 'expert';
        if (this.pages.obscure.includes(pageName)) return 'hard';
        if (this.pages.popular.includes(pageName)) return 'easy';
        return 'unknown';
    }
}
