import type {Express} from 'express';
import { uploadHtmlHandler } from './controllers/html.controller.js';
import validateResource from './middleware/validate_resource.js';
import { uploadHtmlSchema } from './schema/html.schema.js';
import { uploadSingle } from './middleware/upload.js';

export default function router(app: Express) {
    app.post('/api/html', uploadSingle('file'), validateResource(uploadHtmlSchema), uploadHtmlHandler);
}
