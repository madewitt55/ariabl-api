import Anthropic from '@anthropic-ai/sdk';
import { type Tag, VOID_ELEMENTS, parseHtml } from "./html.service";

const client = new Anthropic();

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

export async function restructureTags(tags: Tag[]): Promise<Tag[]> {
    const html = serializeTags(tags);

    const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        messages: [{
            role: 'user',
            content: `Restructure the following HTML so that:
1. There is exactly one root <html> element.
2. <html> contains only <head> and <body> as direct children.
3. Metadata tags (title, meta, link, style, script) are placed inside <head>.
4. All content tags are placed inside <body>.
5. Every unclosed non-void tag is properly closed.
6. Every self-closing non-void tag (e.g. <div/>) is rewritten as an open+close pair.
7. Void elements (br, img, input, meta, link, etc.) are NOT self-closed.

Return ONLY the restructured HTML — no explanation, no markdown fences.

HTML:
${html}`
        }]
    });

    const content = response.content[0];
    if (content?.type !== 'text') throw new Error('Unexpected response type from Claude');

    return parseHtml(content.text);
}
