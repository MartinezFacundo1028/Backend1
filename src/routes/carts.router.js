import express from "express";
import CartManager from "../dao/managers/cart-manager-db.js"; // Importar el CartManager
import ProductManager from "../dao/managers/product-manager-db.js"; // Importar el ProductManager
import ticketModel from "../dao/models/ticket.model.js"; // Importar el modelo de Ticket

const router = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// Crear un carrito nuevo (POST /)
router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await cartManager.crearCarrito(); // Usar el método del manager
        res.json(nuevoCarrito); // Enviar la respuesta con el carrito creado
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener un carrito por ID (GET /:cid)
router.get("/:cid", async (req, res) => {
    const carritoId = req.params.cid;

    try {
        const carritoBuscado = await cartManager.getCarritoById(carritoId); // Usar el manager
        if (!carritoBuscado) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Calcular el total de los productos en el carrito
        const total = carritoBuscado.products.reduce((sum, item) =>
            sum + (item.product.price * item.quantity), 0
        );

        res.render('cart', { cartId: carritoId, products: carritoBuscado.products, total });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Agregar un producto al carrito (POST /:cid/product/:pid)
router.post("/:cid/product/:pid", async (req, res) => {
    const carritoId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const carritoActualizado = await cartManager.agregarProductoAlCarrito(carritoId, productId, quantity);
        
        // Emitir evento de actualización del carrito
        req.app.get('io').emit('cartUpdated', carritoActualizado.products); // Asegúrate de tener acceso a `io`
        
        res.json(carritoActualizado.products);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Actualizar la cantidad de un producto en el carrito (PUT /:cid/product/:pid)
router.put("/:cid/product/:pid", async (req, res) => {
    const carritoId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    try {
        if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ error: "La cantidad debe ser un número positivo" });
        }

        const carritoActualizado = await cartManager.actualizarProductoEnCarrito(carritoId, productId, quantity); // Usar el manager
        res.json(carritoActualizado.products); // Responder con los productos actualizados del carrito
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Eliminar un producto del carrito (DELETE /:cid/product/:pid)
router.delete("/:cid/product/:pid", async (req, res) => {
    const carritoId = req.params.cid;
    const productId = req.params.pid;

    try {
        const carritoActualizado = await cartManager.eliminarProductoDelCarrito(carritoId, productId); // Usar el manager
        res.json(carritoActualizado.products); // Responder con los productos actualizados del carrito
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Vaciar el carrito (DELETE /:cid)
router.delete("/:cid", async (req, res) => {
    const carritoId = req.params.cid;

    try {
        const carritoVaciado = await cartManager.getCarritoById(carritoId);
        carritoVaciado.products = [];
        await carritoVaciado.save();

        res.json({ message: "Carrito vacío", products: carritoVaciado.products });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener todos los carritos (GET /)
router.get("/", async (req, res) => {
    try {
        const carritos = await cartManager.getAllCarritos();
        res.json(carritos);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para finalizar la compra
router.post("/:cid/purchase", async (req, res) => {
    const cartId = req.params.cid;
    const { purchaser } = req.body; // Asegúrate de que el correo del comprador se envíe en el cuerpo de la solicitud

    try {
        const carrito = await cartManager.getCarritoById(cartId);
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        let totalAmount = 0;
        const unavailableProducts = [];

        for (const item of carrito.products) {
            const product = await productManager.getProductById(item.product);
            if (product && product.stock >= item.quantity) {
                totalAmount += product.price * item.quantity;
                product.stock -= item.quantity; // Restar del stock
                await product.save(); // Guardar el producto actualizado
            } else {
                unavailableProducts.push(item.product); // Agregar a la lista de productos no disponibles
            }
        }

        // Crear el ticket solo si hay productos disponibles
        if (totalAmount > 0) {
            const newTicket = new ticketModel({ amount: totalAmount, purchaser });
            await newTicket.save();
        }

        // Filtrar el carrito para mantener solo los productos no disponibles
        carrito.products = carrito.products.filter(item => unavailableProducts.includes(item.product));
        await carrito.save();

        res.status(200).json({ message: "Compra finalizada", unavailableProducts });
    } catch (error) {
        console.error("Error al procesar la compra", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
