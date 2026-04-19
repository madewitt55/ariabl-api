import { type Tag, VOID_ELEMENTS, parseHtml } from "./html.service";

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

const HEAD_ONLY_TAGS = new Set(['title', 'base', 'meta', 'link', 'style', 'script']);

function flattenTags(tags: Tag[]): Tag[] {
    return tags.flatMap(tag => [
        tag,
        ...flattenTags(tag.content.filter((c): c is Tag => typeof c !== 'string'))
    ]);
}

export function validateTagsStructure(tags: Tag[]): boolean {
    // Exactly one root <html> element
    if (tags.length > 1) return false;
    const htmltags = tags.filter(t => t.tagName === 'html');
    if (htmltags.length !== 1) return false;

    // No tag errors anywhere in the document
    if (flattenTags(tags).some(t => t.error !== null)) return false;

    const childTags = htmltags[0]!.content.filter((c): c is Tag => typeof c !== 'string');

    // <html> direct children are only <head> and <body>
    if (childTags.some(t => t.tagName !== 'head' && t.tagName !== 'body')) return false;

    // Head-only tags are not inside <body>
    const bodyTag = childTags.find(t => t.tagName === 'body');
    if (bodyTag && flattenTags([bodyTag]).some(t => HEAD_ONLY_TAGS.has(t.tagName))) return false;

    return true;
}
