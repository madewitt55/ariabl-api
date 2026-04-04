import type { Response } from 'express';
import type { TypedRequest } from '../utils/typed_request';
import type { UploadHtmlRequest } from '../schema/html.schema';
import { parseHtmlTags, type Element } from '../services/html.service';

export function uploadHtmlHandler(req: TypedRequest<UploadHtmlRequest>, res: Response): any {
    const html: string = req.file ? req.file!.buffer.toString('utf-8') : req.body!.html;
    const tags: Element[] = parseHtmlTags(html);

    if (!tags.length) {
        return res.status(400).send({
            message: 'HTML contains no tags'
        });
    }
    if (tags.some((e: Element) => !e.isClosed)) {
        return res.status(400).send({
            tags,
            message: 'All tags must be closed'
        });
    }
    
    return res.status(200).json({ tags });
}
