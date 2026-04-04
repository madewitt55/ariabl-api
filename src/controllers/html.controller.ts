import type { Response } from 'express';
import type { TypedRequest } from '../utils/typed_request';
import type { UploadHtmlRequest } from '../schema/html.schema';
import { parseHtmlTags, type Tag } from '../services/html.service';

/**
 * Handler for uploading HTML
 * 
 * POST /api/html
 * 
 * @param {TypedRequest<UploadHtmlRequest>} req - Validated request
 * @param {Response} res - Response to be returned
 * @returns {Response} Returns an HTTP response:
 * - `400` (with array of tags) if HTML has no tags or any unclosed tags
 * - `200` (with array of tags) if HTML consists of complete tags
 */
export function uploadHtmlHandler(req: TypedRequest<UploadHtmlRequest>, res: Response): Response {
    const html: string = req.file ? req.file!.buffer.toString('utf-8') : req.body!.html;
    const tags: Tag[] = parseHtmlTags(html);

    // If html contains no tags
    if (!tags.length) {
        return res.status(400).send({
            tags,
            message: 'HTML contains no tags'
        });
    }
    // If html contains any unclosed tags
    if (tags.some((t: Tag) => !t.isClosed)) {
        return res.status(400).send({
            tags,
            message: 'All tags must be closed'
        });
    }
    
    return res.status(200).json({ tags });
}
