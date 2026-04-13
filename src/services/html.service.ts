import { Parser } from 'htmlparser2';

// Void elements can not have children and only consist of an open tag
export const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    id: number;
    tagName: string;
    attributes: Record<string, string>;
    content: Array<string | Tag>; // ordered text nodes and child tags
    error: 'UNCLOSED' | 'SELF_CLOSING' | 'NOT_SELF_CLOSING' | null;
};

export function serializeTags(tags: Tag[]): string {
    return tags.map(serializeTag).join('');
}

function serializeTag(tag: Tag): string {
    const attrStr = Object.entries(tag.attributes)
        .map(([key, value]) => value ? `${key}="${value}"` : key)
        .join(' ');
    const opening = `<${tag.tagName}${attrStr ? ' ' + attrStr : ''}>`;

    if (VOID_ELEMENTS.has(tag.tagName)) return opening;

    const body = tag.content
        .map(c => typeof c === 'string' ? c : serializeTag(c))
        .join('');
    return `${opening}${body}</${tag.tagName}>`;
}

export function parseHtmlTags(html: string): Tag[] {
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
