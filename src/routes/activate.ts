import express from 'express';
import { getActivate, postActivate } from '../controllers/users/activate';

const router = express.Router();

router.get('/:token', getActivate);
router.post('/:token', postActivate);

export default router;
