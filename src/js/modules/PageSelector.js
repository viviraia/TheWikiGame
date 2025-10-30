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
                return [...this.pages.popular, ...this.pages.obscure, ...this.pages.ultra];
            case 'hard':
                return [...this.pages.popular, ...this.pages.obscure];
            default:
                return this.pages.popular;
        }
    }

    /**
     * Create weighted page selection based on difficulty mode
     * @param {string} mode - Game mode
     * @returns {Array} - Weighted page pool
     */
    createWeightedPool(mode) {
        const pagePool = this.getPagePool(mode);
        
        switch (mode) {
            case 'normal':
                return this._weightedSelection(pagePool, {
                    popular: 95,
                    obscure: 4,
                    ultra: 1
                });
            case 'hard':
                return this._weightedSelection(pagePool, {
                    popular: 15,
                    obscure: 80,
                    ultra: 5
                });
            case 'ultra':
                return this._weightedSelection(pagePool, {
                    popular: 5,
                    obscure: 15,
                    ultra: 80
                });
            default:
                return pagePool;
        }
    }

    /**
     * Internal method to create weighted selections
     * @param {Array} pagePool - Full page pool
     * @param {Object} weights - Weight percentages
     * @returns {Array} - Weighted pool
     */
    _weightedSelection(pagePool, weights) {
        const availablePopular = pagePool.filter(p => this.pages.popular.includes(p));
        const availableObscure = pagePool.filter(p => this.pages.obscure.includes(p));
        const availableUltra = pagePool.filter(p => this.pages.ultra.includes(p));
        
        const weightedPool = [
            ...this._repeatRandom(availablePopular, weights.popular),
            ...this._repeatRandom(availableObscure, weights.obscure),
            ...this._repeatRandom(availableUltra, weights.ultra)
        ].filter(p => p);
        
        return weightedPool;
    }

    /**
     * Repeat random selections from array
     * @param {Array} arr - Source array
     * @param {number} count - Number of selections
     * @returns {Array} - Repeated selections
     */
    _repeatRandom(arr, count) {
        if (!arr || arr.length === 0) return [];
        
        return Array(count).fill(null).map(() => 
            arr[Math.floor(Math.random() * arr.length)]
        );
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
