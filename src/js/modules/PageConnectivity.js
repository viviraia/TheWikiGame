/**
 * Page Connectivity Module
 * Handles Wikipedia link analysis for difficulty scoring
 */

export class PageConnectivity {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 3600000; // 1 hour
    }

    /**
     * Get cached data if available and not expired
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    /**
     * Set cache data
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Get number of incoming links (backlinks) - indicates how easy it is to reach this page
     * More backlinks = easier to find = lower difficulty
     */
    async getBacklinkCount(pageTitle) {
        const cacheKey = `backlinks:${pageTitle}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://en.wikipedia.org/w/api.php?` +
                `action=query&` +
                `list=backlinks&` +
                `bltitle=${encodeURIComponent(pageTitle)}&` +
                `bllimit=500&` +
                `blnamespace=0&` + // Only count main namespace (articles)
                `format=json&` +
                `origin=*`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            const backlinks = data.query?.backlinks || [];
            const count = backlinks.length;
            
            // Check if there are more results
            const hasMore = 'continue' in data;
            
            // Estimate total if we hit the limit
            const estimatedTotal = hasMore ? count * 2 : count;
            
            const result = {
                count,
                estimatedTotal,
                hasMore
            };
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error(`Error fetching backlinks for ${pageTitle}:`, error);
            return { count: 100, estimatedTotal: 100, hasMore: false }; // Default fallback
        }
    }

    /**
     * Get number of outgoing links - indicates how connected this page is
     */
    async getOutgoingLinkCount(pageTitle) {
        const cacheKey = `outlinks:${pageTitle}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://en.wikipedia.org/w/api.php?` +
                `action=query&` +
                `titles=${encodeURIComponent(pageTitle)}&` +
                `prop=links&` +
                `pllimit=500&` +
                `plnamespace=0&` + // Only count main namespace
                `format=json&` +
                `origin=*`;
            
            const response = await fetch(url);
            const data = await response.json();
            const pages = data.query?.pages || {};
            const pageId = Object.keys(pages)[0];
            
            if (pageId === '-1') {
                return { count: 0 };
            }
            
            const links = pages[pageId].links || [];
            const result = { count: links.length };
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error(`Error fetching outgoing links for ${pageTitle}:`, error);
            return { count: 50 }; // Default fallback
        }
    }

    /**
     * Get page views for popularity metric
     */
    async getPageViews(pageTitle, days = 30) {
        const cacheKey = `views:${pageTitle}:${days}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const formatDate = (date) => {
                return date.toISOString().slice(0, 10).replace(/-/g, '');
            };
            
            const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
                `en.wikipedia/all-access/all-agents/${encodeURIComponent(pageTitle)}/` +
                `daily/${formatDate(startDate)}/${formatDate(endDate)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.items) {
                return { total: 10000, average: 333 }; // Default fallback
            }
            
            const totalViews = data.items.reduce((sum, item) => sum + item.views, 0);
            const result = {
                total: totalViews,
                average: Math.round(totalViews / data.items.length)
            };
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error(`Error fetching page views for ${pageTitle}:`, error);
            return { total: 10000, average: 333 }; // Default fallback
        }
    }

    /**
     * Calculate comprehensive difficulty score
     * Combines popularity (views) and connectivity (backlinks)
     * 
     * @returns {number} Difficulty score from 1.0 (easy) to 4.0 (very hard)
     */
    async calculateDifficulty(startPage, targetPage) {
        try {
            const [targetViews, targetBacklinks, startBacklinks] = await Promise.all([
                this.getPageViews(targetPage),
                this.getBacklinkCount(targetPage),
                this.getBacklinkCount(startPage)
            ]);
            
            // Popularity factor (lower views = harder)
            // Use log scale because views vary by orders of magnitude
            const popularityScore = Math.log10(targetViews.average + 10);
            
            // Connectivity factor (fewer backlinks = harder to reach)
            const connectivityScore = Math.log10(targetBacklinks.estimatedTotal + 10);
            
            // Combined score (higher score = easier page)
            const easeScore = popularityScore + connectivityScore;
            
            // Convert to difficulty (invert and scale to 1-4 range)
            // Most popular pages: ~3 + ~3 = 6 ease score -> 1.0 difficulty
            // Least popular pages: ~1 + ~1 = 2 ease score -> 4.0 difficulty
            const difficulty = Math.max(1.0, Math.min(4.0, 7 - easeScore));
            
            return {
                difficulty: Number(difficulty.toFixed(2)),
                metrics: {
                    targetViews: targetViews.average,
                    targetBacklinks: targetBacklinks.estimatedTotal,
                    startBacklinks: startBacklinks.estimatedTotal,
                    popularityScore: popularityScore.toFixed(2),
                    connectivityScore: connectivityScore.toFixed(2)
                }
            };
        } catch (error) {
            console.error('Error calculating difficulty:', error);
            return {
                difficulty: 2.0,
                metrics: {
                    targetViews: 0,
                    targetBacklinks: 0,
                    startBacklinks: 0,
                    popularityScore: 0,
                    connectivityScore: 0
                }
            };
        }
    }

    /**
     * Batch fetch connectivity data for multiple pages
     * Used during page selection/generation
     */
    async batchGetConnectivity(pageNames) {
        const results = [];
        
        // Process in batches of 5 to avoid rate limiting
        for (let i = 0; i < pageNames.length; i += 5) {
            const batch = pageNames.slice(i, i + 5);
            const batchResults = await Promise.all(
                batch.map(async (pageName) => {
                    const [views, backlinks] = await Promise.all([
                        this.getPageViews(pageName, 30),
                        this.getBacklinkCount(pageName)
                    ]);
                    
                    return {
                        page: pageName,
                        views: views.average,
                        backlinks: backlinks.estimatedTotal,
                        score: Math.log10(views.average + 10) + Math.log10(backlinks.estimatedTotal + 10)
                    };
                })
            );
            
            results.push(...batchResults);
            
            // Small delay between batches
            if (i + 5 < pageNames.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        return results;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}
