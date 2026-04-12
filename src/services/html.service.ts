import { Parser } from 'htmlparser2';

// Void elements can not have children and only consist of an open tag
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Tag = {
    id: number;
    tagName: string; // ex. h1, h2, div
    innerText: string; // ex. <h1> INNER TEXT </h1>
    attributes: Record<string, string>; // ex. <h1 attr="attr"></h1>
    children: Tag[];
    error: 'CLOSED' | 'UNCLOSED' | 'SELF_CLOSING' | 'NOT_SELF_CLOSING' | null;
};

/**
 * Parses serailized HTML `html` and returns an array of root tags,
 * each with an array of their children
 * 
 * Every open tag and self-closing tag is parsed
 * 
 * Errors on tags are flagged. Orphaned close tags are no longer added and flagged
 * with an error
 * 
 * @param html {string} - Serialized HTML
 * @returns {Tag[]} returns an array of `html`'s root tags in order
 */
export function parseHtmlTags(html: string) {
    const stack: Tag[] = [];
    const roots: Tag[] = [];

    let id: number = 0;
    const parser = new Parser({
        // Runs for each open tag
        onopentag(name: string, attribs: Record<string, string>) {
            const tag: Tag = {
                id: id++,
                tagName: name,
                innerText: '',
                attributes: attribs,
                children: [],
                error: null
            }

            const parent: Tag | undefined = stack.at(-1);

            const rawTag: string = html.slice(parser.startIndex, parser.endIndex + 1);
            const isSelfClosing: boolean = rawTag.endsWith('/>');

            // Void element not self closing
            if (VOID_ELEMENTS.has(name)) {
                if (!isSelfClosing) {
                    tag.error = 'NOT_SELF_CLOSING';
                }

                stack.push(tag);
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

            if (parent) parent.children.push(tag);
            else roots.push(tag);
        },
        // Runs for each segment of text
        ontext(text: string) {
            const parent: Tag | undefined = stack.at(-1);
            if (parent) {
                // Add text to parent tag
                parent.innerText += text;
            }
        },
        // Runs for each close tag
        onclosetag(name: string, isImplied: boolean) {
            const topStack: Tag | undefined = stack.pop();

            if (topStack) {
                if (VOID_ELEMENTS.has(topStack.tagName)) {
                    if (!isImplied) {
                        topStack.error = 'CLOSED';
                    }
                }
                else {
                    if (topStack.tagName !== name || isImplied) {
                        topStack.error = 'UNCLOSED';
                    }
                }
            }
        }
    }, { xmlMode: true });

    parser.write(html);
    parser.end();

    return roots;
}
