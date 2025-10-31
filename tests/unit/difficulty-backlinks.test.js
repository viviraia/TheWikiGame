/**
 * Test for Backlink-Based Difficulty System
 */

describe('Backlink-Based Difficulty Calculation', () => {
    // Mock the PageConnectivity class
    class MockPageConnectivity {
        async getPageViews(pageTitle, days = 30) {
            const mockData = {
                'United_States': { total: 1500000, average: 50000 },
                'World_War_II': { total: 750000, average: 25000 },
                'Python_(programming)': { total: 240000, average: 8000 },
                'Albert_Einstein': { total: 360000, average: 12000 },
                'Quantum_mechanics': { total: 60000, average: 2000 },
                'Medieval_poet': { total: 9000, average: 300 },
                'Obscure_mathematician': { total: 2400, average: 80 },
                'Rare_species': { total: 750, average: 25 }
            };
            return mockData[pageTitle] || { total: 10000, average: 333 };
        }

        async getBacklinkCount(pageTitle) {
            const mockData = {
                'United_States': { count: 500, estimatedTotal: 15000, hasMore: true },
                'World_War_II': { count: 500, estimatedTotal: 8000, hasMore: true },
                'Python_(programming)': { count: 500, estimatedTotal: 3500, hasMore: true },
                'Albert_Einstein': { count: 500, estimatedTotal: 2000, hasMore: true },
                'Quantum_mechanics': { count: 500, estimatedTotal: 800, hasMore: true },
                'Medieval_poet': { count: 150, estimatedTotal: 150, hasMore: false },
                'Obscure_mathematician': { count: 45, estimatedTotal: 45, hasMore: false },
                'Rare_species': { count: 8, estimatedTotal: 8, hasMore: false }
            };
            return mockData[pageTitle] || { count: 100, estimatedTotal: 100, hasMore: false };
        }

        async calculateDifficulty(startPage, targetPage) {
            const [targetViews, targetBacklinks, startBacklinks] = await Promise.all([
                this.getPageViews(targetPage),
                this.getBacklinkCount(targetPage),
                this.getBacklinkCount(startPage)
            ]);
            
            const backlinksCount = targetBacklinks.estimatedTotal;
            
            // Calculate backlink difficulty on a tiered scale
            let backlinkDifficulty;
            if (backlinksCount >= 5000) {
                backlinkDifficulty = 1.0;
            } else if (backlinksCount >= 1000) {
                backlinkDifficulty = 1.0 + (5000 - backlinksCount) / 4000 * 0.5;
            } else if (backlinksCount >= 100) {
                backlinkDifficulty = 1.5 + (1000 - backlinksCount) / 900 * 1.0;
            } else if (backlinksCount >= 10) {
                backlinkDifficulty = 2.5 + (100 - backlinksCount) / 90 * 1.0;
            } else {
                backlinkDifficulty = 3.5 + (10 - backlinksCount) / 10 * 0.5;
            }
            
            const viewsCount = targetViews.average;
            let popularityModifier;
            if (viewsCount >= 10000) {
                popularityModifier = 0.0;
            } else if (viewsCount >= 1000) {
                popularityModifier = 0.2;
            } else if (viewsCount >= 100) {
                popularityModifier = 0.4;
            } else {
                popularityModifier = 0.6;
            }
            
            const difficulty = Math.max(1.0, Math.min(4.0, backlinkDifficulty + popularityModifier));
            
            return {
                difficulty: Number(difficulty.toFixed(2)),
                metrics: {
                    targetViews: targetViews.average,
                    targetBacklinks: targetBacklinks.estimatedTotal,
                    startBacklinks: startBacklinks.estimatedTotal,
                    backlinkDifficulty: backlinkDifficulty.toFixed(2),
                    popularityModifier: popularityModifier.toFixed(2)
                }
            };
        }
    }

    let connectivity;

    beforeEach(() => {
        connectivity = new MockPageConnectivity();
    });

    test('should return very easy difficulty (1.0) for highly connected pages (5000+ backlinks)', async () => {
        const result = await connectivity.calculateDifficulty('Start', 'United_States');
        
        expect(result.difficulty).toBe(1.0);
        expect(result.metrics.targetBacklinks).toBe(15000);
        expect(result.metrics.backlinkDifficulty).toBe('1.00');
        expect(result.metrics.popularityModifier).toBe('0.00');
    });

    test('should return easy difficulty (1.4) for well-connected pages (1000-5000 backlinks)', async () => {
        const result = await connectivity.calculateDifficulty('Start', 'Python_(programming)');
        
        expect(result.difficulty).toBeGreaterThanOrEqual(1.0);
        expect(result.difficulty).toBeLessThanOrEqual(1.5);
        expect(result.metrics.targetBacklinks).toBe(3500);
    });

    test('should return moderate difficulty (2.0+) for moderately connected pages (100-1000 backlinks)', async () => {
        const result = await connectivity.calculateDifficulty('Start', 'Quantum_mechanics');
        
        expect(result.difficulty).toBeGreaterThanOrEqual(1.5);
        expect(result.difficulty).toBeLessThanOrEqual(2.5);
        expect(result.metrics.targetBacklinks).toBe(800);
    });

    test('should return hard difficulty (3.0+) for poorly connected pages (10-100 backlinks)', async () => {
        const result = await connectivity.calculateDifficulty('Start', 'Obscure_mathematician');
        
        expect(result.difficulty).toBeGreaterThanOrEqual(2.5);
        expect(result.difficulty).toBeLessThanOrEqual(4.0);
        expect(result.metrics.targetBacklinks).toBe(45);
    });

    test('should return very hard difficulty (3.5-4.0) for barely connected pages (<10 backlinks)', async () => {
        const result = await connectivity.calculateDifficulty('Start', 'Rare_species');
        
        expect(result.difficulty).toBeGreaterThanOrEqual(3.5);
        expect(result.difficulty).toBeLessThanOrEqual(4.0);
        expect(result.metrics.targetBacklinks).toBe(8);
    });

    test('should prioritize backlinks over pageviews', async () => {
        // Medieval_poet: 150 backlinks, 300 views -> should be hard (2.8)
        const lowBacklinks = await connectivity.calculateDifficulty('Start', 'Medieval_poet');
        
        // Albert_Einstein: 2000 backlinks, 12000 views -> should be easy (1.5)
        const highBacklinks = await connectivity.calculateDifficulty('Start', 'Albert_Einstein');
        
        // Despite lower views, Albert Einstein should be easier due to higher backlinks
        expect(highBacklinks.difficulty).toBeLessThan(lowBacklinks.difficulty);
        expect(highBacklinks.metrics.targetBacklinks).toBeGreaterThan(lowBacklinks.metrics.targetBacklinks);
    });

    test('should apply popularity modifier correctly', async () => {
        const result = await connectivity.calculateDifficulty('Start', 'Medieval_poet');
        
        // 150 backlinks -> backlinkDifficulty ~2.4
        // 300 views -> popularityModifier 0.4
        expect(parseFloat(result.metrics.backlinkDifficulty)).toBeGreaterThan(2.0);
        expect(parseFloat(result.metrics.popularityModifier)).toBeGreaterThan(0.0);
        expect(result.difficulty).toBe(
            Math.max(1.0, Math.min(4.0, 
                parseFloat(result.metrics.backlinkDifficulty) + 
                parseFloat(result.metrics.popularityModifier)
            ))
        );
    });

    test('should cap difficulty between 1.0 and 4.0', async () => {
        const pages = ['United_States', 'Python_(programming)', 'Quantum_mechanics', 'Rare_species'];
        
        for (const page of pages) {
            const result = await connectivity.calculateDifficulty('Start', page);
            expect(result.difficulty).toBeGreaterThanOrEqual(1.0);
            expect(result.difficulty).toBeLessThanOrEqual(4.0);
        }
    });
});
