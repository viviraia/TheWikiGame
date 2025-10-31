/**
 * Fetch Wikipedia Vital Articles Script
 * 
 * This script fetches Wikipedia's Vital Articles and categorizes them by difficulty:
 * - Easy: Levels 1-3 (most important articles)
 * - Medium: Levels 1-4 (previous + level 4)
 * - Hard: Levels 1-5 (all vital articles)
 * 
 * Usage: node scripts/fetch-vital-articles.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    // Wikipedia API endpoint
    API_URL: 'en.wikipedia.org',
    
    // Vital Articles pages by level
    VITAL_PAGES: {
        level1: 'Wikipedia:Vital_articles/Level/1',
        level2: 'Wikipedia:Vital_articles/Level/2',
        level3: 'Wikipedia:Vital_articles/Level/3',
        level4: 'Wikipedia:Vital_articles/Level/4', // Main page that links to subpages
        level5: 'Wikipedia:Vital_articles/Level/5', // Main page that links to subpages
    },
    
    // Output file
    OUTPUT_FILE: path.join(__dirname, '..', 'src', 'js', 'data', 'vital-articles.json'),
    
    // Delay between API calls (milliseconds)
    DELAY_MS: 500,
};

/**
 * Fetch a page from Wikipedia API
 */
function fetchPage(title) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            action: 'parse',
            page: title,
            format: 'json',
            prop: 'wikitext'
        });
        
        const options = {
            hostname: CONFIG.API_URL,
            path: `/w/api.php?${params.toString()}`,
            method: 'GET',
            headers: {
                'User-Agent': 'WikiGame/1.0 (Educational Project)'
            }
        };
        
        https.get(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) {
                        reject(new Error(json.error.info));
                    } else {
                        resolve(json);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Extract article titles from wikitext
 * Looks for patterns like [[Article Title]] or [[Article_Title|Display Name]]
 */
function extractTitles(wikitext) {
    const titles = new Set();
    
    // Match [[Article]] or [[Article|Display Name]]
    // Exclude files, categories, templates, and Wikipedia namespace
    const linkPattern = /\[\[([^\]|#]+?)(?:\|[^\]]+?)?\]\]/g;
    
    let match;
    while ((match = linkPattern.exec(wikitext)) !== null) {
        const title = match[1].trim();
        
        // Skip special pages and namespaces
        if (title.startsWith('File:') ||
            title.startsWith('Image:') ||
            title.startsWith('Category:') ||
            title.startsWith(':Category:') ||
            title.startsWith('Template:') ||
            title.startsWith('Wikipedia:') ||
            title.startsWith('Wikipedia_talk:') ||
            title.startsWith('Help:') ||
            title.startsWith('Portal:') ||
            title.startsWith('User:') ||
            title.startsWith('user:') ||
            title.startsWith('Talk:') ||
            title.startsWith('Draft:') ||
            title.startsWith('WP:') ||
            title.startsWith('meta:') ||
            title.includes('#') ||
            title.startsWith(':') ||
            title.length < 2) {
            continue;
        }
        
        // Clean up the title
        const cleanTitle = title.replace(/ /g, '_');
        if (cleanTitle && cleanTitle.length > 1) {
            titles.add(cleanTitle);
        }
    }
    
    return Array.from(titles);
}

/**
 * Extract subpage links from Level 4 main page
 * Looks for links to Wikipedia:Vital_articles/Level/4/...
 * Excludes the People subpage
 */
function extractLevel4Subpages(wikitext) {
    const subpages = new Set();
    
    // Try multiple patterns to catch different link formats
    const patterns = [
        /\[\[(Wikipedia:Vital_articles\/Level\/4\/[^\]|#]+?)(?:\|[^\]]+?)?\]\]/gi,
        /\[\[([^\]|]+?\/Level\/4\/[^\]|#]+?)(?:\|[^\]]+?)?\]\]/gi,
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(wikitext)) !== null) {
            const subpage = match[1].trim();
            if (subpage.includes('Level/4/')) {
                subpages.add(subpage);
            }
        }
    }
    
    // Also look for transcluded templates that might contain article lists
    // Pattern: {{Wikipedia:Vital articles/Level/4/...}}
    const templatePattern = /\{\{(Wikipedia:Vital_articles\/Level\/4\/[^\}|]+?)(?:\|[^\}]+?)?\}\}/gi;
    let match;
    while ((match = templatePattern.exec(wikitext)) !== null) {
        const subpage = match[1].trim();
        subpages.add(subpage);
    }
    
    // Filter out People subpage
    const filtered = Array.from(subpages).filter(subpage => 
        !subpage.toLowerCase().includes('/people')
    );
    
    return filtered;
}

/**
 * Extract subpage links from Level 5 main page
 * Looks for links to Wikipedia:Vital_articles/Level/5/...
 * Excludes the People subpage
 */
function extractLevel5Subpages(wikitext) {
    const subpages = new Set();
    
    // Try multiple patterns to catch different link formats
    const patterns = [
        /\[\[(Wikipedia:Vital_articles\/Level\/5\/[^\]|#]+?)(?:\|[^\]]+?)?\]\]/gi,
        /\[\[([^\]|]+?\/Level\/5\/[^\]|#]+?)(?:\|[^\]]+?)?\]\]/gi,
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(wikitext)) !== null) {
            const subpage = match[1].trim();
            if (subpage.includes('Level/5/')) {
                subpages.add(subpage);
            }
        }
    }
    
    // Also look for transcluded templates that might contain article lists
    // Pattern: {{Wikipedia:Vital articles/Level/5/...}}
    const templatePattern = /\{\{(Wikipedia:Vital_articles\/Level\/5\/[^\}|]+?)(?:\|[^\}]+?)?\}\}/gi;
    let match;
    while ((match = templatePattern.exec(wikitext)) !== null) {
        const subpage = match[1].trim();
        subpages.add(subpage);
    }
    
    // Filter out People subpage
    const filtered = Array.from(subpages).filter(subpage => 
        !subpage.toLowerCase().includes('/people')
    );
    
    return filtered;
}

/**
 * Fetch articles for a specific level
 */
async function fetchLevel(levelName, pageTitle) {
    console.log(`\nFetching ${levelName}...`);
    console.log(`Page: ${pageTitle}`);
    
    try {
        const data = await fetchPage(pageTitle);
        
        if (!data.parse || !data.parse.wikitext) {
            throw new Error('Invalid response from Wikipedia API');
        }
        
        const wikitext = data.parse.wikitext['*'];
        const titles = extractTitles(wikitext);
        
        console.log(`✓ Found ${titles.length} articles in ${levelName}`);
        return titles;
        
    } catch (error) {
        console.error(`✗ Error fetching ${levelName}:`, error.message);
        return [];
    }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('Wikipedia Vital Articles Fetcher');
    console.log('='.repeat(60));
    
    const results = {
        timestamp: new Date().toISOString(),
        levels: {},
        categories: {}
    };
    
    // Fetch levels 1-3
    for (const [level, pageTitle] of Object.entries(CONFIG.VITAL_PAGES)) {
        if (level === 'level4' || level === 'level5') continue; // Handle levels 4 and 5 separately
        
        const articles = await fetchLevel(level, pageTitle);
        results.levels[level] = articles;
        
        // Add delay between requests
        await sleep(CONFIG.DELAY_MS);
    }
    
    // Fetch Level 4 - discover subpages first
    console.log('\n' + '='.repeat(60));
    console.log('Fetching Level 4 (organized in subpages)...');
    console.log('='.repeat(60));
    
    try {
        // First, fetch the main Level 4 page to discover subpages
        console.log('\nFetching main Level 4 page to discover subpages...');
        const level4MainData = await fetchPage(CONFIG.VITAL_PAGES.level4);
        
        if (!level4MainData.parse || !level4MainData.parse.wikitext) {
            throw new Error('Invalid response from Wikipedia API');
        }
        
        const level4Wikitext = level4MainData.parse.wikitext['*'];
        
        // Debug: show a sample of the wikitext
        console.log(`  (Analyzing ${level4Wikitext.length} characters of wikitext...)`);
        
        const subpages = extractLevel4Subpages(level4Wikitext);
        
        console.log(`✓ Found ${subpages.length} Level 4 subpages`);
        
        if (subpages.length === 0) {
            // If no subpages found, try extracting articles directly from the main page
            console.log('  No subpages found, extracting articles from main Level 4 page...');
            const articlesFromMain = extractTitles(level4Wikitext);
            results.levels.level4 = articlesFromMain;
            console.log(`✓ Extracted ${articlesFromMain.length} articles from main page`);
        } else {
            // Show first few subpages found
            if (subpages.length > 0) {
                console.log(`  Sample subpages: ${subpages.slice(0, 3).join(', ')}...`);
            }
            
            // Fetch each subpage
            const level4Articles = new Set();
            let fetchedCount = 0;
            
            for (const subpage of subpages) {
                try {
                    await sleep(CONFIG.DELAY_MS);
                    
                    const subpageData = await fetchPage(subpage);
                    if (subpageData.parse && subpageData.parse.wikitext) {
                        const articles = extractTitles(subpageData.parse.wikitext['*']);
                        articles.forEach(article => level4Articles.add(article));
                        fetchedCount++;
                        
                        // Show progress every 5 subpages
                        if (fetchedCount % 5 === 0) {
                            console.log(`  Progress: ${fetchedCount}/${subpages.length} subpages fetched (${level4Articles.size} articles)`);
                        }
                    }
                } catch (error) {
                    console.error(`  ✗ Error fetching ${subpage}: ${error.message}`);
                }
            }
            
            results.levels.level4 = Array.from(level4Articles);
            console.log(`\n✓ Level 4 complete: ${level4Articles.size} articles from ${fetchedCount} subpages`);
        }
        
    } catch (error) {
        console.error(`\n✗ Error fetching Level 4: ${error.message}`);
        console.log('  Continuing with levels 1-3 only...');
        results.levels.level4 = [];
    }
    
    // Fetch Level 5 - discover subpages first
    console.log('\n' + '='.repeat(60));
    console.log('Fetching Level 5 (organized in subpages)...');
    console.log('='.repeat(60));
    
    try {
        // First, fetch the main Level 5 page to discover subpages
        console.log('\nFetching main Level 5 page to discover subpages...');
        const level5MainData = await fetchPage(CONFIG.VITAL_PAGES.level5);
        
        if (!level5MainData.parse || !level5MainData.parse.wikitext) {
            throw new Error('Invalid response from Wikipedia API');
        }
        
        const level5Wikitext = level5MainData.parse.wikitext['*'];
        
        // Debug: show a sample of the wikitext
        console.log(`  (Analyzing ${level5Wikitext.length} characters of wikitext...)`);
        
        const subpages = extractLevel5Subpages(level5Wikitext);
        
        console.log(`✓ Found ${subpages.length} Level 5 subpages`);
        
        if (subpages.length === 0) {
            // If no subpages found, try extracting articles directly from the main page
            console.log('  No subpages found, extracting articles from main Level 5 page...');
            const articlesFromMain = extractTitles(level5Wikitext);
            results.levels.level5 = articlesFromMain;
            console.log(`✓ Extracted ${articlesFromMain.length} articles from main page`);
        } else {
            // Show first few subpages found
            if (subpages.length > 0) {
                console.log(`  Sample subpages: ${subpages.slice(0, 3).join(', ')}...`);
            }
            
            // Fetch each subpage
            const level5Articles = new Set();
            let fetchedCount = 0;
            
            console.log(`  This will take a while (~${Math.round(subpages.length * CONFIG.DELAY_MS / 1000)} seconds)...`);
            
            for (const subpage of subpages) {
                try {
                    await sleep(CONFIG.DELAY_MS);
                    
                    const subpageData = await fetchPage(subpage);
                    if (subpageData.parse && subpageData.parse.wikitext) {
                        const articles = extractTitles(subpageData.parse.wikitext['*']);
                        articles.forEach(article => level5Articles.add(article));
                        fetchedCount++;
                        
                        // Show progress every 10 subpages
                        if (fetchedCount % 10 === 0) {
                            console.log(`  Progress: ${fetchedCount}/${subpages.length} subpages fetched (${level5Articles.size} articles)`);
                        }
                    }
                } catch (error) {
                    console.error(`  ✗ Error fetching ${subpage}: ${error.message}`);
                }
            }
            
            results.levels.level5 = Array.from(level5Articles);
            console.log(`\n✓ Level 5 complete: ${level5Articles.size} articles from ${fetchedCount} subpages`);
        }
        
    } catch (error) {
        console.error(`\n✗ Error fetching Level 5: ${error.message}`);
        console.log('  Continuing without Level 5...');
        results.levels.level5 = [];
    }
    
    // Create categorized lists
    const level1 = new Set(results.levels.level1 || []);
    const level2 = new Set(results.levels.level2 || []);
    const level3 = new Set(results.levels.level3 || []);
    const level4 = new Set(results.levels.level4 || []);
    const level5 = new Set(results.levels.level5 || []);
    
    // Easy: Levels 1-3
    const easyArticles = new Set([...level1, ...level2, ...level3]);
    
    // Medium: Levels 1-4
    const mediumArticles = new Set([...level1, ...level2, ...level3, ...level4]);
    
    // Hard: Levels 1-5 (all vital articles)
    const hardArticles = new Set([...level1, ...level2, ...level3, ...level4, ...level5]);
    
    // Store categorized articles
    results.categories = {
        easy: Array.from(easyArticles).sort(),
        medium: Array.from(mediumArticles).sort(),
        hard: Array.from(hardArticles).sort()
    };
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));
    console.log(`Level 1: ${level1.size} articles`);
    console.log(`Level 2: ${level2.size} articles`);
    console.log(`Level 3: ${level3.size} articles`);
    console.log(`Level 4: ${level4.size} articles`);
    console.log(`Level 5: ${level5.size} articles`);
    console.log('-'.repeat(60));
    console.log(`Easy (Levels 1-3): ${results.categories.easy.length} articles`);
    console.log(`Medium (Levels 1-4): ${results.categories.medium.length} articles`);
    console.log(`Hard (Levels 1-5): ${results.categories.hard.length} articles`);
    
    // Save to file
    const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
        CONFIG.OUTPUT_FILE,
        JSON.stringify(results, null, 2),
        'utf-8'
    );
    
    console.log('\n' + '='.repeat(60));
    console.log(`✓ Data saved to: ${CONFIG.OUTPUT_FILE}`);
    console.log('='.repeat(60));
    
    // Display sample articles from each category
    console.log('\nSample Easy Articles (first 10):');
    console.log(results.categories.easy.slice(0, 10).join(', '));
    
    console.log('\nLevel 1 Articles (Top 10 most fundamental):');
    const level1Array = Array.from(level1).filter(a => !a.includes('talk') && !a.includes('WP:'));
    console.log(level1Array.slice(0, Math.min(10, level1Array.length)).join(', '));
    
    if (level4.size > 0) {
        console.log('\nSample Medium-Only Articles (first 10 from Level 4):');
        const mediumOnly = results.categories.medium.filter(a => !easyArticles.has(a));
        console.log(mediumOnly.slice(0, Math.min(10, mediumOnly.length)).join(', '));
    }
    
    if (level5.size > 0) {
        console.log('\nSample Hard-Only Articles (first 10 from Level 5):');
        const hardOnly = results.categories.hard.filter(a => !mediumArticles.has(a));
        console.log(hardOnly.slice(0, Math.min(10, hardOnly.length)).join(', '));
    }
}

// Run the script
main().catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
});
