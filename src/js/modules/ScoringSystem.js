/**
 * Leaderboard Scoring Module
 * Handles all score calculation and difficulty estimation
 */

export class ScoringSystem {
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
     * Estimate route difficulty
     * @param {string} startPage - Start page name
     * @param {string} targetPage - Target page name
     * @param {boolean} useAPI - Whether to use Wikipedia API
     * @returns {Promise<number>} - Difficulty multiplier (0.7 to 3.0)
     */
    async estimateDifficulty(startPage, targetPage, useAPI = true) {
        const normalize = (page) => page.toLowerCase().replace(/_/g, ' ').trim();
        const start = normalize(startPage);
        const target = normalize(targetPage);
        
        const startInfo = await this.getPageMetadata(start, useAPI);
        const targetInfo = await this.getPageMetadata(target, useAPI);
        
        let baseDifficulty = this.calculateTierDifficulty(startInfo.tier, targetInfo.tier);
        baseDifficulty *= this.getCategoryRelationship(startInfo.category, targetInfo.category);
        baseDifficulty *= this.getPopularityModifier(startInfo.popularity, targetInfo.popularity);
        
        return Math.max(0.7, Math.min(3.0, baseDifficulty));
    }

    /**
     * Get page metadata
     * @param {string} pageName - Page name
     * @param {boolean} useAPI - Whether to use Wikipedia API
     * @returns {Promise<Object>} - Page metadata
     */
    async getPageMetadata(pageName, useAPI = true) {
        let category = 'unknown';
        
        if (useAPI) {
            const apiCategories = await this.fetchWikipediaCategories(pageName);
            if (apiCategories) {
                category = this.determineCategoryFromAPI(apiCategories);
            }
        }
        
        if (category === 'unknown') {
            category = this.guessCategory(pageName);
        }
        
        // Check tier from global arrays if available
        if (typeof popularPages !== 'undefined') {
            const pageUnderscore = pageName.replace(/ /g, '_');
            if (popularPages.includes(pageUnderscore)) {
                return { tier: 'easy', category, popularity: 80 };
            }
            if (typeof obscurePages !== 'undefined' && obscurePages.includes(pageUnderscore)) {
                return { tier: 'hard', category, popularity: 40 };
            }
            if (typeof ultraObscurePages !== 'undefined' && ultraObscurePages.includes(pageUnderscore)) {
                return { tier: 'expert', category, popularity: 10 };
            }
        }
        
        return { tier: 'easy', category, popularity: 50 };
    }

    /**
     * Fetch Wikipedia categories from API
     * @param {string} pageName - Page name
     * @returns {Promise<Array|null>} - Array of categories or null
     */
    async fetchWikipediaCategories(pageName) {
        try {
            const url = `https://en.wikipedia.org/w/api.php?` +
                `action=query&format=json&origin=*&` +
                `titles=${encodeURIComponent(pageName)}&` +
                `prop=categories&cllimit=50`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            const pages = data.query?.pages;
            if (!pages) return null;
            
            const pageId = Object.keys(pages)[0];
            const categories = pages[pageId]?.categories;
            
            if (!categories) return null;
            
            return categories.map(cat => cat.title.replace('Category:', ''));
        } catch (error) {
            return null;
        }
    }

    /**
     * Determine category from API categories
     * @param {Array} apiCategories - Array of category names
     * @returns {string} - Category name
     */
    determineCategoryFromAPI(apiCategories) {
        if (!apiCategories || apiCategories.length === 0) return 'unknown';
        
        const categoriesStr = apiCategories.join(' ').toLowerCase();
        
        const categoryPatterns = [
            { pattern: /\b(countries|cities|geography|continents|rivers|mountains)\b/, category: 'geography' },
            { pattern: /\b(history|historical|wars|battles|empires|dynasties)\b/, category: 'history' },
            { pattern: /\b(science|physics|chemistry|biology|mathematics)\b/, category: 'science' },
            { pattern: /\b(births|deaths|people|politicians|artists|writers)\b/, category: 'people' },
            { pattern: /\b(culture|art|music|literature|religion|philosophy)\b/, category: 'culture' },
            { pattern: /\b(astronomy|planets|stars|galaxies|space)\b/, category: 'space' },
            { pattern: /\b(technology|computing|computers|software)\b/, category: 'technology' },
            { pattern: /\b(animals|plants|nature|wildlife)\b/, category: 'nature' },
            { pattern: /\b(sports|athletes|football|basketball)\b/, category: 'sports' },
            { pattern: /\b(food|cuisine|dishes|ingredients)\b/, category: 'food' },
            { pattern: /\b(films|movies|television|books)\b/, category: 'media' },
            { pattern: /\b(buildings|monuments|landmarks)\b/, category: 'landmarks' },
            { pattern: /\b(mythology|mythological|deities|gods)\b/, category: 'mythology' }
        ];
        
        for (const { pattern, category } of categoryPatterns) {
            if (categoriesStr.match(pattern)) return category;
        }
        
        return 'unknown';
    }

    /**
     * Guess category from page name
     * @param {string} pageName - Page name
     * @returns {string} - Category name
     */
    guessCategory(pageName) {
        const normalized = pageName.toLowerCase();
        
        const patterns = [
            { pattern: /\b(country|city|state|river|mountain|ocean)\b/, category: 'geography' },
            { pattern: /\b(war|battle|empire|dynasty|revolution)\b/, category: 'history' },
            { pattern: /\b(physics|chemistry|biology|mathematics)\b/, category: 'science' },
            { pattern: /\b(art|music|literature|philosophy|religion)\b/, category: 'culture' },
            { pattern: /\b(planet|star|galaxy|moon|sun)\b/, category: 'space' },
            { pattern: /\b(computer|internet|technology|software)\b/, category: 'technology' },
            { pattern: /\b(animal|plant|tree|flower|bird)\b/, category: 'nature' },
            { pattern: /\b(sport|football|basketball|tennis)\b/, category: 'sports' }
        ];
        
        for (const { pattern, category } of patterns) {
            if (normalized.match(pattern)) return category;
        }
        
        return 'unknown';
    }

    /**
     * Calculate difficulty based on tier combination
     * @param {string} startTier - Start page tier
     * @param {string} targetTier - Target page tier
     * @returns {number} - Difficulty multiplier
     */
    calculateTierDifficulty(startTier, targetTier) {
        const tierValues = { mega: 0.5, easy: 1.0, hard: 2.0, expert: 3.0 };
        const startValue = tierValues[startTier] || 1.0;
        const targetValue = tierValues[targetTier] || 1.0;
        
        return (startValue + targetValue) / 2;
    }

    /**
     * Get category relationship modifier
     * @param {string} cat1 - First category
     * @param {string} cat2 - Second category
     * @returns {number} - Relationship modifier
     */
    getCategoryRelationship(cat1, cat2) {
        if (cat1 === cat2) return 0.9;
        
        const relatedGroups = [
            ['geography', 'history', 'culture'],
            ['science', 'technology', 'space'],
            ['people', 'history', 'culture'],
            ['nature', 'science', 'geography'],
            ['sports', 'people', 'culture']
        ];
        
        for (const group of relatedGroups) {
            if (group.includes(cat1) && group.includes(cat2)) return 1.0;
        }
        
        return 1.2;
    }

    /**
     * Get popularity modifier
     * @param {number} startPop - Start page popularity
     * @param {number} targetPop - Target page popularity
     * @returns {number} - Popularity modifier
     */
    getPopularityModifier(startPop, targetPop) {
        const avgPop = (startPop + targetPop) / 2;
        
        if (avgPop >= 70) return 0.8;
        if (avgPop >= 50) return 1.0;
        if (avgPop >= 30) return 1.3;
        return 1.5;
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
