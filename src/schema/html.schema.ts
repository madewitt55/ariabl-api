import { z, object, string, number } from 'zod';

export const uploadHtmlSchema = object({
    body: object({
        html: string().min(1).optional()
    }).strict().optional(),
    file: object({
        originalname: string(),
        mimetype: string().refine(v => v === 'text/html', { 
            message: 'File must be an HTML file' 
        }),
        buffer: z.instanceof(Buffer),
        size: number(),
    }).optional()
}).refine(data => data.body ?? data.file, { 
    message: 'HTML file or raw HTML text is required' 
});

export type UploadHtmlRequest = z.infer<typeof uploadHtmlSchema>;