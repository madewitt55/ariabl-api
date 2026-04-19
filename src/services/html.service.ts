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

export async function restructureHtml(html: string): Promise<string> {
    const response = await client.messages.create({
        model: 'claude-opus-4-6',
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
