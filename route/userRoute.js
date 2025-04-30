import express from 'express';
const router = express.Router()
import { loginUser, registerUser } from '../controllers/userController.js';

// router.put('/login', loginUser)
// router.post('/login', registerUser)

router.route('/login').post(registerUser)
router.route('/login').get(loginUser)



export default router
