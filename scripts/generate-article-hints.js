/**
 * Generate Article Hints Mapping
 * Creates a mapping of articles to their Wikipedia Vital Articles subsections
 * for use in the hint system for Hard and Ultra modes.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    API_URL: 'en.wikipedia.org',
    VITAL_PAGES: {
        level4: 'Wikipedia:Vital_articles/Level/4',
        level5: 'Wikipedia:Vital_articles/Level/5',
    },
    OUTPUT_FILE: path.join(__dirname, '..', 'src', 'js', 'data', 'article-hints.json'),
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
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.error ? null : json);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Extract article titles from wikitext
 */
function extractTitles(wikitext) {
    const titles = new Set();
    const linkPattern = /\[\[([^\]|#]+?)(?:\|[^\]]+?)?\]\]/g;
    
    let match;
    while ((match = linkPattern.exec(wikitext)) !== null) {
        const title = match[1].trim();
        
        if (title.startsWith('File:') || title.startsWith('Image:') ||
            title.startsWith('Category:') || title.startsWith(':Category:') ||
            title.startsWith('Template:') || title.startsWith('Wikipedia:') ||
            title.startsWith('Help:') || title.startsWith('Portal:') ||
            title.startsWith('User:') || title.startsWith('Talk:') ||
            title.startsWith('Draft:') || title.startsWith('WP:') ||
            title.includes('#') || title.startsWith(':') || title.length < 2) {
            continue;
        }
        
        const cleanTitle = title.replace(/ /g, '_');
        if (cleanTitle && cleanTitle.length > 1) {
            titles.add(cleanTitle);
        }
    }
    
    return Array.from(titles);
}

/**
 * Extract subpages for a level
 */
function extractSubpages(wikitext, level) {
    const subpages = new Set();
    
    const patterns = [
        new RegExp(`\\[\\[(Wikipedia:Vital_articles\\/Level\\/${level}\\/[^\\]|#]+?)(?:\\|[^\\]]+?)?\\]\\]`, 'gi'),
        new RegExp(`\\[\\[([^\\]|]+?\\/Level\\/${level}\\/[^\\]|#]+?)(?:\\|[^\\]]+?)?\\]\\]`, 'gi'),
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(wikitext)) !== null) {
            const subpage = match[1].trim();
            if (subpage.includes(`Level/${level}/`)) {
                subpages.add(subpage);
            }
        }
    }
    
    const templatePattern = new RegExp(`\\{\\{(Wikipedia:Vital_articles\\/Level\\/${level}\\/[^\\}|]+?)(?:\\|[^\\}]+?)?\\}\\}`, 'gi');
    let match;
    while ((match = templatePattern.exec(wikitext)) !== null) {
        const subpage = match[1].trim();
        subpages.add(subpage);
    }
    
    // Filter out People subpages
    return Array.from(subpages).filter(subpage => 
        !subpage.toLowerCase().includes('/people')
    );
}

/**
 * Get readable category name from subpage path
 */
function getCategoryName(subpagePath) {
    const parts = subpagePath.split('/');
    const categoryPart = parts[parts.length - 1];
    
    // Convert underscores to spaces and capitalize
    return categoryPart
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
    console.log('Article Hints Generator');
    console.log('='.repeat(60));
    
    const articleHints = {
        level4: {},
        level5: {},
        timestamp: new Date().toISOString()
    };
    
    // Process Level 4
    console.log('\nProcessing Level 4...');
    const level4Data = await fetchPage(CONFIG.VITAL_PAGES.level4);
    if (level4Data?.parse?.wikitext) {
        const level4Subpages = extractSubpages(level4Data.parse.wikitext['*'], 4);
        console.log(`Found ${level4Subpages.length} Level 4 subpages`);
        
        for (const subpage of level4Subpages) {
            await sleep(CONFIG.DELAY_MS);
            
            const category = getCategoryName(subpage);
            console.log(`  Processing: ${category}...`);
            
            const subpageData = await fetchPage(subpage);
            if (subpageData?.parse?.wikitext) {
                const articles = extractTitles(subpageData.parse.wikitext['*']);
                articles.forEach(article => {
                    articleHints.level4[article] = category;
                });
                console.log(`    Added ${articles.length} articles`);
            }
        }
    }
    
    // Process Level 5
    console.log('\nProcessing Level 5...');
    const level5Data = await fetchPage(CONFIG.VITAL_PAGES.level5);
    if (level5Data?.parse?.wikitext) {
        const level5Subpages = extractSubpages(level5Data.parse.wikitext['*'], 5);
        console.log(`Found ${level5Subpages.length} Level 5 subpages`);
        
        let processed = 0;
        for (const subpage of level5Subpages) {
            await sleep(CONFIG.DELAY_MS);
            
            const category = getCategoryName(subpage);
            console.log(`  Processing: ${category}...`);
            
            const subpageData = await fetchPage(subpage);
            if (subpageData?.parse?.wikitext) {
                const articles = extractTitles(subpageData.parse.wikitext['*']);
                articles.forEach(article => {
                    articleHints.level5[article] = category;
                });
                console.log(`    Added ${articles.length} articles`);
                processed++;
                
                if (processed % 10 === 0) {
                    console.log(`  Progress: ${processed}/${level5Subpages.length} subpages`);
                }
            }
        }
    }
    
    // Save to file
    const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
        CONFIG.OUTPUT_FILE,
        JSON.stringify(articleHints, null, 2),
        'utf-8'
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));
    console.log(`Level 4 articles with hints: ${Object.keys(articleHints.level4).length}`);
    console.log(`Level 5 articles with hints: ${Object.keys(articleHints.level5).length}`);
    console.log(`\n✓ Hints saved to: ${CONFIG.OUTPUT_FILE}`);
    console.log('='.repeat(60));
}

main().catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
});
