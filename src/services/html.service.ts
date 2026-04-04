import { parse } from 'node-html-parser';

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export type Element = {
    tag: string;
    isVoid: boolean;
    isClosed: boolean;
};

export function parseHtmlTags(html: string): Element[] {
    const root = parse(html);
    return root.querySelectorAll('*').map(node => {
        const tag = node.tagName.toLowerCase();
        let isClosed: boolean = true;
        const isVoid: boolean = VOID_ELEMENTS.has(tag);
        if (!isVoid) {
            isClosed = html.includes(`</${tag}>`);
        }

        return { tag, isVoid, isClosed };
    });
}