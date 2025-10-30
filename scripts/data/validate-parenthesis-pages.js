const fs = require('fs');
const path = require('path');
const https = require('https');

// Extract page arrays from app.js
function extractPageArrays() {
    const appJsPath = path.join(__dirname, 'app.js');
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    const popularMatch = content.match(/const popularPages = \[([\s\S]*?)\];/);
    const obscureMatch = content.match(/const obscurePages = \[([\s\S]*?)\];/);
    const ultraObscureMatch = content.match(/const ultraObscurePages = \[([\s\S]*?)\];/);
    
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

// Check if a Wikipedia page exists
function checkWikipediaPage(pageName) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageName)}`;
        
        https.get(url, {
            headers: {
                'User-Agent': 'WikiGameValidator/1.0'
            }
        }, (res) => {
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
                        resolve({ 
                            exists: true, 
                            status: 200, 
                            pageName, 
                            title: json.title,
                            actualUrl: json.content_urls?.desktop?.page || ''
                        });
                    } catch (error) {
                        resolve({ exists: false, pageName, error: error.message });
                    }
                } else {
                    resolve({ exists: false, status: res.statusCode, pageName });
                }
            });
        }).on('error', (error) => {
            resolve({ exists: false, pageName, error: error.message });
        });
    });
}

// Main validation function
async function validateParenthesisPages() {
    console.log('🔍 Extracting pages from app.js...\n');
    const pageArrays = extractPageArrays();
    
    // Find all pages with parentheses
    const allPages = [
        ...pageArrays.popular.map(p => ({ page: p, category: 'Popular' })),
        ...pageArrays.obscure.map(p => ({ page: p, category: 'Obscure' })),
        ...pageArrays.ultraObscure.map(p => ({ page: p, category: 'Ultra Obscure' }))
    ];
    
    const pagesWithParentheses = allPages.filter(item => 
        item.page.includes('(') || item.page.includes(')')
    );
    
    console.log(`📊 Found ${pagesWithParentheses.length} pages with parentheses:\n`);
    
    // Group by category
    const byCategory = {
        'Popular': pagesWithParentheses.filter(p => p.category === 'Popular'),
        'Obscure': pagesWithParentheses.filter(p => p.category === 'Obscure'),
        'Ultra Obscure': pagesWithParentheses.filter(p => p.category === 'Ultra Obscure')
    };
    
    Object.entries(byCategory).forEach(([category, items]) => {
        if (items.length > 0) {
            console.log(`  ${category}: ${items.length} pages`);
        }
    });
    
    console.log('\n🌐 Validating all pages with parentheses...\n');
    
    const invalidPages = [];
    const validPages = [];
    const suggestions = [];
    
    // Check all pages with parentheses
    for (let i = 0; i < pagesWithParentheses.length; i++) {
        const { page, category } = pagesWithParentheses[i];
        
        const result = await checkWikipediaPage(page);
        
        if (!result.exists) {
            console.log(`❌ [${category}] "${page}" - NOT FOUND (Status: ${result.status || result.error})`);
            invalidPages.push({ page, category, status: result.status, error: result.error });
            
            // Try to find the correct page by removing disambiguation
            const basePageName = page.split('_(')[0];
            if (basePageName !== page) {
                const baseResult = await checkWikipediaPage(basePageName);
                if (baseResult.exists) {
                    console.log(`   💡 Suggestion: Try "${basePageName}" instead (exists: ${baseResult.title})`);
                    suggestions.push({ 
                        original: page, 
                        suggestion: basePageName, 
                        category,
                        actualTitle: baseResult.title 
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } else {
            validPages.push({ page, category, title: result.title });
            console.log(`✅ [${category}] "${page}" → "${result.title}"`);
        }
        
        // Progress indicator
        if ((i + 1) % 10 === 0) {
            console.log(`\n   ... Checked ${i + 1}/${pagesWithParentheses.length} pages ...\n`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal pages with parentheses: ${pagesWithParentheses.length}`);
    console.log(`✅ Valid: ${validPages.length}`);
    console.log(`❌ Invalid: ${invalidPages.length}`);
    
    if (invalidPages.length > 0) {
        console.log('\n❌ INVALID PAGES:');
        console.log('-'.repeat(80));
        invalidPages.forEach(({ page, category, status, error }) => {
            console.log(`  [${category}] "${page}" (${status || error})`);
        });
    }
    
    if (suggestions.length > 0) {
        console.log('\n💡 SUGGESTIONS FOR FIXES:');
        console.log('-'.repeat(80));
        suggestions.forEach(({ original, suggestion, category, actualTitle }) => {
            console.log(`  [${category}] "${original}" → "${suggestion}" (${actualTitle})`);
        });
        
        console.log('\n📝 To apply these fixes, update app.js:');
        suggestions.forEach(({ original, suggestion }) => {
            console.log(`  Replace: "${original}" with "${suggestion}"`);
        });
    }
    
    if (invalidPages.length === 0) {
        console.log('\n✨ All pages with parentheses are valid! 🎉');
    }
    
    console.log('\n' + '='.repeat(80));
}

// Run validation
console.log('🔎 Wikipedia Parenthesis Page Validator\n');
validateParenthesisPages().catch(console.error);
