import express from "express";
import cartModel from "../models/cart.model.js";

const cartRouter = express.Router();

cartRouter.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await cartModel.create({});
        res.send(nuevoCarrito);
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});

cartRouter.get("/:cid", async (req, res) => {
    try {
        const carritoId = req.params.cid;
        const carritoBuscado = await cartModel.findById(carritoId);

        if (!carritoBuscado) {
            return res.status(404).render('error', { 
                error: 'Carrito no encontrado' 
            });
        }

        const total = carritoBuscado.products.reduce((sum, item) => 
            sum + (item.productId.price * item.quantity), 0
        );
        console.log(carritoBuscado.products);
        res.render('cart', {
            cartId: carritoId,
            products: carritoBuscado.products,
            total
        });
    } catch (error) {
        res.status(500).render('error', { 
            error: 'Error interno del servidor' 
        });
    }
});

cartRouter.put("/:cid", async (req, res) => {
    const carritoId = req.params.cid;
    const products = req.body;

    try {
        if (!Array.isArray(products)) {
            return res.status(400).send("El campo products debe ser un array");
        }

        const productosValidos = products.every(prod => 
            prod.productId && 
            typeof prod.quantity === 'number' && 
            prod.quantity > 0
        );

        if (!productosValidos) {
            return res.status(400).send("Formato de productos inválido");
        }

        const carritoActualizado = await cartModel.findByIdAndUpdate(
            carritoId, 
            { products }, 
            { new: true }
        );

        if (!carritoActualizado) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.json(carritoActualizado);
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});

cartRouter.post("/:cid/product/:pid", async (req, res) => {
    const carritoId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const carrito = await cartModel.findOne({
            _id: carritoId,
            "products.productId": productId
        });

        if (carrito) {
            const carritoActualizado = await cartModel.findOneAndUpdate(
                { _id: carritoId, "products.productId": productId },
                { $inc: { "products.$.quantity": quantity } },
                { new: true }
            );
            res.json(carritoActualizado.products);
        } else {
            const carritoActualizado = await cartModel.findByIdAndUpdate(
                carritoId,
                { $push: { products: { productId, quantity } } },
                { new: true }
            );
            res.json(carritoActualizado.products);
        }
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});

cartRouter.delete("/:cid/product/:pid", async (req, res) => {
    const carritoId = req.params.cid;
    const productId = req.params.pid;
    
    try {
        const carritoActualizado = await cartModel.findByIdAndUpdate(carritoId, { $pull: { products: { productId } } },{new:true});
        res.json(carritoActualizado.products);
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});

cartRouter.delete("/:cid", async (req, res) => {
    const carritoId = req.params.cid;

    try {
        const carritoActualizado = await cartModel.findByIdAndUpdate(carritoId, { products: [] }, { new: true });
        res.json(carritoActualizado.products);
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});

cartRouter.put("/:cid/product/:pid", async (req, res) => {
    const carritoId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    try {
        if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).send("La cantidad debe ser un número positivo");
        }

        const carritoActualizado = await cartModel.findOneAndUpdate(
            { _id: carritoId, "products.productId": productId },
            { $set: { "products.$.quantity": quantity } },
            { new: true }
        );

        if (!carritoActualizado) {
            return res.status(404).send("Carrito o producto no encontrado");
        }

        res.json(carritoActualizado.products);
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});
export default cartRouter;
