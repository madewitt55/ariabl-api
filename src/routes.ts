import { Router } from 'express';
import { uploadHtmlHandler } from './controllers/html.controller.js';
import validateResource from './middleware/validate_resource.js';
import { uploadHtmlSchema } from './schema/html.schema.js';

const router = Router();

router.post('/html', validateResource(uploadHtmlSchema), uploadHtmlHandler);

export default router;
