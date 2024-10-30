import express from "express";
import productModel from "../models/product.model.js";

const prodRouter = express.Router();


prodRouter.get("/", async (req, res) => {
    try {
        
        const { limit = 10, page = 1, sort, query } = req.query;
        
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true
        };
        
        
        let filtro = {};
        if (query!=="stock") {
            filtro = { category: query };
        } else if (query==="stock"){
            filtro = { stock: { $gt: 0 } };
        }
        
        
        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }
        
        const resultado = await productModel.paginate(filtro, options);
        
        res.json({
            status: 'success',
            payload: resultado.docs,
            totalPages: resultado.totalPages,
            prevPage: resultado.prevPage,
            nextPage: resultado.nextPage,
            page: resultado.page,
            hasPrevPage: resultado.hasPrevPage,
            hasNextPage: resultado.hasNextPage,
            prevLink: resultado.hasPrevPage ? `/api/products?page=${resultado.prevPage}&limit=${limit}` : null,
            nextLink: resultado.hasNextPage ? `/api/products?page=${resultado.nextPage}&limit=${limit}` : null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: "Error interno del servidor"
        });
    }
});



prodRouter.get("/home", async (req, res) => {
    try {
        const arrayProductos = await productModel.find().lean();
        console.log("Productos encontrados:", arrayProductos);
        res.render("home", { products: arrayProductos }); 
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error del servidor");
    }
});


prodRouter.get("/:pid", async (req, res) => {
    let id = req.params.pid;

    try {
        const productoBuscado = await productModel.findById(id);

        if (!productoBuscado) {
            res.status(404).send("Producto no encontrado");
        } else {
            res.send(productoBuscado);
        }
    } catch (error) {
        res.status(500).send("Error del servidor");
    }
});


prodRouter.post("/", async (req, res) => {
    const nuevoProducto = req.body;

    try {
        await productModel.create(nuevoProducto);
        res.status(201).send("Producto agregado exitosamente");
    } catch (error) {
        res.status(500).send("Error del servidor");
    }
});


prodRouter.put("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    const productChanges = req.body;

    try {
        await productModel.findByIdAndUpdate(productId, productChanges);
        res.status(201).send("Producto actualizado");
    } catch (error) {
        res.status(500).send("Producto no actualizado");
    }
});


prodRouter.delete("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        await productModel.findByIdAndDelete(productId);
        res.status(201).send("Producto eliminado");
    } catch (error) {
        res.status(500).send("Producto no eliminado");
    }
});

prodRouter.get('/product/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productModel.findById(productId).lean();
        
        if (!product) {
            return res.status(404).render('error', { 
                message: 'Producto no encontrado' 
            });
        }

        res.render('productDetails', { product });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).render('error', { 
            message: 'Error al cargar los detalles del producto' 
        });
    }
});

export default prodRouter;
