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
 * - `200` with parsed tags if `body.html` contains tags
 * - `400` if `body.html` does not contain tags
 */
export function uploadHtmlHandler(req: TypedRequest<UploadHtmlRequest>, res: Response): Response {
    const html: string = req.body.html;

    const tags: Tag[] = parseHtmlTags(html); // Parse tags
    if (!tags.length) {
        return res.status(400).send({
            message: 'html contains no tags'
        });
    }

    return res.status(200).send({ 
        tags,
        message: 'Tags parsed successfully'
    });
}
