import { Router } from 'express';
import passport from 'passport';
const router = Router(); 

//Importar el controlador: 
import UserController from '../controllers/user.controllers.js';
const userController = new UserController(); 

router.post("/register", userController.register); 
router.post("/login", userController.login); 
router.get("/current", passport.authenticate("jwt", {session: false}), userController.current); 
router.post("/logout", userController.logout); 

export default router;