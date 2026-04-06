import { Parser } from 'htmlparser2';

// Void elements can not have children and only consist of an open tag
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    id: number;
    tagName: string; // ex. h1, h2, div
    innerText: string; // ex. <h1> INNER TEXT </h1>
    attributes: Record<string, string>; // ex. <h1 attr="attr"></h1>
    parentId: number | null;
    error: 'UNCLOSED' | 'CLOSED' | 'SELF_CLOSING' | 'HAS_CHILDREN' | 'HAS_TEXT' | null;
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

    let id: number = 0;
    const parser = new Parser({
        // Runs for each open tag
        onopentag(name: string, attribs: Record<string, string>) {
            const parent: Tag | undefined = stack.at(-1);
            console.log(parent)
            if (parent) {
                if (VOID_ELEMENTS.has(parent.tagName)) {
                    // Void element has child or children
                    parent.error = 'HAS_CHILDREN';
                }
            }

            const tag: Tag = {
                id: id++,
                tagName: name,
                innerText: '',
                attributes: attribs,
                parentId: parent ? parent.id : null,
                error: null
            }
            const rawTag: string = html.slice(parser.startIndex, parser.endIndex + 1);
            const isSelfClosing: boolean = rawTag.endsWith('/>');

            if (!VOID_ELEMENTS.has(name)) {
                if (isSelfClosing) {
                    // Non-void tag closes itself
                    tag.error = 'SELF_CLOSING';
                }
                else {
                    // Push tag to stack and array
                    stack.push(tag);
                    tags.push(tag);
                }
            }
            else {
                stack.push(tag);
                tags.push(tag);
            }
        },
        // Runs for each segment of text
        ontext(text: string) {
            const parent: Tag | undefined = stack.at(-1);
            if (parent) {
                // Add text to parent tag
                parent.innerText += text;
                if (VOID_ELEMENTS.has(parent.tagName)) {
                    parent.error = 'HAS_TEXT';
                }
            }
        },
        // Runs for each close tag
        onclosetag(name: string, isImplied: boolean) {
            const topStack: Tag | undefined = stack.pop();

            if (topStack) {
                if (VOID_ELEMENTS.has(name)) {
                    // Void tag
                    if (isImplied) {
                        // Implied close, remove error and innerText
                        topStack.error = null;
                        topStack.innerText = '';
                    }
                    else {
                        // Nonimplied close, attach error
                        topStack.error = 'CLOSED';
                    }

                    return;
                }

                if (topStack.tagName !== name || isImplied) {
                    topStack.error = 'UNCLOSED';
                }
            }
        }
    }, { xmlMode: true });

    parser.write(html);
    parser.end();

    return tags;
}
