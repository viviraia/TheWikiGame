const fs = require('fs');

// Read the file
const content = fs.readFileSync('app.js', 'utf8');

// Extract the three arrays
const popularMatch = content.match(/const popularPages = \[([\s\S]*?)\];/);
const obscureMatch = content.match(/const obscurePages = \[([\s\S]*?)\];/);
const ultraObscureMatch = content.match(/const ultraObscurePages = \[([\s\S]*?)\];/);

if (!popularMatch || !obscureMatch || !ultraObscureMatch) {
    console.error('Could not find all three arrays');
    process.exit(1);
}

function extractPages(arrayText) {
    const matches = arrayText.matchAll(/"([^"]+)"/g);
    return Array.from(matches, m => m[1]);
}

let popular = extractPages(popularMatch[1]);
let obscure = extractPages(obscureMatch[1]);
let ultraObscure = extractPages(ultraObscureMatch[1]);

console.log('📊 Initial counts:');
console.log(`  Popular: ${popular.length}`);
console.log(`  Obscure: ${obscure.length}`);
console.log(`  Ultra Obscure: ${ultraObscure.length}`);
console.log(`  Total: ${popular.length + obscure.length + ultraObscure.length}`);

// Find duplicates
const allPages = new Map();
for (const page of popular) allPages.set(page, (allPages.get(page) || 0) + 1);
for (const page of obscure) allPages.set(page, (allPages.get(page) || 0) + 1);
for (const page of ultraObscure) allPages.set(page, (allPages.get(page) || 0) + 1);

const duplicates = Array.from(allPages.entries()).filter(([_, count]) => count > 1).map(([page]) => page);

console.log(`\n🔍 Found ${duplicates.length} duplicates:\n`);
duplicates.forEach(dup => console.log(`  - "${dup}"`));

// Strategy: Keep duplicates in the MOST DIFFICULT category they appear in
// Priority: Popular > Obscure > Ultra Obscure (keep in the easier category to avoid making game too hard)

const removed = { popular: [], obscure: [], ultraObscure: [] };

for (const dup of duplicates) {
    const inPopular = popular.includes(dup);
    const inObscure = obscure.includes(dup);
    const inUltraObscure = ultraObscure.includes(dup);
    
    if (inPopular) {
        // Keep in Popular, remove from others
        if (inObscure) {
            obscure = obscure.filter(p => p !== dup);
            removed.obscure.push(dup);
        }
        if (inUltraObscure) {
            ultraObscure = ultraObscure.filter(p => p !== dup);
            removed.ultraObscure.push(dup);
        }
    } else if (inObscure) {
        // Keep in Obscure, remove from Ultra Obscure
        if (inUltraObscure) {
            ultraObscure = ultraObscure.filter(p => p !== dup);
            removed.ultraObscure.push(dup);
        }
    }
}

console.log(`\n🗑️  Removed duplicates:`);
console.log(`  From Popular: ${removed.popular.length}`);
console.log(`  From Obscure: ${removed.obscure.length}`);
console.log(`  From Ultra Obscure: ${removed.ultraObscure.length}`);

console.log('\n📊 New counts:');
console.log(`  Popular: ${popular.length}`);
console.log(`  Obscure: ${obscure.length}`);
console.log(`  Ultra Obscure: ${ultraObscure.length}`);
console.log(`  Total: ${popular.length + obscure.length + ultraObscure.length}`);

// Rebuild the file
function formatArray(name, pages) {
    const lines = [];
    lines.push(`const ${name} = [`);
    
    // Group into lines of reasonable length
    let currentLine = '    ';
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const entry = `"${page}"${i < pages.length - 1 ? ', ' : ''}`;
        
        if (currentLine.length + entry.length > 100 && currentLine.trim().length > 0) {
            lines.push(currentLine);
            currentLine = '    ' + entry;
        } else {
            currentLine += entry;
        }
    }
    if (currentLine.trim().length > 4) {
        lines.push(currentLine);
    }
    lines.push('];');
    
    return lines.join('\n');
}

// Find where each array starts and ends in the original content
const popularStart = content.indexOf('const popularPages = [');
const popularEnd = content.indexOf('];', popularStart) + 2;
const obscureStart = content.indexOf('const obscurePages = [');
const obscureEnd = content.indexOf('];', obscureStart) + 2;
const ultraObscureStart = content.indexOf('const ultraObscurePages = [');
const ultraObscureEnd = content.indexOf('];', ultraObscureStart) + 2;

// Rebuild content
let newContent = content.substring(0, popularStart);
newContent += formatArray('popularPages', popular);
newContent += content.substring(popularEnd, obscureStart);
newContent += formatArray('obscurePages', obscure);
newContent += content.substring(obscureEnd, ultraObscureStart);
newContent += formatArray('ultraObscurePages', ultraObscure);
newContent += content.substring(ultraObscureEnd);

// Write back
fs.writeFileSync('app.js', newContent, 'utf8');

console.log('\n✅ File updated successfully!');
console.log('\n💡 Run "node validate-pages.js" to verify the changes.');
