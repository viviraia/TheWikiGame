/**
 * Generate pages.js from vital-articles.json
 * 
 * This script converts the vital articles JSON data into the JavaScript module
 * format expected by the game application.
 * 
 * Usage: node scripts/generate-pages-from-vital.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    INPUT_FILE: path.join(__dirname, '..', 'src', 'js', 'data', 'vital-articles.json'),
    OUTPUT_FILE: path.join(__dirname, '..', 'src', 'js', 'data', 'pages.js'),
};

/**
 * Main function
 */
function main() {
    console.log('='.repeat(60));
    console.log('Generate pages.js from vital-articles.json');
    console.log('='.repeat(60));
    
    // Read vital articles JSON
    console.log('\nReading vital articles data...');
    const vitalData = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf-8'));
    
    // Extract categories
    const easyPages = vitalData.categories.easy || [];
    const mediumPages = vitalData.categories.medium || [];
    const hardPages = vitalData.categories.hard || [];
    
    // Calculate page pools for each difficulty
    // Easy difficulty: Use level 1-3 pages
    const popularPages = easyPages;
    
    // Hard difficulty: Use medium-only pages (level 4 articles not in easy)
    const easySet = new Set(easyPages);
    const obscurePages = mediumPages.filter(page => !easySet.has(page));
    
    // Ultra difficulty: Use hard-only pages (level 5 articles not in medium)
    // For now, use a subset of medium pages as ultra since we don't have level 5 yet
    const mediumSet = new Set(mediumPages);
    const ultraObscurePages = hardPages.filter(page => !mediumSet.has(page));
    
    // If no ultra pages yet, create a placeholder
    if (ultraObscurePages.length === 0) {
        // Use the last portion of medium pages as ultra for now
        const splitPoint = Math.floor(obscurePages.length * 0.7);
        const ultraTemp = obscurePages.slice(splitPoint);
        obscurePages.splice(splitPoint);
        ultraObscurePages.push(...ultraTemp);
    }
    
    // Create all pages array
    const allPages = [...new Set([...popularPages, ...obscurePages, ...ultraObscurePages])];
    
    // Generate page stats
    const pageStats = {
        generated: new Date().toISOString(),
        source: 'Wikipedia Vital Articles',
        levels: {
            level1: vitalData.levels.level1?.length || 0,
            level2: vitalData.levels.level2?.length || 0,
            level3: vitalData.levels.level3?.length || 0,
            level4: vitalData.levels.level4?.length || 0,
        },
        distribution: {
            easy: popularPages.length,
            hard: obscurePages.length,
            ultra: ultraObscurePages.length,
            total: allPages.length
        },
        difficulty: {
            easy: 'Levels 1-3: Most important and well-known articles',
            hard: 'Level 4: More specialized important articles',
            ultra: 'Subset of Level 4: Expert-level articles'
        }
    };
    
    // Generate JavaScript module content
    const jsContent = `/**
 * Wikipedia pages data for The Wiki Game
 * Auto-generated from Wikipedia Vital Articles
 * Generated: ${pageStats.generated}
 * Source: ${pageStats.source}
 * 
 * Distribution:
 * - Easy (Normal Mode): ${pageStats.distribution.easy} pages
 * - Hard Mode: ${pageStats.distribution.hard} pages
 * - Ultra Mode: ${pageStats.distribution.ultra} pages
 * - Total: ${pageStats.distribution.total} unique pages
 */

// Easy difficulty - Levels 1-3: Most important and well-known articles
export const popularPages = ${JSON.stringify(popularPages, null, 2)};

// Hard difficulty - Level 4: More specialized important articles
export const obscurePages = ${JSON.stringify(obscurePages, null, 2)};

// Ultra difficulty - Subset of Level 4: Expert-level articles
export const ultraObscurePages = ${JSON.stringify(ultraObscurePages, null, 2)};

// All pages combined
export const allPages = ${JSON.stringify(allPages, null, 2)};

// Page statistics
export const pageStats = ${JSON.stringify(pageStats, null, 2)};
`;
    
    // Write to file
    fs.writeFileSync(CONFIG.OUTPUT_FILE, jsContent, 'utf-8');
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));
    console.log(`Easy (Normal Mode):  ${pageStats.distribution.easy} pages`);
    console.log(`Hard Mode:           ${pageStats.distribution.hard} pages`);
    console.log(`Ultra Mode:          ${pageStats.distribution.ultra} pages`);
    console.log('-'.repeat(60));
    console.log(`Total unique pages:  ${pageStats.distribution.total} pages`);
    
    console.log('\n' + '='.repeat(60));
    console.log(`✓ Generated: ${CONFIG.OUTPUT_FILE}`);
    console.log('='.repeat(60));
    
    console.log('\nSample Easy Pages (first 10):');
    console.log(popularPages.slice(0, 10).join(', '));
    
    console.log('\nSample Hard Pages (first 10):');
    console.log(obscurePages.slice(0, 10).join(', '));
    
    console.log('\nSample Ultra Pages (first 10):');
    console.log(ultraObscurePages.slice(0, 10).join(', '));
}

// Run the script
try {
    main();
    console.log('\n✅ Successfully generated pages.js!');
} catch (error) {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
}
