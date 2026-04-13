import { z, object, string, array, record, literal, union, null as zNull } from 'zod';

const tagSchema: z.ZodType<Tag> = z.lazy(() =>
    object({
        id: z.number(),
        tagName: string(),
        attributes: record(string(), string()),
        content: array(union([string(), tagSchema])),
        error: union([
            literal('UNCLOSED'),
            literal('SELF_CLOSING'),
            literal('NOT_SELF_CLOSING'),
            zNull()
        ])
    })
);

interface Tag {
    id: number;
    tagName: string;
    attributes: Record<string, string>;
    content: Array<string | Tag>;
    error: 'UNCLOSED' | 'SELF_CLOSING' | 'NOT_SELF_CLOSING' | null;
}

export const serializeTagsSchema = object({
    body: object({
        tags: array(tagSchema).min(1)
    }).strict()
});

export type SerializeTagsRequest = z.infer<typeof serializeTagsSchema>;
