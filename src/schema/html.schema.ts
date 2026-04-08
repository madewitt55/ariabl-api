import { z, object, string } from 'zod';

export const uploadHtmlSchema = object({
    body: object({
        html: string('html is required').min(1)
    }).strict()
});

export type UploadHtmlRequest = z.infer<typeof uploadHtmlSchema>;