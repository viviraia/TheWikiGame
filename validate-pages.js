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
                        resolve({ exists: true, status: 200, pageName, title: json.title });
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

// Check pages in batches
async function validatePages() {
    console.log('🔍 Extracting pages from app.js...\n');
    const pageArrays = extractPageArrays();
    
    console.log(`📊 Page counts:`);
    console.log(`  Popular: ${pageArrays.popular.length}`);
    console.log(`  Obscure: ${pageArrays.obscure.length}`);
    console.log(`  Ultra Obscure: ${pageArrays.ultraObscure.length}`);
    console.log(`  Total: ${pageArrays.popular.length + pageArrays.obscure.length + pageArrays.ultraObscure.length}\n`);
    
    // Check for duplicates
    console.log('🔎 Checking for duplicates...');
    const allPages = [...pageArrays.popular, ...pageArrays.obscure, ...pageArrays.ultraObscure];
    const pageCounts = {};
    const duplicates = [];
    
    allPages.forEach(page => {
        pageCounts[page] = (pageCounts[page] || 0) + 1;
        if (pageCounts[page] === 2) {
            duplicates.push(page);
        }
    });
    
    if (duplicates.length > 0) {
        console.log(`\n⚠️  Found ${duplicates.length} duplicate pages:`);
        duplicates.forEach(page => console.log(`  - "${page}"`));
    } else {
        console.log('✅ No duplicates found!');
    }
    
    // Check for spaces
    console.log('\n🔎 Checking for spaces in page names...');
    const pagesWithSpaces = allPages.filter(page => page.includes(' '));
    if (pagesWithSpaces.length > 0) {
        console.log(`\n❌ Found ${pagesWithSpaces.length} pages with spaces:`);
        pagesWithSpaces.slice(0, 20).forEach(page => console.log(`  - "${page}"`));
    } else {
        console.log('✅ No spaces found!');
    }
    
    // Sample validation - check first 10 from each category
    console.log('\n🌐 Validating sample pages from each category...\n');
    
    const sampleSize = 10;
    const samplesToCheck = {
        'Popular': pageArrays.popular.slice(0, sampleSize),
        'Obscure': pageArrays.obscure.slice(0, sampleSize),
        'Ultra Obscure': pageArrays.ultraObscure.slice(0, sampleSize)
    };
    
    for (const [category, samples] of Object.entries(samplesToCheck)) {
        console.log(`\n📝 Checking ${category} pages (first ${sampleSize}):`);
        
        for (const page of samples) {
            const result = await checkWikipediaPage(page);
            const status = result.exists ? '✅' : '❌';
            console.log(`  ${status} ${page} ${result.exists ? '' : `(${result.status || result.error})`}`);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.log('\n✨ Validation complete!');
}

// Run validation
validatePages().catch(console.error);
