//Desarrollar un servidor express que, en su archivo app.js importe al archivo de productManager.

import express from "express"; 
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import productRouter from './routes/products.router.js';
import cartRouter from "./routes/carts.router.js";
import viewRouter from "./routes/views.router.js";
import ProductManager from './managers/product-manager.js';

const app = express(); 
const PUERTO = 8080;

app.engine("handlebars", engine()); 
app.set("view engine", "handlebars"); 
app.set("views", "./src/views"); 

//Middleware: 
app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"));
//Le decimos al servidor que vamos a trabajar con JSON

//Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewRouter);


const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el http://localhost:${PUERTO}`); 
})

const io = new Server(httpServer);
let messages = [];
let products = [];
const manager = new ProductManager('./src/data/productos.json');
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
    socket.emit('productsUpdated', products);
    socket.on('addProduct', async (product) => {
        await manager.addProduct(product);
        products = await manager.getProducts(); 
        io.emit('productsUpdated', products); 
    });
    socket.on('deleteProduct', async (productId) => {
        await manager.deleteProduct(productId);
        products = await manager.getProducts(); 
        io.emit('productsUpdated', products);
    }); 
    socket.on('message', (data) => {
        messages.push(data);
        io.emit('messagesLogs', messages);
    });
});