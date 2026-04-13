import { Router } from 'express';
import { uploadHtmlHandler } from './controllers/html.controller.js';
import validateResource from './middleware/validate_resource.js';
import { uploadHtmlSchema } from './schema/html.schema.js';
import { serializeTagsSchema } from './schema/tag.schema.js';
import { serializeTagsHandler } from './controllers/tag.controller.js';

const router = Router();

router.post('/html', validateResource(uploadHtmlSchema), uploadHtmlHandler);
router.post('/tags/serialize', validateResource(serializeTagsSchema), serializeTagsHandler);

export default router;
