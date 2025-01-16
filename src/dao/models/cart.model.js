import mongoose from "mongoose";
const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
        quantity: { type: Number },
    }],
    timestamp: { type: Date, default: Date.now },
    total: { type: Number, default: 0 },
});

cartSchema.pre(['find', 'findOne'], function() {
    this.populate('products.productId');
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;
