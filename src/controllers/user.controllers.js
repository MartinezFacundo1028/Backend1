import userService from "../services/user.service.js";
import jwt from "jsonwebtoken"; 
import { createHash, isValidPassword } from "../utils/util.js";

class UserController {
    async register(req, res) {
        const { first_name, last_name, email, age, password } = req.body; 
        try {
            const hashedPassword = createHash(password);
            await userService.registerUser({ first_name, last_name, email, age, password: hashedPassword });
            res.status(201).send("Usuario registrado con éxito")
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            res.status(500).send("Error al registrar el usuario");
        }
    }

    async login(req, res) {
        const { email, password } = req.body; 
        
        try {
            const user = await userService.loginUser(email, password); 
            console.log(user, 'user');

            if (!isValidPassword(password, user)) {
                return res.status(401).send("Credenciales incorrectas");
            }

            const token = jwt.sign({
                usuario: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role
            }, process.env.JWT_SECRET, { expiresIn: "1h" }); 

            res.cookie("coderCookieToken", token, { maxAge: 3600000, httpOnly: true }); 
            res.redirect("/api/sessions/current"); 
        } catch (error) {
            console.error("Error en el inicio de sesión:", error);
            res.status(500).send("Erro terrible, se suspende la navidad"); 
        }
    }

    async current(req, res) {
        if(req.user) {
            const userDTO = await userService.generarDTO(req.user); 
            res.render("home", {user: userDTO}); 
        } else {
            res.send("No autorizado"); 
        }
    }

    async logout(req, res) {
        res.clearCookie("coderCookieToken"); 
        res.redirect("/login"); 
    }

}

export default UserController; 