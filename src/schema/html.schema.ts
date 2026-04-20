import { z, object, string } from 'zod';

export const parseHtmlSchema = object({
    body: object({
        html: string('html is required').min(1)
    }).strict()
});

export const restructureHtmlSchema = object({
    body: object({
        html: string('html is required').min(1)
    }).strict()
});

export const validateHtmlStructureSchema = object({
    body: object({
        html: string('html is required').min(1)
    }).strict()
});

export const accessibilityCheckSchema = object({
    body: object({
        html: string('html is required').min(1)
    }).strict()
});

export type ParseHtmlRequest = z.infer<typeof parseHtmlSchema>;
export type restructureHtmlRequest = z.infer<typeof restructureHtmlSchema>;
export type validateHtmlStructureRequest = z.infer<typeof validateHtmlStructureSchema>;
export type AccessibilityCheckRequest = z.infer<typeof accessibilityCheckSchema>;