import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';

const router = Router();

router.get('/user/profile/:userId', getUserProfile);
router.put('/user/profile', updateUserProfile);

export default router;
