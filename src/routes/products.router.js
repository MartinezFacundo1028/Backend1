import express from "express";
import ProductManager from "../dao/managers/product-manager-db.js"; // Importar el ProductManager

const prodRouter = express.Router();
const productManager = new ProductManager();

// Obtener productos con paginación, filtrado y ordenamiento (GET /api/products)
prodRouter.get("/", async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query; // Obtener parámetros de consulta

    try {
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query
        };

        const resultado = await productManager.getProducts(options); // Obtener productos
        res.json({
            status: 'success',
            payload: resultado.docs,
            totalPages: resultado.totalPages,
            prevPage: resultado.prevPage,
            nextPage: resultado.nextPage,
            page: resultado.page,
            hasPrevPage: resultado.hasPrevPage,
            hasNextPage: resultado.hasNextPage,
        });
    } catch (error) {
        console.error("Error al obtener productos", error);
        res.status(500).json({
            status: 'error',
            error: "Error interno del servidor"
        });
    }
});

// Obtener un producto por ID (GET /api/products/:pid)
prodRouter.get("/:pid", async (req, res) => {
    const productId = req.params.pid;

    try {
        const producto = await productManager.getProductById(productId); // Obtener producto por ID
        if (!producto) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: producto }); // Devolver el producto encontrado
    } catch (error) {
        console.error("Error al obtener el producto", error);
        res.status(500).json({ status: 'error', error: "Error interno del servidor" });
    }
});

// Obtener productos para la página principal (GET /home)
prodRouter.get("/home", async (req, res) => {
    try {
        const arrayProductos = await productManager.getProducts({});
        res.render("home", { products: arrayProductos.docs });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error del servidor");
    }
});

// Crear un nuevo producto (POST /)
prodRouter.post("/", async (req, res) => {
    const nuevoProducto = req.body;

    try {
        await productManager.addProduct(nuevoProducto);
        res.status(201).send("Producto agregado exitosamente");
    } catch (error) {
        res.status(500).send("Error al agregar el producto");
    }
});

// Actualizar un producto por ID (PUT /:pid)
prodRouter.put("/:pid", async (req, res) => {
    const productId = req.params.pid;
    const productChanges = req.body;

    try {
        const productoActualizado = await productManager.updateProduct(productId, productChanges);

        if (!productoActualizado) {
            return res.status(404).send("Producto no encontrado para actualizar");
        }

        res.status(200).send("Producto actualizado");
    } catch (error) {
        res.status(500).send("Error al actualizar el producto");
    }
});

// Eliminar un producto por ID (DELETE /:pid)
prodRouter.delete("/:pid", async (req, res) => {
    const productId = req.params.pid;

    try {
        await productManager.deleteProduct(productId);
        res.status(200).send("Producto eliminado");
    } catch (error) {
        res.status(500).send("Error al eliminar el producto");
    }
});

// Detalles del producto (GET /product/:pid)
prodRouter.get('/product/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);

        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado' });
        }

        res.render('productDetails', { product });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).render('error', { message: 'Error al cargar los detalles del producto' });
    }
});

export default prodRouter;
