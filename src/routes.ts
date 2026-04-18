import { Router } from 'express';
import { parseHtmlHandler } from './controllers/html.controller.js';
import validateResource from './middleware/validate_resource.js';
import { parseHtmlSchema } from './schema/html.schema.js';
import { restructureTagsSchema, serializeTagsSchema } from './schema/tag.schema.js';
import { restructureTagsHandler, serializeTagsHandler } from './controllers/tag.controller.js';

const router = Router();

router.post('/html/parse', validateResource(parseHtmlSchema), parseHtmlHandler);
router.post('/tags/serialize', validateResource(serializeTagsSchema), serializeTagsHandler);
router.post('/tags/restructure', validateResource(restructureTagsSchema), restructureTagsHandler);

export default router;
