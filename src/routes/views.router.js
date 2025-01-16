import express from "express";
const router = express.Router();
import ProductManager from "../dao/managers/product-manager-db.js";
import CartManager from "../dao/managers/cart-manager-db.js";
import { soloAdmin, soloUser } from "../middleware/auth.js";
import passport from "passport";
import ticketModel from '../dao/models/ticket.model.js';

const productManager = new ProductManager();
const cartManager = new CartManager();

// Ruta para la página principal
router.get("/", (req, res) => {
    res.render("home");
});

// Ruta para la página de login
router.get("/login", (req, res) => {
    res.render("login");
});

// Ruta para la página de registro
router.get("/register", (req, res) => {
    res.render("register");
});

// Ruta para ver el carrito por ID
router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const carrito = await cartManager.getCarritoById(cartId);
        if (!carrito) {
            return res.status(404).render("error", { message: "Carrito no encontrado" });
        }

        const productosEnCarrito = carrito.products.map(item => ({
            product: item.productId.toObject(),
            quantity: item.quantity
        }));

        res.render("cart", { cartId, products: productosEnCarrito, total: carrito.total });
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).render("error", { message: "Error interno del servidor" });
    }
});

// Ruta para ver productos con paginación
router.get("/products", async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const productos = await productManager.getProducts({ page: parseInt(page), limit: parseInt(limit) });
        
        // Convertir los documentos a objetos simples
        const productosPlanos = productos.docs.map(product => product.toObject());

        res.render("products", {
            products: productosPlanos,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            currentPage: productos.page,
            totalPages: productos.totalPages
        });
    } catch (error) {
        console.error("Error al obtener productos", error);
        res.status(500).render("error", { message: "Error interno del servidor" });
    }
});

// Ruta para productos en tiempo real (solo admin)
router.get("/realtimeproducts", soloAdmin, (req, res) => {
    res.render("realtimeproducts");
});

// Ruta para ver detalles de un producto
router.get("/products/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const producto = await productManager.getProductById(id);
        if (!producto) {
            return res.status(404).render("error", { message: "Producto no encontrado" });
        }
        res.render("productDetails", { product: producto.toObject() });
    } catch (error) {
        console.error("Error al obtener el producto", error);
        res.status(500).render("error", { message: "Error interno del servidor" });
    }
});

// Ruta para manejar el login con Passport
router.post("/api/sessions/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
});

// Ruta para manejar el registro de usuarios
router.post("/api/sessions/register", async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    try {
        // Lógica para registrar al usuario
        await userService.registerUser({ first_name, last_name, email, age, password });
        res.redirect("/api/sessions/login"); // Redirigir a la página de inicio de sesión
    } catch (error) {
        console.error("Error al registrar usuario", error);
        res.status(500).render("error", { message: "Error interno del servidor" });
    }
});

// Ruta para cerrar sesión
router.post("/api/sessions/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});

// Ruta para crear un ticket
router.post("/purchase", async (req, res) => {
    const { amount, purchaser } = req.body; // Asegúrate de que estos datos se envían desde el cliente
    console.log("Datos recibidos:", { amount, purchaser }); // Agrega este log

    try {
        // Generar un código único para el ticket
        const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newTicket = new ticketModel({ amount, purchaser, code });
        await newTicket.save();
        res.status(201).send({ status: 'success', ticket: newTicket });
    } catch (error) {
        console.error("Error al crear el ticket", error);
        res.status(500).send({ status: 'error', message: "Error al crear el ticket" });
    }
});

// Ruta para actualizar el carrito
router.post("/cart/update", async (req, res) => {
    const { productId, action } = req.body;

    try {
        // Lógica para actualizar el carrito según la acción
        if (action === 'add') {
            // Lógica para sumar un producto
            await cartManager.addProduct(productId);
        } else if (action === 'subtract') {
            // Lógica para restar un producto
            await cartManager.subtractProduct(productId);
        } else if (action === 'remove') {
            // Lógica para eliminar un producto
            await cartManager.removeProduct(productId);
        }

        res.status(200).send({ status: 'success' });
    } catch (error) {
        console.error("Error al actualizar el carrito", error);
        res.status(500).send({ status: 'error', message: "Error al actualizar el carrito" });
    }
});

export default router;