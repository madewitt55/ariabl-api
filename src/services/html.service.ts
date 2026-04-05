import { Parser } from 'htmlparser2';

// Void elements can not have children and only consist of an open tag
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    tagName: string; // ex. h1, h2, div
    innerText: string; // ex. <h1> INNER TEXT </h1>
    attributes: Record<string, string>; // ex. <h1 attr="attr"></h1>
    error: 'UNCLOSED' | 'SELF_CLOSING' | 'NOT_SELF_CLOSING' | 'OPRHANED_CLOSE' | null;
};

/**
 * Parses serailized HTML `html` and returns an array of tags and their information
 * 
 * Every open tag and self-closing tag is added to the array. Orphaned closers are
 * also added, tagged with their respective error
 * 
 * @param html {string} - Serialized HTML
 * @returns {Tag[]} returns an array of `html`'s tags in order
 */
export function parseHtmlTags(html: string) {
    const stack: Tag[] = [];
    const tags: Tag[] = [];

    const parser = new Parser({
        // Runs for each open tag
        onopentag(name: string, attribs: Record<string, string>) {
            const tag: Tag = {
                tagName: name,
                innerText: '',
                attributes: attribs,
                error: null
            }
            const rawTag: string = html.slice(parser.startIndex, parser.endIndex + 1);
            const isSelfClosing: boolean = rawTag.endsWith('/>');

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
        // Runs for each segment of text
        ontext(text: string) {
            const parent = stack[stack.length - 1];
            if (parent) {
                // Add text to parent tag
                parent.innerText += text;
            }
        },
        // Runs for each close tag
        onclosetag(name: string) {
            if (VOID_ELEMENTS.has(name)) return;

            const topStack: Tag | undefined = stack.pop();
            if (topStack) {
                if (topStack.tagName !== name) {
                    topStack.error = 'UNCLOSED';
                }
            } else {
                // No corresponding opening tag: orphaned close
                tags.push({ tagName: name, innerText: '', attributes: {}, error: 'OPRHANED_CLOSE' });
            }
        }
    }, { xmlMode: true });

    parser.write(html);
    parser.end();

    return tags;
}
