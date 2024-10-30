import mongoose from "mongoose";
import express from "express"; 
import { Server } from 'socket.io';
import http from 'http';
import productRouter from './routes/products.router.js';
import cartRouter from "./routes/carts.router.js";
import viewRouter from "./routes/views.router.js";
import Product from './models/product.model.js';
import handlebars from 'express-handlebars';
const app = express(); 
const PUERTO = 8080;
const server = http.createServer(app);
const io = new Server(server);

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

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set("views", "./src/views"); 


app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"));

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewRouter);


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

server.listen(PUERTO, () => {
    console.log(`Escuchando en el http://localhost:${PUERTO}`); 
});

mongoose.connect(`mongodb+srv://CoderHouse:CoderHouse@codercluster.abfbm.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster`);
