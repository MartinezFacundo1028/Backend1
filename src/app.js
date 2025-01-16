import express from "express";
import http from "http";
import { Server } from "socket.io";
import exphbs from "express-handlebars";
import passport from "passport";
import cookieParser from "cookie-parser";
import initializePassport from "./config/passport.config.js";
import mongoose from "mongoose";
import productRouter from './routes/products.router.js';
import cartRouter from "./routes/carts.router.js";
import viewRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PUERTO = process.env.PORT;

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));
app.use(cookieParser());
app.use(passport.initialize());
initializePassport();

//Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Rutas: 
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewRouter);

// Iniciar el servidor con Socket.IO
server.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

// Conexión a MongoDB y inicio del servidor
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexión exitosa"))
    .catch(() => console.log("Vamos a morir, tenemos un error"))

// Aquí puedes agregar la lógica de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Aquí puedes manejar eventos de Socket.IO
});

// Pasar la instancia de io a las rutas
app.set('io', io);
