import { type Tag, VOID_ELEMENTS } from "./html.service";

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