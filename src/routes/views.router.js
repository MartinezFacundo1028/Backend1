import express from 'express';
import productModel from '../models/product.model.js';
const router = express.Router();

router.get('/realtimeproducts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2; 
        
        const options = {
            page: page,
            limit: limit,
            lean: true
        };

        const result = await productModel.paginate({}, options);
        
        res.render('realTimeProducts', { 
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            currentPage: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/realtimeproducts?page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `/realtimeproducts?page=${result.nextPage}` : null
        });
    } catch (error) {
        res.status(500).send('Error del servidor');
    }
});

export default router;
