import { Router } from 'express';
import { parseHtmlHandler, restructureHtmlHandler, validateHtmlStructureHandler, checkImageAltHandler, checkFormLabelsHandler, checkHeadingsHandler, checkLandmarksHandler } from './controllers/html.controller.js';
import validateResource from './middleware/validate_resource.js';
import { parseHtmlSchema, restructureHtmlSchema, validateHtmlStructureSchema, accessibilityCheckSchema } from './schema/html.schema.js';
import { serializeTagsSchema } from './schema/tag.schema.js';
import { serializeTagsHandler } from './controllers/tag.controller.js';

const router = Router();

router.post('/html/parse', validateResource(parseHtmlSchema), parseHtmlHandler);
router.post('/tags/serialize', validateResource(serializeTagsSchema), serializeTagsHandler);
router.post('/html/restructure', validateResource(restructureHtmlSchema), restructureHtmlHandler);
router.post('/html/validate', validateResource(validateHtmlStructureSchema), validateHtmlStructureHandler);
router.post('/html/check-image-alt', validateResource(accessibilityCheckSchema), checkImageAltHandler);
router.post('/html/check-form-labels', validateResource(accessibilityCheckSchema), checkFormLabelsHandler);
router.post('/html/check-headings', validateResource(accessibilityCheckSchema), checkHeadingsHandler);
router.post('/html/check-landmarks', validateResource(accessibilityCheckSchema), checkLandmarksHandler);

export default router;
