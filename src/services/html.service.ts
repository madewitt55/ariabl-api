import { Parser } from 'htmlparser2';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Void elements can not have children and only consist of an open tag
export const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    id: number;
    tagName: string;
    attributes: Record<string, string>;
    content: Array<string | Tag>; // ordered text nodes and child tags
    error: 'UNCLOSED' | 'SELF_CLOSING' | 'NOT_SELF_CLOSING' | null;
};

export function parseHtml(html: string): Tag[] {
    const stack: Tag[] = [];
    const roots: Tag[] = [];

    let id: number = 0;
    const parser = new Parser({
        // Runs for each open tag
        onopentag(name: string, attribs: Record<string, string>) {
            const tag: Tag = {
                id: id++,
                tagName: name,
                attributes: attribs,
                content: [],
                error: null
            }

            let parent: Tag | undefined = stack.at(-1);

            const rawTag: string = html.slice(parser.startIndex, parser.endIndex + 1);
            const isSelfClosing: boolean = rawTag.endsWith('/>');

            // Void element not self closing
            if (VOID_ELEMENTS.has(name)) {
                if (!isSelfClosing) {
                    tag.error = 'NOT_SELF_CLOSING';
                }
            }
            // Non-void element self closing
            else {
                if (isSelfClosing) {
                    tag.error = 'SELF_CLOSING';
                }
                else {
                    stack.push(tag);
                }
            }

            if (parent) parent.content.push(tag);
            else roots.push(tag);
        },
        // Runs for each segment of text
        ontext(text: string) {
            const parent: Tag | undefined = stack.at(-1);
            if (parent) {
                parent.content.push(text);
            }
        },
        // Runs for each close tag
        onclosetag(name: string, isImplied: boolean) {
            if (VOID_ELEMENTS.has(name)) return;

            const topStack: Tag | undefined = stack.pop();
            if (topStack) {
                if (topStack.tagName !== name || isImplied) {
                    topStack.error = 'UNCLOSED';
                }
            }
        }
    }, { xmlMode: true });

    parser.write(html);
    parser.end();

    return roots;
}

export async function checkImageAlt(html: string): Promise<string> {
    const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        messages: [{
            role: 'user',
            content: `You are an HTML accessibility expert. Your task is to add or fix alt attributes on <img> tags.

For each <img> tag that is missing an alt attribute or has an empty alt attribute (alt=""):
1. Read the surrounding context: nearby headings, paragraphs, figure captions, and the image src filename.
2. Write a concise, descriptive alt string (under 125 characters) that conveys the meaning or purpose of the image.
3. If the image is purely decorative (spacer, background flourish, icon with adjacent visible label), keep alt="".
4. Do NOT change any other attributes or any other part of the HTML.

Return ONLY the modified HTML — no explanation, no markdown fences.

HTML:
${html}`
        }]
    });

    const content = response.content[0];
    if (content?.type !== 'text') throw new Error('Unexpected response type from Claude');

    return content.text;
}

export async function checkFormLabels(html: string): Promise<string> {
    const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        messages: [{
            role: 'user',
            content: `You are an HTML accessibility expert. Your task is to fix form label accessibility.

For each <input>, <select>, and <textarea> that has no associated <label> (via for/id pairing or wrapping element), no aria-label, and no aria-labelledby:
1. Infer appropriate label text from surrounding text, placeholder, name attribute, or field context.
2. Either wrap the element in a <label> or add an aria-label attribute — prefer wrapping with <label> when there is no visible label text nearby, and aria-label when there is.
3. For inputs with the required attribute that are missing aria-required="true", add it.
4. Do NOT change anything else in the HTML.

Return ONLY the modified HTML — no explanation, no markdown fences.

HTML:
${html}`
        }]
    });

    const content = response.content[0];
    if (content?.type !== 'text') throw new Error('Unexpected response type from Claude');

    return content.text;
}

export async function checkHeadings(html: string): Promise<string> {
    const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        messages: [{
            role: 'user',
            content: `You are an HTML accessibility expert. Your task is to fix heading hierarchy.

Inspect all heading elements (h1–h6) and correct the hierarchy so that:
1. There is exactly one <h1> representing the main page title.
2. Heading levels are sequential with no skipped levels (e.g. h1 → h2 → h3, never h1 → h3).
3. Heading levels reflect the document's outline — promote or demote headings as needed to form a logical structure.
4. Do NOT change the text content of any heading or any other part of the HTML.

Return ONLY the modified HTML — no explanation, no markdown fences.

HTML:
${html}`
        }]
    });

    const content = response.content[0];
    if (content?.type !== 'text') throw new Error('Unexpected response type from Claude');

    return content.text;
}

export async function checkLandmarks(html: string): Promise<string> {
    const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        messages: [{
            role: 'user',
            content: `You are an HTML accessibility expert. Your task is to add ARIA landmark roles.

Analyse the document structure and:
1. Ensure a <main> element (or role="main") wraps the primary content.
2. Ensure navigation blocks use <nav> or role="navigation".
3. Ensure the page header uses <header> or role="banner".
4. Ensure the page footer uses <footer> or role="contentinfo".
5. Convert generic <div> or <span> wrappers to the appropriate semantic HTML5 element where the intent is clear from class names, ids, or content.
6. Where two or more landmarks of the same type exist, add a distinct aria-label to each.
7. Do NOT change any content, text, or other attributes beyond what is necessary.

Return ONLY the modified HTML — no explanation, no markdown fences.

HTML:
${html}`
        }]
    });

    const content = response.content[0];
    if (content?.type !== 'text') throw new Error('Unexpected response type from Claude');

    return content.text;
}

export async function restructureHtml(html: string): Promise<string> {
    const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8096,
        messages: [{
            role: 'user',
            content: `Restructure the following HTML so that:
1. '<!DOCTYPE html>' is present at the top.
2. There is exactly one root element that is <html>.
3. <html> contains only <head> and <body> as direct children.
4. Metadata tags (title, meta, link, style, script) are placed inside <head>.
5. All content tags are placed inside <body>.
6. Every unclosed non-void tag is properly closed.
7. Every self-closing non-void tag (e.g. <div/>) is rewritten as an open+close pair.
8. Void elements (br, img, input, meta, link, etc.) are ALWAYS self-closed.
9. The document uses proper whitespace for readability.

Return ONLY the restructured HTML — no explanation, no markdown fences.

HTML:
${html}`
        }]
    });

    const content = response.content[0];
    if (content?.type !== 'text') throw new Error('Unexpected response type from Claude');

    return content.text;
}
