import type { Response } from "express";
import type { restructureTagsRequest, SerializeTagsRequest } from "../schema/tag.schema";
import type { TypedRequest } from "../utils/typed_request";
import { serializeTags, restructureTags } from "../services/tag.service";

export function serializeTagsHandler(req: TypedRequest<SerializeTagsRequest>, res: Response): any {
    const html: string = serializeTags(req.body.tags);

    return res.status(200).send({
        html,
        message: 'Tags serialized successfully'
    });
}

export async function restructureTagsHandler(req: TypedRequest<restructureTagsRequest>, res: Response): Promise<any> {
    const tags = await restructureTags(req.body.tags);

    return res.status(200).send({
        tags,
        message: 'Tags restructured successfully'
    });
}