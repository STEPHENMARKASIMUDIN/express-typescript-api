import { Router } from 'express';
import loginController from '../controller/login_controller';

const router: Router = Router();

router.post('/', loginController);

export default router;