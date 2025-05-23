import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    category: String,
    status: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 0
    },
    thumbnails: {
        type: [String],
        default: []
    }
});

export const Product = mongoose.model('Product', productSchema);
