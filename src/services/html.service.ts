import { Parser } from 'htmlparser2';

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    tagName: string;
    innerText: string;
    attributes: Record<string, string>;
    error: 'UNCLOSED' | 'SELF_CLOSING' | 'NOT_SELF_CLOSING' | 'OPRHANED_CLOSER' | null;
};

export function parseHtmlTags(html: string) {
    const stack: Tag[] = [];
    const tags: Tag[] = [];

    const parser = new Parser({
        onopentag(name: string, attribs: Record<string, string>) {
            const tag: Tag = {
                tagName: name,
                innerText: '',
                attributes: attribs,
                error: null
            }
            const rawTag: string = html.slice(parser.startIndex, parser.endIndex + 1);
            const isSelfClosing: boolean = rawTag.endsWith('/>');
            const isOrphanedCloser: boolean = rawTag.startsWith('</');

            if (isOrphanedCloser) {
                // Orphaned closer, do not add to stack
                tag.error = 'OPRHANED_CLOSER';
                tags.push(tag);
                return;
            }

            if (VOID_ELEMENTS.has(name)) {
                if (!isSelfClosing) {
                    // Void tag does not close itself
                    tag.error = 'NOT_SELF_CLOSING';
                }
            }
            else if (isSelfClosing) {
                // Non-void tag closes itself
                tag.error = 'SELF_CLOSING';
            }
            else {
                // No errors, push tag to stack
                stack.push(tag);
            }

            tags.push(tag); // Push tag to tags array
        },
        ontext(text: string) {
            const parent = stack[stack.length - 1];
            if (parent) {
                // Add text to parent tag
                parent.innerText += text;
            }
        },
        onclosetag(name: string, isImplied: boolean) {
            if (VOID_ELEMENTS.has(name)) return;

            const topStack: Tag | undefined = stack.pop();
            if (topStack) {
                if (topStack.tagName !== name || isImplied) {
                    // Close tag does not match most recent open tag
                    topStack.error = 'UNCLOSED';
                }
            }
        }
    });

    parser.write(html);
    parser.end();

    return tags;
}
