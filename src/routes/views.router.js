import express from 'express';
import ProductManager from '../managers/product-manager.js'; 
const router = express.Router();
const manager = new ProductManager('./src/data/productos.json');

router.get('/realtimeproducts', async (req, res) => {
    try {
        const arrayProductos = await manager.getProducts();
        res.render('realTimeProducts', { products: arrayProductos });
    } catch (error) {
        res.status(500).send('Error del servidor');
    }
});

export default router;
