import express from "express";
import ProductManager from "../managers/product-manager.js";

const prodRouter = express.Router();
const manager = new ProductManager("./src/data/productos.json");

// 1) La ruta raíz GET / deberá listar todos los productos de la base. (Incluyendo la limitación ?limit del desafío anterior)
prodRouter.get("/", async (req, res) => {
    let limit = req.query.limit;
    try {
        const arrayProductos = await manager.getProducts();

        if (limit) {
            res.send(arrayProductos.slice(0, limit));
        } else {
            res.send(arrayProductos);
        }
    } catch (error) {
        res.status(500).send("Error del servidor");
    }
});

//  Renderiza los productos usando handlebars en ña ruta /api/products/home

prodRouter.get("/home", async (req, res) => {
    try {
        const arrayProductos = await manager.getProducts();
        res.render("home", { products: arrayProductos }); 
    } catch (error) {
        res.status(500).send("Error del servidor");
    }
});

// 2) La ruta GET /:pid deberá traer sólo el producto con el id proporcionado
prodRouter.get("/:pid", async (req, res) => {
    let id = req.params.pid;

    try {
        const productoBuscado = await manager.getProductById(parseInt(id));

        if (!productoBuscado) {
            res.status(404).send("Producto no encontrado");
        } else {
            res.send(productoBuscado);
        }
    } catch (error) {
        res.status(500).send("Error del servidor");
    }
});

// 3) Agregar un nuevo producto
prodRouter.post("/", async (req, res) => {
    const nuevoProducto = req.body;

    try {
        await manager.addProduct(nuevoProducto);
        res.status(201).send("Producto agregado exitosamente");
    } catch (error) {
        res.status(500).send("Error del servidor");
    }
});

// 4) La ruta PUT /:pid deberá tomar un producto y actualizarlo por los campos enviados desde body.
prodRouter.put("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    const productChanges = req.body;

    try {
        await manager.updateProduct(productId, productChanges);
        res.status(201).send("Producto actualizado");
    } catch (error) {
        res.status(500).send("Producto no actualizado");
    }
});

// 5) La ruta DELETE /:pid deberá eliminar el producto con el pid indicado.
prodRouter.delete("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        await manager.deleteProduct(productId);
        res.status(201).send("Producto eliminado");
    } catch (error) {
        res.status(500).send("Producto no eliminado");
    }
});

export default prodRouter;
