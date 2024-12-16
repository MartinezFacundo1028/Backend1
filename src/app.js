import mongoose from "mongoose";
import express from "express"; 
import { Server } from 'socket.io';
import http from 'http';
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importación de rutas
import productRouter from './routes/products.router.js';
import cartRouter from "./routes/carts.router.js";
import viewRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";
import initializePassport from "./config/passport.config.js";

// Importación de modelos
import Product from './models/product.model.js';
import handlebars from 'express-handlebars';

const app = express(); 
const PUERTO = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
const hbs = handlebars.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        multiply: function(a, b) {
            return a * b;
        }
    }
});

// Configuración de middleware
app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Configuración de sesiones
app.use(session({
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://CoderHouse:CoderHouse@codercluster.abfbm.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster`,
        ttl: 3600
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 hora (coincide con JWT_EXPIRATION)
    }
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

// Configuración de motor de vistas
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set("views", "./src/views"); 

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewRouter);

// Configuración de Socket.io
io.on('connection', async (socket) => {
    console.log('Cliente conectado');

    socket.on('addProduct', async (newProduct) => {
        try {
            const product = new Product(newProduct);
            await product.save();
            
            const updatedProducts = await Product.find();
            io.emit('productsUpdated', updatedProducts);
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            console.log('Intentando eliminar producto con ID:', productId);
            const result = await Product.findByIdAndDelete(productId);
            console.log('Resultado de eliminación:', result);
            
            const updatedProducts = await Product.find();
            console.log('Productos actualizados:', updatedProducts);
            io.emit('productsUpdated', updatedProducts);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });
});

// Conexión a MongoDB y inicio del servidor
mongoose.connect(`mongodb+srv://CoderHouse:CoderHouse@codercluster.abfbm.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster`)
    .then(() => {
        console.log("DB Conectada");
        server.listen(PUERTO, () => {
            console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
            console.log(`Ambiente: ${process.env.NODE_ENV}`);
        });
    })
    .catch(error => console.log(`Error en conexión a MongoDB: ${error}`));
