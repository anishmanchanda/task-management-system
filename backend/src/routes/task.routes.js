import { Router } from 'express';
import * as controller from '../controllers/task.controller.js';
import { validateListQuery, validateTaskBody } from '../middleware/validate.js';

const router = Router();

router.get('/', validateListQuery, controller.list);
router.get('/:id', controller.get);
router.post('/', validateTaskBody, controller.create);
router.put('/:id', validateTaskBody, controller.update);
router.delete('/:id', controller.remove);

export default router;
