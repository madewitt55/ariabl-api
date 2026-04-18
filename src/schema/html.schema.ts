import { z, object, string } from 'zod';

export const parseHtmlSchema = object({
    body: object({
        html: string('html is required').min(1)
    }).strict()
});

export type ParseHtmlRequest = z.infer<typeof parseHtmlSchema>;