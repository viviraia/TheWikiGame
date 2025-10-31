/**
 * Wikipedia API Module
 * Handles all interactions with Wikipedia's API
 */

export class WikipediaAPI {
    constructor() {
        this.baseURL = 'https://en.wikipedia.org/api/rest_v1/page/html/';
    }

    /**
     * Fetch HTML content for a Wikipedia page
     * @param {string} pageName - The Wikipedia page name
     * @returns {Promise<string>} - The HTML content
     */
    async fetchPage(pageName) {
        const apiUrl = `${this.baseURL}${encodeURIComponent(pageName)}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html; charset=utf-8; profile="https://www.mediawiki.org/wiki/Specs/HTML/2.1.0"',
                'Api-User-Agent': 'TheWikiGame/1.0 (Educational Project)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    }

    /**
     * Parse Wikipedia HTML and extract clean content
     * @param {string} html - Raw HTML from Wikipedia
     * @param {string} pageName - The page name for fallback title
     * @returns {Object} - Parsed content with title and body
     */
    parseContent(html, pageName) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Get the title
        const titleElement = tempDiv.querySelector('h1, .mw-page-title');
        const title = titleElement ? titleElement.textContent : pageName.replace(/_/g, ' ');
        
        // Get the main content
        const bodyContent = tempDiv.querySelector('body') || tempDiv;
        let content = `<h1>${title}</h1>` + bodyContent.innerHTML;
        
        return { title, content, tempDiv };
    }

    /**
     * Clean Wikipedia content (remove unwanted elements)
     * @param {HTMLElement} container - The container element
     */
    cleanContent(container) {
        // Remove edit links and other unwanted elements
        container.querySelectorAll('.mw-editsection, .mw-cite-backlink, sup.reference').forEach(el => {
            el.remove();
        });
        
        // Remove the last section (usually "See also", "References", etc.)
        const allSections = container.querySelectorAll('h2');
        if (allSections.length > 0) {
            const lastSection = allSections[allSections.length - 1];
            let currentElement = lastSection;
            while (currentElement) {
                const nextElement = currentElement.nextElementSibling;
                currentElement.remove();
                currentElement = nextElement;
                if (currentElement && currentElement.tagName === 'H2') {
                    break;
                }
            }
        }
    }

    /**
     * Extract table of contents from content
     * @param {HTMLElement} container - The content container
     * @returns {Array} - Array of headings with id, text, and level
     */
    extractTableOfContents(container) {
        const headings = container.querySelectorAll('h2, h3');
        const toc = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            const text = heading.textContent.trim();
            
            if (!text) return;
            
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            toc.push({ id: heading.id, text, level });
        });
        
        return toc;
    }

    /**
     * Extract all valid Wikipedia links from content
     * @param {HTMLElement} container - The content container
     * @returns {Array} - Array of link elements
     */
    extractLinks(container) {
        return Array.from(container.querySelectorAll('a'));
    }

    /**
     * Check if a link is a valid Wikipedia article link
     * @param {string} href - The link href
     * @returns {string|null} - The page name or null if invalid
     */
    isValidWikiLink(href) {
        if (!href) return null;
        
        // Handle REST API format (./)
        if (href.startsWith('./')) {
            const pageName = href.replace('./', '').split('#')[0];
            if (pageName && !pageName.includes(':') && pageName !== 'Main_Page') {
                return pageName;
            }
        }
        
        // Handle standard format (/wiki/)
        if (href.startsWith('/wiki/')) {
            const pageName = href.replace('/wiki/', '').split('#')[0];
            if (pageName && !pageName.includes(':') && pageName !== 'Main_Page') {
                return pageName;
            }
        }
        
        // Handle full URLs
        if (href.includes('wikipedia.org/wiki/')) {
            const match = href.match(/\/wiki\/([^#?]+)/);
            if (match) {
                const pageName = decodeURIComponent(match[1]);
                if (!pageName.includes(':') && pageName !== 'Main_Page') {
                    return pageName;
                }
            }
        }
        
        return null;
    }
}
