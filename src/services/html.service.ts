import { parse } from 'node-html-parser';

// Void elements must not be closed
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    name: string;
    isVoid: boolean;
    isClosed: boolean;
};

/**
 * Parses and returns all tags in serialized html
 * 
 * @param {string} html - HTML serialized into a string
 * @returns {Tag[]} - Array of tags in `html`
 */
export function parseHtmlTags(html: string): Tag[] {
    const root = parse(html);
    return root.querySelectorAll('*').map(node => {
        const name = node.tagName.toLowerCase();
        let isClosed: boolean = true; // Void tags are 'closed' by default
        const isVoid: boolean = VOID_ELEMENTS.has(name);
        if (!isVoid) {
            isClosed = html.includes(`</${name}>`);
        }

        return { name, isVoid, isClosed };
    });
}
