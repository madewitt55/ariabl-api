import type { Response } from 'express';
import type { TypedRequest } from '../utils/typed_request';
import type { ParseHtmlRequest, restructureHtmlRequest, validateHtmlStructureRequest } from '../schema/html.schema';
import { parseHtml, restructureHtml, type Tag } from '../services/html.service';
import { validateTagsStructure } from '../services/tag.service';

/**
 * Handler for uploading HTML
 *
 * @param {TypedRequest<UploadHtmlRequest>} req - Validated request
 * @param {Response} res - Response to be returned
 * @returns {Response} Returns an HTTP response:
 * - `200` with parsed tags if `body.html` contains tags
 * - `400` if `body.html` does not contain tags
 */
export function parseHtmlHandler(req: TypedRequest<ParseHtmlRequest>, res: Response): any {
    const html: string = req.body.html;

    const tags: Tag[] = parseHtml(html); // Parse tags
    if (!tags.length) {
        return res.status(400).send({
            tags,
            message: 'html contains no tags'
        });
    }

    return res.status(200).send({ 
        tags,
        message: 'Tags parsed successfully'
    });
}

export async function restructureHtmlHandler(req: TypedRequest<restructureHtmlRequest>, res: Response): Promise<any> {
    try {
        const html: string = req.body.html;

        // No tags in HTML
        if (!parseHtml(html).length) {
            return res.status(400).send({
                message: 'HTML contains no tags'
            });
        }
        const restructuredHtml: string = await restructureHtml(html);
        console.log(restructuredHtml)

        return res.status(200).send({
            html: restructuredHtml,
            message: 'HTML restructured successfully'
        });
    }
    catch (err: any) {
        console.log(err)
        return res.status(500).send({
            message: 'Internal error occured while restructuring HTML'
        });
    }
}

export async function validateHtmlStructureHandler(req: TypedRequest<validateHtmlStructureRequest>, res: Response): Promise<any> {
    const html: string = req.body.html;
    const tags: Tag[] = parseHtml(html);

    // HTML has no tags
    if (!tags.length) {
        return res.status(400).send({
            message: 'HTML contains no tags'
        });
    }

    const isValid: boolean = validateTagsStructure(tags);

    return res.status(200).send({
        message: 'HTML structure validated successfully',
        isValid
    });
}
