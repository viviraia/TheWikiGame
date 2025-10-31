const fs = require('fs');
const path = require('path');
const https = require('https');

// Extract page arrays from pages.js (ES6 module format)
function extractPageArrays() {
    const pagesJsPath = path.join(__dirname, '../../src/js/data/pages.js');
    const content = fs.readFileSync(pagesJsPath, 'utf8');
    
    // Extract popularPages array (ES6 export format)
    const popularMatch = content.match(/export const popularPages = \[([\s\S]*?)\];/);
    const obscureMatch = content.match(/export const obscurePages = \[([\s\S]*?)\];/);
    const ultraObscureMatch = content.match(/export const ultraObscurePages = \[([\s\S]*?)\];/);
    
    function extractPages(match) {
        if (!match) return [];
        const arrayContent = match[1];
        const pages = [];
        const regex = /"([^"]+)"/g;
        let pageMatch;
        while ((pageMatch = regex.exec(arrayContent)) !== null) {
            pages.push(pageMatch[1]);
        }
        return pages;
    }
    
    return {
        popular: extractPages(popularMatch),
        obscure: extractPages(obscureMatch),
        ultraObscure: extractPages(ultraObscureMatch)
    };
}

// Function to check if a Wikipedia page exists
function checkWikipediaPage(pageName) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageName)}`;
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 404) {
                    resolve({ exists: false, status: 404, pageName });
                } else if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        resolve({ exists: true, status: 200, pageName, title: json.title });
                    } catch (error) {
                        resolve({ exists: false, pageName, error: error.message });
                    }
                } else {
                    resolve({ exists: false, status: res.statusCode, pageName, error: 'Non-200 status' });
                }
            });
        }).on('error', (error) => {
            resolve({ exists: false, pageName, error: error.message });
        });
    });
}

// Batch check pages with delay to avoid rate limiting
async function checkPagesInBatches(pages, batchSize = 10, delayMs = 1000) {
    const results = [];
    const invalidPages = [];
    
    for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(page => checkWikipediaPage(page))
        );
        
        results.push(...batchResults);
        
        // Collect invalid pages
        batchResults.forEach(result => {
            if (!result.exists) {
                invalidPages.push(result);
            }
        });
        
        // Progress update
        console.log(`Checked ${Math.min(i + batchSize, pages.length)}/${pages.length} pages...`);
        
        // Delay between batches to respect rate limits
        if (i + batchSize < pages.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
    return { results, invalidPages };
}

describe('Wikipedia Page Validation', () => {
    const pageArrays = extractPageArrays();
    
    test('should extract page arrays correctly', () => {
        expect(pageArrays.popular.length).toBeGreaterThan(0);
        expect(pageArrays.obscure.length).toBeGreaterThan(0);
        expect(pageArrays.ultraObscure.length).toBeGreaterThan(0);
        
        console.log(`\nExtracted page counts:`);
        console.log(`  Popular: ${pageArrays.popular.length}`);
        console.log(`  Obscure: ${pageArrays.obscure.length}`);
        console.log(`  Ultra Obscure: ${pageArrays.ultraObscure.length}`);
        console.log(`  Total: ${pageArrays.popular.length + pageArrays.obscure.length + pageArrays.ultraObscure.length}\n`);
    });
    
    test('all popular pages should be valid Wikipedia pages', async () => {
        console.log('\nValidating popular pages...');
        const { results, invalidPages } = await checkPagesInBatches(pageArrays.popular, 5, 500);
        
        if (invalidPages.length > 0) {
            console.log('\n❌ Invalid popular pages found:');
            invalidPages.forEach(page => {
                console.log(`  - "${page.pageName}" (Status: ${page.status || 'Error'}, ${page.error || ''})`);
            });
        }
        
        const validCount = results.filter(r => r.exists).length;
        console.log(`\n✓ ${validCount}/${results.length} popular pages are valid`);
        
        expect(invalidPages.length).toBe(0);
    }, 300000); // 5 minute timeout
    
    test('all obscure pages should be valid Wikipedia pages', async () => {
        console.log('\nValidating obscure pages...');
        const { results, invalidPages } = await checkPagesInBatches(pageArrays.obscure, 5, 500);
        
        if (invalidPages.length > 0) {
            console.log('\n❌ Invalid obscure pages found:');
            invalidPages.forEach(page => {
                console.log(`  - "${page.pageName}" (Status: ${page.status || 'Error'}, ${page.error || ''})`);
            });
        }
        
        const validCount = results.filter(r => r.exists).length;
        console.log(`\n✓ ${validCount}/${results.length} obscure pages are valid`);
        
        expect(invalidPages.length).toBe(0);
    }, 300000); // 5 minute timeout
    
    test('all ultra obscure pages should be valid Wikipedia pages', async () => {
        console.log('\nValidating ultra obscure pages...');
        const { results, invalidPages } = await checkPagesInBatches(pageArrays.ultraObscure, 5, 500);
        
        if (invalidPages.length > 0) {
            console.log('\n❌ Invalid ultra obscure pages found:');
            invalidPages.forEach(page => {
                console.log(`  - "${page.pageName}" (Status: ${page.status || 'Error'}, ${page.error || ''})`);
            });
        }
        
        const validCount = results.filter(r => r.exists).length;
        console.log(`\n✓ ${validCount}/${results.length} ultra obscure pages are valid`);
        
        expect(invalidPages.length).toBe(0);
    }, 300000); // 5 minute timeout
    
    test('should not have duplicate pages across all arrays', () => {
        const allPages = [
            ...pageArrays.popular,
            ...pageArrays.obscure,
            ...pageArrays.ultraObscure
        ];
        
        const uniquePages = new Set(allPages);
        const duplicates = allPages.filter((page, index) => allPages.indexOf(page) !== index);
        
        if (duplicates.length > 0) {
            console.log('\n⚠️  Duplicate pages found:');
            [...new Set(duplicates)].forEach(page => {
                console.log(`  - "${page}"`);
            });
        }
        
        expect(allPages.length).toBe(uniquePages.size);
    });
    
    test('all page names should use underscores not spaces', () => {
        const allPages = [
            ...pageArrays.popular,
            ...pageArrays.obscure,
            ...pageArrays.ultraObscure
        ];
        
        const pagesWithSpaces = allPages.filter(page => page.includes(' '));
        
        if (pagesWithSpaces.length > 0) {
            console.log('\n❌ Pages with spaces found (should use underscores):');
            pagesWithSpaces.forEach(page => {
                console.log(`  - "${page}"`);
            });
        }
        
        expect(pagesWithSpaces.length).toBe(0);
    });
});
