import type { Response } from 'express';
import type { TypedRequest } from '../utils/typed_request';
import type { UploadHtmlRequest } from '../schema/html.schema';
import { parseHtmlTags, type Tag } from '../services/html.service';

/**
 * Handler for uploading HTML
 *
 * @param {TypedRequest<UploadHtmlRequest>} req - Validated request
 * @param {Response} res - Response to be returned
 * @returns {Response} Returns an HTTP response:
 * - `400` if HTML has no tags or structural issues are found
 * - `200` with parsed tags if HTML is structurally valid
 */
export function uploadHtmlHandler(req: TypedRequest<UploadHtmlRequest>, res: Response): Response {
    // Serialize HTML file; if no file in req, use pre-serialized HTML from body
    const html: string = req.file ? req.file!.buffer.toString('utf-8') : req.body!.html;

    const tags: Tag[] = parseHtmlTags(html); // Parse tags
    if (tags.some((tag: Tag) => tag.error)) {
        // Errors are present in HTML, send data back
        return res.status(400).send({
            tags,
            message: 'HTML contains errors'
        });
    }

    return res.status(200).json({ tags });
}
