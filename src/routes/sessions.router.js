import { Router } from "express";
import userModel from "../models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken"; 
import { createHash, isValidPassword } from "../utils/util.js";

const router = Router(); 

//Ruta de registro: 

router.post("/register", async (req, res) => {
    const {first_name, last_name, email, age, password} = req.body; 

    try {
        // Verificamos si el usuario ya existe por email
        const existeUsuario = await userModel.findOne({email}); 

        if(existeUsuario) {
            return res.status(400).send("El correo electrónico ya está registrado"); 
        }

        // Creamos el nuevo usuario con todos los campos
        const nuevoUsuario = new userModel({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
        });
        console.log(nuevoUsuario)
        await nuevoUsuario.save(); 

        // Generamos el token con la información relevante
        const token = jwt.sign(
            {
                email: nuevoUsuario.email, 
                role: nuevoUsuario.role
            }, 
            process.env.JWT_SECRET, 
            {expiresIn: process.env.JWT_EXPIRATION}
        ); 

        // Establecemos la cookie
        res.cookie(process.env.JWT_COOKIE_NAME, token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development'
        });

        res.redirect("/api/sessions/current"); 

    } catch (error) {
        console.error(error);
        res.status(500).send("Error en el registro del usuario");
    }
});

//Ruta Login: 

router.post("/login", async (req, res) => {
    const {email, password} = req.body; 

    try {
        // Validación de campos requeridos
        if (!email || !password) {
            return res.status(400).send("Todos los campos son obligatorios");
        }

        // Buscar al usuario por email en MongoDB
        const usuario = await userModel.findOne({email}); 

        // Verificar si existe el usuario
        if (!usuario) {
            return res.status(401).send("Credenciales inválidas"); 
        }

        // Verificar la contraseña
        if (!isValidPassword(password, usuario)) {
            return res.status(401).send("Credenciales inválidas"); 
        }

        // Generar el Token JWT
        const token = jwt.sign(
            {
                email: usuario.email,
                role: usuario.role,
                first_name: usuario.first_name,
                last_name: usuario.last_name
            }, 
            process.env.JWT_SECRET, 
            {expiresIn: process.env.JWT_EXPIRATION}
        );

        // Establecer la cookie
        res.cookie(process.env.JWT_COOKIE_NAME, token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development'
        });

        return res.redirect("/api/sessions/current");

    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).send("Error interno del servidor");
    }
});

//Estrategia Current: 

router.get("/current", 
    passport.authenticate("current", { 
        session: false,
        failureRedirect: "/login",
        failureMessage: true 
    }), 
    (req, res) => {
        try {
            const products = []; // O obtenerlo de donde corresponda
            res.render("home", { 
                user: req.user,
                products: products // Asegúrate de pasar products a la vista
            });
        } catch (error) {
            console.error("Error en ruta current:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
);

//Logout: 

router.post("/logout", (req, res) => {
    res.clearCookie(process.env.JWT_COOKIE_NAME);
    res.redirect("/login"); 
})

//Ruta Admin: 

router.get("/admin", 
    passport.authenticate("current", {session: false}),
    (req, res) => {
        try {
            if (req.user.role !== "admin") {
                return res.status(403).json({ 
                    error: "Acceso denegado. No tiene permisos de administrador" 
                }); 
            }
            res.render("admin"); 
        } catch (error) {
            console.error("Error en ruta admin:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
);



export default router; 